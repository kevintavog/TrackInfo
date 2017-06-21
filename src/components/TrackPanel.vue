<template>
    <div class="trackPanel">
        <div id="fileInput">
            <input class="c-button--small" type="file" id="files" name="files[]" multiple="true" v-on:change="addLocalFiles($event)" />
        </div>
        <div v-for="(track,index) in this.trackList" class='text_cell o-grid' :class="{'even':index % 2 == 0,'odd':!(index % 2 == 0)}" >
            <div class='o-grid__cell o-grid__cell--width-15'>{{track.info.name}}</div>
            <div class='o-grid__cell o-grid__cell--width-21'>{{track.info.startDate}}</div>
            <div class='o-grid__cell o-grid__cell--width-10'>{{track.info.distance}}</div>
            <div class='o-grid__cell o-grid__cell--width-10'>{{track.info.duration}}</div>
            <div class='o-grid__cell o-grid__cell--width-12'>+{{track.info.elevationGain}} ft / -{{track.info.elevationLoss}} ft</div>
            <!--<div class='o-grid__cell o-grid__cell--width-5'><button class="c-button c-button--close c-button--error u-large" v-on:click="removeTrack(track)">×</button> </div>-->
        </div>

        <div v-for="(err,index) in this.trackErrors" class='text_cell o-grid' >
            <div class='o-grid__cell o-grid__cell'>
                <div class="c-alert c-alert--error smallAlert">
                    {{err}}
                    <button class="c-button c-button--close c-button--error u-large" v-on:click="removeError(err)">×</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import { mapState } from 'vuex'

export default {
  name: 'trackPanel',

  computed: {
    ...mapState({
      trackList: state => state.trackList,
      trackErrors: state => state.trackErrors
    })
  },

  data () {
    return {
    }
  },

  methods: {
    addLocalFiles: function (event) {
      this.$store.commit('addFiles', event.target.files)
    },

    removeTrack: function (track) {
      this.$store.commit('removeTrack', track)
    },

    removeError: function (error) {
      console.log('remove error: "%s"', error)
      this.$store.commit('removeError', error)
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

.smallAlert {
  margin-bottom: 5px;
  padding: 0.3em;
}
</style>
