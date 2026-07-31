import { BasicInlineContent, OverlayHub } from '../../../../core/src';
export type ArvoToastType = 'negative' | 'warning' | 'info' | 'positive' | 'block' | 'neutral';
/**
 * Toast container placement. Only right-anchored corners are supported
 * (no `top-left` / `bottom-left`) per the current design.
 */
export type ArvoToastPosition = 'top-right' | 'bottom-right';
export type ArvoToastCloseReason = 'click' | 'escape' | 'fade' | 'programmatic';
/**
 * Structured link action for a toast. The toast renders an internal
 * `ArvoLink` from this data so consumers never construct DOM for the
 * link themselves. Toast curates `size` and `variant` so the link is
 * visually consistent across all toasts; the long tail of `ArvoLink`
 * options is intentionally not exposed here.
 */
export interface ArvoToastLinkAction {
    label: string;
    href: string;
    onClick?: (event: Event) => void;
    icon?: string;
    isExternal?: boolean;
}
export interface ArvoToastOptions {
    type?: ArvoToastType;
    title?: string | null;
    /**
     * Body content. Accepts a plain string OR a `BasicInlineContent` array
     * (`InlineNode[]`) from `@arvo/core/inline-content`. The shared DOM
     * adapter renders inline runs (text, em, strong, link, code, kbd) into
     * the message slot. Raw HTML strings are not representable.
     */
    message: BasicInlineContent;
    fadeAway?: boolean;
    timeout?: number;
    pauseOnHover?: boolean;
    /**
     * Optional o9con icon name override (without the `o9con-` prefix). **Only
     * honored when `type='neutral'`** -- every other type renders its semantic
     * glyph via the SCSS pattern and ignores this option. The neutral type
     * itself has no fixed semantic glyph, so consumers may pass any o9con name
     * (e.g. `'bell-o'`, `'star'`, `'rocket'`) and it renders as a child
     * `<i class="o9con o9con-{name}">` inside `__ico`, with the
     * `has-icon-override` state class on the root.
     */
    icon?: string | null;
    link?: ArvoToastLinkAction;
    onClose?: () => void;
}
export interface ArvoToastManagerOptions {
    position?: ArvoToastPosition;
    timeout?: number;
    pauseOnHover?: boolean;
    /** Custom overlay hub instance. Falls back to the module-level singleton. */
    hub?: OverlayHub;
}
export declare class ArvoToast {
    private _container;
    private _toasts;
    private _defaults;
    private _hub;
    private _surface;
    private _destroyed;
    static initialize(container?: HTMLElement | string | null, options?: ArvoToastManagerOptions): ArvoToast;
    constructor(container?: HTMLElement | string | null, options?: ArvoToastManagerOptions);
    show(options: ArvoToastOptions): string;
    close(id: string): void;
    closeAll(): void;
    destroy(): void;
    private _startFadeTimer;
    private _remove;
    /**
     * FLIP layout-shift compensation for the toast stack. Reads the
     * pre-mutation rects of every toast (optionally excluding one that
     * is about to leave the DOM), and returns a callback that -- when
     * invoked after the DOM mutation -- animates each surviving toast
     * from its previous position back to (0, 0) via WAAPI. Matches the
     * `$arvo-motion-layout-shift` token (220ms emphasized easing).
     *
     * No-op on reduced-motion users and on browsers without
     * `Element.animate`.
     */
    private _captureLayoutShift;
}
//# sourceMappingURL=Toast.d.ts.map