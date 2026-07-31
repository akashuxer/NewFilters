import { ArvoIconButtonStatusConfig } from '../IconButton/IconButton';
import { ArvoDropdownIconButtonOptions } from '../DropdownIconButton/DropdownIconButton';
import { ArvoBadgeSemanticType } from '../Badge/Badge';
import { ArvoStatusType } from '../Status/Status';
import { ArvoMessageAlertType } from '../MessageAlert/MessageAlert';
import { ArvoActionMenuOptions, MenuItemData } from '../ActionMenu/ActionMenu';
export type { ArvoBadgeSemanticType, ArvoStatusType, ArvoMessageAlertType, MenuItemData, ArvoIconButtonStatusConfig, };
export interface TabItem {
    id: string;
    label: string;
    panelId?: string;
    icon?: string;
    isDisabled?: boolean;
    pinned?: boolean;
    isClosable?: boolean;
    order?: number;
    tooltip?: string;
    /**
     * Explicit override for the tab's accessible name. When omitted, the
     * Tabstrip composes a name of the form
     * `"<label> tab[, selected][, <badge>][, <alertLabel>][, status: <statusLabel>][, pinned]"`
     * so screen-reader users hear inline-slot state alongside the label.
     */
    ariaLabel?: string;
    /**
     * Inline badge slot. Renders `ArvoBadge size="sm"` with `hasBadgeIcon`
     * forced to `false`. When `tooltip` is provided it forwards as the
     * badge's hover tooltip.
     */
    badge?: {
        label: string;
        semanticType?: ArvoBadgeSemanticType;
        tooltip?: string;
    };
    alert?: {
        label?: string;
        type?: ArvoMessageAlertType;
    };
    /**
     * Inline status slot. Always rendered at size `'sm'`. When `tooltip`
     * is provided it replaces `label` as the ArvoStatus hover tooltip
     * (`label` is still used for the composed accessible name).
     */
    status?: {
        label: string;
        type?: ArvoStatusType;
        tooltip?: string;
    };
    menuItems?: MenuItemData[];
    /**
     * Status overlay rendered on the per-tab pin action button.
     */
    pinActionStatus?: ArvoIconButtonStatusConfig | null;
    /** Same shape and rules as `pinActionStatus`, applied to the close button. */
    closeActionStatus?: ArvoIconButtonStatusConfig | null;
}
/**
 * Scoped escape-hatch bag for the per-tab `ArvoDropdownIconButton`. The
 * per-tab menu is always rendered with `isCompact: true`; the bag
 * intentionally excludes `isCompact`. Mirrors the React twin's
 * `TabstripMenuProps` exactly.
 */
export type TabstripMenuProps = Pick<ArvoDropdownIconButtonOptions, 'placement' | 'maxHeight' | 'hasGroupDividers' | 'search' | 'menuProps'>;
/**
 * Scoped escape-hatch bag for the overflow `ArvoActionMenu` ("More tabs").
 * `placement` is parent-owned (`bottom-end`) and intentionally excluded.
 */
