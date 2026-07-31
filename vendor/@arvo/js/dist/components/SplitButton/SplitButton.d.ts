import { ArvoActionMenuOptions, MenuItemData } from '../ActionMenu/ActionMenu';
import { ListGroup } from '../../../../core/src';
import { MenuSearchProp } from '../../types/menu-search';
import { DropdownButtonOverlayFactory } from '../DropdownButton/DropdownButton';
export type { MenuItemData } from '../ActionMenu/ActionMenu';
/**
 * Scoped escape-hatch bag for inner `ArvoActionMenu` options the parent
 * does not curate as a flat option. Mirrors the React
 * `SplitButtonMenuProps` type exactly -- drift checker enforces parity.
 */
export type SplitButtonMenuProps = Pick<ArvoActionMenuOptions, 'actionsVisibility' | 'submenuTrigger'>;
/**
 * Re-export the DropdownButton overlay factory shape -- SplitButton uses the
 * same contract. The factory is invoked with the caret/trigger segment
 * element.
 */
export type SplitButtonOverlayFactory = DropdownButtonOverlayFactory;
export interface ArvoSplitButtonOptions {
    label?: string;
    variant?: 'primary' | 'secondary' | 'tertiary';
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
    isActionDisabled?: boolean;
    isTriggerDisabled?: boolean;
    isLoading?: boolean;
    /**
     * Menu items passed through to the internal ArvoActionMenu. Required
     * for the default internal-menu composition; OPTIONAL (and ignored)
     * when an external `overlay` factory is supplied or in pure-headless
     * mode.
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
    menuProps?: SplitButtonMenuProps;
    /**
     * Optional external overlay factory invoked once at init with the
     * CARET segment element. When supplied, the internal ArvoActionMenu
     * is NOT created. Selection mode falls back to action mode (with a
     * dev warning) when this is set.
     */
    overlay?: SplitButtonOverlayFactory;
    /**
     * Controlled open state for external-overlay / headless mode.
     * When boolean, drives chrome and disables the MutationObserver
     * auto-sync path.
     */
    isOpen?: boolean;
    /** Accessible label for the trigger (caret) segment. Default: "Show options". */
    triggerLabel?: string;
    onAction?: (event: Event, selectedItem: MenuItemData | null) => void;
    onSelect?: (item: MenuItemData, index: number) => boolean | void;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    onOpenChange?: (isOpen: boolean) => void;
    onFocus?: (event: FocusEvent) => void;
    onBlur?: (event: FocusEvent) => void;
}
type RequiredOptions = Required<Omit<ArvoSplitButtonOptions, 'onAction' | 'onSelect' | 'onOpen' | 'onClose' | 'onOpenChange' | 'onFocus' | 'onBlur' | 'maxHeight' | 'icon' | 'search' | 'defaultValue' | 'menuProps' | 'overlay' | 'isOpen'>> & {
    search: MenuSearchProp | undefined;
    icon: string | null;
    maxHeight: string | null;
    menuProps: SplitButtonMenuProps | null;
    overlay: SplitButtonOverlayFactory | null;
    isOpen: boolean | null;
    onAction: ((event: Event, selectedItem: MenuItemData | null) => void) | null;
    onSelect: ((item: MenuItemData, index: number) => boolean | void) | null;
    onOpen: (() => boolean | void) | null;
    onClose: (() => boolean | void) | null;
    onOpenChange: ((isOpen: boolean) => void) | null;
    onFocus: ((event: FocusEvent) => void) | null;
    onBlur: ((event: FocusEvent) => void) | null;
};
export declare class ArvoSplitButton {
    private _element;
    private _options;
    private _actionEl;
    private _triggerEl;
    private _iconEl;
    private _labelEl;
    private _caretEl;
    private _actionMenu;
    private _externalOverlay;
    private _selectedItemId;
    private _isOpen;
    private _isExternalMode;
    private _ariaExpandedObserver;
    private _activeSegment;
    private _boundHandleActionClick;
    private _boundHandleTriggerClick;
    private _boundHandleActionKeydown;
    private _boundHandleActionFocus;
    private _boundHandleActionBlur;
    private _boundHandleWrapperKeydown;
    private _boundHandleWrapperFocusin;
    static readonly VARIANTS: readonly ["primary", "secondary", "tertiary"];
    static readonly SIZES: readonly ["sm", "md", "lg"];
    static readonly DEFAULTS: RequiredOptions;
    static initialize(element: HTMLElement, options?: ArvoSplitButtonOptions): ArvoSplitButton;
    constructor(element: HTMLElement, options?: ArvoSplitButtonOptions);
    private _render;
    private _applySegmentDisabled;
    private _isActionDisabled;
    private _isTriggerDisabled;
    private _effectiveActiveSegment;
    private _applyRovingTabindex;
    private _setActiveSegment;
    private _focusSegment;
    private _bindEvents;
    private _handleActionClick;
    private _handleTriggerClick;
    private _handleActionKeydown;
    private _handleActionFocus;
    private _handleActionBlur;
    /**
     * Wrapper-level keydown -- composite-widget keyboard model.
     *
     * ArrowLeft / ArrowRight / Home / End move the rover between the action
     * and trigger segments (roving tabindex). ArrowDown / Alt+ArrowDown on
     * either segment opens the menu (focus-trap moves into the first item).
     * The open-menu shortcut works even if the trigger segment itself is
     * disabled, because the menu only needs the trigger element as an anchor
     * for positioning + focus return -- not as an interactive surface.
     *
     * In external mode ArrowDown synthesizes a click on the caret segment
     * so any click-trigger overlay opens; consumers using non-click overlays
     * should drive the open state via the controlled `isOpen` option.
     */
    private _handleWrapperKeydown;
    private _handleWrapperFocusin;
    private _initActionMenu;
    private _initExternalOverlay;
    private _getSelectedItem;
    private _getProcessedItems;
    private _handleSelect;
    private _resolveDisplayLabel;
    private _resolveDisplayIcon;
    private _updateDisplayLabelAndIcon;
    private _setRenderedIcon;
    private _applySelection;
    private _dispatchEvent;
    open(): void;
    close(): void;
    toggle(force?: boolean): void;
    isOpen(): boolean;
    /**
     * Returns the CARET (trigger) segment so a consumer-composed external
     * overlay can anchor against it. NOT the action segment -- using the
     * action segment as an overlay anchor would misalign the popover.
     * Returns null after destroy().
     */
    triggerElement(): HTMLElement | null;
    /**
     * Manually flip the wrapper's open chrome state. Idempotent -- no-op on
     * transitions to the current state. Called automatically when the wrapper
     * observes `aria-expanded` changes on the caret segment.
     */
    setOpenState(open: boolean): void;
    value(itemId?: string | number | null): MenuItemData | null | void;
    updateItems(items: MenuItemData[] | ListGroup<MenuItemData>[]): void;
    setLabel(text: string): void;
    setIcon(iconName: string | null): void;
    setVariant(variant: string): void;
    setSize(size: string): void;
    setLoading(loading: boolean): void;
    disabled(state?: boolean): boolean | void;
    actionDisabled(state?: boolean): boolean | void;
    triggerDisabled(state?: boolean): boolean | void;
    focus(): void;
    destroy(): void;
}
//# sourceMappingURL=SplitButton.d.ts.map