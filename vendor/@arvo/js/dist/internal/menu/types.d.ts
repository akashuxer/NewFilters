import { ListGroup } from '../../../../core/src';
/**
 * Status indicator config shared with ArvoActionMenu. A semantic key maps
 * to the matching `arvo-menu-item--status-*` modifier class; an explicit
 * `{ color }` object sets `--arvo-menu-item-status-color` inline.
 */
export type MenuItemStatus = 'success' | 'warning' | 'danger' | 'info' | {
    color: string;
};
/** Fields shared by every non-separator menu row. */
interface ContextMenuRowBase {
    id: string;
    label: string;
    secondaryLabel?: string;
    icon?: string;
    avatar?: string;
    shortcut?: string;
    value?: string;
    status?: MenuItemStatus;
    href?: string;
    target?: '_self' | '_blank';
    isDisabled?: boolean;
}
export interface ContextMenuItemNode<TContext = unknown> extends ContextMenuRowBase {
    kind?: 'item';
    destructive?: boolean;
    isSelected?: boolean;
    submenu?: ContextMenuItem<TContext>[];
    onSelect?: (context: TContext) => void | boolean;
}
export interface ContextMenuCheckboxItem<TContext = unknown> extends ContextMenuRowBase {
    kind: 'checkbox';
    checked: boolean;
    onChange?: (checked: boolean, context: TContext) => void;
}
export interface ContextMenuRadioItem<TContext = unknown> extends ContextMenuRowBase {
    kind: 'radio';
    checked: boolean;
    radioGroup: string;
    onChange?: (context: TContext) => void;
}
export interface ContextMenuSeparator {
    kind: 'separator';
    id: string;
}
export type ContextMenuItem<TContext = unknown> = ContextMenuItemNode<TContext> | ContextMenuCheckboxItem<TContext> | ContextMenuRadioItem<TContext> | ContextMenuSeparator;
export type ContextMenuItemGroup<TContext = unknown> = ListGroup<ContextMenuItem<TContext> & {
    label: string;
}> & {
    items: ContextMenuItem<TContext>[];
};
export type ContextMenuItems<TContext = unknown> = ContextMenuItem<TContext>[] | ContextMenuItemGroup<TContext>[];
export declare function isContextMenuGrouped<TContext>(items: ContextMenuItems<TContext>): items is ContextMenuItemGroup<TContext>[];
export declare function flattenContextMenuItems<TContext>(items: ContextMenuItems<TContext>): ContextMenuItem<TContext>[];
export declare function isContextMenuFocusable<TContext>(item: ContextMenuItem<TContext>): boolean;
/**
 * True when the row should display the `.active` selection visual:
 * regular item with `isSelected: true`, OR checkbox / radio with
 * `checked: true`. Per spec section 4.5 the 2 px left-border is the
 * ONLY selection indicator.
 */
export declare function isContextMenuSelected<TContext>(item: ContextMenuItem<TContext>): boolean;
export {};
//# sourceMappingURL=types.d.ts.map