import {useDb} from "~/composables/useDb";
const db = useDb();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const revealStatus = body?.revealStatus;
    const roomCode = getRouterParam(event, 'code');

    if (revealStatus === undefined)
        throw createError({ statusCode: 400, message: 'Bad request, the revealStatus was undefined' });

    if (roomCode === undefined)
        throw createError({ statusCode: 400, message: 'Bad request, the roomCode was undefined' });

    const dbPromise = (roomCode: string, revealStatus: boolean): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.get(`SELECT * FROM rooms WHERE code = ?`, [roomCode], (error, row) => {
                    if (error || row == null) {
                        return reject(error ?? 'room doesnt exist');
                    }

                    db.run(`UPDATE rooms SET is_revealed = ? WHERE code = ?`, [revealStatus, roomCode], function (error) {
                        if (error) {
                            return reject(error);
                        }

                        resolve(true);
                    });
                })
            })
        })
    }

    try {
        return await dbPromise(roomCode, revealStatus);
    } catch (error) {
        throw createError({ statusCode: 500, message: <string>error });
    }
})