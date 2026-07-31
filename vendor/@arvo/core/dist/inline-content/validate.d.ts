import { InlineContent, InlineValidationOptions, LinkNode, NormalizedLink } from './types';
/**
 * Validates a `LinkNode` and returns a normalized link. Returns `null` when
 * the href is unsafe; callers decide whether to throw or strip.
 *
 * Rules:
 * - Allows `http:`, `https:`, `mailto:`, `tel:`, and relative URLs that start
 *   with `/`, `./`, `../`, or `#`.
 * - Rejects `javascript:`, `data:`, `vbscript:`, `file:`.
 * - When `target === '_blank'`, forces `rel` to include `noopener noreferrer`.
 * - Requires a non-empty `label`.
 */
export declare function sanitizeLink(node: LinkNode): NormalizedLink | null;
/** For tests: clears the warn-once cache. */
export declare function _resetInlineWarnCache(): void;
/**
 * Validates an `InlineContent` value against a profile. In `throw` mode the
 * function throws on the first violation. In `warn` and `strip` modes it
 * returns a sanitized array (invalid nodes removed in `strip`, kept in
 * `warn`). Strings are always valid.
 *
 * Security-sensitive failures (unsafe href, raw HTML strings, unknown node
 * shapes) always throw or strip. They are never just warned because the
 * resulting render could be incorrect.
 */
export declare function validateInlineContent(content: InlineContent, options: InlineValidationOptions): InlineContent;
//# sourceMappingURL=validate.d.ts.map