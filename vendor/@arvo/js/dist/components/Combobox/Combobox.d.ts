import { ListItemBase, ListGroup } from '../../../../core/src';
import { ArvoFormLabelContextHelpConfig } from '../FormLabel/FormLabel';
import { ArvoOptionListOptions } from '../OptionList/OptionList';
export interface ComboboxOptionData extends ListItemBase {
    value: unknown;
}
/**
 * Scoped escape-hatch bag for inner `ArvoOptionList` config the field does not
 * curate as a flat option. Mirrors React `ComboboxOptionListProps` exactly --
 * the drift reviewer enforces key-set parity.
 */
export type ComboboxOptionListProps = Pick<ArvoOptionListOptions, 'emptyConfig' | 'variant' | 'isCreatable' | 'onCreate'>;
export interface ArvoComboboxOptions {
    items: ComboboxOptionData[] | ListGroup<ComboboxOptionData>[];
    /** Controlled/initial selected value. Update after init via value(). */
    value?: unknown;
    /** Uncontrolled initial value. Used only when value is omitted. */
    defaultValue?: unknown;
    /** Controlled/initial filter text. Update after init via inputValue(). */
    inputValue?: string;
    placeholder?: string;
    /**
     * Optional leading icon name (without the `o9con-` prefix) rendered inside
     * `__field` before the prefix / input. 16px square; recolored by parent
     * state through the shared `form-input-affix` pattern. The chevron is a
     * separate slot (`__chevron`).
     */
    icon?: string;
    /**
     * Optional static text rendered inside `__field` at the leading edge after
     * `__ico` (e.g. `"https://"`, `"@"`, `"Filter:"`). Cosmetic only -- never
     * part of the typed filter text, never echoed in events. When set, a
     * vertical separator (`__prefix-sep`) is rendered between the prefix and
     * the input. `aria-hidden`; pointer clicks forward focus to the inner
     * input.
     */
    prefix?: string;
    /**
     * Optional tooltip text shown when hovering the prefix element. No
     * tooltip when null. Only effective when `prefix` is also set.
     */
    prefixTooltip?: string;
    label?: string;
    contextHelp?: ArvoFormLabelContextHelpConfig | null;
    isDisabled?: boolean;
    isRequired?: boolean;
    isInvalid?: boolean;
    errorMsg?: string;
    errorDisplay?: 'inline' | 'tooltip' | 'none';
    size?: 'sm' | 'lg';
    surface?: 'filled' | 'base';
    isClearable?: boolean;
    isLoading?: boolean;
    isReadOnly?: boolean;
    isFullWidth?: boolean;
    width?: string;
    placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'auto';
    maxHeight?: string;
    hasGroupDividers?: boolean;
    filterFn?: (item: ComboboxOptionData, query: string) => boolean;
    closeOnSelect?: boolean;
    /** Initial open state (parity with React's controlled isOpen). Drive after init via open()/close()/toggle(). */
    isOpen?: boolean;
    /** Uncontrolled initial open state. Used only when isOpen is omitted. */
    defaultOpen?: boolean;
    onChange?: (item: ComboboxOptionData, index: number) => boolean | void;
    onInputChange?: (value: string) => void;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    onClear?: (detail: {
        previousValue: unknown;
    }) => void;
    onOpenChange?: (isOpen: boolean) => void;
    /**
     * Scoped escape-hatch bag for inner `ArvoOptionList` options the field does
     * not curate flat (e.g. `emptyConfig`, `variant`, `isCreatable`,
     * `onCreate`). Spread first so the field's flat / computed options always
     * win on overlap.
     */
    optionListProps?: ComboboxOptionListProps;
}
type RequiredComboboxOptions = Required<Omit<ArvoComboboxOptions, 'onChange' | 'onInputChange' | 'onOpen' | 'onClose' | 'onClear' | 'onOpenChange' | 'maxHeight' | 'errorMsg' | 'filterFn' | 'inputValue' | 'width' | 'optionListProps' | 'contextHelp' | 'icon' | 'prefix' | 'prefixTooltip' | 'value' | 'defaultValue' | 'isOpen' | 'defaultOpen'>> & {
    maxHeight: string | null;
    errorMsg: string | null;
    inputValue: string | null;
    width: string | null;
    filterFn: ((item: ComboboxOptionData, query: string) => boolean) | null;
    optionListProps: ComboboxOptionListProps | null;
    contextHelp: ArvoFormLabelContextHelpConfig | null;
    icon: string | null;
    prefix: string | null;
    prefixTooltip: string | null;
    onChange: ((item: ComboboxOptionData, index: number) => boolean | void) | null;
    onInputChange: ((value: string) => void) | null;
    onOpen: (() => boolean | void) | null;
    onClose: (() => boolean | void) | null;
    onClear: ((detail: {
        previousValue: unknown;
    }) => void) | null;
    onOpenChange: ((isOpen: boolean) => void) | null;
};
export declare class ArvoCombobox {
    private _element;
    private _options;
    private _fieldEl;
    private _inputEl;
    private _icoEl;
    private _prefixEl;
    private _prefixSepEl;
    private _prefixConnector;
    private _actionsEl;
    private _clearEl;
    private _clearBtn;
    private _sepEl;
    private _errIcoEl;
    private _errIcoConnector;
    private _chevronEl;
    private _chevronBtn;
    private _borderEl;
    private _labelEl;
    private _alertEl;
    private _inlineAlert;
    private _errMsgAlert;
    private _resizeObs;
    private _optionList;
    private _isOpen;
    private _isDisabled;
    private _isLoading;
    private _isReadonly;
    private _value;
    private _inputText;
    private _id;
    private _boundHandleInputInput;
    private _boundHandleInputKeyDown;
    private _boundHandleAffixMouseDown;
    private _boundHandleFieldMouseDown;
    static readonly DEFAULTS: RequiredComboboxOptions;
    static initialize(element: HTMLElement, options: ArvoComboboxOptions): ArvoCombobox;
    constructor(element: HTMLElement, options: ArvoComboboxOptions);
    private _buildRoot;
    private _setupOptionList;
    private _filteredItems;
    private _refreshOptionListItems;
    private _applyRootClasses;
    private _applyWidthStyle;
    private _updatePadding;
    private _setupResizeObserver;
    private _handleInputInput;
    private _handleInputKeyDown;
    private _handleChevronClick;
    private _handleAffixMouseDown;
    /**
     * Mousedown on the field. Preserves input focus during clicks on
     * non-input affordances (chevron, clear, actions cluster, leading
     * icon, prefix, the field background between them). Without this,
     * the browser moves focus to the click target on mousedown -- the
     * input would blur, the focus-within border styling would drop, and
     * any selection in the input would clear. The actual click handler
     * still runs on the target; we only suppress the focus shift.
     *
     * Required by the trigger-on-field overlay wiring: the chevron sits
     * inside the field (trigger boundary), so its click is correctly
     * treated as "inside" by the hub's outside-click dismissal, but we
     * still want pointer interactions across the field to feel like one
     * continuous interaction surface with the input as the focused
     * element.
     */
    private _handleFieldMouseDown;
    private _handleOptionChange;
    private _handleListOpenChange;
    open(): void;
    private _doOpen;
    close(): void;
    private _doClose;
    toggle(force?: boolean): void;
    isOpen(): boolean;
    value(newValue?: unknown): unknown | void;
    inputValue(text?: string): string | void;
    icon(): string | null;
    icon(name: string | null): void;
    prefix(): string | null;
    prefix(value: string | null): void;
    clear(): void;
    updateItems(items: ComboboxOptionData[] | ListGroup<ComboboxOptionData>[]): void;
    disabled(state?: boolean): boolean | void;
    setError(message: string | false): void;
    private _buildInlineAlert;
    setLoading(isLoading: boolean): void;
    width(cssValue?: string): string | void;
    focus(): void;
    destroy(): void;
}
export {};
//# sourceMappingURL=Combobox.d.ts.map