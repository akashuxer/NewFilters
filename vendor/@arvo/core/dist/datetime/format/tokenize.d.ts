import { Token } from '../types';
/**
 * Tokenize a .NET / Kendo style format string into typed tokens. Consecutive
 * literal characters are merged into a single `literal` token.
 */
export declare function tokenizeFormat(format: string): Token[];
/** True when the format contains any time-of-day token. */
export declare function hasTimeTokens(format: string): boolean;
/** True when the format contains any calendar-date token. */
export declare function hasDateTokens(format: string): boolean;
//# sourceMappingURL=tokenize.d.ts.map