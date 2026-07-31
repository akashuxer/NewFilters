import { Locale } from '../types';
/**
 * Resolve the active locale via this cascade (highest to lowest):
 *   1. explicit `override` argument (the React adapter funnels its
 *      `ArvoLocaleProvider` value and the component `locale` prop here)
 *   2. `configureDateTime({ locale })`
 *   3. `document.documentElement.lang` (<html lang>)
 *   4. 'en-US'
 *
 * `navigator.language` / `navigator.languages` are intentionally NEVER consulted.
 */
export declare function getUserLocale(override?: Locale): Locale;
type NameKind = 'full' | 'abbrev';
/** Localized month names indexed 0..11 (January..December). */
export declare function getMonthNames(locale: Locale, kind: NameKind): string[];
/** Localized weekday names indexed 0..6 (Sunday..Saturday). */
export declare function getDayNames(locale: Locale, kind: NameKind): string[];
/**
 * Weekday header labels rotated by `weekStart` (0=Sunday). The rotation is a
 * DISPLAY concern only; it never changes week numbers.
 */
export declare function getWeekdayHeaders(locale: Locale, weekStart: number, kind: 'full' | 'abbrev' | 'narrow' | 'min'): string[];
/** Localized AM/PM (dayPeriod) strings. */
export declare function getAmPmStrings(locale: Locale): {
    am: string;
    pm: string;
};
/**
 * Format wins; locale is the fallback when the format omits an hour-cycle
 * signal.
 *   1. format has `h`/`hh` -> 12-hour.
 *   2. format has `H`/`HH` -> 24-hour.
 *   3. format has `tt` but no hour token -> 12-hour.
 *   4. otherwise -> locale's resolved hour cycle.
 */
export declare function shouldUse12Hour(input: {
    format?: string;
    locale?: Locale;
}): boolean;
/**
 * Derive a .NET / Kendo date format from the locale's short date style.
 * Numeric fields are normalized to padded tokens and the year to `yyyy`
 * (the platform canonical formats are 4-digit years); separators are kept.
 */
export declare function getLocaleDateFormat(locale: Locale): string;
/** Derive a time format; 12-hour locales get `hh:mm tt`, else `HH:mm`. */
export declare function getLocaleTimeFormat(locale: Locale, use24Hour?: boolean): string;
/** Derive a combined datetime format (date + space + time). */
export declare function getLocaleDateTimeFormat(locale: Locale, use24Hour?: boolean): string;
export {};
//# sourceMappingURL=locale.d.ts.map