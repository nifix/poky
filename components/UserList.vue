<script setup lang="ts">
import * as roomService from "~/services/roomService"
import SingleCard from "~/components/Cards/SingleCard.vue";
import type RoomUserModel from "#shared/models/rooms/RoomUserModel";
import type {Result} from "#shared/models/result";
import {getTextFromCardId} from "~/services/cardsService";

const loading = ref(true);
const pokyStore = usePokyStore();
const ws = useWebSocket();

async function getUsers() {
  await nextTick()
  const usersResult: Result<RoomUserModel[]> = await roomService.getCurrentUsers<RoomUserModel[]>(pokyStore.roomId);
  loading.value = false;
  const resultData = usersResult.data ?? [];
  pokyStore.setParticipants(resultData);
  console.log(resultData);
}

async function removeUser(uuid: string) {
  if (!uuid)
    return;
  
  const result = await roomService.removeUser<boolean>(pokyStore.roomId, uuid);
  if (result.success)
    await ws.notify.removeUser(uuid, pokyStore.roomId);
}

onMounted(() => getUsers())
</script>

<template>
  <Card>
    <template #title>
      <div class="section-title">
        <i class="pi pi-users" />
        Participants
        <Badge v-if="!loading" :value="pokyStore.participants.length" severity="secondary" />
      </div>
    </template>
    <template #content>
      <div v-if="loading" id="userlist-skeleton-loaders">
        <div v-for="n in 3" :key="n" class="skeleton-row">
          <div class="skeleton-lines">
            <Skeleton height="0.75rem" width="60%" class="mb-2" />
            <Skeleton height="0.75rem" width="40%" />
          </div>
          <Skeleton size="2.5rem" />
        </div>
      </div>
      <div v-else class="participant-list">
        <div v-for="user in pokyStore.participants" :key="user.uuid" class="participant-row">
          <SingleCard
              :disabled="true"
              :uuid="user.uuid"
              :id="user.currentPick"
              :text="getTextFromCardId(user.currentPick)"
              :small="true"
              :is-pushed="false"
          />
          <span class="participant-name">{{ user.username }}</span>
          <Button
              v-if="pokyStore.uuid !== user.uuid"
              severity="danger"
              text
              rounded
              icon="pi pi-times"
              size="small"
              class="ml-auto"
              @click="removeUser(user.uuid)" />
        </div>
      </div>
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

#userlist-skeleton-loaders {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.skeleton-lines {
  flex: 1;
}

.participant-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.participant-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.375rem 0.25rem;
  border-radius: var(--p-border-radius-md, 6px);
  transition: background 0.15s;
}

.participant-row:hover {
  background: var(--p-surface-hover);
}

.participant-name {
  flex: 1;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
