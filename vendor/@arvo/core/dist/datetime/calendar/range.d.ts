/** First and last day (local midnight) of a month (month is 0..11). */
export declare function getMonthRange(year: number, month: number): {
    start: Date;
    end: Date;
};
/** First and last day (local midnight) of a year. */
export declare function getYearRange(year: number): {
    start: Date;
    end: Date;
};
/** True when any day of the given month falls within [min, max]. */
export declare function monthOverlapsRange(year: number, month: number, min: Date | null, max: Date | null): boolean;
/** True when any day of the given year falls within [min, max]. */
export declare function yearOverlapsRange(year: number, min: Date | null, max: Date | null): boolean;
//# sourceMappingURL=range.d.ts.map