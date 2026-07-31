import { PanelShellInstance, PanelContent, ArvoPanelHeaderAction, ArvoPanelStickyHeaderConfig, ArvoPanelBannerConfig, ArvoPanelInfoConfig, ArvoPanelAction } from '../../../../utils/src';
/**
 * Drawer side. Run 5 of the feedback/overlays refactor dropped `top` and
 * `bottom` to align Drawer with the design system's left/right-only spec;
 * passing either falls back to `right` with a one-shot dev warning.
 */
export type ArvoDrawerSide = 'left' | 'right';
export type ArvoDrawerCloseReason = 'escape' | 'mask-click' | 'close-button' | 'programmatic';
/**
 * Mask config for the Drawer scrim. The shared `@arvo/core/mask` overlay
 * primitive paints a single canonical scrim with a fixed background color
 * and `backdrop-filter: blur(4px)`. Pass `true` for defaults or an object
 * to control dismiss behavior.
 */
export interface ArvoDrawerMaskConfig {
    /**
     * When true, clicking the mask closes the drawer (default true). This is
     * an alias of the parent `closeOnOutsideClick` / `closeOnMaskClick` and
     * applies regardless of whether a mask is rendered.
     */
    closeOnClick?: boolean;
}
/**
 * @deprecated Use `ArvoPanelOptions`. ArvoDrawer will be removed in the next
 * major release.
 */
export interface ArvoDrawerOptions {
    side?: ArvoDrawerSide;
    container?: HTMLElement | (() => HTMLElement) | null;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onOpen?: () => boolean | void;
    onClose?: (reason: ArvoDrawerCloseReason) => boolean | void;
    hasMask?: boolean | ArvoDrawerMaskConfig;
    closeOnEscape?: boolean;
    /**
     * Whether clicking outside the drawer pane closes it. Defaults to `true`
     * and applies in BOTH masked and mask-less configurations -- the prop
     * controls dismissal behavior, not whether a scrim is painted. The
     * legacy `closeOnMaskClick` name is preserved for source compatibility;
     * `closeOnOutsideClick` is the new canonical name.
     */
    closeOnOutsideClick?: boolean;
    /** @deprecated Use `closeOnOutsideClick`; both are honored, this is the older name. */
    closeOnMaskClick?: boolean;
    lockScroll?: boolean | 'auto';
    width?: string | number;
    minWidth?: string | number;
    maxWidth?: string | number;
    height?: string | number | null;
    animationDuration?: number;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    className?: string;
    isClosable?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    title?: string | null;
    hasHeader?: boolean;
    hasBackButton?: boolean;
    onBack?: () => void;
    headerActions?: ArvoPanelHeaderAction[];
    stickyHeader?: ArvoPanelStickyHeaderConfig | false;
    /**
     * Custom body content -- an element to append, an HTML string, or a
     * callback that populates the body container. This is the generic content
     * seam (the drawer does NOT ship a built-in item/list schema): build your
     * own markup and filter it yourself from the `drw:search` / `onSearchChange`
     * events. Mirrors `ArvoPopover`'s `content` option.
     */
    content?: PanelContent;
    /**
     * Fired when the search query changes. `matchedCount` is `null` (the drawer
     * does not own the content); compute and surface your own filtered count via
     * `setInfo()`.
     */
    onSearchChange?: (query: string, matchedCount: number | null) => void;
    /** Fired when a tab is selected. */
    onTabSelect?: (id: string) => void;
    actions?: ArvoPanelAction[] | false;
    hasFooter?: boolean;
}
export type { ArvoPanelHeaderAction, ArvoPanelStickyHeaderConfig, ArvoPanelBannerConfig, ArvoPanelInfoConfig, ArvoPanelAction, };
export declare class ArvoDrawer {
    private _options;
    /** Stable id used to register with the overlay hub via the engine. */
    private readonly _overlayId;
    /** Consumer-provided marker element. NOT used as the visual root. */
    private _markerEl;
    /** The portaled `.arvo-drw` host (built by this class, appended to container). */
    private _host;
    private _paneEl;
    private _container;
    private _side;
    private _mask;
    private _closeOnEscape;
    private _lockScrollResolved;
    private _isOpenState;
    private _isDisabled;
    private _isLoading;
    /** Public for parity with React's PanelShellHandle delegate access. */
    shell: PanelShellInstance;
    private _surface;
    private _closingProgrammatically;
    private _escapeListener;
    private _outsideClickListener;
    private _shellEventBindings;
    private _destroyed;
    static initialize(element: HTMLElement, options?: ArvoDrawerOptions): ArvoDrawer;
    constructor(element: HTMLElement, options?: ArvoDrawerOptions);
    open(): Promise<void>;
    close(reason?: ArvoDrawerCloseReason): void;
    toggle(): void;
    isOpen(): boolean;
    /** Replace the custom body content. */
    setContent(content: PanelContent): void;
    /**
     * Update the sticky `__info` row in place (no sticky-region rebuild, so
     * search focus is preserved). Pass `false` to hide it. Use this to surface
     * a filtered-result message computed against your own custom content.
     */
    setInfo(config: ArvoPanelInfoConfig | false): void;
    setStickyHeader(config: ArvoPanelStickyHeaderConfig | false): void;
    setHeaderActions(actions: ArvoPanelHeaderAction[]): void;
    setActions(actions: ArvoPanelAction[] | false): void;
    updateAction(id: string, patch: Partial<ArvoPanelHeaderAction | ArvoPanelAction>): void;
    search(): string;
    search(query: string): void;
    selectedTab(): string | null;
    selectedTab(id: string): void;
    setTitle(title: string | null): void;
    loading(): boolean;
    loading(state: boolean): void;
    disabled(): boolean;
    disabled(state: boolean): void;
    focus(target?: 'first' | 'title' | 'search' | 'list'): void;
    destroy(): void;
    private _createSurface;
    /**
     * Unified close handler.
     * - Programmatic path (`fromEngine: false`): user `onClose` can veto.
     * - Engine path (`fromEngine: true`): user `onClose` notified, veto ignored.
     */
    private _handleClose;
    /**
     * Engine's onClose callback. Safety-net path: shouldn't fire under normal
     * operation since the component owns Escape + outside-click via
     * `closeOnEscape: false` + `closeOnOutside: false`.
     */
    private _handleEngineClose;
    /** Mask `onOutside` callback -- dispatches `drw:mask-click` then closes. */
    private _handleMaskOutside;
    private _applyClasses;
    private _applyStyleVars;
    private _applyAria;
    private _setupEscapeListener;
    private _teardownEscapeListener;
    private _setupOutsideClickListener;
    private _teardownOutsideClickListener;
    private _wireShellEventReemit;
    private _teardownShellEventReemit;
}
export default ArvoDrawer;
//# sourceMappingURL=Drawer.d.ts.map