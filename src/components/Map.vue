<template>
    <div class='trackMap' id='map'>
    </div>
</template>

<script>
import Leaflet from 'leaflet'

export default {
  name: 'trackMap',
  data () {
    return {
      map: null
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
