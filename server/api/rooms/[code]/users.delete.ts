import {useDb} from "~/composables/useDb";
const db = useDb();

export default defineEventHandler(async (event) => {
    const queryParams = getQuery(event);
    const roomCode = getRouterParam(event, 'code');
    const uuid = queryParams.uuid as string;

    if (uuid === undefined)
        throw createError({ statusCode: 400, message: 'Bad request, the uuid was undefined' });

    if (roomCode === undefined)
        throw createError({ statusCode: 400, message: 'Bad request, the roomCode was undefined' });

    const dbPromise = (roomCode: string, uuid: string): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM room_users WHERE room_code = ? AND uuid = ?`, [roomCode, uuid], function (error) {
                if (error) {
                    return reject(error);
                }

                resolve(true);
            })
        })
    }

    try {
        return await dbPromise(roomCode, uuid);
    } catch (error) {
        throw createError({ statusCode: 500, message: <string>error });
    }
})