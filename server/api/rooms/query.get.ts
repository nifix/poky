import {useDb} from "~/composables/useDb";
const db = useDb();

export default defineEventHandler(async (event) => {
    const queryParams = getQuery(event);

    if (queryParams.code === undefined)
        throw createError({ statusCode: 400, message: 'Bad request, the code was undefined' });
    
    const code = queryParams.code as string;

    const dbPromise = (code: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            db.get(`SELECT *
                    FROM rooms
                    WHERE code = ?`, [code], (error, row) => {
                if (error) {
                    return reject(error);
                }

                resolve(row);
            })
        })
    }

    try {
        const result = await dbPromise(code);
        return result;
    } catch (error) {
        throw createError({ statusCode: 500, message: 'Database query failed' });
    }
})