<template>
    <div class='trackMap' id='map'>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import sprintf from 'sprintf-js'
import Leaflet from 'leaflet'
import Geo from '../models/geo'

export default {
  name: 'trackMap',
  data () {
    return {
      map: null,
      mapLayersControl: null,
      startIcon: null,
      endIcon: null,
      pathPopup: new Leaflet.Popup()
    }
  },

  computed: {
    ...mapState({
      trackList: state => state.trackList,
      trackErrors: state => state.trackErrors
    })
  },

  watch: {
    trackList () {
      if (this.trackList.length > 0) {
        var gpx = this.trackList[this.trackList.length - 1].info
        var bounds = gpx.bounds
        this.map.fitBounds([[bounds.minLat, bounds.minLon], [bounds.maxLat, bounds.maxLon]])
        this.addGpx(gpx)
      }
    }
  },

  mounted: function () {
    var newMap = Leaflet.map('map', {
      center: [47.62060841124417, -122.3492968082428],
      zoom: 10,
      minZoom: 3,
      zoomControl: false
    })

    Leaflet.control.zoom({ position: 'topright' }).addTo(newMap)

    Leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(newMap)

    Leaflet.control.scale({ position: 'bottomright' }).addTo(newMap)

    this.map = newMap

    this.startIcon = new Leaflet.Icon({
      iconUrl: 'static/run-start.png',
      iconSize: [33, 50],
      iconAnchor: [16, 44]
    })
    this.endIcon = new Leaflet.Icon({
      iconUrl: 'static/run-end.png',
      iconSize: [33, 50],
      iconAnchor: [16, 44]
    })
  },

  methods: {
    addGpx: function (gpx) {
      var trackLayers = []

      gpx.tracks.forEach(t => {
        var trackLines = []
        t.segments.forEach(s => {
          s.runs.forEach(r => {
            if (r.points.length > 1) {
              var firstPoint = r.points[0]
              Leaflet.marker([firstPoint.lat, firstPoint.lon], {icon: this.startIcon}).addTo(this.map)
                .on('click', e => {
                  this.firstPointPopup(firstPoint)
                })

              var lastPoint = r.points.slice(-1)[0]
              Leaflet.marker([lastPoint.lat, lastPoint.lon], {icon: this.endIcon}).addTo(this.map)
                .on('click', e => {
                  this.lastPointPopup(lastPoint, r)
                })
            }

            var latLngList = []
            r.points.forEach(p => {
              var ll = new Leaflet.LatLng(p.lat, p.lon)
              ll.meta = { point: p }
              latLngList.push(ll)
            })

            var line = new Leaflet.Polyline(
              latLngList,
              { color: 'red', weight: 7, clickable: true, lineCap: 'square', lineJoin: 'miter' })
            line.on('click', e => {
              this.midPointPopup(s, r, e.latlng)
            })
            trackLines.push(line)
          })
        })

        var trackGroup = new Leaflet.FeatureGroup(trackLines)
        trackGroup.addTo(this.map)
        trackLayers.push(trackGroup)
      })

      var trackNumber = 1
      trackLayers.forEach(tl => {
        var name = gpx.name + ' - ' + trackNumber
        this.addToMapLayersControl(tl, name)
        trackNumber += 1
      })
    },

    addToMapLayersControl: function (layer, name) {
      if (this.mapLayersControl == null) {
        var overlayLayer = {}
        overlayLayer[name] = layer
        this.mapLayersControl = Leaflet.control.layers(
          null, overlayLayer, { position: 'topright', collapsed: false }).addTo(this.map)
      } else {
        this.mapLayersControl.addOverlay(layer, name)
      }
    },

    firstPointPopup: function (point) {
      this.pathPopup.setLatLng(new Leaflet.LatLng(point.lat, point.lon))
      this.pathPopup.setContent(
        sprintf.sprintf(
          'Start time: %s, %s<br>Elevation: %i feet',
          point.timestamp.toDateString(),
          point.timestamp.toLocaleTimeString(),
          Geo.metersToFeet(point.elevation)))
      this.map.openPopup(this.pathPopup)
    },

    lastPointPopup: function (point, run) {
      this.pathPopup.setLatLng(new Leaflet.LatLng(point.lat, point.lon))
      this.pathPopup.setContent(
        sprintf.sprintf(
          'Track duration: %s <br>Track distance: %f miles <br>Elevation: %i feet <br>End time: %s, %s',
            Geo.displayableDuration(run.duration * 1000),
            Geo.metersToMiles(run.distance).toFixed(3),
            Geo.metersToFeet(point.elevation),
            point.timestamp.toDateString(),
            point.timestamp.toLocaleTimeString()))
      this.map.openPopup(this.pathPopup)
    },

    midPointPopup: function (segment, run, latlng) {
      var nearest = this.findNearestPoint(run, latlng.lat, latlng.lng)
      if (nearest.point) {
        // The total time & distance to this point includes the prior runs
        for (var i = 0; i < segment.runs.length; ++i) {
          var r = segment.runs[i]
          if (r === run) {
            break
          }
          nearest.distance += r.distance
          nearest.duration += r.duration
        }
        this.pathPopup.setLatLng(new Leaflet.LatLng(nearest.point.lat, nearest.point.lon))
        this.pathPopup.setContent(
            sprintf.sprintf(
                'Distance: %f miles <br>Duration: %s <br>Speed: %f mph <br>Elevation: %i feet <br>Time: %s, %s',
                Geo.metersToMiles(nearest.distance).toFixed(2),
                Geo.displayableDuration(nearest.duration * 1000),
                Geo.metersPerSecondToMilesPerHour(nearest.point.speed).toFixed(2),
                Geo.metersToFeet(nearest.point.elevation),
                nearest.point.timestamp.toDateString(),
                nearest.point.timestamp.toLocaleTimeString()))
        this.map.openPopup(this.pathPopup)
      }
    },

    findNearestPoint: function (run, lat, lon) {
      var bestDistance
      var nearestPoint
      var distanceFromStart
      var currentDistance = 0
      var firstPoint = run.points[0]

      var desiredPoint = { lat: lat, lon: lon }

      run.points.forEach(pt => {
        currentDistance += pt.distance
        var d = Geo.getDistance(pt, desiredPoint)
        if (!bestDistance || d < bestDistance) {
          bestDistance = d
          nearestPoint = pt
          distanceFromStart = currentDistance
        }
      })

      var durationFromStart = (nearestPoint.timestamp - firstPoint.timestamp) / 1000
      return { point: nearestPoint, distance: distanceFromStart, duration: durationFromStart }
    }

  }
}
</script>

<style scoped>
.trackMap {
    border: 1px #888 solid;
    border-left: none;
    border-right: none;
    margin: 0;
    flex: 1 1 auto;
}
</style>
