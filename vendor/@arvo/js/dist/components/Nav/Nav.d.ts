import { ArvoDropdownIconButtonOptions } from '../DropdownIconButton/DropdownIconButton';
import { ArvoAvatarOptions } from '../Avatar/Avatar';
import { ArvoStatusOptions, ArvoStatusType } from '../Status/Status';
import { ArvoBadgeOptions, ArvoBadgeSemanticType } from '../Badge/Badge';
import { MenuItemData } from '../ActionMenu/ActionMenu';
export type { ArvoStatusType, ArvoBadgeSemanticType, MenuItemData };
export type ArvoNavSize = 'sm' | 'md' | 'lg';
/** Curated avatar config exposed on a NavItem -- size is parent-owned (xs). */
export interface ArvoNavItemAvatarConfig {
    variant?: ArvoAvatarOptions['variant'];
    name?: string;
    src?: string;
    icon?: string;
    colorMode?: ArvoAvatarOptions['colorMode'];
    semanticType?: ArvoAvatarOptions['semanticType'];
    customColor?: ArvoAvatarOptions['customColor'];
    tooltip?: string;
    alt?: string;
}
export interface NavItemAction {
    id: string;
    icon: string;
    tooltip: string;
    isDisabled?: boolean;
    /**
     * Click handler. The event is undefined when the action fires via
     * the overflow menu (no synthetic event available). Most consumers
     * can ignore the event arg.
     */
    onClick?: (event?: Event) => void;
}
export interface ArvoNavItemData {
    id: string;
    label: string;
    href?: string;
    target?: string;
    rel?: string;
    icon?: string;
    avatar?: ArvoNavItemAvatarConfig;
    status?: {
        type: ArvoStatusType;
        label?: string;
    };
    badge?: {
        message: string;
        semanticType?: ArvoBadgeSemanticType;
    };
    actions?: NavItemAction[];
    menuItems?: MenuItemData[];
    isPinned?: boolean;
    isPinnable?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    tooltip?: string;
    avatarProps?: Pick<ArvoAvatarOptions, 'appearance' | 'isInteractive' | 'alt'>;
    statusProps?: Pick<ArvoStatusOptions, 'icon'>;
    /**
     * Scoped escape-hatch bag for the inner ArvoBadge. The nav badge slot is
     * label-only by design -- `icon` and `hasBadgeIcon` are intentionally
     * excluded so the consumer cannot grow an icon glyph on a nav badge.
     */
    badgeProps?: Pick<ArvoBadgeOptions, 'colorMode' | 'customColor'>;
    menuProps?: NavMenuProps;
}
/**
 * Scoped escape-hatch bag for the per-row overflow trigger
 * `ArvoDropdownIconButton`. `isCompact` is parent-owned and excluded.
 */
