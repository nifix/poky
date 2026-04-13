import type RoomUserModel from "#shared/models/rooms/RoomUserModel";

export const usePokyStore = defineStore('pokyStore', {
    state: () => ({
        peer: null,
        username: useCookie("username")?.value || '',
        uuid: useCookie("uuid")?.value || '',
        roomId: '',
        votingDisabled: false,
        revealed: false,
        
        participants: [] as RoomUserModel[],
        rooms: [] as string[],
        events: [] as string[],
        topic: '',
        ws: null,
        observers: [] as string[]
    }),
    getters: {
        isWatching: (state): boolean => state.observers.includes(state.uuid)
    },
    actions: {
        setUsername(username: string) { this.username = username; },
        setRoomId(roomId: string) { this.roomId = roomId; },
        setUuid(uuid: string) { this.uuid = uuid; },
        getParticipant(uuid: string) { return this.participants.find(s => s.uuid == uuid); },
        setParticipants(participants: RoomUserModel[]) { this.participants = participants; },
        
        setMyPick(cardId: number) {
            const myself = this.participants.find(u => u.uuid == this.uuid);
            if (myself) {
                myself.currentPick = cardId;
            }
        },
        
        getMySelf() {
            return this.participants.find(u => u.uuid == this.uuid);
        },

        addCreatedRoom(roomId: string) {
            this.rooms = [...this.rooms, roomId]
            console.log('added room ', roomId);
        },
        
        removeParticipant(uuid: string) {
            this.participants = [...this.participants.filter(s => s.uuid != uuid)];
        },

        setObserver(uuid: string) {
            if (!this.observers.includes(uuid)) this.observers.push(uuid);
        },

        unsetObserver(uuid: string) {
            this.observers = this.observers.filter(u => u !== uuid);
        },

        isObserverUuid(uuid: string): boolean {
            return this.observers.includes(uuid);
        }
    }
})