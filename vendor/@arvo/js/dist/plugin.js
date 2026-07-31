import { setupTooltipContainerPlugin } from "./setup/tooltip-container-setup.js";
import { setupOverlayPlugin } from "./setup/overlay-setup.js";
import { ArvoFilterPanel } from "./components/FilterPanel/FilterPanel.js";
import { ArvoNavPanel } from "./components/NavPanel/NavPanel.js";
import { ArvoPanel } from "./components/Panel/Panel.js";
import { ArvoSplitter } from "./components/Splitter/Splitter.js";
import { ArvoRichTooltip } from "./components/RichTooltip/RichTooltip.js";
import { ArvoTooltip } from "./components/Tooltip/Tooltip.js";
import { ArvoAccordion } from "./components/Accordion/Accordion.js";
import { ArvoContextHelp } from "./components/ContextHelp/ContextHelp.js";
import { ArvoDropdownTree } from "./components/DropdownTree/DropdownTree.js";
import { ArvoTreeView } from "./components/TreeView/TreeView.js";
import { ArvoDateRangePicker } from "./components/DateRangePicker/DateRangePicker.js";
import { ArvoDateTimePicker } from "./components/DateTimePicker/DateTimePicker.js";
import { ArvoCalendarRangeDropdown } from "./components/CalendarRangeDropdown/CalendarRangeDropdown.js";
import { ArvoDateTimeDropdown } from "./components/DateTimeDropdown/DateTimeDropdown.js";
import { ArvoCalendarDropdown } from "./components/CalendarDropdown/CalendarDropdown.js";
import { ArvoTimePickerDropdown } from "./components/TimePickerDropdown/TimePickerDropdown.js";
import { ArvoTimePicker } from "./components/TimePicker/TimePicker.js";
import { ArvoDatePicker } from "./components/DatePicker/DatePicker.js";
import { ArvoWindow } from "./components/Window/Window.js";
import { ArvoDrawer } from "./components/Drawer/Drawer.js";
import { ArvoSidePanel } from "./components/SidePanel/SidePanel.js";
import { ArvoAlertDialog } from "./components/AlertDialog/AlertDialog.js";
import { ArvoList } from "./components/List/List.js";
import { ArvoOptionList } from "./components/OptionList/OptionList.js";
import { ArvoListbox } from "./components/Listbox/Listbox.js";
import { ArvoDropdownIconButton } from "./components/DropdownIconButton/DropdownIconButton.js";
import { ArvoSplitIconButton } from "./components/SplitIconButton/SplitIconButton.js";
import { ArvoSplitButton } from "./components/SplitButton/SplitButton.js";
import { ArvoDropdownButton } from "./components/DropdownButton/DropdownButton.js";
import { ArvoMultiSelect } from "./components/MultiSelect/MultiSelect.js";
import { ArvoCombobox } from "./components/Combobox/Combobox.js";
import { ArvoSelect } from "./components/Select/Select.js";
import { ArvoAdvanceSearch } from "./components/AdvanceSearch/AdvanceSearch.js";
import { ArvoSearch } from "./components/Search/Search.js";
import { ArvoContextMenu } from "./components/ContextMenu/ContextMenu.js";
import { ArvoActionMenu } from "./components/ActionMenu/ActionMenu.js";
import { ArvoFormLabel } from "./components/FormLabel/FormLabel.js";
import { ArvoLoader } from "./components/Loader/Loader.js";
import { ArvoStatus } from "./components/Status/Status.js";
import { ArvoMessageAlert } from "./components/MessageAlert/MessageAlert.js";
import { ArvoBannerAlert } from "./components/BannerAlert/BannerAlert.js";
import { ArvoChipList } from "./components/ChipList/ChipList.js";
import { ArvoChip } from "./components/Chip/Chip.js";
import { ArvoBadge } from "./components/Badge/Badge.js";
import { ArvoAvatarGroup } from "./components/AvatarGroup/AvatarGroup.js";
import { ArvoAvatar } from "./components/Avatar/Avatar.js";
import { ArvoNav } from "./components/Nav/Nav.js";
import { ArvoBreadcrumb } from "./components/Breadcrumb/Breadcrumb.js";
import { ArvoTabstrip } from "./components/Tabstrip/Tabstrip.js";
import { ArvoIconButtonLink } from "./components/IconButtonLink/IconButtonLink.js";
import { ArvoDisclosureButton } from "./components/DisclosureButton/DisclosureButton.js";
import { ArvoButtonLink } from "./components/ButtonLink/ButtonLink.js";
import { ArvoLink } from "./components/Link/Link.js";
import { ArvoFabButton } from "./components/FabButton/FabButton.js";
import { ArvoButtonGroup } from "./components/ButtonGroup/ButtonGroup.js";
import { ArvoHybridPopover } from "./components/HybridPopover/HybridPopover.js";
import { ArvoPopover } from "./components/Popover/Popover.js";
import { ArvoSwitch } from "./components/Switch/Switch.js";
import { ArvoRadioGroup } from "./components/RadioGroup/RadioGroup.js";
import { ArvoCheckboxGroup } from "./components/CheckboxGroup/CheckboxGroup.js";
import { ArvoCheckbox } from "./components/Checkbox/Checkbox.js";
import { ArvoRadio } from "./components/Radio/Radio.js";
import { ArvoNumberInput } from "./components/NumberInput/NumberInput.js";
import { ArvoTextarea } from "./components/Textarea/Textarea.js";
import { ArvoTextbox } from "./components/Textbox/Textbox.js";
import { ArvoToggleButton } from "./components/ToggleButton/ToggleButton.js";
import { ArvoIconButton } from "./components/IconButton/IconButton.js";
import { ArvoButton } from "./components/Button/Button.js";
const ALL_COMPONENTS = {
  arvoButton: { Class: ArvoButton, dataKey: "arvoButton" },
  arvoIconButton: { Class: ArvoIconButton, dataKey: "arvoIconButton" },
  arvoToggleButton: { Class: ArvoToggleButton, dataKey: "arvoToggleButton" },
  arvoTextbox: { Class: ArvoTextbox, dataKey: "arvoTextbox" },
  arvoTextarea: { Class: ArvoTextarea, dataKey: "arvoTextarea" },
  arvoNumberInput: { Class: ArvoNumberInput, dataKey: "arvoNumberInput" },
  arvoRadio: { Class: ArvoRadio, dataKey: "arvoRadio" },
  arvoCheckbox: { Class: ArvoCheckbox, dataKey: "arvoCheckbox" },
  arvoCheckboxGroup: { Class: ArvoCheckboxGroup, dataKey: "arvoCheckboxGroup" },
  arvoRadioGroup: { Class: ArvoRadioGroup, dataKey: "arvoRadioGroup" },
  arvoSwitch: { Class: ArvoSwitch, dataKey: "arvoSwitch" },
  arvoPopover: { Class: ArvoPopover, dataKey: "arvoPopover" },
  arvoHybridPopover: { Class: ArvoHybridPopover, dataKey: "arvoHybridPopover" },
  arvoButtonGroup: { Class: ArvoButtonGroup, dataKey: "arvoButtonGroup" },
  arvoFabButton: { Class: ArvoFabButton, dataKey: "arvoFabButton" },
  arvoLink: { Class: ArvoLink, dataKey: "arvoLink" },
  arvoButtonLink: { Class: ArvoButtonLink, dataKey: "arvoButtonLink" },
  arvoDisclosureButton: { Class: ArvoDisclosureButton, dataKey: "arvoDisclosureButton" },
  arvoIconButtonLink: { Class: ArvoIconButtonLink, dataKey: "arvoIconButtonLink" },
  arvoTabstrip: { Class: ArvoTabstrip, dataKey: "arvoTabstrip" },
  arvoBreadcrumb: { Class: ArvoBreadcrumb, dataKey: "arvoBreadcrumb" },
  arvoNav: { Class: ArvoNav, dataKey: "arvoNav" },
  arvoAvatar: { Class: ArvoAvatar, dataKey: "arvoAvatar" },
  arvoAvatarGroup: { Class: ArvoAvatarGroup, dataKey: "arvoAvatarGroup" },
  arvoBadge: { Class: ArvoBadge, dataKey: "arvoBadge" },
  arvoChip: { Class: ArvoChip, dataKey: "arvoChip" },
  arvoChipList: { Class: ArvoChipList, dataKey: "arvoChipList" },
  arvoBannerAlert: { Class: ArvoBannerAlert, dataKey: "arvoBannerAlert" },
  arvoMessageAlert: { Class: ArvoMessageAlert, dataKey: "arvoMessageAlert" },
  arvoStatus: { Class: ArvoStatus, dataKey: "arvoStatus" },
  arvoLoader: { Class: ArvoLoader, dataKey: "arvoLoader" },
  arvoFormLabel: { Class: ArvoFormLabel, dataKey: "arvoFormLabel" },
  arvoActionMenu: { Class: ArvoActionMenu, dataKey: "arvoActionMenu" },
  arvoContextMenu: { Class: ArvoContextMenu, dataKey: "arvoContextMenu" },
  arvoSearch: { Class: ArvoSearch, dataKey: "arvoSearch" },
  arvoAdvanceSearch: { Class: ArvoAdvanceSearch, dataKey: "arvoAdvanceSearch" },
  arvoSelect: { Class: ArvoSelect, dataKey: "arvoSelect" },
  arvoCombobox: { Class: ArvoCombobox, dataKey: "arvoCombobox" },
  arvoMultiSelect: { Class: ArvoMultiSelect, dataKey: "arvoMultiSelect" },
  arvoDropdownButton: { Class: ArvoDropdownButton, dataKey: "arvoDropdownButton" },
  arvoSplitButton: { Class: ArvoSplitButton, dataKey: "arvoSplitButton" },
  arvoSplitIconButton: { Class: ArvoSplitIconButton, dataKey: "arvoSplitIconButton" },
  arvoDropdownIconButton: { Class: ArvoDropdownIconButton, dataKey: "arvoDropdownIconButton" },
  arvoListbox: { Class: ArvoListbox, dataKey: "arvoListbox" },
  arvoOptionList: { Class: ArvoOptionList, dataKey: "arvoOptionList" },
  arvoList: { Class: ArvoList, dataKey: "arvoList" },
  arvoAlertDialog: { Class: ArvoAlertDialog, dataKey: "arvoAlertDialog" },
  arvoSidePanel: { Class: ArvoSidePanel, dataKey: "arvoSidePanel" },
  arvoDrawer: { Class: ArvoDrawer, dataKey: "arvoDrawer" },
  arvoWindow: { Class: ArvoWindow, dataKey: "arvoWindow" },
  arvoDatePicker: { Class: ArvoDatePicker, dataKey: "arvoDatePicker" },
  arvoTimePicker: { Class: ArvoTimePicker, dataKey: "arvoTimePicker" },
  arvoTimePickerDropdown: { Class: ArvoTimePickerDropdown, dataKey: "arvoTimePickerDropdown" },
  arvoCalendarDropdown: { Class: ArvoCalendarDropdown, dataKey: "arvoCalendarDropdown" },
  arvoDateTimeDropdown: { Class: ArvoDateTimeDropdown, dataKey: "arvoDateTimeDropdown" },
  arvoCalendarRangeDropdown: { Class: ArvoCalendarRangeDropdown, dataKey: "arvoCalendarRangeDropdown" },
  arvoDateTimePicker: { Class: ArvoDateTimePicker, dataKey: "arvoDateTimePicker" },
  arvoDateRangePicker: { Class: ArvoDateRangePicker, dataKey: "arvoDateRangePicker" },
  arvoTreeView: { Class: ArvoTreeView, dataKey: "arvoTreeView" },
  arvoDropdownTree: { Class: ArvoDropdownTree, dataKey: "arvoDropdownTree" },
  arvoContextHelp: { Class: ArvoContextHelp, dataKey: "arvoContextHelp" },
  arvoAccordion: { Class: ArvoAccordion, dataKey: "arvoAccordion" },
  arvoTooltip: { Class: ArvoTooltip, dataKey: "arvoTooltip" },
  arvoRichTooltip: { Class: ArvoRichTooltip, dataKey: "arvoRichTooltip" },
  arvoSplitter: { Class: ArvoSplitter, dataKey: "arvoSplitter" },
  arvoPanel: { Class: ArvoPanel, dataKey: "arvoPanel" },
  arvoNavPanel: { Class: ArvoNavPanel, dataKey: "arvoNavPanel" },
  arvoFilterPanel: { Class: ArvoFilterPanel, dataKey: "arvoFilterPanel" }
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
  setupOverlayPlugin($);
  setupTooltipContainerPlugin($);
}
export {
  registerArvoPlugins
};
//# sourceMappingURL=plugin.js.map
