import { ListItemBase, ListGroup } from '../../../../core/src';
import { ArvoFormLabelContextHelpConfig } from '../FormLabel/FormLabel';
import { ArvoChipListOptions } from '../ChipList/ChipList';
import { ArvoOptionListOptions } from '../OptionList/OptionList';
export type MultiSelectOverflowMode = 'expandable' | 'single-line' | 'wrap';
export interface MultiSelectOptionData extends ListItemBase {
    value: unknown;
}
/**
 * Scoped escape-hatch bag for inner `ArvoChipList` config the field does not
 * curate as a flat option. Mirrors React `MultiSelectChipListProps` exactly --
 * the drift reviewer enforces key-set parity.
 */
export type MultiSelectChipListProps = Pick<ArvoChipListOptions, 'overflowLabel' | 'overflowAriaLabel' | 'isReorderable' | 'onReorder'>;
/**
 * Scoped escape-hatch bag for inner `ArvoOptionList` config the field does not
 * curate as a flat option. Mirrors React `MultiSelectOptionListProps` exactly --
 * the drift reviewer enforces key-set parity.
 */
export type MultiSelectOptionListProps = Pick<ArvoOptionListOptions, 'emptyConfig' | 'variant' | 'isCreatable' | 'onCreate'>;
export interface ArvoMultiSelectOptions {
    /** Options as a flat array or grouped array. Required. */
    items: MultiSelectOptionData[] | ListGroup<MultiSelectOptionData>[];
    /** Controlled/initial selected value set. Update after init via value(). */
    value?: unknown[];
    /** Uncontrolled initial value set. Used only when value is omitted. */
    defaultValue?: unknown[];
    /** Controlled filter text. Update after init via inputValue(). */
    inputValue?: string;
    /** Placeholder text shown in the input when there are no selected chips. */
    placeholder?: string;
    /** Label text rendered above the field via ArvoFormLabel. */
    label?: string;
    /**
     * Optional contextual-help icon attached to the field label. When provided,
     * embeds an `ArvoContextHelp` at `size: 'sm'` (14px) absolutely positioned
     * to the right of the label. Has no effect when `label` is omitted.
     */
    contextHelp?: ArvoFormLabelContextHelpConfig | null;
    /** Prevents all interaction. Propagates to the inner chips and dropdown. */
    isDisabled?: boolean;
    /** Marks the field as required. */
    isRequired?: boolean;
    /** Shows error/invalid styling (negative bottom border). */
    isInvalid?: boolean;
    /** Error message shown when isInvalid is true. */
    errorMsg?: string;
    /** How validation error feedback is presented. */
    errorDisplay?: 'inline' | 'tooltip' | 'none';
    /** Shows a clear-all button when the value set is non-empty and interactive. */
    isClearable?: boolean;
    /** Shows the Pattern C loading state (spinner replaces chevron, panel blocked). */
    isLoading?: boolean;
    /** Read-only: chips visible but not removable, no typing, panel does not open. */
    isReadOnly?: boolean;
    /** CSS width value (e.g. '200px', '50%'). Sets --arvo-form-input-width. */
    width?: string;
    /** Shorthand for width='100%'. Takes precedence over width. */
    isFullWidth?: boolean;
    /**
     * Visual fill of the token field. `'filled'` (default) renders the tinted
     * field background. `'base'` swaps to the host surface color so the field
     * reads as a flat extension of its parent (toolbars, side panels, table
     * cells, inline-edit rows). Only the at-rest field background changes;
     * hover, focus, disabled, readonly, error, text, border, and icon colors
     * are identical across both surfaces.
     */
    surface?: 'filled' | 'base';
    /** How selected chips overflow inside the field. */
    overflowMode?: MultiSelectOverflowMode;
    /** Maximum chip rows in collapsed state (overflowMode='expandable'). */
    maxRows?: number;
    /** Maximum chip rows when expanded before scrolling. */
    expandedMaxRows?: number;
    /** Controlled chip-overflow expanded state. Drive after init via expanded(). */
    isExpanded?: boolean;
    /** Uncontrolled initial expanded state. */
    defaultExpanded?: boolean;
    /** Visual appearance applied to the selected-value ArvoChips. */
    chipAppearance?: 'primary' | 'outline' | 'utility';
    /** Optional cap on the number of selected values. null = unlimited. */
    maxSelections?: number;
    /** Preferred placement of the dropdown relative to the field. */
    placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'auto';
    /** Maximum height of the dropdown panel (CSS length). */
    maxHeight?: string;
    /** When true and items are grouped, renders dividers between groups. */
    hasGroupDividers?: boolean;
    /** Custom filter function: (item, query) => boolean. */
    filterFn?: (item: MultiSelectOptionData, query: string) => boolean;
    /** Whether selecting an option closes the panel. Defaults to false. */
    closeOnSelect?: boolean;
    /** Initial open state. Drive after init via open()/close()/toggle(). */
    isOpen?: boolean;
    /** Uncontrolled initial open state. */
    defaultOpen?: boolean;
    /** Called when the selected value set changes. */
    onChange?: (value: unknown[], item: MultiSelectOptionData | null, isSelected: boolean) => void;
    /** Called on each keystroke in the filter input. */
    onInputChange?: (value: string) => void;
    /** Called when a single chip is dismissed (fires in addition to onChange). */
    onRemove?: (value: unknown, item: MultiSelectOptionData) => void;
    /** Called when all values are cleared via the clear-all button. */
    onClear?: (detail: {
        previousValue: unknown[];
    }) => void;
    /** Called before the panel opens. Return false to cancel. */
    onOpen?: () => boolean | void;
    /** Called before the panel closes. Return false to cancel. */
    onClose?: () => boolean | void;
    /** Called after the open state changes. */
    onOpenChange?: (open: boolean) => void;
    /** Called after the chip-overflow expanded state changes. */
    onExpandedChange?: (expanded: boolean) => void;
    /**
     * Scoped escape-hatch bag for inner `ArvoChipList` options the field does
     * not curate flat. Spread first so the field's flat / computed options always
     * win on overlap.
     */
    chipListProps?: MultiSelectChipListProps;
    /**
     * Scoped escape-hatch bag for inner `ArvoOptionList` options the field does
     * not curate flat. Spread first so the field's flat / computed options always
     * win on overlap.
     */
    optionListProps?: MultiSelectOptionListProps;
}
type RequiredMultiSelectOptions = Required<Omit<ArvoMultiSelectOptions, 'onChange' | 'onInputChange' | 'onRemove' | 'onClear' | 'onOpen' | 'onClose' | 'onOpenChange' | 'onExpandedChange' | 'maxHeight' | 'errorMsg' | 'width' | 'filterFn' | 'chipListProps' | 'optionListProps' | 'maxSelections' | 'contextHelp' | 'value' | 'defaultValue' | 'inputValue' | 'isOpen' | 'defaultOpen' | 'isExpanded' | 'defaultExpanded'>> & {
    width: string | null;
    maxHeight: string | null;
    errorMsg: string | null;
    maxSelections: number | null;
    filterFn: ((item: MultiSelectOptionData, query: string) => boolean) | null;
    chipListProps: MultiSelectChipListProps | null;
    optionListProps: MultiSelectOptionListProps | null;
    contextHelp: ArvoFormLabelContextHelpConfig | null;
    onChange: ((value: unknown[], item: MultiSelectOptionData | null, isSelected: boolean) => void) | null;
    onInputChange: ((value: string) => void) | null;
    onRemove: ((value: unknown, item: MultiSelectOptionData) => void) | null;
    onClear: ((detail: {
        previousValue: unknown[];
    }) => void) | null;
    onOpen: (() => boolean | void) | null;
    onClose: (() => boolean | void) | null;
    onOpenChange: ((open: boolean) => void) | null;
    onExpandedChange: ((expanded: boolean) => void) | null;
};
export declare class ArvoMultiSelect {
    private _element;
    private _options;
    private _fieldEl;
    private _valueEl;
    private _chipsEl;
    private _inputEl;
    private _actionsEl;
    private _clearEl;
    private _sepEl;
    private _icoEl;
    private _errIcoEl;
    private _borderEl;
    private _labelEl;
    private _alertEl;
    /**
     * Captured ref to the persistent ArvoDisclosureButton DOM element owned
     * by the inner ArvoChipList. Lets MultiSelect include the disclosure in
     * the active-descendant walk and programmatically activate it
     * (Enter/Space on the disclosure-as-active-descendant). Read freshly
     * after each chip-list rebuild.
     */
    private _overflowBtnEl;
    private _chipList;
    private _optionList;
    private _clearBtn;
    private _chevronBtn;
    private _errMsgAlert;
    private _inlineAlert;
    private _isOpen;
    private _isDisabled;
    private _isLoading;
    private _isReadonly;
    private _value;
    private _inputText;
    private _isExpanded;
    private _id;
    private _activeChipIndex;
    private _boundHandleFieldClick;
    private _boundHandleFieldMouseDown;
    private _boundHandleInputKeyDown;
    private _boundHandleInputInput;
    private _boundHandleInputFocus;
    private _boundHandleInputBlur;
    private _boundChipListDismiss;
    static readonly DEFAULTS: RequiredMultiSelectOptions;
    static initialize(element: HTMLElement, options: ArvoMultiSelectOptions): ArvoMultiSelect;
    constructor(element: HTMLElement, options: ArvoMultiSelectOptions);
    private _buildRoot;
    private _setupOptionList;
    private _interactive;
    private _dispatch;
    private _optionByValue;
    /** Filtered (by input text) + maxSelections-capped items passed to ArvoOptionList. */
    private _processedItems;
    private _expandedActive;
    private _chipListOverflowMode;
    private _applyStyleVars;
    private _buildChipItems;
    private _renderChips;
    /**
     * Assign a stable id to each rendered chip element so the input can point
     * `aria-activedescendant` at it when the user walks chips via arrow keys.
     * The chip-list's __overflow disclosure also gets an id so the cursor can
     * land on it.
     */
    private _assignChipIds;
    /**
     * Capture the disclosure DOM element for the active-descendant walk.
     * Strict single-line mode renders the disclosure as a non-interactive
     * `<span>` (`.arvo-chip-list__overflow--static`); skip it so the
     * active-descendant cursor walks chips only.
     */
    private _captureOverflowBtn;
    /** Visible chip elements, in render order, excluding hidden overflow chips. */
    private _getVisibleChipEls;
    /**
     * Number of slots the active-descendant cursor can walk through: visible
     * chips + the persistent __overflow disclosure (when one is rendered).
     * Mirrors the React twin's `getCursorSlotCount`.
     */
    private _getCursorSlotCount;
    /** True if the active descendant is currently the disclosure slot. */
    private _activeIsDisclosure;
    private _setActiveChip;
    private _clearActiveChip;
    /** Mirror the active chip/disclosure index onto the DOM. */
    private _syncActiveChipHighlight;
    /** Re-sync the chips, dropdown selection, dropdown items, and root classes. */
    private _afterValueChange;
    private _refreshOptionListItems;
    private _setExpanded;
    private _handleRemove;
    private _handleClearAll;
    private _handleChipListDismiss;
    private _handleChevronClick;
    private _setInputText;
    private _applyRootClasses;
    private _applyWidthStyle;
    /**
     * Capture-phase mousedown on __field. Preserves input focus during clicks
     * on non-input controls (chip-list overflow disclosure, chip dismiss
     * spans, clear/chevron action buttons, chip bodies). Without this,
     * browsers move focus to the click target on mousedown -- the input
     * would blur (clearing typed text) and any active-descendant chip
     * highlight would be torn down. The actual click handler still runs on
     * the target; we only suppress the focus shift.
     */
    private _handleFieldMouseDown;
    private _handleFieldClick;
    private _handleInputKeyDown;
    /** Remove the chip currently highlighted by the active-descendant cursor. */
    private _removeActiveChip;
    private _handleInputInput;
    private _handleInputFocus;
    private _handleInputBlur;
    private _handleOptionChange;
    private _handleListOpenChange;
    open(): void;
    private _doOpen;
    close(): void;
    private _doClose;
    toggle(force?: boolean): void;
    isOpen(): boolean;
    value(newValue?: unknown[]): unknown[] | void;
    add(val: unknown): void;
    remove(val: unknown): void;
    inputValue(text?: string): string | void;
    clear(): void;
    expanded(state?: boolean): boolean | void;
    updateItems(items: MultiSelectOptionData[] | ListGroup<MultiSelectOptionData>[]): void;
    disabled(state?: boolean): boolean | void;
    setError(message: string | false): void;
    setLoading(isLoading: boolean): void;
    width(cssValue?: string): string | void;
    focus(): void;
    destroy(): void;
}
export {};
//# sourceMappingURL=MultiSelect.d.ts.map