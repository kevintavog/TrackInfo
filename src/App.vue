<template>
  <div id="app" class="c-text">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: white;
  width: 100%; 
  height: 100%; 
  margin: 0; 
}
</style>
