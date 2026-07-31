import { ArvoActionMenuOptions, MenuItemData } from '../ActionMenu/ActionMenu';
import { ListGroup } from '../../../../core/src';
import { MenuSearchProp } from '../../types/menu-search';
export type { MenuItemData } from '../ActionMenu/ActionMenu';
/**
 * Scoped escape-hatch bag for inner `ArvoActionMenu` options that the
 * parent does not curate as a flat option. Mirrors the React
 * `DropdownButtonMenuProps` type exactly -- the drift checker enforces
 * key-set parity.
 *
 * Excludes parent-owned (`items`, `onSelect`, `onOpenChange`,
 * `isDisabled`) and already-flat (`placement`, `maxHeight`, `search`,
 * `hasGroupDividers`, `closeOnSelect`, `onOpen`, `onClose`) options. On
 * overlap, the parent's flat option wins.
 */
export type DropdownButtonMenuProps = Pick<ArvoActionMenuOptions, 'actionsVisibility' | 'submenuTrigger'>;
/**
 * Loose duck-typed shape of an external overlay instance returned by an
 * `overlay` factory. Every Arvo overlay (Popover, HybridPopover,
 * DropdownTree, ActionMenu, RichTooltip, OptionList) exposes some
 * subset of these methods -- we forward when the method exists, fall back
 * to a synthesized click otherwise.
 */
