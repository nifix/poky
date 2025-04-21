import {useDb} from "~/composables/useDb";
const db = useDb();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const uuid = body?.uuid;
    const username = body?.username;
    
    const roomCode = getRouterParam(event, 'code');

    if (uuid === undefined)
        throw createError({ statusCode: 400, message: 'Bad request, the uuid was undefined' });

    if (roomCode === undefined)
        throw createError({ statusCode: 400, message: 'Bad request, the roomCode was undefined' });
    
    if (username === undefined)
        throw createError({ statusCode: 400, message: 'Bad request, the username was undefined' });

    const dbPromise = (username: string, uuid: string): Promise<number> => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.get(`SELECT * FROM room_users WHERE uuid = ? AND room_code = ?`, [uuid, roomCode], (error, row) => {
                    if (error || row != null) {
                        return reject(error ?? 'user already in room');
                    }

                    db.run(`INSERT INTO room_users (uuid, room_code, username) VALUES (?, ?, ?)`, [uuid, roomCode, username], function (error) {
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
        return await dbPromise(username, uuid);
    } catch (error) {
        throw createError({ statusCode: 500, message: <string>error });
    }
})