import { ArvoStatusType } from '../Status/Status';
export type ArvoBadgeVariant = 'label' | 'counter';
export type ArvoBadgeSize = 'sm' | 'md' | 'lg';
export type ArvoBadgeAppearance = 'primary' | 'outline' | 'filled';
export type ArvoBadgeColorMode = 'semantic' | 'custom';
export type ArvoBadgeSemanticType = 'positive' | 'info' | 'neutral' | 'warning' | 'negative' | 'block' | 'none';
export type ArvoBadgeCustomColor = 'purple' | 'pink' | 'glacier' | 'amber' | 'greenish' | 'bluish';
export type ArvoBadgeCounterMode = 'single' | 'ratio';
/**
 * Single-axis layout selector. `'inline'` (default) renders the badge as
 * a normal-flow inline-flex element. `'top-right'` absolutely positions
 * the badge at the top-right corner of a `corner-host` parent so it
 * half-overhangs the host edge. (Bottom-right is intentionally
 * unsupported -- Status remains the bottom-anchored overlay primitive.)
 */
export type ArvoBadgePlacement = 'inline' | 'top-right';
/**
 * Canonical slot config for embedding ArvoBadge inside other Arvo
 * components. Consuming components Pick<> this surface to declare which
 * keys they expose. Intentionally omits the nested-status props
 * (`hasStatus` / `statusType` / `statusPosition`) and `role` -- hosts
 * own their own Status slot and accessible-name surface.
 */
export interface ArvoBadgeConfig {
    placement?: ArvoBadgePlacement;
    variant?: ArvoBadgeVariant;
    size?: ArvoBadgeSize;
    appearance?: ArvoBadgeAppearance;
    colorMode?: ArvoBadgeColorMode;
    semanticType?: ArvoBadgeSemanticType;
    customColor?: ArvoBadgeCustomColor;
    message?: string;
    counterMode?: ArvoBadgeCounterMode;
    count?: number;
    total?: number | null;
    overflowCount?: number;
    hideWhenZero?: boolean;
    autoFormat?: boolean;
    localeAware?: boolean;
    hasBadgeIcon?: boolean;
    icon?: string | null;
    tooltip?: string | null;
    className?: string;
}
export interface ArvoBadgeOptions {
    variant?: ArvoBadgeVariant;
    size?: ArvoBadgeSize;
    appearance?: ArvoBadgeAppearance;
    colorMode?: ArvoBadgeColorMode;
    semanticType?: ArvoBadgeSemanticType;
    customColor?: ArvoBadgeCustomColor;
    message?: string;
    counterMode?: ArvoBadgeCounterMode;
    count?: number;
    total?: number | null;
    overflowCount?: number;
    hideWhenZero?: boolean;
    autoFormat?: boolean;
    localeAware?: boolean;
    hasBadgeIcon?: boolean;
    icon?: string | null;
    placement?: ArvoBadgePlacement;
    hasStatus?: boolean;
    statusType?: ArvoStatusType;
    statusPosition?: 'top-right';
    tooltip?: string | null;
    role?: 'status' | 'alert';
}
export declare const ARVO_BADGE_PLACEMENTS: readonly ArvoBadgePlacement[];
export declare class ArvoBadge {
    readonly el: HTMLElement;
    private _opts;
    private _icoEl;
    private _msgEl;
    private _countEl;
    private _sepEl;
    private _totalEl;
    private _statusSpan;
    private _statusInstance;
    private _animEndHandler;
    private _destroyed;
    static initialize(element: HTMLElement, options?: ArvoBadgeOptions): ArvoBadge;
    constructor(element: HTMLElement, options?: ArvoBadgeOptions);
    private _render;
    private _buildRootClasses;
    private _resolveColorClass;
    private _resolveIcon;
    private _resolveAccessibleName;
    private _applyAccessibleName;
    private _applyTitle;
    private _applyHidden;
    private _renderContentDOM;
    private _attachAnimEndHandler;
    private _removeContentDOM;
    private _renderStatus;
    private _removeStatusDOM;
    private _applyColorClass;
    private _updateIcon;
    /** Getter: returns current count. Setter: updates count, animates, applies hideWhenZero. */
    count(): number;
    count(value: number): void;
    increment(by?: number): void;
    decrement(by?: number): void;
    setMessage(text: string): void;
    setTotal(total: number | null): void;
    setOverflowCount(max: number): void;
    setVariant(variant: ArvoBadgeVariant): void;
    setSize(size: ArvoBadgeSize): void;
    /** Dual-purpose getter/setter for the placement modifier. */
    placement(): ArvoBadgePlacement;
    placement(value: ArvoBadgePlacement): void;
    setAppearance(appearance: ArvoBadgeAppearance): void;
    setColorMode(mode: ArvoBadgeColorMode): void;
    setSemanticType(type: ArvoBadgeSemanticType): void;
    setCustomColor(color: ArvoBadgeCustomColor): void;
    setTooltip(text: string | null): void;
    setStatus(config: {
        type: ArvoStatusType;
        position?: 'top-right';
    } | false): void;
    destroy(): void;
}
//# sourceMappingURL=Badge.d.ts.map