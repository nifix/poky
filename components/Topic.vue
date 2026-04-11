<script setup lang="ts">
import * as roomService from "~/services/roomService";
import copy from 'copy-to-clipboard';

const pokyStore = usePokyStore();
const ws = useWebSocket();
const toast = useToast();

const dialogVisibility = ref(false);
const temporaryTopic = ref('')

/**
 * This method is triggered when an open action occurs.
 * It assigns the value of `pokyStore.topic` to `temporaryTopic.value`.
 *
 * @return {void} A promise that resolves when the operation is complete.
 */
function onOpen(): void {
  temporaryTopic.value = pokyStore.topic;
}

/**
 * Closes the dialog by setting its visibility state to false.
 *
 * @return {void} This method does not return a value.
 */
function closeDialog(): void {
  dialogVisibility.value = false;
}

/**
 * Opens a dialog by setting the visibility flag to true.
 *
 * @return {void} Does not return a value.
 */
function openDialog(): void {
  dialogVisibility.value = true;
}

/**
 * Handles the validation process by updating the topic in the pokyStore object,
 * closing the dialog, and notifying relevant services about the topic update.
 *
 * @return {Promise<void>} A promise that resolves when the topic has been successfully set and the update notification has been sent.
 */
async function onValidate(): Promise<void> {
  pokyStore.topic = temporaryTopic.value;
  closeDialog();
  
  await roomService.setTopic<boolean>(pokyStore.roomId, pokyStore.uuid, pokyStore.topic);
  await ws.notify.topicUpdate(pokyStore.roomId, pokyStore.uuid, pokyStore.topic);
}

/**
 * Copies the current topic from the store to the clipboard.
 * Displays a success message upon successful copy.
 *
 * @return {void} This method does not return any value.
 */
function copyTopic(): void {
  copy(pokyStore.topic);
  toast.add({ severity: 'success', summary: 'Success', detail: 'Topic copied to clipboard !', life: 2000 });
}

/**
 * Opens an external link in a new browser window or tab.
 *
 * This function navigates to a specified external URL and opens it in a new window or tab.
 * It also displays a success message to confirm that the link was successfully opened.
 *
 * @return {Promise<void>} A promise that resolves when the external link has been opened and the success notification displayed.
 */
async function openExternal(): Promise<void> {
  await navigateTo(pokyStore.topic, {
    external: true,
    open: {
      target: '_blank',
    }
  })
  
  toast.add({ severity: 'success', summary: 'Success', detail: 'Opened link in a new window !', life: 2000 });
}
</script>

<template>
<Card>
  <template #title>
    <div class="section-title">
      <i class="pi pi-file" />
      User Story
    </div>
  </template>
  <template #content>
    <div id="topic-content">
      <div id="topic-text" @click="openDialog" v-tooltip.top="'Click to edit'">
        <span v-if="pokyStore.topic" class="topic-value">{{ pokyStore.topic }}</span>
        <span v-else class="topic-placeholder">No topic set — click to add one</span>
        <i class="pi pi-pencil topic-edit-icon" />
      </div>
      <div id="topic-actions">
        <Button
            text
            rounded
            severity="secondary"
            icon="pi pi-external-link"
            v-tooltip.top="'Open link in new tab'"
            @click="openExternal"
            size="small" />
        <Button
            text
            rounded
            severity="secondary"
            icon="pi pi-copy"
            v-tooltip.top="'Copy topic'"
            @click="copyTopic"
            size="small" />
      </div>
    </div>

    <Dialog v-model:visible="dialogVisibility" modal header="Set topic" @show="onOpen" :style="{ width: '35rem' }">
      <div class="topic-input-container">
        <InputText id="topic" v-model="temporaryTopic" class="flex-auto" autocomplete="off" fluid />
      </div>
      <div class="topic-buttons-container">
        <Button type="button" label="Cancel" @click="closeDialog" severity="secondary" />
        <Button type="button" label="Set topic" @click="onValidate" />
      </div>
    </Dialog>
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

#topic-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

#topic-text {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.85rem;
  border-radius: var(--p-border-radius);
  background: var(--p-surface-100);
  border: 1px solid var(--p-surface-200);
  cursor: pointer;
  min-height: 2.5rem;
  transition: background 0.15s;
  overflow: hidden;
}

#topic-text:hover {
  background: var(--p-surface-200);
}

.topic-value {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.95rem;
}

.topic-placeholder {
  flex: 1;
  color: var(--p-text-muted-color);
  font-style: italic;
  font-size: 0.9rem;
}

.topic-edit-icon {
  color: var(--p-text-muted-color);
  font-size: 0.8rem;
  flex-shrink: 0;
}

#topic-actions {
  display: flex;
  gap: 0.25rem;
}

.topic-input-container {
  display: flex;
  flex-direction: column;
  margin: 1em 0;
}

.topic-buttons-container {
  display: flex;
  justify-content: end;
  column-gap: 1em;
}
</style>