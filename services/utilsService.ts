const errorMessagesMapping = new Map<string, string>([
    ["nickname_not_set", "You must set a nickname before joining a room."],
    ["kicked_from_room", "You have been kicked from the room. Cheh."],
    ["room_not_found", "Room not found."]   
]);

export { errorMessagesMapping }