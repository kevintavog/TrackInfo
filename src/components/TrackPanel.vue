<template>
    <div class="trackPanel">
        <div id="fileInput">
            <input class="c-button--small" type="file" id="files" name="files[]" multiple="true" v-on:change="addLocalFiles($event)" />
        </div>
        <div v-for="(track,index) in this.$store.state.tracks.list" class='text_cell o-grid' :class="{'even':index % 2 == 0,'odd':!(index % 2 == 0)}" >
            <div class='o-grid__cell o-grid__cell--width-30'>{{track.info.name}}</div>
            <div class='o-grid__cell o-grid__cell--width-30'>[ button to remove this track ]</div>
        </div>

        <div v-for="(err,index) in this.$store.state.tracks.errors" class='text_cell o-grid' >
            <div class='o-grid__cell o-grid__cell'>{{err}}</div>
        </div>
    </div>
</template>

<script>

export default {
  name: 'trackPanel',

  data () {
    return {
    }
  },

  methods: {
    addLocalFiles: function (event) {
      this.$store.commit('addFiles', event.target.files)
    }
  }
}
</script>

<style scoped>
.text_cell {
}

.even {
    color:lightgreen;
}

.odd {
    color:white;
}
</style>
