export default class Geo {

  static get earthRadiusMeters () {
    return 6372.8 * 1000
  }

  static getDistance (start, end) {
    var latDelta = this.toRad(end.lat - start.lat)
    var lonDelta = this.toRad(end.lon - start.lon)
    var lat1Rad = this.toRad(start.lat)
    var lat2Rad = this.toRad(end.lat)
    var a = Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
      Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2) *
      Math.cos(lat1Rad) * Math.cos(lat2Rad)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return this.earthRadiusMeters * c
  }

  static toRad (n) {
    return n * Math.PI / 180
  }

  static metersToFeet (m) {
    return m * 3.28084
  }

  static metersToKm (m) {
    return m / 1000
  }

  static metersToMiles (m) {
    return m / 1609.34
  }

  static metersPerSecondToMilesPerHour (ms) {
    return ms * 2.2369362921
  }

  static displayableDuration (milliseconds) {
    var totalSeconds = Math.trunc(milliseconds / 1000)
    var totalMinutes = Math.trunc(totalSeconds / 60)
    var totalHours = Math.trunc(totalMinutes / 60)

    var display = ''
    if (totalHours > 0) {
      display = totalHours + ':'
    }

    totalMinutes -= Math.trunc(totalHours * 60)
    if (totalHours === 0 || totalMinutes >= 10) {
      display += totalMinutes + ':'
    } else {
      display += '0' + totalMinutes + ':'
    }

    totalSeconds -= (totalHours * 60 * 60) + (totalMinutes * 60)
    if (totalSeconds >= 10) {
      display += totalSeconds
    } else {
      display += '0' + totalSeconds
    }

    return display
  }
}
