<script setup lang="ts">
const pokyStore = usePokyStore();
</script>

<template>
  <Card>
    <template #title>
      <div class="section-title">
        <i class="pi pi-list" />
        Activity
        <Badge v-if="pokyStore.events.length > 0" :value="pokyStore.events.length" severity="secondary" class="ml-auto" />
      </div>
    </template>
    <template #content>
      <ScrollPanel style="height: 220px">
        <div v-if="pokyStore.events.length === 0" class="events-empty">
          <i class="pi pi-inbox" />
          <span>No activity yet</span>
        </div>
        <ul v-else id="events-list">
          <li v-for="(event, index) in [...pokyStore.events].reverse()" :key="index" class="event-item">
            <span class="event-dot" />
            <span class="event-text" v-html="event" />
          </li>
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
  width: 100%;
}

#events-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.event-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.45rem 0.25rem;
  border-bottom: 1px solid var(--p-surface-100);
  position: relative;
}

.event-item:last-child {
  border-bottom: none;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--p-primary-400);
  flex-shrink: 0;
  margin-top: 0.38rem;
}

.event-text {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  line-height: 1.45;
  flex: 1;
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
