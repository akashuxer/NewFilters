import { ArvoChipVariant, ArvoChipAppearance, ArvoChipSize, ArvoChipColorMode, ArvoChipSemanticType, ArvoChipCustomColor } from '../Chip/Chip';
/** JS-only item shape. Carries a stable key plus per-chip config for each ArvoChip instance. */
export interface ArvoChipListItem {
    /** Stable identity for selection (selectedKeys) and reorder ordering. Unique within the list. */
    key: string | number;
    /** Primary chip label (required by ArvoChip). */
    label: string;
    /** Per-chip override of the list variant default. */
    variant?: ArvoChipVariant;
    /** Per-chip override of the list appearance default. */
    appearance?: ArvoChipAppearance;
    /** Per-chip override of the list size default. */
    size?: ArvoChipSize;
    /** Per-chip override of the list colorMode default. */
    colorMode?: ArvoChipColorMode;
    /** Semantic color intent (honored in semantic color mode). */
    semanticType?: ArvoChipSemanticType;
    /** Custom util color family (honored in custom color mode). */
    customColor?: ArvoChipCustomColor;
    /** Leading o9con icon name (without the o9con- prefix). */
    icon?: string;
    /** Avatar image src; wrapped in an `<img>` inside `<span class="arvo-chip__avatar">`. */
    avatar?: string;
    /** Optional secondary title shown before the label. */
    title?: string;
    /** Optional counter mapped to an internal ArvoBadge. */
    counter?: number;
    /** Per-chip controlled selected state (filter). */
    isSelected?: boolean;
    /** Per-chip initial selected state (filter). */
    defaultSelected?: boolean;
    isDisabled?: boolean;
    isReadOnly?: boolean;
    isInvalid?: boolean;
    isWarning?: boolean;
    isExcluded?: boolean;
    /** Accessible label for the chip's dismiss action (input chips). */
    dismissLabel?: string;
    /** Optional CSS max-width for label truncation. */
    maxWidth?: string;
}
export interface ArvoChipListOptions {
    /** Array of ArvoChipListItem configs; the JS component builds an ArvoChip per item. */
    items?: ArvoChipListItem[];
    variant?: 'general' | 'filter' | 'input';
    appearance?: 'primary' | 'outline' | 'utility';
    size?: 'sm' | 'md' | 'lg';
    colorMode?: 'default' | 'semantic' | 'custom';
    selectionMode?: 'none' | 'single' | 'multiple';
    selectedKeys?: Array<string | number>;
    defaultSelectedKeys?: Array<string | number>;
    onSelectionChange?: (detail: {
        keys: Array<string | number>;
        key: string | number;
        isSelected: boolean;
    }) => void;
    overflowMode?: 'none' | 'wrap' | 'single-line' | 'max-rows';
    maxVisibleChips?: number | 'auto';
    maxRows?: number;
    overflowLabel?: (hiddenCount: number) => string;
    overflowAriaLabel?: (hiddenCount: number) => string;
    /**
     * Returns the visible label for the __overflow disclosure when
     * isExpanded=true. Receives no arguments. Defaults to `() => 'Show less'`.
     */
    expandedLabel?: () => string;
    /**
     * Legacy callback fired on overflow disclosure activation. Still fires for
     * backwards compatibility, but new consumers should drive
     * `isExpanded`/`onExpandedChange` (or call `expanded()`) instead.
     */
    onOverflowPress?: () => void;
    /**
     * Initial expanded state. Update after init via `expanded()`. While
     * expanded, the chip-list internally treats its overflowMode as `'wrap'`
     * (no chips hidden) and the persistent `__overflow` ArvoDisclosureButton
     * flips its label + aria-expanded in place.
     */
    isExpanded?: boolean;
    /** Initial uncontrolled expanded state. Ignored when `isExpanded` is provided. */
    defaultExpanded?: boolean;
    /** Called when the expanded state changes via the disclosure (click / Enter / Space). */
    onExpandedChange?: (isExpanded: boolean) => void;
    /**
     * Internal hint for parent token-field components (e.g. ArvoMultiSelect).
     * When true: (1) the disclosure renders at size='md' instead of 'sm' to
     * match a 32px field row; (2) the disclosure renders with tabIndex=-1
     * so the parent field's single tab stop is preserved; (3) the disclosure
     * click stops propagation defensively. Should NOT be set by application
     * code.
     */
    isWithinField?: boolean;
    /**
     * Forces the overflow indicator to be a STATIC, non-interactive label
     * (a `<span>` carrying the `arvo-chip-list__overflow` class with the
     * `--static` modifier). The chevron is suppressed, the click handler is
     * a no-op, the element is not focusable, and the chip-list never pivots
     * its internal overflow mode to `'wrap'` on expansion -- the chips stay
     * strictly within the configured overflow bounds. Used by ArvoMultiSelect
     * when `overflowMode='single-line'` to enforce a true single-row field
     * where surplus chips simply collapse behind an informational "+N more"
     * indicator. When this flag is set the expansion contract is fully
     * disabled (`isExpanded` / `onExpandedChange` / `expandedLabel` are
     * ignored).
     */
    isStaticOverflow?: boolean;
    isReorderable?: boolean;
    onReorder?: (detail: {
        keys: Array<string | number>;
        key: string | number;
        fromIndex: number;
        toIndex: number;
    }) => void;
    isDisabled?: boolean;
    isReadOnly?: boolean;
    isLoading?: boolean;
    ariaLabel?: string;
    ariaLabelledBy?: string;
}
type RequiredChipListOptions = Required<Omit<ArvoChipListOptions, 'onSelectionChange' | 'onReorder' | 'onOverflowPress' | 'onExpandedChange' | 'expandedLabel' | 'overflowLabel' | 'overflowAriaLabel' | 'ariaLabel' | 'ariaLabelledBy' | 'selectedKeys' | 'defaultSelectedKeys' | 'maxRows' | 'isExpanded' | 'defaultExpanded'>> & {
    selectedKeys: Array<string | number> | null;
    defaultSelectedKeys: Array<string | number> | null;
    maxRows: number | null;
    ariaLabel: string | null;
    ariaLabelledBy: string | null;
    overflowLabel: ((hiddenCount: number) => string) | null;
    overflowAriaLabel: ((hiddenCount: number) => string) | null;
    expandedLabel: (() => string) | null;
    onSelectionChange: ((detail: {
        keys: Array<string | number>;
        key: string | number;
        isSelected: boolean;
    }) => void) | null;
    onReorder: ((detail: {
        keys: Array<string | number>;
        key: string | number;
        fromIndex: number;
        toIndex: number;
    }) => void) | null;
    onOverflowPress: (() => void) | null;
    onExpandedChange: ((isExpanded: boolean) => void) | null;
};
/**
 * ArvoChipList -- collection container for ArvoChip instances (vanilla JS twin
 * of the React ArvoChipList). Owns collection-level concerns only: layout,
 * inter-chip gap, wrapping, overflow (with an inline `+n more` action),
 * collection accessibility, filter single/multi selection coordination,
 * reorder, and propagation of shared variant/appearance/size/colorMode plus
 * disabled/readonly/loading context to its child chips. The JS list OWNS its
 * chips: it builds one ArvoChip per item (merging list-context defaults with
 * per-item overrides) instead of consuming React children.
 */
