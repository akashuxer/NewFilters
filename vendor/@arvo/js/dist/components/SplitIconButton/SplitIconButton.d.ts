import { ArvoActionMenuOptions, MenuItemData } from '../ActionMenu/ActionMenu';
import { ListGroup } from '../../../../core/src';
import { IconButtonTooltipOption } from '../IconButton/IconButton';
import { MenuSearchProp } from '../../types/menu-search';
import { DropdownButtonOverlayFactory } from '../DropdownButton/DropdownButton';
export type { MenuItemData } from '../ActionMenu/ActionMenu';
/**
 * Scoped escape-hatch bag for inner `ArvoActionMenu` options the parent
 * does not curate as a flat option. Mirrors the React
 * `SplitIconButtonMenuProps` type exactly -- drift checker enforces
 * parity.
 */
export type SplitIconButtonMenuProps = Pick<ArvoActionMenuOptions, 'actionsVisibility' | 'submenuTrigger'>;
/** Re-export the DropdownButton overlay factory shape -- same contract. */
export type SplitIconButtonOverlayFactory = DropdownButtonOverlayFactory;
export interface ArvoSplitIconButtonOptions {
    icon?: string;
    /**
     * Required tooltip content for the action segment. Doubles as `aria-label`
     * because the action is icon-only. Accepts a plain string or a config
     * object (`{ content, placement?, shortcut? }`). Mirrors `ArvoIconButton`.
     */
    tooltip?: IconButtonTooltipOption;
    variant?: 'primary' | 'secondary' | 'tertiary';
    size?: 'sm' | 'md' | 'lg';
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
    menuProps?: SplitIconButtonMenuProps;
    /**
     * Optional external overlay factory invoked once at init with the
     * CARET segment element. When supplied, the internal ArvoActionMenu
     * is NOT created.
     */
    overlay?: SplitIconButtonOverlayFactory;
    /**
     * Controlled open state for external-overlay / headless mode.
     */
    isOpen?: boolean;
    /** Accessible label for the trigger (caret) segment. Default: "Show options". */
    triggerLabel?: string;
    onAction?: (event: Event) => void;
    onSelect?: (item: MenuItemData, index: number) => boolean | void;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    onOpenChange?: (isOpen: boolean) => void;
    onFocus?: (event: FocusEvent) => void;
    onBlur?: (event: FocusEvent) => void;
}
type RequiredOptions = Required<Omit<ArvoSplitIconButtonOptions, 'onAction' | 'onSelect' | 'onOpen' | 'onClose' | 'onOpenChange' | 'onFocus' | 'onBlur' | 'maxHeight' | 'icon' | 'tooltip' | 'search' | 'menuProps' | 'overlay' | 'isOpen'>> & {
    search: MenuSearchProp | undefined;
    icon: string;
    tooltip: IconButtonTooltipOption | null;
    maxHeight: string | null;
    menuProps: SplitIconButtonMenuProps | null;
    overlay: SplitIconButtonOverlayFactory | null;
    isOpen: boolean | null;
    onAction: ((event: Event) => void) | null;
    onSelect: ((item: MenuItemData, index: number) => boolean | void) | null;
    onOpen: (() => boolean | void) | null;
    onClose: (() => boolean | void) | null;
    onOpenChange: ((isOpen: boolean) => void) | null;
    onFocus: ((event: FocusEvent) => void) | null;
    onBlur: ((event: FocusEvent) => void) | null;
};
export declare class ArvoSplitIconButton {
    private _element;
    private _options;
    private _actionEl;
    private _triggerEl;
    private _iconEl;
    private _caretEl;
    private _actionMenu;
    private _externalOverlay;
    private _actionTooltipConnector;
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
    static initialize(element: HTMLElement, options?: ArvoSplitIconButtonOptions): ArvoSplitIconButton;
    constructor(element: HTMLElement, options?: ArvoSplitIconButtonOptions);
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
    private _handleWrapperKeydown;
    private _handleWrapperFocusin;
    private _initActionMenu;
    private _initExternalOverlay;
    private _handleSelect;
    private _connectActionTooltip;
    private _tooltipText;
    private _dispatchEvent;
    open(): void;
    close(): void;
    toggle(force?: boolean): void;
    isOpen(): boolean;
    /**
     * Returns the CARET (trigger) segment so a consumer-composed external
     * overlay can anchor against it. NOT the action segment. Returns null
     * after destroy().
     */
    triggerElement(): HTMLElement | null;
    setOpenState(open: boolean): void;
    updateItems(items: MenuItemData[] | ListGroup<MenuItemData>[]): void;
    setIcon(iconName: string): void;
    setVariant(variant: string): void;
    setSize(size: string): void;
    setLoading(loading: boolean): void;
    setTooltip(tooltip: IconButtonTooltipOption | null): void;
    disabled(state?: boolean): boolean | void;
    actionDisabled(state?: boolean): boolean | void;
    triggerDisabled(state?: boolean): boolean | void;
    focus(): void;
    destroy(): void;
}
//# sourceMappingURL=SplitIconButton.d.ts.map