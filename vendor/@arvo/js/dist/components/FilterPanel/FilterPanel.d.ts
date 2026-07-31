import { ArvoPanelHeaderAction, ArvoPanelStickyHeaderConfig, ArvoPanelAction, ArvoPanelMenuItem, ArvoPanelPlacement, ArvoPanelDisplayMode, ArvoPanelCloseReason } from '../../../../utils/src';
import { ArvoPanelRichHeaderConfig as PanelBaseRichHeaderConfig } from '../PanelBase/PanelBase';
import { ArvoListOptions, ArvoListItemData } from '../List/List';
import { ArvoAccordionOptions } from '../Accordion/Accordion';
import { ArvoFabButtonOptions } from '../FabButton/FabButton';
import { ArvoStatusConfig } from '../Status/Status';
import { ArvoBadgeOptions } from '../Badge/Badge';
export type ArvoFilterPanelRichHeaderConfig = PanelBaseRichHeaderConfig;
export type ArvoFilterPanelPlacement = Extract<ArvoPanelPlacement, 'left' | 'right'>;
export type ArvoPanelFilterView = 'flat' | 'grouped';
/**
 * Filter selection mode. `'single'` maps to inner ArvoList
 * `selectionMode='single'` (radio rows); `'multiple'` maps to inner
 * ArvoList `selectionMode='multi'` (checkbox rows). ArvoFilterPanel
 * exposes the human-friendly `'multiple'` and translates internally.
 */
export type ArvoPanelFilterSelectionMode = 'single' | 'multiple';
export interface ArvoPanelFilterGroup {
    id: string;
    title: string;
    icon?: string;
    items: ArvoListItemData[];
}
export interface ArvoFilterPanelOptions {
    displayMode?: ArvoPanelDisplayMode;
    placement?: ArvoFilterPanelPlacement;
    isEdge?: boolean;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onOpen?: () => boolean | void;
    onClose?: (reason: ArvoPanelCloseReason) => boolean | void;
    isModal?: boolean;
    closeOnEscape?: boolean;
    closeOnOutsideClick?: boolean;
    container?: HTMLElement | (() => HTMLElement) | null;
    hasHeader?: boolean;
    title?: string | null;
    icon?: string;
    status?: Omit<ArvoStatusConfig, 'placement'>;
    badge?: Omit<Partial<ArvoBadgeOptions>, 'placement'>;
    hasBackButton?: boolean;
    onBack?: () => void;
    headerActions?: ArvoPanelHeaderAction[];
    hasOverflowMenu?: boolean;
    overflowMenuItems?: ArvoPanelMenuItem[];
    isPinnable?: boolean;
    isPinned?: boolean;
    defaultPinned?: boolean;
    onPinChange?: (pinned: boolean) => void;
    isDismissible?: boolean;
    richHeader?: ArvoFilterPanelRichHeaderConfig | false;
    stickyHeader?: ArvoPanelStickyHeaderConfig | false;
    actions?: ArvoPanelAction[] | false;
    fab?: ArvoFabButtonOptions | false;
    /**
     * When true, mounts an `ArvoSplitter` on the inner edge so users can
     * resize the panel width between `minSize` and `maxSize`.
     * Recommended defaults per guidelines: min 320px, default 400px,
     * overlay max `min(800px, 80vw)`, docked max `min(800px, 60vw)`.
     */
    isResizable?: boolean;
    defaultSize?: number | string;
    minSize?: number | string;
    maxSize?: number | string;
    onResize?: (size: number) => void;
    onResizeCommit?: (size: number) => void;
    isDisabled?: boolean;
    isLoading?: boolean;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
    className?: string;
    filterView?: ArvoPanelFilterView;
    selectionMode?: ArvoPanelFilterSelectionMode;
    items?: ArvoListItemData[];
    groups?: ArvoPanelFilterGroup[];
    selectedIds?: string[];
    defaultSelectedIds?: string[];
    onSelectionChange?: (selectedIds: string[]) => void;
    listProps?: Pick<ArvoListOptions, 'variant' | 'hasGroupDividers' | 'actionsVisibility' | 'isReorderable' | 'onReorder' | 'onItemContextMenu' | 'emptyState'>;
    accordionProps?: Pick<ArvoAccordionOptions, 'expandMode' | 'isCollapsible' | 'size' | 'variant'>;
}
export declare class ArvoFilterPanel {
    private _base;
    private _bodyHostEl;
    private _filterView;
    private _selectionMode;
    private _items;
    private _groups;
    private _selectedIds;
    private _listProps;
    private _accordionProps;
    private _onSelectionChange;
    private _flatList;
    private _accordion;
    private _sectionLists;
    private _unsubscribeSearch;
    private _currentQuery;
    private _destroyed;
    static initialize(element: HTMLElement, options?: ArvoFilterPanelOptions): ArvoFilterPanel;
    constructor(element: HTMLElement, options?: ArvoFilterPanelOptions);
    private _emitSelectionChange;
    private _handleSectionSelection;
    private _innerListSelectionMode;
    private _destroyBody;
    private _buildBody;
    private _buildFlatBody;
    private _buildGroupedBody;
    private _applySearchQuery;
    open(): void;
    close(reason?: ArvoPanelCloseReason): void;
    toggle(): void;
    isOpen(): boolean;
    pinned(): boolean;
    pinned(value: boolean): void;
    setDisplayMode(mode: ArvoPanelDisplayMode): void;
    setStickyHeader(config: ArvoPanelStickyHeaderConfig | false): void;
    setHeaderActions(actions: ArvoPanelHeaderAction[]): void;
    setActions(actions: ArvoPanelAction[] | false): void;
    setTitle(title: string | null): void;
    setIcon(icon: string | null): void;
    setRichHeader(config: ArvoFilterPanelRichHeaderConfig | false): void;
    setItems(items: ArvoListItemData[]): void;
    setGroups(groups: ArvoPanelFilterGroup[]): void;
    setSelectedIds(ids: string[]): void;
    setFilterView(view: ArvoPanelFilterView): void;
    setSelectionMode(mode: ArvoPanelFilterSelectionMode): void;
    search(): string;
    search(query: string): void;
    selectedTab(): string | null;
    selectedTab(id: string): void;
    loading(): boolean;
    loading(state: boolean): void;
    disabled(): boolean;
    disabled(state: boolean): void;
    focus(target?: 'first' | 'title' | 'search' | 'list'): void;
    size(): number;
    size(next: number): void;
    destroy(): void;
}
export default ArvoFilterPanel;
//# sourceMappingURL=FilterPanel.d.ts.map