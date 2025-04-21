<script setup lang="ts">
import * as roomService from "~/services/roomService"
import SingleCard from "~/components/Cards/SingleCard.vue";
import type RoomUserModel from "#shared/models/rooms/RoomUserModel";
import type {Result} from "#shared/models/result";
import {getTextFromCardId} from "~/services/cardsService";
import {definePageMeta} from "#imports"; 

const loading = ref(true);
const pokyStore = usePokyStore();
const ws = useWebSocket();

definePageMeta({
  middleware: [
    'nickname'
  ],
  keepalive: false
})

async function getUsers() {
  await nextTick()
  const usersResult: Result<RoomUserModel[]> = await roomService.getCurrentUsers<RoomUserModel[]>(pokyStore.roomId);
  loading.value = false;
  const resultData = usersResult.data ?? [];
  pokyStore.setParticipants(resultData);
}

async function removeUser(uuid: string) {
  if (!uuid)
    return;
  
  const result = await roomService.removeUser<boolean>(pokyStore.roomId, uuid);
  if (result.success)
    ws.notify.removeUser(uuid, pokyStore.roomId);
}

onMounted(() => getUsers())
</script>

<template>
  <div>
    <h1>Users</h1>
    <div v-if="loading" v-for="n in 3" id="userlist-skeleton-loaders">
      <div id="userlist-skeleton-loaders-left">
        <Skeleton v-if="loading" height="0.8rem" width="50vw" class="mb-2"></Skeleton>
        <Skeleton v-if="loading" height="0.8rem" width="30vw" class="mb-2"></Skeleton>
        <Skeleton v-if="loading" height="0.8rem" width="15vw" class="mb-2"></Skeleton>
      </div>
      <Skeleton size="3.3rem" class="mr-4"></Skeleton>
    </div>
    <div v-else class="table-container">
      <DataTable :value="pokyStore.participants" scrollHeight="flex">
        <Column field="username" header="Username"></Column>
        <Column field="current_pick" class="userlist-vote-column" header="Vote">
          <template #body="slotProps">
            <SingleCard
                :disabled="true"
                :uuid="slotProps.data.uuid"
                :id="slotProps.data.current_pick"
                :text="getTextFromCardId(slotProps.data.current_pick)"
                :small="true"
                :is-pushed="false"
            />
          </template>
        </Column>
        <Column field="current_pick" class="userlist-remove-column">
          <template #body="slotProps">
            <Button severity="danger" @click="removeUser(slotProps.data.uuid)">X</Button>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-datatable .p-card-body) {
  padding: 0;
}

#userlist-skeleton-loaders {
  display: flex; 
  align-items: center; 
  row-gap: 2em;
  margin-bottom: 1em
}

#userlist-skeleton-loaders-left {
  display:flex; 
  flex-direction: column; 
  row-gap: 4px; 
  margin-right: 2rem;
}
</style>

<style>
.userlist-vote-column {
  width: 3rem;
}

.userlist-remove-column {
  width: 3rem;
}
</style>