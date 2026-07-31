export type ArvoInitialFocusTarget = 'auto' | 'first' | 'body' | 'footer' | 'header' | 'custom' | 'none' | HTMLElement | (() => HTMLElement | null | undefined);
export interface OverlayInitialFocusRegions {
    root?: HTMLElement | null;
    stickyHeader?: HTMLElement | null;
    body?: HTMLElement | null;
    footer?: HTMLElement | null;
    header?: HTMLElement | null;
}
export interface ResolveInitialFocusOptions extends OverlayInitialFocusRegions {
    initialFocus?: ArvoInitialFocusTarget | null;
}
export declare function resolveOverlayInitialFocus(options: ResolveInitialFocusOptions): HTMLElement | null;
//# sourceMappingURL=initial-focus.d.ts.map