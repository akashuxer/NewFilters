import { ArvoPopoverActionConfig, ArvoPopoverHeaderActionConfig, ArvoPopoverOptions } from '../Popover/Popover';
import { ArvoTreeItem, ArvoTreeViewOptions, TreeSelectionMode, TreeSize, TreeAppearance, TreeSelectionContext, TreeExpandContext, TreeViewEmptyConfig } from '../TreeView/TreeView';
import { MenuItemData } from '../ActionMenu/ActionMenu';
export declare const DD_TREE_MIN_WIDTH = 270;
export declare const DD_TREE_DEFAULT_WIDTH = 362;
export declare const DD_TREE_MAX_WIDTH = 700;
export declare const DD_TREE_MIN_HEIGHT = 272;
export interface DropdownTreeSearchConfig {
    placeholder?: string;
    shortcut?: string;
}
export interface DropdownTreeFilterConfig {
    icon?: string;
    tooltip?: string;
    items?: MenuItemData[];
    onSelect?: (item: MenuItemData, index: number) => boolean | void;
}
/**
 * Shape of the noData empty-state override. Mirrors React's
 * `DropdownTreeEmptyConfig` 1:1. Includes optional `primaryAction`
 * for the Refresh button (spec B7).
 */
export interface DropdownTreeEmptyConfig extends TreeViewEmptyConfig {
    primaryAction?: {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary' | 'tertiary' | 'outline';
    };
}
/**
 * RESERVED for follow-up. Supplying `sections` today logs a console.warn and
 * falls back to the flat `items` shape.
 */
export interface DropdownTreeSection {
    id: string;
    label?: string;
    items: ArvoTreeItem[];
    selectionMode?: TreeSelectionMode;
    size?: TreeSize;
    appearance?: TreeAppearance;
    hasSelectAll?: boolean;
}
type DropdownTreePlacement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end' | 'auto';
/**
 * Scoped escape-hatch bag for the inner `ArvoPopover` (panel chrome) options
 * the parent does not curate as a flat option. Mirrors the React
 * `DropdownTreePopoverProps` type exactly -- drift checker enforces parity.
 */
export type DropdownTreePopoverProps = Pick<ArvoPopoverOptions, 'hasArrow' | 'isInteractive' | 'trigger'>;
/**
 * Scoped escape-hatch bag for the inner `ArvoTreeView` options the parent
 * does not curate as a flat option. Mirrors the React `DropdownTreeTreeProps`
 * type exactly. `emptyConfig`, `searchQuery`, and `isLoading` are flat
 * parent-owned options so the data-state branching stays the single source
 * of truth.
 */