export type NavMenuProps = Pick<ArvoDropdownIconButtonOptions, 'placement' | 'maxHeight' | 'hasGroupDividers' | 'search' | 'menuProps'>;
export declare const NAV_ITEM_MAX_INLINE_ACTIONS = 3;
export interface ArvoNavOptions {
    size?: ArvoNavSize;
    /**
     * Compact icon-only rail. When true, every NavItem renders only its
     * leading icon; label + metadata + trailing actions are hidden from
     * view but preserved as the accessible name (`aria-label`) and native
     * hover / focus `title` tooltip on the row's polymorphic root. Row
     * height still follows `size`. Consumed by `ArvoNavPanel` when the
     * panel is in compact mode.
     */
    isCompact?: boolean;
    items?: ArvoNavItemData[];
    selectedId?: string | null;
    defaultSelectedId?: string | null;
    hasPinning?: boolean;
    actionsVisibility?: 'hover' | 'always';
    isDisabled?: boolean;
    isLoading?: boolean;
    ariaLabel?: string;
    menuProps?: NavMenuProps;
    onSelect?: (detail: {
        id: string;
        item: ArvoNavItemData;
        index: number;
    }) => void;
    onPinChange?: (detail: {
        id: string;
        pinned: boolean;
        itemOrder: string[];
    }) => void;
    onAction?: (detail: {
        actionId: string;
        itemId: string;
        item: ArvoNavItemData;
    }) => void;
}
type RequiredOptions = Required<Omit<ArvoNavOptions, 'items' | 'selectedId' | 'defaultSelectedId' | 'menuProps' | 'onSelect' | 'onPinChange' | 'onAction'>> & {
    items: ArvoNavItemData[];
    selectedId: string | null;
    menuProps: NavMenuProps | null;
    onSelect: ((detail: {
        id: string;
        item: ArvoNavItemData;
        index: number;
    }) => void) | null;
    onPinChange: ((detail: {
        id: string;
        pinned: boolean;
        itemOrder: string[];
    }) => void) | null;
    onAction: ((detail: {
        actionId: string;
        itemId: string;
        item: ArvoNavItemData;
    }) => void) | null;
};
export declare class ArvoNav {
    private _element;
    private _options;
    private _listEl;
    private _indicatorEl;
    private _highlightEl;
    private _hasMeasured;
    private _entries;
    private _displayOrder;
    private _resizeObserver;
    private _boundHandleKeyDown;
    static readonly SIZES: readonly ["sm", "md", "lg"];
    static readonly DEFAULTS: RequiredOptions;
    static initialize(element: HTMLElement, options?: ArvoNavOptions): ArvoNav;
    constructor(element: HTMLElement, options?: ArvoNavOptions);
    /**
     * Render or re-render the nav. The wrapper classes / aria attributes
     * are always re-applied (they're cheap and reflect the current state)
     * but the inner item list uses a diff-based path: surviving items
     * keep their existing DOM nodes and inner Arvo instances, and only
     * the AFFECTED row's pin ToggleButton flips its `.active` class. This
     * is what stops every pin icon from animating whenever ANY pin
     * toggles -- mirrors the same fix applied to ArvoTabstrip.
     *
     * Focus on a surviving item row is preserved across rebuilds. If the
     * focused row was removed (e.g. removeItem) focus moves to the new
     * tab-stop row instead of being lost to <body>.
     */
    private _render;
    /**
     * Update the sliding active-row indicator + highlight. Writes the
     * active row's offsetTop / offsetHeight onto the list element as CSS
     * variables; the .scss rules use these to position and size the
     * absolute __indicator and __highlight elements. When no row is
     * selected the host gets the `--no-active` modifier (the elements
     * collapse to opacity 0).
     *
     * Called after every render and from a ResizeObserver on the list so
     * row geometry changes (font load, content reflow) keep the slider
     * aligned.
     */
    private _updateIndicator;
    /**
     * Patch a surviving entry to match the new item data without
     * destroying its DOM node or inner Arvo instances. Handles:
     *   - `active` / `is-disabled` / `is-pinned` / `is-loading` class flips
     *   - pin ToggleButton selected state + tooltip (no animation replay
     *     unless the pinned state actually changed)
     *   - aria-current / aria-pressed (anchor vs button polymorphism)
     *   - roving tabindex
     *   - label text + anchor href / target / rel
     *
     * For structural changes that can't be patched (e.g. an item gained
     * an avatar slot or transitioned between `actions` shapes) we fall
     * back to a fresh `_createItemEntry` so the entry stays consistent.
     * In practice the only field that flips dynamically across rebuilds
     * is `isPinned`, so the patch path covers the hot case.
     */
    private _patchItemEntry;
    /**
     * Destroy a single item entry (inner Arvo instances + DOM node).
     * Mirrors `_destroyInstances` but scoped to one entry so diff-based
     * rebuilds can tear down only the items that actually went away.
     */
    private _destroyItemEntry;
    private _createItemEntry;
    /**
     * Toggle the pinned state of the given item. Updates the model, fires
     * `nav:pin-change` + `onPinChange`, and re-renders the list so pinned
     * items rise to the top. Shared by the inline pin ToggleButton and the
     * public `pin()` setter.
     */
    private _togglePin;
    private _bindEvents;
    private _unbindEvents;
    private _handleClick;
    private _handleKeyDown;
    private _syncSelection;
    private _resolveTabStopId;
    private _dispatchEvent;
    /**
     * Dual-purpose getter/setter for the selected item id. Setter does NOT
     * fire nav:select -- use `select(id)` for the user-facing activation.
     */
    selected(): string | null;
    selected(id: string | null): void;
    /** Activate an item by id. Fires nav:select and onSelect. */
    select(id: string): void;
    /**
     * Dual-purpose getter/setter for an item's pin state. Setter rerenders
     * the list so pinned items rise to the top, and emits nav:pin-change.
     */
    pin(id: string): boolean;
    pin(id: string, state: boolean): void;
    setItems(items: ArvoNavItemData[]): void;
    addItem(item: ArvoNavItemData, index?: number): void;
    removeItem(id: string): void;
    disabled(): boolean;
    disabled(state: boolean): void;
    setLoading(loading: boolean): void;
    destroy(): void;
    private _destroyInstances;
}
export default ArvoNav;
//# sourceMappingURL=Nav.d.ts.map