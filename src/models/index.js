import Vue from 'vue'
import Vuex from 'vuex'
import trackList from './TrackList'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    tracks: trackList.trackList
  }
})
