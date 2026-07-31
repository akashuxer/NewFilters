import { Locale, MemberIndex, NormalizedMember } from '../types';
export interface RollingRange {
    startOffset: number;
    endOffset: number;
}
export type RollingPrefix = string;
export type RollingRangeWithPrefix = RollingRange & {
    prefix: RollingPrefix;
};
export type RollingValidation = {
    ok: true;
} | {
    ok: false;
    code: 'start_gt_end' | 'no_current_member' | 'start_below_min' | 'end_above_max';
};
/** The resolved "current" member, or null when none is configured. */
export declare function resolveCurrentMember(index: MemberIndex): NormalizedMember | null;
/**
 * Expand a rolling offset range against the current member. Clamps the
 * `included` slice to available bounds; `start`/`end` are null when their exact
 * offset falls outside the index (the consumer decides how to render).
 */
export declare function rollingRangeToMembers(index: MemberIndex, range: RollingRange): {
    start: NormalizedMember | null;
    end: NormalizedMember | null;
    included: NormalizedMember[];
};
/** Validate a rolling range against the index bounds. */
export declare function validateRollingRange(index: MemberIndex, range: RollingRange): RollingValidation;
/** Format a single signed rolling value, e.g. (-2, "CW") -> "CW -2". */
export declare function formatRollingValue(value: number, prefix: RollingPrefix): string;
/** Format a rolling range, e.g. "CW -2 - CW +4". */
export declare function formatRollingRange(range: RollingRangeWithPrefix): string;
/**
 * Count members whose `keyDate` (Start) falls inclusively within [start, end].
 * Partial-edge overlaps are excluded.
 */
export declare function rangeIncludedCount(index: MemberIndex, start: Date, end: Date): number;
/** Localized "Range includes N <freq-plural>" for an absolute range. */
export declare function rangeIncludedMessage(index: MemberIndex, start: Date, end: Date, frequencyLabel?: string, locale?: Locale): string;
/** Count members included by a rolling offset range. */
export declare function rollingIncludedCount(index: MemberIndex, range: RollingRange): number;
/**
 * Localized members-included summary for a rolling range:
 *   "{N} of {total} members included ({startAnchor} to {endAnchor})"
 *
 * Examples:
 *   (0, 0)  -> "1 of 60 members included (Current to Current)"
 *   (-2,4)  -> "7 of 60 members included (Current \u2212 2 to Current +4)"
 *
 * The third positional `frequencyLabel` argument is preserved for backward
 * compatibility with the legacy "Range includes ..." copy. The new wording
 * is frequency-agnostic (always "members"), so the label is ignored here.
 */
export declare function rollingIncludedMessage(index: MemberIndex, range: RollingRange, frequencyLabel?: string, locale?: Locale): string;
//# sourceMappingURL=rolling.d.ts.map