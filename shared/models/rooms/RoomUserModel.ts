export default interface RoomUserModel {
    id: number, 
    username: string, 
    uuid: string, 
    currentPick?: number | null, 
    roomCode: string,
    joinedAt: string
}