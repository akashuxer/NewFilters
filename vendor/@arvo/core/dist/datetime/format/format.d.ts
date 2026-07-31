import { Locale, TimeObject } from '../types';
/** Format a `Date` using a .NET / Kendo format string. */
export declare function formatDate(date: Date, format: string, locale?: Locale): string;
/** Format a combined date+time `Date` (identical engine to `formatDate`). */
export declare function formatDateTime(date: Date, format: string, locale?: Locale): string;
/**
 * Format a structured `TimeObject`. A reference calendar date backs the time
 * fields so any date tokens in `format` render deterministically. The object's
 * captured `timezone` (if any) drives timezone tokens.
 */
export declare function formatTime(time: TimeObject, format: string): string;
//# sourceMappingURL=format.d.ts.map