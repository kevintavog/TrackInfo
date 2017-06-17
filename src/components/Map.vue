<template>
    <div class="trackMap">
        map
        <div v-for="(track,index) in this.$store.state.tracks.list" class='text_cell o-grid' :class="{'even':index % 2 == 0,'odd':!(index % 2 == 0)}" >
            <div class='o-grid__cell o-grid__cell--width-30'>{{track.info.name}}</div>
            <div class='o-grid__cell o-grid__cell--width-30'>[ button to remove this track ]</div>
        </div>
    </div>
</template>

<script>
export default {
  name: 'trackMap',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<style scoped>
.trackMap { 
    border: 1px #888 solid; 
    border-left: none; 
    border-right: none; 
    width: 100%; 
    height: 100%; 
    margin: 0; 
}
</style>
