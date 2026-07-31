import { Locale, TimeObject } from '../types';
/** Parse a date string against a .NET / Kendo format. Returns null on failure. */
export declare function parseDate(value: string, format: string, locale?: Locale): Date | null;
/** Parse a combined date+time string (shares the date parser core). */
export declare function parseDateTime(value: string, format: string, locale?: Locale): Date | null;
/**
 * Parse a time string against a format into a structured `TimeObject`. Unlike
 * the legacy engine, the supplied `format` drives the regex. The captured
 * timezone (if any) is stored but does not adjust anything.
 */
export declare function parseTime(value: string, format: string): TimeObject | null;
/**
 * Split a combined format into its date and time portions plus the literal
 * separator between them. Either portion may be empty.
 */
export declare function splitDateTimeFormat(format: string): {
    datePart: string;
    timePart: string;
    separator: string;
};
//# sourceMappingURL=parse.d.ts.map