import { ContentProfile, InlineNode } from './types';
/** Node types allowed in the `basic-inline` profile. */
export declare const BASIC_INLINE_NODES: ReadonlyArray<InlineNode['type']>;
/** Node types allowed in the `extended-inline` profile. */
export declare const EXTENDED_INLINE_NODES: ReadonlyArray<InlineNode['type']>;
/** Returns the allow-list for a given profile. `text-only` allows none. */
export declare function getAllowedNodeTypes(profile: ContentProfile): ReadonlyArray<InlineNode['type']>;
//# sourceMappingURL=profiles.d.ts.map