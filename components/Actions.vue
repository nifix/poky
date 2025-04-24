<script setup lang="ts">
import * as roomService from "~/services/roomService";
import * as cardService from "~/services/cardsService";

const ws = useWebSocket();
const pokyStore = usePokyStore();

/**
 * Resets the votes for the current room.
 */
async function resetVotes(): Promise<void> {
  await ws.notify.resetVotes(pokyStore.uuid, pokyStore.roomId);
  await nextTick();
  await roomService.setRevealStatus<boolean>(pokyStore.roomId, false);
}

/**
 * Reveals the votes for the current room.
 */
async function revealVotes(): Promise<void> {
  await ws.notify.revealVotes(pokyStore.uuid, pokyStore.roomId, calculateCurrentScore());
  await nextTick();
  await roomService.setRevealStatus<boolean>(pokyStore.roomId, true);
}

/**
 * Calculates the current score for the current room.
 */
function calculateCurrentScore() : string {
  const usersWhoVoted = pokyStore.participants.filter(p => (p.current_pick ?? -1) > 0);
  let howMany = usersWhoVoted.length;

  let score = 0;
  let detail = "";

  for (const userWhoVoted of usersWhoVoted) {
    const currentPick = userWhoVoted.current_pick!;
    const card = cardService.getCardById(currentPick);

    if (card) {
      score += card.value!;
      detail += `${card.value}+`
    }
  }

  if (howMany == 0)
    howMany = 1;

  const average = (score / (howMany == 0 ? 1 : howMany));
  return `${detail.slice(0, -1)} = ${score} / ${howMany} = ${average.toFixed(2)} (${cardService.findNextCardByScore(average)?.value} story points)`;
}
</script>

<template>
  <div id="actions-button-container">
    <Button :disabled="pokyStore.revealed" @click="revealVotes" severity="contrast">
      Reveal votes
    </Button>
    
    <Button @click="resetVotes" severity="contrast">
      Reset
    </Button>
  </div>

  <div id="actions-score-container">
    <h3>
      <span v-if="pokyStore.revealed">{{ calculateCurrentScore() }}</span>
      <span v-else>Reveal to view the score</span>
    </h3>
  </div>
</template>

<style scoped>
#actions-score-container {
  display: flex; 
  justify-content: center; 
  margin-top: 2rem;
}

#actions-button-container {
  display: flex; 
  flex-direction: row; 
  column-gap: 1rem; 
  margin-top: 1rem; 
  justify-content: center;
}

#actions-button-container .p-button {
  width: 10rem;
}
</style>