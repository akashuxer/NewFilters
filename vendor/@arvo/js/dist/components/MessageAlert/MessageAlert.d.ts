import { BasicInlineContent } from '../../../../core/src';
export declare const ARVO_MSG_ALERT_DEFAULT_ERROR = "Form field value is invalid";
export type ArvoMessageAlertType = 'negative' | 'positive' | 'warning' | 'info' | 'neutral' | 'block';
export interface ArvoMessageAlertOptions {
    type?: ArvoMessageAlertType;
    isInline?: boolean;
    /**
     * Alert message. Plain string OR a `BasicInlineContent` array (text, em,
     * strong, link, code, kbd) from the shared inline-content contract. In
     * inline mode a string is mirrored to `aria-label`; a rich array falls back
     * to the type-default label.
     */
    message?: BasicInlineContent | null;
    /**
     * Optional o9con icon override. Only honored when `type === 'neutral'` --
     * every other type renders its semantic glyph and ignores this option. The
     * neutral type itself has no fixed semantic glyph, so consumers may pass
     * any o9con name (e.g. `'bell-o'`, `'star'`).
     */
    icon?: string | null;
    isDismissable?: boolean;
    onDismiss?: (() => void) | null;
    id?: string;
    /** When omitted, role is auto-resolved from `type`. */
    role?: 'alert' | 'status';
}
export declare class ArvoMessageAlert {
    static defaultErrorMessage: string;
    readonly el: HTMLElement;
    private _type;
    private _isInline;
    private _message;
    private _icon;
    private _isDismissable;
    private _onDismiss;
    private _id;
    private _role;
    private _roleExplicit;
    private _bodyEl;
    private _icoEl;
    private _msgEl;
    private _iconOverrideEl;
    private _closeBtn;
    private _closeEl;
    private _boundHandleCloseClick;
    private _destroyed;
    private _isClosing;
    private get _iconOverrideActive();
    static initialize(element: HTMLElement | null, options?: ArvoMessageAlertOptions): ArvoMessageAlert;
    constructor(element: HTMLElement | null, options?: ArvoMessageAlertOptions);
    private _render;
    private _writeMessage;
    private _buildIconEl;
    private _mountCloseBtn;
    private _unmountCloseBtn;
    private _applyInlineAriaLabel;
    private _handleCloseClick;
    type(): ArvoMessageAlertType;
    type(next: ArvoMessageAlertType): void;
    message(): BasicInlineContent;
    message(next: BasicInlineContent | null): void;
    inline(): boolean;
    inline(next: boolean): void;
    dismissable(): boolean;
    dismissable(next: boolean): void;
    icon(): string | null;
    icon(next: string | null): void;
    private _syncIconOverride;
    dismiss(): void;
    destroy(): void;
}
//# sourceMappingURL=MessageAlert.d.ts.map