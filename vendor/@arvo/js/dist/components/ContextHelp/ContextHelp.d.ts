import { TooltipPlacement } from '../../../../core/src';
export interface ArvoContextHelpOptions {
    /** Help text displayed in the tooltip on hover/focus. Required. */
    content: string;
    /** Semantic role of the help icon. Drives glyph and hover rendering strategy. */
    variant?: 'info' | 'question';
    /** Icon size. sm = 14px (default); lg = 16px. */
    size?: 'sm' | 'lg';
    /** Preferred tooltip placement. Collision-aware; flips when the preferred side overflows. */
    placement?: TooltipPlacement;
    /** Override for the trigger's aria-label. Defaults to the content text when omitted. */
    ariaLabel?: string;
    /** Prevents interaction and suppresses tooltip activation. */
    isDisabled?: boolean;
    /** Shows Pattern A shimmer overlay and suppresses tooltip activation while loading. */
    isLoading?: boolean;
    onClick?: (event: Event) => void;
    onFocus?: (event: FocusEvent) => void;
    onBlur?: (event: FocusEvent) => void;
}
type RequiredContextHelpOptions = Required<Omit<ArvoContextHelpOptions, 'onClick' | 'onFocus' | 'onBlur' | 'ariaLabel'>> & {
    ariaLabel: string | null;
    onClick: ((event: Event) => void) | null;
    onFocus: ((event: FocusEvent) => void) | null;
    onBlur: ((event: FocusEvent) => void) | null;
};
export declare class ArvoContextHelp {
    private _element;
    private _options;
    private _iconEl;
    private _tooltipConnector;
    private _isHover;
    private _isFocused;
    private _boundHandleClick;
    private _boundHandleKeydown;
    private _boundHandleMouseEnter;
    private _boundHandleMouseLeave;
    private _boundHandleFocus;
    private _boundHandleBlur;
    static readonly VARIANTS: readonly ["info", "question"];
    static readonly SIZES: readonly ["sm", "lg"];
    static readonly DEFAULTS: RequiredContextHelpOptions;
    static initialize(element: HTMLElement, options: ArvoContextHelpOptions): ArvoContextHelp;
    constructor(element: HTMLButtonElement, options: ArvoContextHelpOptions);
    private _blocked;
    private _glyphClass;
    private _refreshGlyph;
    private _connectTooltip;
    private _disconnectTooltip;
    private _render;
    private _bindEvents;
    private _handleClick;
    private _handleKeydown;
    private _handleMouseEnter;
    private _handleMouseLeave;
    private _handleFocus;
    private _handleBlur;
    setContent(content: string): void;
    setVariant(variant: string): void;
    setSize(size: string): void;
    setLoading(loading: boolean): void;
    disabled(state?: boolean): boolean | void;
    focus(): void;
    destroy(): void;
}
export {};
//# sourceMappingURL=ContextHelp.d.ts.map