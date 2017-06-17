import Vue from 'vue'
import Router from 'vue-router'
import TrackInfo from '@/components/TrackInfo'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'TrackInfo',
      component: TrackInfo
    }
  ]
})
