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
  const usersWhoVoted = pokyStore.participants.filter(p => ((p.currentPick ?? -1) >= 2));
  let howMany = usersWhoVoted.filter(p => ((p.currentPick ?? -1) >= 2)).length;

  let score = 0;
  let detail = "";

  if (howMany == 0)
    return `¯\\_(ツ)_/¯`;

  for (const userWhoVoted of usersWhoVoted) {
    const currentPick = userWhoVoted.currentPick!;
    const card = cardService.getCardById(currentPick);

    if (card) {
      score += card.value!
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
  <Card>
    <template #title>
      <div class="section-title">
        <i class="pi pi-chart-bar" />
        Results
      </div>
    </template>
    <template #content>
      <div id="actions-button-container">
        <Button :disabled="pokyStore.revealed" @click="revealVotes" icon="pi pi-eye" label="Reveal votes" />
        <Button @click="resetVotes" severity="secondary" outlined icon="pi pi-refresh" label="Reset" />
      </div>

      <Transition name="score-fade" mode="out-in">
        <div v-if="pokyStore.revealed" id="score-revealed">
          <i class="pi pi-star-fill score-icon" />
          <span>{{ calculateCurrentScore() }}</span>
        </div>
        <div v-else id="score-hidden">
          <i class="pi pi-eye-slash" />
          <span>Reveal to see the score</span>
        </div>
      </Transition>
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

#actions-button-container {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

#score-revealed, #score-hidden {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border-radius: var(--p-border-radius);
  font-size: 0.95rem;
}

#score-revealed {
  background: var(--p-primary-50);
  color: var(--p-primary-700);
  font-weight: 600;
  border: 1px solid var(--p-primary-200);
}

#score-hidden {
  background: var(--p-surface-100);
  color: var(--p-text-muted-color);
  border: 1px solid var(--p-surface-200);
}

.score-icon {
  color: var(--p-primary-500);
}

.score-fade-enter-active,
.score-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.score-fade-enter-from,
.score-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
