export type RoomModel = {
    id?: number, 
    code?: string, 
    createdBy?: Date,
    createdAt?: Date,
    deletedOn?: Date,
    createdByUuid?: string,
    isRevealed: boolean,
    topic: string
}

