import xml2js from 'xml2js'
import Geo from './geo'

export default class Track {

  // name
  // bounds { minLat, minLng, maxLat, maxLon }
  // minTimestamp
  // maxTimestamp
  // wayPoints [ { lat, lon, elevation, time, name, desc }]
  // tracks [
  //   { bounds {},
  //     segments [
  //       { runs [
  //          bounds {}
  //          points[] { lat, lon, elevation, timestamp, speed }
  //         ]
  //     ]
  //   }
  // ]

  constructor () {
    this.info = {}
    this.speedAverageMaxPoints = 10
  }

  // Parse the file, updating 'this.info' or adding a message to 'errors'
  createTrack (name, errors, gpxContents) {
    var parser = new xml2js.Parser({explicitArray: false})
    parser.parseString(gpxContents, (error, data) => {
      if (error) {
        error.push('error loading file: %o', error)
        return null
      }

      var bounds = {
        maxLat: Number(data.gpx.bounds.$.maxlat),
        minLat: Number(data.gpx.bounds.$.minlat),
        maxLon: Number(data.gpx.bounds.$.maxlon),
        minLon: Number(data.gpx.bounds.$.minlon)
      }

      var tracks = this.buildTracks(errors, data.gpx.trk)
      var waypoints = this.buildWayPoints(errors, data.gpx.wpt)
      var trackInfo = {
        tracks: tracks,
        waypoints: waypoints,
        bounds: bounds,
        name: name
      }

      if (tracks && tracks.length > 0) {
        trackInfo.startDate = tracks[0].minTimestamp.toDateString() + ', ' + tracks[0].minTimestamp.toLocaleTimeString()

        var distance = 0
        var duration = 0
        var eleGain = 0
        var eleLoss = 0
        tracks.forEach(t => {
          distance += t.distance
          duration += t.duration
          eleGain += t.elevationGain
          eleLoss += t.elevationLoss
        })

        trackInfo.distance = Geo.metersToMiles(distance).toFixed(2) + ' mi'
        trackInfo.duration = Geo.displayableDuration(duration * 1000)
        trackInfo.elevationGain = Geo.metersToFeet(eleGain).toFixed(0)
        trackInfo.elevationLoss = Geo.metersToFeet(eleLoss).toFixed(0)
      }

      this.info = trackInfo
    })
  }

  // Build a track array from the gpx.trk object
  //   name:
  //   description:
  //   bounds
  //   segments []
  //   minTimestamp
  //   maxTimestamp
  // A GPX file contains zero to many tracks
  buildTracks (errors, trk) {
    var tracks = []
    if (!trk) { return tracks }

    if (Array.isArray(trk)) {
      for (var t of trk) {
        tracks.push({
          segments: this.buildSegments(errors, t.trkseg),
          name: t.name,
          description: t.desc
        })
      }
    } else {
      tracks.push({
        segments: this.buildSegments(errors, trk.trkseg),
        name: trk.name,
        description: trk.desc
      })
    }

    for (var tr of tracks) {
      tr.bounds = {}
      tr.distance = 0
      tr.duration = 0
      tr.elevationGain = tr.elevationLoss = 0
      for (var s of tr.segments) {
        tr.minTimestamp = this.minDate(tr.minTimestamp, s.minTimestamp)
        tr.maxTimestamp = this.maxDate(tr.maxTimestamp, s.maxTimestamp)
        tr.bounds.minLat = this.minValue(tr.bounds.minLat, s.bounds.minLat)
        tr.bounds.minLon = this.minValue(tr.bounds.minLon, s.bounds.minLon)
        tr.bounds.maxLat = this.maxValue(tr.bounds.maxLat, s.bounds.maxLat)
        tr.bounds.maxLon = this.maxValue(tr.bounds.maxLon, s.bounds.maxLon)
        tr.distance += s.distance
        tr.duration += s.duration
        tr.elevationGain += s.elevationGain
        tr.elevationLoss += s.elevationLoss
      }
    }

    return tracks
  }

  // Build all the segments from the gpx.trk.trkseg object
  //   bounds
  //   runs []
  //   minTimestamp
  //   maxTimestamp
  // Typically, there is a single segment per track
  buildSegments (errors, trkseg) {
    var segments = []
    if (Array.isArray(trkseg)) {
      for (var s of trkseg) {
        segments.push({ runs: this.buildRuns(errors, s.trkpt) })
      }
    } else {
      segments.push({ runs: this.buildRuns(errors, trkseg.trkpt) })
    }

    // Augment each segment with the 'runs' extents
    for (var se of segments) {
      se.bounds = {}
      se.distance = 0
      se.duration = 0
      se.elevationGain = se.elevationLoss = 0
      for (var r of se.runs) {
        // console.log('From %s to %s; distance: %d, duration: %d, elevation: %d & %d',
        //   r.minTimestamp, r.maxTimestamp, r.distance, r.duration, r.elevationGain, r.elevationLoss)
        se.minTimestamp = this.minDate(se.minTimestamp, r.minTimestamp)
        se.maxTimestamp = this.maxDate(se.maxTimestamp, r.maxTimestamp)
        se.bounds.minLat = this.minValue(se.bounds.minLat, r.bounds.minLat)
        se.bounds.minLon = this.minValue(se.bounds.minLon, r.bounds.minLon)
        se.bounds.maxLat = this.maxValue(se.bounds.maxLat, r.bounds.maxLat)
        se.bounds.maxLon = this.maxValue(se.bounds.maxLon, r.bounds.maxLon)
        se.distance += r.distance
        se.duration += r.duration
        se.elevationGain += r.elevationGain
        se.elevationLoss += r.elevationLoss
      }
    }

    return segments
  }

