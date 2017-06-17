<template>
    <div class="trackInfo">
      <trackPanel></trackPanel>
      <trackMap></trackMap>
    </div>
</template>

<script>
import trackPanel from './TrackPanel.vue'
import trackMap from './Map.vue'

export default {
  components: { trackMap, trackPanel },
  name: 'trackInfo',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<style scoped>
.trackInfo {
  height: 100%; 
  margin: 0; 
  display: flex;
  flex-flow: column;
}
</style>
