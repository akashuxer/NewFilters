import { PanelShellInstance, PanelContent, ArvoPanelHeaderAction, ArvoPanelStickyHeaderConfig, ArvoPanelBannerConfig, ArvoPanelInfoConfig, ArvoPanelAction } from '../../../../utils/src';
export type ArvoSidePanelVariant = 'layout' | 'overlay';
export type ArvoSidePanelSide = 'left' | 'right';
/**
 * @deprecated Use `ArvoPanelOptions`. ArvoSidePanel will be removed in the
 * next major release.
 */
export interface ArvoSidePanelOptions {
    variant?: ArvoSidePanelVariant;
    side?: ArvoSidePanelSide;
    isPinnable?: boolean;
    isPinned?: boolean;
    defaultPinned?: boolean;
    onPinChange?: (pinned: boolean) => void;
    hasSplitter?: boolean | 'auto';
    width?: string | number;
    minWidth?: string | number;
    maxWidth?: string | number | null;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    closeOnEscape?: boolean;
    closeOnOutside?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    ariaLabel?: string;
    className?: string;
    title?: string | null;
    hasHeader?: boolean;
    hasBackButton?: boolean;
    onBack?: () => void;
    headerActions?: ArvoPanelHeaderAction[];
    stickyHeader?: ArvoPanelStickyHeaderConfig | false;
    /**
     * Custom body content -- an element to append, an HTML string, or a
     * callback that populates the body container. This is the generic content
     * seam (the panel does NOT ship a built-in item/list schema): build your
     * own markup and filter it yourself from the `sp:search` / `onSearchChange`
     * events. Mirrors `ArvoPopover`'s `content` option.
     */
    content?: PanelContent;
    actions?: ArvoPanelAction[] | false;
    hasFooter?: boolean;
    isClosable?: boolean;
    /**
     * Fired when the search query changes. `matchedCount` is `null` (the panel
     * does not own the content); compute and surface your own filtered count via
     * `setInfo()`.
     */
    onSearchChange?: (query: string, matchedCount: number | null) => void;
    /** Fired when a tab is selected. */
    onTabSelect?: (id: string) => void;
}
export type { ArvoPanelHeaderAction, ArvoPanelStickyHeaderConfig, ArvoPanelBannerConfig, ArvoPanelInfoConfig, ArvoPanelAction, };
export type ArvoSidePanelHeaderAction = ArvoPanelHeaderAction;
export type ArvoSidePanelStickyHeaderConfig = ArvoPanelStickyHeaderConfig;
export type ArvoSidePanelBannerConfig = ArvoPanelBannerConfig;
export type ArvoSidePanelInfoConfig = ArvoPanelInfoConfig;
export type ArvoSidePanelAction = ArvoPanelAction;
export declare class ArvoSidePanel {
    private _options;
    /** Stable id used to register with the overlay hub via the engine. */
    private readonly _overlayId;
    private _host;
    private _paneEl;
    private _splitterEl;
    private _splitterInstance;
    private _splitterResolved;
    private _resizedWidth;
    private _variant;
    private _side;
    private _isPinnedState;
    private _isOpenState;
    private _isDisabled;
    private _isLoading;
    /** Public for parity with React's PanelShellHandle delegate access. */
    shell: PanelShellInstance;
    private _pinBtn;
    private _pinBtnEl;
    private _surface;
    private _closingProgrammatically;
    private _escapeListener;
    private _outsideListener;
    private _shellEventBindings;
    private _destroyed;
    static initialize(element: HTMLElement, options?: ArvoSidePanelOptions): ArvoSidePanel;
    constructor(element: HTMLElement, options?: ArvoSidePanelOptions);
    open(): Promise<void>;
    close(): void;
    isOpen(): boolean;
    toggle(): void;
    pinned(): boolean;
    pinned(value: boolean): void;
    setVariant(variant: ArvoSidePanelVariant): void;
    /** Replace the custom body content. */
    setContent(content: PanelContent): void;
    /**
     * Update the sticky `__info` row in place (no sticky-region rebuild, so
     * search focus is preserved). Pass `false` to hide it. Use this to surface
     * a filtered-result message computed against your own custom content.
     */
    setInfo(config: ArvoPanelInfoConfig | false): void;
    setStickyHeader(config: ArvoPanelStickyHeaderConfig | false): void;
    /**
     * Replace header actions. The shell's `renderHeaderActions` re-positions
     * the pin slot via `insertPinSlot` on every render, so the pin button
     * stays correctly placed (between user actions and __close) without
     * additional work here.
     */
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
     * - Layout variant: dispatches sp:close but does NOT close the surface
     *   (layout panels are always visible).
     */
    private _handleClose;
    /**
     * Engine's onClose callback. Safety-net path: shouldn't fire under normal
     * operation since the component owns Escape + outside-click via
     * `closeOnEscape: false` + `closeOnOutside: false`.
     */
    private _handleEngineClose;
    private _buildPinButtonEl;
    private _resolveSplitter;
    /**
     * Re-resolves whether the splitter should be present and adds/removes the
     * `__splitter` element + side modifier class accordingly. Called whenever
     * the variant flips (pin/unpin or imperative `setVariant`) so `hasSplitter:'auto'`
     * stays in sync with the active variant.
     */
    private _reflowSplitter;
    private _buildSplitter;
    private _toNumericPx;
    private _applyClasses;
    private _applyAria;
    private _applyWidthVars;
    private _handlePinClick;
    private _setPinned;
    private _setupOverlayListeners;
    private _teardownOverlayListeners;
    private _wireShellEventReemit;
    private _teardownShellEventReemit;
}
export default ArvoSidePanel;
//# sourceMappingURL=SidePanel.d.ts.map