  // A run is a "continuous" sequence of points, in both time & distance.
  // A segment will have one or more runs
  buildRuns (errors, trkpt) {
    var runs = []

    var minTimestamp, maxTimestamp
    var minLat, minLon, maxLat, maxLon

    var distance = 0
    var elevationGain = 0
    var elevationLoss = 0
    var runStart = 0
    var points = []

    if (trkpt.length > 0) {
      points.push(this.mapPoint(trkpt[0]))
      minTimestamp = maxTimestamp = points[0].timestamp
      minLat = maxLat = points[0].lat
      minLon = maxLon = points[0].lon
    }

    for (var i = 1; i < trkpt.length; ++i) {
      var newPoint = this.mapPoint(trkpt[i])
      newPoint.distance = this.calculateDistance(points[i - 1], newPoint)
      points.push(newPoint)

      var elevationChange = newPoint.elevation - points[i - 1].elevation
      if (elevationChange > 0) {
        elevationGain += elevationChange
      } else {
        elevationLoss += Math.abs(elevationChange)
      }

      var startingPoint = Math.max(0, i - this.speedAverageMaxPoints)
      newPoint.speed = this.getAverageSpeed(points.slice(startingPoint, i))

      var timeDiff = this.calculateSecondsFromPoints(newPoint, points[i - 1])
      if (timeDiff > 1 && newPoint.distance > 100) {
        runs.push({
          points: points.slice(runStart, i),
          distance: distance,
          duration: this.calculateSecondsFromDates(minTimestamp, maxTimestamp),
          elevationGain: elevationGain,
          elevationLoss: elevationLoss,
          bounds: { minLat: minLat, minLon: minLon, maxLat: maxLat, maxLon: maxLon },
          minTimestamp: minTimestamp,
          maxTimestamp: maxTimestamp})

        runStart = i
        newPoint.distance = 0
        distance = 0
        elevationGain = elevationLoss = 0
        minTimestamp = maxTimestamp = newPoint.timestamp
        minLat = maxLat = newPoint.lat
        minLon = maxLon = newPoint.lon
      }

      distance = distance + newPoint.distance
      minTimestamp = this.minDate(minTimestamp, newPoint.timestamp)
      maxTimestamp = this.maxDate(maxTimestamp, newPoint.timestamp)
      minLat = this.minValue(minLat, newPoint.lat)
      minLon = this.minValue(minLon, newPoint.lon)
      maxLat = this.maxValue(maxLat, newPoint.lat)
      maxLon = this.maxValue(maxLon, newPoint.lon)
    }

    runs.push({
      points: points.slice(runStart, trkpt.length + 1),
      distance: distance,
      duration: this.calculateSecondsFromDates(minTimestamp, maxTimestamp),
      elevationGain: elevationGain,
      elevationLoss: elevationLoss,
      bounds: { minLat: minLat, minLon: minLon, maxLat: maxLat, maxLon: maxLon },
      minTimestamp: minTimestamp,
      maxTimestamp: maxTimestamp})

    return runs
  }

  buildWayPoints (errors, wpt) {
    var waypoints = []
    if (!wpt) { return waypoints }

    if (Array.isArray(wpt)) {
      for (var w of wpt) {
        waypoints.push(this.mapWaypoint(w))
      }
    } else {
      waypoints.push(this.mapWaypoint(wpt))
    }

    return waypoints
  }

  minValue (v1, v2) {
    if (!v1) { return v2 }
    if (!v2) { return v1 }
    return Math.min(v1, v2)
  }

  maxValue (v1, v2) {
    if (!v1) { return v2 }
    if (!v2) { return v1 }
    return Math.max(v1, v2)
  }

  minDate (t1, t2) {
    if (!t1 || t2 < t1) { return t2 }
    if (!t2 || t1 < t2) { return t1 }
    return t1
  }

  maxDate (t1, t2) {
    if (!t1 || t2 > t1) { return t2 }
    if (!t2 || t1 > t2) { return t1 }
    return t1
  }

  mapWaypoint (wpt) {
    return {
      lat: Number(wpt.$.lat),
      lon: Number(wpt.$.lon),
      elevation: Number(wpt.ele),
      comment: wpt.cmt,
      description: wpt.desc,
      name: wpt.name,
      timestamp: new Date(wpt.time)
    }
  }

  mapPoint (trkpt) {
    return {
      lat: Number(trkpt.$.lat),
      lon: Number(trkpt.$.lon),
      elevation: Number(trkpt.ele),
      timestamp: new Date(trkpt.time),
      speed: 0,
      distance: 0
    }
  }

  calculateSecondsFromPoints (point1, point2) {
    return this.calculateSecondsFromDates(point1.timestamp, point2.timestamp)
  }

  calculateSecondsFromDates (date1, date2) {
    return Math.abs(date1.getTime() - date2.getTime()) / 1000
  }

  // Return the distance between these two points in meters
  calculateDistance (point1, point2) {
    return Geo.getDistance(point1, point2)
  }

  getAverageSpeed (pts) {
    if (pts.length < 2) {
      return 0
    }

    var distance = 0
    pts.forEach(e => { distance += e.distance })
    var timeSeconds = this.calculateSecondsFromPoints(pts.slice(-1)[0], pts[0])
    // console.log('average - points: %d, distance: %d, seconds: %d', pts.length, distance, timeSeconds)
    return distance / timeSeconds
  }

}
