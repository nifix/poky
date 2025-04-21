/**
 * Represents a card with an identifier, text content, and an optional value.
 *
 * @interface Card
 *
 * @property {number} id
 *   The unique identifier of the card.
 *
 * @property {string} text
 *   The descriptive text associated with the card.
 *
 * @property {number | null} value
 *   The numerical value of the card, which can either be a number or null if no value is assigned.
 */
export interface Card {
    id: number, 
    text: string,
    value: number | null
}

/**
 * Represents the set of available cards used in a card-based evaluation or estimation process.
 * Each card includes a unique identifier, display text, and a specific value.
 *
 * @type {Card[]}
 * @property {number} id   Unique identifier for the card.
 * @property {string} text Display text shown on the card.
 * @property {?number} value Numerical value associated with the card; can be null for special cases.
 */
export const availableCards: Card[] = [
    { id: 0, text: "?", value: null },
    { id: 1, text: "0", value: 0 },
    { id: 2, text: "0.5", value: 0.5 },
    { id: 3, text: "1", value: 1 },
    { id: 4, text: "2", value: 2 },
    { id: 5, text: "3", value: 3 },
    { id: 6, text: "5", value: 5 },
    { id: 7, text: "8", value: 8 },
    { id: 8, text: "13", value: 13 },
    { id: 9, text: "20", value: 20 },
    { id: 10, text: "40", value: 40 },
    { id: 11, text: "100", value: 100 },
]

/**
 * Retrieves the text associated with a given card ID.
 *
 * @param {number} id - The unique identifier of the card.
 * @return {string} The text corresponding to the card ID, or an empty string if not found.
 */
export function getTextFromCardId(id: number): string
{
    return availableCards.find(s => s.id == id)?.text!;
}

/**
 * Retrieves a card from the collection by its unique identifier.
 *
 * @param {number} id - The unique identifier of the card to retrieve.
 * @return {Card | undefined} The card corresponding to the given ID, or undefined if not found.
 */
export function getCardById(id: number): Card | undefined {
    return availableCards.find(s => s.id == id);
}

/**
 * Finds the next card from the available cards that has a value greater than or equal to the given average score.
 *
 * @param {number} average - The score threshold to compare the card value against.
 * @return {Card|undefined} The next card with a value greater than or equal to the average, or undefined if no such card exists.
 */
export function findNextCardByScore(average: number): Card | undefined {
    return availableCards.find(card => card.value !== null && card.value >= average);
}
