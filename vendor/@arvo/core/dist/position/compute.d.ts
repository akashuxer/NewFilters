import { PositionOptions, PositionResult } from './types';
/**
 * Calculates the position of a floating element relative to an anchor.
 *
 * Supports 12 named placements and `auto`, and returns:
 *  - `x` / `y` (document-absolute, includes scroll offsets) for `transform: translate()`
 *  - `placement` actually used (after collision-driven flips)
 *  - `maxHeight` so the consumer can clamp the panel into the boundary
 *  - `width` (when `width: 'anchor'` or an explicit value was requested)
 *
 * Placement selection is geometry-driven and STABLE across re-position
 * iterations: the chosen side depends only on the anchor and boundary
 * rects, never on the float's current rendered size. Without that
 * invariant, applying `maxHeight` resizes the float, which fires a
 * `ResizeObserver` callback that re-runs `computePosition` -- and if the
 * placement decision depended on the new (smaller) size, the loop could
 * oscillate forever.
 *
 * The float is also vertically clamped for left/right placements and
 * horizontally clamped for top/bottom, mirroring the existing horizontal
 * clamp so a panel anchored next to a corner of the viewport never extends
 * past the boundary edge (preventing the page's scroll area from growing).
 */
export declare function computePosition(anchor: HTMLElement | {
    x: number;
    y: number;
}, float: HTMLElement, options?: PositionOptions): PositionResult;
//# sourceMappingURL=compute.d.ts.map