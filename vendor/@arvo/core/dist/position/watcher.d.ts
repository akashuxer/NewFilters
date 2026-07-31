import { PositionWatcherOptions, PositionWatcher, PositionResult, PositionUpdateSource } from './types';
/**
 * Resolver returning the live viewport-relative anchor on every compute.
 * Used by the virtual-anchor watcher so a context menu opened at a static
 * page-coord point can track the document as the user scrolls or zooms.
 */
export type VirtualAnchorProvider = () => {
    x: number;
    y: number;
};
/**
 * Manages ResizeObserver, scroll, and window-resize listeners that
 * automatically reposition a floating element relative to an anchor.
 * All reposition calls are deduplicated through `requestAnimationFrame`.
 *
 * Supports two anchor modes:
 *   - HTMLElement anchor -- ResizeObserver + scroll + window resize.
 *   - VirtualAnchorProvider (function) -- scroll + window resize only.
 *     The provider re-derives the live viewport-relative point on every
 *     compute, so consumers that captured a page-coord at open time (e.g.
 *     ArvoContextMenu pinning to the document point of the right-click)
 *     can let the document scroll/zoom underneath without losing the
 *     anchor.
 *
 * The watcher emits a `PositionUpdateSource` flag with every callback so
 * consumers can distinguish "the world changed" (`'full'` -- anchor /
 * container / scroll / resize) from "the float itself resized" (`'float-size'`).
 * Consumers that don't care about the source can simply ignore the second
 * argument; surfaces that want to lock placement on float-size updates
 * (e.g. ArvoActionMenu to prevent filter-induced flip flicker) inspect it.
 */
export declare function createPositionWatcher(anchor: HTMLElement | VirtualAnchorProvider, float: HTMLElement, options: PositionWatcherOptions, onUpdate: (result: PositionResult, source: PositionUpdateSource) => void): PositionWatcher;
//# sourceMappingURL=watcher.d.ts.map