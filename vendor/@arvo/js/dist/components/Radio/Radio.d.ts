import { ArvoFormLabelContextHelpConfig } from '../FormLabel/FormLabel';
export interface ArvoRadioOptions {
    value: string;
    name: string;
    label?: string | null;
    contextHelp?: ArvoFormLabelContextHelpConfig | null;
    isChecked?: boolean;
    isDisabled?: boolean;
    isRequired?: boolean;
    isReadOnly?: boolean;
    isInvalid?: boolean;
    isLoading?: boolean;
    size?: 'sm' | 'lg';
    /**
     * When true, renders a secondary `__desc` line below the label (gated on a
     * non-empty `description` option). Off by default so the standalone control
     * stays single-line; consumers opt into the two-line treatment per-radio.
     */
    hasDescription?: boolean;
    /** Description text rendered below the label when `hasDescription` is true. */
    description?: string | null;
    errorMsg?: string | null;
    onChange?: (detail: {
        value: string;
        name: string;
    }) => void;
    onFocus?: (event: Event) => void;
    onBlur?: (event: Event) => void;
}
type RequiredRadioOptions = Required<Omit<ArvoRadioOptions, 'onChange' | 'onFocus' | 'onBlur' | 'description' | 'contextHelp'>> & {
    description: string | null;
    contextHelp: ArvoFormLabelContextHelpConfig | null;
    onChange: ((detail: {
        value: string;
        name: string;
    }) => void) | null;
    onFocus: ((event: Event) => void) | null;
    onBlur: ((event: Event) => void) | null;
};
export declare class ArvoRadio {
    private _element;
    private _options;
    private _inputEl;
    private _inputWrapperEl;
    private _fieldEl;
    private _controlEl;
    private _textContainerEl;
    private _textEl;
    private _descEl;
    private _inlineAlert;
    private _inlineAlertEl;
    private _inputId;
    private _errorId;
    private _boundHandleChange;
    private _boundHandleFocus;
    private _boundHandleBlur;
    private _boundHandleKeydown;
    static readonly DEFAULTS: RequiredRadioOptions;
    static initialize(element: HTMLElement, options?: ArvoRadioOptions): ArvoRadio;
    constructor(element: HTMLElement, options?: ArvoRadioOptions);
    private _render;
    private _bindEvents;
    private _handleChange;
    private _handleFocus;
    private _handleBlur;
    private _handleKeydown;
    private _getGroupInputs;
    private _syncCheckedState;
    private _dispatchEvent;
    private _renderInlineAlert;
    private _removeInlineAlert;
    private _ensureTextContainer;
    private _removeTextContainerIfEmpty;
    value(): string;
    select(): void;
    deselect(): void;
    checked(): boolean;
    setTabIndex(index: number): void;
    disabled(state?: boolean): boolean | void;
    readonly(state?: boolean): boolean | void;
    setLabel(label: string | null): void;
    setDescription(description: string | null): void;
    setError(messageOrFalse: string | false): void;
    setLoading(isLoading: boolean): void;
    destroy(): void;
}
export {};
//# sourceMappingURL=Radio.d.ts.map