import { ResizeRect } from '../../../../core/src';
import { ArvoEmptyStateOptions, EmptyStateButtonAction } from '../EmptyState/EmptyState';
import { ArvoStatusType } from '../Status/Status';
import { ArvoBadgeOptions } from '../Badge/Badge';
import { MenuItemData } from '../ActionMenu/ActionMenu';
export interface ArvoPopoverActionConfig {
    id: string;
    label?: string;
    icon?: string;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
    action?: (event: Event) => boolean | void;
    isDisabled?: boolean;
}
interface ArvoPopoverHeaderActionBase {
    id: string;
    isDisabled?: boolean;
}
export interface ArvoPopoverHeaderActionBtn extends ArvoPopoverHeaderActionBase {
    type: 'btn';
    icon: string;
    label?: string;
    onClick?: () => void;
}
/**
 * Inline header action -- rendered as ArvoButton variant='inline', size='sm'.
 * Use for header CTAs like "Apply" or "More" where a text label is desired
 * instead of an icon-only tertiary button.
 */
export interface ArvoPopoverHeaderActionInline extends ArvoPopoverHeaderActionBase {
    type: 'inline';
    label: string;
    icon?: string;
    onClick?: () => void;
}
export interface ArvoPopoverHeaderActionDropdown extends ArvoPopoverHeaderActionBase {
    type: 'dropdown';
    icon: string;
    items: MenuItemData[];
    ariaLabel?: string;
    label?: string;
    placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
    onSelect?: (id: string) => void;
}
export interface ArvoPopoverHeaderActionSwitch extends ArvoPopoverHeaderActionBase {
    type: 'switch';
    label?: string;
    isChecked?: boolean;
    defaultChecked?: boolean;
    onChange?: (isChecked: boolean) => void;
}
export type ArvoPopoverHeaderActionConfig = ArvoPopoverHeaderActionBtn | ArvoPopoverHeaderActionInline | ArvoPopoverHeaderActionDropdown | ArvoPopoverHeaderActionSwitch;
/**
 * Alert glyph + color set rendered in the header-left when `hasAlert=true`.
 * See spec section 6.
 */
export type ArvoPopoverAlertType = 'positive' | 'warning' | 'negative' | 'block' | 'info';
/**
 * Curated subset of ArvoBadgeOptions exposed via the Popover's header
 * `badge` slot. The wiring layer forces `variant='label'`, `size='sm'`,
 * `placement='inline'`; everything else is consumer-controlled. Pass `null`
 * (default) to hide the badge.
 */
