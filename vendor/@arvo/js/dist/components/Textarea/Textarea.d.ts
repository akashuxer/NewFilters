import { ArvoFormLabelContextHelpConfig } from '../FormLabel/FormLabel';
export interface ArvoTextareaOptions {
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
    icon?: string;
    rows?: number;
    maxLength?: number | null;
    hasCounter?: boolean;
    autoResize?: boolean;
    resizable?: 'none' | 'vertical' | 'both';
    errorMsg?: string;
    errorDisplay?: 'inline' | 'tooltip' | 'none';
    /**
     * Shows a clear button (ArvoIconButton, icon `close`) inside the top-right
     * actions overlay whenever the textarea has a value. Unlike the textbox
     * clear button which only appears on hover/focus, the textarea clear
     * button stays visible while a value is present so the text content never
     * shifts as the pointer enters or leaves the field. Suppressed in
     * disabled, readonly, and loading states, and replaced by the in-field
     * error icon when `errorDisplay='tooltip'` and `isInvalid` are both set.
     */
    isClearable?: boolean;
    isLoading?: boolean;
    width?: string;
    isFullWidth?: boolean;
    onInput?: (event: Event) => void;
    onChange?: (event: Event) => void;
    onFocus?: (event: Event) => void;
    onBlur?: (event: Event) => void;
    onKeyDown?: (event: KeyboardEvent) => void;
}
type RequiredTextareaOptions = Required<Omit<ArvoTextareaOptions, 'onInput' | 'onChange' | 'onFocus' | 'onBlur' | 'onKeyDown' | 'label' | 'errorMsg' | 'maxLength' | 'icon' | 'width' | 'contextHelp'>> & {
    label: string | null;
    contextHelp: ArvoFormLabelContextHelpConfig | null;
    errorMsg: string | null;
    maxLength: number | null;
    icon: string | null;
    width: string | null;
    onInput: ((event: Event) => void) | null;
    onChange: ((event: Event) => void) | null;
    onFocus: ((event: Event) => void) | null;
    onBlur: ((event: Event) => void) | null;
    onKeyDown: ((event: KeyboardEvent) => void) | null;
};
export declare class ArvoTextarea {
    private _element;
    private _options;
    private _textareaEl;
    private _fieldEl;
    private _actionsEl;
    private _borderEl;
    private _labelEl;
    private _counterEl;
    private _icoEl;
    private _clearEl;
    private _clearBtn;
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
    private _boundHandleKeydown;
    private _boundHandleClearClick;
    private _boundHandleIcoMouseDown;
    static readonly SIZES: readonly ["sm", "lg"];
    static readonly SURFACES: readonly ["filled", "base"];
    static readonly RESIZABLE: readonly ["none", "vertical", "both"];
    static readonly DEFAULTS: RequiredTextareaOptions;
    static initialize(element: HTMLDivElement, options?: ArvoTextareaOptions): ArvoTextarea;
    constructor(element: HTMLDivElement, options?: ArvoTextareaOptions);
    private _render;
    private _captureMinHeight;
    private _updatePadding;
    private _bindEvents;
    private _handleIcoMouseDown;
    private _handleInput;
    private _handleChange;
    private _handleFocus;
    private _handleBlur;
    private _handleKeydown;
    private _handleClearClick;
    private _recalcAutoResize;
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
    disabled(): boolean;
    disabled(state: boolean): void;
    icon(): string | null;
    icon(name: string | null): void;
    setLoading(isLoading: boolean): void;
    destroy(): void;
}
export {};
//# sourceMappingURL=Textarea.d.ts.map