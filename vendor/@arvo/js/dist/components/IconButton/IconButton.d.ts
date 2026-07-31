import { TooltipPlacement } from '../../../../core/src';
import { ArvoBadgeConfig, ArvoBadgeOptions } from '../Badge/Badge';
import { ArvoStatusConfig, ArvoStatusOptions, ArvoStatusType } from '../Status/Status';
export type IconButtonTooltipOption = string | {
    content: string;
    placement?: TooltipPlacement;
    shortcut?: string;
};
/**
 * Visual style variant for `ArvoIconButton`. Mirrors the React twin's
 * `ArvoIconButtonVariant` exactly. `danger` is a back-compat alias for
 * `danger-primary`. `inline` is intentionally excluded -- it is a
 * Button-only variant.
 */
export type ArvoIconButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'danger-primary' | 'danger' | 'danger-tertiary' | 'danger-outline' | 'nova-primary';
export type ArvoIconButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ArvoIconButtonBadgePlacement = 'top-right';
export type ArvoIconButtonStatusPlacement = 'top-right' | 'bottom-right';
/**
 * Narrowed badge slot config for ArvoIconButton. Mirrors React's
 * `ArvoIconButtonBadgeConfig` shape. Surface restrictions vs
 * canonical:
 *   - `size` is fixed to `'sm'`.
 *   - `appearance` is fixed to `'filled'`.
 *   - `colorMode` is fixed to `'semantic'`.
 *   - `variant` is fixed to `'counter'` and `counterMode` to `'single'`.
 *   - `customColor`, `hasBadgeIcon`, `icon`, `tooltip`, `message`,
 *     `total` are excluded.
 *   - `placement` accepts overlay corners only.
 */
export type ArvoIconButtonBadgeConfig = Omit<Pick<ArvoBadgeConfig, 'placement' | 'count' | 'overflowCount' | 'hideWhenZero' | 'autoFormat' | 'localeAware' | 'semanticType' | 'className'>, 'placement'> & {
    placement?: ArvoIconButtonBadgePlacement;
};
/**
 * Narrowed status slot config for ArvoIconButton. Mirrors React's
 * `ArvoIconButtonStatusConfig` shape.
 *   - `size` is derived from icon button size -- not exposed
 *     (`xs` -> `sm`; `sm`/`md`/`lg` map 1:1).
 *   - `tooltip` is excluded.
 *   - `placement` accepts the overlay corners only.
 */
export type ArvoIconButtonStatusConfig = Omit<Pick<ArvoStatusConfig, 'type' | 'placement' | 'icon' | 'className'>, 'placement'> & {
    placement?: ArvoIconButtonStatusPlacement;
};
/**
 * Apply the IconButton matrix's fixed-value contract to a
 * consumer-supplied `ArvoIconButtonBadgeConfig`. Output is a
 * fully-resolved `ArvoBadgeOptions` ready for `ArvoBadge.initialize`.
 * Mirrors React's `resolveIconButtonBadge`.
 */
export declare function resolveIconButtonBadge(cfg: ArvoIconButtonBadgeConfig): ArvoBadgeOptions;
/**
 * Apply the IconButton matrix's fixed-value contract to a
 * consumer-supplied `ArvoIconButtonStatusConfig`. Output is a
 * fully-resolved `ArvoStatusOptions` ready for `ArvoStatus.initialize`.
 * The status size is derived from the host icon button size.
 */
export declare function resolveIconButtonStatus(cfg: ArvoIconButtonStatusConfig, buttonSize: ArvoIconButtonSize): ArvoStatusOptions;
export interface ArvoIconButtonOptions {
    variant?: ArvoIconButtonVariant;
    size?: ArvoIconButtonSize;
    type?: 'button' | 'submit' | 'reset';
    icon?: string;
    /** Tooltip content. Doubles as the button's `aria-label` because it is icon-only. */
    tooltip?: IconButtonTooltipOption;
    isDisabled?: boolean;
    /**
     * Parent-controlled active/selected visual. Renders `aria-pressed` and the
     * `.active` class. Use for non-toggle "active trigger" visuals (e.g. an
     * overlay-trigger icon button showing it has opened a menu / popover).
     * Click does NOT toggle this value -- the parent owns it.
     *
     * For a user-driven toggle, use `ArvoToggleButton` with `label` omitted.
     */
    isSelected?: boolean;
    isLoading?: boolean;
    onClick?: (event: Event) => void;
    onKeyDown?: (event: KeyboardEvent) => void;
    /**
     * Embedded ArvoBadge slot. Overlay-only on IconButton: `placement`
     * is restricted to `'top-right' | 'bottom-right'`. Pass `null` /
     * omit to render no badge.
     */
    badge?: ArvoIconButtonBadgeConfig | null;
    /**
     * Embedded ArvoStatus slot. Overlay-only on IconButton: `placement`
     * is restricted to `'top-right' | 'bottom-right'`. Status `size` is
     * derived from the icon button's `size` option.
     */
    status?: ArvoIconButtonStatusConfig | null;
}
type RequiredIconButtonOptions = Required<Omit<ArvoIconButtonOptions, 'onClick' | 'onKeyDown' | 'isSelected' | 'badge' | 'status'>> & {
    onClick: ((event: Event) => void) | null;
    onKeyDown: ((event: KeyboardEvent) => void) | null;
    isSelected: boolean | undefined;
    badge: ArvoIconButtonBadgeConfig | null;
    status: ArvoIconButtonStatusConfig | null;
};
export declare class ArvoIconButton {
    private _element;
    private _options;
    private _iconEl;
    private _badgeEl;
    private _badgeInstance;
    private _statusEl;
    private _statusInstance;
    private _boundHandleClick;
    private _boundHandleKeydown;
    private _tooltipConnector;
    static readonly VARIANTS: readonly ["primary", "secondary", "tertiary", "outline", "danger-primary", "danger", "danger-tertiary", "danger-outline", "nova-primary"];
    static readonly SIZES: readonly ["xs", "sm", "md", "lg"];
    static readonly DEFAULTS: RequiredIconButtonOptions;
    static initialize(element: HTMLButtonElement, options?: ArvoIconButtonOptions): ArvoIconButton;
    constructor(element: HTMLButtonElement, options?: ArvoIconButtonOptions);
    private _connectTooltip;
    private _render;
    private _createIconEl;
    private _renderBadge;
    private _removeBadge;
    private _renderStatus;
    private _removeStatus;
    private _bindEvents;
    private _handleClick;
    private _handleKeydown;
    private _dispatchEvent;
    setIcon(iconName: string): void;
    setTooltip(tooltip: string): void;
    setVariant(variant: string): void;
    setSize(size: string): void;
    setLoading(isLoading: boolean): void;
    selected(state?: boolean): boolean | void;
    disabled(state?: boolean): boolean | void;
    /**
     * Add, update, or remove the embedded ArvoBadge slot. Pass `null` to
     * tear the badge down; pass a config object to render or re-render.
     * Mirrors `ArvoButton.setBadge`.
     */
    setBadge(config: ArvoIconButtonBadgeConfig | null): void;
    /**
     * Add, update, or remove the embedded ArvoStatus slot. Pass `null` to
     * tear the status down; pass a config object to render or re-render.
     * Mirrors `ArvoButton.setStatus`.
     */
    setStatus(config: ArvoIconButtonStatusConfig | null): void;
    focus(): void;
    destroy(): void;
}
export type { ArvoBadgeConfig, ArvoStatusConfig, ArvoStatusType, };
//# sourceMappingURL=IconButton.d.ts.map