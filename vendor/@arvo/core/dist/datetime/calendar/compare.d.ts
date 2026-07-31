/** Local midnight of the given date. */
export declare function normalizeDate(date: Date): Date;
/** Alias for `normalizeDate`. */
export declare const normalize: typeof normalizeDate;
/** True when both dates fall on the same calendar day. */
export declare function isSameDay(a: Date, b: Date): boolean;
/** True when `a` is an earlier calendar day than `b`. */
export declare function isBeforeDay(a: Date, b: Date): boolean;
/** True when `a` is a later calendar day than `b`. */
export declare function isAfterDay(a: Date, b: Date): boolean;
/** True when both dates share the same calendar month and year. */
export declare function isSameMonth(a: Date, b: Date): boolean;
/** True when both dates share the same calendar year. */
export declare function isSameYear(a: Date, b: Date): boolean;
/** True when both dates fall in the same calendar quarter and year. */
export declare function isSameQuarter(a: Date, b: Date): boolean;
/**
 * True when both dates fall in the same ISO 8601 week (weeks start Monday for
 * the value, independent of any display `weekStart`).
 */
export declare function isSameWeek(a: Date, b: Date): boolean;
/** Add (or subtract) whole days, preserving the time-of-day. */
export declare function addDays(date: Date, days: number): Date;
/** Add (or subtract) whole months, clamping the day to the target month. */
export declare function addMonths(date: Date, months: number): Date;
/**
 * Inclusive day-level range test. `null` bounds are open. Time-of-day is
 * ignored (comparison is at the calendar-day level).
 */
export declare function inDateRange(date: Date, min: Date | null, max: Date | null): boolean;
/**
 * Returns a date suitable for anchoring a calendar's initial `visibleYear` /
 * `visibleMonth` (and its initial focus target) so the user opens onto a
 * period that contains at least one selectable cell -- not a fully
 * out-of-range dead view.
 *
 * Resolution order:
 *   1. `preferred` when supplied (assumed clamped to `[min, max]` already).
 *   2. Today, when today falls within `[min, max]`.
 *   3. `min` (start of the allowed window).
 *   4. `max` (end of the allowed window).
 *   5. Today, when no bounds are set.
 *
 * Without this helper, calendar dropdowns / pickers that fall through to
 * `new Date()` open onto today's month even when the bounds preclude any
 * selectable day there -- with both Prev and Next also disabled (no
 * adjacent period overlaps the range), the dropdown becomes unusable.
 */
export declare function pickAnchorDate(preferred: Date | null | undefined, min: Date | null, max: Date | null): Date;
//# sourceMappingURL=compare.d.ts.map