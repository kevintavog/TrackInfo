import Vue from 'vue'
import Vuex from 'vuex'

import sprintf from 'sprintf-js'
import Track from './Track'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    trackList: [],
    trackErrors: []
  },

  mutations: {
    addFiles (state, fileList) {
      for (var file of fileList) {
        var existingIndex = getNameIndex(state.trackList, file.name)

        if (existingIndex < 0) {
          loadFile(state.trackList, state.trackErrors, file)
        } else {
          state.trackErrors.push(sprintf.sprintf('Track already exists: %s at %d', file.name, existingIndex))
        }
      }
    },

    removeTrack (state, track) {
      var index = state.trackList.indexOf(track)
      if (index >= 0) {
        state.trackList.splice(index, 1)
      }
    },

    removeError (state, error) {
      var index = state.trackErrors.indexOf(error)
      if (index >= 0) {
        state.trackErrors.splice(index, 1)
      }
    }

  }
})

function loadFile (list, errors, file) {
  var reader = new FileReader()
  reader.onloadend = (function (file) {
    return function () {
      var track = new Track()
      track.createTrack(file.name, errors, reader.result)
      list.push(track)
    }
  })(file)

  reader.readAsText(file)
}

function getNameIndex (list, name) {
  for (var i = 0; i < list.length; i++) {
    if (list[i].info.name === name) {
      return i
    }
  }
  return -1
}
