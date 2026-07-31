export type ArvoStatusType = 'available' | 'notAvailable' | 'partialComplete' | 'busy' | 'failed' | 'blocked' | 'attention' | 'loading' | 'paused' | 'critical' | 'high' | 'medium' | 'low' | 'unknown' | 'positive' | 'negative' | 'warning' | 'info' | 'neutral';
export type ArvoStatusSize = 'sm' | 'md' | 'lg';
export type ArvoStatusPlacement = 'inline' | 'top-right' | 'bottom-right';
/**
 * Standardized configuration object that consuming components expose
 * via a `status` option to embed ArvoStatus. React and JS share the same
 * shape -- drift reviewer enforced.
 */
export interface ArvoStatusConfig {
    type: ArvoStatusType;
    placement?: ArvoStatusPlacement;
    size?: ArvoStatusSize;
    tooltip?: string;
    icon?: string;
    className?: string;
}
export interface ArvoStatusOptions {
    type?: ArvoStatusType;
    size?: ArvoStatusSize;
    placement?: ArvoStatusPlacement;
    tooltip?: string;
    icon?: string;
}
interface TypeMeta {
    icon: string | null;
    label: string;
    iconOverridable: boolean;
}
export declare const ARVO_STATUS_TYPES: readonly ArvoStatusType[];
export declare const ARVO_STATUS_TYPE_REGISTRY: Record<ArvoStatusType, TypeMeta>;
export declare const ARVO_STATUS_PLACEMENTS: readonly ArvoStatusPlacement[];
export declare function resolveStatusIcon(type: ArvoStatusType, override?: string | null): string;
export declare function resolveStatusLabel(type: ArvoStatusType): string;
export declare class ArvoStatus {
    /** The host element passed to initialize. Decorated in place. */
    readonly el: HTMLElement;
    private _opts;
    private _iconEl;
    private _destroyed;
    static readonly TYPES: ArvoStatusType[];
    static readonly SIZES: readonly ArvoStatusSize[];
    static readonly PLACEMENTS: readonly ArvoStatusPlacement[];
    static readonly TYPE_REGISTRY: Record<ArvoStatusType, TypeMeta>;
    /** Factory matching the rest of the @arvo/js components. */
    static initialize(element: HTMLElement | null, options?: ArvoStatusOptions): ArvoStatus;
    constructor(element: HTMLElement, options?: ArvoStatusOptions);
    private _render;
    private _applyClasses;
    private _applyIcon;
    private _applyTooltip;
    /** Change the semantic type. */
    setType(type: ArvoStatusType): void;
    /** Change the size. */
    setSize(size: ArvoStatusSize): void;
    /**
     * Dual-purpose getter/setter for the placement.
     *
     *   sts.placement()                 // 'inline' | 'top-right' | 'bottom-right'
     *   sts.placement('top-right')      // set
     */
    placement(): ArvoStatusPlacement;
    placement(value: ArvoStatusPlacement): void;
    /**
     * Override the icon glyph. Pass null to revert to the type default.
     * Ignored for locked-icon types.
     */
    setIcon(icon: string | null): void;
    /** Update the accessible label + native title. Pass null to revert. */
    setTooltip(tooltip: string | null): void;
    /** Read-only accessors mirroring the React props for testing. */
    type(): ArvoStatusType;
    size(): ArvoStatusSize;
    /** Tear down inner DOM + decorations. The host element is preserved. */
    destroy(): void;
}
export {};
//# sourceMappingURL=Status.d.ts.map