<script setup lang="ts">
const pokyStore = usePokyStore();
</script>

<template>
  <div>
    <h1>Logs</h1>
    <ul id="events-list">
      <li v-html="event" v-for="event in pokyStore.events" :key="event"></li>
    </ul>
  </div>
</template>

<style scoped>
#events-list {
  margin: 3em 0 3em 0;
}
</style>