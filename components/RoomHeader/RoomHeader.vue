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
        <div id="logo-wrapper">
          <img src="/n2jsoft.jpg" alt="N2JSoft" id="header-logo" />
        </div>
        <span id="header-title">Sprint Poker</span>
        <div class="live-dot" v-tooltip.bottom="'Connected'" />
      </div>

      <div id="header-meta">
        <div class="meta-chip" @click="copyRoomId" v-tooltip.bottom="'Copy Room ID'">
          <i class="pi pi-hashtag" />
          <span>{{ pokyStore.roomId }}</span>
        </div>
        <div class="meta-sep" />
        <div class="meta-chip" @click="copyUserId" v-tooltip.bottom="'Copy your User ID'">
          <i class="pi pi-user" />
          <span>{{ pokyStore.username }}</span>
        </div>
      </div>

      <Button
          icon="pi pi-sign-out"
          label="Leave"
          size="small"
          class="leave-btn"
          @click="leaveRoom" />

    </div>
  </header>
</template>

<style scoped>
#room-header {
  background: linear-gradient(to right, #1c1917, #292524);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0 1.5rem;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

#header-inner {
  max-width: 1400px;
  margin: 0 auto;
  min-height: 4rem;
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

#logo-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.5);
}

#header-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

#header-title {
  font-weight: 700;
  font-size: 1.05rem;
  color: #fafaf9;
  white-space: nowrap;
  letter-spacing: -0.2px;
}

.live-dot {
  width: 7px;
  height: 7px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse-dot 2.5s infinite;
}

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
  50% { box-shadow: 0 0 0 5px rgba(34, 197, 94, 0); }
}

#header-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  white-space: nowrap;
}

.meta-chip:hover {
  background: rgba(255, 255, 255, 0.13);
  border-color: rgba(255, 255, 255, 0.22);
}

.meta-chip i {
  font-size: 0.72rem;
  color: var(--p-primary-400);
}

.meta-sep {
  width: 1px;
  height: 1rem;
  background: rgba(255, 255, 255, 0.15);
}

/* Style the leave button for dark bg */
.leave-btn {
  flex-shrink: 0;
}

:deep(.leave-btn.p-button) {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.75);
}

:deep(.leave-btn.p-button:hover) {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

/* ── Responsive ─────────────────────────────── */

/* Medium: hide meta chips text, icon only */
@media (max-width: 700px) {
  #header-meta {
    gap: 0.25rem;
  }

  .meta-chip span {
    display: none;
  }

  .meta-sep {
    display: none;
  }
}

/* Small: hide meta entirely, leave button icon-only */
@media (max-width: 480px) {
  #header-meta {
    display: none;
  }

  #header-title {
    display: none;
  }

  :deep(.leave-btn.p-button .p-button-label) {
    display: none;
  }
}
</style>
