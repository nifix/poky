<script setup lang="ts">
import {availableCards} from "~/services/cardsService";
import SingleCard from "~/components/Cards/SingleCard.vue";
const pokyStore = usePokyStore();

const isCardPushed = (cardId: number) => computed(() => pokyStore.getMySelf()?.currentPick == cardId);

const votedCount = computed(() =>
    pokyStore.participants.filter(p => (p.currentPick ?? -1) >= 0).length
);
const totalCount = computed(() => pokyStore.participants.length);
const voteProgress = computed(() =>
    totalCount.value > 0 ? Math.round((votedCount.value / totalCount.value) * 100) : 0
);
</script>

<template>
  <Card>
    <template #title>
      <div class="section-title">
        <i class="pi pi-stop-circle" />
        Vote
        <div class="vote-progress-summary" v-if="totalCount > 0 && !pokyStore.revealed">
          <span class="vote-count">{{ votedCount }}/{{ totalCount }}</span>
          <ProgressBar :value="voteProgress" class="vote-progress-bar" :show-value="false" />
        </div>
      </div>
    </template>
    <template #content>
      <p class="vote-hint">Select your estimate for this story</p>
      <div id="cards-container">
        <SingleCard
            v-for="card in availableCards"
            ref="cardRefs"
            :key="card.id"
            :text="card.text"
            :id="card.id"
            :disabled="false"
            :is-pushed="isCardPushed(card.id)" />
      </div>
    </template>
  </Card>
</template>

<style scoped>
.section-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1rem;
  font-weight: 600;
}

.vote-progress-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  flex-shrink: 0;
}

.vote-count {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}

.vote-progress-bar {
  width: 80px;
  height: 6px !important;
}

:deep(.vote-progress-bar.p-progressbar) {
  height: 6px;
  border-radius: 99px;
}

.vote-hint {
  font-size: 0.82rem;
  color: var(--p-text-muted-color);
  margin: 0 0 0.85rem;
}

#cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding-top: 0.1rem;
}
</style>
