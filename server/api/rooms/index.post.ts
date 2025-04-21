import {useDb} from "~/composables/useDb";
import { v4 as uuidv4 } from 'uuid';

const db = useDb();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const username = body?.username;
    const uuid = body?.uuid;
    
    if (username === undefined)
        throw createError({ statusCode: 400, message: 'Bad request, the username was undefined' });

    if (uuid === undefined)
        throw createError({ statusCode: 400, message: 'Bad request, the uuid was undefined' });

    const dbPromise = (username: string, uuid: string): Promise<number> => {
        return new Promise((resolve, reject) => {
            const newRoomIdentifier = uuidv4();
            
            db.serialize(() => {
                db.run(`INSERT INTO rooms (code, createdBy, createdByUuid) VALUES (?, ?, ?)`, [newRoomIdentifier, username, uuid], function (error) {
                    if (error) {
                        return reject(error);
                    }
                    
                    resolve(this.lastID);
                });
            })
        })
    }
    
    try {
        return await dbPromise(username, uuid);
    } catch (error) {
        throw createError({ statusCode: 500, message: 'Database insert failed' });
    }
})