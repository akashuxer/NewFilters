import { ContextMenuItem, ContextMenuItems } from './types';
export interface MenuContentSelectInfo<TContext = unknown> {
    item: ContextMenuItem<TContext>;
    index: number;
    context: TContext;
    /** `true` for default close-on-select; `false` for checkbox/radio toggles. */
    closeOnSelect: boolean;
}
/**
 * Callback the caller supplies to create a nested submenu surface. The
 * caller is responsible for building the panel DOM, wiring
 * `createOverlaySurface` with `parentId + relation: 'submenu'`, and
 * returning a controller the MenuContent can `open` / `close` / `destroy`.
 *
 * The MenuContent does NOT mount nested surfaces itself because surface
 * mechanics (DOM placement, hub config, ARIA) belong to the host
 * component. This keeps the menu-content primitive purely
 * content-focused and lets the caller (`ArvoContextMenu`) reuse the same
 * surface-construction code for every level.
 */
export interface MenuSubmenuController<_TContext = unknown> {
    /** The panel element the submenu's content lives in. */
    panelEl: HTMLElement;
    /** Open the submenu (positions + activates focus). */
    open(): void;
    /** Close the submenu (does not deinstantiate). */
    close(): void;
    /** Tear down the submenu's surface + content. */
    destroy(): void;
    /** Whether the submenu is currently open. */
    isOpen(): boolean;
}
export interface MenuContentOptions<TContext = unknown> {
    items: ContextMenuItems<TContext>;
    /** Request context passed to per-item callbacks. */
    context: TContext;
    /** The owning surface id (used to namespace row ids). */
    surfaceId: string;
    /** Parent overlay id for nested submenu registration. */
    parentSurfaceId: string;
    /** Submenu open-on-hover delay in ms. Default 200. */
    submenuHoverDelayMs?: number;
    /** Render dividers between non-first groups. Default true. */
    hasGroupDividers?: boolean;
    /**
     * Called when an item is invoked. Checkbox/radio toggles fire with
     * `closeOnSelect: false` after the item's own `onChange` has run.
     */
    onSelect: (info: MenuContentSelectInfo<TContext>) => void;
    /** Called when the menu requests close (Escape on the root level). */
    onRequestClose: () => void;
    /**
     * Factory the menu uses to build a nested submenu for a given parent
     * row. The caller wires `createOverlaySurface` with
     * `parentId: parentSurfaceId`, `relation: 'submenu'`, anchored to the
     * parent row. The MenuContent owns open/close timing.
     */
    createSubmenuController(args: {
        parentItem: ContextMenuItem<TContext> & {
            submenu: ContextMenuItem<TContext>[];
        };
        parentRowEl: HTMLElement;
        parentSurfaceId: string;
        context: TContext;
        /** Called when any descendant selects an item (bubbles to root). */
        onSelect: (info: MenuContentSelectInfo<TContext>) => void;
        /** Called when this submenu requests close (Escape / ArrowLeft). */
        onClose: () => void;
    }): MenuSubmenuController<TContext>;
}
export interface MenuContent {
    /** The scroll container (caller appends to its panel). */
    element: HTMLElement;
    /** Imperatively focus the first focusable row. */
    focus(): void;
    /** Replace the items + re-render. */
    update(next: {
        items?: ContextMenuItems<unknown>;
        context?: unknown;
    }): void;
    /** Whether any nested submenu is currently open. */
    hasOpenSubmenu(): boolean;
    /** Tear down arrow-nav, submenus, and inline event listeners. */
    destroy(): void;
}
export declare function createMenuContent<TContext = unknown>(options: MenuContentOptions<TContext>): MenuContent;
//# sourceMappingURL=menu-content.d.ts.map