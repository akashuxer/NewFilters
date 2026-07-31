import { TooltipPlacement } from '../../../../core/src';
import { ArvoContextHelp } from '../ContextHelp/ContextHelp';
export type ArvoFormLabelSize = 'sm' | 'lg';
export type ArvoFormLabelAs = 'label' | 'span';
export interface ArvoFormLabelContextHelpConfig {
    content: string;
    variant?: 'info' | 'question';
    ariaLabel?: string;
    placement?: TooltipPlacement;
}
export interface ArvoFormLabelOptions {
    /** Caption text. Required at construction. */
    text: string;
    /** Rendered tag. Defaults to `'label'`. Use `'span'` for inner-caption use. */
    as?: ArvoFormLabelAs;
    /** id of the associated control. Honored only when `as === 'label'`. */
    for?: string | null;
    /** Label size. Defaults to `'sm'` (12px). */
    size?: ArvoFormLabelSize;
    isRequired?: boolean;
    isDisabled?: boolean;
    isInvalid?: boolean;
    /**
     * Optional override for the required indicator content. String renders as
     * text inside the `__req` span; HTMLElement is appended as-is.
     */
    requiredIndicator?: string | HTMLElement | null;
    /**
     * Optional contextual-help icon configuration. When provided, an embedded
     * `ArvoContextHelp` is rendered inside an absolutely-positioned wrapper.
     * The inner icon is always created at `size: 'sm'` (14px) regardless of
     * the FormLabel size, per the Figma spec. Set at construction only --
     * there is no setter; consumers can mutate the tooltip via the instance
     * returned by `contextHelp()` (e.g. `lbl.contextHelp()?.setContent(...)`).
     */
    contextHelp?: ArvoFormLabelContextHelpConfig | null;
}
export declare class ArvoFormLabel {
    readonly el: HTMLLabelElement | HTMLSpanElement;
    private _text;
    private _as;
    private _for;
    private _size;
    private _isRequired;
    private _isDisabled;
    private _isInvalid;
    private _requiredIndicator;
    private _contextHelpConfig;
    private _textNode;
    private _reqEl;
    private _ctxHelpWrapperEl;
    private _ctxHelp;
    private _destroyed;
    /**
     * Factory entry point. If `element` is `null`, a new element of the
     * configured tag is created. If an existing element is passed, the tag is
     * preserved -- the `as` option is ignored and inferred from the element.
     */
    static initialize(element: HTMLElement | null, options: ArvoFormLabelOptions): ArvoFormLabel;
    constructor(element: HTMLElement | null, options: ArvoFormLabelOptions);
    private _render;
    private _mountRequiredIndicator;
    private _unmountRequiredIndicator;
    private _mountContextHelp;
    private _unmountContextHelp;
    text(): string;
    text(next: string): void;
    size(): ArvoFormLabelSize;
    size(next: ArvoFormLabelSize): void;
    required(): boolean;
    required(next: boolean): void;
    disabled(): boolean;
    disabled(next: boolean): void;
    invalid(): boolean;
    invalid(next: boolean): void;
    /**
     * Gets or sets the `for` attribute. Only meaningful when rendered as a
     * `<label>`; setting on a `<span>` is a no-op.
     */
    for(): string | null;
    for(next: string | null): void;
    /** Returns the rendered tag. Set at construction; cannot be changed. */
    as(): ArvoFormLabelAs;
    /**
     * Returns the embedded ArvoContextHelp instance, or null when no
     * `contextHelp` option was provided. Read-only -- the embedded instance is
     * set at construction. Use the returned instance to mutate the tooltip,
     * e.g. `lbl.contextHelp()?.setContent('...')`.
     */
    contextHelp(): ArvoContextHelp | null;
    destroy(): void;
}
//# sourceMappingURL=FormLabel.d.ts.map