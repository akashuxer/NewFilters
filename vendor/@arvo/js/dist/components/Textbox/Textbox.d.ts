import { ArvoFormLabelContextHelpConfig } from '../FormLabel/FormLabel';
export type ArvoTextboxType = 'text' | 'url' | 'password' | 'email';
export interface ArvoTextboxOptions {
    value?: string;
    placeholder?: string;
    isDisabled?: boolean;
    isReadOnly?: boolean;
    label?: string;
    contextHelp?: ArvoFormLabelContextHelpConfig | null;
    isRequired?: boolean;
    isInvalid?: boolean;
    size?: 'sm' | 'lg';
    surface?: 'filled' | 'base';
    /**
     * HTML input type. Drives type-specific behavior beyond the native
     * `<input type>`:
     * - `text` (default): standard textbox.
     * - `url`: locks the leading icon to `desktop`; `prefix` configurable.
     * - `email`: locks the leading icon to `envelope-o`.
     * - `password`: renders an eye visibility toggle in the trailing actions
     *   slot; `icon`, `prefix`, `prefixTooltip`, `suffix`, `suffixTooltip`,
     *   and `isClearable` are silently ignored (a dev-only warning fires
     *   when any are passed).
     */
    type?: ArvoTextboxType;
    maxLength?: number | null;
    hasCounter?: boolean;
    errorMsg?: string;
    errorDisplay?: 'inline' | 'tooltip' | 'none';
    isClearable?: boolean;
    isLoading?: boolean;
    isFullWidth?: boolean;
    width?: string;
    /**
     * Initial state of the password visibility toggle. Only effective when
     * `type === 'password'`. Defaults to `false` (value hidden). Use the
     * `passwordVisible()` method to read or change after initialization.
     */
    isPasswordVisible?: boolean;
    /**
     * Optional leading icon name (without the `o9con-` prefix) rendered inside
     * `__field` before the prefix / input. 16px square; recolored by parent
     * state through the shared `form-input-affix` pattern.
     */
    icon?: string | null;
    /**
     * Optional static text rendered inside `__field` at the leading edge after
     * `__ico` (e.g. `"https://"`, `"@"`, `"Order #"`). Cosmetic only -- never
     * part of the input value, never parsed, never emitted in `textbox:change`.
     * When set, a vertical separator (`__prefix-sep`) is rendered between the
     * prefix and the input. `aria-hidden` on the prefix; pointer clicks
     * forward focus to the inner input.
     */
    prefix?: string | null;
    /**
     * Optional tooltip text shown when hovering the prefix element. No
     * tooltip when null. Only effective when `prefix` is also set.
     */
    prefixTooltip?: string | null;
    /**
     * Optional static text rendered inside `__field` at the trailing edge
     * after the input (e.g. `".com"`, `"kg"`). Cosmetic only -- never part of
     * the input value, never parsed, never emitted in events. `aria-hidden`;
     * pointer clicks forward focus to the inner input.
     */
    suffix?: string | null;
    /**
     * Optional tooltip text shown when hovering the suffix element. No
     * tooltip when null. Only effective when `suffix` is also set.
     */
    suffixTooltip?: string | null;
    onInput?: (event: Event) => void;
    onChange?: (event: Event) => void;
    onFocus?: (event: Event) => void;
    onBlur?: (event: Event) => void;
    onKeyDown?: (event: KeyboardEvent) => void;
}
type RequiredTextboxOptions = Required<Omit<ArvoTextboxOptions, 'onInput' | 'onChange' | 'onFocus' | 'onBlur' | 'onKeyDown' | 'label' | 'errorMsg' | 'icon' | 'prefix' | 'prefixTooltip' | 'suffix' | 'suffixTooltip' | 'maxLength' | 'width' | 'contextHelp'>> & {
    label: string | null;
    contextHelp: ArvoFormLabelContextHelpConfig | null;
    errorMsg: string | null;
    icon: string | null;
    prefix: string | null;
    prefixTooltip: string | null;
    suffix: string | null;
    suffixTooltip: string | null;
    maxLength: number | null;
    width: string | null;
    onInput: ((event: Event) => void) | null;
    onChange: ((event: Event) => void) | null;
    onFocus: ((event: Event) => void) | null;
    onBlur: ((event: Event) => void) | null;
    onKeyDown: ((event: KeyboardEvent) => void) | null;
};
export declare class ArvoTextbox {
    private _element;
    private _options;
    private _inputEl;
    private _fieldEl;
    private _actionsEl;
    private _borderEl;
    private _labelEl;
    private _counterEl;
    private _clearEl;
    private _clearBtn;
    private _errIcoEl;
    private _errIcoConnector;
    private _errMsgAlert;
    private _inlineAlert;
    private _inlineAlertEl;
    private _icoEl;
    private _prefixEl;
    private _prefixSepEl;
    private _suffixEl;
    private _prefixConnector;
    private _suffixConnector;
    private _resizeObserver;
    private _previousValue;
    private _inputId;
    private _errorId;
    private _pwToggleEl;
    private _pwToggleBtn;
    private _isPasswordVisible;
    private _boundHandleInput;
    private _boundHandleChange;
    private _boundHandleFocus;
    private _boundHandleBlur;
    private _boundHandleKeydown;
    private _boundHandleClearClick;
    private _boundHandleAffixMouseDown;
    private _boundHandlePwToggleClick;
    static readonly SIZES: readonly ["sm", "lg"];
    static readonly SURFACES: readonly ["filled", "base"];
    static readonly TYPES: readonly ["text", "url", "password", "email"];
    static readonly DEFAULTS: RequiredTextboxOptions;
    static initialize(element: HTMLDivElement, options?: ArvoTextboxOptions): ArvoTextbox;
    constructor(element: HTMLDivElement, options?: ArvoTextboxOptions);
    private _render;
    private _updatePadding;
    private _bindEvents;
    private _handleInput;
    private _handleChange;
    private _handleFocus;
    private _handleBlur;
    private _handleKeydown;
    private _handleClear;
    private _handlePwToggleClick;
    private _handleAffixMouseDown;
    private _dispatchEvent;
    value(): string;
    value(newValue: string): void;
    clear(): void;
    validate(): {
        valid: boolean;
        errors: string[];
    };
    setError(message: string | false): void;
    focus(): void;
    width(): string | null;
    width(value: string): void;
    passwordVisible(): boolean;
    passwordVisible(value: boolean): void;
    disabled(): boolean;
    disabled(state: boolean): void;
    icon(): string | null;
    icon(name: string | null): void;
    prefix(): string | null;
    prefix(value: string | null): void;
    suffix(): string | null;
    suffix(value: string | null): void;
    setLoading(isLoading: boolean): void;
    destroy(): void;
}
export {};
//# sourceMappingURL=Textbox.d.ts.map