export declare class ArvoChipList {
    readonly el: HTMLElement;
    private _options;
    private _chips;
    private _overflowEl;
    private _overflowBtn;
    private _liveRegionEl;
    private _resizeObserver;
    private _sortable;
    private _selectedSet;
    private _hiddenCount;
    /** True when the chip-overflow is in the expanded state. */
    private _isExpanded;
    /**
     * True when the consumer opted into the chip-list managing its own
     * expanded state (provided `isExpanded`, `defaultExpanded`,
     * `onExpandedChange`, `expandedLabel`, or `isWithinField`). Without
     * opt-in the disclosure click only fires `onOverflowPress` (legacy
     * contract preserved).
     */
    private _expansionOptIn;
    private _pointerReorder;
    private _activeKey;
    private _boundOverflowClick;
    private _boundOverflowMouseDown;
    private _boundChipDismiss;
    private _boundKeyDown;
    static readonly DEFAULTS: RequiredChipListOptions;
    static initialize(element: HTMLElement, options?: ArvoChipListOptions): ArvoChipList;
    constructor(element: HTMLElement, options?: ArvoChipListOptions);
    private get _reorderAllowed();
    private get _showOverflowAction();
    /**
     * Effective overflow mode used for chip measurement. While expanded AND the
     * consumer opted into the expansion contract, treat the mode as 'wrap' so
     * no chips are hidden -- the SCSS modifier class still reflects the
     * consumer-provided overflowMode so layout rules apply correctly.
     */
    private get _effectiveOverflowMode();
    private get _effectiveAppearance();
    private _build;
    private _teardown;
    private _rebuild;
    private _applyRootClassesAndAria;
    private _buildChips;
    private _buildOverflow;
    private _handleOverflowMouseDown;
    private _buildLiveRegion;
    private _announce;
    private _setupOverflow;
    private _getChipEls;
    private _measureOverflow;
    private _setHiddenCount;
    private _updateOverflowButton;
    private _handleOverflowPress;
    private _setExpanded;
    private _setupReorder;
    private _handleReorderCommit;
    private _handleChipToggle;
    private _syncChipSelection;
    private _onChipDismiss;
    private _chipLabel;
    private _focusAfterDismiss;
    setItems(items: ArvoChipListItem[]): void;
    /**
     * Get or set the chip-overflow expanded state. Setting fires
     * `onExpandedChange` + `chip-list:expand-change` and flips the
     * `__overflow` ArvoDisclosureButton label / aria-expanded in place (no
     * DOM re-mount). No-op when overflowMode is 'wrap' / 'none' (no overflow
     * disclosure exists).
     */
    expanded(): boolean;
    expanded(state: boolean): void;
    selectedKeys(): Array<string | number>;
    selectedKeys(next: Array<string | number>): void;
    disabled(): boolean;
    disabled(state: boolean): void;
    readOnly(): boolean;
    readOnly(state: boolean): void;
    setLoading(loading: boolean): void;
    focus(): void;
    destroy(): void;
    private _isChipFocusable;
    /**
     * Apply roving tabindex among visible focusable chips: only the active
     * chip carries tabindex=0, all others carry tabindex=-1. Resolves the
     * active chip from `_activeKey` (preserved across renders), else the
     * first selected chip (filter), else the first focusable chip.
     */
    private _applyRovingTabindex;
    private _handleListKeyDown;
    private _firstFocusable;
    private _dispatch;
    private _toggleAttr;
    private _setOrRemoveAttr;
}
export {};
//# sourceMappingURL=ChipList.d.ts.map