<template>
    <div class="trackPanel">
        <div id="fileInput">
            <input class="c-button--small" type="file" id="files" name="files[]" multiple="true" v-on:change="addLocalFiles($event)" />
        </div>
        <div v-for="(track,index) in this.$store.getters.trackList" class='text_cell o-grid' :class="{'even':index % 2 == 0,'odd':!(index % 2 == 0)}" >
            <div class='o-grid__cell o-grid__cell--width-15'>{{track.info.name}}</div>
            <div class='o-grid__cell o-grid__cell--width-30'>{{track.info.startDate}}</div>
            <div class='o-grid__cell o-grid__cell--width-15'>{{track.info.distance}}</div>
            <div class='o-grid__cell o-grid__cell--width-15'>{{track.info.duration}}</div>
            <div class='o-grid__cell o-grid__cell--width-25'>[ button to remove this track ]</div>
        </div>

        <div v-for="(err,index) in this.$store.getters.trackErrors" class='text_cell o-grid' >
            <div class='o-grid__cell o-grid__cell'>{{err}}</div>
        </div>
    </div>
</template>

<script>

import { mapGetters, mapState } from 'vuex'

export default {
  name: 'trackPanel',

  computed: {
    ...mapState('trackList', 'trackErrors'),
    ...mapGetters([{
      list: 'trackList'
    }, {
      errors: 'trackErrors'
    }])
  },

  data () {
    return {
    }
  },

  methods: {
    addLocalFiles: function (event) {
      console.log('store: %o; this: %o', this.$store, this)
      this.$store.commit('addFiles', event.target.files)
    }
  }
}
</script>

<style scoped>
.trackPanel {
  flex: 0 1 auto;
}

.even {
    color:lightgreen;
}

.odd {
    color:white;
}
</style>
