import { Frequency, MemberIndex, MemberItem, NormalizedMember } from '../types';
/** Detect cadence from an already-parsed, sorted list of bucket-start dates. */
export declare function frequencyFromDates(dates: Date[]): Frequency;
/** Detect cadence from raw member items (parses each key). */
export declare function detectFrequency(members: MemberItem[]): Frequency;
export interface FrequencyViewConfig {
    navigationUnit: 'month' | 'year' | 'decade';
    membersPerView: number | null;
}
/** Navigation unit and per-view member count for a given frequency. */
export declare function getFrequencyViewConfig(frequency: Frequency): FrequencyViewConfig;
/** The member immediately before/after `member` in the sorted timeline. */
export declare function getAdjacentMember(index: MemberIndex, member: NormalizedMember, direction: 'prev' | 'next'): NormalizedMember | null;
//# sourceMappingURL=frequency.d.ts.map