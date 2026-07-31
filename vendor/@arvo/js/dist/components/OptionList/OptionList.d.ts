import { ListItemBase, ListGroup, Placement } from '../../../../core/src';
import { ArvoEmptyStateOptions } from '../EmptyState/EmptyState';
import { MenuSearchProp } from '../../types/menu-search';
export interface OptionListItemData extends ListItemBase {
    value: unknown;
}
/**
 * Partial ArvoEmptyState configuration applied to the embedded empty-state
 * figure. Merged over the built-in defaults for the derived dataState
 * (`noData` / `noResults` / `noResults` + creatable). The figure always
 * renders at `size: 'sm'` and `orientation: 'vertical'`.
 */
export type OptionListEmptyConfig = Pick<ArvoEmptyStateOptions, 'illustration' | 'title' | 'message' | 'secondaryAction'>;
export interface ArvoOptionListOptions {
    items: OptionListItemData[] | ListGroup<OptionListItemData>[];
    /**
     * Visual layout for option rows. `standard` renders a 32px row with the
     * label (and optional leading icon). `rich` renders a 40px row with an
     * optional 24px avatar (or fallback icon) and a primary label stacked
     * over an optional secondary label. Defaults to `'standard'`.
     */
    variant?: 'standard' | 'rich';
    isMultiple?: boolean;
    value?: unknown | unknown[];
    defaultValue?: unknown | unknown[];
    search?: MenuSearchProp;
    hasGroupDividers?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    /**
     * When true and the active filter yields zero results, the noResults
     * empty state offers a `Create` action that fires `onCreate(query)` with
     * the current search value. Has no effect when there is no active query.
     */
    isCreatable?: boolean;
    /**
     * Override illustration, title, message, or secondaryAction on the
     * embedded ArvoEmptyState figure.
     */
    emptyConfig?: Partial<OptionListEmptyConfig>;
    /** Accessible name for the floating listbox. Defaults to "Options". */
    ariaLabel?: string;
    /**
     * Optional element to receive `aria-activedescendant` instead of the trigger.
     * Defaults to the trigger. Used by composed fields (e.g. MultiSelect) where
     * the trigger anchors positioning/ARIA but a nested editable input is the
     * focused element that must own `aria-activedescendant`. Mirrors React's
     * `activeDescendantRef`.
     */
    activeDescendantElement?: HTMLElement | null;
    /**
     * Optional element to receive the trigger-ARIA attributes
     * (`aria-haspopup`, `aria-controls`, `aria-expanded`) instead of the
     * trigger. Defaults to the trigger. Use when a composed field anchors
     * positioning + dismissal to a wrapper element but a nested element
     * (e.g. an editable `<input role="combobox">`) is the canonical ARIA
     * target per the WAI-ARIA pattern. `ArvoCombobox` is the canonical
     * consumer. Mirrors React's `triggerAriaRef`.
     */
    triggerAriaElement?: HTMLElement | null;
    placement?: Placement;
    width?: 'anchor' | number | string;
    maxHeight?: string;
    defaultOpen?: boolean;
    closeOnSelect?: boolean;
    /** Toggle the overlay when the trigger element is clicked. Default true. */
    bindTrigger?: boolean;
    /**
     * Whether ArrowDown past the last option (or ArrowUp past the first)
     * wraps to the other end. Defaults to true. Composed parents that
     * intentionally bound option navigation (e.g. ArvoMultiSelect) pass
     * false to clamp at the boundaries instead.
     */
    wrapNavigation?: boolean;
    onChange?: (detail: {
        value: unknown | unknown[];
        option: OptionListItemData;
        isSelected: boolean;
    }) => void;
    /**
     * Called when the user activates the Create action in the noResults
     * empty state (only relevant when `isCreatable` is true and a search
     * query is active). Receives the current trimmed query value.
     */
    onCreate?: (value: string) => void;
    onOpenChange?: (isOpen: boolean) => void;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
}
type RequiredOptionListOptions = Required<Omit<ArvoOptionListOptions, 'value' | 'defaultValue' | 'search' | 'emptyConfig' | 'closeOnSelect' | 'onChange' | 'onCreate' | 'onOpenChange' | 'onOpen' | 'onClose'>> & {
    value: unknown | unknown[] | null;
    search: MenuSearchProp | undefined;
    emptyConfig: Partial<OptionListEmptyConfig> | null;
    closeOnSelect: boolean | null;
    onChange: ArvoOptionListOptions['onChange'] | null;
    onCreate: ArvoOptionListOptions['onCreate'] | null;
    onOpenChange: ArvoOptionListOptions['onOpenChange'] | null;
    onOpen: ArvoOptionListOptions['onOpen'] | null;
    onClose: ArvoOptionListOptions['onClose'] | null;
};
export declare class ArvoOptionList {
    private _trigger;
    private _options;
    private _id;
    private _panelEl;
    private _scrollEl;
    private _searchEl;
    private _searchInstance;
    private _surface;
    private _arrowNav;
    private _searchCfg;
    private _selection;
    private _flatOptions;
    private _optionEls;
    private _highlightedIndex;
    private _query;
    private _isOpen;
    private _emptyStateInstance;
    private _checkboxInstances;
    private _truncationHandles;
    static readonly DEFAULTS: RequiredOptionListOptions;
    static initialize(trigger: HTMLElement, options: ArvoOptionListOptions): ArvoOptionList;
    constructor(trigger: HTMLElement, options: ArvoOptionListOptions);
    private _initSelection;
    private _isSelected;
    private get _closeOnSelect();
    private _render;
    private _buildClasses;
    private _setupSurface;
    private _getFiltered;
    private _teardownTransientInstances;
    private _buildOptions;
    private _renderEmptyState;
    private _handleCreate;
    private _renderSkeleton;
    private _setupKeyboard;
    private _handleTriggerKeyDown;
    private _handleSearchKeyDown;
    private _handleListClick;
    private _handleListMouseDown;
    private _handleListMouseOver;
    private _highlightOption;
    private _selectOption;
    private _updateAriaSelected;
    private _handleFilterSearch;
    private _handleFilterClear;
    private _updateSearchCounter;
    private _bindTrigger;
    private _handleTriggerClick;
    open(): void;
    close(): void;
    private _afterClose;
    isOpen(): boolean;
    toggle(force?: boolean): void;
    value(newValue?: unknown | unknown[]): unknown | unknown[] | null | void;
    setItems(items: OptionListItemData[] | ListGroup<OptionListItemData>[]): void;
    setLoading(isLoading: boolean): void;
    disabled(state?: boolean): boolean | void;
    destroy(): void;
    private _dispatch;
}
export {};
//# sourceMappingURL=OptionList.d.ts.map