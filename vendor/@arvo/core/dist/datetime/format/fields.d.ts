/** Plain numeric fields parsed from a value or held by a segment buffer. */
export interface DateFields {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
    millisecond?: number;
}
/** Number of days in a given month (month is 0..11). */
export declare function daysInMonth(year: number, month: number): number;
/** Apply the `yy` pivot: <50 -> 2000+, else 1900+. */
export declare function applyYearPivot(twoDigitYear: number): number;
/**
 * Construct a `Date` from numeric fields, honoring the `timezone` config
 * ('local' default, or 'utc'). Returns `null` if the fields do not round-trip
 * (e.g. Feb 31, Feb 29 in a non-leap year), which is how the parser rejects
 * impossible dates without throwing.
 *
 * Time-only inputs (no year/month/day supplied) default to TODAY's calendar
 * date so a string like "16:05" parses against `HH:mm` to today at 4:05 PM
 * instead of January 1 of the current year. Partial date inputs still fall
 * back to the legacy month=0/day=1 defaults so a year-only or month-only
 * value lands on the start of its period.
 */
export declare function buildDateFromFields(fields: DateFields): Date | null;
//# sourceMappingURL=fields.d.ts.map