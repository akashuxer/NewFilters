export interface FormatBadgeCountOptions {
    /**
     * Compact "clean" values (4000 -> 4K, 2500000 -> 2.5M) and group "non-clean"
     * values (4234 -> 4,234). When false, the raw integer string is returned.
     */
    autoFormat?: boolean;
    /**
     * Single-mode overflow threshold. When the value exceeds it, the formatted
     * string is `${overflowCount}+`. Applied before compaction/grouping. Ignored
     * when `isRatioPart` is true (ratio counters never overflow).
     */
    overflowCount?: number;
    /**
     * Forward-compatibility flag for locale-aware grouping. Locale support is NOT
     * implemented yet, so this currently routes through the default (en-US)
     * grouping. Defaults to false.
     */
    localeAware?: boolean;
    /**
     * When true the value is one part of a ratio (current or total). Overflow
     * formatting is never applied to ratio parts.
     */
    isRatioPart?: boolean;
}
/**
 * Format a numeric counter value for display in an ArvoBadge.
 *
 * Rules:
 * - Overflow first: when `!isRatioPart` and `value > overflowCount`, returns
 *   `"{overflowCount}+"`.
 * - `autoFormat=false`: returns the raw integer string.
 * - `autoFormat=true`, clean value: compacts with K/M and at most one decimal
 *   (4000 -> "4K", 4500 -> "4.5K", 50000 -> "50K", 1000000 -> "1M",
 *   2500000 -> "2.5M"). A value is "clean" when it is a whole multiple of 100
 *   in the thousands range, or 100000 in the millions range.
 * - `autoFormat=true`, non-clean value: groups thousands (4234 -> "4,234").
 */
export declare function formatBadgeCount(value: number, options?: FormatBadgeCountOptions): string;
//# sourceMappingURL=counter.d.ts.map