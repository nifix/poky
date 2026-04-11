<script setup lang="ts">
import {availableCards} from "~/services/cardsService";
import SingleCard from "~/components/Cards/SingleCard.vue";
const pokyStore = usePokyStore();

const isCardPushed = (cardId: number) => computed(() => pokyStore.getMySelf()?.currentPick == cardId);
</script>

<template>
  <Card>
    <template #title>
      <div class="section-title">
        <i class="pi pi-stop-circle" />
        Vote
      </div>
    </template>
    <template #content>
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
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

#cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.25rem;
}
</style>
