export interface ArvoButtonLinkOptions {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    label?: string;
    href?: string;
    target?: string;
    icon?: string | null;
    hasExternalLink?: boolean;
    isDisabled?: boolean;
    isFullWidth?: boolean;
    isLoading?: boolean;
    ariaLabel?: string | null;
    onClick?: (event: Event) => void;
}
type RequiredButtonLinkOptions = Required<Omit<ArvoButtonLinkOptions, 'onClick' | 'icon' | 'target' | 'ariaLabel'>> & {
    icon: string | null;
    target: string | null;
    ariaLabel: string | null;
    onClick: ((event: Event) => void) | null;
};
export declare class ArvoButtonLink {
    private _element;
    private _options;
    private _iconEl;
    private _labelEl;
    private _externalIconEl;
    private _originalHref;
    private _originalContent;
    private _boundHandleClick;
    static readonly VARIANTS: readonly ["primary", "secondary", "tertiary", "outline"];
    static readonly SIZES: readonly ["sm", "md", "lg"];
    static readonly DEFAULTS: RequiredButtonLinkOptions;
    static initialize(element: HTMLAnchorElement, options?: ArvoButtonLinkOptions): ArvoButtonLink;
    constructor(element: HTMLAnchorElement, options?: ArvoButtonLinkOptions);
    private _render;
    private _createIconEl;
    private _createExternalIconEl;
    private _applyHref;
    private _applyTarget;
    private _applyDisabled;
    private _bindEvents;
    private _handleClick;
    private _dispatchEvent;
    setLabel(text: string): void;
    setHref(href: string): void;
    setIcon(iconName: string | null): void;
    setVariant(variant: string): void;
    setSize(size: string): void;
    setLoading(isLoading: boolean): void;
    setExternalLink(hasExternalLink: boolean): void;
    setAriaLabel(ariaLabel: string | null): void;
    disabled(state?: boolean): boolean | void;
    focus(): void;
    destroy(): void;
}
export {};
//# sourceMappingURL=ButtonLink.d.ts.map