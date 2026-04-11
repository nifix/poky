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
  <Fluid id="main-container" class="flex-col">
    <!-- Room header -->
    <RoomHeader />

    <!-- Card list -->
    <Cards />
    
    <!-- Actions (reveal/reset) and score -->
    <Actions />
    
    <!-- Topic -->
    <Topic />

    <!-- UserList -->
    <UserList />

    <!-- Logs -->
    <Events />
  </Fluid>
</template>

<style scoped>
#main-container {
  width: 60vw; 
  margin: auto;
}

h1 {
  margin-top: 3rem;
  margin-bottom: 3rem;
}
</style>