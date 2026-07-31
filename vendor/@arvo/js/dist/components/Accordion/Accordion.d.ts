import { ArvoDropdownIconButtonOptions } from '../DropdownIconButton/DropdownIconButton';
import { ArvoStatusOptions, ArvoStatusType } from '../Status/Status';
import { ArvoBadgeOptions, ArvoBadgeSemanticType } from '../Badge/Badge';
import { ArvoSwitchOptions } from '../Switch/Switch';
import { ArvoSearchOptions } from '../Search/Search';
import { ArvoEmptyStateOptions } from '../EmptyState/EmptyState';
import { MenuItemData } from '../ActionMenu/ActionMenu';
export type { ArvoStatusType, ArvoBadgeSemanticType, MenuItemData };
export type ArvoAccordionSize = 'sm' | 'lg';
export type ArvoAccordionVariant = 'surface' | 'transparent';
export type ArvoAccordionAlign = 'start' | 'end';
export type ArvoAccordionExpandMode = 'single' | 'multiple';
export interface ArvoAccordionItemAction {
    id: string;
    icon: string;
    tooltip: string;
    isDisabled?: boolean;
    onClick?: (event?: Event) => void;
}
export interface ArvoAccordionItemSearchConfig {
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    shortcut?: string;
    expandDirection?: 'start' | 'end';
    isExpanded?: boolean;
    defaultExpanded?: boolean;
    onChange?: (value: string) => void;
    onExpandedChange?: (expanded: boolean) => void;
}
export interface ArvoAccordionItemSwitchConfig {
    isChecked?: boolean;
    defaultChecked?: boolean;
    isDisabled?: boolean;
    ariaLabel?: string;
    onChange?: (isChecked: boolean) => void;
}
export interface ArvoAccordionItemData {
    value: string;
    title: string;
    description?: string;
    icon?: string;
    status?: {
        type: ArvoStatusType;
        label?: string;
    } | null;
    badge?: {
        message: string;
        semanticType?: ArvoBadgeSemanticType;
    } | null;
    actions?: ArvoAccordionItemAction[];
    menuItems?: MenuItemData[];
    switch?: ArvoAccordionItemSwitchConfig | null;
    search?: ArvoAccordionItemSearchConfig | null;
    hasDivider?: boolean;
    panelPadding?: 'none' | 'sm' | 'md' | 'lg';
    isDisabled?: boolean;
    isLoading?: boolean;
    isEmpty?: boolean;
    emptyState?: Pick<ArvoEmptyStateOptions, 'title' | 'message' | 'illustration'> | null;
    statusProps?: Pick<ArvoStatusOptions, 'icon'>;
    badgeProps?: Pick<ArvoBadgeOptions, 'colorMode' | 'customColor' | 'appearance'>;
    menuProps?: Pick<ArvoDropdownIconButtonOptions, 'placement' | 'maxHeight' | 'hasGroupDividers' | 'search' | 'menuProps'>;
    switchProps?: Pick<ArvoSwitchOptions, 'isReadOnly'>;
    searchProps?: Pick<ArvoSearchOptions, 'width' | 'isFullWidth' | 'isLoading' | 'isDisabled'>;
    /** Panel content. Accepts plain HTML string, a DOM node, or document fragment. */
    content?: string | HTMLElement | DocumentFragment;
}
export interface ArvoAccordionValueChangeMeta {
    itemValue: string;
    isExpanded: boolean;
}
export interface ArvoAccordionOptions {
    variant?: ArvoAccordionVariant;
    size?: ArvoAccordionSize;
    align?: ArvoAccordionAlign;
    expandMode?: ArvoAccordionExpandMode;
    isCollapsible?: boolean;
    value?: string | string[] | null;
    defaultValue?: string | string[] | null;
    items?: ArvoAccordionItemData[];
    isDisabled?: boolean;
    isLoading?: boolean;
    skeletonRowCount?: number;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    onValueChange?: (value: string | string[], meta: ArvoAccordionValueChangeMeta) => void;
    onExpand?: (detail: {
        itemValue: string;
    }) => void;
    onCollapse?: (detail: {
        itemValue: string;
    }) => void;
}
interface RequiredOptions {
    variant: ArvoAccordionVariant;
    size: ArvoAccordionSize;
    align: ArvoAccordionAlign;
    expandMode: ArvoAccordionExpandMode;
    isCollapsible: boolean;
    items: ArvoAccordionItemData[];
    expandedValues: Set<string>;
    isDisabled: boolean;
    isLoading: boolean;
    skeletonRowCount: number;
    ariaLabel: string | null;
    ariaLabelledBy: string | null;
    onValueChange: ((value: string | string[], meta: ArvoAccordionValueChangeMeta) => void) | null;
    onExpand: ((detail: {
        itemValue: string;
    }) => void) | null;
    onCollapse: ((detail: {
        itemValue: string;
    }) => void) | null;
}
export declare class ArvoAccordion {
    private _element;
    private _options;
    private _listEl;
    private _skelEl;
    private _entries;
    private _boundHandleKeyDown;
    static readonly VARIANTS: readonly ["surface", "transparent"];
    static readonly SIZES: readonly ["sm", "lg"];
    static readonly ALIGNS: readonly ["start", "end"];
    static readonly EXPAND_MODES: readonly ["single", "multiple"];
    static readonly DEFAULTS: Omit<RequiredOptions, 'items' | 'expandedValues'>;
    static initialize(element: HTMLElement, options?: ArvoAccordionOptions): ArvoAccordion;
    constructor(element: HTMLElement, options?: ArvoAccordionOptions);
    private _render;
    private _createItemEntry;
    private _uniqueId;
    private _bindEvents;
    private _unbindEvents;
    private _handleItemClick;
    private _handleKeyDown;
    private _dispatchEvent;
    private _toggleInternal;
    private _expandInternal;
    private _collapseInternal;
    private _applyExpansionState;
    value(): string | string[] | null;
    value(next: string | string[] | null): void;
    expand(itemValue: string): void;
    collapse(itemValue: string): void;
    toggle(itemValue: string): void;
    setItems(items: ArvoAccordionItemData[]): void;
    addItem(item: ArvoAccordionItemData, index?: number): void;
    removeItem(itemValue: string): void;
    disabled(): boolean;
    disabled(state: boolean): void;
    setLoading(loading: boolean): void;
    destroy(): void;
    private _destroyInstances;
}
//# sourceMappingURL=Accordion.d.ts.map