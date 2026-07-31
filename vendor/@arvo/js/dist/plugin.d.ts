import { ArvoButtonOptions } from './components/Button';
import { ArvoIconButtonOptions } from './components/IconButton';
import { ArvoToggleButtonOptions } from './components/ToggleButton';
import { ArvoTextboxOptions } from './components/Textbox';
import { ArvoTextareaOptions } from './components/Textarea';
import { ArvoNumberInputOptions } from './components/NumberInput';
import { ArvoRadioOptions } from './components/Radio';
import { ArvoCheckboxOptions } from './components/Checkbox';
import { ArvoCheckboxGroupOptions } from './components/CheckboxGroup';
import { ArvoRadioGroupOptions } from './components/RadioGroup';
import { ArvoSwitchOptions } from './components/Switch';
import { ArvoPopoverOptions } from './components/Popover';
import { ArvoHybridPopoverOptions } from './components/HybridPopover';
import { ArvoButtonGroupOptions } from './components/ButtonGroup';
import { ArvoFabButtonOptions } from './components/FabButton';
import { ArvoLinkOptions } from './components/Link';
import { ArvoButtonLinkOptions } from './components/ButtonLink';
import { ArvoDisclosureButtonOptions } from './components/DisclosureButton';
import { ArvoIconButtonLinkOptions } from './components/IconButtonLink';
import { ArvoTabstripOptions } from './components/Tabstrip';
import { ArvoBreadcrumbOptions } from './components/Breadcrumb';
import { ArvoNavOptions } from './components/Nav';
import { ArvoAvatarOptions } from './components/Avatar';
import { ArvoAvatarGroupOptions } from './components/AvatarGroup';
import { ArvoBadgeOptions } from './components/Badge';
import { ArvoChipOptions } from './components/Chip';
import { ArvoChipListOptions } from './components/ChipList';
import { ArvoBannerAlertOptions } from './components/BannerAlert';
import { ArvoMessageAlertOptions } from './components/MessageAlert';
import { ArvoStatusOptions } from './components/Status';
import { ArvoLoaderOptions } from './components/Loader';
import { ArvoFormLabelOptions } from './components/FormLabel';
import { ArvoActionMenuOptions } from './components/ActionMenu';
import { ArvoContextMenuOptions } from './components/ContextMenu';
import { ArvoSearchOptions } from './components/Search';
import { ArvoAdvanceSearchOptions } from './components/AdvanceSearch';
import { ArvoSelectOptions } from './components/Select';
import { ArvoComboboxOptions } from './components/Combobox';
import { ArvoMultiSelectOptions } from './components/MultiSelect';
import { ArvoDropdownButtonOptions } from './components/DropdownButton';
import { ArvoSplitButtonOptions } from './components/SplitButton';
import { ArvoSplitIconButtonOptions } from './components/SplitIconButton';
import { ArvoDropdownIconButtonOptions } from './components/DropdownIconButton';
import { ArvoListboxOptions } from './components/Listbox';
import { ArvoOptionListOptions } from './components/OptionList';
import { ArvoListOptions } from './components/List';
import { ArvoAlertDialogOptions } from './components/AlertDialog';
import { ArvoSidePanelOptions } from './components/SidePanel';
import { ArvoDrawerOptions } from './components/Drawer';
import { ArvoWindowOptions } from './components/Window';
import { ArvoDatePickerOptions } from './components/DatePicker';
import { ArvoTimePickerOptions } from './components/TimePicker';
import { ArvoTimePickerDropdownOptions } from './components/TimePickerDropdown';
import { ArvoCalendarDropdownOptions } from './components/CalendarDropdown';
import { ArvoDateTimeDropdownOptions } from './components/DateTimeDropdown';
import { ArvoCalendarRangeDropdownOptions } from './components/CalendarRangeDropdown';
import { ArvoDateTimePickerOptions } from './components/DateTimePicker';
import { ArvoDateRangePickerOptions } from './components/DateRangePicker';
import { ArvoTreeViewOptions } from './components/TreeView';
import { ArvoDropdownTreeOptions } from './components/DropdownTree';
import { ArvoContextHelpOptions } from './components/ContextHelp';
import { ArvoAccordionOptions } from './components/Accordion';
import { ArvoTooltipOptions } from './components/Tooltip';
import { ArvoRichTooltipOptions } from './components/RichTooltip';
import { ArvoSplitterOptions } from './components/Splitter';
import { ArvoPanelOptions } from './components/Panel';
import { ArvoNavPanelOptions } from './components/NavPanel';
import { ArvoFilterPanelOptions } from './components/FilterPanel';
import { ArvoTooltipContainerOptions } from './setup/tooltip-container-setup';
declare global {
    interface JQuery {
        arvoButton(options?: ArvoButtonOptions): JQuery;
        arvoIconButton(options?: ArvoIconButtonOptions): JQuery;
        arvoToggleButton(options?: ArvoToggleButtonOptions): JQuery;
        arvoTextbox(options?: ArvoTextboxOptions): JQuery;
        arvoTextarea(options?: ArvoTextareaOptions): JQuery;
        arvoNumberInput(options?: ArvoNumberInputOptions): JQuery;
        arvoRadio(options?: ArvoRadioOptions): JQuery;
        arvoCheckbox(options?: ArvoCheckboxOptions): JQuery;
        arvoCheckboxGroup(options?: ArvoCheckboxGroupOptions): JQuery;
        arvoRadioGroup(options?: ArvoRadioGroupOptions): JQuery;
        arvoSwitch(options?: ArvoSwitchOptions): JQuery;
        arvoPopover(options?: ArvoPopoverOptions): JQuery;
        arvoHybridPopover(options?: ArvoHybridPopoverOptions): JQuery;
        arvoButtonGroup(options?: ArvoButtonGroupOptions): JQuery;
        arvoFabButton(options?: ArvoFabButtonOptions): JQuery;
        arvoLink(options?: ArvoLinkOptions): JQuery;
        arvoButtonLink(options?: ArvoButtonLinkOptions): JQuery;
        arvoDisclosureButton(options?: ArvoDisclosureButtonOptions): JQuery;
        arvoIconButtonLink(options?: ArvoIconButtonLinkOptions): JQuery;
        arvoTabstrip(options?: ArvoTabstripOptions): JQuery;
        arvoBreadcrumb(options?: ArvoBreadcrumbOptions): JQuery;
        arvoNav(options?: ArvoNavOptions): JQuery;
        arvoAvatar(options?: ArvoAvatarOptions): JQuery;
        arvoAvatarGroup(options?: ArvoAvatarGroupOptions): JQuery;
        arvoBadge(options?: ArvoBadgeOptions): JQuery;
        arvoChip(options?: ArvoChipOptions): JQuery;
        arvoChipList(options?: ArvoChipListOptions): JQuery;
        arvoBannerAlert(options?: ArvoBannerAlertOptions): JQuery;
        arvoMessageAlert(options?: ArvoMessageAlertOptions): JQuery;
        arvoStatus(options?: ArvoStatusOptions): JQuery;
        arvoLoader(options?: ArvoLoaderOptions): JQuery;
        arvoFormLabel(options?: ArvoFormLabelOptions): JQuery;
        arvoActionMenu(options?: ArvoActionMenuOptions): JQuery;
        arvoContextMenu(options?: ArvoContextMenuOptions): JQuery;
        arvoSearch(options?: ArvoSearchOptions): JQuery;
        arvoAdvanceSearch(options?: ArvoAdvanceSearchOptions): JQuery;
        arvoSelect(options?: ArvoSelectOptions): JQuery;
        arvoCombobox(options?: ArvoComboboxOptions): JQuery;
        arvoMultiSelect(options?: ArvoMultiSelectOptions): JQuery;
        arvoDropdownButton(options?: ArvoDropdownButtonOptions): JQuery;
        arvoSplitButton(options?: ArvoSplitButtonOptions): JQuery;
        arvoSplitIconButton(options?: ArvoSplitIconButtonOptions): JQuery;
        arvoDropdownIconButton(options?: ArvoDropdownIconButtonOptions): JQuery;
        arvoListbox(options?: ArvoListboxOptions): JQuery;
        arvoOptionList(options?: ArvoOptionListOptions): JQuery;
        arvoList(options?: ArvoListOptions): JQuery;
        arvoAlertDialog(options?: ArvoAlertDialogOptions): JQuery;
        arvoSidePanel(options?: ArvoSidePanelOptions): JQuery;
        arvoDrawer(options?: ArvoDrawerOptions): JQuery;
        arvoWindow(options?: ArvoWindowOptions): JQuery;
        arvoDatePicker(options?: ArvoDatePickerOptions): JQuery;
        arvoTimePicker(options?: ArvoTimePickerOptions): JQuery;
        arvoTimePickerDropdown(options?: ArvoTimePickerDropdownOptions): JQuery;
        arvoCalendarDropdown(options?: ArvoCalendarDropdownOptions): JQuery;
        arvoDateTimeDropdown(options?: ArvoDateTimeDropdownOptions): JQuery;
        arvoCalendarRangeDropdown(options?: ArvoCalendarRangeDropdownOptions): JQuery;
        arvoDateTimePicker(options?: ArvoDateTimePickerOptions): JQuery;
        arvoDateRangePicker(options?: ArvoDateRangePickerOptions): JQuery;
        arvoTreeView(options?: ArvoTreeViewOptions): JQuery;
        arvoDropdownTree(options?: ArvoDropdownTreeOptions): JQuery;
        arvoContextHelp(options?: ArvoContextHelpOptions): JQuery;
        arvoAccordion(options?: ArvoAccordionOptions): JQuery;
        arvoTooltip(options?: ArvoTooltipOptions): JQuery;
        arvoRichTooltip(options?: ArvoRichTooltipOptions): JQuery;
        arvoSplitter(options?: ArvoSplitterOptions): JQuery;
        arvoPanel(options?: ArvoPanelOptions): JQuery;
        arvoNavPanel(options?: ArvoNavPanelOptions): JQuery;
        arvoFilterPanel(options?: ArvoFilterPanelOptions): JQuery;
        arvoTooltipContainer(options?: ArvoTooltipContainerOptions): JQuery;
    }
}
interface ComponentEntry {
    Class: {
        new (el: HTMLElement, opts?: Record<string, unknown>): unknown;
    };
    dataKey: string;
}
declare const ALL_COMPONENTS: Record<string, ComponentEntry>;
/**
 * Registers `$.fn.arvo*` jQuery plugins on the provided jQuery instance.
 *
 * By default every component is registered. Pass a list of names to register
 * only the ones you need (tree-shaking won't help with jQuery plugins because
 * they are side-effectful, but this keeps the `$.fn` namespace clean):
 *
 * ```js
 * import { registerArvoPlugins } from '@arvo/js/plugin';
 * registerArvoPlugins($);                                // all components
 * registerArvoPlugins($, ['arvoButton', 'arvoTextbox']);      // selective
 * ```
 *
 * The overlay plugin (`$.fn.openOverlay`, `$.closeAllOverlays`, etc.) is
 * always registered because it is orthogonal to component selection.
 */
export declare function registerArvoPlugins($: JQueryStatic, components?: (keyof typeof ALL_COMPONENTS)[]): void;
export {};
//# sourceMappingURL=plugin.d.ts.map