export type ArvoAvatarVariant = 'image' | 'initials' | 'icon' | 'logo' | 'o9logo' | 'novai';
export type ArvoAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ArvoAvatarAppearance = 'filled' | 'outline' | 'primary';
export type ArvoAvatarColorMode = 'default' | 'semantic' | 'custom';
export type ArvoAvatarSemanticType = 'positive' | 'negative' | 'warning' | 'info';
export type ArvoAvatarCustomColor = 'purple' | 'pink' | 'glacier' | 'amber' | 'greenish' | 'bluish';
export interface ArvoAvatarOptions {
    variant?: ArvoAvatarVariant;
    size?: ArvoAvatarSize;
    /**
     * Surface chrome. See ArvoAvatarProps.appearance for the per-variant
     * rules. novai supports 'outline' (rest, default) and 'filled' (active).
     */
    appearance?: ArvoAvatarAppearance;
    colorMode?: ArvoAvatarColorMode;
    semanticType?: ArvoAvatarSemanticType;
    customColor?: ArvoAvatarCustomColor;
    name?: string;
    email?: string;
    src?: string;
    alt?: string;
    icon?: string;
    /**
     * Brand asset name for variant='logo' (e.g. "GitHub"). When set, the logo
     * variant renders an SVG sourced from `${logoBaseUrl}/light/{logo}.svg`
     * (and `/dark/{logo}.svg` when the user-agent prefers a dark color
     * scheme) instead of an o9con glyph.
     */
    logo?: string;
    /** URL prefix used to resolve `logo`. Defaults to `'/logos'`. */
    logoBaseUrl?: string;
    tooltip?: string;
    isInteractive?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    href?: string;
    target?: string;
    rel?: string;
    onClick?: (event: Event) => void;
    id?: string;
}
export declare class ArvoAvatar {
    /** The host element passed to initialize. Decorated in place. */
    readonly el: HTMLElement;
    private _opts;
    private _imgEl;
    private _innerEl;
    private _imageFailed;
    private _destroyed;
    private _onClickBound;
    private _onKeyDownBound;
    private _onImageErrorBound;
    private _onImageLoadBound;
    static readonly VARIANTS: readonly ArvoAvatarVariant[];
    static readonly SIZES: readonly ArvoAvatarSize[];
    static readonly APPEARANCES: readonly ArvoAvatarAppearance[];
    static readonly COLOR_MODES: readonly ArvoAvatarColorMode[];
    static readonly SEMANTIC_TYPES: readonly ArvoAvatarSemanticType[];
    static readonly CUSTOM_COLORS: readonly ArvoAvatarCustomColor[];
    static initialize(element: HTMLElement | null, options?: ArvoAvatarOptions): ArvoAvatar;
    constructor(element: HTMLElement, options?: ArvoAvatarOptions);
    private _normalize;
    private _isSvgLogo;
    private _render;
    private _applyLogoStyle;
    private _bindHandlers;
    private _teardownImageListeners;
    private _effectiveVariant;
    private _resolvedInitials;
    private _resolvedIcon;
    private _isEffectivelyInteractive;
    private _applyClasses;
    private _applyAttributes;
    private _handleClick;
    private _handleKeyDown;
    private _handleImageError;
    private _handleImageLoad;
    setVariant(variant: ArvoAvatarVariant): void;
    setSize(size: ArvoAvatarSize): void;
    setAppearance(appearance: ArvoAvatarAppearance): void;
    setColorMode(mode: ArvoAvatarColorMode): void;
    setSemanticType(type: ArvoAvatarSemanticType): void;
    setCustomColor(color: ArvoAvatarCustomColor): void;
    setName(name: string): void;
    setSrc(src: string | null): void;
    setIcon(icon: string): void;
    /** Switch the brand asset rendered by variant='logo'. Pass null to clear
     *  and fall back to the o9con `icon` glyph. */
    setLogo(logo: string | null): void;
    setLogoBaseUrl(baseUrl: string): void;
    setTooltip(tooltip: string | null): void;
    /** Dual-purpose getter/setter for the disabled state. */
    disabled(): boolean;
    disabled(state: boolean): void;
    /** Dual-purpose getter/setter for the loading state. */
    loading(): boolean;
    loading(state: boolean): void;
    /** Read-only accessors mirroring the React props for testing. */
    variant(): ArvoAvatarVariant;
    size(): ArvoAvatarSize;
    appearance(): ArvoAvatarAppearance;
    colorMode(): ArvoAvatarColorMode;
    semanticType(): ArvoAvatarSemanticType;
    customColor(): ArvoAvatarCustomColor;
    /** Tear down inner DOM + listeners + decorations. The host element is preserved. */
    destroy(): void;
}
//# sourceMappingURL=Avatar.d.ts.map