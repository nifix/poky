import {useDb} from "~/composables/useDb";
const db = useDb();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const uuid = body?.uuid;
    const currentPick = body?.currentPick;
    const roomCode = getRouterParam(event, 'code');

    if (uuid === undefined)
        throw createError({ statusCode: 400, message: 'Bad request, the uuid was undefined' });

    if (roomCode === undefined)
        throw createError({ statusCode: 400, message: 'Bad request, the roomCode was undefined' });

    if (currentPick === undefined)
        throw createError({ statusCode: 400, message: 'Bad request, current pick was undefined' });

    const dbPromise = (uuid: string, roomCode: string, currentPick: number): Promise<number> => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.get(`SELECT * FROM room_users WHERE uuid = ? AND room_code = ?`, [uuid, roomCode], (error, row) => {
                    if (error || row == null) {
                        return reject(error ?? 'user doesnt exist in room, or room doesnt exist');
                    }

                    db.run(`UPDATE room_users SET current_pick = ? WHERE uuid = ?`, [currentPick, uuid], function (error) {
                        if (error) {
                            return reject(error);
                        }

                        resolve(this.lastID);
                    });
                })
            })
        })
    }

    try {
        return await dbPromise(uuid, roomCode, currentPick);
    } catch (error) {
        throw createError({ statusCode: 500, message: <string>error });
    }
})