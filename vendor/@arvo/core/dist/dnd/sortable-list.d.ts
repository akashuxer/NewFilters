export type SortableAxis = 'x' | 'y';
export interface SortableListOptions {
    /** CSS selector to identify draggable items within the container. */
    itemSelector: string;
    /** CSS selector for the drag handle within each item. If null, the whole item is the handle. */
    handleSelector: string | null;
    /**
     * Reorder axis. `'y'` (default) is the vertical-list pattern ArvoList uses;
     * `'x'` is the horizontal-strip pattern ArvoTabstrip uses. The axis drives
     * both the projection used to find the nearest target and the keyboard
     * shortcut bindings (ArrowUp/Down for `'y'`, ArrowLeft/Right for `'x'`).
     */
    axis?: SortableAxis;
    /**
     * Returns the group identifier for an item element.
     * Items with the same group can be reordered within that group.
     * Return null for ungrouped items (flat list).
     */
    getGroupOf?: (item: HTMLElement) => string | null;
    /** Whether items can be dragged across group boundaries. Default: false. */
    allowCrossGroup?: boolean;
    /**
     * Pointer movement threshold (in CSS px along the drag axis) before a
     * drag is actually initiated. A `pointerdown` by itself no longer flips
     * the item into the drag state -- the pointer must travel at least
     * this many pixels along the drag axis (with a small `0.5x` slack on
     * the cross axis) before the ghost class is applied and the floating
     * clone mounts. Used to distinguish a click on the item from a true
     * drag pickup. Default: `0` (legacy behavior -- drag starts immediately
     * on pointerdown so existing consumers like ArvoList stay unchanged).
     */
    dragThreshold?: number;
    /**
     * Fraction of a target item's drag-axis size the dragged source must
     * overlap before sibling displacement happens (sets the swap line at
     * `target.lead + size * overlapThreshold` instead of `target.lead +
     * size / 2`). Lower values feel "looser" -- the source pushes
     * neighbors aside as soon as it has moved into them by `~25%` rather
     * than crossing their midpoint. Clamped to `[0, 0.5]`. Default: `0.5`
     * (the historical midpoint behavior).
     */
    overlapThreshold?: number;
    /**
     * Lock the floating drag clone's cross-axis position to the container
     * instead of pinning it to the source's pickup viewport position.
     * Without this option a `position: fixed` clone keeps its initial
     * viewport position while the page (and container) scrolls underneath,
     * which makes the lifted item appear to drift off the strip on
     * vertical scroll during a horizontal drag. With this option the
     * clone's cross-axis edge is recomputed from the container's current
     * rect on every pointermove + on `scroll` events, so the clone tracks
     * the strip. Default: `false`.
     */
    lockCrossAxisToContainer?: boolean;
    /**
     * Return the drag-axis viewport coordinates the floating clone must
     * stay within for the given source item. The returned `min` / `max`
     * represent the leading and trailing edges (in CSS px from the viewport
     * origin along the active axis) -- the clone's leading edge is clamped
     * to `min` and its trailing edge to `max` so it can never visually
     * escape the source's allowed region. Use this together with
     * `getGroupOf` to keep dragged items inside their group's bounds
     * (e.g. an unpinned tab must not visually overlap pinned tabs nor the
     * trailing right-cluster). Called once on drag pickup and re-evaluated
     * on every pointermove + scroll. Return `null` to disable clamping for
     * the drag.
     */
    getDragBounds?: (item: HTMLElement) => {
        min: number;
        max: number;
    } | null;
    /** Called continuously as the dragged item moves, with preview indices. */
    onPreview?: (fromIndex: number, toIndex: number) => void;
    /** Called when a drag completes and item position is committed. */
    onCommit?: (fromIndex: number, toIndex: number, fromGroup: string | null, toGroup: string | null) => void;
    /** Called when a drag is cancelled (Escape, invalid drop, etc.). */
    onCancel?: () => void;
    /** CSS class applied to the source row during drag (the in-list ghost). Default: 'arvo-sortable--ghost'. */
    ghostClass?: string;
    /** CSS class applied to the cloned drag image that follows the pointer. Default: 'arvo-sortable--dragging'. */
    draggingClass?: string;
}
export interface SortableHandle {
    /** Clean up all listeners and DOM artifacts. */
    destroy: () => void;
    /** Whether a drag is currently in progress. */
    isDragging: () => boolean;
}
export declare function createSortableList(container: HTMLElement, options: SortableListOptions): SortableHandle;
//# sourceMappingURL=sortable-list.d.ts.map