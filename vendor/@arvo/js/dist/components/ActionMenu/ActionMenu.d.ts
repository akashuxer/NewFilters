import { ListItemBase, ListGroup, OverlayRelation } from '../../../../core/src';
import { ArvoPopoverActionConfig } from '../Popover/Popover';
import { HybridPopoverItem, HybridPopoverGroup } from '../HybridPopover/HybridPopover';
import { ArvoEmptyStateOptions } from '../EmptyState/EmptyState';
import { MenuSearchProp } from '../../types/menu-search';
export interface MenuItemAction {
    id: string;
    icon: string;
    ariaLabel?: string;
    isDisabled?: boolean;
    onClick?: (item: MenuItemData, event: Event) => boolean | void;
    inlinePopover?: MenuInlinePopoverConfig;
    inlineHybridPopover?: MenuInlineHybridPopoverConfig;
}
export interface MenuInlinePopoverConfig {
    title?: string;
    content: HTMLElement | string;
    actions?: ArvoPopoverActionConfig[];
    isClosable?: boolean;
    hasBackButton?: boolean;
    /**
     * Optional explicit width for the inline popover panel. CSS length string
     * (e.g. `"360px"`, `"50%"`) or a px number. Forwarded to the underlying
     * ArvoPopover instance; omitted by default (panel sizes to content).
     */
    width?: string | number;
    /**
     * Optional explicit height for the inline popover panel. CSS length string
     * or px number. Omitted by default (panel sizes to content).
     */
    height?: string | number;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    onBack?: () => void;
}
export interface MenuInlineHybridPopoverConfig {
    title?: string;
    variant?: 'multi' | 'single';
    items?: HybridPopoverItem[] | HybridPopoverGroup[];
    hasBackButton?: boolean;
    /**
     * Optional explicit width (px) for the inline hybrid popover panel.
     * Forwarded to the underlying ArvoHybridPopover instance; omitted by
     * default (uses the hybrid popover's default width).
     */
    width?: number;
    /**
     * Optional explicit height (px) for the inline hybrid popover panel.
     * Omitted by default (panel sizes to content).
     */
    height?: number;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    onBack?: () => void;
}
export interface MenuItemSwitch {
    checked: boolean;
    onChange?: (checked: boolean, item: MenuItemData) => void;
    ariaLabel?: string;
}
/**
 * Status indicator config for a menu item's trailing zone. A semantic key
 * maps to the matching `arvo-menu-item--status-*` modifier class; an explicit
 * `{ color }` object sets `--arvo-menu-item-status-color` inline so the dot
 * can take an arbitrary token-driven color.
 */
