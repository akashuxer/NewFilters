import { ArvoActionMenuOptions } from '../ActionMenu/ActionMenu';
export interface ButtonGroupItem {
    value: string;
    label?: string;
    icon?: string;
    isDisabled?: boolean;
    isExcluded?: boolean;
}
/**
 * Scoped escape-hatch bag for the overflow `ArvoActionMenu` (the "More
 * actions" trigger). Mirrors the React `ButtonGroupOverflowMenuProps`
 * type exactly -- drift checker enforces parity. `placement` is parent-
 * owned (`bottom-end`) and intentionally excluded.
 */
export type ButtonGroupOverflowMenuProps = Pick<ArvoActionMenuOptions, 'maxHeight' | 'hasGroupDividers' | 'search' | 'actionsVisibility'>;
export interface ArvoButtonGroupOptions {
    items?: ButtonGroupItem[];
    value?: string | string[] | null;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'lg';
    isMultiSelect?: boolean;
    isIconOnly?: boolean;
    hasOverflow?: boolean;
    expandOnSelect?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    ariaLabel: string;
    /**
     * Escape hatch for the overflow `ArvoActionMenu` options the parent
     * doesn't expose flat. Bag-only keys flow through; on any conflict with
     * a parent-owned option the parent wins.
     */
    overflowMenuProps?: ButtonGroupOverflowMenuProps;
    onChange?: (detail: ButtonGroupChangeDetail) => void;
}
export interface ButtonGroupChangeDetail {
    value: string | string[] | null;
    previousValue: string | string[] | null;
    changedValue?: string;
    isSelected?: boolean;
    [key: string]: unknown;
}
type RequiredGroupOptions = Required<Omit<ArvoButtonGroupOptions, 'onChange' | 'items' | 'value' | 'overflowMenuProps'>> & {
    items: ButtonGroupItem[];
    value: string | string[] | null;
    overflowMenuProps: ButtonGroupOverflowMenuProps | null;
    onChange: ((detail: ButtonGroupChangeDetail) => void) | null;
};
export declare class ArvoButtonGroup {
    private _element;
    private _options;
    private _childButtons;
    private _childElements;
    private _overflowTrigger;
    private _overflowTriggerEl;
    private _overflowMenu;
    private _indicatorEl;
    private _indicatorResizeObs;
    private _arrowNav;
    private _overflowMgr;
    private _hiddenValues;
    private _labelMeasureToken;
    private _boundHandleKeydown;
    private _boundHandleClick;
    static readonly VARIANTS: readonly ["primary", "secondary", "outline"];
    static readonly SIZES: readonly ["sm", "lg"];
    static readonly DEFAULTS: RequiredGroupOptions;
    static initialize(element: HTMLElement, options?: ArvoButtonGroupOptions): ArvoButtonGroup;
    constructor(element: HTMLElement, options?: ArvoButtonGroupOptions);
    private _render;
    private _scheduleMeasureLabelWidths;
    private _measureLabelWidths;
    private _buildRootClasses;
    private _bindEvents;
    private _handleKeydown;
    private _handleClick;
    private _selectSingle;
    private _toggleMulti;
    private _isItemActive;
    private _syncActiveStates;
    private _syncIndicatorToButton;
    private _updateIndicator;
    private _watchActiveResize;
    private _syncRovingTabindex;
    private _setupArrowNav;
    private _mountOverflowTrigger;
    private _buildOverflowMenuItems;
    private _updateOverflowMenuItems;
    private _setupOverflowManager;
    private _dispatchEvent;
    value(): string | string[] | null;
    value(newValue: string | string[] | null): void;
    disabled(): boolean;
    disabled(state: boolean): void;
    setVariant(variant: string): void;
    setLoading(isLoading: boolean): void;
    setItems(items: ButtonGroupItem[]): void;
    focus(): void;
    destroy(): void;
    private _destroyChildren;
    private _destroyOverflow;
}
export {};
//# sourceMappingURL=ButtonGroup.d.ts.map