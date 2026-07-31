import { ListGroup } from '../../../../core/src';
import { ArvoActionMenuOptions, MenuItemData } from '../ActionMenu/ActionMenu';
export type ArvoBreadcrumbSize = 'sm' | 'lg';
export type ArvoBreadcrumbItemType = 'home' | 'link' | 'current';
export interface ArvoBreadcrumbItem {
    /**
     * Visible label. Suppressed for `home` items (which are icon-only) but
     * still required for accessibility -- it is forwarded to `aria-label` on
     * the underlying anchor when no visible text is rendered.
     */
    label: string;
    /** Destination URL. Omit for non-navigable items. */
    href?: string;
    /**
     * Optional o9con icon name (without the `o9con-` prefix). For `home`
     * items the icon is shown alone; for `link` / `current` items it sits as
     * a leading icon before the label.
     */
    icon?: string;
    /**
     * Role of the item in the trail. When omitted, the breadcrumb infers it:
     * the last item becomes `current`, an icon-only first item without
     * `menuItems` becomes `home`, and any other item is a `link`.
     */
    type?: ArvoBreadcrumbItemType;
    /**
     * Optional dropdown menu attached to this item. When present and the
     * item is a `link` or `current` role, the wrapper renders that row as
     * an `ArvoActionMenu` trigger (chevron + button) instead of a plain
     * anchor / span. `menuItems` wins over `href` when both are set.
     * Ignored on `home` items.
     */
    menuItems?: MenuItemData[] | ListGroup<MenuItemData>[];
}
/**
 * Scoped escape-hatch bag for the inner overflow `ArvoActionMenu` options the
 * parent does not curate as a flat option. Mirrors the React
 * `BreadcrumbMenuProps` type exactly -- drift checker enforces parity.
 */
export type BreadcrumbMenuProps = Pick<ArvoActionMenuOptions, 'placement' | 'maxHeight' | 'hasGroupDividers'>;
export interface ArvoBreadcrumbOptions {
    items?: ArvoBreadcrumbItem[];
    size?: ArvoBreadcrumbSize;
    hasOverflow?: boolean;
    maxVisibleItems?: number;
    isDisabled?: boolean;
    isLoading?: boolean;
    ariaLabel?: string;
    overflowAriaLabel?: string;
    /**
     * Escape hatch for the inner overflow `ArvoActionMenu` options the parent
     * doesn't expose flat. Bag-only keys (`placement`, `maxHeight`,
     * `hasGroupDividers`) flow through. On any conflict with a parent-owned
     * option the parent wins. Also applied to every per-item dropdown that
     * has `menuItems`.
     */
    menuProps?: BreadcrumbMenuProps;
    onNavigate?: (event: {
        href: string;
        index: number;
        label: string;
    }) => void;
    onOverflowOpen?: () => void;
    onOverflowClose?: () => void;
    onItemMenuOpen?: (event: {
        index: number;
    }) => void;
    onItemMenuClose?: (event: {
        index: number;
    }) => void;
}
type RequiredOptions = Required<Omit<ArvoBreadcrumbOptions, 'onNavigate' | 'onOverflowOpen' | 'onOverflowClose' | 'onItemMenuOpen' | 'onItemMenuClose' | 'menuProps'>> & {
    menuProps: BreadcrumbMenuProps | null;
    onNavigate: ArvoBreadcrumbOptions['onNavigate'] | null;
    onOverflowOpen: ArvoBreadcrumbOptions['onOverflowOpen'] | null;
    onOverflowClose: ArvoBreadcrumbOptions['onOverflowClose'] | null;
    onItemMenuOpen: ArvoBreadcrumbOptions['onItemMenuOpen'] | null;
    onItemMenuClose: ArvoBreadcrumbOptions['onItemMenuClose'] | null;
};
export declare class ArvoBreadcrumb {
    private _element;
    private _options;
    private _listEl;
    private _skeletonEl;
    private _overflowMenu;
    private _itemMenus;
    private _originalContent;
    private _boundHandleClick;
    static readonly DEFAULTS: RequiredOptions;
    static initialize(element: HTMLElement, options?: ArvoBreadcrumbOptions): ArvoBreadcrumb;
    constructor(element: HTMLElement, options?: ArvoBreadcrumbOptions);
    private _render;
    private _applyRootClasses;
    private _buildSkeleton;
    private _buildItems;
    private _buildTrailItem;
    private _buildIcon;
    private _buildItemMenuTrigger;
    private _buildOverflowTrigger;
    private _destroyMenus;
    private _handleClick;
    private _handleOverflowSelect;
    private _dispatchEvent;
    setItems(items: ArvoBreadcrumbItem[]): void;
    /**
     * Set the breadcrumb size at runtime. Updates the size modifier class and
     * re-evaluates skeleton geometry while loading.
     */
    setSize(size: ArvoBreadcrumbSize): void;
    disabled(state?: boolean): boolean | void;
    setLoading(isLoading: boolean): void;
    destroy(): void;
    /**
     * Re-renders the trail (loaded state only). Cleans up any existing
     * overflow / per-item menu instances and rebuilds the list.
     */
    private _rebuildTrail;
}
export {};
//# sourceMappingURL=Breadcrumb.d.ts.map