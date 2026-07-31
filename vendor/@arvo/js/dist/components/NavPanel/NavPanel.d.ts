import { ArvoPanelHeaderAction, ArvoPanelStickyHeaderConfig, ArvoPanelAction, ArvoPanelMenuItem, ArvoPanelPlacement, ArvoPanelDisplayMode, ArvoPanelCloseReason } from '../../../../utils/src';
import { ArvoPanelRichHeaderConfig as PanelBaseRichHeaderConfig } from '../PanelBase/PanelBase';
import { ArvoNavOptions, ArvoNavItemData, ArvoNavSize } from '../Nav/Nav';
import { ArvoFabButtonOptions } from '../FabButton/FabButton';
import { ArvoStatusConfig } from '../Status/Status';
import { ArvoBadgeOptions } from '../Badge/Badge';
export type ArvoNavPanelRichHeaderConfig = PanelBaseRichHeaderConfig;
/** Narrowed placement enum -- ArvoNavPanel supports left / right only. */
export type ArvoNavPanelPlacement = Extract<ArvoPanelPlacement, 'left' | 'right'>;
export interface ArvoNavPanelOptions {
    displayMode?: ArvoPanelDisplayMode;
    placement?: ArvoNavPanelPlacement;
    isEdge?: boolean;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onOpen?: () => boolean | void;
    onClose?: (reason: ArvoPanelCloseReason) => boolean | void;
    isModal?: boolean;
    closeOnEscape?: boolean;
    closeOnOutsideClick?: boolean;
    container?: HTMLElement | (() => HTMLElement) | null;
    hasHeader?: boolean;
    title?: string | null;
    icon?: string;
    status?: Omit<ArvoStatusConfig, 'placement'>;
    badge?: Omit<Partial<ArvoBadgeOptions>, 'placement'>;
    hasBackButton?: boolean;
    onBack?: () => void;
    headerActions?: ArvoPanelHeaderAction[];
    hasOverflowMenu?: boolean;
    overflowMenuItems?: ArvoPanelMenuItem[];
    isPinnable?: boolean;
    isPinned?: boolean;
    defaultPinned?: boolean;
    onPinChange?: (pinned: boolean) => void;
    isDismissible?: boolean;
    richHeader?: ArvoNavPanelRichHeaderConfig | false;
    stickyHeader?: ArvoPanelStickyHeaderConfig | false;
    actions?: ArvoPanelAction[] | false;
    fab?: ArvoFabButtonOptions | false;
    isDisabled?: boolean;
    isLoading?: boolean;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
    className?: string;
    /**
     * Compact icon-only rail. When true, the panel width is derived from
     * `size` (sm=32px, md=40px, lg=48px) and every NavItem renders only
     * its leading icon; label + metadata are preserved as the accessible
     * name and native hover / focus tooltip.
     */
    isCompact?: boolean;
    /**
     * Nested Arvo Nav density. Cascades to every NavItem row height
     * (sm=32px, md=40px, lg=48px) and, when `isCompact=true`, drives the
     * compact rail width.
     */
    size?: ArvoNavSize;
    /** Nav destinations. Required unless `isLoading=true`. */
    items: ArvoNavItemData[];
    /** Controlled active destination id. */
    activeId?: string;
    /** Uncontrolled initial active destination id. */
    defaultActiveId?: string;
    /** Nav activation callback. */
    onActivate?: (detail: {
        id: string;
        item: ArvoNavItemData;
    }) => void;
    /** Escape-hatch bag applied to the inner ArvoNav (bag-first / flat-wins).
     *  `size` and `isCompact` are parent-owned and excluded. */
    navProps?: Pick<ArvoNavOptions, 'hasPinning' | 'actionsVisibility' | 'menuProps' | 'onPinChange' | 'onAction'>;
}
export declare class ArvoNavPanel {
    private _base;
    private _nav;
    private _navHostEl;
    private _items;
    private _currentQuery;
    private _searchKeys;
    private _getItemSearchText;
    private _unsubscribeSearch;
    private _destroyed;
    private _isCompact;
    private _size;
    /**
     * Icon-only rail widths for compact mode. Must stay in sync with the
     * `--arvo-nav-panel-compact-wmin-*` tokens in `_arvo-pnl.scss`. When
     * `isCompact=true` these override the PanelBase default 400px width
     * (which otherwise wins the cascade because PanelBase writes it as an
     * inline style on the host element).
     */
    private static readonly COMPACT_WIDTHS;
    static initialize(element: HTMLElement, options: ArvoNavPanelOptions): ArvoNavPanel;
    constructor(element: HTMLElement, options: ArvoNavPanelOptions);
    private _applyFilter;
    open(): void;
    close(reason?: ArvoPanelCloseReason): void;
    toggle(): void;
    isOpen(): boolean;
    pinned(): boolean;
    pinned(value: boolean): void;
    setDisplayMode(mode: ArvoPanelDisplayMode): void;
    setStickyHeader(config: ArvoPanelStickyHeaderConfig | false): void;
    setHeaderActions(actions: ArvoPanelHeaderAction[]): void;
    setActions(actions: ArvoPanelAction[] | false): void;
    setTitle(title: string | null): void;
    setIcon(icon: string | null): void;
    setRichHeader(config: ArvoNavPanelRichHeaderConfig | false): void;
    setItems(items: ArvoNavItemData[]): void;
    setActiveId(id: string | null): void;
    setCompact(compact: boolean): void;
    setSize(size: ArvoNavSize): void;
    /**
     * Sync the inline `--arvo-pnl-size` / `--arvo-pnl-min-size` /
     * `--arvo-pnl-max-size` variables on the host to the current
     * compact-vs-expanded state. When compact, all three are pinned to
     * the icon-rail width for the active `size`; when expanded, the
     * inline overrides are removed so PanelBase's own defaults win.
     */
    private _applyCompactSizeOverride;
    search(): string;
    search(query: string): void;
    selectedTab(): string | null;
    selectedTab(id: string): void;
    loading(): boolean;
    loading(state: boolean): void;
    disabled(): boolean;
    disabled(state: boolean): void;
    focus(target?: 'first' | 'title' | 'search' | 'list'): void;
    destroy(): void;
}
export default ArvoNavPanel;
//# sourceMappingURL=NavPanel.d.ts.map