export type ArvoPopoverBadgeConfig = Pick<ArvoBadgeOptions, 'message' | 'semanticType' | 'icon' | 'hasBadgeIcon' | 'appearance' | 'colorMode' | 'customColor' | 'tooltip'>;
export type ArvoPopoverEmptyContentConfig = Pick<ArvoEmptyStateOptions, 'illustration' | 'title' | 'message' | 'secondaryAction'> & {
    secondaryAction?: EmptyStateButtonAction;
};
export interface ArvoPopoverOptions {
    variant?: 'space' | 'edge';
    placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end' | 'auto';
    title?: string;
    hasHeader?: boolean;
    isClosable?: boolean;
    hasBackButton?: boolean;
    /** Optional leading icon in the header-left (slot 3, after back + alert). */
    hasIcon?: boolean;
    /** Glyph name for the leading icon (without o9con- prefix). Required when hasIcon=true. */
    icon?: string | null;
    /** Optional decorative alert icon in the header-left (slot 2). aria-hidden. */
    hasAlert?: boolean;
    /** Semantic for the alert icon -- drives glyph + color. Defaults to 'warning'. */
    alertType?: ArvoPopoverAlertType;
    /** Optional inline ArvoStatus indicator after the title. */
    hasStatusIndicator?: boolean;
    /** Semantic for the status indicator. Forwarded to ArvoStatus. Defaults to 'available'. */
    statusType?: ArvoStatusType;
    /** Optional inline ArvoBadge slot after the status indicator. null hides it. */
    badge?: ArvoPopoverBadgeConfig | null;
    headerActions?: ArvoPopoverHeaderActionConfig[];
    stickyHeader?: HTMLElement | string | ((el: HTMLElement) => void) | null;
    /** Alias for {@link stickyHeader}. */
    stickyBody?: HTMLElement | string | ((el: HTMLElement) => void) | null;
    emptyContent?: ArvoPopoverEmptyContentConfig | null;
    content?: HTMLElement | string | ((el: HTMLElement) => void) | null;
    actions?: ArvoPopoverActionConfig[];
    /** Optional consumer-owned slot rendered on the left of the footer. */
    footerLeftSlot?: HTMLElement | string | ((el: HTMLElement) => void) | null;
    hasFooter?: boolean;
    width?: string | number | 'anchor' | null;
    offset?: number;
    trigger?: 'click' | 'hover' | 'focus';
    closeOnOutside?: boolean;
    hasArrow?: boolean;
    isLoading?: boolean;
    isInteractive?: boolean;
    isInline?: boolean;
    /** When true, renders a corner resize handle. Ignored when isInline=true. */
    isResizable?: boolean;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    onBack?: () => void;
    /** Fired continuously while the resize handle is dragged. */
    onResize?: (rect: ResizeRect) => void;
    /** Fired once when the resize drag ends. */
    onResizeCommit?: (rect: ResizeRect) => void;
}
type RequiredPopoverOptions = Required<Omit<ArvoPopoverOptions, 'onOpen' | 'onClose' | 'onBack' | 'onResize' | 'onResizeCommit' | 'stickyHeader' | 'stickyBody' | 'content' | 'emptyContent' | 'footerLeftSlot' | 'width' | 'icon' | 'badge'>> & {
    stickyHeader: HTMLElement | string | ((el: HTMLElement) => void) | null;
    content: HTMLElement | string | ((el: HTMLElement) => void) | null;
    emptyContent: ArvoPopoverEmptyContentConfig | null;
    footerLeftSlot: HTMLElement | string | ((el: HTMLElement) => void) | null;
    width: string | number | 'anchor' | null;
    icon: string | null;
    badge: ArvoPopoverBadgeConfig | null;
    onOpen: (() => boolean | void) | null;
    onClose: (() => boolean | void) | null;
    onBack: (() => void) | null;
    onResize: ((rect: ResizeRect) => void) | null;
    onResizeCommit: ((rect: ResizeRect) => void) | null;
};
export declare class ArvoPopover {
    private _element;
    private _options;
    private _panelEl;
    private _arrowEl;
    private _headerEl;
    private _bodyEl;
    private _footerEl;
    private _titleEl;
    private _stickyHeaderEl;
    private _closeBtnInstance;
    private _backBtnInstance;
    private _headerActionInstances;
    private _statusInstance;
    private _badgeInstance;
    private _emptyStateInstance;
    private _footerBtnInstances;
    private _footerLeftEl;
    private _footerActionsEl;
    private _footerFit;
    private _resizeHostEl;
    private _resizeHandle;
    private _footerVisible;
    private _surface;
    private _panelId;
    private _isOpen;
    private _closingProgrammatically;
    private _hoverOpenTimer;
    private _hoverCloseTimer;
    private _boundHandleTriggerClick;
    private _boundHandleTriggerPointerEnter;
    private _boundHandleTriggerPointerLeave;
    private _boundHandleTriggerFocus;
    private _boundHandleTriggerBlur;
    private _boundHandlePanelPointerEnter;
    private _boundHandlePanelPointerLeave;
    static readonly DEFAULTS: RequiredPopoverOptions;
    static initialize(element: HTMLElement, options?: ArvoPopoverOptions): ArvoPopover;
    constructor(element: HTMLElement, options?: ArvoPopoverOptions);
    private _mountResizeHandle;
    private _render;
    private _shouldRenderHeader;
    private _renderHeader;
    private _renderFooter;
    private _shouldShowFooter;
    private _renderBodyContent;
    private _buildPanelClasses;
    private _handleFooterAction;
    private _bindEvents;
    private _handleTriggerClick;
    private _handleTriggerPointerEnter;
    private _handleTriggerPointerLeave;
    private _handleTriggerFocus;
    private _handleTriggerBlur;
    private _handlePanelPointerEnter;
    private _handlePanelPointerLeave;
    private _clearHoverTimers;
    private _handleEngineClose;
    private _applyWidth;
    private _applyPosition;
    open(): void;
    close(): void;
    isOpen(): boolean;
    toggle(): void;
    renderBody(content: string | HTMLElement | ((el: HTMLElement) => void)): void;
    setLoading(isLoading: boolean): void;
    setFooterVisible(visible: boolean): void;
    updateFooterAction(actionId: string, props: {
        isDisabled?: boolean;
        icon?: string;
        label?: string;
    }): void;
    reposition(): void;
    destroy(): void;
}
export {};
//# sourceMappingURL=Popover.d.ts.map