/**
 * Represents the result of an operation, containing a success status and a message.
 */
export interface Result<T> {
    success: boolean
    message: string | null
    data?: T
}