export type MenuItemStatus = 'success' | 'warning' | 'danger' | 'info' | {
    color: string;
};
export interface MenuItemData extends ListItemBase {
    shortcut?: string;
    /** Right-aligned meta value text rendered in the trailing zone before any actions / overflow / submenu chevron. */
    value?: string;
    /** Status indicator dot rendered in the trailing zone before meta / shortcut. */
    status?: MenuItemStatus;
    /**
     * When provided, the row is rendered as an `<a>` element (still
     * `role="menuitem"`). Must not be combined with `inlinePopover` /
     * `inlineHybridPopover` (the inline panel wins; warned in dev).
     */
    href?: string;
    /**
     * Anchor target. When `'_blank'`, the row also renders the `__external`
     * icon and adds `rel="noopener noreferrer"` plus an `aria-label` suffix
     * announcing "opens in a new window". Ignored unless `href` is set.
     */
    target?: '_self' | '_blank';
    destructive?: boolean;
    active?: boolean;
    submenu?: MenuItemData[];
    actions?: MenuItemAction[];
    inlinePopover?: MenuInlinePopoverConfig;
    inlineHybridPopover?: MenuInlineHybridPopoverConfig;
    switch?: MenuItemSwitch;
}
export type ActionMenuEmptyConfig = Pick<ArvoEmptyStateOptions, 'illustration' | 'title' | 'message' | 'secondaryAction'>;
export interface ArvoActionMenuOptions {
    items: MenuItemData[] | ListGroup<MenuItemData>[];
    isLoading?: boolean;
    /** Enable search with defaults (`true`) or pass a config object. */
    search?: MenuSearchProp;
    placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end' | 'auto';
    maxHeight?: string;
    hasGroupDividers?: boolean;
    actionsVisibility?: 'always' | 'hover';
    /**
     * Maximum number of trailing actions rendered inline per item. Any actions
     * beyond this cap are moved into an overflow `ArvoDropdownIconButton`
     * rendered inside the `__overflow` slot. Defaults to `4` per the spec.
     */
    actionsMaxVisible?: number;
    submenuTrigger?: 'hover' | 'click';
    closeOnSelect?: boolean;
    isDisabled?: boolean;
    /** Initial open state (uncontrolled). Mirrors React's `defaultOpen`. */
    defaultOpen?: boolean;
    /**
     * Initial open state seed (controlled-style). When `true` the menu opens on
     * initialize. After init, drive open/close via `open()` / `close()` /
     * `toggle()`. Mirrors React's `isOpen` for parity.
     */
    isOpen?: boolean;
    emptyConfig?: Partial<ActionMenuEmptyConfig>;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    onSelect?: (item: MenuItemData, index: number) => boolean | void;
    onOpenChange?: (isOpen: boolean) => void;
}
type RequiredActionMenuOptions = Required<Omit<ArvoActionMenuOptions, 'onOpen' | 'onClose' | 'onSelect' | 'onOpenChange' | 'maxHeight' | 'search' | 'emptyConfig' | 'defaultOpen' | 'isOpen'>> & {
    search: MenuSearchProp | undefined;
    maxHeight: string | null;
    emptyConfig: Partial<ActionMenuEmptyConfig> | null;
    defaultOpen: boolean;
    isOpen: boolean | null;
    onOpen: (() => boolean | void) | null;
    onClose: (() => boolean | void) | null;
    onSelect: ((item: MenuItemData, index: number) => boolean | void) | null;
    onOpenChange: ((isOpen: boolean) => void) | null;
};
export declare class ArvoActionMenu {
    private _element;
    private _options;
    private _panelEl;
    private _scrollEl;
    private _searchEl;
    private _searchInstance;
    private _searchCfg;
    private _isOpen;
    private _isDisabled;
    private _isLoading;
    private _activeIndex;
    private _query;
    private _arrowNav;
    private _surface;
    /**
     * Reason for an in-flight close. Set immediately before any path that
     * invokes `_surface.close()`; consumed by the engine's `onClose` to decide
     * whether to fire the cancellable `action-menu:close` custom event and the
     * `onClose` option callback. Engine-driven dismissal (outside-click,
     * Escape) leaves this as `null` and is silent (per EX-3 / EX-4 policy).
     */
    private _closeReason;
    private _panelId;
    private _flatItems;
    private _itemEls;
    private _truncationHandles;
    private _submenus;
    private _trailingActionInstances;
    private _overflowInstances;
    private _switchInstances;
    private _emptyStateInstance;
    private _inlinePanelStack;
    private _inlinePanelInstances;
    private _submenuTimer;
    private _inlinePanelTimer;
    private _isSubmenu;
    private _parentMenu;
    private _parentOverlayId;
    private _overlayRelation;
    private _boundHandleTriggerClick;
    private _boundHandleKeyDown;
    static readonly DEFAULTS: RequiredActionMenuOptions;
    static initialize(element: HTMLElement, options: ArvoActionMenuOptions): ArvoActionMenu;
    /** @internal Factory for nested submenu instances. */
    static _createSubmenu(element: HTMLElement, options: ArvoActionMenuOptions, parent: ArvoActionMenu): ArvoActionMenu;
    constructor(element: HTMLElement, options: ArvoActionMenuOptions, submenuContext?: {
        parent: ArvoActionMenu;
        parentOverlayId: string;
        relation: OverlayRelation;
    });
    private _buildSurface;
    /**
     * Returns the focus trap's ordered tab-cycle. While an inline-panel-stack
     * layer is open, the engine's trap should cycle within the top inline
     * layer's focusable elements only -- otherwise it cycles within the panel
     * shell (search input, items, trailing actions).
     */
    private _collectFocusableElements;
    private _handleSurfaceOpened;
    private _handleSurfaceClosed;
    private _buildPanel;
    private _buildPanelClasses;
    private _buildSearch;
    private _renderItems;
    private _updateSearchVisibility;
    private _renderLoadingSkeleton;
    private _renderEmptyState;
    private _renderItem;
    private _buildItemClasses;
    private _getFilteredItems;
    private _handleFilterSearch;
    private _handleFilterClear;
    private _updateSearchCounter;
    private _bindTriggerEvents;
    private _handleTriggerClick;
    private _handleKeyDown;
    private _handleHorizontalNav;
    private _getActiveRowActionButtons;
    private _setActiveIndex;
    private _focusListFromSearch;
    private _isSearchFocused;
    private _scrollIntoView;
    private _handleItemActivation;
    private _openSubmenu;
    private _closeSubmenus;
    private _closeAll;
    private _getOrCreateInlineStack;
    private _destroyInlineInstance;
    private _closeAllInlinePanels;
    private _popInlinePanel;
    private _openInlinePopover;
    private _openInlineHybridPopover;
    private _setupArrowNav;
    private _focusInitial;
    open(): void;
    close(): void;
    isOpen(): boolean;
    toggle(force?: boolean): void;
    updateItems(items: MenuItemData[] | ListGroup<MenuItemData>[]): void;
    setLoading(isLoading: boolean): void;
    disabled(state?: boolean): boolean | void;
    destroy(): void;
    private _destroyTrailingActions;
    private _destroySwitchInstances;
    private _destroyEmptyState;
    private _dispatchEvent;
}
export {};
//# sourceMappingURL=ActionMenu.d.ts.map