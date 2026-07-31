import { ContextMenuAnchor, ContextMenuModality, ContextMenuRequest, Placement } from '../../../../core/src';
import { ContextMenuItem, ContextMenuItemGroup, ContextMenuItems } from '../../internal/menu';
import { ArvoEmptyStateOptions } from '../EmptyState/EmptyState';
export type ArvoContextMenuItem<TContext = unknown> = ContextMenuItem<TContext>;
export type ArvoContextMenuItemGroup<TContext = unknown> = ContextMenuItemGroup<TContext>;
export type ArvoContextMenuItems<TContext = unknown> = ContextMenuItems<TContext>;
export type ArvoContextMenuAnchor = ContextMenuAnchor;
export type ArvoContextMenuModality = ContextMenuModality;
export type ArvoContextMenuRequest<TContext = unknown> = ContextMenuRequest<TContext>;
/**
 * Curated empty-state surface for ArvoContextMenu. When provided AND the
 * resolved items list is empty, the menu opens with an `ArvoEmptyState`
 * block instead of declining the gesture. Without `emptyConfig`, an empty
 * items array preserves the browser's native context menu (per spec
 * section 6.3). Mirrors React's `ArvoContextMenuEmptyConfig`.
 */
export type ArvoContextMenuEmptyConfig = Pick<ArvoEmptyStateOptions, 'illustration' | 'title' | 'message' | 'secondaryAction'>;
export interface ArvoContextMenuSelectInfo<TContext = unknown> {
    item: ArvoContextMenuItem<TContext>;
    index: number;
    context: TContext;
    closeOnSelect: boolean;
}
export interface ArvoContextMenuOptions<TContext = unknown> {
    items: ArvoContextMenuItems<TContext> | ((context: TContext) => ArvoContextMenuItems<TContext>);
    contextSelector?: string;
    resolveContext?: (invoker: HTMLElement) => TContext;
    placement?: Placement;
    submenuTrigger?: 'hover' | 'click';
    closeOnSelect?: boolean;
    isDisabled?: boolean;
    longPressMs?: number;
    keyboard?: boolean;
    closeOnEscape?: boolean;
    closeOnOutside?: boolean;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    /**
     * Curated empty-state config. When set AND the resolved items array is
     * empty, the menu opens with an `ArvoEmptyState` block instead of
     * declining the gesture. Without `emptyConfig`, an empty items array
     * preserves the browser's native context menu.
     */
    emptyConfig?: Partial<ArvoContextMenuEmptyConfig>;
    onContextRequest?: (request: ArvoContextMenuRequest<TContext>) => boolean | void;
    onOpen?: (request: ArvoContextMenuRequest<TContext>) => boolean | void;
    onClose?: () => boolean | void;
    onSelect?: (info: ArvoContextMenuSelectInfo<TContext>) => void;
    onOpenChange?: (open: boolean) => void;
}
export declare class ArvoContextMenu<TContext = unknown> {
    private _target;
    private _options;
    private _controller;
    private _surface;
    private _menuContent;
    private _emptyStateInstance;
    private _scrollEl;
    private _panelEl;
    private _panelId;
    private _activeRequest;
    private _resolvedItems;
    /**
     * Used to differentiate programmatic close paths (which fire the
     * cancellable `context-menu:close` event + onClose callback) from
     * engine-driven dismissal (outside-click, hub Escape) which is silent.
     * Mirrors ArvoActionMenu's dismissal-source pattern.
     */
    private _closeSource;
    private _disabledLocal;
    /**
     * Window-capture pointerdown / mousedown listener that swallows
     * right-clicks inside the target while the menu is open. See
     * `_bindReanchorSuppressor` for the full rationale.
     */
    private _reanchorSuppressor;
    static initialize<TCtx = unknown>(element: HTMLElement, options: ArvoContextMenuOptions<TCtx>): ArvoContextMenu<TCtx>;
    constructor(target: HTMLElement, options: ArvoContextMenuOptions<TContext>);
    open(init?: ArvoContextMenuRequest<TContext> | {
        anchor: ArvoContextMenuAnchor;
        invoker?: HTMLElement;
        context?: TContext;
        modality?: ArvoContextMenuModality;
        originalEvent?: MouseEvent | KeyboardEvent | TouchEvent;
    }): void;
    close(): void;
    isOpen(): boolean;
    updateItems(items: ArvoContextMenuItems<TContext> | ((context: TContext) => ArvoContextMenuItems<TContext>)): void;
    disabled(state?: boolean): boolean;
    destroy(): void;
    private _bindController;
    private _resolveItems;
    private _normalizeRequest;
    private _openWithRequest;
    private _openSurface;
    private _destroyPanelContents;
    private _renderEmptyState;
    private _bindReanchorSuppressor;
    private _unbindReanchorSuppressor;
    private _ensurePanel;
    private _handleSurfaceClosed;
    private _buildSubmenuController;
    private _dispatch;
}
export default ArvoContextMenu;
//# sourceMappingURL=ContextMenu.d.ts.map