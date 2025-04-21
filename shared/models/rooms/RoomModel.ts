export type RoomModel = {
    id?: number, 
    code?: string, 
    createdBy?: Date,
    createdAt?: Date,
    deletedOn?: Date,
    createdByUuid?: string,
    is_revealed: boolean,
    topic: string
}