export interface ExternalOverlayInstance {
    destroy?: () => void;
    open?: () => void;
    close?: () => void;
    toggle?: (force?: boolean) => void;
}
export type DropdownButtonOverlayFactory = (trigger: HTMLElement) => ExternalOverlayInstance;
export interface ArvoDropdownButtonOptions {
    label?: string;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    icon?: string | null;
    mode?: 'action' | 'selection';
    displaySelected?: 'label' | 'value';
    value?: string | number | null;
    /**
     * Uncontrolled initial selected item id. Only consulted when `value` is
     * omitted. Mirrors the React `defaultValue` prop. Only meaningful when
     * `mode: 'selection'`.
     */
    defaultValue?: string | number | null;
    isDisabled?: boolean;
    isLoading?: boolean;
    /**
     * Menu items passed through to the internal ArvoActionMenu. Required
     * for the default internal-menu composition; OPTIONAL (and ignored)
     * when an external `overlay` factory is supplied or the wrapper is in
     * pure-headless mode.
     */
    items?: MenuItemData[] | ListGroup<MenuItemData>[];
    /** Enable search with defaults (`true`) or pass a config object. */
    search?: MenuSearchProp;
    placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
    maxHeight?: string;
    hasGroupDividers?: boolean;
    closeOnSelect?: boolean;
    /**
     * Escape hatch for inner `ArvoActionMenu` options the parent doesn't
     * expose flat. Bag-only keys (`actionsVisibility`,
     * `submenuTrigger`) flow through. On any conflict with a flat option,
     * the flat option wins.
     */
    menuProps?: DropdownButtonMenuProps;
    /**
     * Optional external overlay factory. When supplied, the internal
     * ArvoActionMenu is NOT created/initialized; the factory is invoked
     * once at init with the trigger element and the returned instance is
     * stored and destroyed on `destroy()`. The wrapper still owns chrome
     * state -- it observes the trigger's `aria-expanded` attribute (via
     * MutationObserver) and toggles `.open` + dispatches `dd-btn:open` /
     * `dd-btn:close` accordingly. Selection mode falls back to action
     * mode (with a dev warning) when an overlay factory is in use.
     */
    overlay?: DropdownButtonOverlayFactory;
    /**
     * Controlled open state for external-overlay / headless mode. When a
     * boolean is supplied, the wrapper mirrors it for chrome state. The
     * MutationObserver path is then disabled. In the default internal
     * ArvoActionMenu composition this is ignored (the menu drives state
     * itself).
     */
    isOpen?: boolean;
    onSelect?: (item: MenuItemData, index: number) => boolean | void;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    onOpenChange?: (isOpen: boolean) => void;
    onClick?: (event: Event) => void;
    onFocus?: (event: FocusEvent) => void;
    onBlur?: (event: FocusEvent) => void;
}
type RequiredOptions = Required<Omit<ArvoDropdownButtonOptions, 'onSelect' | 'onOpen' | 'onClose' | 'onOpenChange' | 'onClick' | 'onFocus' | 'onBlur' | 'maxHeight' | 'icon' | 'search' | 'defaultValue' | 'menuProps' | 'overlay' | 'isOpen'>> & {
    search: MenuSearchProp | undefined;
    icon: string | null;
    maxHeight: string | null;
    menuProps: DropdownButtonMenuProps | null;
    overlay: DropdownButtonOverlayFactory | null;
    isOpen: boolean | null;
    onSelect: ((item: MenuItemData, index: number) => boolean | void) | null;
    onOpen: (() => boolean | void) | null;
    onClose: (() => boolean | void) | null;
    onOpenChange: ((isOpen: boolean) => void) | null;
    onClick: ((event: Event) => void) | null;
    onFocus: ((event: FocusEvent) => void) | null;
    onBlur: ((event: FocusEvent) => void) | null;
};
export declare class ArvoDropdownButton {
    private _element;
    private _options;
    private _actionMenu;
    private _externalOverlay;
    private _iconEl;
    private _labelEl;
    private _caretEl;
    private _selectedItemId;
    private _isOpen;
    private _originalLabel;
    private _isExternalMode;
    private _ariaExpandedObserver;
    private _boundHandleClick;
    private _boundHandleFocus;
    private _boundHandleBlur;
    private _boundHandleKeydown;
    static readonly VARIANTS: readonly ["primary", "secondary", "tertiary", "outline"];
    static readonly SIZES: readonly ["sm", "md", "lg"];
    static readonly DEFAULTS: RequiredOptions;
    static initialize(element: HTMLElement, options?: ArvoDropdownButtonOptions): ArvoDropdownButton;
    constructor(element: HTMLElement, options?: ArvoDropdownButtonOptions);
    private _render;
    private _bindEvents;
    private _handleClick;
    private _handleFocus;
    private _handleBlur;
    private _handleKeydown;
    private _initActionMenu;
    private _initExternalOverlay;
    private _getProcessedItems;
    private _handleSelect;
    private _updateDisplayLabel;
    private _applySelection;
    private _dispatchEvent;
    /**
     * Open the menu / overlay.
     * - Internal mode: delegates to ArvoActionMenu.open().
     * - External mode with factory + open(): forwards to the overlay instance.
     * - Headless / factory without open(): synthesizes a click on the trigger.
     */
    open(): void;
    /**
     * Close the menu / overlay.
     * - Internal mode: delegates to ArvoActionMenu.close().
     * - External mode with factory + close(): forwards to the overlay instance.
     * - Headless without a close()-bearing instance: synthesizes a click
     *   on the trigger to toggle. Open click-trigger overlays close on a
     *   second click. Consumers using non-click overlays in pure headless
     *   mode should drive close via the controlled `isOpen` option.
     */
    close(): void;
    toggle(force?: boolean): void;
    isOpen(): boolean;
    /**
     * Returns the trigger element so a consumer-composed external overlay
     * can anchor against it (pass into ArvoPopover.initialize, etc.).
     * Returns null after destroy().
     */
    triggerElement(): HTMLElement | null;
    /**
     * Manually flip the wrapper's open chrome state. Idempotent -- no-op on
     * transitions to the current state. Called automatically when the wrapper
     * observes `aria-expanded` changes on the trigger.
     */
    setOpenState(open: boolean): void;
    value(itemId?: string | number | null): MenuItemData | null | void;
    updateItems(items: MenuItemData[] | ListGroup<MenuItemData>[]): void;
    setLabel(text: string): void;
    setIcon(iconName: string | null): void;
    setVariant(variant: string): void;
    setSize(size: string): void;
    setLoading(isLoading: boolean): void;
    disabled(state?: boolean): boolean | void;
    focus(): void;
    destroy(): void;
}
//# sourceMappingURL=DropdownButton.d.ts.map