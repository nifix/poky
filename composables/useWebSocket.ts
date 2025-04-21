import {EventKind} from "#shared/events";
import type RoomUserModel from "#shared/models/rooms/RoomUserModel";

const ws = shallowRef<WebSocket | null>(null);
const isConnected = ref(false);
let messagesQueue: Array<string> = [];

/**
 * Represents the return type of custom hook or function for managing WebSocket-based connections and notifications in a collaborative environment.
 */
interface UseWebSocketReturn {
    isConnected: Ref<boolean>;
    connect: () => void;
    notify: {
        newUser: (uuid: string, roomId: string, username: string) => void;
        userVoted: (uuid: string, roomId: string, cardId: number) => void;
        resetVotes: (uuid: string, roomId: string) => void;
        revealVotes: (uuid: string, roomId: string, details: string) => void;
        removeUser: (uuid: string, roomId: string) => void;
        userLeft: (uuid: string, roomId: string) => void;
        topicUpdate: (roomId: string, uuid: string, topic: string) => void;
    };
}

/**
 * A composable function for managing WebSocket connections and interactions with a WebSocket server.
 * This function provides the ability to establish a WebSocket connection, handle incoming/outgoing messages,
 * manage connection status, and send specific notifications based on events.
 *
 * @function useWebSocket
 * @return {UseWebSocketReturn}
 */
