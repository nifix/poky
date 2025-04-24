<script setup lang="ts">
import * as roomService from "~/services/roomService";
import RoomHeaderMessage from "~/components/RoomHeader/RoomHeaderMessage.vue";
const pokyStore = usePokyStore();
const ws = useWebSocket();

/**
 * Disconnects the current user from the room and notifies other users in the room.
 *
 * @return {Promise<void>} A promise that resolves when the user is successfully removed from the room
 *                         and a notification is sent to other users.
 */
async function leaveRoom(): Promise<void> {
  const result = await roomService.removeUser(pokyStore.roomId, pokyStore.uuid);

  if (result.success)
    await ws.notify.userLeft(pokyStore.uuid, pokyStore.roomId);
}
</script>

<template>
  <div>
    <div id="header-layout">
      <div id="header-left-side-container">
        <div id="header-left-logo-container">
          <img 
              id="poker-logo" 
              src="/n2jsoft.jpg" 
              alt="n2jsoft logo" />
        </div>
        
        <Divider layout="vertical" />
        
        <h2>Sprint poker</h2>
      </div>
      <Button 
          @click="leaveRoom" 
          severity="secondary" 
          icon="pi pi-sign-out" 
          aria-label="Leave"
          title="Leave room" />
    </div>

    <!-- Room header message -->
    <RoomHeaderMessage />
  </div>
</template>

<style scoped>
#header-layout {
  display: flex; 
  flex-direction: row; 
  width: 100%; 
  align-items: center; 
  justify-content: space-between;
  height: 6rem;
}

#header-left-side-container {
  display: flex; 
  column-gap: 1rem; 
  flex: 1;
}

#header-left-logo-container {
  display: flex; 
  align-items: center
}

#header-left-logo-container img {
  width: 65px;
}
</style>