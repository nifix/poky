<script setup lang="ts">
import * as roomService from "~/services/roomService";
import * as cardService from "~/services/cardsService";

const ws = useWebSocket();
const pokyStore = usePokyStore();

interface ScoreResult {
  isEmpty: boolean;
  suggestedSP: string | number;
  average: string;
  total: number;
  count: number;
  breakdown: string;
}

const computedScore = computed<ScoreResult>(() => {
  const usersWhoVoted = pokyStore.participants.filter(p => ((p.currentPick ?? -1) >= 2));
  const count = usersWhoVoted.length;

  if (count === 0) {
    return { isEmpty: true, suggestedSP: '—', average: '—', total: 0, count: 0, breakdown: '' };
  }

  let total = 0;
  const values: number[] = [];
  for (const user of usersWhoVoted) {
    const card = cardService.getCardById(user.currentPick!);
    if (card?.value != null) {
      total += card.value;
      values.push(card.value);
    }
  }

  const average = total / count;
  const suggested = cardService.findNextCardByScore(average)?.value ?? '?';

  return {
    isEmpty: false,
    suggestedSP: suggested,
    average: average.toFixed(1),
    total,
    count,
    breakdown: values.join(' + '),
  };
});

async function resetVotes(): Promise<void> {
  await ws.notify.resetVotes(pokyStore.uuid, pokyStore.roomId);
  await nextTick();
  await roomService.setRevealStatus<boolean>(pokyStore.roomId, false);
}

async function revealVotes(): Promise<void> {
  await ws.notify.revealVotes(pokyStore.uuid, pokyStore.roomId, buildScoreString());
  await nextTick();
  await roomService.setRevealStatus<boolean>(pokyStore.roomId, true);
}

function buildScoreString(): string {
  const s = computedScore.value;
  if (s.isEmpty) return `¯\\_(ツ)_/¯`;
  return `${s.breakdown} = ${s.total} / ${s.count} = ${s.average} (${s.suggestedSP} story points)`;
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
          <div v-if="computedScore.isEmpty" class="score-empty">
            <i class="pi pi-face-smile" />
            <span>No votes cast</span>
          </div>
          <template v-else>
            <div class="score-hero">
              <span class="score-big">{{ computedScore.suggestedSP }}</span>
              <span class="score-unit">SP</span>
            </div>
            <div class="score-stats">
              <div class="score-stat">
                <span class="stat-label">Avg</span>
                <span class="stat-value">{{ computedScore.average }}</span>
              </div>
              <div class="score-stat-divider" />
              <div class="score-stat">
                <span class="stat-label">Total</span>
                <span class="stat-value">{{ computedScore.total }}</span>
              </div>
              <div class="score-stat-divider" />
              <div class="score-stat">
                <span class="stat-label">Votes</span>
                <span class="stat-value">{{ computedScore.count }}</span>
              </div>
            </div>
            <div class="score-breakdown">{{ computedScore.breakdown }}</div>
          </template>
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

#score-revealed {
  border-radius: var(--p-border-radius);
  background: linear-gradient(135deg, var(--p-primary-50) 0%, color-mix(in srgb, var(--p-primary-100) 40%, white) 100%);
  border: 1px solid var(--p-primary-200);
  padding: 1.1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.score-hero {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.score-big {
  font-size: 2.6rem;
  font-weight: 800;
  color: var(--p-primary-600);
  line-height: 1;
  letter-spacing: -1px;
}

.score-unit {
  font-size: 1rem;
  font-weight: 700;
  color: var(--p-primary-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.score-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.score-stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--p-primary-400);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--p-primary-700);
}

.score-stat-divider {
  width: 1px;
  height: 2rem;
  background: var(--p-primary-200);
}

.score-breakdown {
  font-size: 0.78rem;
  color: var(--p-primary-500);
  font-weight: 500;
  border-top: 1px solid var(--p-primary-200);
  padding-top: 0.5rem;
  margin-top: 0.1rem;
}

.score-empty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--p-primary-600);
}

#score-hidden {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border-radius: var(--p-border-radius);
  background: var(--p-surface-100);
  color: var(--p-text-muted-color);
  border: 1px solid var(--p-surface-200);
  font-size: 0.95rem;
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
