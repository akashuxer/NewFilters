import { ArvoFormLabelContextHelpConfig } from '../FormLabel/FormLabel';
export interface ArvoCheckboxOptions {
    label?: string | null;
    contextHelp?: ArvoFormLabelContextHelpConfig | null;
    isChecked?: boolean;
    isIndeterminate?: boolean;
    isDisabled?: boolean;
    isReadOnly?: boolean;
    isRequired?: boolean;
    isInvalid?: boolean;
    isExcluded?: boolean;
    size?: 'sm' | 'lg';
    value?: string;
    name?: string;
    /**
     * When true, renders a secondary `__desc` line below the label (gated on a
     * non-empty `description` option). Off by default so the standalone control
     * stays single-line; consumers opt into the two-line treatment per-checkbox.
     */
    hasDescription?: boolean;
    /** Description text rendered below the label when `hasDescription` is true. */
    description?: string | null;
    errorMsg?: string | null;
    errorDisplay?: 'inline' | 'none';
    isLoading?: boolean;
    onChange?: (detail: {
        isChecked: boolean;
        value: string;
    }) => void;
    onFocus?: (event: Event) => void;
    onBlur?: (event: Event) => void;
}
type RequiredCheckboxOptions = Required<Omit<ArvoCheckboxOptions, 'onChange' | 'onFocus' | 'onBlur' | 'name' | 'label' | 'contextHelp' | 'errorMsg' | 'description'>> & {
    label: string | null;
    contextHelp: ArvoFormLabelContextHelpConfig | null;
    description: string | null;
    errorMsg: string | null;
    name: string | undefined;
    onChange: ((detail: {
        isChecked: boolean;
        value: string;
    }) => void) | null;
    onFocus: ((event: Event) => void) | null;
    onBlur: ((event: Event) => void) | null;
};
export declare class ArvoCheckbox {
    private _element;
    private _options;
    private _inputEl;
    private _inputWrapperEl;
    private _fieldEl;
    private _textContainerEl;
    private _labelEl;
    private _descEl;
    private _inlineAlert;
    private _inlineAlertEl;
    private _inputId;
    private _errorId;
    private _boundHandleChange;
    private _boundHandleFocus;
    private _boundHandleBlur;
    static readonly SIZES: readonly ["sm", "lg"];
    static readonly DEFAULTS: RequiredCheckboxOptions;
    static initialize(element: HTMLElement, options?: ArvoCheckboxOptions): ArvoCheckbox;
    constructor(element: HTMLElement, options?: ArvoCheckboxOptions);
    private _render;
    private _bindEvents;
    private _handleChange;
    private _handleFocus;
    private _handleBlur;
    private _syncCheckedState;
    private _dispatchEvent;
    private _ensureTextContainer;
    private _removeTextContainerIfEmpty;
    toggle(force?: boolean): void;
    checked(): boolean;
    indeterminate(state?: boolean): boolean | void;
    excluded(state?: boolean): boolean | void;
    setLabel(label: string | null): void;
    setDescription(description: string | null): void;
    disabled(state?: boolean): boolean | void;
    readonly(state?: boolean): boolean | void;
    setError(messageOrFalse: string | false): void;
    setLoading(isLoading: boolean): void;
    value(): string;
    destroy(): void;
}
export {};
//# sourceMappingURL=Checkbox.d.ts.map