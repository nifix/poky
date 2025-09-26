import type { Result } from "~/shared/models/result"
import { usePokyStore } from "~/stores/poky"
import type { RoomModel } from "#shared/models/rooms/RoomModel";
import { useApi } from "~/composables/useApi";

const api = useApi();

/**
 * Retrieves the details of a room based on the provided room ID.
 *
 * @param {string} roomCode - The unique identifier of the room to retrieve.
 * @return {Promise<T | Result>} A promise that resolves to the room details if successful,
 * or an object containing an error message if the room ID is not provided or retrieval fails.
 */
async function getRoomByCode<T>(roomCode: string): Promise<Result<T>> {
    if (!roomCode)
        return <Result<T>>{ success: false, message: 'roomId is required' }

    const { data } = await useFetch(`${api.url}/rooms/${roomCode}`, {
        method: 'GET'
    });

    if (!data.value)
        return <Result<T>>{ success: false, message: 'room not found' };
    
    return <Result<T>>{ success: true, data: data.value };
}

/**
 * Retrieves the details of a room based on the provided room ID.
 *
 * @param {string} roomId - The unique identifier of the room to retrieve.
 * @return {Promise<Object | Result>} A promise that resolves to the room details if successful,
 * or an object containing an error message if the room ID is not provided or retrieval fails.
 */
async function getRoomById<T>(roomId: number): Promise<Result<T>> {
    if (!roomId)
        return <Result<T>>{ success: false, message: 'roomId is required' }

    const { data } = await useFetch(`${api.url}/rooms/${roomId}`);

    if (!data.value)
        return <Result<T>>{ success: false, message: 'room not found' };

    return <Result<T>>{ success: true, data: data.value };
}

/**
 * Generates a new room and performs necessary initialization.
 *
 * The method utilizes the Poky store to fetch required user details
 * and prints the username for debugging purposes.
 *
 * @return {Promise<void>} Resolves when the room generation process completes.
 */
async function generateNewRoom(): Promise<Result<RoomModel>> {
    const pokyStore = usePokyStore();
    
    const roomModel = await useFetch<RoomModel>(`${api.url}/rooms`, {
        method: 'POST',
        body: JSON.stringify({
            username: pokyStore.username,
            uuid: pokyStore.uuid
        })
    })
    
    if (roomModel.data.value != null) {
        return await getRoomById(roomModel.data.value.id as number);
    }
    
    return { success: false, message: 'room generation failed' };
}

/**
 * Retrieves the current users in a specific room identified by the provided room code.
 *
 * @param {string} roomCode - The unique identifier for the targeted room to fetch user data from.
 * @return {Promise<Result<T>>} A promise resolving to an object containing the success status and
 * either the user data (on success) or an error message (on failure).
 */
async function getCurrentUsers<T>(roomCode: string) : Promise<Result<T>> {
    const { data } = await useFetch(`${api.url}/rooms/${roomCode}/users`, { cache: 'no-cache' });
    
    if (data.value != undefined)
        return <Result<T>>{ success: true, data: data.value }
    
    return <Result<T>>{ success: false, message: `couldnt retrieve users in room code ${roomCode}` };
}

/**
 * Adds a user to a specific room using the provided room code, uuid, and username.
 *
 * @param {string} roomCode - The unique identifier for the room.
 * @param {string} uuid - The unique identifier for the user.
 * @param {string} username - The username of the user to be added.
 * @return {Promise<{success: boolean, message?: string, data?: any}>} - A promise that resolves with an object indicating the success status and additional data or error message.
 */
async function addUser<T>(roomCode: string, uuid: string, username: string): Promise<Result<T>> {
    const { data, error} = await useFetch(`${api.url}/rooms/${roomCode}/users`, {
        method: 'POST',
        body: JSON.stringify({
            uuid: uuid,
            username: username
        })
    })
    
    if (error.value != null)
        return <Result<T>>{ success: false, message: `couldnt add user to room code ${roomCode} : ${error.value.message}` };
    
    return <Result<T>>{ success: true, data: data.value };
}

/**
 * Removes a user from a room by specifying the room code and user's UUID.
 *
 * @param {string} roomCode The unique code of the room from which the user is to be removed.
 * @param {string} uuid The unique identifier of the user to be removed.
 * @return {Promise<Result<T>>} A promise that resolves to a `Result` object containing the result of the operation, including success status and data or an error message.
 */
async function removeUser<T>(roomCode: string, uuid: string): Promise<Result<T>> {
    const { data, error} = await useFetch(`${api.url}/rooms/${roomCode}/users`, {
        method: 'DELETE',
        query: {
            uuid: uuid
        }
    })

    if (error.value != null)
        return <Result<T>>{ success: false, message: `couldnt remove user from room code ${roomCode} : ${error.value.message}` };

    return <Result<T>>{ success: true, data: data.value };
}

/**
 * Updates the current pick for a specific user in a room.
 *
 * @param {string} roomCode - The unique identifier of the room.
 * @param {string} uuid - The unique identifier of the user.
 * @param {number} currentPick - The updated value of the current pick for the user.
 * @return {Promise<Result<T>>} A promise that resolves with the result of the operation, including success status and optional error message or data.
 */
async function updateCurrentPick<T>(roomCode: string, uuid: string, currentPick: number): Promise<Result<T>> {
    const { data, error} = await useFetch(`${api.url}/rooms/${roomCode}/users/${uuid}`, {
        method: 'PUT',
        body: JSON.stringify({
            currentPick: currentPick
        })
    })

    if (error.value != null)
        return <Result<T>>{ success: false, message: `couldnt update user current pick in ${roomCode} for user ${uuid}: ${error.value.message}` };

    return <Result<T>>{ success: true, data: data.value };
}

/**
 * Updates the reveal status of a room identified by the given room code.
 *
 * @param {string} roomCode - The unique identifier of the room.
 * @param {boolean} revealStatus - The new reveal status to be set for the room.
 * @return {Promise<Result<T>>} A promise that resolves to a result object indicating success or failure of the operation.
 */
async function setRevealStatus<T>(roomCode: string, revealStatus: boolean): Promise<Result<T>> {
    const { data, error} = await useFetch(`${api.url}/rooms/${roomCode}/reveal`, {
        method: 'PUT',
        body: JSON.stringify({
            revealStatus: revealStatus,
        })
    })

    if (error.value != null)
        return <Result<T>>{ success: false, message: `couldnt update room reveal status in ${roomCode} : ${error.value.message}` };

    return <Result<T>>{ success: true, data: data.value };
}

/**
 * Updates the topic of a specific room identified by its room code.
 *
 * @param {string} roomCode - The unique identifier of the room where the topic will be updated.
 * @param {string} uuid - The unique identifier for the user or request context.
 * @param {string} topic - The new topic to be set for the room.
 * @return {Promise<Result<T>>} A promise resolving to an object containing the result of the operation.
 */
async function setTopic<T>(roomCode: string, uuid: string, topic: string): Promise<Result<T>> {
    const { data, error} = await useFetch(`${api.url}/rooms/${roomCode}/topic`, {
        method: 'PUT',
        body: JSON.stringify({
            topic: topic,
            uuid: uuid
        })
    })

    if (error.value != null)
        return <Result<T>>{ success: false, message: `couldnt update room topic in ${roomCode} : ${error.value.message}` };

    return <Result<T>>{ success: true, data: data.value };
}

export { 
    getRoomById, 
    getRoomByCode, 
    generateNewRoom, 
    getCurrentUsers, 
    addUser, 
    updateCurrentPick, 
    removeUser, 
    setRevealStatus, 
    setTopic 
}