export type DropdownTreeTreeProps = Pick<ArvoTreeViewOptions, 'actions' | 'actionsVisibility' | 'isReorderable' | 'onReorder' | 'onLoadChildren' | 'ariaLabelledBy'>;
export interface ArvoDropdownTreeOptions {
    items?: ArvoTreeItem[];
    /** RESERVED for follow-up. */
    sections?: DropdownTreeSection[];
    selectionMode?: TreeSelectionMode;
    size?: TreeSize;
    appearance?: TreeAppearance;
    selectedIds?: string[];
    defaultSelectedIds?: string[];
    expandedIds?: string[];
    defaultExpandedIds?: string[];
    onSelectionChange?: (ids: string[], context: TreeSelectionContext) => void;
    onExpandedChange?: (ids: string[], context: TreeExpandContext) => void;
    searchQuery?: string;
    /** Called whenever the internal search query changes. */
    onSearchChange?: (query: string) => void;
    search?: false | DropdownTreeSearchConfig;
    filter?: false | DropdownTreeFilterConfig;
    /** Override for the noData empty state copy and illustration. */
    emptyConfig?: DropdownTreeEmptyConfig;
    /**
     * When true (and `selectionMode='multiple'`), render a sticky
     * select-all checkbox row above the tree body. The checkbox toggles
     * every eligible (non-disabled) tree row; the external label is
     * clickable.
     */
    hasGlobalSelectAll?: boolean;
    isResizable?: boolean;
    width?: number;
    height?: number | null;
    onResize?: (detail: {
        width: number;
        height: number;
    }) => void;
    onResizeCommit?: (detail: {
        width: number;
        height: number;
    }) => void;
    title?: string | null;
    hasHeader?: boolean;
    isClosable?: boolean;
    hasBackButton?: boolean;
    onBack?: () => void;
    headerActions?: ArvoPopoverHeaderActionConfig[];
    placement?: DropdownTreePlacement;
    offset?: number;
    closeOnOutside?: boolean;
    actions?: ArvoPopoverActionConfig[] | false;
    isLoading?: boolean;
    defaultOpen?: boolean;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    /**
     * Escape hatch for the inner `ArvoPopover` (panel chrome) options the
     * parent doesn't expose flat. Bag-only keys (`hasArrow`, `isInteractive`,
     * `trigger`) flow through. On any conflict with a parent-owned option the
     * parent wins.
     */
    popoverProps?: DropdownTreePopoverProps;
    /**
     * Escape hatch for the inner `ArvoTreeView` options the parent doesn't
     * expose flat. Bag-only keys (`actions`, `actionsVisibility`,
     * `isReorderable`, `onReorder`, `onLoadChildren`, `emptyConfig`,
     * `ariaLabelledBy`) flow through. On any conflict with a parent-owned
     * option the parent wins.
     */
    treeProps?: DropdownTreeTreeProps;
    /**
     * When selection changes should be committed. Defaults to `'apply'`
     * which buffers selection inside the panel until Apply commits.
     * `'change'` keeps the legacy behavior (every toggle commits live).
     */
    commitOn?: 'change' | 'apply';
    onApply?: (ids: string[]) => boolean | void;
    onCancel?: () => void;
    onReset?: () => void;
}
export declare class ArvoDropdownTree {
    private _trigger;
    private _options;
    private _id;
    private _selectionMode;
    private _items;
    private _query;
    private _isLoading;
    private _selectedIds;
    private _expandedIds;
    private _isControlledSelection;
    private _isControlledExpansion;
    private _draftSelectedIds;
    private _openSnapshot;
    private _isCommitOnApply;
    private _popover;
    private _panelEl;
    private _stickyEl;
    private _bodyEl;
    private _treeHostEl;
    private _emptyHostEl;
    private _skeletonEl;
    private _searchInstance;
    private _filterInstance;
    private _treeInstance;
    private _emptyInstance;
    private _selectAllInstance;
    private _bodyState;
    private _lastSeededQuery;
    private _resize;
    private _resizedWidth;
    private _resizedHeight;
    private _boundOnPopoverOpen;
    private _boundOnPopoverClose;
    static initialize(element: HTMLElement, options?: ArvoDropdownTreeOptions): ArvoDropdownTree;
    constructor(element: HTMLElement, options?: ArvoDropdownTreeOptions);
    open(): void;
    close(): void;
    isOpen(): boolean;
    toggle(): void;
    selected(ids?: string[]): string[] | void;
    expanded(ids?: string[]): string[] | void;
    setLoading(loading: boolean): void;
    updateItems(items: ArvoTreeItem[]): void;
    reposition(): void;
    destroy(): void;
    private _handlePopoverOpen;
    private _handlePopoverClose;
    private _applyPanelClasses;
    private _applyDimensions;
    private _renderSticky;
    private _handleSearchInput;
    private _handleSearchClear;
    /**
     * Re-paint the body slot for the current `(items, query, isLoading)` tuple.
     * Mirrors the React four-branch `renderBody`: loading > noData > noResults
     * > data. The tree host element is preserved across renders so the inner
     * ArvoTreeView keeps its DOM identity when the user types/clears within
     * the data branch.
     */
    private _renderBody;
    /**
     * B4 helper -- compute the select-all checkbox state from the
     * current draft against the eligible (non-disabled) ids in the
     * unfiltered tree.
     */
    private _computeSelectAllState;
    private _syncSelectAllUi;
    private _handleSelectAllToggle;
    private _renderSkeleton;
    private _renderEmpty;
    private _handleTreeSelectionChange;
    private _handleTreeExpandedChange;
    private _buildPopoverActions;
    private _handleReset;
    private _handleCancel;
    private _handleApply;
    private _mountResize;
    private _teardownResize;
    private _destroyInnerInstances;
    private _dispatchEvent;
}
export default ArvoDropdownTree;
//# sourceMappingURL=DropdownTree.d.ts.map