import { Frequency, MemberIndex, MemberItem, NormalizedMember } from '../types';
import { parseMemberKey } from './parse-key';
export interface BuildMemberIndexOptions {
    frequency?: Frequency;
    currentMemberIndex?: number | null;
}
/** Re-exported for convenience (also exported from the barrel). */
export { parseMemberKey };
/**
 * Normalize, sort, and index a list of members. Frequency is auto-detected
 * unless supplied. `endDate` is derived per the frequency cadence.
 */
export declare function buildMemberIndex(members: MemberItem[], options?: BuildMemberIndexOptions): MemberIndex;
/** Find the member whose bucket [keyDate, endDate] contains `date`. */
export declare function findMemberForDate(index: MemberIndex, date: Date): NormalizedMember | null;
/** Alias for `findMemberForDate`. */
export declare const findMemberByDate: typeof findMemberForDate;
/** Look up a member by its numeric `index` field. */
export declare function findMemberByIndex(index: MemberIndex, i: number): NormalizedMember | null;
/** Members whose start (`keyDate`) falls in the given calendar year. */
export declare function getMembersForYear(index: MemberIndex, year: number): NormalizedMember[];
/** Members whose start falls in the given calendar month (month is 0..11). */
export declare function getMembersForMonth(index: MemberIndex, year: number, month: number): NormalizedMember[];
/** Members whose start falls in the decade beginning `decadeStart`. */
export declare function getMembersForDecade(index: MemberIndex, decadeStart: number): NormalizedMember[];
/** Members whose start falls inclusively within [start, end] (day-level). */
export declare function getMembersInRange(index: MemberIndex, start: Date, end: Date): NormalizedMember[];
/** Alias for `getMembersInRange`. */
export declare const listMembersBetween: typeof getMembersInRange;
/** The absolute date span covered by two members (start.start..end.end). */
export declare function getMemberRange(start: NormalizedMember, end: NormalizedMember): {
    start: Date;
    end: Date;
};
/** True when a member's bucket overlaps [min, max] (null bounds open). */
export declare function isMemberInRange(member: NormalizedMember, min: Date | null, max: Date | null): boolean;
//# sourceMappingURL=index.d.ts.map