export type TabstripOverflowMenuProps = Pick<ArvoActionMenuOptions, 'maxHeight' | 'hasGroupDividers' | 'search' | 'actionsVisibility'>;
export interface ArvoTabstripOptions {
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'lg';
    /** Default `'horizontal'`. */
    orientation?: 'horizontal' | 'vertical';
    tabs?: TabItem[];
    selectedId?: string | null;
    /**
     * Uncontrolled initial selected tab id. Only consulted when `selectedId`
     * is omitted. Mirrors the React `defaultSelectedId` prop.
     */
    defaultSelectedId?: string | null;
    /** Default `'automatic'` -- arrow keys also activate. `'manual'` -- only Enter/Space activate. */
    activationMode?: 'manual' | 'automatic';
    isFullWidth?: boolean;
    isClosable?: boolean;
    isPinnable?: boolean;
    isReorderable?: boolean;
    /** Show the bottom border rule. Default `true`. Horizontal only. */
    hasTabstripBorder?: boolean;
    /** Enable overflow detection and overflow dropdown. Default `true`. Horizontal only. */
    hasOverflow?: boolean;
    /** Show the Add-New button. Default `false`. Horizontal only. */
    hasAddButton?: boolean;
    /** Label for the Add-New button. Default `'Add New'`. */
    addButtonLabel?: string;
    isAddDisabled?: boolean;
    /** When tabs.length >= maxTabs the Add-New button is automatically disabled. */
    maxTabs?: number;
    /** Which tab to auto-select when the selected tab is removed. Default `'select-nearest'`. */
    closeBehavior?: 'select-previous' | 'select-next' | 'select-nearest';
    isDisabled?: boolean;
    isLoading?: boolean;
    /** Per-tab dropdown options. The per-tab dropdown is always compact. */
    menuProps?: TabstripMenuProps;
    /** Overflow menu options. */
    overflowMenuProps?: TabstripOverflowMenuProps;
    onSelect?: (detail: {
        id: string;
        index: number;
    }) => void;
    /**
     * Callback when a tab is closed (close button click, Delete/Backspace
     * on a focused closable tab, or `Close tab` / `Close other tabs` /
     * `Close tabs to the right` chosen from the per-tab action menu).
     * The Tabstrip OWNS the tab list and by DEFAULT removes the closed
     * tab from its internal `tabs` array AFTER this callback returns. The
     * consumer can cancel that default by:
     *   - returning `false` from this callback, OR
     *   - calling `event.preventDefault()` on the matching cancelable
     *     `tabs:close` CustomEvent.
     * Either signal suppresses the internal removal so the tab remains in
     * the strip (useful when the consumer wants to confirm a destructive
     * close, defer until a save, or fully own the data model).
     */
    onClose?: (detail: {
        id: string;
        index: number;
    }) => boolean | void;
    onPin?: (detail: {
        id: string;
        pinned: boolean;
        tabOrder: string[];
    }) => void;
    onTabAdd?: () => void;
    onTabReorder?: (tabs: TabItem[]) => void;
    onOverflowOpen?: () => void;
}
type RequiredOptions = Required<Omit<ArvoTabstripOptions, 'onSelect' | 'onClose' | 'onPin' | 'onTabAdd' | 'onTabReorder' | 'onOverflowOpen' | 'selectedId' | 'defaultSelectedId' | 'maxTabs' | 'menuProps' | 'overflowMenuProps'>> & {
    selectedId: string | null;
    maxTabs: number | undefined;
    menuProps: TabstripMenuProps | null;
    overflowMenuProps: TabstripOverflowMenuProps | null;
    onSelect: ((detail: {
        id: string;
        index: number;
    }) => void) | null;
    onClose: ((detail: {
        id: string;
        index: number;
    }) => boolean | void) | null;
    onPin: ((detail: {
        id: string;
        pinned: boolean;
        tabOrder: string[];
    }) => void) | null;
    onTabAdd: (() => void) | null;
    onTabReorder: ((tabs: TabItem[]) => void) | null;
    onOverflowOpen: (() => void) | null;
};
export declare class ArvoTabstrip {
    private _element;
    private _options;
    private _listEl;
    private _indicatorEl;
    private _rightClusterEl;
    private _overflowWrapperEl;
    private _overflowTriggerInstance;
    private _overflowMenuInstance;
    private _overflowBtnEl;
    private _addBtnWrapperEl;
    /** The current Add-New affordance. ArvoButton when there is room;
     *  ArvoIconButton when space-constrained (overflow active). */
    private _addBtnInstance;
    /**
     * Tracks the current Add-New affordance shape so we only rebuild the
     * inner button when the strip flips between expanded  compact, not
     * on every overflow recalculation.
     */
    private _addBtnIsCompact;
    private _dividerEl;
    private _tabs;
    private _displayOrder;
    private _hiddenTabIds;
    private _overflowMgr;
    private _sortable;
    private _indicatorResizeObserver;
    private _boundHandleKeyDown;
    private _boundHandleClick;
    private _boundHandleContextMenu;
    static readonly VARIANTS: readonly ["primary", "secondary"];
    static readonly SIZES: readonly ["sm", "lg"];
    static readonly DEFAULTS: RequiredOptions;
    static initialize(element: HTMLElement, options?: ArvoTabstripOptions): ArvoTabstrip;
    constructor(element: HTMLElement, options?: ArvoTabstripOptions);
    private _computeDisplayOrder;
    private _render;
    private _createTabEntry;
    /**
     * Toggle the tab's pinned state and emit the matching event / callback.
     * Shared by the inline ToggleButton, the Ctrl+P shortcut, the Pin /
     * Unpin entry in the per-tab action menu, and the row-level pin
     * action inside the strip-level overflow menu.
     *
     * Accepts either a TabItem reference or its id so callers that hold
     * stale references (e.g. menu-item closures that captured an old
     * `tabs` array) can pass an id and we always operate on the live
     * `_options.tabs` entry.
     */
    private _togglePin;
    /**
     * Close a tab. Dispatches the cancelable `tabs:close` CustomEvent and
     * invokes the `onClose` callback; both can suppress the internal
     * removal (event via `preventDefault()`, callback via `return false`).
     * When the close is NOT cancelled the Tabstrip removes the tab from
     * its own `tabs` array, falling back to the next enabled tab per
     * `closeBehavior` if the closed tab was selected.
     */
    private _closeTab;
    /**
     * Move a tab one slot, to the start, or to the end of its OWN group
     * (pinned / unpinned). Shared by the menu actions and the
     * Ctrl+Home / Ctrl+End shortcuts. The single-slot left/right path is
     * intentionally also routed through here so the menu and shortcuts
     * stay in lockstep (the in-flight drag-reorder one-slot shortcut is
     * still handled by `createSortableList` directly when a drag is
     * active).
     */
    private _moveTabBy;
    /**
     * Centralized dispatcher for the per-tab action menu. Consumer-supplied
     * items keep their own onClick / onSelect (already invoked by the menu
     * surface) -- we act only on the internal `__tabstrip:*` sentinels.
     */
    private _handleTabMenuSelect;
    /**
     * Open the tab's per-tab context menu. Prefers the visible dropdown
     * trigger (so the menu opens anchored to the visible affordance);
     * falls back to the hidden ArvoActionMenu mounted on tabs that only
     * have default actions.
     */
    private _openTabContextMenu;
    private _iconBtnSize;
    /**
     * Mount the Add-New affordance into `_addBtnWrapperEl`. When
     * `compact=true` it is an icon-only ArvoIconButton (used while
     * tabs are overflowing); otherwise it is the expanded labeled
     * ArvoButton. We tear down + recreate the inner instance whenever
     * the shape flips, but skip the rebuild when nothing changed so we
     * don't churn DOM on every overflow recalc.
     */
    private _mountAddButton;
    /** Sync the Add-New button's disabled state without rebuilding it. */
    private _refreshAddButtonState;
    private _destroyTabEntry;
    /**
     * Diff-rebuild the tab list. Tabs that survive across a rebuild
     * (pin/unpin, reorder, removeTab) keep their existing DOM nodes and
     * inner Arvo component instances -- we only:
     *  - rebuild entries that need new inner affordances (close button
     *    appearing/disappearing on (un)pin, menu items changing)
     *  - destroy entries for tabs that were removed from `_options.tabs`
     *  - move surviving entries to their new position in `_listEl`
     *
     * This is the key fix for the "all pin icons animate on every pin"
     * regression -- the old full-rebuild path tore down every entry and
     * recreated the ArvoToggleButton with `.active` already applied,
     * which kicked off the `arvo-toggle-grow` animation on every pinned
     * tab. With diff-based preservation only the AFFECTED toggle gets
     * its `.active` class flipped, so only its own animation runs.
     *
     * Focus is also preserved across rebuilds: if the user was focused
     * on a tab when the rebuild started, that tab keeps focus afterward
     * (or, if it was removed, focus follows the auto-selected next tab).
     */
    private _rebuildDisplay;
    /**
     * Decide whether an existing TabEntry can be patched in place to match
     * the new tab data, or whether its affordances have changed
     * structurally (close button appearing on unpin, hidden context menu
     * appearing because default actions changed, etc.) in which case we
     * fall back to a full destroy + recreate of that single entry.
     *
     * We intentionally KEEP the entry across pin toggles even though
     * `is-pinned` and the close-button slot may change -- those are
     * handled by `_patchTabEntry` so the pin ToggleButton instance (and
     * therefore the focus + animation state) is preserved.
     */
    private _canPatchEntry;
    /**
     * Patch the surviving entry to match the new tab data without
     * destroying the DOM node or its inner Arvo instances. Handles:
     *   - `is-pinned` / `is-disabled` class toggles
     *   - ToggleButton pin selected state (drives the icon swap)
     *   - close button add / remove on (un)pin transition
     *   - per-tab menu items refresh (Pin <-> Unpin entry, etc.)
     *   - inline slot data (icon / label / badge / status / alert)
     *   - aria-label recomposition
     */
    private _patchTabEntry;
    /**
     * Mount a fresh close button into an existing entry's actions cluster.
     * Used by `_patchTabEntry` when a tab transitions from pinned to
     * unpinned (the close button slot reappears).
     */
    private _mountCloseButton;
    /**
     * Destroy and detach the close button from an existing entry. Used by
     * `_patchTabEntry` when a tab transitions from unpinned to pinned.
     */
    private _unmountCloseButton;
    private _setupOverflowDetection;
    private _checkOverflow;
    private _setupSortable;
    private _teardownSortable;
    private _setupIndicatorObserver;
    private _updateIndicator;
    private _updateOverflowMenu;
    private _bindEvents;
    private _handleClick;
    private _handleKeyDown;
    /**
     * Right-click on a tab opens the SAME per-tab action menu as the
     * visible ellipsis dropdown / Shift+F10. We only call
     * `preventDefault()` when the tab has at least one composed action
     * so we don't suppress the native browser menu where it would be
     * useful (no actions = no replacement to show).
     */
    private _handleContextMenu;
    private _syncSelection;
    private _dispatchEvent;
    select(id: string): void;
    selectedId(): string | null;
    addTab(tab: TabItem, index?: number): void;
    removeTab(id: string): void;
    disabled(): boolean;
    disabled(state: boolean): void;
    setLoading(isLoading: boolean): void;
    destroy(): void;
}
//# sourceMappingURL=Tabstrip.d.ts.map