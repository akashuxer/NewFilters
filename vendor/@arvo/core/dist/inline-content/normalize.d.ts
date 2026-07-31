import { ContentProfile, InlineContent, InlineNode } from './types';
/**
 * Returns an `InlineNode[]` for any `InlineContent` value. Strings become
 * a single `TextNode`. Validation runs first; in `strip` mode invalid nodes
 * are removed.
 */
export declare function normalizeInlineContent(content: InlineContent, profile?: ContentProfile, mode?: 'throw' | 'warn' | 'strip'): InlineNode[];
export { sanitizeLink, validateInlineContent } from './validate';
//# sourceMappingURL=normalize.d.ts.map