export interface FocusTrapOptions {
    container: HTMLElement;
    initialFocus?: HTMLElement | (() => HTMLElement | null | undefined) | 'first' | 'none';
    returnFocusOnDeactivate: boolean;
    escapeDeactivates: boolean;
    allowOutsideClick: boolean;
    /**
     * Optional provider that returns the explicit forward-tab order. When
     * provided, the trap cycles Tab / Shift+Tab through this array instead of
     * the natural DOM-order focusable list. Elements that are not currently
     * present in the DOM are filtered out, so consumers can return refs that
     * may resolve to `null` between renders without breaking the cycle.
     *
     * The provider runs on every Tab event so the trap stays in sync with
     * dynamically rendered popover content (e.g. CalendarNav month/year
     * buttons appearing or disappearing as the calendar view changes).
     */
    getOrderedElements?: () => Array<HTMLElement | null | undefined>;
    /**
     * Explicit element (or live getter returning one) that focus should
     * return to on deactivate. When provided AND `returnFocusOnDeactivate`
     * is true, this overrides the default `saveFocus()` behaviour. This is
     * the canonical way to guarantee focus return to a trigger element --
     * `saveFocus()` captures whatever was active at activation time, which
     * can be wrong if focus moves AFTER activation (e.g. the ActionMenu
     * filter search input gets focused via a post-render rAF). Falls back
     * to the captured `saveFocus()` element when omitted.
     */
    returnFocusTo?: HTMLElement | (() => HTMLElement | null | undefined);
}
export interface FocusTrap {
    activate(options: FocusTrapOptions): void;
    deactivate(): void;
    isActive(): boolean;
    updateContainerElements(): void;
}
export declare function createFocusTrap(): FocusTrap;
//# sourceMappingURL=focus-trap.d.ts.map