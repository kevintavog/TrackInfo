import Vue from 'vue'
import Vuex from 'vuex'
import TrackList from './TrackList'

Vue.use(Vuex)

export default new Vuex.Store({
//   getters: {
//     tracks: TrackList.getters
//   },
  modules: {
    tracks: TrackList.trackList
  }
})
