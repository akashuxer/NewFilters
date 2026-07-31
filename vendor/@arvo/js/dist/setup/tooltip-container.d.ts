import { TooltipManager, TooltipPlacement } from '../../../core/src';
/**
 * Resolver for the visible tooltip content. A string is applied to every
 * matched anchor; a callback receives the specific anchor and can look up
 * per-row / per-cell text. Return `null` / `undefined` / `''` to suppress
 * the tooltip for that anchor (useful when the anchor has no descriptive
 * text and the caller doesn't want the default suppression logic).
 */
export type ArvoTooltipContainerContent = string | ((anchor: HTMLElement) => string | null | undefined);
/**
 * Resolver for the optional keyboard-shortcut hint. Same semantics as
 * {@link ArvoTooltipContainerContent}.
 */
export type ArvoTooltipContainerShortcut = string | ((anchor: HTMLElement) => string | null | undefined);
/**
 * One rule inside an {@link ArvoTooltipContainerOptions.entries} array. The
 * first entry whose `filter` matches (an ancestor of) the event target
 * wins.
 */
export interface ArvoTooltipContainerEntry {
    /**
     * CSS selector matched against descendants of the container. `closest()`
     * is used, so hovering / focusing a child of a matching ancestor
     * triggers the entry.
     */
    filter: string;
    /** Static string or per-anchor resolver. */
    content: ArvoTooltipContainerContent;
    /**
     * Preferred placement for this entry. Falls back to the container-level
     * `placement`, then the manager's `defaultPlacement`.
     */
    placement?: TooltipPlacement;
    /** Static string or per-anchor resolver for the optional shortcut hint. */
    shortcut?: ArvoTooltipContainerShortcut;
    /**
     * If `true`, the tooltip is suppressed unless the anchor's text is
     * visually truncated (i.e. `scrollWidth > clientWidth`). Use for
     * truncation-only affordances such as grid cells that only need a
     * tooltip when their text is clipped.
     */
    truncated?: boolean;
    /**
     * CSS selector run relative to the matched anchor to find the element
     * whose overflow is checked. Only used when `truncated` is `true`.
     * Defaults to the anchor itself. If provided and no descendant matches,
     * the tooltip is suppressed (mirroring the Kendo `textSelector`
     * behavior).
     */
    textSelector?: string;
}
export interface ArvoTooltipContainerOptions {
    /**
     * One or more rules that determine which descendants show a tooltip
     * and how. Rules are evaluated in the array order supplied; the FIRST
     * matching rule wins (same semantics as Kendo's `getConfigForTooltip`
     * iteration order). Must contain at least one entry.
     */
    entries: ArvoTooltipContainerEntry[];
    /**
     * Fallback placement applied when an entry doesn't specify its own.
     * If neither is set, the manager's `defaultPlacement` is used.
     */
    placement?: TooltipPlacement;
}
/**
 * Container-level tooltip adapter. Prefer per-element `ArvoTooltip` for
 * new code; use this class when a legacy codebase (Kendo etc.) already
 * expresses tooltip ownership at the container level and rewriting every
 * call site to per-element init is not practical.
 *
 * ```ts
 * const owner = ArvoTooltipContainer.initialize(
 *   document.querySelector('#grid')!,
 *   {
 *     entries: [
 *       {
 *         filter: '.grid-cell',
 *         truncated: true,
 *         content: (cell) => cell.textContent ?? '',
 *       },
 *       {
 *         filter: '.grid-action-btn',
 *         placement: 'top-center',
 *         content: (btn) => btn.getAttribute('aria-label') ?? '',
 *       },
 *     ],
 *   },
 * );
 * ```
 */
export declare class ArvoTooltipContainer {
    private _container;
    private _opts;
    private _manager;
    /** Anchor the tooltip is currently associated with (our bookkeeping). */
    private _currentAnchor;
    private _onMouseOver;
    private _onMouseOut;
    private _onFocusIn;
    private _onFocusOut;
    constructor(container: HTMLElement, options: ArvoTooltipContainerOptions, manager?: TooltipManager);
    static initialize(container: HTMLElement, options: ArvoTooltipContainerOptions, manager?: TooltipManager): ArvoTooltipContainer;
    /**
     * Merge new options into the container. `entries` may be swapped;
     * no listener rebind is required since delegation is scoped to the
     * container element itself.
     */
    update(patch: Partial<ArvoTooltipContainerOptions>): void;
    /**
     * Remove all listeners and hide the tooltip if it is currently
     * associated with this container's anchor. The shared tooltip DOM
     * element and singleton manager stay alive for other consumers.
     */
    destroy(): void;
    private _bind;
    private _unbind;
    /**
     * Resolve the first entry whose `filter` selector matches an ancestor
     * of `target` inside this container. First-wins mirrors Kendo's
     * `getConfigForTooltip` iteration order and is documented as the
     * public semantic contract.
     */
    private _resolveEntry;
    /**
     * Truncation gate. Returns true when the entry opts into truncation
     * but the resolved text element isn't actually clipped -- caller
     * should skip the show.
     */
    private _isTruncationSuppressed;
    private _showFor;
    private _handleMouseOver;
    private _handleMouseOut;
    private _handleFocusIn;
    private _handleFocusOut;
    /** The container element this adapter is attached to. */
    get element(): HTMLElement;
}
//# sourceMappingURL=tooltip-container.d.ts.map