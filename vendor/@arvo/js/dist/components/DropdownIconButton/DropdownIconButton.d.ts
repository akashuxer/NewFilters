import { ArvoActionMenuOptions, MenuItemData } from '../ActionMenu/ActionMenu';
import { ListGroup } from '../../../../core/src';
import { IconButtonTooltipOption } from '../IconButton/IconButton';
import { MenuSearchProp } from '../../types/menu-search';
import { DropdownButtonOverlayFactory } from '../DropdownButton/DropdownButton';
export type { MenuItemData } from '../ActionMenu/ActionMenu';
/**
 * Scoped escape-hatch bag for inner `ArvoActionMenu` options that the
 * parent does not curate as a flat option. Mirrors the React
 * `DropdownIconButtonMenuProps` type exactly -- the drift checker
 * enforces key-set parity.
 */
export type DropdownIconButtonMenuProps = Pick<ArvoActionMenuOptions, 'actionsVisibility' | 'submenuTrigger'>;
export interface ArvoDropdownIconButtonOptions {
    icon?: string;
    /**
     * Tooltip content. Accepts a plain string (used as `aria-label` and tooltip
     * content) or a config object (`{ content, placement?, shortcut? }`).
     * Mirrors `ArvoIconButton`.
     */
    tooltip?: IconButtonTooltipOption;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isCompact?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    /**
     * Menu items passed through to the internal ArvoActionMenu. Required
     * for the default internal-menu composition; OPTIONAL (and ignored)
     * when an external `overlay` factory is supplied or in pure headless
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
    menuProps?: DropdownIconButtonMenuProps;
    /**
     * Optional external overlay factory. When supplied, the internal
     * ArvoActionMenu is NOT created/initialized; the factory is invoked
     * once at init with the trigger element. See ArvoDropdownButton's
     * `overlay` option for the full contract.
     */
    overlay?: DropdownButtonOverlayFactory;
    /**
     * Controlled open state for external-overlay / headless mode. When
     * boolean, mirrors the prop for chrome state and disables the
     * MutationObserver auto-sync path.
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
type RequiredOptions = Required<Omit<ArvoDropdownIconButtonOptions, 'onSelect' | 'onOpen' | 'onClose' | 'onOpenChange' | 'onClick' | 'onFocus' | 'onBlur' | 'maxHeight' | 'tooltip' | 'search' | 'menuProps' | 'overlay' | 'isOpen'>> & {
    search: MenuSearchProp | undefined;
    tooltip: IconButtonTooltipOption | null;
    maxHeight: string | null;
    menuProps: DropdownIconButtonMenuProps | null;
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
export declare class ArvoDropdownIconButton {
    private _element;
    private _options;
    private _actionMenu;
    private _externalOverlay;
    private _iconEl;
    private _caretEl;
    private _tooltipConnector;
    private _isOpen;
    private _isExternalMode;
    private _ariaExpandedObserver;
    private _boundHandleClick;
    private _boundHandleFocus;
    private _boundHandleBlur;
    private _boundHandleKeydown;
    static readonly VARIANTS: readonly ["primary", "secondary", "tertiary", "outline"];
    static readonly SIZES: readonly ["sm", "md", "lg"];
    static readonly DEFAULTS: RequiredOptions;
    static initialize(element: HTMLElement, options?: ArvoDropdownIconButtonOptions): ArvoDropdownIconButton;
    constructor(element: HTMLElement, options?: ArvoDropdownIconButtonOptions);
    private _connectTooltip;
    private _tooltipText;
    private _render;
    private _bindEvents;
    private _handleClick;
    private _handleFocus;
    private _handleBlur;
    private _handleKeydown;
    private _initActionMenu;
    private _initExternalOverlay;
    private _handleMenuSelect;
    private _dispatchEvent;
    open(): void;
    close(): void;
    toggle(force?: boolean): void;
    isOpen(): boolean;
    triggerElement(): HTMLElement | null;
    setOpenState(open: boolean): void;
    updateItems(items: MenuItemData[] | ListGroup<MenuItemData>[]): void;
    setIcon(iconName: string): void;
    setTooltip(tooltip: IconButtonTooltipOption | null): void;
    compact(state?: boolean): boolean | void;
    setVariant(variant: string): void;
    setSize(size: string): void;
    setLoading(isLoading: boolean): void;
    disabled(state?: boolean): boolean | void;
    focus(): void;
    destroy(): void;
}
//# sourceMappingURL=DropdownIconButton.d.ts.map