/**
 * Horizontal overflow manager -- framework-agnostic logic that detects which
 * items in a horizontal container have been clipped by the available width
 * and routes the hidden set back to the consumer so it can render them in an
 * overflow menu (typically an ArvoActionMenu anchored to an icon-button
 * trigger).
 *
 * Used by ArvoButtonGroup and ArvoTabstrip; ready to be consumed by any
 * future "list of inline items with an overflow chevron" pattern (toolbars,
 * breadcrumbs, chip lists, etc.). Drag-and-drop friendly: the manager
 * exposes `refresh()` so consumers can recompute after any layout change
 * (item reorder, item add/remove, parent resize that doesn't fire the
 * container ResizeObserver, etc.).
 *
 * Design choices:
 * - The manager does NOT own the trigger element. Consumers render their own
 *   trigger (typically `ArvoIconButton` + `ArvoActionMenu`) and pass a
 *   `getTriggerWidth()` callback so the manager can reserve inline-end
 *   space. When the trigger is rendered conditionally (e.g. React only
 *   mounts it once items overflow), `triggerWidthEstimate` provides the
 *   first-pass reservation so the first measurement still excludes enough
 *   width for the trigger that's about to appear.
 * - The manager mutates each item's inline `visibility` / `position` /
 *   `pointerEvents` styles so the items are layout-removed but still
 *   measurable (consumers can still rely on `getBoundingClientRect` in tests
 *   or for keyboard navigation). Consumers can override the visibility
 *   strategy via the `setHidden` option if a different mechanism is needed.
 * - Pinned items (and the optional "promoted" id -- typically the currently
 *   selected item the consumer wants to keep in view) are never hidden.
 *   When the promoted id would otherwise fall into the hidden set, the
 *   manager swaps it with the last visible non-pinned item so the
 *   selection stays anchored to the visible region.
 * - The hidden set is diffed before invoking `onChange` -- consumers only
 *   re-render when the set actually changes, which makes it safe to route
 *   straight into React state setters without inducing extra renders.
 */
export interface OverflowItem {
    /** Stable identifier for the item (must be unique within the container). */
    id: string;
    /** The DOM element to measure. */
    el: HTMLElement;
}
export interface OverflowManagerOptions {
    /**
     * The element that holds the items in flow. Items are measured by their
     * bounding rect against the boundary (see below), and hidden items are
     * styled inline so they're removed from layout without losing their DOM
     * identity. The container is also the element whose own size CAN change
     * as items are hidden / revealed -- so the manager intentionally does
     * NOT observe it (that would create feedback loops). Observation happens
     * on the `boundary` element instead.
     */
    container: HTMLElement;
    /**
     * The element whose right edge represents the available width that items
     * must fit within. The manager attaches its `ResizeObserver` here and
     * uses `boundary.getBoundingClientRect().right - triggerReserve` as the
     * clip line.
     *
     * Defaults to `container`. Pass a separate element (typically
     * `container.parentElement`) when you want the container itself to
     * size-to-content (`inline-flex`) -- otherwise the container would always
     * grow to fit every item and the clip line would never bite.
     *
     * For tab-strip style layouts where the items container already has its
     * width constrained by a sibling flex item (e.g. a fixed-width trigger
     * sibling pushes the items container to `flex: 1 1 auto`), the default
     * (`container === boundary`) is correct.
     *
     * For toolbar / segmented-control layouts where the container is
     * inline-flex and the trigger is rendered INSIDE the same container,
     * pass the parent so the parent's width drives detection while the
     * container stays flush with its visible children (no whitespace
     * between the last visible item and the trigger).
     */
    boundary?: HTMLElement;
    /**
     * Returns the current items in display order. Called on every measurement
     * pass so callers can refresh the snapshot after a render or items change.
     */
    getItems: () => OverflowItem[];
    /**
     * Returns the current trigger width in pixels. When the trigger is not
     * currently mounted (e.g. conditionally rendered before any overflow is
     * detected), return 0 and the manager falls back to `triggerWidthEstimate`
     * on the first pass.
     */
    getTriggerWidth: () => number;
    /**
     * Inline-end reservation (px) used on the FIRST measurement pass when
     * `getTriggerWidth()` returns 0. Prevents a flash where the first pass
     * "fits everything", then the trigger appears, then everything has to be
     * re-clipped. Defaults to 32 (an md icon-button width).
     */
    triggerWidthEstimate?: number;
    /**
     * Optional predicate: items returning `true` are never hidden (they always
     * stay in the visible region). Pinned tabs / pinned segments use this.
     */
    isPinned?: (id: string) => boolean;
    /**
     * Optional getter for the "promoted" item id -- typically the currently
     * selected item the consumer wants to keep in view. If the promoted id
     * would otherwise be hidden, the manager swaps it with the last visible
     * non-pinned item. Return `null` to disable promotion.
     */
    getPromotedId?: () => string | null;
    /**
     * Called whenever the hidden set changes. The Set contains the ids of
     * items currently hidden, in display order. The manager has already
     * applied the visibility styling to each affected element before calling.
     */
    onChange: (hidden: Set<string>) => void;
    /**
     * Optional override for how items are hidden / shown. The default sets
     * `visibility: hidden`, `position: absolute`, `pointer-events: none` when
     * hidden and clears those inline styles when visible. Provide a custom
     * implementation if you need a different strategy (CSS class toggle,
     * `display: none`, etc.).
     */
    setHidden?: (el: HTMLElement, hidden: boolean) => void;
}
export interface OverflowManager {
    /**
     * Re-measure on demand. Call after any operation that may have changed
     * the item set or layout without triggering the container's
     * `ResizeObserver` (e.g. items reordered via drag-and-drop, an item
     * removed, the trigger appearing for the first time, etc.).
     */
    refresh(): void;
    /**
     * Get the current set of hidden ids without re-measuring. Useful in tests
     * or for consumers that want a synchronous snapshot.
     */
    getHidden(): Set<string>;
    /**
     * Disconnect the `ResizeObserver`, cancel any pending raf, and reset all
     * item inline styles. Safe to call multiple times.
     */
    destroy(): void;
}
export declare function createOverflowManager(options: OverflowManagerOptions): OverflowManager;
//# sourceMappingURL=overflow-manager.d.ts.map