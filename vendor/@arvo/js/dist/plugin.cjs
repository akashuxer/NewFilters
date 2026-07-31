"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const tooltipContainerSetup = require("./setup/tooltip-container-setup.cjs");
const overlaySetup = require("./setup/overlay-setup.cjs");
const FilterPanel = require("./components/FilterPanel/FilterPanel.cjs");
const NavPanel = require("./components/NavPanel/NavPanel.cjs");
const Panel = require("./components/Panel/Panel.cjs");
const Splitter = require("./components/Splitter/Splitter.cjs");
const RichTooltip = require("./components/RichTooltip/RichTooltip.cjs");
const Tooltip = require("./components/Tooltip/Tooltip.cjs");
const Accordion = require("./components/Accordion/Accordion.cjs");
const ContextHelp = require("./components/ContextHelp/ContextHelp.cjs");
const DropdownTree = require("./components/DropdownTree/DropdownTree.cjs");
const TreeView = require("./components/TreeView/TreeView.cjs");
const DateRangePicker = require("./components/DateRangePicker/DateRangePicker.cjs");
const DateTimePicker = require("./components/DateTimePicker/DateTimePicker.cjs");
const CalendarRangeDropdown = require("./components/CalendarRangeDropdown/CalendarRangeDropdown.cjs");
const DateTimeDropdown = require("./components/DateTimeDropdown/DateTimeDropdown.cjs");
const CalendarDropdown = require("./components/CalendarDropdown/CalendarDropdown.cjs");
const TimePickerDropdown = require("./components/TimePickerDropdown/TimePickerDropdown.cjs");
const TimePicker = require("./components/TimePicker/TimePicker.cjs");
const DatePicker = require("./components/DatePicker/DatePicker.cjs");
const Window = require("./components/Window/Window.cjs");
const Drawer = require("./components/Drawer/Drawer.cjs");
const SidePanel = require("./components/SidePanel/SidePanel.cjs");
const AlertDialog = require("./components/AlertDialog/AlertDialog.cjs");
const List = require("./components/List/List.cjs");
const OptionList = require("./components/OptionList/OptionList.cjs");
const Listbox = require("./components/Listbox/Listbox.cjs");
const DropdownIconButton = require("./components/DropdownIconButton/DropdownIconButton.cjs");
const SplitIconButton = require("./components/SplitIconButton/SplitIconButton.cjs");
const SplitButton = require("./components/SplitButton/SplitButton.cjs");
const DropdownButton = require("./components/DropdownButton/DropdownButton.cjs");
const MultiSelect = require("./components/MultiSelect/MultiSelect.cjs");
const Combobox = require("./components/Combobox/Combobox.cjs");
const Select = require("./components/Select/Select.cjs");
const AdvanceSearch = require("./components/AdvanceSearch/AdvanceSearch.cjs");
const Search = require("./components/Search/Search.cjs");
const ContextMenu = require("./components/ContextMenu/ContextMenu.cjs");
const ActionMenu = require("./components/ActionMenu/ActionMenu.cjs");
const FormLabel = require("./components/FormLabel/FormLabel.cjs");
const Loader = require("./components/Loader/Loader.cjs");
const Status = require("./components/Status/Status.cjs");
const MessageAlert = require("./components/MessageAlert/MessageAlert.cjs");
const BannerAlert = require("./components/BannerAlert/BannerAlert.cjs");
const ChipList = require("./components/ChipList/ChipList.cjs");
const Chip = require("./components/Chip/Chip.cjs");
const Badge = require("./components/Badge/Badge.cjs");
const AvatarGroup = require("./components/AvatarGroup/AvatarGroup.cjs");
const Avatar = require("./components/Avatar/Avatar.cjs");
const Nav = require("./components/Nav/Nav.cjs");
const Breadcrumb = require("./components/Breadcrumb/Breadcrumb.cjs");
const Tabstrip = require("./components/Tabstrip/Tabstrip.cjs");
const IconButtonLink = require("./components/IconButtonLink/IconButtonLink.cjs");
const DisclosureButton = require("./components/DisclosureButton/DisclosureButton.cjs");
const ButtonLink = require("./components/ButtonLink/ButtonLink.cjs");
const Link = require("./components/Link/Link.cjs");
const FabButton = require("./components/FabButton/FabButton.cjs");
const ButtonGroup = require("./components/ButtonGroup/ButtonGroup.cjs");
const HybridPopover = require("./components/HybridPopover/HybridPopover.cjs");
const Popover = require("./components/Popover/Popover.cjs");
const Switch = require("./components/Switch/Switch.cjs");
const RadioGroup = require("./components/RadioGroup/RadioGroup.cjs");
const CheckboxGroup = require("./components/CheckboxGroup/CheckboxGroup.cjs");
const Checkbox = require("./components/Checkbox/Checkbox.cjs");
const Radio = require("./components/Radio/Radio.cjs");
const NumberInput = require("./components/NumberInput/NumberInput.cjs");
const Textarea = require("./components/Textarea/Textarea.cjs");
const Textbox = require("./components/Textbox/Textbox.cjs");
const ToggleButton = require("./components/ToggleButton/ToggleButton.cjs");
const IconButton = require("./components/IconButton/IconButton.cjs");
const Button = require("./components/Button/Button.cjs");
const ALL_COMPONENTS = {
  arvoButton: { Class: Button.ArvoButton, dataKey: "arvoButton" },
  arvoIconButton: { Class: IconButton.ArvoIconButton, dataKey: "arvoIconButton" },
  arvoToggleButton: { Class: ToggleButton.ArvoToggleButton, dataKey: "arvoToggleButton" },
  arvoTextbox: { Class: Textbox.ArvoTextbox, dataKey: "arvoTextbox" },
  arvoTextarea: { Class: Textarea.ArvoTextarea, dataKey: "arvoTextarea" },
  arvoNumberInput: { Class: NumberInput.ArvoNumberInput, dataKey: "arvoNumberInput" },
  arvoRadio: { Class: Radio.ArvoRadio, dataKey: "arvoRadio" },
  arvoCheckbox: { Class: Checkbox.ArvoCheckbox, dataKey: "arvoCheckbox" },
  arvoCheckboxGroup: { Class: CheckboxGroup.ArvoCheckboxGroup, dataKey: "arvoCheckboxGroup" },
  arvoRadioGroup: { Class: RadioGroup.ArvoRadioGroup, dataKey: "arvoRadioGroup" },
  arvoSwitch: { Class: Switch.ArvoSwitch, dataKey: "arvoSwitch" },
  arvoPopover: { Class: Popover.ArvoPopover, dataKey: "arvoPopover" },
  arvoHybridPopover: { Class: HybridPopover.ArvoHybridPopover, dataKey: "arvoHybridPopover" },
  arvoButtonGroup: { Class: ButtonGroup.ArvoButtonGroup, dataKey: "arvoButtonGroup" },
  arvoFabButton: { Class: FabButton.ArvoFabButton, dataKey: "arvoFabButton" },
  arvoLink: { Class: Link.ArvoLink, dataKey: "arvoLink" },
  arvoButtonLink: { Class: ButtonLink.ArvoButtonLink, dataKey: "arvoButtonLink" },
  arvoDisclosureButton: { Class: DisclosureButton.ArvoDisclosureButton, dataKey: "arvoDisclosureButton" },
  arvoIconButtonLink: { Class: IconButtonLink.ArvoIconButtonLink, dataKey: "arvoIconButtonLink" },
  arvoTabstrip: { Class: Tabstrip.ArvoTabstrip, dataKey: "arvoTabstrip" },
  arvoBreadcrumb: { Class: Breadcrumb.ArvoBreadcrumb, dataKey: "arvoBreadcrumb" },
  arvoNav: { Class: Nav.ArvoNav, dataKey: "arvoNav" },
  arvoAvatar: { Class: Avatar.ArvoAvatar, dataKey: "arvoAvatar" },
  arvoAvatarGroup: { Class: AvatarGroup.ArvoAvatarGroup, dataKey: "arvoAvatarGroup" },
  arvoBadge: { Class: Badge.ArvoBadge, dataKey: "arvoBadge" },
  arvoChip: { Class: Chip.ArvoChip, dataKey: "arvoChip" },
  arvoChipList: { Class: ChipList.ArvoChipList, dataKey: "arvoChipList" },
  arvoBannerAlert: { Class: BannerAlert.ArvoBannerAlert, dataKey: "arvoBannerAlert" },
  arvoMessageAlert: { Class: MessageAlert.ArvoMessageAlert, dataKey: "arvoMessageAlert" },
  arvoStatus: { Class: Status.ArvoStatus, dataKey: "arvoStatus" },
  arvoLoader: { Class: Loader.ArvoLoader, dataKey: "arvoLoader" },
  arvoFormLabel: { Class: FormLabel.ArvoFormLabel, dataKey: "arvoFormLabel" },
  arvoActionMenu: { Class: ActionMenu.ArvoActionMenu, dataKey: "arvoActionMenu" },
  arvoContextMenu: { Class: ContextMenu.ArvoContextMenu, dataKey: "arvoContextMenu" },
  arvoSearch: { Class: Search.ArvoSearch, dataKey: "arvoSearch" },
  arvoAdvanceSearch: { Class: AdvanceSearch.ArvoAdvanceSearch, dataKey: "arvoAdvanceSearch" },
  arvoSelect: { Class: Select.ArvoSelect, dataKey: "arvoSelect" },
  arvoCombobox: { Class: Combobox.ArvoCombobox, dataKey: "arvoCombobox" },
  arvoMultiSelect: { Class: MultiSelect.ArvoMultiSelect, dataKey: "arvoMultiSelect" },
  arvoDropdownButton: { Class: DropdownButton.ArvoDropdownButton, dataKey: "arvoDropdownButton" },
  arvoSplitButton: { Class: SplitButton.ArvoSplitButton, dataKey: "arvoSplitButton" },
  arvoSplitIconButton: { Class: SplitIconButton.ArvoSplitIconButton, dataKey: "arvoSplitIconButton" },
  arvoDropdownIconButton: { Class: DropdownIconButton.ArvoDropdownIconButton, dataKey: "arvoDropdownIconButton" },
  arvoListbox: { Class: Listbox.ArvoListbox, dataKey: "arvoListbox" },
  arvoOptionList: { Class: OptionList.ArvoOptionList, dataKey: "arvoOptionList" },
  arvoList: { Class: List.ArvoList, dataKey: "arvoList" },
  arvoAlertDialog: { Class: AlertDialog.ArvoAlertDialog, dataKey: "arvoAlertDialog" },
  arvoSidePanel: { Class: SidePanel.ArvoSidePanel, dataKey: "arvoSidePanel" },
  arvoDrawer: { Class: Drawer.ArvoDrawer, dataKey: "arvoDrawer" },
  arvoWindow: { Class: Window.ArvoWindow, dataKey: "arvoWindow" },
  arvoDatePicker: { Class: DatePicker.ArvoDatePicker, dataKey: "arvoDatePicker" },
  arvoTimePicker: { Class: TimePicker.ArvoTimePicker, dataKey: "arvoTimePicker" },
  arvoTimePickerDropdown: { Class: TimePickerDropdown.ArvoTimePickerDropdown, dataKey: "arvoTimePickerDropdown" },
  arvoCalendarDropdown: { Class: CalendarDropdown.ArvoCalendarDropdown, dataKey: "arvoCalendarDropdown" },
  arvoDateTimeDropdown: { Class: DateTimeDropdown.ArvoDateTimeDropdown, dataKey: "arvoDateTimeDropdown" },
  arvoCalendarRangeDropdown: { Class: CalendarRangeDropdown.ArvoCalendarRangeDropdown, dataKey: "arvoCalendarRangeDropdown" },
  arvoDateTimePicker: { Class: DateTimePicker.ArvoDateTimePicker, dataKey: "arvoDateTimePicker" },
  arvoDateRangePicker: { Class: DateRangePicker.ArvoDateRangePicker, dataKey: "arvoDateRangePicker" },
  arvoTreeView: { Class: TreeView.ArvoTreeView, dataKey: "arvoTreeView" },
  arvoDropdownTree: { Class: DropdownTree.ArvoDropdownTree, dataKey: "arvoDropdownTree" },
  arvoContextHelp: { Class: ContextHelp.ArvoContextHelp, dataKey: "arvoContextHelp" },
  arvoAccordion: { Class: Accordion.ArvoAccordion, dataKey: "arvoAccordion" },
  arvoTooltip: { Class: Tooltip.ArvoTooltip, dataKey: "arvoTooltip" },
  arvoRichTooltip: { Class: RichTooltip.ArvoRichTooltip, dataKey: "arvoRichTooltip" },
  arvoSplitter: { Class: Splitter.ArvoSplitter, dataKey: "arvoSplitter" },
  arvoPanel: { Class: Panel.ArvoPanel, dataKey: "arvoPanel" },
  arvoNavPanel: { Class: NavPanel.ArvoNavPanel, dataKey: "arvoNavPanel" },
  arvoFilterPanel: { Class: FilterPanel.ArvoFilterPanel, dataKey: "arvoFilterPanel" }
};
function registerArvoPlugins($, components) {
  const entries = components ? components.map((name) => [name, ALL_COMPONENTS[name]]).filter(([, e]) => e) : Object.entries(ALL_COMPONENTS);
  for (const [name, { Class, dataKey }] of entries) {
    $.fn[name] = function(options) {
      return this.each(function() {
        if (!$.data(this, dataKey)) {
          $.data(this, dataKey, new Class(this, options));
        }
      });
    };
  }
  overlaySetup.setupOverlayPlugin($);
  tooltipContainerSetup.setupTooltipContainerPlugin($);
}
exports.registerArvoPlugins = registerArvoPlugins;
//# sourceMappingURL=plugin.cjs.map
