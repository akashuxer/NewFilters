import { IconButtonTooltipOption } from '../IconButton/IconButton';
export type FabButtonVariant = 'primary' | 'secondary';
export interface ArvoFabButtonOptions {
    variant?: FabButtonVariant;
    icon?: string;
    label?: string | null;
    isDisabled?: boolean;
    isLoading?: boolean;
    zIndex?: number | null;
    /**
     * Optional tooltip text or config. Forwarded to the inner `ArvoIconButton`
     * (icon-only mode); ignored in with-label mode. Accepts a plain string or
     * a config object (`{ content, placement?, shortcut? }`).
     */
    tooltip?: IconButtonTooltipOption;
    onClick?: (event: Event) => void;
    onFocus?: (event: FocusEvent) => void;
    onBlur?: (event: FocusEvent) => void;
}
type ResolvedOptions = {
    variant: FabButtonVariant;
    icon: string;
    label: string | null;
    isDisabled: boolean;
    isLoading: boolean;
    zIndex: number | null;
    tooltip: IconButtonTooltipOption | null;
    onClick: ((event: Event) => void) | null;
    onFocus: ((event: FocusEvent) => void) | null;
    onBlur: ((event: FocusEvent) => void) | null;
};
export declare class ArvoFabButton {
    private _container;
    private _wrapperEl;
    private _buttonEl;
    private _innerButton;
    private _options;
    static readonly VARIANTS: readonly FabButtonVariant[];
    static readonly DEFAULTS: ResolvedOptions;
    static initialize(element: HTMLElement, options?: ArvoFabButtonOptions): ArvoFabButton;
    constructor(element: HTMLElement, options?: ArvoFabButtonOptions);
    private _render;
    private _applyWrapperClasses;
    private _applyZIndex;
    private _createInnerButton;
    private _destroyInnerButton;
    setVariant(variant: string): void;
    setIcon(iconName: string): void;
    setLabel(label: string | null): void;
    setZIndex(zIndex: number | null): void;
    disabled(state?: boolean): boolean | void;
    setLoading(isLoading: boolean): void;
    focus(): void;
    destroy(): void;
    private _dispatchEvent;
}
export {};
//# sourceMappingURL=FabButton.d.ts.map