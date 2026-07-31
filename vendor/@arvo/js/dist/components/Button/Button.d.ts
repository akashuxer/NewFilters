import { ArvoBadgeConfig, ArvoBadgeOptions } from '../Badge/Badge';
import { ArvoStatusConfig, ArvoStatusOptions, ArvoStatusType } from '../Status/Status';
/**
 * Slot placement allowed on a Button's status slot. The button supports
 * overlay placements ONLY -- inline status is not a Button surface.
 */
export type ArvoButtonStatusPlacement = Exclude<ArvoStatusConfig['placement'], 'inline'>;
/**
 * Narrowed badge slot config for ArvoButton. Mirrors React's
 * `ArvoButtonBadgeConfig` shape. Surface restrictions vs canonical:
 *   - `size` is fixed to `'sm'`.
 *   - `appearance` is fixed (`'primary'` inline / `'filled'` overlay).
 *   - `colorMode` is fixed to `'semantic'`.
 *   - `customColor`, `hasBadgeIcon`, `icon`, `tooltip` are excluded.
 *   - `semanticType` is honored ONLY on overlay placements.
 */
export type ArvoButtonBadgeConfig = Pick<ArvoBadgeConfig, 'placement' | 'variant' | 'counterMode' | 'message' | 'count' | 'total' | 'overflowCount' | 'hideWhenZero' | 'autoFormat' | 'localeAware' | 'semanticType' | 'className'>;
/**
 * Narrowed status slot config for ArvoButton. Mirrors React's
 * `ArvoButtonStatusConfig` shape.
 *   - `size` is derived from button size -- not exposed.
 *   - `tooltip` is excluded.
 *   - `placement` accepts ONLY the overlay corners.
 */
export type ArvoButtonStatusConfig = Omit<Pick<ArvoStatusConfig, 'type' | 'placement' | 'icon' | 'className'>, 'placement'> & {
    placement?: ArvoButtonStatusPlacement;
};
/**
 * Apply the Button matrix's fixed-value contract to a consumer-supplied
 * `ArvoButtonBadgeConfig`. Output is a fully-resolved `ArvoBadgeOptions`
 * ready for `ArvoBadge.initialize`. Mirrors React's `resolveButtonBadge`.
 *
 * The host button `variant` is consulted only to flip the inline badge's
 * appearance to `'filled'` when the button is `'secondary'` (so the badge
 * reads against the lighter surface). All other placements use `'filled'`
 * unconditionally; inline on every other variant uses `'primary'`.
 */
export declare function resolveButtonBadge(cfg: ArvoButtonBadgeConfig, buttonVariant?: ArvoButtonVariant): ArvoBadgeOptions;
/**
 * Apply the Button matrix's fixed-value contract to a consumer-supplied
 * `ArvoButtonStatusConfig`. Output is a fully-resolved
 * `ArvoStatusOptions` ready for `ArvoStatus.initialize`. The status size
 * is derived from the host button size.
 */
export declare function resolveButtonStatus(cfg: ArvoButtonStatusConfig, buttonSize: 'sm' | 'md' | 'lg'): ArvoStatusOptions;
/**
 * Visual style variant for `ArvoButton`. Mirrors the React twin's
 * `ArvoButtonVariant` exactly. `danger` is a back-compat alias for
 * `danger-primary`; `inline` is Button-only (not accepted on
 * `ArvoIconButton`).
 */
