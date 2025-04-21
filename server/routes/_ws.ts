import { Peer, Message, WSError } from 'crossws'

const peers: Peer[] = [];

export default defineWebSocketHandler({
    /**
     * Opens a connection with the given peer and adds it to the peers list if not already present.
     *
     * @param {Object} peer - The peer object representing the connection to be opened.
     * @return {void} This method does not return a value.
     */
    open(peer: Peer) : void {
        console.log("[ws] open", peer);

        if (!peers.find((p: any) => p.id == peer.id))
            peers.push(peer);
    },

    /**
     * Handles incoming messages from a peer and broadcasts the message to all connected peers.
     *
     * @param {Object} peer - The peer object representing the sender of the message.
     * @param {string} message - The content of the message sent by the peer.
     * @return {void} This method does not return a value.
     */
    message(peer: Peer, message: Message): void {
        console.log("[ws] message", peer, message);

        for (const p of peers) {
            p.send(message);
        }
    },

    /**
     * Handles the closure of a WebSocket connection.
     *
     * @param {Object} peer - The peer object associated with the WebSocket connection.
     * @param {Object} event - The event object containing details about the close event.
     * @return {void} Does not return a value.
     */
    close(peer: Peer, event: any): void {
        console.log("[ws] close", peer, event);
    },

    /**
     * Handles an error event for a specific peer.
     *
     * @param {Peer} peer - The peer instance associated with the error.
     * @param {WSError} error - The error object or data associated with the event.
     * @return {void} This method does not return a value.
     */
    error(peer: Peer, error: WSError): void {
        console.log("[ws] error", peer, error);
    },
});