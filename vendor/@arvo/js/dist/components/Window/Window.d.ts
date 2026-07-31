import { DragOffset } from '../../../../core/src';
import { ArvoSwitchOptions } from '../Switch/Switch';
import { ArvoBadgeOptions } from '../Badge/Badge';
import { ArvoStatusType } from '../Status/Status';
import { ArvoEmptyStateOptions } from '../EmptyState/EmptyState';
export type ArvoWindowSize = 'sm' | 'md' | 'lg' | 'xl';
export type ArvoWindowCloseReason = 'close-button' | 'primary' | 'secondary' | 'back' | 'programmatic';
export type ArvoWindowHeaderActionType = 'icon-button' | 'button' | 'dropdown-button' | 'dropdown-icon-button' | 'split-button' | 'split-icon-button' | 'switch';
export type ArvoWindowHeaderActionVariant = 'tertiary' | 'outline' | 'inline';
interface HeaderActionBase {
    id?: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    tooltip?: string;
}
export interface ArvoWindowHeaderIconButtonAction extends HeaderActionBase {
    type: 'icon-button';
    icon: string;
    variant?: 'tertiary' | 'outline';
    onClick?: (e: Event) => void;
}
export interface ArvoWindowHeaderButtonAction extends HeaderActionBase {
    type: 'button';
    label: string;
    icon?: string;
    variant?: ArvoWindowHeaderActionVariant;
    onClick?: (e: Event) => void;
}
export interface ArvoWindowHeaderDropdownButtonAction extends HeaderActionBase {
    type: 'dropdown-button';
    label: string;
    icon?: string;
    variant?: 'tertiary' | 'outline';
    items: unknown[];
    onSelect?: (item: unknown, index: number) => boolean | void;
}
export interface ArvoWindowHeaderDropdownIconButtonAction extends HeaderActionBase {
    type: 'dropdown-icon-button';
    icon?: string;
    variant?: 'tertiary' | 'outline';
    items: unknown[];
    onSelect?: (item: unknown, index: number) => boolean | void;
}
export interface ArvoWindowHeaderSplitButtonAction extends HeaderActionBase {
    type: 'split-button';
    label: string;
    icon?: string;
    variant?: 'tertiary' | 'outline';
    items: unknown[];
    onPrimaryClick?: (e: Event) => void;
    onSelect?: (item: unknown, index: number) => boolean | void;
}
export interface ArvoWindowHeaderSplitIconButtonAction extends HeaderActionBase {
    type: 'split-icon-button';
    icon: string;
    variant?: 'tertiary' | 'outline';
    items: unknown[];
    onPrimaryClick?: (e: Event) => void;
    onSelect?: (item: unknown, index: number) => boolean | void;
}
export interface ArvoWindowHeaderSwitchAction extends HeaderActionBase {
    type: 'switch';
    label?: string;
    isChecked?: boolean;
    defaultChecked?: boolean;
    onChange?: ArvoSwitchOptions['onChange'];
}
export type ArvoWindowHeaderAction = ArvoWindowHeaderIconButtonAction | ArvoWindowHeaderButtonAction | ArvoWindowHeaderDropdownButtonAction | ArvoWindowHeaderDropdownIconButtonAction | ArvoWindowHeaderSplitButtonAction | ArvoWindowHeaderSplitIconButtonAction | ArvoWindowHeaderSwitchAction;
export type ArvoWindowFooterActionType = 'button' | 'dropdown-button' | 'split-button';
export type ArvoWindowFooterActionSemantic = 'primary' | 'danger-primary';
export interface ArvoWindowFooterAction {
    id?: string;
    type?: ArvoWindowFooterActionType;
    semantic?: ArvoWindowFooterActionSemantic;
    label: string;
    icon?: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    /** Default true; return false from onClick to veto the close. */
    closeOnClick?: boolean;
    items?: unknown[];
    onPrimaryClick?: (e: Event) => void | false;
    onClick?: (e: Event) => void | false;
    onSelect?: (item: unknown, index: number) => boolean | void;
}
export type ArvoWindowEmptyContent = Pick<ArvoEmptyStateOptions, 'illustration' | 'title' | 'message' | 'primaryAction' | 'secondaryAction' | 'link' | 'isAnimated'>;
export type ArvoWindowBadgeConfig = Pick<ArvoBadgeOptions, 'message' | 'semanticType' | 'icon' | 'hasBadgeIcon' | 'appearance' | 'tooltip'>;
export interface ArvoWindowOptions {
    size?: ArvoWindowSize;
    title?: string;
    hasTitle?: boolean;
    hasHeader?: boolean;
    hasFooter?: boolean;
    hasIcon?: boolean;
    icon?: string;
    hasStatusIndicator?: boolean;
    statusType?: ArvoStatusType;
    badge?: ArvoWindowBadgeConfig | null;
    hasBackBtn?: boolean;
    backLabel?: string;
    onBack?: (e: Event) => void;
    closeLabel?: string;
    hasMaximize?: boolean;
    /** Initial maximized state. */
    isMaximized?: boolean;
    onMaximizeChange?: (maximized: boolean) => void;
    isDraggable?: boolean;
    onDragStart?: (e: PointerEvent) => void;
    onDragEnd?: (offset: DragOffset) => void;
    hasBackdrop?: boolean;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    headerActions?: ArvoWindowHeaderAction[];
    primaryAction?: ArvoWindowFooterAction | null;
    secondaryActions?: ArvoWindowFooterAction[];
    footerLeft?: string | HTMLElement | ((container: HTMLElement) => void);
    isEmptyState?: boolean;
    emptyContent?: ArvoWindowEmptyContent;
    content?: string | HTMLElement | ((container: HTMLElement) => void);
    isLoading?: boolean;
    isDisabled?: boolean;
    ariaLabel?: string;
    ariaDescribedBy?: string;
    container?: HTMLElement | string | null;
    onOpen?: () => boolean | void;
    onClose?: (detail: {
        reason: ArvoWindowCloseReason | string;
    }) => boolean | void;
}
export declare class ArvoWindow {
    private _options;
    private _rootEl;
    private _panelEl;
    private _headerEl;
    private _headerLeftEl;
    private _headerActionsEl;
    private _titleEl;
    private _bodyEl;
    private _footerEl;
    private _footerLeftEl;
    private _actionsEl;
    private _footerFit;
    private _backBtn;
    private _maxBtn;
    private _closeBtn;
    private _badgeInstance;
    private _statusInstance;
    private _headerActionInstances;
    private _headerActionWrappers;
    private _primaryBtn;
    private _secondaryBtns;
    private _emptyStateInstance;
    private _surface;
    private _drag;
    private _dragOffset;
    private _preMaximizeOffset;
    private _isOpen;
    private _isMaximized;
    private _isLoading;
    private _isDisabled;
    private _closingProgrammatically;
    private _windowId;
    private _titleId;
    private _bodyId;
    private _boundHandleKeyDown;
    static initialize(options: ArvoWindowOptions): ArvoWindow;
    constructor(options: ArvoWindowOptions);
    open(): void;
    close(reason?: ArvoWindowCloseReason | string): void;
    /**
     * Picker-silent close path for engine-driven triggers (Escape via this
     * component's own keydown listener, backdrop click via the mask's
     * onOutside). Does NOT call the user's `onClose` and does NOT dispatch
     * `win:close` -- those are reserved for the programmatic path. The root
     * teardown is chained off the engine's close Promise so it lands exactly
     * when the exit transition finishes (no racing setTimeout).
     */
    private _closeViaEngine;
    /**
     * Removes the root wrapper from the DOM after the exit transition has
     * fully resolved. Called exactly once per open/close cycle via the
     * engine's close() Promise -- never via a racing setTimeout.
     */
    private _finalizeClose;
    isOpen(): boolean;
    toggle(): void;
    title(): string;
    title(value: string): void;
    maximized(): boolean;
    maximized(value: boolean): void;
    renderBody(content: string | HTMLElement | ((container: HTMLElement) => void)): void;
    setSize(size: ArvoWindowSize): void;
    setLoading(loading: boolean): void;
    setHeaderActions(actions: ArvoWindowHeaderAction[]): void;
    setFooterActions(actions: {
        primary?: ArvoWindowFooterAction | null;
        secondary?: ArvoWindowFooterAction[];
    }): void;
    setEmptyContent(config: ArvoWindowEmptyContent | null): void;
    resetPosition(): void;
    destroy(): void;
    /**
     * Engine-driven onClose callback. Called synchronously inside
     * `surface.close()` regardless of who initiated the close.
     *
     * - When `close()` or `_closeViaEngine()` is the initiator, `_isOpen` is
     *   already `false` by the time we get here, so the early-return short-
     *   circuits and the Promise-chained `_finalizeClose` in the caller owns
     *   the teardown.
     * - When the overlay hub forcibly closes us (rare; e.g. a higher-priority
     *   modal opens), `_isOpen` is still `true`. We tear down picker-silent
     *   and schedule `_finalizeClose` to run just after the engine's exit
     *   transition completes (we have no Promise reference in that case).
     */
    private _handleEngineClose;
    private _handleKeyDown;
    private _attachDragHandle;
    private _detachDragHandle;
    private _normalizeOptions;
    private _validateAccessibleName;
    private _render;
    private _buildRootClasses;
    private _renderHeader;
    private _buildHeaderAction;
    private _renderBody;
    private _renderEmptyStateBody;
    private _destroyEmptyState;
    private _renderFooter;
    private _renderFooterActions;
    private _buildFooterAction;
    private _destroyHeaderActions;
    private _destroyFooterActions;
    private _resolveContainer;
    private _dispatchEvent;
}
export default ArvoWindow;
//# sourceMappingURL=Window.d.ts.map