<template>
    <section class="trackInfo">
      <header>
        <trackPanel></trackPanel>
      </header>
      <article>
        <trackMap></trackMap>
      </article>
    </section>
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
  width: 100%; 
  height: 100%; 
  margin: 0; 
}
.trackInfo article {
  height: 90%;
}
</style>
