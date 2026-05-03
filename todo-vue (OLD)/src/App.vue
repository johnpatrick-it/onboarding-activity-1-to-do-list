<!--
  APP.VUE: Root component of the entire application

  This is the top-level component. It contains <router-view />
  which is where the current route's component gets rendered.

  SINGLE FILE COMPONENT (SFC) STRUCTURE:
  - <template>: HTML structure
  - <script>: JavaScript logic
  - <style>: CSS styles (can be scoped to this component)
-->

<template>
  <!--
    <router-view /> is a special Vue Router component.
    It's a placeholder where the current route's component renders.
    When URL is /login, LoginView.vue renders here.
    When URL is /, TodoView.vue renders here.
  -->
  <router-view />
</template>

<script>
// The App component doesn't need much - it's just a shell
// All the real logic lives in the route-specific views
export default {
  name: 'App'
}
</script>

<style>
/* Global styles that apply to the whole app can go here */
/* Component-specific styles should go in each .vue file with <style scoped> */
</style>
