export type ResizeCorner = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
export interface ResizeRect {
    width: number;
    height: number;
}
export interface ResizeHandleOptions {
    /** Which corners to enable resize handles on. */
    corners: ResizeCorner[];
    /**
     * Minimum width and height. Enforced via clamp during pointer drag -- the
     * dragged dimension cannot fall below this value even if the user drags
     * past it.
     */
    min: ResizeRect;
    /**
     * Maximum width and height. May be a static rect or a function called on
     * every pointer move. The function form receives the target's current
     * bounding rect so consumers can compute viewport-derived caps such as
     * `viewportWidth - rect.left - viewportPadding`. Returning Infinity for a
     * dimension is allowed.
     */
    max: ResizeRect | ((rect: DOMRect) => ResizeRect);
    /** Called continuously during resize with the current dimensions. */
    onResize?: (rect: ResizeRect) => void;
    /** Called once when resize completes (pointerup). */
    onCommit?: (rect: ResizeRect) => void;
    /**
     * Minimum pixel distance from viewport edge to allow a corner handle.
     * Used by `updateVisibility()` to hide handles that would land too close
     * to (or past) the viewport edge. Default: 16.
     */
    viewportPadding?: number;
    /**
     * BEM block prefix for handle class names. The util writes
     * `${block}__handle` + `${block}__handle--{br|bl|tr|tl}` on each handle
     * so the shared `resize-handle` SCSS mixin (instantiated by the
     * consumer with the same block name) styles them. Defaults to
     * `'arvo-hpop'` for backward compatibility with HybridPopover. New
     * consumers (e.g. ArvoPopover) should pass their own block.
     */
    block?: string;
    /**
     * Optional override for the DOM node that hosts the handle elements.
     * Defaults to `target`. Use to scope handles inside a dedicated
     * positioning wrapper (e.g. `.arvo-popover__resize`).
     */
    host?: HTMLElement;
}
export interface ResizeHandleInstance {
    /** Create and append corner handle elements to the target. Returns the created elements. */
    mount: () => HTMLElement[];
    /** Remove corner handles and unbind all listeners. */
    destroy: () => void;
    /** Re-evaluate which corners are visible based on current viewport position. */
    updateVisibility: () => void;
    /** Whether a resize drag is currently in progress. */
    isResizing: () => boolean;
}
export declare function createResizeHandle(target: HTMLElement, options: ResizeHandleOptions): ResizeHandleInstance;
//# sourceMappingURL=resize-handle.d.ts.map