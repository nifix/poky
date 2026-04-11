<script setup lang="ts">
const pokyStore = usePokyStore();
</script>

<template>
  <Card>
    <template #title>
      <div class="section-title">
        <i class="pi pi-list" />
        Activity
      </div>
    </template>
    <template #content>
      <ScrollPanel style="height: 220px">
        <div v-if="pokyStore.events.length === 0" class="events-empty">
          <i class="pi pi-inbox" />
          <span>No activity yet</span>
        </div>
        <ul v-else id="events-list">
          <li v-for="event in pokyStore.events" :key="event" v-html="event" class="event-item" />
        </ul>
      </ScrollPanel>
    </template>
  </Card>
</template>

<style scoped>
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

#events-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-item {
  font-size: 0.82rem;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  background: var(--p-surface-100);
  line-height: 1.4;
  color: var(--p-text-muted-color);
}

.events-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 180px;
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
}
</style>
