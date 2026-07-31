import { ArvoPopoverActionConfig, ArvoPopoverHeaderActionConfig } from '../Popover/Popover';
import { ArvoBannerAlertOptions } from '../BannerAlert/BannerAlert';
import { ArvoMessageAlertType } from '../MessageAlert/MessageAlert';
import { PopoverInlineConfig } from './hpop-helpers';
export type { PopoverInlineConfig };
export declare const HPOP_MIN_WIDTH = 270;
export declare const HPOP_DEFAULT_WIDTH = 360;
export declare const HPOP_MAX_WIDTH = 700;
export declare const HPOP_MIN_HEIGHT = 272;
export interface HybridPopoverItem {
    id: string;
    label: string;
    icon?: string;
    value?: unknown;
    isDisabled?: boolean;
    isExcluded?: boolean;
    isDraggable?: boolean;
    /** @deprecated Use `inline` instead. */
    hasInline?: boolean | HybridPopoverItem[] | HybridPopoverInlineConfig;
    inline?: HybridPopoverInlineConfig | PopoverInlineConfig;
    isIndeterminate?: boolean;
}
export interface HybridPopoverGroup {
    id: string;
    label?: string;
    isDraggable?: boolean;
    hasSelectAll?: boolean;
    items: HybridPopoverItem[];
}
export interface HybridPopoverMessageAlertConfig {
    type?: ArvoMessageAlertType;
    message?: string | ((count: number, total: number) => string);
    icon?: string | null;
}
export interface HybridPopoverSearchConfig {
    variant?: 'default' | 'filter-search';
    placeholder?: string;
    shortcut?: string;
    counter?: boolean;
    messageAlert?: false | HybridPopoverMessageAlertConfig;
}
export interface HybridPopoverConditionalConfig {
    value: 'and' | 'or';
    onChange: (value: 'and' | 'or') => void;
}
export interface HybridPopoverEmptyConfig {
    noDataTitle?: string;
    noDataMessage?: string;
    noResultsTitle?: string;
    noResultsMessage?: string;
    noResultsClearLabel?: string;
    /** Informational message rendered when dataState='appliesToAll'. */
    appliesToAllMessage?: string;
}
export type HybridPopoverDataState = 'data' | 'appliesToAll' | 'noResults' | 'noData';
export interface HybridPopoverInlineConfig {
    title?: string;
    items?: HybridPopoverItem[] | HybridPopoverGroup[];
    variant?: 'multi' | 'single';
    hasBackButton?: boolean;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    onBack?: () => void;
}
export interface HybridPopoverReorderDetail {
    fromIndex: number;
    toIndex: number;
    fromGroup: string | null;
    toGroup: string | null;
    items: HybridPopoverItem[] | HybridPopoverGroup[];
}
export interface HybridPopoverChangeMeta {
    item: HybridPopoverItem | null;
    action: 'toggle' | 'select-all' | 'group-select-all' | 'apply' | 'reset' | 'clear';
}
export type HybridPopoverVariant = 'multi' | 'single' | 'boolean' | 'conditional' | 'custom';
export type HybridPopoverSelectionMode = 'multi' | 'single' | 'none';
export interface ArvoHybridPopoverOptions {
    variant?: HybridPopoverVariant;
    selectionMode?: HybridPopoverSelectionMode;
    /** Controlled item ordering. */
    items?: HybridPopoverItem[] | HybridPopoverGroup[];
    /** Initial items for uncontrolled order management (drag persists internally). */
    defaultItems?: HybridPopoverItem[] | HybridPopoverGroup[];
    value?: string[] | string | null;
    defaultValue?: string[] | string | null;
    onChange?: (value: string[] | string | null, meta: HybridPopoverChangeMeta) => void;
    commitOn?: 'apply' | 'change';
    search?: false | HybridPopoverSearchConfig;
    bannerAlert?: ArvoBannerAlertOptions | false;
    conditional?: false | HybridPopoverConditionalConfig;
    hasGlobalSelectAll?: boolean;
    enableReorder?: boolean;
    crossGroupDrag?: boolean;
    onReorder?: (detail: HybridPopoverReorderDetail) => void;
    emptyConfig?: HybridPopoverEmptyConfig;
    /**
     * Escape-hatch bag forwarded to the embedded ArvoList instance using the
     * bag-first / flat-wins merge rule. Use for the long-tail ArvoList knobs
     * the HybridPopover does not curate (e.g. `actionsVisibility`,
     * `hasGroupDividers`, `skeletonRows`, `width`, `ariaLabel`). Parent-owned
     * props (selection, items, isLoading, isReorderable, search-derived
     * isEmpty / emptyState) cannot be overridden via this bag.
     */
    listProps?: {
        variant?: 'standard' | 'rich';
        actionsVisibility?: 'hover' | 'always';
        hasGroupDividers?: boolean;
        skeletonRows?: number;
        width?: string;
        ariaLabel?: string;
    };
    actions?: ArvoPopoverActionConfig[] | false;
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
    placement?: ArvoPopoverOptionsPlacement;
    offset?: number;
    closeOnOutside?: boolean;
    isLoading?: boolean;
    /**
     * Explicit data-state override. When 'data' (default) the component infers
     * state from items + filter query (totalCount === 0 -> noData,
     * filteredCount === 0 -> noResults). Set to 'appliesToAll' to render the
     * informational filter-applies-to-all message (header, search, and footer
     * remain). Setting 'noData' / 'noResults' forces those branches regardless
     * of items.
     * State precedence: isLoading > noResults > noData > appliesToAll > data.
     */
    dataState?: HybridPopoverDataState;
    defaultOpen?: boolean;
    isInline?: boolean;
    parent?: string | null;
    onApply?: (value: string[] | string | null) => boolean | void;
    onCancel?: () => void;
    onReset?: () => void;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
}
type ArvoPopoverOptionsPlacement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end' | 'auto';
export declare class ArvoHybridPopover {
    private _trigger;
    private _options;
    private _id;
    private _selection;
    private _items;
    private _committed;
    private _draft;
    private _query;
    private _isLoading;
    private _popover;
    private _panelEl;
    private _stickyEl;
    private _bodyEl;
    private _searchInstance;
    private _bannerInstance;
    private _messageAlertInstance;
    private _conditionalInstance;
    private _inlinePanelStack;
    private _inlinePanelInstances;
    private _listInstance;
    private _clearSearchInstance;
    private _appliesToAllAlertInstance;
    private _resize;
    private _isControlledItems;
    private _resizedWidth;
    private _resizedHeight;
    private _boundOnPopoverOpen;
    private _boundOnPopoverClose;
    static initialize(element: HTMLElement, options?: ArvoHybridPopoverOptions): ArvoHybridPopover;
    constructor(element: HTMLElement, options?: ArvoHybridPopoverOptions);
    open(): void;
    close(): void;
    isOpen(): boolean;
    toggle(): void;
    value(): string[] | string | null;
    value(newValue: string[] | string | null): void;
    setLoading(loading: boolean): void;
    updateItems(items: HybridPopoverItem[] | HybridPopoverGroup[]): void;
    reposition(): void;
    destroy(): void;
    private _handlePopoverOpen;
    private _handlePopoverClose;
    /**
     * Effective data state: explicit prop wins over inferred. Precedence
     * mirrors spec 6.10: isLoading > noResults > noData > appliesToAll > data.
     * `dataState='data'` defers to the inferred path
     * (totalCount === 0 -> noData, otherwise filteredCount === 0 -> noResults).
     */
    private _resolveDataState;
    private _applyPanelClasses;
    private _applyDimensions;
    private _getFilteredItems;
    private _renderSticky;
    private _renderBody;
    private _buildAppliesToAll;
    private _resolveMessageAlertText;
    /**
     * Bridge ArvoList's onSelectionChange into HybridPopover's draft path.
     * The legacy onChange meta is reconstructed from a prev/next diff so the
     * public contract `onChange(value, { item, action })` stays unchanged.
     */
    private _handleListSelectionChange;
    private _handleListReorder;
    private _handleListItemActivate;
    /**
     * Update HybridPopover's draft state. The embedded ArvoList has already
     * updated its own DOM / aria-checked attributes synchronously inside its
     * onSelectionChange flow, so we do NOT push back into it here -- doing so
     * would loop. Reset / Cancel / value() paths re-render the body instead.
     */
    private _updateDraft;
    private _buildPopoverActions;
    private _handleApply;
    private _handleCancel;
    private _handleReset;
    private _handleSearchInput;
    private _handleSearchClear;
    /**
     * Update the message alert (counter results message) in the sticky
     * header without touching the live ArvoSearch instance. The alert may
     * need to appear, disappear, or update its text as the query / filtered
     * count changes during typing.
     */
    private _updateMessageAlert;
    private _updateSearchCounter;
    private _mountResize;
    private _teardownResize;
    private _destroyBodyInstances;
    private _destroyInnerInstances;
    private _mountInlineStack;
    private _teardownInlineStack;
    private _destroyInlineInstance;
    private _closeAllInlinePanels;
    private _popInlinePanel;
    private _openInlineFromItem;
    private _fireChange;
    private _dispatchEvent;
}
export default ArvoHybridPopover;
//# sourceMappingURL=HybridPopover.d.ts.map