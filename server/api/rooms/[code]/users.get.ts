import {useDb} from "~/composables/useDb";
const db = useDb();

export default defineEventHandler(async (event) => {
    const roomCode = getRouterParam(event, 'code');

    if (roomCode === undefined)
        throw createError({ statusCode: 400, message: 'Bad request, the room code was undefined' });

    const dbPromise = (code: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT room_users.*
                    FROM room_users
                    WHERE room_code = ?
                    `, [roomCode], (error, row) => {
                if (error) {
                    return reject(error);
                }

                resolve(row);
            })
        })
    }

    try {
        const result = await dbPromise(roomCode);
        return result;
    } catch (error) {
        throw createError({ statusCode: 500, message: 'Database query failed' });
    }
})