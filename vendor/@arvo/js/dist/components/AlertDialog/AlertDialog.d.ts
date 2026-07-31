import { BasicInlineContent } from '../../../../core/src';
import { ArvoBannerAlertOptions } from '../BannerAlert/BannerAlert';
export type ArvoAlertDialogVariant = 'warning' | 'info' | 'positive' | 'negative' | 'block';
export type ArvoAlertDialogCloseReason = 'primary' | 'secondary' | 'close-button' | 'escape' | 'backdrop' | 'programmatic';
export interface ArvoAlertDialogAction {
    label: string;
    icon?: string;
    onClick?: (e: Event) => void | false;
    isDisabled?: boolean;
    isLoading?: boolean;
    closeOnClick?: boolean;
}
interface ConfirmInputBase<TValue> {
    label?: string;
    placeholder?: string;
    expectedValue?: TValue;
    /**
     * Inner-input size. Defaults to `'lg'` so the input matches the
     * comfortable form factor used inside the dialog body. Pass `'sm'`
     * for compact layouts. (All form inputs in @arvo/js / @arvo/react
     * expose only `'sm'` and `'lg'`; there is no `'md'` in the input
     * size scale.)
     */
    size?: 'sm' | 'lg';
    validate?: (value: TValue) => true | false | string;
    onChange?: (value: TValue) => void;
}
export interface ArvoAlertDialogConfirmInputOptionItem {
    id: string;
    label: string;
    value?: string;
}
export interface ArvoAlertDialogConfirmInputTextbox extends ConfirmInputBase<string> {
    type?: 'textbox';
    maxLength?: number;
}
export interface ArvoAlertDialogConfirmInputTextarea extends ConfirmInputBase<string> {
    type: 'textarea';
    maxLength?: number;
    rows?: number;
}
export interface ArvoAlertDialogConfirmInputCombobox extends ConfirmInputBase<string> {
    type: 'combobox';
    options: ArvoAlertDialogConfirmInputOptionItem[];
}
export interface ArvoAlertDialogConfirmInputSelect extends ConfirmInputBase<string> {
    type: 'select';
    options: ArvoAlertDialogConfirmInputOptionItem[];
}
export interface ArvoAlertDialogConfirmInputMultiSelect extends Omit<ConfirmInputBase<string[]>, 'expectedValue' | 'validate' | 'onChange'> {
    type: 'multi-select';
    options: ArvoAlertDialogConfirmInputOptionItem[];
    expectedValues?: string[];
    validate?: (value: string[]) => true | false | string;
    onChange?: (value: string[]) => void;
}
export type ArvoAlertDialogConfirmInput = ArvoAlertDialogConfirmInputTextbox | ArvoAlertDialogConfirmInputTextarea | ArvoAlertDialogConfirmInputCombobox | ArvoAlertDialogConfirmInputSelect | ArvoAlertDialogConfirmInputMultiSelect;
export interface ArvoAlertDialogDontShow {
    label?: string;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
}
export interface ArvoAlertDialogOptions {
    variant?: ArvoAlertDialogVariant;
    title: string;
    /**
     * Body message. Plain string OR a `BasicInlineContent` array
     * (`InlineNode[]`) from `@arvo/core/inline-content`.
     */
    message?: BasicInlineContent;
    content?: string | HTMLElement | ((container: HTMLElement) => void);
    /**
     * Optional ArvoBannerAlert config rendered between header and body.
     * The dialog instantiates the banner internally; consumers do not
     * construct DOM.
     */
    bannerAlert?: ArvoBannerAlertOptions;
    hasDangerAction?: boolean;
    primaryAction?: ArvoAlertDialogAction;
    secondaryAction?: ArvoAlertDialogAction | null;
    hasSecondaryBtn?: boolean;
    /**
     * Whether the primary button is rendered. Defaults to `true`. Only
     * honored when `variant: 'warning'`.
     */
    hasPrimaryBtn?: boolean;
    isClosable?: boolean;
    hasBackdrop?: boolean;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    confirmInput?: ArvoAlertDialogConfirmInput | null;
    dontShowAgain?: ArvoAlertDialogDontShow | boolean | null;
    isLoading?: boolean;
    isDisabled?: boolean;
    container?: HTMLElement | string | null;
    onOpen?: () => void | false;
    onClose?: (detail: {
        reason: ArvoAlertDialogCloseReason | string;
    }) => void | false;
    onConfirmInputChange?: (value: string | string[]) => void;
    onDontShowAgainChange?: (checked: boolean) => void;
}
export declare class ArvoAlertDialog {
    private _options;
    private _rootEl;
    private _panelEl;
    private _headerEl;
    private _icoEl;
    private _titleEl;
    private _bodyEl;
    private _msgEl;
    private _confirmInputWrapEl;
    private _footerEl;
    private _dontShowEl;
    private _actionsEl;
    private _footerFit;
    private _closeBtnInstance;
    private _primaryBtnInstance;
    private _secondaryBtnInstance;
    private _dontShowInstance;
    private _confirmInputInstance;
    private _surface;
    private _isOpen;
    private _confirmValue;
    private _confirmValues;
    private _confirmErrorEl;
    private _confirmInputAltInstance;
    private _bannerEl;
    private _bannerInstance;
    private _dontShowChecked;
    private _dialogId;
    private _titleId;
    private _bodyId;
    private _closingProgrammatically;
    private _boundHandleKeyDown;
    static initialize(options: ArvoAlertDialogOptions): ArvoAlertDialog;
    constructor(options: ArvoAlertDialogOptions);
    open(): void;
    close(reason?: ArvoAlertDialogCloseReason | string): void;
    isOpen(): boolean;
    toggle(): void;
    title(): string;
    title(value: string): void;
    message(): BasicInlineContent;
    message(value: BasicInlineContent): void;
    renderContent(content: string | HTMLElement | ((container: HTMLElement) => void)): void;
    setVariant(variant: ArvoAlertDialogVariant): void;
    setActions(actions: {
        primary?: Partial<ArvoAlertDialogAction>;
        secondary?: Partial<ArvoAlertDialogAction> | null;
    }): void;
    setLoading(loading: boolean): void;
    confirmValue(): string;
    dontShowAgainChecked(): boolean;
    dontShowAgainChecked(value: boolean): void;
    destroy(): void;
    private _handleEngineClose;
    private _render;
    private _renderBanner;
    private _renderHeader;
    private _renderBody;
    private _renderConfirmInput;
    private _handleMultiConfirmInput;
    private _refreshConfirmError;
    private _renderFooter;
    private _buildRootClasses;
    private _handlePrimaryClick;
    private _handleSecondaryClick;
    private _runAction;
    private _handleConfirmInput;
    private _handleConfirmKeyDown;
    private _handleDontShowChange;
    private _handleKeyDown;
    private _resolveOptions;
    private _resolveContainer;
    private _isPrimaryDisabledByConfirm;
    private _confirmValidationError;
    private _isPrimaryDisabled;
    private _isPrimaryBlocked;
    private _refreshButtonDisabledStates;
    private _applyActionToButton;
    private _dispatchEvent;
}
export default ArvoAlertDialog;
//# sourceMappingURL=AlertDialog.d.ts.map