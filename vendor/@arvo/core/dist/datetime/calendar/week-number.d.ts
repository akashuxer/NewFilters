/**
 * ISO 8601 week number (1..53). Shifts the date to the Thursday of its
 * Monday-based week, then divides that Thursday's day-of-year by 7.
 */
export declare function getWeekNumber(date: Date): number;
/** Display form, e.g. `getWeekNumber` 1 -> "W01". */
export declare function formatWeekNumber(n: number): string;
//# sourceMappingURL=week-number.d.ts.map