export type ArvoButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'danger-primary' | 'danger' | 'danger-tertiary' | 'danger-outline' | 'nova-primary' | 'inline';
export interface ArvoButtonOptions {
    variant?: ArvoButtonVariant;
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
    label?: string;
    icon?: string | null;
    isDisabled?: boolean;
    /**
     * Parent-controlled active/selected visual. Renders `aria-pressed` and the
     * `.active` class. Use for non-toggle "active trigger" visuals (e.g. an
     * overlay-trigger button showing it has opened a menu / popover, a
     * tab-pinned indicator). Click does NOT toggle this value -- the parent
     * owns it.
     *
     * For a user-driven toggle button, use `ArvoToggleButton`.
     */
    isSelected?: boolean;
    isFullWidth?: boolean;
    isLoading?: boolean;
    onClick?: (event: Event) => void;
    /**
     * Keydown callback. Mirrors React's `onKeyDown` (inherited via
     * `ButtonHTMLAttributes`) and the sibling JS `ArvoIconButton.onKeyDown`
     * option.
     */
    onKeyDown?: (event: KeyboardEvent) => void;
    /**
     * Embedded ArvoBadge slot. Set `placement: 'inline'` for an adjacent
     * badge (label or counter, fixed size sm + appearance primary +
     * semantic neutral + no icon) or `placement: 'top-right'` for an
     * absolutely positioned counter (filled appearance + configurable
     * `semanticType`). Pass `null` / omit to render no badge. Badge
     * bottom-right is intentionally unsupported -- use the `status` slot
     * for a bottom-anchored overlay.
     */
    badge?: ArvoButtonBadgeConfig | null;
    /**
     * Embedded ArvoStatus slot. Overlay-only on Button: placement is
     * restricted to `'top-right'` or `'bottom-right'`. Status size is
     * derived from the button's `size` option.
     */
    status?: ArvoButtonStatusConfig | null;
    /**
     * Show the full label in a tooltip on hover / focus when the visible
     * label is truncated. Recovery affordance only -- appears ONLY when
     * the `.arvo-btn__lbl` span is clipped at runtime and no explicit
     * `ArvoTooltip.initialize(buttonEl, ...)` is wired on the same
     * element. Default `true`.
     *
     * Precedence: an explicit tooltip on the same anchor always wins;
     * this internal tooltip yields automatically and does NOT add
     * `aria-describedby` (the full label is already part of the button's
     * accessible name).
     */
    hasTruncationTooltip?: boolean;
}
type RequiredButtonOptions = Required<Omit<ArvoButtonOptions, 'onClick' | 'onKeyDown' | 'icon' | 'isSelected' | 'badge' | 'status'>> & {
    icon: string | null;
    onClick: ((event: Event) => void) | null;
    onKeyDown: ((event: KeyboardEvent) => void) | null;
    isSelected: boolean | undefined;
    badge: ArvoButtonBadgeConfig | null;
    status: ArvoButtonStatusConfig | null;
    hasTruncationTooltip: boolean;
};
export declare class ArvoButton {
    private _element;
    private _options;
    private _iconEl;
    private _labelEl;
    private _badgeEl;
    private _badgeInstance;
    private _statusEl;
    private _statusInstance;
    private _truncationTooltip;
    private _originalContent;
    private _boundHandleClick;
    private _boundHandleKeydown;
    static readonly VARIANTS: readonly ["primary", "secondary", "tertiary", "outline", "danger-primary", "danger", "danger-tertiary", "danger-outline", "nova-primary", "inline"];
    static readonly SIZES: readonly ["sm", "md", "lg"];
    static readonly DEFAULTS: RequiredButtonOptions;
    static initialize(element: HTMLButtonElement, options?: ArvoButtonOptions): ArvoButton;
    constructor(element: HTMLButtonElement, options?: ArvoButtonOptions);
    private _render;
    private _createIconEl;
    /**
     * Wire the internal truncation tooltip onto the live label span. The
     * `triggerElement` is the button itself so hover/focus events fire on
     * the full surface; the connector measures `_labelEl` for clipping
     * and yields automatically to any explicit `ArvoTooltip` attached to
     * the button.
     */
    private _attachTruncationTooltip;
    private _detachTruncationTooltip;
    private _renderBadge;
    private _removeBadge;
    private _renderStatus;
    private _removeStatus;
    private _bindEvents;
    private _handleClick;
    private _handleKeydown;
    private _dispatchEvent;
    setLabel(text: string): void;
    setIcon(iconName: string | null): void;
    setVariant(variant: string): void;
    setSize(size: string): void;
    setLoading(isLoading: boolean): void;
    selected(state?: boolean): boolean | void;
    disabled(state?: boolean): boolean | void;
    /**
     * Add, update, or remove the embedded ArvoBadge slot. Pass `null` to
     * tear the badge down; pass a config object to render or re-render.
     */
    setBadge(config: ArvoButtonBadgeConfig | null): void;
    /**
     * Add, update, or remove the embedded ArvoStatus slot. Pass `null` to
     * tear the status down; pass a config object to render or re-render.
     */
    setStatus(config: ArvoButtonStatusConfig | null): void;
    focus(): void;
    destroy(): void;
}
export type { ArvoBadgeConfig, ArvoStatusConfig, ArvoStatusType, };
//# sourceMappingURL=Button.d.ts.map