import {useDb} from "~/composables/useDb";
const db = useDb();

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    
    if (id === undefined)
        throw createError({ statusCode: 400, message: 'Bad request, the code was undefined' });
    
    const dbPromise = (code: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            db.get(`SELECT *
                    FROM rooms
                    WHERE id = ?`, [id], (error, row) => {
                if (error) {
                    return reject(error);
                }

                resolve(row);
            })
        })
    }

    try {
        const result = await dbPromise(id);
        return result;
    } catch (error) {
        throw createError({ statusCode: 500, message: 'Database query failed' });
    }
})