export default class Geo {

  static get earthRadiusMeters () {
    return 6371000
  }

  static getDistance (start, end) {
    var latDelta = (end.lat - start.lat) * Math.PI / 180
    var lonDelta = (end.lon - start.lon) * Math.PI / 180
    var lat1Rad = start.lat * Math.PI / 180
    var lat2Rad = end.lat * Math.PI / 180
    var a = Math.sin(latDelta / 2) * Math.sin(latDelta / 2) + Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return this.earthRadiusMeters * c
  }
}
