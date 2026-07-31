import { TooltipPlacement } from '../../../../core/src';
import { ArvoBadgeConfig, ArvoBadgeOptions, ArvoBadgePlacement } from '../Badge/Badge';
import { ArvoStatusConfig, ArvoStatusOptions, ArvoStatusType } from '../Status/Status';
export type ToggleButtonTooltipOption = string | {
    content: string;
    placement?: TooltipPlacement;
    shortcut?: string;
};
export type ArvoToggleButtonVariant = 'secondary' | 'tertiary' | 'outline';
export type ArvoToggleButtonSize = 'sm' | 'md' | 'lg';
export type ArvoToggleButtonBadgePlacement = ArvoBadgePlacement;
export type ArvoToggleButtonStatusPlacement = 'top-right' | 'bottom-right';
/**
 * Narrowed badge slot config for ArvoToggleButton. Mirrors React's
 * `ArvoToggleButtonBadgeConfig` shape (which itself mirrors
 * `ArvoButtonBadgeConfig`). The host resolver fixes `size=sm`,
 * `appearance` (primary inline / filled overlay), `colorMode=semantic`,
 * `hasBadgeIcon=false`.
 */
export type ArvoToggleButtonBadgeConfig = Pick<ArvoBadgeConfig, 'placement' | 'variant' | 'counterMode' | 'message' | 'count' | 'total' | 'overflowCount' | 'hideWhenZero' | 'autoFormat' | 'localeAware' | 'semanticType' | 'className'>;
/**
 * Narrowed status slot config for ArvoToggleButton. Overlay-only.
 * Status size derives from the toggle size (sm/md/lg map 1:1).
 */
export type ArvoToggleButtonStatusConfig = Omit<Pick<ArvoStatusConfig, 'type' | 'placement' | 'icon' | 'className'>, 'placement'> & {
    placement?: ArvoToggleButtonStatusPlacement;
};
/**
 * Apply the toggle button matrix's fixed-value contract to a
 * consumer-supplied `ArvoToggleButtonBadgeConfig`. Output is a
 * fully-resolved `ArvoBadgeOptions` ready for `ArvoBadge.initialize`.
 */
export declare function resolveToggleButtonBadge(cfg: ArvoToggleButtonBadgeConfig): ArvoBadgeOptions;
/**
 * Apply the toggle button matrix's fixed-value contract to a
 * consumer-supplied `ArvoToggleButtonStatusConfig`. Status size is
 * derived from the host toggle size.
 */
export declare function resolveToggleButtonStatus(cfg: ArvoToggleButtonStatusConfig, toggleSize: ArvoToggleButtonSize): ArvoStatusOptions;
export interface ArvoToggleButtonOptions {
    variant?: ArvoToggleButtonVariant;
    size?: ArvoToggleButtonSize;
    type?: 'button' | 'submit' | 'reset';
    /** Icon name without `o9con-` prefix. Required. */
    icon?: string;
    /** Optional alternate icon shown when the toggle is selected. */
    selectedIcon?: string;
    /** Optional label. Omit for icon-only. */
    label?: string;
    /** Tooltip content + accessible-name source. Required when `label` is omitted. */
    tooltip?: ToggleButtonTooltipOption;
    isDisabled?: boolean;
    /** Controlled toggle state. Omit to fall back to `defaultSelected`. */
    isSelected?: boolean;
    /** Uncontrolled initial selected state. */
    defaultSelected?: boolean;
    isLoading?: boolean;
    onClick?: (event: Event) => void;
    onKeyDown?: (event: KeyboardEvent) => void;
    /** Fires on every user-driven flip (click, Enter, Space). */
    onSelectedChange?: (isSelected: boolean) => void;
    badge?: ArvoToggleButtonBadgeConfig | null;
    status?: ArvoToggleButtonStatusConfig | null;
}
type RequiredToggleButtonOptions = Required<Omit<ArvoToggleButtonOptions, 'onClick' | 'onKeyDown' | 'onSelectedChange' | 'selectedIcon' | 'label' | 'badge' | 'status'>> & {
    selectedIcon: string | null;
    label: string | null;
    onClick: ((event: Event) => void) | null;
    onKeyDown: ((event: KeyboardEvent) => void) | null;
    onSelectedChange: ((isSelected: boolean) => void) | null;
    badge: ArvoToggleButtonBadgeConfig | null;
    status: ArvoToggleButtonStatusConfig | null;
};
export declare class ArvoToggleButton {
    private _element;
    private _options;
    private _innerEl;
    private _iconEl;
    private _labelEl;
    private _badgeEl;
    private _badgeInstance;
    private _statusEl;
    private _statusInstance;
    private _originalContent;
    private _originalType;
    private _boundHandleClick;
    private _boundHandleKeydown;
    private _tooltipConnector;
    static readonly VARIANTS: readonly ["secondary", "tertiary", "outline"];
    static readonly SIZES: readonly ["sm", "md", "lg"];
    static readonly DEFAULTS: RequiredToggleButtonOptions;
    static initialize(element: HTMLButtonElement, options?: ArvoToggleButtonOptions): ArvoToggleButton;
    constructor(element: HTMLButtonElement, options?: ArvoToggleButtonOptions);
    private _connectTooltip;
    private _render;
    private _resolveDisplayedIcon;
    private _createIconEl;
    private _renderBadge;
    private _removeBadge;
    private _renderStatus;
    private _removeStatus;
    private _bindEvents;
    private _handleClick;
    private _handleKeydown;
    private _applySelected;
    private _dispatchEvent;
    /**
     * Add, update, or remove the visible label. Adds / removes the
     * `arvo-toggle-btn--icon-only` modifier as the shape changes.
     */
    setLabel(text: string | null): void;
    /** Swap the resting icon glyph. */
    setIcon(iconName: string): void;
    /** Set or clear the alternate icon shown when the toggle is on. */
    setSelectedIcon(iconName: string | null): void;
    /**
     * Internal helper to (re)apply the resolved displayed icon based on
     * current `isSelected` + `selectedIcon`. Used by setIcon /
     * setSelectedIcon when the resolved glyph must change without a flip.
     */
    private _syncDisplayedIcon;
    /**
     * Update the tooltip content (and aria-label when the toggle is
     * icon-only).
     */
    setTooltip(text: string): void;
    setVariant(variant: string): void;
    setSize(size: string): void;
    setLoading(isLoading: boolean): void;
    /**
     * Dual-purpose getter/setter for the selected state. Omit `state` to
     * read; pass a boolean to write. Programmatic writes do NOT invoke
     * the consumer `onSelectedChange` callback, but the
     * `toggle-btn:change` DOM event still fires so external listeners
     * stay in sync.
     */
    selected(state?: boolean): boolean | void;
    /**
     * Flip the selected state, or force a target value. Returns the new
     * `isSelected` value. Fires the `toggle-btn:change` DOM event but does
     * NOT invoke `onSelectedChange` (programmatic, not user-driven).
     */
    toggle(force?: boolean): boolean;
    disabled(state?: boolean): boolean | void;
    /** Add, update, or remove the embedded ArvoBadge slot. */
    setBadge(config: ArvoToggleButtonBadgeConfig | null): void;
    /** Add, update, or remove the embedded ArvoStatus slot. */
    setStatus(config: ArvoToggleButtonStatusConfig | null): void;
    focus(): void;
    destroy(): void;
}
export type { ArvoBadgeConfig, ArvoStatusConfig, ArvoStatusType, };
//# sourceMappingURL=ToggleButton.d.ts.map