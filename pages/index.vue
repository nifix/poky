<script setup lang="ts">
import * as roomService from "~/services/roomService";
import type { RoomModel } from "~/shared/models/rooms/RoomModel";
import type { Result } from "#shared/models/result";
import { v4 as uuidv4 } from 'uuid';
import * as utilsService from "~/services/utilsService";
import {definePageMeta} from "#imports";

const pokyStore = usePokyStore();
const usernameCookie = useCookie("username");
const uuidCookie = useCookie("uuid");

const route = useRoute();
const error = route.query.error;

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
  <div id="login-page">
    <Transition name="fade">
      <div v-if="error" class="error-banner">
        <Message severity="error" :closable="false" icon="pi pi-exclamation-triangle">
          {{ utilsService.errorMessagesMapping.get(error as string) }}
        </Message>
      </div>
    </Transition>

    <div id="login-layout">
      <!-- Left: Branded hero panel -->
      <div id="hero-panel">
        <div id="hero-content">
          <img src="/n2jsoft.jpg" alt="N2J Soft logo" id="hero-logo" />
          <h1 id="hero-title">N2J Poky</h1>
          <p id="hero-tagline">Sprint Planning, simplified.</p>
          <div id="hero-features">
            <div class="feature-item">
              <i class="pi pi-bolt" />
              <span>Real-time estimation voting</span>
            </div>
            <div class="feature-item">
              <i class="pi pi-users" />
              <span>Collaborative team rooms</span>
            </div>
            <div class="feature-item">
              <i class="pi pi-chart-bar" />
              <span>Instant results reveal</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Login form -->
      <div id="form-panel">
        <Card id="login-card">
          <template #content>
            <div id="form-content">
              <div id="form-header">
                <h2>Get started</h2>
                <p>Enter your name, then create or join a room.</p>
              </div>

              <div class="form-field">
                <label for="username" class="field-label">
                  <i class="pi pi-user" /> Your name
                </label>
                <InputText
                    id="username"
                    v-model="username"
                    placeholder="e.g. John Doe"
                    fluid
                    @keyup.enter="username && !roomId ? createNewRoom() : joinRoom()" />
              </div>

              <Button
                  label="Create new room"
                  icon="pi pi-plus"
                  fluid
                  :disabled="!username"
                  @click="createNewRoom" />

              <Divider>
                <span class="or-text">OR</span>
              </Divider>

              <div class="form-field">
                <label for="room-id" class="field-label">
                  <i class="pi pi-hashtag" /> Room ID
                </label>
                <InputText
                    id="room-id"
                    v-model="roomId"
                    placeholder="e.g. ABC-123"
                    fluid
                    @keyup.enter="isJoinRoomButtonEnabled() && joinRoom()" />
              </div>

              <Button
                  label="Join room"
                  icon="pi pi-arrow-right"
                  icon-pos="right"
                  severity="secondary"
                  fluid
                  :disabled="!isJoinRoomButtonEnabled()"
                  @click="joinRoom" />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
#login-page {
  min-height: 100vh;
  background: var(--p-surface-ground);
}

.error-banner {
  position: fixed;
  top: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  min-width: 320px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

#login-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

/* ── Hero panel ── */
#hero-panel {
  background: linear-gradient(145deg, var(--p-primary-500) 0%, var(--p-primary-800) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

#hero-content {
  max-width: 360px;
}

#hero-logo {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  object-fit: cover;
  margin-bottom: 1.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

#hero-title {
  font-size: 2.6rem;
  font-weight: 800;
  margin: 0 0 0.4rem;
  color: #fff;
  letter-spacing: -0.5px;
}

#hero-tagline {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.82);
  margin: 0 0 2.5rem;
  line-height: 1.5;
}

#hero-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
}

.feature-item i {
  font-size: 1rem;
  width: 1.6rem;
  height: 1.6rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Form panel ── */
#form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: var(--p-surface-ground);
}

#login-card {
  width: 100%;
  max-width: 400px;
}

#form-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0.25rem 0;
}

#form-header {
  margin-bottom: 0.25rem;
}

#form-header h2 {
  margin: 0 0 0.3rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--p-text-color);
}

#form-header p {
  margin: 0;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--p-text-color);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.or-text {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--p-text-muted-color);
  letter-spacing: 0.05em;
  padding: 0 0.5rem;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  #login-layout {
    grid-template-columns: 1fr;
  }

  #hero-panel {
    padding: 2.5rem 2rem 2rem;
    min-height: auto;
  }

  #hero-features {
    display: none;
  }

  #hero-title {
    font-size: 2rem;
  }

  #form-panel {
    padding: 2rem 1.5rem 3rem;
    align-items: flex-start;
  }

  #login-card {
    max-width: 100%;
  }
}
</style>