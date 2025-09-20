<script setup lang="ts">
import {availableCards} from "~/services/cardsService";
import SingleCard from "~/components/Cards/SingleCard.vue";
const pokyStore = usePokyStore();

const isCardPushed = (cardId: number) => computed(() => pokyStore.getMySelf()?.currentPick == cardId);
</script>

<template>
  <h1>Cards</h1>
  <div>
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
  </div>
</template>

<style scoped>
#cards-container {
  display: flex; 
  flex-wrap: wrap; 
  justify-content: center
}
</style>