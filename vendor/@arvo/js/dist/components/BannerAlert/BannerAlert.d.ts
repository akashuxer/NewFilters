import { BasicInlineContent } from '../../../../core/src';
export type ArvoBannerAlertType = 'positive' | 'info' | 'neutral' | 'warning' | 'negative' | 'block';
export type ArvoBannerAlertRole = 'status' | 'alert';
/**
 * Structured config for the optional outline action button. Banner Alert
 * curates `variant: 'outline'` and `size: 'sm'`.
 */
export interface ArvoBannerAlertButton {
    label: string;
    icon?: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    ariaLabel?: string;
    onClick?: (event: Event) => void;
}
/**
 * Structured config for the optional inline link action. Banner Alert
 * renders an `ArvoLink`; `target='_blank'` automatically receives
 * `rel='noopener noreferrer'`.
 */
export interface ArvoBannerAlertLink {
    label: string;
    href: string;
    target?: '_self' | '_blank';
    rel?: string;
    icon?: string;
    isExternal?: boolean;
    ariaLabel?: string;
    onClick?: (event: Event) => void;
}
export interface ArvoBannerAlertOptions {
    /** Body content. Plain string OR a `BasicInlineContent` array. */
    message: BasicInlineContent;
    /** Semantic alert type. Defaults to "info". */
    type?: ArvoBannerAlertType;
    /** Optional title rendered above the message. Ignored in compact mode. */
    title?: string | null;
    /** Layout mode. When true, renders only the message with tighter padding. */
    isCompact?: boolean;
    /** Whether to render the close button on the right. Defaults to true. */
    isDismissible?: boolean;
    /** Optional outline action button rendered in the action row. Ignored in compact mode. */
    button?: ArvoBannerAlertButton | null;
    /** Optional inline link rendered in the action row. Ignored in compact mode. */
    link?: ArvoBannerAlertLink | null;
    /**
     * Optional o9con icon name override (without the `o9con-` prefix). **Only
     * honored when `type='neutral'`** -- every other type renders its semantic
     * glyph via the SCSS pattern and ignores this option. The neutral type
     * itself has no fixed semantic glyph, so consumers may pass any o9con name
     * (e.g. `'bell-o'`, `'star'`) and it renders as a child
     * `<i class="o9con o9con-{name}">` inside `__ico`, with the
     * `has-icon-override` state class on the root.
     */
    icon?: string | null;
    /** Pattern A shimmer loading state. */
    isLoading?: boolean;
    /** Explicit ARIA role override. Defaults to type-derived role. */
    role?: ArvoBannerAlertRole;
    /** Fired when the close button is clicked or dismiss() is called. */
    onDismiss?: () => void;
}
export declare class ArvoBannerAlert {
    private _root;
    private _iconEl;
    private _iconOverrideEl;
    private _contentEl;
    private _copyEl;
    private _titleEl;
    private _msgEl;
    private _actionsEl;
    private _btnEl;
    private _btnInstance;
    private _linkEl;
    private _linkInstance;
    private _closeEl;
    private _closeBtnInstance;
    private _titleTooltip;
    private _options;
    private _currentType;
    private _icon;
    private _isCompact;
    private _isDismissible;
    private _isLoading;
    private _userRoleOverride;
    private _addedRole;
    private _addedAriaBusy;
    private _destroyed;
    private _isClosing;
    private get _iconOverrideActive();
    static initialize(element: HTMLElement, options: ArvoBannerAlertOptions): ArvoBannerAlert;
    constructor(element: HTMLElement, options: ArvoBannerAlertOptions);
    private _render;
    private _writeMessageInto;
    type(): ArvoBannerAlertType;
    type(newType: ArvoBannerAlertType): void;
    icon(): string | null;
    icon(next: string | null): void;
    private _syncIconOverride;
    message(): BasicInlineContent;
    message(content: BasicInlineContent): void;
    title(): string | null;
    title(text: string | null): void;
    loading(): boolean;
    loading(state: boolean): void;
    dismiss(): void;
    destroy(): void;
}
//# sourceMappingURL=BannerAlert.d.ts.map