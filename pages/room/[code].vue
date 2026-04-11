<script setup lang="ts" xmlns="http://www.w3.org/1999/html">
import * as roomService from "~/services/roomService";
import type {RoomModel} from "#shared/models/rooms/RoomModel";
import type RoomUserModel from "#shared/models/rooms/RoomUserModel";

definePageMeta({
  middleware: [
    'nickname'
  ],
  keepalive: false
})

const ws = useWebSocket();
const pokyStore = usePokyStore();
const route = useRoute();

/**
 * A method to join a chat room by updating the application store with the current username and room ID values.
 */
onMounted(async () => {
  // Resets the store on join
  pokyStore.participants = [];
  pokyStore.setMyPick(-1);
  pokyStore.events = [];
  
  // Sets the new room id
  if (!pokyStore.roomId || pokyStore.roomId != route.params.code) {
    pokyStore.setRoomId(route.params.code as string);
  }
  
  await nextTick();
  
  // Gets the current data of the room
  const resultRoom = await roomService.getRoomByCode<RoomModel>(pokyStore.roomId);
  
  // If the room does not exist, redirects to the home page with an error message
  if (!resultRoom.success)
  {
    await navigateTo({
      path: '/',
      query: {
        error: 'room_not_found'
      }
    })
  } else {
    const roomModel = <RoomModel>(resultRoom.data);
    
    pokyStore.revealed = roomModel.isRevealed;
    pokyStore.topic = roomModel.topic;
  }
  
  await nextTick();
  
  // Connects to the websocket server
  await ws.connect();
  
  // Adds the user to the room and notifies the server
  await roomService.addUser<number>(pokyStore.roomId, pokyStore.uuid, pokyStore.username);
  
  // Re-fetch participants now that the current user is confirmed in the DB.
  // This corrects the race condition where UserList.vue's earlier REST call
  // ran before addUser completed (Vue children mount before parents).
  const usersResult = await roomService.getCurrentUsers<RoomUserModel[]>(pokyStore.roomId);
  if (usersResult.success)
    pokyStore.setParticipants(usersResult.data ?? []);
  
  await ws.notify.newUser(pokyStore.uuid, pokyStore.roomId, pokyStore.username);
})
</script>

<template>
  <div id="room-page">
    <RoomHeader />
    <div id="room-layout">
      <main id="room-main">
        <Topic />
        <Cards />
        <Actions />
      </main>
      <aside id="room-sidebar">
        <UserList />
        <Events />
      </aside>
    </div>
  </div>
</template>

<style scoped>
#room-page {
  min-height: 100vh;
  background: var(--p-surface-ground);
}

#room-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}

#room-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

#room-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  #room-layout {
    grid-template-columns: 1fr;
  }
}
</style>