export interface ClampFooterActionsOptions {
    /** Hard cap on the number of footer actions. Defaults to 3. */
    max?: number;
    /**
     * Component name used in the dev warning so consumers can find the
     * offending overlay. E.g. `'ArvoPopover'`, `'ArvoSidePanel'`.
     */
    componentName?: string;
}
/**
 * Clamp an action array to at most `max` items (default 3). Returns the
 * original reference when the array already fits, so callers can use the
 * result directly in render output without spurious re-renders. When the
 * array exceeds the cap, emits a single `console.warn` (dev mode only --
 * silenced in production builds by tree-shaking) and returns a new
 * `slice(0, max)`.
 */
export declare function clampFooterActions<T>(actions: readonly T[] | T[] | null | undefined, options?: ClampFooterActionsOptions): T[];
export interface OverlayFooterFitOptions {
    /**
     * Default per-button flex basis in pixels. Falls back to 112 (matches
     * the `$arvo-window-btn-wmin` token / SCSS default).
     */
    defaultBtnMin?: number;
    /**
     * CSS gap between buttons in pixels. Must match the consumer's gap
     * (the SCSS default reads `--arvo-overlay-footer-gap` which itself
     * defaults to `$arvo-space-6` = 6px). When omitted, defaults to 6.
     */
    gap?: number;
}
export interface OverlayFooterFitHandle {
    /**
     * Force a fresh measurement pass. Call after dynamic action label
     * changes that don't trigger the `ResizeObserver` (e.g. text content
     * mutated without a layout change on the container).
     */
    measure: () => void;
    destroy: () => void;
}
/**
 * Wire a `ResizeObserver` to the overlay footer action container so the
 * shared `--arvo-overlay-footer-btn-min` CSS variable grows to fit the
 * widest label that would otherwise truncate at the default 112px floor.
 * Capped by the available footer width so labels still fall back to
 * ellipsis when there's genuinely no room. Idempotent destroy.
 *
 * Returns `{ measure, destroy }`. `measure` re-runs the calculation on
 * demand; `destroy` disconnects the observer and clears the CSS
 * variable.
 */
export declare function attachOverlayFooterFit(container: HTMLElement, options?: OverlayFooterFitOptions): OverlayFooterFitHandle;
//# sourceMappingURL=overlay-footer.d.ts.map