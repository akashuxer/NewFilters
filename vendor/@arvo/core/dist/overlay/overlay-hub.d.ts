export interface OverlayConfig {
    containerSelector: string;
    positionMode: 'viewport' | 'container';
    zIndexBase: number;
    autoCloseOnRouteChange: boolean;
    autoCloseOnOutsideClick: boolean;
    maxStack: number;
    /**
     * When true the hub does NOT create/activate its own focus trap for a
     * modal-type entry. The component manages its own focus trap (e.g.
     * AlertDialog, Drawer, SidePanel trap their inner pane with bespoke
     * initial-focus / focus-restore behavior). Avoids the double-trap that
     * results when both the hub and the component trap the same surface.
     */
    managesOwnFocus?: boolean;
    /**
     * When true the hub does NOT paint its own `.arvo-backdrop` scrim for a
     * modal-type entry. The component renders its own mask via
     * `@arvo/core/mask` and positions it relative to the hub-assigned
     * z-index. Keeps a single scrim per overlay.
     */
    managesOwnBackdrop?: boolean;
    onOpen?: (id: string) => void;
    onClose?: (id: string) => void;
    onStackChange?: (stack: string[]) => void;
}
export type OverlayType = 'tooltip' | 'popover' | 'dropdown' | 'modal' | 'side-panel' | 'action-menu' | 'toast';
export type OverlayRelation = 'submenu' | 'inline';
export interface OverlayEntry {
    id: string;
    type: OverlayType;
    element: HTMLElement;
    triggerElement?: HTMLElement;
    priority: number;
    config: Partial<OverlayConfig>;
    onClose?: () => void;
    /** Parent overlay id when this entry is a nested submenu or inline child. */
    parentId?: string;
    /** Relationship to the parent overlay entry. */
    relation?: OverlayRelation;
    /**
     * Per-overlay z-index override. When set, the hub uses this value INSTEAD
     * of the computed `zIndexBase + stackIndex * 10`, but still clamps to
     * `parent.z + 10` (when a parent exists) to preserve tree-aware stacking.
     * Use cases: consumer apps with deep stacking contexts (e.g. embedded
     * inside a 3rd-party shell). Prefer `overlayHub.configure({ zIndexBase })`
     * for app-wide tuning; reach for this override only when a specific
     * surface needs to escape a higher stacking context than the rest of the
     * app.
     */
    zIndex?: number;
    /**
     * Optional component-owned mask/backdrop element. When attached (via
     * `attachMaskElement`), the hub keeps the mask's z-index pinned to
     * `surface.z - 1` on every stack change, so opening or closing a sibling
     * overlay never strands the mask at a stale z-index relative to its own
     * pane. Components that mount their own mask (Drawer, AlertDialog, Panel)
     * register the element here after `createMask().show()`.
     */
    maskElement?: HTMLElement;
    /**
     * Optional component-owned wrapper element that visually contains the
     * surface (the `element`) and creates a stacking context around it. When
     * attached (via `attachWrapperElement`), the hub keeps the wrapper's
     * z-index pinned to the SAME value as `entry.element` on every stack
     * change, so the wrapper's stacking context floats up to the hub-assigned
     * layer instead of trapping the surface beneath a default fallback
     * (e.g. `--arvo-z-popover: 1000`) inside its own context.
     *
     * Used by composing overlays that paint a viewport-spanning host wrapper
     * around their dialog/panel: `ArvoWindow`, `ArvoAlertDialog`. Without
     * this, the wrapper's CSS-declared z-index would establish a stacking
     * context that confines the panel even though the hub raised the panel's
     * z-index to a much higher consumer-configured base.
     */
    wrapperElement?: HTMLElement;
}
export interface OverlayHub {
    configure(config: Partial<OverlayConfig>): void;
    getConfig(): OverlayConfig;
    open(entry: OverlayEntry): void;
    close(id: string): void;
    closeAll(options?: {
        except?: string[];
    }): void;
    closeByType(type: OverlayEntry['type']): void;
    isOpen(id: string): boolean;
    getActive(): OverlayEntry[];
    getTopmost(): OverlayEntry | null;
    getContainer(): HTMLElement;
    getZIndex(id: string): number;
    /**
     * Attach a component-owned mask element to an open entry so the hub
     * keeps the mask z-index synced (`surface.z - 1`) across subsequent
     * stack changes. Idempotent. No-ops when the entry is not in the stack.
     * Pass `null` to detach.
     */
    attachMaskElement(id: string, element: HTMLElement | null): void;
    /**
     * Attach a component-owned wrapper element to an open entry so the hub
     * keeps the wrapper's z-index synced (`surface.z`, i.e. the SAME value
     * as `entry.element`) across subsequent stack changes. Idempotent.
     * No-ops when the entry is not in the stack. Pass `null` to detach.
     *
     * Use this when an overlay component paints a viewport-spanning host
     * wrapper around its surface (e.g. `ArvoWindow`, `ArvoAlertDialog`'s
     * `__panel` lives inside an outer flex-centered `.arvo-win` /
     * `.arvo-alert-dlg` root). The wrapper would otherwise establish a
     * stacking context from its SCSS-declared fallback z-index and trap
     * the hub-assigned panel z-index INSIDE that context -- causing the
     * surface to appear visually below sibling overlays that share the
     * document.body stacking context.
     */
    attachWrapperElement(id: string, element: HTMLElement | null): void;
    /**
     * Returns true when `target` should be treated as "inside" the given
     * root element for outside-click / outside-focus dismissal purposes.
     * The check includes:
     *
     *   1. The root element itself (`root.contains(target)`).
     *   2. Any currently-open overlay whose `triggerElement` is a DOM
     *      descendant of `root` -- the overlay is logically nested even
     *      when its panel is portaled elsewhere in the document (e.g. a
     *      dropdown menu opened from a popover header whose menu element
     *      is appended to `<body>`).
     *   3. Transitively, descendants of those nested overlays.
     *
     * Use this in any overlay-like surface's outside-click handler
     * (popover, drawer, side panel, picker, dialog) so that a click in a
     * portaled child overlay does NOT close the parent overlay.
     *
     * Returns `false` when `root` or `target` is null/undefined.
     */
    isOverlayClickInside(root: HTMLElement | null | undefined, target: Node | null | undefined): boolean;
}
export declare function createOverlayHub(): OverlayHub;
export declare const overlayHub: OverlayHub;
//# sourceMappingURL=overlay-hub.d.ts.map