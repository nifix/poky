<script setup lang="ts">
import {getTextFromCardId} from "~/services/cardsService";
import * as roomService from "~/services/roomService";

const props = defineProps(["text", "isPushed", "id", "disabled", "uuid", "small"])
const { text, id, isPushed, disabled, uuid, small } = props;
defineExpose({ id, isPushed, text, disabled, uuid, small })

const ws = useWebSocket();
const pokyStore = usePokyStore();
const shouldBeSmall = computed(() => !!props.small);

async function onClick(): Promise<void> {
  if (!disabled && (!pokyStore.revealed)) {
    pokyStore.setMyPick(id);
    await ws.notify.userVoted(pokyStore.uuid, pokyStore.roomId, pokyStore.getMySelf()?.currentPick ?? -1);
    await roomService.updateCurrentPick<number>(pokyStore.roomId, pokyStore.uuid, pokyStore.getMySelf()?.currentPick ?? -1);
  }
}

type CardDisplay = { type: 'text'; value: string } | { type: 'icon'; icon: string; colorClass: string };

const cardDisplay = computed<CardDisplay>(() => {
  if (!props.small)
    return { type: 'text', value: getTextFromCardId(id) };

  const participant = pokyStore.participants.find(p => p.uuid === props.uuid);

  if ((participant?.currentPick == null || participant?.currentPick === -1) && !pokyStore.revealed && !pokyStore.votingDisabled)
    return { type: 'icon', icon: 'pi-clock', colorClass: 'icon--pending' };

  if (participant?.currentPick != null && participant?.currentPick >= 0 && !pokyStore.revealed && !pokyStore.votingDisabled)
    return { type: 'icon', icon: 'pi-check', colorClass: 'icon--voted' };

  return { type: 'text', value: getTextFromCardId(participant?.currentPick ?? -1) };
});
</script>

<template>
  <div
      class="playing-card"
      :class="{
        'playing-card--selected': isPushed,
        'playing-card--small': shouldBeSmall,
      }"
      @click="onClick">
    <template v-if="!shouldBeSmall">
      <span class="pip pip--tl">{{ text }}</span>
      <span class="pip pip--br">{{ text }}</span>
      <span class="face-value">{{ (cardDisplay as any).value }}</span>
    </template>
    <span v-else class="face-value">
      <i v-if="cardDisplay.type === 'icon'" :class="['pi', cardDisplay.icon, cardDisplay.colorClass]" />
      <template v-else>{{ cardDisplay.value }}</template>
    </span>
  </div>
</template>

<style scoped>
.playing-card {
  position: relative;
  width: 3.5rem;
  height: 5.25rem;
  background: var(--p-surface-card);
  border: 1.5px solid var(--p-surface-border);
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.07), 0 1px 2px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--p-text-color);
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.18s ease,
              border-color 0.15s,
              background 0.2s;
}

.playing-card:not(.playing-card--selected):not(.playing-card--small):hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.13);
  border-color: var(--p-primary-300);
}

.playing-card.playing-card--selected {
  background: linear-gradient(145deg, var(--p-primary-400) 0%, var(--p-primary-600) 100%);
  border-color: var(--p-primary-500);
  color: #fff;
  box-shadow: 0 6px 22px rgba(234, 88, 12, 0.38), 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-6px) scale(1.04);
}

.face-value {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1;
}

.pip {
  position: absolute;
  font-size: 0.6rem;
  font-weight: 700;
  line-height: 1;
  color: var(--p-text-muted-color);
  transition: color 0.2s;
}

.playing-card.playing-card--selected .pip {
  color: rgba(255, 255, 255, 0.6);
}

.pip--tl {
  top: 0.3rem;
  left: 0.35rem;
}

.pip--br {
  bottom: 0.3rem;
  right: 0.35rem;
  transform: rotate(180deg);
}

/* Small variant — used in UserList */
.playing-card.playing-card--small {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 6px;
  cursor: default;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transform: none !important;
  transition: none;
}

.playing-card.playing-card--small .face-value {
  font-size: 0.78rem;
}

.playing-card.playing-card--small .face-value .pi {
  font-size: 0.9rem;
  line-height: 1;
}

.icon--pending {
  color: var(--p-text-muted-color);
}

.icon--voted {
  color: var(--p-primary-500);
}
</style>