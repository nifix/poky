import {useDb} from "~/composables/useDb";
const db = useDb();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const newTopic = body?.topic;
    const roomCode = getRouterParam(event, 'code');

    if (newTopic === undefined)
        throw createError({ statusCode: 400, message: 'Bad request, the new topic was undefined' });

    if (roomCode === undefined)
        throw createError({ statusCode: 400, message: 'Bad request, the roomCode was undefined' });

    const dbPromise = (roomCode: string, topic: string): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.get(`SELECT * FROM rooms WHERE code = ?`, [roomCode], (error, row) => {
                    if (error || row == null) {
                        return reject(error ?? 'room doesnt exist');
                    }

                    db.run(`UPDATE rooms SET topic = ? WHERE code = ?`, [newTopic, roomCode], function (error) {
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
        return await dbPromise(roomCode, newTopic);
    } catch (error) {
        throw createError({ statusCode: 500, message: <string>error });
    }
})