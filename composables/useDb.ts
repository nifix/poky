import sqlite3 from "sqlite3";
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Creates and returns a new SQLite3 database connection.
 *
 * The function initializes a connection to the specified SQLite3
 * database file located at 'server/n2jpoky.db'. It utilizes the
 * sqlite3.Database class for handling the creation and setup
 * of the database connection.
 *
 * It is intended to be used to interact with the SQLite3 database
 * for performing operations such as creating tables, inserting data,
 * querying, and other database interactions.
 *
 * @function
 * @returns {sqlite3.Database} An instance of SQLite3 Database configured
 *                              with the specified database file path.
 */
export const useDb = (): sqlite3.Database => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const dbPath = path.resolve(__dirname, '../assets/n2jpoky.db');
    return new sqlite3.Database(dbPath);
}