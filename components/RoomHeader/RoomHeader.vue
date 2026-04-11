<script setup lang="ts">
import * as roomService from "~/services/roomService";
import copy from 'copy-to-clipboard';

const pokyStore = usePokyStore();
const ws = useWebSocket();
const toast = useToast();

async function leaveRoom(): Promise<void> {
  const result = await roomService.removeUser(pokyStore.roomId, pokyStore.uuid);
  if (result.success)
    await ws.notify.userLeft(pokyStore.uuid, pokyStore.roomId);
}

function copyRoomId(): void {
  copy(pokyStore.roomId);
  toast.add({ severity: 'success', summary: 'Copied', detail: 'Room ID copied!', life: 2000 });
}

function copyUserId(): void {
  copy(pokyStore.uuid);
  toast.add({ severity: 'success', summary: 'Copied', detail: 'User ID copied!', life: 2000 });
}
</script>

<template>
  <header id="room-header">
    <div id="header-inner">

      <div id="header-brand">
        <img src="/n2jsoft.jpg" alt="N2JSoft logo" id="header-logo" />
        <Divider layout="vertical" style="height: 2rem;" />
        <span id="header-title">Sprint Poker</span>
      </div>

      <div id="header-meta">
        <Tag
            severity="secondary"
            v-tooltip.bottom="'Click to copy Room ID'"
            class="meta-tag clickable"
            @click="copyRoomId">
          <i class="pi pi-hashtag" />
          {{ pokyStore.roomId }}
        </Tag>
        <Tag
            severity="info"
            v-tooltip.bottom="'Click to copy your User ID'"
            class="meta-tag clickable"
            @click="copyUserId">
          <i class="pi pi-user" />
          {{ pokyStore.username }}
        </Tag>
      </div>

      <Button
          severity="secondary"
          outlined
          icon="pi pi-sign-out"
          label="Leave"
          size="small"
          @click="leaveRoom" />

    </div>
  </header>
</template>

<style scoped>
#room-header {
  background: var(--p-surface-card);
  border-bottom: 1px solid var(--p-surface-border);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0 1.5rem;
}

#header-inner {
  max-width: 1400px;
  margin: 0 auto;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

#header-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

#header-logo {
  width: 38px;
  border-radius: 6px;
}

#header-title {
  font-weight: 700;
  font-size: 1.05rem;
  white-space: nowrap;
}

#header-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
}

.meta-tag {
  font-size: 0.8rem;
  gap: 0.35rem;
  display: inline-flex;
  align-items: center;
}

.clickable {
  cursor: pointer;
  transition: opacity 0.15s;
}

.clickable:hover {
  opacity: 0.75;
}
</style>
