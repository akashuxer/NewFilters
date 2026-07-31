import { ListItemBase, ListGroup } from '../../../../core/src';
import { ArvoFormLabelContextHelpConfig } from '../FormLabel/FormLabel';
import { ArvoOptionListOptions } from '../OptionList/OptionList';
import { MenuSearchProp } from '../../types/menu-search';
export interface SelectOptionData extends ListItemBase {
    value: unknown;
}
/**
 * Scoped escape-hatch bag for inner `ArvoOptionList` config the field does not
 * curate as a flat option. Mirrors React `SelectOptionListProps` exactly --
 * the drift reviewer enforces key-set parity.
 */
export type SelectOptionListProps = Pick<ArvoOptionListOptions, 'emptyConfig' | 'variant' | 'isCreatable' | 'onCreate'>;
export interface ArvoSelectOptions {
    items: SelectOptionData[] | ListGroup<SelectOptionData>[];
    /** Controlled/initial selected value. Update after init via value(). */
    value?: unknown;
    /** Uncontrolled initial value. Used only when value is omitted. */
    defaultValue?: unknown;
    placeholder?: string;
    /**
     * Optional leading icon name (without the `o9con-` prefix) rendered inside
     * the trigger before the value / placeholder display. 16px square;
     * recolored by parent state through the shared `form-input-affix` pattern.
     * The dropdown chevron is a separate slot (`__chevron`).
     */
    icon?: string;
    label?: string;
    contextHelp?: ArvoFormLabelContextHelpConfig | null;
    isDisabled?: boolean;
    isRequired?: boolean;
    isInvalid?: boolean;
    errorMsg?: string;
    errorDisplay?: 'inline' | 'tooltip' | 'none';
    size?: 'sm' | 'lg';
    surface?: 'filled' | 'base';
    /** Enable search with defaults (`true`) or pass a config object. */
    search?: MenuSearchProp;
    isLoading?: boolean;
    isReadOnly?: boolean;
    width?: string;
    isFullWidth?: boolean;
    placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'auto';
    maxHeight?: string;
    hasGroupDividers?: boolean;
    closeOnSelect?: boolean;
    /** Initial open state (parity with React's controlled isOpen). Drive after init via open()/close()/toggle(). */
    isOpen?: boolean;
    /** Uncontrolled initial open state. Used only when isOpen is omitted. */
    defaultOpen?: boolean;
    onChange?: (item: SelectOptionData | null, index: number) => boolean | void;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    onOpenChange?: (isOpen: boolean) => void;
    /**
     * Scoped escape-hatch bag for inner `ArvoOptionList` options the field does
     * not curate flat (e.g. `emptyConfig`, `variant`, `isCreatable`,
     * `onCreate`). Spread first so the field's flat / computed options always
     * win on overlap.
     */
    optionListProps?: SelectOptionListProps;
}
type RequiredSelectOptions = Required<Omit<ArvoSelectOptions, 'onChange' | 'onOpen' | 'onClose' | 'onOpenChange' | 'maxHeight' | 'errorMsg' | 'search' | 'width' | 'optionListProps' | 'contextHelp' | 'icon' | 'defaultValue' | 'isOpen' | 'defaultOpen'>> & {
    search: MenuSearchProp | undefined;
    width: string | null;
    maxHeight: string | null;
    errorMsg: string | null;
    contextHelp: ArvoFormLabelContextHelpConfig | null;
    optionListProps: SelectOptionListProps | null;
    icon: string | null;
    onChange: ((item: SelectOptionData | null, index: number) => boolean | void) | null;
    onOpen: (() => boolean | void) | null;
    onClose: (() => boolean | void) | null;
    onOpenChange: ((isOpen: boolean) => void) | null;
};
export declare class ArvoSelect {
    private _element;
    private _options;
    private _fieldEl;
    private _displayEl;
    private _icoEl;
    private _errIcoEl;
    private _errIcoConnector;
    private _chevronEl;
    private _borderEl;
    private _hiddenInputEl;
    private _labelEl;
    private _alertEl;
    private _inlineAlert;
    private _errMsgAlert;
    private _optionList;
    private _isOpen;
    private _isDisabled;
    private _isLoading;
    private _isReadonly;
    private _isSearchable;
    private _value;
    private _id;
    private _boundHandleFieldClick;
    private _boundHandleFieldKeyDown;
    static readonly DEFAULTS: RequiredSelectOptions;
    static initialize(element: HTMLElement, options: ArvoSelectOptions): ArvoSelect;
    constructor(element: HTMLElement, options: ArvoSelectOptions);
    private _buildRoot;
    private _setupOptionList;
    private _applyRootClasses;
    private _applyWidthStyle;
    private _updateValueDisplay;
    private _getAllFlatItems;
    private _handleFieldClick;
    private _handleFieldKeyDown;
    private _handleOptionChange;
    private _handleListOpenChange;
    open(): void;
    private _doOpen;
    close(): void;
    private _doClose;
    toggle(force?: boolean): void;
    isOpen(): boolean;
    value(newValue?: unknown): unknown | void;
    updateItems(items: SelectOptionData[] | ListGroup<SelectOptionData>[]): void;
    disabled(state?: boolean): boolean | void;
    setError(message: string | false): void;
    private _buildInlineAlert;
    setLoading(isLoading: boolean): void;
    width(cssValue?: string): string | void;
    icon(): string | null;
    icon(name: string | null): void;
    focus(): void;
    destroy(): void;
}
export {};
//# sourceMappingURL=Select.d.ts.map