import { DateTimeConfig } from './types';
/**
 * Merge the supplied partial config into the engine-level defaults.
 *
 * `timezone` accepts only `'local'` or `'utc'` in V1. IANA timezone strings
 * (e.g. `'America/Chicago'`) are a reserved future surface and throw a
 * `RangeError`.
 */
export declare function configureDateTime(config: Partial<DateTimeConfig>): void;
/** Read the current engine config (a defensive copy). */
export declare function getDateTimeConfig(): DateTimeConfig;
/**
 * Restore the engine defaults. Primarily for test isolation and app teardown.
 * Not part of the picker-facing surface but safe to call.
 */
export declare function resetDateTimeConfig(): void;
//# sourceMappingURL=config.d.ts.map