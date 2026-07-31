import { BasicInlineContent } from '../../../../core/src';
import { ArvoStatusType } from '../Status/Status';
import { ArvoBadgeVariant, ArvoBadgeAppearance, ArvoBadgeColorMode, ArvoBadgeSemanticType, ArvoBadgeCustomColor, ArvoBadgeCounterMode } from '../Badge/Badge';
import { ArvoBannerAlertType, ArvoBannerAlertRole } from '../BannerAlert/BannerAlert';
export type ArvoRichTooltipPlacement = 'top-start' | 'top-center' | 'top-end' | 'right-start' | 'right-center' | 'right-end' | 'bottom-start' | 'bottom-center' | 'bottom-end' | 'left-start' | 'left-center' | 'left-end';
export type ArvoRichTooltipTrigger = 'hover' | 'focus' | 'click' | 'manual';
export type ArvoRichTooltipCloseBehavior = 'escape' | 'outsideClick' | 'both' | 'manual';
export type ArvoRichTooltipActionKind = 'link' | 'buttonLink' | 'button';
export interface ArvoRichTooltipAction {
    id?: string;
    kind: ArvoRichTooltipActionKind;
    label: string;
    href?: string;
    onClick?: (event: Event) => void;
    icon?: string;
    isExternal?: boolean;
    isDisabled?: boolean;
}
export interface ArvoRichTooltipStatusConfig {
    type: ArvoStatusType;
    tooltip?: string;
    icon?: string;
    className?: string;
}
export interface ArvoRichTooltipBadgeConfig {
    variant?: ArvoBadgeVariant;
    appearance?: ArvoBadgeAppearance;
    colorMode?: ArvoBadgeColorMode;
    semanticType?: ArvoBadgeSemanticType;
    customColor?: ArvoBadgeCustomColor;
    message?: string;
    counterMode?: ArvoBadgeCounterMode;
    count?: number;
    total?: number | null;
    overflowCount?: number;
    hasBadgeIcon?: boolean;
    icon?: string | null;
    tooltip?: string | null;
    className?: string;
}
export interface ArvoRichTooltipBannerConfig {
    message: BasicInlineContent;
    type?: ArvoBannerAlertType;
    isDismissible?: boolean;
    role?: ArvoBannerAlertRole;
    onDismiss?: () => void;
    className?: string;
}
export interface ArvoRichTooltipOptions {
    isOpen?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    trigger?: ArvoRichTooltipTrigger;
    placement?: ArvoRichTooltipPlacement;
    offset?: number;
    maxWidth?: number | string | null;
    hasPointer?: boolean;
    title?: string | HTMLElement | null;
    status?: ArvoRichTooltipStatusConfig | null;
    badge?: ArvoRichTooltipBadgeConfig | null;
    banner?: ArvoRichTooltipBannerConfig | null;
    message?: BasicInlineContent | null;
    bodyContent?: HTMLElement | string | ((slot: HTMLElement) => void) | null;
    actions?: ArvoRichTooltipAction[];
    closeBehavior?: ArvoRichTooltipCloseBehavior;
    ariaLabel?: string | null;
    id?: string;
    onOpen?: (() => boolean | void) | null;
    onClose?: (() => boolean | void) | null;
}
interface ResolvedOptions {
    trigger: ArvoRichTooltipTrigger;
    placement: ArvoRichTooltipPlacement;
    offset: number;
    maxWidth: number | string | null;
    hasPointer: boolean;
    title: string | HTMLElement | null;
    status: ArvoRichTooltipStatusConfig | null;
    badge: ArvoRichTooltipBadgeConfig | null;
    banner: ArvoRichTooltipBannerConfig | null;
    message: BasicInlineContent | null;
    bodyContent: HTMLElement | string | ((slot: HTMLElement) => void) | null;
    actions: ArvoRichTooltipAction[];
    closeBehavior: ArvoRichTooltipCloseBehavior;
    ariaLabel: string | null;
    isOpen: boolean;
    isDisabled: boolean;
    isLoading: boolean;
    onOpen: (() => boolean | void) | null;
    onClose: (() => boolean | void) | null;
}
export declare class ArvoRichTooltip {
    private _element;
    private _options;
    private _panelEl;
    private _hdrEl;
    private _titleEl;
    private _hdrMetaEl;
    private _bodyEl;
    private _bannerWrapEl;
    private _msgEl;
    private _slotEl;
    private _footerEl;
    private _pointerEl;
    private _statusInstance;
    private _badgeInstance;
    private _bannerInstance;
    private _actionInstances;
    private _surface;
    private _panelId;
    private _titleId;
    private _isOpen;
    private _closingProgrammatically;
    private _suppressFocusOpen;
    private _suppressFocusOpenTimer;
    private _hoverOpenTimer;
    private _hoverCloseTimer;
    private _boundHandleTriggerClick;
    private _boundHandleTriggerPointerEnter;
    private _boundHandleTriggerPointerLeave;
    private _boundHandleTriggerFocus;
    private _boundHandleTriggerBlur;
    private _boundHandlePanelPointerEnter;
    private _boundHandlePanelPointerLeave;
    private _addedAriaDescribedBy;
    private _previousAriaDescribedBy;
    static readonly DEFAULTS: ResolvedOptions;
    static initialize(element: HTMLElement, options?: ArvoRichTooltipOptions): ArvoRichTooltip;
    constructor(element: HTMLElement, options?: ArvoRichTooltipOptions);
    private _render;
    private _shouldRenderHeader;
    private _renderHeader;
    private _renderBody;
    private _renderFooter;
    private _buildAction;
    private _shouldShowFooter;
    private _writeMessage;
    private _writeBodyContent;
    private _buildPanelClasses;
    private _writeTriggerAriaDescribedBy;
    private _removeTriggerAriaDescribedBy;
    private _bindTriggerEvents;
    private _unbindTriggerEvents;
    private _handleTriggerClick;
    private _handleTriggerPointerEnter;
    private _handleTriggerPointerLeave;
    private _handleTriggerFocus;
    private _handleTriggerBlur;
    private _handlePanelPointerEnter;
    private _handlePanelPointerLeave;
    private _clearHoverTimers;
    /**
     * If focus is currently inside the panel (user tabbed into a footer
     * action), move it back to the trigger before the panel unmounts so
     * keyboard users don't lose their focus context. Suppress our own
     * trigger-focus listener so the synthetic focus event doesn't
     * immediately reopen the tooltip we're trying to close.
     */
    private _restorePanelFocusToTrigger;
    private _handleEngineClose;
    private _dispatchOpenChange;
    open(): void;
    close(): void;
    toggle(): void;
    isOpen(): boolean;
    disabled(): boolean;
    disabled(value: boolean): void;
    setLoading(loading: boolean): void;
    setActions(actions: ArvoRichTooltipAction[]): void;
    renderMessage(content: BasicInlineContent): void;
    reposition(): void;
    get element(): HTMLDivElement | null;
    get triggerId(): string;
    private _destroyActionInstances;
    destroy(): void;
}
export {};
//# sourceMappingURL=RichTooltip.d.ts.map