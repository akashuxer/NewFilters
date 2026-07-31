/**
 * Reference-counted page scroll lock.
 *
 * Multiple overlays (drawer, modal, sheet) can call `lockPageScroll()`
 * concurrently. The page scroll is restored only when every issued
 * unlock function has been called. This avoids the classic "first
 * close releases scroll while a second overlay is still open" bug.
 *
 * Implementation: stores the original `overflow` of `documentElement`
 * (and `body`) on the first lock and writes `hidden`. On the last
 * unlock, restores the original values. Subsequent locks/unlocks are
 * no-ops at the DOM level but still tracked by the counter.
 *
 * SSR-safe: returns a no-op unlocker when `document` is undefined.
 */
export declare function lockPageScroll(): () => void;
/** Returns true if the page scroll is currently locked by anyone. */
export declare function isPageScrollLocked(): boolean;
//# sourceMappingURL=page-scroll-lock.d.ts.map