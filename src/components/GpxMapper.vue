<template>
    <div class="gpxMapper">
      <trackPanel></trackPanel>
      <trackMap></trackMap>
    </div>
</template>

<script>
import trackPanel from './TrackPanel.vue'
import trackMap from './Map.vue'

export default {
  components: { trackMap, trackPanel },
  name: 'gpxMapper',
  data () {
    return {
    }
  }
}
</script>

<style scoped>
.gpxMapper {
  height: 100%; 
  margin: 0; 
  display: flex;
  flex-flow: column;
}
</style>
