<script setup lang="ts">
import copy from 'copy-to-clipboard';

const pokyStore = usePokyStore();
const toast = useToast();

/**
 * Copies the current room ID from the store to the clipboard and displays a success notification.
 *
 * @return {void} Does not return a value.
 */
function copyRoomId(): void {
  copy(pokyStore.roomId);
  toast.add({ severity: 'success', summary: 'Success', detail: 'Room ID copied !', life: 2000 });
}

/**
 * Copies the current user ID from the store to the clipboard and displays a success notification.
 *
 * @return {void} Does not return a value.
 */
function copyUserId(): void {
  copy(pokyStore.uuid);
  toast.add({ severity: 'success', summary: 'Success', detail: 'User ID copied !', life: 2000 });
}
</script>

<template>
  <Toast position="top-right" />
  
  <Message id="header-message" severity="warn">
    <div id="header-message-wrapper">
      <div id="header-message-left">
        <b>User -></b> {{ pokyStore.username }}<br>
        <span class="header-message-content-wrapper">
          <em class="header-message-content" @click="copyUserId">
            {{ pokyStore.uuid }} <i class="pi pi-copy" ></i>
          </em>
        </span>
      </div>
      <div id="header-message-right">
        <b>Room ID</b>
        <span class="header-message-content-wrapper" @click="copyRoomId"><br>
          <em class="header-message-content">
            {{ pokyStore.roomId }} <i class="pi pi-copy" ></i>
          </em>
        </span>     
      </div>
    </div>
  </Message>
</template>

<style scoped>
#header-message {
  margin-top: 2em;
}

#header-message-wrapper {
  display: flex; 
  justify-content: space-around; 
  width: 100%
}

:deep(.p-message-text) {
  width: 100%;
}

.header-message-content {
  font-size: 0.8em;
}

.header-message-content-wrapper {
  cursor: pointer
}
</style>