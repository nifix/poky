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
  ws.notify.topicUpdate(pokyStore.roomId, pokyStore.uuid, pokyStore.topic);
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
<div id="topic-main-container">
  <Toast position="bottom-center" />
  
  <h1>User story</h1>
  <div id="message-main-container">
    <Message 
        id="topic" 
        severity="secondary" 
        @click="openDialog">{{ pokyStore.topic }}
    </Message>
    
    <div class="message-extra-button-container first" @click="copyTopic">
      <i class="pi pi-external-link" title="Open link in a new window"></i>
    </div>
    
    <Divider 
        layout="vertical" 
        class="message-extra-button-divider" />
    
    <div class="message-extra-button-container" @click="openExternal">
      <i class="pi pi-copy" title="Copy link"></i>
    </div>
  </div>

  <div id="topic-dialog-container" class="card">
    <Dialog v-model:visible="dialogVisibility" modal header="Set topic" @show="onOpen" :style="{ width: '35rem' }">
      <div class="topic-input-container">
        <InputText id="topic" v-model="temporaryTopic" class="flex-auto" autocomplete="off" />
      </div>
      <div class="topic-buttons-container">
        <Button type="button" label="Cancel" @click="closeDialog" severity="secondary"></Button>
        <Button type="button" label="Set topic" @click="onValidate"></Button>
      </div>
    </Dialog>
  </div>
</div>
</template>

<style scoped>
#topic-main-container {
  margin: 3em 0;
}

#topic-dialog-container {
  display: flex;
  justify-content: center;
}

.topic-input-container {
  display: flex; 
  flex-direction: column; 
  margin: 1em 0; 
  row-gap: 1em;
}

.topic-buttons-container {
  display: flex; 
  justify-content: end; 
  column-gap: 1em;
}

#message-main-container {
  display: flex; 
  align-items: center; 
  column-gap: 10px;
}

#topic {
  width: 100%; 
  overflow: hidden; 
  white-space: nowrap; 
  text-overflow: ellipsis;
}

.message-extra-button-container {
  cursor: pointer; 
  display: flex; 
  justify-content: center;
}

.message-extra-button-container.first {
  margin-left: 0.5em;
}

.message-extra-button-divider {
  margin: 0 0.5em 0 0.4em;
}
</style>