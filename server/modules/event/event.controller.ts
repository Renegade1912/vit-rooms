export enum DateRange {
    WEEK = 'week',
    MONTH = 'month'
}

/**
 * Returns the start of the week for a given date.
 *
 * @param date - The date for which to calculate the start of the week.
 * @returns The start of the week as a Date object.
 */
export const startOfWeek = (date: Date): Date => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);

    return new Date(date.setDate(diff));
};

/**
 * Calculates the end of the week for a given date.
 *
 * @param date - The input date.
 * @returns The end of the week as a Date object.
 */
export const endOfWeek = (date: Date): Date => {
    const day = date.getDay();
    const diff = date.getDate() + (6 - day);

    return new Date(date.setDate(diff));
};

/**
 * Returns the start of the month for the given date.
 *
 * @param date - The date for which to calculate the start of the month.
 * @returns The start of the month as a Date object.
 */
export const startOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Calculates the last day of the month for a given date.
 *
 * @param date - The input date.
 * @returns The last day of the month as a Date object.
 */
export const endOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};
