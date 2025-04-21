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
</script>

<template>
  <Toast position="top-right" />
  
  <Message id="header-message" severity="warn">
    <b>User -></b> {{ pokyStore.username }}<br>
    <em id="header-message-uuid">
      {{ pokyStore.uuid }}
    </em>
    <br><br>
    <b>Room ID -></b>
    <span 
        id="header-message-roomid" 
        @click="copyRoomId">{{ pokyStore.roomId }} <i class="pi pi-copy" ></i>
    </span>
    <br><br>
    Welcome !
  </Message>
</template>

<style scoped>
#header-message {
  margin-top: 2em;
}

#header-message-uuid {
  font-size: 0.8em;
}

#header-message-roomid {
  cursor: pointer
}
</style>