export const useWebSocket = (): UseWebSocketReturn => {
    const pokyStore = usePokyStore();

    /**
     * Establishes a WebSocket connection to the specified server endpoint.
     * It ensures a new connection is only initiated if no existing connection is active.
     *
     * The method also manages queuing of messages that need to be sent before
     * the WebSocket connection is open. Once connected, any queued messages
     * are sent immediately. Handles events such as connection open, close,
     * errors, and incoming messages.
     */
    function connect() : void {
        if (ws.value && ws.value.readyState !== WebSocket.CLOSED && ws.value.readyState !== WebSocket.CLOSING) {
            console.log('WebSocket already connecting or open.');
            isConnected.value = (ws.value.readyState === WebSocket.OPEN);
            return;
        }

        console.log('Attempting to connect WebSocket...');
        isConnected.value = false;
        messagesQueue = [];

        const newWs = new WebSocket('ws://localhost:3000/_ws');

        newWs.onopen = () => {
            ws.value = newWs; // Assign to the ref *after* successful open
            isConnected.value = true;
            console.log('WebSocket connected');
            // Send queued messages
            while (messagesQueue.length > 0) {
                const message = messagesQueue.shift();
                if (message) {
                    ws.value?.send(message); // Use ws.value here
                    console.log('Sent queued message:', message);
                }
            }
        };

        newWs.onclose = () => {
            isConnected.value = false;
            ws.value = null; // Clear the ref on close
            console.log('WebSocket disconnected');
        };

        newWs.onerror = (error) => {
            console.error('WebSocket error:', error);
            isConnected.value = false;
            ws.value = null; // Clear the ref on error
        };

        newWs.addEventListener('message', (event) => handleMessage(event)); // Pass store instance
    }

    /**
     * Sends a WebSocket message. If the WebSocket connection is not open, the message is queued.
     *
     * @param {WSMessage} message - The message object to be sent over the WebSocket.
     */
    function sendMessage(message: WSMessage) : void {
        const messageString = JSON.stringify(message);
        
        if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
            console.log('WebSocket not open. Queuing message:', messageString);
            messagesQueue.push(messageString);
            return;
        }
        
        console.log('Sending message:', messageString);
        ws.value.send(messageString);
    }

    /**
     * Handles incoming WebSocket messages, parses the data, and delegates it to the appropriate handler based on the message kind.
     *
     * @param {MessageEvent} event The WebSocket message event containing the data to process.
     */
    async function handleMessage(event: MessageEvent) : Promise<void> {
        try {
            const data = typeof event.data === 'string' ? event.data : await event.data.text();
            const parsedJson = JSON.parse(data);
            const kind = parsedJson.kind;

            console.log('Received message:', parsedJson);
            
            switch (kind) {
                case EventKind.UserJoined:
                    manageUserJoinedMessage(parsedJson);
                    break;
                case EventKind.UserLeft:
                    await manageUserLeftMessage(parsedJson);
                    break;
                case EventKind.UserVoted:
                    manageUserVotedMessage(parsedJson);
                    break;
                case EventKind.ResetVotes:
                    manageResetVotesMessage(parsedJson);
                    break;
                case EventKind.RevealVotes:
                    manageRevealVotesMessage(parsedJson);
                    break;
                case EventKind.LogMessage:
                    manageLogMessage(parsedJson);
                    break;
                case EventKind.UserRemoved:
                    await manageUserRemovedMessage(parsedJson);
                    break;
                case EventKind.TopicUpdated:
                    manageTopicUpdatedMessage(parsedJson);
                    break;
            }
        } catch (error) {
            console.error("Failed to parse WebSocket message:", error, event.data);
        }
    }

    /**
     * Handles the update of a topic message and synchronizes the application state with the provided message.
     *
     * @param {TopicUpdatedMessage} message - The message object containing details about the updated topic and associated room ID.
     * @return {void} This function does not return any value.
     */
    function manageTopicUpdatedMessage(message: TopicUpdatedMessage) : void {
        if (pokyStore.roomId != message.roomId)
            return;
        
        pokyStore.topic = message.topic;
    }

    /**
     * Handles the user voted message to update the participant's current pick if they exist in the store.
     *
     * @param {UserVotedMessage} message - The message object containing details of the user's vote, such as the room ID, UUID, and card ID.
     */
    function manageUserVotedMessage(message: UserVotedMessage) : void {
        if (pokyStore.roomId != message.roomId)
            return;
        
        const subjectUuid: string = message.uuid;
        const participant = pokyStore.getParticipant(subjectUuid);
        if (!participant) 
            return;
        
        participant.current_pick = message.cardId;
    }

    /**
     * Handles the addition of a user to the participants list when they join a room.
     * If the user is already present in the participants list, it logs a message without adding the user again.
     *
     * @param {UserJoinMessage} message - The message object containing the details of the user who joined the room.
     */
    function manageUserJoinedMessage(message: UserJoinMessage) : void {
        if (pokyStore.roomId != message.roomId)
            return;
        
        if (!pokyStore.participants.some(p => p.uuid === message.uuid)) {
            pokyStore.participants.push(<RoomUserModel>{
                id: 0,
                username: message.username,
                uuid: message.uuid,
                current_pick: null,
                room_code: message.roomId,
                joined_at: new Date().toISOString()
            });
        } else {
            console.log(`User ${message.username} (${message.uuid}) already in participant list.`);
        }
    }

    /**
     * Handles a log message by checking if the message's room ID matches the current room ID,
     * and updates the store's events accordingly.
     *
     * @param {LogMessage} message - The log message containing details such as room ID and the message content.
     */
    function manageLogMessage(message: LogMessage) : void {
        if (pokyStore.roomId != message.roomId)
            return;
        
        pokyStore.events = [message.message, ...pokyStore.events];
    }

    /**
     * Handles the reset votes message for the current room. This function resets the vote state
     * for all participants in the room and hides any revealed vote information.
     *
     * @param {ResetVotesMessage} message - The reset votes message object containing the room identifier.
     */
    function manageResetVotesMessage(message: ResetVotesMessage) : void {
        if (pokyStore.roomId != message.roomId)
            return;
        
        pokyStore.revealed = false;
        pokyStore.participants.forEach(p => p.current_pick = -1);
    }

    /**
     * Manages the reveal votes message by updating the `revealed` status in the `pokyStore` if the room ID matches.
     *
     * @param {RevealVotesMessage} message - The message containing information about the room and the reveal status.
     */
    function manageRevealVotesMessage(message: RevealVotesMessage) : void {
        if (pokyStore.roomId == message.roomId)
            pokyStore.revealed = true;
    }

    /**
     * Handles the process of managing a user removal message in a room.
     * Updates the participants list of the current room and redirects if the current user was removed.
     *
     * @param {RemoveUserMessage} message - The message object containing details of the user removal, including room ID and the user's UUID.
     * @return {void} - Does not return a value. Handles state updates and navigation internally.
     */
    async function manageUserRemovedMessage(message: RemoveUserMessage) : Promise<void> {
        if (pokyStore.roomId != message.roomId)
            return;
        
        pokyStore.participants = pokyStore.participants.filter(p => p.uuid !== message.uuid);
        
        if (pokyStore.uuid === message.uuid) {
            await navigateTo({
                path: '/',
                query: {
                    error: 'kicked_from_room'                        
                }
            });
        }
    }

    /**
     * Handles the scenario when a user leaves a room. Updates the participants list and manages the state of the application accordingly.
     *
     * @param {UserLeftMessage} message - The message object containing details about the user who left the room and the room context.
     * @return {void} This function does not return a value. It updates the application state and may navigate the user to a different path.
     */
    async function manageUserLeftMessage(message: UserLeftMessage) : Promise<void> {
        if (pokyStore.roomId != message.roomId)
            return;
        
        pokyStore.participants = pokyStore.participants.filter(p => p.uuid !== message.uuid);

        if (pokyStore.uuid === message.uuid) {
            pokyStore.roomId = "";
            pokyStore.revealed = false;
            pokyStore.events = [];
            pokyStore.participants = [];
            pokyStore.topic = '';
            
            await navigateTo({
                path: '/'
            });
        }
    }

    function notifyTopicUpdate(roomId: string, uuid: string, topic: string) {
        sendMessage(<TopicUpdatedMessage>{
            kind: EventKind.TopicUpdated,
            uuid: uuid,
            roomId: roomId,
            topic: topic
        })

        const participant = pokyStore.getParticipant(uuid);
        sendMessage(<LogMessage>{
            kind: EventKind.LogMessage,
            uuid: uuid,
            roomId: roomId,
            message: `(${new Date().toDateString()}) <b>${participant!.username}</b> updated room's topic to : <b>${topic}</b> !`
        })
    }
    
    /**
     * Notifies the system about a new user joining a specific room by sending relevant messages.
     *
     * @param {string} uuid - The unique identifier for the user.
     * @param {string} roomId - The identifier of the room the user has joined.
     * @param {string} username - The name of the user who joined.
     * @return {void} This function does not return any value.
     */
    function notifyNewUser(uuid: string, roomId: string, username: string) : void {
        sendMessage(<UserJoinMessage>{
            kind: EventKind.UserJoined,
            uuid: uuid,
            roomId: roomId,
            username: username
        })

        sendMessage(<LogMessage>{
            kind: EventKind.LogMessage,
            uuid: uuid,
            roomId: roomId,
            message: `(${new Date().toDateString()}) <b>${username}</b> has joined the room. Woohoo 🎉🚀 !`
        })
    }

    /**
     * Notifies the system that a user has voted by sending a message with relevant data.
     *
     * @param {string} uuid - The unique identifier of the user who has voted.
     * @param {string} roomId - The unique identifier of the room where the vote occurred.
     * @param {number} cardId - The unique identifier of the card that was voted on.
     * @return {void} This function does not return any value.
     */
    function notifyUserVoted(uuid: string, roomId: string, cardId: number) : void {
        sendMessage(<UserVotedMessage>{
            kind: EventKind.UserVoted,
            uuid: uuid,
            roomId: roomId,
            cardId: cardId
        });
    }

    /**
     * Notifies that the votes have been reset and logs the event.
     *
     * @param {string} uuid - The unique identifier of the participant triggering the reset.
     * @param {string} roomId - The identifier of the room where the votes are being reset.
     * @return {void} This function does not return a value.
     */
    function notifyResetVotes(uuid: string, roomId: string) : void {
        sendMessage(<ResetVotesMessage>{
            kind: EventKind.ResetVotes,
            uuid: uuid,
            roomId: roomId,
        });

        const participant = pokyStore.getParticipant(uuid);
        sendMessage(<LogMessage>{
            kind: EventKind.LogMessage,
            uuid: participant!.uuid,
            roomId: roomId,
            message: `(${new Date().toDateString()}) <b>${participant!.username}</b> has reset the votes.`
        })
    }

    /**
     * Notifies the removal of a user from a specified room.
     *
     * @param {string} uuid - The unique identifier of the user to be removed.
     * @param {string} roomId - The unique identifier of the room from which the user is removed.
     * @return {void} This function does not return a value.
     */
    function notifyRemoveUser(uuid: string, roomId: string) : void {
        sendMessage(<RemoveUserMessage>{
            kind: EventKind.UserRemoved,
            uuid: uuid,
            roomId: roomId
        })

        const participant = pokyStore.getParticipant(uuid);
        sendMessage(<LogMessage>{
            kind: EventKind.LogMessage,
            uuid: pokyStore.uuid,
            roomId: roomId,
            message: `(${new Date().toDateString()}) <b>${pokyStore.username}</b> removed <b>${participant!.username}</b> from the room.`
        })
    }

    /**
     * Notifies that a user has left a room by sending appropriate messages and logging the event.
     *
     * @param {string} uuid - The unique identifier of the user who left the room.
     * @param {string} roomId - The identifier of the room the user left.
     * @return {void} This method does not return any value.
     */
    function notifyUserLeft(uuid: string, roomId: string) : void {
        sendMessage(<RemoveUserMessage>{
            kind: EventKind.UserLeft,
            uuid: uuid,
            roomId: roomId
        })

        sendMessage(<LogMessage>{
            kind: EventKind.LogMessage,
            uuid: pokyStore.uuid,
            roomId: roomId,
            message: `(${new Date().toDateString()}) <b>${pokyStore.username}</b> left the room.`
        })
    }

    /**
     * Notifies that votes have been revealed in a specific room by a participant.
     *
     * @param {string} uuid - The unique identifier of the participant who revealed the votes.
     * @param {string} roomId - The unique identifier of the room where the votes were revealed.
     * @param {string} details - Additional details about the vote reveal process.
     * @return {void} This function does not return a value.
     */
    function notifyRevealVotes(uuid: string, roomId: string, details: string) : void {
        sendMessage(<RevealVotesMessage>{
            kind: EventKind.RevealVotes,
            uuid: uuid,
            roomId: roomId,
        });
        
        const participant = pokyStore.getParticipant(uuid);
        sendMessage(<LogMessage>{
            kind: EventKind.LogMessage,
            uuid: uuid,
            roomId: roomId,
            message: `(${new Date().toDateString()}) <b>${participant!.username}</b> has revealed the votes (details : ${details})`
        })
    }

    /**
     * Disconnects the shared WebSocket connection.
     *
     * @param {boolean} [force=false] - If true, forces the WebSocket connection to close.
     * @return {void}
     */
    function disconnect(force: boolean = false) : void {
        if (force && ws.value) {
            console.log('Closing shared WebSocket connection.');
            ws.value.close();
        }
    }

    /**
     * Disconnects the WebSocket connection when the component is unmounted.
     */
    onBeforeUnmount(() : void => {
        disconnect();
    });

    return <UseWebSocketReturn>{
        isConnected,
        connect,
        notify: {
            newUser: notifyNewUser,
            userVoted: notifyUserVoted,
            resetVotes: notifyResetVotes,
            revealVotes: notifyRevealVotes,
            removeUser: notifyRemoveUser,
            userLeft: notifyUserLeft,
            topicUpdate: notifyTopicUpdate
        }
    };
};

export interface WSMessage {
    kind: string,
    uuid: string,
    roomId: string
}
export interface UserJoinMessage extends WSMessage {
    username: string
}
export interface UserVotedMessage extends WSMessage {
    cardId: number
}
export interface ResetVotesMessage extends WSMessage {}
export interface RevealVotesMessage extends WSMessage {}
export interface LogMessage extends WSMessage { message: string }
export interface RemoveUserMessage extends WSMessage {}
export interface UserLeftMessage extends WSMessage {}
export interface TopicUpdatedMessage extends WSMessage { topic: string }