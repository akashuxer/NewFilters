export interface ResolveInitialsOptions {
    /** Display name to derive initials from. Tried first. */
    name?: string | null;
    /** Email address used as a fallback source. Only the local part is parsed. */
    email?: string | null;
    /**
     * Maximum number of characters in the resolved initials string.
     * The Avatar `xs` size passes `1`; all other sizes pass `2` (the default).
     * For non-Latin scripts the result is always a single character regardless.
     */
    maxChars?: number;
}
/** Resolve initials from a name (preferred) or email fallback. */
export declare function resolveInitials(options?: ResolveInitialsOptions): string;
/**
 * Parse initials from a display name. Returns an empty string when no valid
 * initials can be derived (caller should fall back to an icon avatar).
 */
export declare function parseInitialsFromName(name: string, maxChars?: number): string;
/**
 * Parse initials from an email address (or just the local part). Dots,
 * underscores, and hyphens act as word separators.
 */
export declare function parseInitialsFromEmail(emailOrLocal: string, maxChars?: number): string;
//# sourceMappingURL=initials.d.ts.map