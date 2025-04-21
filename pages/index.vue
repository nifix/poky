<script setup lang="ts">
import * as roomService from "~/services/roomService";
import type { RoomModel } from "~/shared/models/rooms/RoomModel";
import type { Result } from "#shared/models/result";
import { useConfirm } from "primevue/useconfirm";
import { v4 as uuidv4 } from 'uuid';
import * as utilsService from "~/services/utilsService";
import {definePageMeta} from "#imports";

const pokyStore = usePokyStore();
const usernameCookie = useCookie("username");
const uuidCookie = useCookie("uuid");

const route = useRoute();
const error = route.query.error;

const confirm = useConfirm();

const username = ref(pokyStore.username || '')
const roomId = ref(pokyStore.roomId || '')

definePageMeta({
  keepalive: false
})

/**
 * Determines whether the "Join Room" button should be enabled.
 *
 * This function evaluates the current state of the `username` and `roomId` fields
 * to decide if the button for joining a room can be activated.
 *
 * @returns {boolean} True if both `username` and `roomId` have valid values; otherwise, false.
 */
const isJoinRoomButtonEnabled = (): boolean => !!username.value && !!roomId.value

/**
 * Updates the store with local data by patching it with the current values of username and roomId.
 *
 * @return {void} This function does not return a value.
 */
function updateStoreWithLocalData(): void {
  pokyStore.$patch({
    username: username.value,
    roomId: roomId.value,
  })
  
  if (!pokyStore.uuid)
  {
    const newUuid = uuidv4();
    pokyStore.setUuid(newUuid);
    uuidCookie.value = newUuid;
  }

  usernameCookie.value = username.value;
}

async function createNewRoom() {
    updateStoreWithLocalData();
  
    const result: Result<RoomModel> = await roomService.generateNewRoom();
    if (!!result.data !== false) {
      const roomId = result.data.code as string;
      pokyStore.setRoomId(roomId);
      pokyStore.addCreatedRoom(roomId);
      
      await navigateTo({
        path: `/room/${result.data.code}`
      });
    }
}

/**
 * A method to join a chat room by updating the application store with the current username and room ID values.
 * This function patches the store state with the provided username and room ID.
 */
async function joinRoom() {
  updateStoreWithLocalData();
  await navigateTo({ path: `/room/${pokyStore.roomId}` });
}

onMounted(async () => {
  pokyStore.participants = [];
  pokyStore.setMyPick(-1);
  pokyStore.events = [];
})
</script>

<template>
  <div id="pick-a-room-container">
    <Message id="error-message" severity="error" v-if="error">
      {{ utilsService.errorMessagesMapping.get(error as string) }}
    </Message>
  <Card>
    <template #content>
        <div id="pick-a-room-inner-container">
          <img id="poker-logo" src="/n2jsoft.jpg" alt="n2jsoft logo" />
          <div id="nickname-block">
            <FloatLabel>
              <InputText id="username" v-model="username" />
              <label for="username">Username (required)</label>
            </FloatLabel>
          </div>
          <Divider />
          <div id="join-room-button-container">
            <Button
                type="button"
                label="Create new room"
                :fluid="true"
                :disabled="!!username == false"
                @click="createNewRoom"/>

            <Divider>
              OR
            </Divider>
            <div id="room-id-block">
              <FloatLabel>
                <InputText id="room-id" v-model="roomId" />
                <label for="room-id">Room ID</label>
              </FloatLabel>
            </div>

            <Button
                type="button"
                label="Join room"
                :fluid="true"
                :disabled="!isJoinRoomButtonEnabled()"
                @click="joinRoom"/>
          </div>
        </div>
    </template>
  </Card>
  </div>
    
</template>

<style scoped>
#error-message, #poker-logo {
  margin-bottom: 1em;  
}

#poker-logo {
  width: 95px;
  padding: 1rem;
}

#nickname-block, #room-id-block {
  display: flex;
  flex-direction: column;
}

#pick-a-room-inner-container, #nickname-block,
#join-room-button-container, #join-room-button
{
  width: 80%;
}

input {
  width: 100%;
}

#join-room-button-container {
  display: flex;
  flex-direction: column;
  row-gap: 1rem;
}

#pick-a-room-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  
  height: 100vh;
  width: 100vw;
}

#pick-a-room-inner-container {
  width: 20rem;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 1rem;
}
</style>