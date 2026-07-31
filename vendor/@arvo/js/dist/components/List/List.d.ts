import { ArvoIconButtonOptions } from '../IconButton/IconButton';
import { ArvoBadgeOptions, ArvoBadgeSemanticType } from '../Badge/Badge';
import { ArvoAvatarOptions } from '../Avatar/Avatar';
import { ArvoStatusType } from '../Status/Status';
export declare const LIST_MAX_ROW_ACTIONS = 4;
export type ArvoListVariant = 'standard' | 'rich';
export type ArvoListSelectionMode = 'none' | 'single' | 'multi';
export type ArvoListActionsVisibility = 'hover' | 'always';
export interface ArvoListItemAvatarConfig {
    variant?: ArvoAvatarOptions['variant'];
    name?: string;
    src?: string;
    icon?: string;
    colorMode?: ArvoAvatarOptions['colorMode'];
    semanticType?: ArvoAvatarOptions['semanticType'];
    customColor?: ArvoAvatarOptions['customColor'];
    tooltip?: string;
}
export interface ArvoListItemBadgeConfig {
    message: string;
    semanticType?: ArvoBadgeSemanticType;
    variant?: ArvoBadgeOptions['variant'];
    appearance?: 'subtle' | 'filled';
    customColor?: ArvoBadgeOptions['customColor'];
    colorMode?: ArvoBadgeOptions['colorMode'];
}
export interface ArvoListItemStatusConfig {
    type: ArvoStatusType;
    icon?: string;
    tooltip?: string;
}
export interface ArvoListItemAction {
    id: string;
    icon: string;
    tooltip: string;
    onClick?: (detail: {
        itemId: string;
        actionId: string;
        item: ArvoListItemData;
        event: Event;
    }) => void;
    isDisabled?: boolean;
    isDanger?: boolean;
}
export interface ArvoListItemData {
    id: string;
    label: string;
    secondaryLabel?: string;
    icon?: string;
    avatar?: ArvoListItemAvatarConfig | null;
    badge?: ArvoListItemBadgeConfig | null;
    isSelected?: boolean;
    isChecked?: boolean;
    isIndeterminate?: boolean;
    isExcluded?: boolean;
    isDisabled?: boolean;
    isReorderable?: boolean;
    isLoading?: boolean;
    isSearchMatch?: boolean;
    matchFragment?: string;
    hasInlineNav?: boolean;
    hasContextMenu?: boolean;
    actions?: ArvoListItemAction[];
    status?: ArvoListItemStatusConfig | null;
    tooltip?: string;
    data?: unknown;
    avatarProps?: Partial<Pick<ArvoAvatarOptions, 'appearance' | 'isInteractive' | 'alt'>>;
    badgeProps?: Partial<Pick<ArvoBadgeOptions, 'tooltip' | 'customColor' | 'colorMode'>>;
    iconButtonProps?: Partial<Pick<ArvoIconButtonOptions, 'tooltip'>>;
}
export interface ArvoListGroup {
    id: string;
    label?: string;
    items: ArvoListItemData[];
    hasSelectAll?: boolean;
    isCollapsed?: boolean;
}
export interface ArvoListEmptyState {
    illustration?: string;
    title: string;
    description?: string;
    ctaLabel?: string;
    onCtaClick?: () => void;
}
export interface ArvoListReorderDetail {
    item: ArvoListItemData;
    fromIndex: number;
    toIndex: number;
    fromGroupId: string | null;
    toGroupId: string | null;
}
export interface ArvoListOptions {
    variant?: ArvoListVariant;
    selectionMode?: ArvoListSelectionMode;
    items?: ArvoListItemData[];
    groups?: ArvoListGroup[];
    selectedIds?: string[] | string | null;
    excludedIds?: string[];
    isLoading?: boolean;
    skeletonRows?: number;
    isEmpty?: boolean;
    emptyState?: ArvoListEmptyState | null;
    hasGroupDividers?: boolean;
    hasGlobalSelectAll?: boolean;
    globalSelectAllLabel?: string;
    isReorderable?: boolean;
    /**
     * When `isReorderable` is true and the list is grouped, allow drag-reorder
     * across group boundaries. Defaults to `false` (drag is constrained to the
     * source group).
     */
    crossGroupReorder?: boolean;
    actionsVisibility?: ArvoListActionsVisibility;
    searchQuery?: string;
    isDisabled?: boolean;
    width?: string;
    ariaLabel?: string;
    onSelectionChange?: (detail: {
        selectedIds: string[] | string | null;
        items: ArvoListItemData[];
    }) => void;
    onExclusionChange?: (detail: {
        excludedIds: string[];
        items: ArvoListItemData[];
    }) => void;
    onItemClick?: (detail: {
        id: string;
        item: ArvoListItemData;
        event: Event;
    }) => void;
    onItemActivate?: (detail: {
        id: string;
        item: ArvoListItemData;
        event: Event;
    }) => void;
    onReorder?: (detail: ArvoListReorderDetail) => void;
    onReorderCancel?: (detail: {
        id: string;
        item: ArvoListItemData;
    }) => void;
    onItemContextMenu?: (detail: {
        id: string;
        item: ArvoListItemData;
        event: Event;
        anchorElement: HTMLElement | null;
    }) => void;
}
type RequiredOptions = Required<Omit<ArvoListOptions, 'items' | 'groups' | 'selectedIds' | 'excludedIds' | 'emptyState' | 'searchQuery' | 'width' | 'ariaLabel' | 'onSelectionChange' | 'onExclusionChange' | 'onItemClick' | 'onItemActivate' | 'onReorder' | 'onReorderCancel' | 'onItemContextMenu'>> & {
    items: ArvoListItemData[];
    groups: ArvoListGroup[] | null;
    selectedIds: string[];
    excludedIds: string[];
    emptyState: ArvoListEmptyState | null;
    searchQuery: string | null;
    width: string | null;
    ariaLabel: string | null;
    onSelectionChange: ArvoListOptions['onSelectionChange'] | null;
    onExclusionChange: ArvoListOptions['onExclusionChange'] | null;
    onItemClick: ArvoListOptions['onItemClick'] | null;
    onItemActivate: ArvoListOptions['onItemActivate'] | null;
    onReorder: ArvoListOptions['onReorder'] | null;
    onReorderCancel: ArvoListOptions['onReorderCancel'] | null;
    onItemContextMenu: ArvoListOptions['onItemContextMenu'] | null;
};
export declare class ArvoList {
    private _element;
    private _options;
    private _bodyEl;
    private _liveEl;
    private _saInst;
    private _emptyInst;
    private _entries;
    private _groupBlocks;
    private _selectionAnchorId;
    private _activeId;
    private _draggingId;
    private _sortableHandle;
    private _boundHandleKeyDown;
    static readonly VARIANTS: readonly ["standard", "rich"];
    static readonly SELECTION_MODES: readonly ["none", "single", "multi"];
    static readonly DEFAULTS: RequiredOptions;
    static initialize(element: HTMLElement, options?: ArvoListOptions): ArvoList;
    constructor(element: HTMLElement, options?: ArvoListOptions);
    private _flatItems;
    private _enabledIds;
    private _resolveTabStopId;
    private _render;
    private _renderLoading;
    private _renderEmpty;
    private _renderGlobalSelectAll;
    private _createItemEntry;
    private _renderLiveRegion;
    private _attachTruncationTooltips;
    private _lockActionsWidth;
    private _initSortable;
    private _diffSelection;
    private _emitSelectionChange;
    private _emitExclusionChange;
    private _toggleSelection;
    private _handleGlobalSelectAllToggle;
    private _handleGroupSelectAllToggle;
    /**
     * Apply a boolean checked state to an embedded checkbox / radio by reaching
     * into the native input element. ArvoCheckbox / ArvoRadio expose `.checked()`
     * as a getter only -- their state is normally driven by user click. ArvoList
     * owns the toggle path and needs a programmatic setter, so we update the
     * underlying <input> directly.
     */
    private _syncInputChecked;
    private _syncSelectionAttributes;
    private _syncGroupSelectAllStates;
    private _bindEvents;
    private _unbindEvents;
    private _handleRowClick;
    private _handleRowKeyDown;
    private _handleKeyDown;
    private _announce;
    private _dispatchEvent;
    selected(): string[] | string | null;
    selected(ids: string[] | string | null): void;
    excluded(): string[];
    excluded(ids: string[]): void;
    setItems(items: ArvoListItemData[] | ArvoListGroup[]): void;
    addItem(item: ArvoListItemData, index?: number, groupId?: string): void;
    removeItem(id: string): void;
    setLoading(loading: boolean): void;
    setReorderable(reorderable: boolean): void;
    disabled(): boolean;
    disabled(state: boolean): void;
    destroy(): void;
    private _destroyInstances;
}
export default ArvoList;
//# sourceMappingURL=List.d.ts.map