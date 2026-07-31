import { IconButtonTooltipOption } from '../IconButton/IconButton';
export interface ArvoIconButtonLinkOptions {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    href?: string;
    target?: string;
    /**
     * Tooltip content. Accepts a plain string (used directly as content and
     * `aria-label`) or a config object (`{ content, placement?, shortcut? }`)
     * for richer tooltip presentation. Mirrors `ArvoIconButton`. Tooltip is
     * REQUIRED for IconButtonLink because there is no visible text label;
     * the value also drives `aria-label` so screen readers announce the link.
     */
    tooltip?: IconButtonTooltipOption;
    /**
     * When true, marks the link as outbound: auto-sets `target="_blank"` and
     * `rel="noopener noreferrer"` if `target` is not already provided. No
     * extra glyph is rendered (icon-only square has no room) -- consumers
     * that want a visible affordance should pass `icon: 'external-link'`.
     */
    hasExternalLink?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    onClick?: (event: Event) => void;
}
type RequiredIconButtonLinkOptions = Required<Omit<ArvoIconButtonLinkOptions, 'onClick' | 'target' | 'tooltip'>> & {
    target: string | null;
    tooltip: IconButtonTooltipOption;
    onClick: ((event: Event) => void) | null;
};
export declare class ArvoIconButtonLink {
    private _element;
    private _options;
    private _iconEl;
    private _originalHref;
    private _tooltipConnector;
    private _boundHandleClick;
    static readonly VARIANTS: readonly ["primary", "secondary", "tertiary", "outline"];
    static readonly SIZES: readonly ["sm", "md", "lg"];
    static readonly DEFAULTS: RequiredIconButtonLinkOptions;
    static initialize(element: HTMLAnchorElement, options?: ArvoIconButtonLinkOptions): ArvoIconButtonLink;
    constructor(element: HTMLAnchorElement, options?: ArvoIconButtonLinkOptions);
    private _connectTooltip;
    private _render;
    private _createIconEl;
    private _applyHref;
    private _applyTarget;
    private _applyDisabled;
    private _bindEvents;
    private _handleClick;
    private _dispatchEvent;
    setIcon(iconName: string): void;
    setHref(href: string): void;
    setExternalLink(hasExternalLink: boolean): void;
    setTooltip(tooltip: IconButtonTooltipOption): void;
    setLoading(isLoading: boolean): void;
    disabled(state?: boolean): boolean | void;
    focus(): void;
    destroy(): void;
}
export {};
//# sourceMappingURL=IconButtonLink.d.ts.map