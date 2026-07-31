/**
 * Coarse operating-system family. Used internally by the modifier-key check
 * and the shortcut display formatter; consumers normally call `isMacOS()`
 * (the only branch the design system actually cares about) but the raw
 * family is exported so app code can drive its own platform-specific UX.
 */
export type ArvoOperatingSystem = 'mac' | 'windows' | 'linux' | 'other';
/**
 * Reads the user's operating-system family from the browser. Prefers the
 * modern `navigator.userAgentData.platform` (Chromium 90+) and falls back
 * to the legacy `navigator.platform` / `navigator.userAgent` strings on
 * older engines or Safari/Firefox where UA-Client-Hints isn't available.
 *
 * Returns `'other'` when no navigator information is present (Node SSR,
 * Workers, jsdom without the polyfill). Callers should treat `'other'`
 * the same as Windows / Linux for modifier-key purposes -- Mac is the
 * only family the design system shifts behavior for.
 */
export declare function getOperatingSystem(): ArvoOperatingSystem;
/** Convenience: true on macOS / iPadOS / iOS. */
export declare function isMacOS(): boolean;
/**
 * Cross-platform "mod" key check. Returns true when the keyboard event
 * carries the platform's canonical primary modifier -- `Cmd` on macOS,
 * `Ctrl` everywhere else. Use this when wiring a built-in shortcut that
 * should fire under either modifier depending on the OS the user is on.
 *
 * The helper also rejects the "wrong" modifier on each platform so a
 * literal `Ctrl+P` on macOS (which the browser binds to "Print") does
 * not accidentally fire the design-system shortcut.
 */
export declare function isModKey(event: KeyboardEvent | {
    ctrlKey: boolean;
    metaKey: boolean;
}): boolean;
export interface ParsedShortcut {
    /** The non-modifier key (e.g. `'p'`, `'/'`, `'arrowleft'`, `'home'`). */
    key: string;
    /** Whether the parsed shortcut expects `event.ctrlKey === true`. */
    ctrl: boolean;
    /** Whether the parsed shortcut expects `event.altKey === true`. */
    alt: boolean;
    /** Whether the parsed shortcut expects `event.shiftKey === true`. */
    shift: boolean;
    /** Whether the parsed shortcut expects `event.metaKey === true`. */
    meta: boolean;
}
/**
 * Parse a developer-authored shortcut string into a matcher that lines up
 * with `KeyboardEvent` modifier flags. Recognizes:
 *
 *   * `+` as the modifier / key separator (canonical developer format).
 *   * Case-insensitive modifier names: `Ctrl`, `Control`, `Cmd`, `Command`,
 *     `Meta`, `Alt`, `Option`, `Shift`, `Mod`.
 *   * The `Mod` alias (and the equivalent `Ctrl` / `Cmd` literal) which
 *     maps to `metaKey` on macOS and `ctrlKey` everywhere else so a single
 *     shortcut definition works on both platforms.
 *
 * The trailing token is treated as the non-modifier `key`. Returns the
 * matcher as a struct so callers can compare each flag against the live
 * `KeyboardEvent` without further branching.
 */
export declare function parseShortcut(shortcut: string): ParsedShortcut;
/**
 * Compare a parsed shortcut against a live keyboard event. The non-modifier
 * key is matched case-insensitively against `event.key`. All four
 * modifier flags must match exactly so `Ctrl+P` does not also fire on
 * `Ctrl+Shift+P` (which is a different built-in shortcut on most
 * platforms).
 */
export declare function matchesShortcut(event: KeyboardEvent, parsed: ParsedShortcut): boolean;
/**
 * Normalize a developer-authored shortcut string into a display label that
 * matches the active operating system. Examples (Windows / Linux):
 *
 *   * `'Ctrl+P'`         -> `'Ctrl P'`
 *   * `'Ctrl+Shift+\\'`  -> `'Ctrl Shift \\'`
 *   * `'Ctrl+ArrowLeft'` -> `'Ctrl \u2190'`
 *   * `'Del'`            -> `'Del'`
 *
 * On macOS the same inputs become:
 *
 *   * `'Ctrl+P'`         -> `'\u2318 P'`
 *   * `'Ctrl+Shift+\\'`  -> `'\u21E7 \u2318 \\'`  (Mac orders: Ctrl Alt Shift Cmd K)
 *   * `'Ctrl+ArrowLeft'` -> `'\u2318 \u2190'`
 *   * `'Del'`            -> `'Del'`
 *
 * Returns the original input unchanged if it is empty so downstream code
 * can still rely on a truthy check.
 */
export declare function formatShortcutDisplay(shortcut: string | null | undefined): string;
/**
 * Reset the cached OS detection. Vitest suites that swap `navigator`
 * between tests can call this to force re-detection on the next access.
 * Not part of the public consumer API.
 *
 * @internal
 */
export declare function __resetOperatingSystemCacheForTests(): void;
//# sourceMappingURL=shortcut.d.ts.map