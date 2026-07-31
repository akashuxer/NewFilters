export interface ArvoLinkOptions {
    variant?: 'primary' | 'secondary' | 'tertiary';
    size?: 'sm' | 'lg';
    label?: string;
    href?: string;
    target?: string;
    icon?: string | null;
    isExternal?: boolean;
    isDisabled?: boolean;
    isVisited?: boolean;
    isLoading?: boolean;
    onClick?: (event: Event) => void;
}
type RequiredLinkOptions = Required<Omit<ArvoLinkOptions, 'onClick' | 'icon' | 'target'>> & {
    icon: string | null;
    target: string | null;
    onClick: ((event: Event) => void) | null;
};
export declare class ArvoLink {
    private _element;
    private _options;
    private _iconEl;
    private _labelEl;
    private _extEl;
    private _originalHref;
    private _originalContent;
    private _boundHandleClick;
    private _boundHandleKeyDown;
    static readonly VARIANTS: readonly ["primary", "secondary", "tertiary"];
    static readonly SIZES: readonly ["sm", "lg"];
    static readonly DEFAULTS: RequiredLinkOptions;
    static initialize(element: HTMLAnchorElement, options?: ArvoLinkOptions): ArvoLink;
    constructor(element: HTMLAnchorElement, options?: ArvoLinkOptions);
    private _render;
    private _createIconEl;
    private _createExtEl;
    private _applyHref;
    private _applyTarget;
    private _applyDisabled;
    private _bindEvents;
    private _handleClick;
    private _handleKeyDown;
    private _dispatchEvent;
    setLabel(text: string): void;
    setHref(href: string): void;
    setIcon(iconName: string | null): void;
    setExternal(isExternal: boolean): void;
    setLoading(isLoading: boolean): void;
    disabled(state?: boolean): boolean | void;
    focus(): void;
    destroy(): void;
}
export {};
//# sourceMappingURL=Link.d.ts.map