/**
 * Pointer-driven panel translation.
 *
 * `createDragHandle` binds a `handle` element (typically a header) so that
 * pointer-drag gestures translate a `target` element. The current offset is
 * exposed via callbacks AND written to two CSS custom properties on the
 * target (`--arvo-drag-x`, `--arvo-drag-y` by default, overridable via the
 * `cssVar` option) so consumers can compose the translate however they need
 * (e.g. `translate(calc(-50% + var(--arvo-win-x, 0px)), ...)`).
 *
 * Bounds: the resulting offset is clamped so the target's bounding rect
 * stays inside the viewport (or a custom rect returned by
 * `bounds.getRect()`). The clamp accounts for the target's current rect at
 * the start of the drag.
 *
 * Excluded children: when the pointerdown event originates inside an
 * element matching `excludeSelector`, the drag does NOT start. Use this to
 * skip interactive header children (icon buttons, switches, badges).
 *
 * Keyboard: there is no keyboard interaction by design -- the consumer
 * component is responsible for any keyboard repositioning.
 *
 * Parallel to `createResizeHandle` in `../resize/resize-handle.ts`.
 */
export interface DragOffset {
    x: number;
    y: number;
}
export interface DragBoundsRect {
    /** Returns the bounding rect the target must stay inside. Polled on every pointer move. */
    getRect: () => DOMRect;
}
export interface DragHandleOptions {
    /** Element that initiates the drag (e.g. the window header). */
    handle: HTMLElement;
    /**
     * Element that is translated. Its `getBoundingClientRect()` is read on
     * pointerdown AND on every pointer move to keep the clamp accurate when
     * the page scrolls or the target resizes mid-drag.
     */
    target: HTMLElement;
    /**
     * CSS selector matched against the `pointerdown` target. When a match is
     * found (via `.closest()`), the drag does NOT start. Match is scoped to
     * the `handle` subtree.
     */
    excludeSelector?: string;
    /**
     * Bounds rectangle. `'viewport'` uses
     * `{ left:0, top:0, right: innerWidth, bottom: innerHeight }`; pass a
     * custom `{ getRect }` to clamp inside an app shell. Pass `null` to
     * disable clamping (unbounded drag). Default: `'viewport'`.
     */
    bounds?: 'viewport' | DragBoundsRect | null;
    /** Initial offset to seed `--arvo-drag-x` / `--arvo-drag-y`. Default `{ x: 0, y: 0 }`. */
    initialOffset?: DragOffset;
    /**
     * CSS custom property names written on the target during drag. Defaults
     * to `{ x: '--arvo-drag-x', y: '--arvo-drag-y' }`. Override per consumer
     * (e.g. ArvoWindow uses `--arvo-win-x` / `--arvo-win-y`).
     */
    cssVar?: {
        x: string;
        y: string;
    };
    /**
     * Class name toggled on the target while a drag is in progress. Default
     * `'dragging'`. Pass an empty string to disable.
     */
    draggingClass?: string;
    /** Called once on pointerdown when a drag begins. */
    onDragStart?: (event: PointerEvent) => void;
    /** Called continuously during drag with the current (clamped) offset. */
    onDrag?: (offset: DragOffset) => void;
    /** Called once on pointerup with the final (clamped) offset. */
    onDragEnd?: (offset: DragOffset) => void;
}
export interface DragHandleInstance {
    /** Whether a drag gesture is currently in progress. */
    isDragging: () => boolean;
    /** Returns the current offset. */
    offset: () => DragOffset;
    /** Programmatically set the offset (clamped against the current bounds and target rect). */
    setOffset: (next: DragOffset) => void;
    /** Reset the offset to `{ x: 0, y: 0 }`. */
    reset: () => void;
    /**
     * Detach the pointer listeners and remove the dragging class. The CSS
     * custom properties ARE preserved on the target so consumers that re-attach
     * (or unmount the target imminently) don't see a position jump. Call
     * `reset()` first if you want to clear the offset.
     */
    destroy: () => void;
}
export declare function createDragHandle(options: DragHandleOptions): DragHandleInstance;
//# sourceMappingURL=drag-handle.d.ts.map