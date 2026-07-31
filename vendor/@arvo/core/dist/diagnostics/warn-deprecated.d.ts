/**
 * Diagnostics helpers for the Arvo design system.
 *
 * `warnDeprecated()` emits a one-time `console.warn` per unique key during
 * non-production builds, advising consumers to migrate from a deprecated
 * Arvo component (or prop) to its successor. The warning is suppressed in
 * production builds and after the first call for a given key, so it cannot
 * spam the console of a typical Arvo-consuming app.
 *
 * Usage:
 *
 *   warnDeprecated({
 *     component: 'ArvoSidePanel',
 *     successor: 'ArvoPanel',
 *     reason: 'displayMode=\'overlay\'|\'docked\' + placement=\'left\'|\'right\'',
 *   });
 */
interface WarnDeprecatedOptions {
    /** Component name that is deprecated (e.g. 'ArvoSidePanel'). */
    component: string;
    /** Successor component name (e.g. 'ArvoPanel'). */
    successor: string;
    /** Optional one-line guidance about the prop/option that should be used. */
    reason?: string;
    /** Optional URL pointing to the migration guide. */
    migrationUrl?: string;
    /**
     * Unique key for the once-per-runtime de-dupe. Defaults to the component
     * name; pass a custom key when warning about a specific prop/option.
     */
    key?: string;
}
export declare function warnDeprecated(options: WarnDeprecatedOptions): void;
/**
 * Test-only helper: clear the de-dupe set so unit tests can re-trigger the
 * warning. Not exported from the public package index; reach into the module
 * via `import { __resetWarnDeprecated } from '@arvo/core/diagnostics/warn-deprecated'`
 * in test files only.
 */
export declare function __resetWarnDeprecated(): void;
export {};
//# sourceMappingURL=warn-deprecated.d.ts.map