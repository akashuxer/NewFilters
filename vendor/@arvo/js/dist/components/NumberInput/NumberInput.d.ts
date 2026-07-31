import { ArvoFormLabelContextHelpConfig } from '../FormLabel/FormLabel';
/**
 * Payload passed to `ArvoNumberInputOptions.onChange`.
 *
 * Target-independent by design: value changes can originate from stepper
 * buttons, blur clamp, paste, or programmatic `value()` calls, none of which
 * have a real DOM event with a populated `target`. The raw event is still
 * surfaced as the second argument when a DOM event drove the change; it is
 * `null` for programmatic / stepper-driven mutations.
 */
export interface ArvoNumberInputChangePayload {
    /** Resolved numeric value (clamped + step-rounded). Null when input is empty. */
    value: number | null;
    /** Previous value before this change. */
    previousValue: number | null;
    /**
     * What triggered the change.
     * - `'input'`  -- a native `change` event on the inner <input> (user typed + commit / native step).
     * - `'step'`   -- one of the +/- stepper buttons (long-press counts as repeated `'step'`s).
     * - `'blur'`   -- blur clamp normalized an out-of-range value.
     * - `'paste'`  -- paste handler accepted a numeric value.
     * - `'set'`    -- programmatic `instance.value(v)` or other API-driven mutation.
     */
    source: 'input' | 'step' | 'blur' | 'paste' | 'set';
}
export interface ArvoNumberInputOptions {
    value?: number | null;
    min?: number | null;
    max?: number | null;
    step?: number;
    placeholder?: string;
    isDisabled?: boolean;
    isReadOnly?: boolean;
    label?: string | null;
    contextHelp?: ArvoFormLabelContextHelpConfig | null;
    isRequired?: boolean;
    isInvalid?: boolean;
    size?: 'sm' | 'lg';
    surface?: 'filled' | 'base';
    errorMsg?: string | null;
    errorDisplay?: 'inline' | 'tooltip' | 'none';
    isLoading?: boolean;
    isFullWidth?: boolean;
    width?: string | null;
    /**
     * Optional static text rendered inside the field at the leading edge
     * (e.g. `"Wk"`, `"Mo"`, `"px"`, `"$"`). Purely cosmetic -- never parsed,
     * never part of the numeric value, never emitted in `number-input:change`.
     * When set, the block gains the `--has-prefix` modifier and a vertical
     * separator (`__prefix-sep`) is rendered between the prefix and the
     * input. Wired through the shared `form-input-affix` pattern (inline
     * flex sibling of `__input`). `aria-hidden`; pointer clicks forward
     * focus to the inner input.
     */
    prefix?: string | null;
    /**
     * Optional tooltip text shown when hovering the prefix element
     * (e.g. show `"Weeks"` when prefix is `"Wk"`). No tooltip when null.
     * Only effective when the `prefix` option is also set.
     */
    prefixTooltip?: string | null;
    /**
     * Optional static text rendered inside the field at the trailing edge
     * after the numeric value and before the stepper cluster (e.g. `"kg"`,
     * `"%"`, `"USD"`). Purely cosmetic -- never parsed, never part of the
     * numeric value, never emitted in events. `aria-hidden`; pointer clicks
     * forward focus to the inner input.
     */
    suffix?: string | null;
    /**
     * Optional tooltip text shown when hovering the suffix element. No
     * tooltip when null. Only effective when the `suffix` option is also set.
     */
    suffixTooltip?: string | null;
    onInput?: ((event: Event) => void) | null;
    /**
     * Fired whenever the resolved numeric value changes (typed input,
     * stepper, blur clamp, paste, programmatic set). The first argument is a
     * typed payload (`ArvoNumberInputChangePayload`); the second argument is
     * the originating DOM event when one exists (`null` for stepper /
     * programmatic / blur-clamp paths).
     */
    onChange?: ((payload: ArvoNumberInputChangePayload, event: Event | null) => void) | null;
    onFocus?: ((event: Event) => void) | null;
    onBlur?: ((event: Event) => void) | null;
}
type RequiredNumberInputOptions = Required<Omit<ArvoNumberInputOptions, 'onInput' | 'onChange' | 'onFocus' | 'onBlur' | 'label' | 'contextHelp' | 'errorMsg' | 'value' | 'min' | 'max' | 'width' | 'prefix' | 'prefixTooltip' | 'suffix' | 'suffixTooltip'>> & {
    value: number | null;
    min: number | null;
    max: number | null;
    label: string | null;
    contextHelp: ArvoFormLabelContextHelpConfig | null;
    errorMsg: string | null;
    width: string | null;
    prefix: string | null;
    prefixTooltip: string | null;
    suffix: string | null;
    suffixTooltip: string | null;
    onInput: ((event: Event) => void) | null;
    onChange: ((payload: ArvoNumberInputChangePayload, event: Event | null) => void) | null;
    onFocus: ((event: Event) => void) | null;
    onBlur: ((event: Event) => void) | null;
};
export declare class ArvoNumberInput {
    private _element;
    private _options;
    private _inputEl;
    private _fieldEl;
    private _borderEl;
    private _labelEl;
    private _steppersEl;
    private _incrementBtn;
    private _decrementBtn;
    private _stepperSepEl;
    private _incrementBtnInstance;
    private _decrementBtnInstance;
    private _actionsEl;
    private _prefixEl;
    private _prefixSepEl;
    private _prefixConnector;
    private _suffixEl;
    private _suffixConnector;
    private _boundHandleAffixMouseDown;
    private _errIcoEl;
    private _errIcoConnector;
    private _errMsgAlert;
    private _inlineAlert;
    private _inlineAlertEl;
    private _resizeObserver;
    private _previousValue;
    private _inputId;
    private _errorId;
    private _boundHandleInput;
    private _boundHandleChange;
    private _boundHandleFocus;
    private _boundHandleBlur;
    private _boundHandleKeyDown;
    private _boundHandlePaste;
    private _boundHandleIncrementMouseDown;
    private _boundHandleDecrementMouseDown;
    private _boundHandleMouseUp;
    private _boundHandleMouseLeave;
    private _boundHandleIncrementTouchStart;
    private _boundHandleDecrementTouchStart;
    private _boundHandleTouchEnd;
    private _repeatInterval;
    private _repeatTimeout;
    private _repeatAccelTimeout;
    static readonly SIZES: readonly ["sm", "lg"];
    static readonly SURFACES: readonly ["filled", "base"];
    static readonly DEFAULTS: RequiredNumberInputOptions;
    static initialize(element: HTMLDivElement, options?: ArvoNumberInputOptions): ArvoNumberInput;
    constructor(element: HTMLDivElement, options?: ArvoNumberInputOptions);
    private _render;
    private _bindEvents;
    private _handleInput;
    private _handleChange;
    private _handleFocus;
    private _handleBlur;
    private _handlePaste;
    private _handleKeyDown;
    private _handleIncrementMouseDown;
    private _handleDecrementMouseDown;
    private _handleIncrementTouchStart;
    private _handleDecrementTouchStart;
    private _startLongPress;
    private _clearRepeat;
    private _stepBy;
    private _setValueAndNotify;
    private _clamp;
    private _updatePadding;
    private _handleAffixMouseDown;
    private _updateMinMaxClasses;
    private _dispatchEvent;
    value(): number | null;
    value(newValue: number): void;
    clear(): void;
    validate(): {
        valid: boolean;
        errors: string[];
    };
    setError(message: string | false): void;
    focus(): void;
    width(): string | null;
    width(value: string): void;
    suffix(): string | null;
    suffix(value: string | null): void;
    suffixTooltip(): string | null;
    suffixTooltip(text: string | null): void;
    disabled(): boolean;
    disabled(state: boolean): void;
    setLoading(isLoading: boolean): void;
    destroy(): void;
}
export {};
//# sourceMappingURL=NumberInput.d.ts.map