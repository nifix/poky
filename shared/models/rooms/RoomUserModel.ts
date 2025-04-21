export default interface RoomUserModel {
    id: number, 
    username: string, 
    uuid: string, 
    current_pick?: number | null, 
    room_code: string,
    joined_at: string
}