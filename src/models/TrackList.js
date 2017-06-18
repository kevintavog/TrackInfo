import sprintf from 'sprintf-js'
import Track from './Track'

const trackList = {
  state: {
    list: [],
    errors: []
  },

  getters: {
    trackList: state => { return state.list },
    trackErrors: state => { return state.errors }
  },

  mutations: {
    addFiles (state, fileList) {
      for (var file of fileList) {
        var existingIndex = getNameIndex(state.list, file.name)

        if (existingIndex < 0) {
          loadFile(state.list, state.errors, file)
        } else {
          state.errors.push(sprintf.sprintf('Track already exists: %s at %d', file.name, existingIndex))
        }
      }
    }
  }
}

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
    if (list[i].name === name) {
      return i
    }
  }
  return -1
}

export default {
  trackList
}
