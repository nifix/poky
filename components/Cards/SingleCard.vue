<script setup lang="ts">
import {getTextFromCardId} from "~/services/cardsService";
import * as roomService from "~/services/roomService";

const props = defineProps(["text", "isPushed", "id", "disabled", "uuid", "small"])
const { text, id, isPushed, disabled, uuid, small } = props;
defineExpose({ id, isPushed, text, disabled, uuid, small })

const ws = useWebSocket();
const pokyStore = usePokyStore();
const shouldBeSmall = computed(() => !!props.small);

/**
 * Handles the click event when a user interacts with a specific element.
 * The method checks if the action is enabled and proceeds to set the user's selection,
 * notifies the server about the user's vote, and updates the current pick information
 * in the room service.
 *
 * @return {void} This method does not return a value.
 */
async function onClick(): Promise<void> {
  if (!disabled && (!pokyStore.revealed)) {
    pokyStore.setMyPick(id);
    await ws.notify.userVoted(pokyStore.uuid, pokyStore.roomId, pokyStore.getMySelf()?.currentPick ?? -1);
    await roomService.updateCurrentPick<number>(pokyStore.roomId, pokyStore.uuid, pokyStore.getMySelf()?.currentPick ?? -1);
  }
}

/**
 * Determines the appropriate card text based on the application state and properties.
 *
 * @return {string} The text to display on the card, which could be based on the `small` property,
 *                  the participant's current pick, or the application's revealed and voting states.
 */
function findCardText(): string {
  if (!!props.small == false)
    return getTextFromCardId(id);
  
  const uuid = props.uuid;
  const participant = pokyStore.participants.find(p => p.uuid == uuid);
  
  if ((participant?.currentPick == null || participant?.currentPick! == -1) && !pokyStore.revealed && !pokyStore.votingDisabled)
    return "⌛";
  
  if ((participant?.currentPick != null && participant?.currentPick! >= 0) && !!props.small && !pokyStore.revealed && !pokyStore.votingDisabled)
    return "✅";
  
  return getTextFromCardId(participant?.currentPick ?? -1);
}
</script>

<template>
  <Card
      :class="{ pushed: isPushed, small: shouldBeSmall }" 
      class="single-card-container"
      @click="onClick">
    <template #content>
      <p class="m-0">
        {{ findCardText() }}
      </p>
    </template>
  </Card>
</template>

<style scoped>
.single-card-container {
  width: 3.5rem;
  height: 5.25rem;
  font-size: 1.4rem;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.single-card-container:not(.small):hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.pushed {
  --p-card-background: var(--p-primary-500);
  color: var(--p-primary-contrast-color);
}

.single-card-container.small {
  width: 50px;
  height: 50px;
  font-size: 1rem;
  margin: 0;
  cursor: not-allowed;
  transition: none;
}
</style>