"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const core = require("@arvo/core");
const FormLabel = require("../FormLabel/FormLabel.cjs");
const MessageAlert = require("../MessageAlert/MessageAlert.cjs");
const ChipList = require("../ChipList/ChipList.cjs");
const OptionList = require("../OptionList/OptionList.cjs");
const IconButton = require("../IconButton/IconButton.cjs");
let _idCounter = 0;
function isGrouped(items) {
  return items.length > 0 && "items" in items[0];
}
function flattenItems(items) {
  if (isGrouped(items)) {
    const result = [];
    for (const group of items) {
      for (const item of group.items) result.push(item);
    }
    return result;
  }
  return items;
}
function applyFilter(items, query, filterFn) {
  if (!query) return items;
  if (filterFn) {
    if (isGrouped(items)) {
      const result = [];
      for (const group of items) {
        const filtered = group.items.filter((item) => filterFn(item, query));
        if (filtered.length > 0) result.push({ ...group, items: filtered });
      }
      return result;
    }
    return items.filter((item) => filterFn(item, query));
  }
  if (isGrouped(items)) return core.filterGroups(items, { query });
  return core.filterItems(items, { query });
}
function applyMaxSelections(items, selected) {
  const cap = (arr) => arr.map((it) => selected.includes(it.value) ? it : { ...it, isDisabled: true });
  if (isGrouped(items)) return items.map((g) => ({ ...g, items: cap(g.items) }));
  return cap(items);
}
const _ArvoMultiSelect = class _ArvoMultiSelect {
  constructor(element, options) {
    this._fieldEl = null;
    this._valueEl = null;
    this._chipsEl = null;
    this._inputEl = null;
    this._actionsEl = null;
    this._clearEl = null;
    this._sepEl = null;
    this._icoEl = null;
    this._errIcoEl = null;
    this._borderEl = null;
    this._labelEl = null;
    this._alertEl = null;
    this._overflowBtnEl = null;
    this._chipList = null;
    this._optionList = null;
    this._clearBtn = null;
    this._chevronBtn = null;
    this._errMsgAlert = null;
    this._inlineAlert = null;
    this._isOpen = false;
    this._isDisabled = false;
    this._isLoading = false;
    this._isReadonly = false;
    this._value = [];
    this._inputText = "";
    this._isExpanded = false;
    this._activeChipIndex = -1;
    this._element = element;
    this._id = `arvo-multi-sel-${++_idCounter}`;
    this._options = {
      ..._ArvoMultiSelect.DEFAULTS,
      ...options,
      items: options.items ?? [],
      width: options.width ?? null,
      maxHeight: options.maxHeight ?? null,
      errorMsg: options.errorMsg ?? null,
      maxSelections: options.maxSelections ?? null,
      filterFn: options.filterFn ?? null,
      chipListProps: options.chipListProps ?? null,
      optionListProps: options.optionListProps ?? null,
      contextHelp: options.contextHelp ?? null,
      onChange: options.onChange ?? null,
      onInputChange: options.onInputChange ?? null,
      onRemove: options.onRemove ?? null,
      onClear: options.onClear ?? null,
      onOpen: options.onOpen ?? null,
      onClose: options.onClose ?? null,
      onOpenChange: options.onOpenChange ?? null,
      onExpandedChange: options.onExpandedChange ?? null
    };
    this._isDisabled = this._options.isDisabled;
    this._isLoading = this._options.isLoading === true;
    this._isReadonly = this._options.isReadOnly;
    this._value = options.value !== void 0 ? options.value : options.defaultValue ?? [];
    this._inputText = options.inputValue !== void 0 ? options.inputValue : "";
    this._isExpanded = options.isExpanded !== void 0 ? options.isExpanded : options.defaultExpanded ?? false;
    this._boundHandleFieldClick = this._handleFieldClick.bind(this);
    this._boundHandleFieldMouseDown = this._handleFieldMouseDown.bind(this);
    this._boundHandleInputKeyDown = this._handleInputKeyDown.bind(this);
    this._boundHandleInputInput = this._handleInputInput.bind(this);
    this._boundHandleInputFocus = this._handleInputFocus.bind(this);
    this._boundHandleInputBlur = this._handleInputBlur.bind(this);
    this._boundChipListDismiss = (e) => this._handleChipListDismiss(e);
    this._buildRoot();
    this._applyStyleVars();
    this._applyRootClasses();
    this._applyWidthStyle();
    this._setupOptionList();
    this._renderChips();
    this._refreshOptionListItems();
    const initialOpen = options.isOpen !== void 0 ? options.isOpen : options.defaultOpen ?? false;
    if (initialOpen) this._doOpen(true);
  }
  static initialize(element, options) {
    return new _ArvoMultiSelect(element, options);
  }
  // ---------------------------------------------------------------------------
  // Root DOM Build
  // ---------------------------------------------------------------------------
  _buildRoot() {
    const el = this._element;
    if (this._options.label) {
      const lbl = FormLabel.ArvoFormLabel.initialize(null, {
        text: this._options.label,
        for: `${this._id}-input`,
        isRequired: this._options.isRequired,
        contextHelp: this._options.contextHelp
      }).el;
      lbl.id = `${this._id}-lbl`;
      lbl.classList.add("arvo-multi-sel__lbl");
      el.appendChild(lbl);
      this._labelEl = lbl;
    }
    this._fieldEl = document.createElement("div");
    this._fieldEl.id = `${this._id}-field`;
    this._fieldEl.className = "arvo-multi-sel__field";
    this._fieldEl.setAttribute("role", "combobox");
    this._fieldEl.setAttribute("aria-haspopup", "listbox");
    this._fieldEl.setAttribute("aria-expanded", "false");
    this._fieldEl.setAttribute("aria-autocomplete", "list");
    if (this._options.isRequired) this._fieldEl.setAttribute("aria-required", "true");
    if (this._options.isInvalid) this._fieldEl.setAttribute("aria-invalid", "true");
    if (this._isDisabled) this._fieldEl.setAttribute("aria-disabled", "true");
    if (this._isLoading) this._fieldEl.setAttribute("aria-busy", "true");
    if (this._labelEl) {
      this._fieldEl.setAttribute("aria-labelledby", `${this._id}-lbl`);
    } else {
      this._fieldEl.setAttribute(
        "aria-label",
        this._options.placeholder || "Select"
      );
    }
    this._fieldEl.addEventListener("click", this._boundHandleFieldClick);
    this._fieldEl.addEventListener("mousedown", this._boundHandleFieldMouseDown);
    this._fieldEl.addEventListener("chip-list:dismiss", this._boundChipListDismiss);
    this._valueEl = document.createElement("div");
    this._valueEl.className = "arvo-multi-sel__value";
    this._fieldEl.appendChild(this._valueEl);
    this._inputEl = document.createElement("input");
    this._inputEl.id = `${this._id}-input`;
    this._inputEl.type = "text";
    this._inputEl.className = "arvo-multi-sel__input";
    this._inputEl.placeholder = this._options.placeholder;
    this._inputEl.value = this._inputText;
    this._inputEl.autocomplete = "off";
    this._inputEl.disabled = this._isDisabled;
    this._inputEl.readOnly = this._isReadonly || this._isLoading;
    this._inputEl.setAttribute("aria-autocomplete", "list");
    if (this._labelEl) {
      this._inputEl.setAttribute("aria-labelledby", `${this._id}-lbl`);
    } else {
      this._inputEl.setAttribute(
        "aria-label",
        this._options.placeholder || "Select"
      );
    }
    if (this._options.isRequired) this._inputEl.setAttribute("aria-required", "true");
    if (this._options.isInvalid) this._inputEl.setAttribute("aria-invalid", "true");
    if (this._isLoading) this._inputEl.setAttribute("aria-busy", "true");
    this._inputEl.addEventListener("keydown", this._boundHandleInputKeyDown);
    this._inputEl.addEventListener("input", this._boundHandleInputInput);
    this._inputEl.addEventListener("focus", this._boundHandleInputFocus);
    this._inputEl.addEventListener("blur", this._boundHandleInputBlur);
    this._valueEl.appendChild(this._inputEl);
    if (this._options.errorDisplay === "tooltip") {
      this._errMsgAlert = MessageAlert.ArvoMessageAlert.initialize(document.createElement("div"), {
        type: "negative",
        isInline: true,
        message: this._options.errorMsg ?? null
      });
      this._errIcoEl = this._errMsgAlert.el;
      this._errIcoEl.classList.add("arvo-multi-sel__err-ico");
      this._fieldEl.appendChild(this._errIcoEl);
    }
    this._actionsEl = document.createElement("div");
    this._actionsEl.className = "arvo-multi-sel__actions";
    if (this._options.isClearable) {
      this._clearEl = document.createElement("button");
      this._clearBtn = IconButton.ArvoIconButton.initialize(this._clearEl, {
        variant: "tertiary",
        size: "xs",
        icon: "close",
        tooltip: "Clear all",
        isDisabled: this._isDisabled,
        onClick: (e) => {
          e.stopPropagation();
          this._handleClearAll();
        }
      });
      this._clearEl.classList.add("arvo-multi-sel__clear");
      this._clearEl.setAttribute("tabindex", "-1");
      this._actionsEl.appendChild(this._clearEl);
      this._sepEl = document.createElement("span");
      this._sepEl.className = "arvo-multi-sel__sep";
      this._sepEl.setAttribute("aria-hidden", "true");
      this._actionsEl.appendChild(this._sepEl);
    }
    this._icoEl = document.createElement("button");
    this._chevronBtn = IconButton.ArvoIconButton.initialize(this._icoEl, {
      variant: "tertiary",
      size: "sm",
      icon: "angle-down",
      tooltip: "Toggle options",
      isDisabled: this._isDisabled,
      onClick: (e) => this._handleChevronClick(e)
    });
    this._icoEl.classList.add("arvo-multi-sel__ico");
    this._icoEl.setAttribute("tabindex", "-1");
    this._actionsEl.appendChild(this._icoEl);
    this._fieldEl.appendChild(this._actionsEl);
    this._borderEl = document.createElement("div");
    this._borderEl.className = "arvo-multi-sel__border";
    this._fieldEl.appendChild(this._borderEl);
    el.appendChild(this._fieldEl);
    if (this._options.isInvalid && this._options.errorMsg && this._options.errorDisplay === "inline") {
      this._inlineAlert = MessageAlert.ArvoMessageAlert.initialize(document.createElement("div"), {
        type: "negative",
        message: this._options.errorMsg,
        id: `${this._id}-err`
      });
      this._alertEl = this._inlineAlert.el;
      this._fieldEl.setAttribute("aria-describedby", `${this._id}-err`);
      el.appendChild(this._alertEl);
    }
  }
  // ---------------------------------------------------------------------------
  // Composed OptionList
  // ---------------------------------------------------------------------------
  _setupOptionList() {
    if (!this._fieldEl || !this._inputEl) return;
    const listOptions = {
      ...this._options.optionListProps ?? void 0,
      items: this._processedItems(),
      isMultiple: true,
      value: this._value,
      placement: this._options.placement,
      maxHeight: this._options.maxHeight ?? void 0,
      hasGroupDividers: this._options.hasGroupDividers,
      isDisabled: this._isDisabled,
      ariaLabel: this._options.label || void 0,
      closeOnSelect: this._options.closeOnSelect,
      bindTrigger: false,
      // Bounded option navigation (no cycling) per the multi-select keyboard model.
      wrapNavigation: false,
      // The field (__field) is the positioning/ARIA anchor, but the editable
      // __input is the focus target, so aria-activedescendant lands on the input.
      activeDescendantElement: this._inputEl,
      onChange: (detail) => this._handleOptionChange(detail),
      onOpenChange: (open) => this._handleListOpenChange(open)
    };
    this._optionList = OptionList.ArvoOptionList.initialize(this._fieldEl, listOptions);
  }
  // ---------------------------------------------------------------------------
  // Selection / filtering / overflow helpers
  // ---------------------------------------------------------------------------
  _interactive() {
    return !this._isDisabled && !this._isLoading && !this._isReadonly;
  }
  _dispatch(name, detail, cancelable) {
    var _a;
    const ev = new CustomEvent(name, { bubbles: true, cancelable, detail });
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(ev);
    return ev;
  }
  _optionByValue() {
    const map = /* @__PURE__ */ new Map();
    for (const it of flattenItems(this._options.items)) map.set(it.value, it);
    return map;
  }
  /** Filtered (by input text) + maxSelections-capped items passed to ArvoOptionList. */
  _processedItems() {
    const filtered = applyFilter(
      this._options.items,
      this._inputText,
      this._options.filterFn
    );
    const cap = this._options.maxSelections;
    const atCap = typeof cap === "number" && this._value.length >= cap;
    return atCap ? applyMaxSelections(filtered, this._value) : filtered;
  }
  _expandedActive() {
    return this._options.overflowMode === "expandable" && this._isExpanded;
  }
  _chipListOverflowMode() {
    if (this._options.overflowMode === "expandable") return "max-rows";
    if (this._options.overflowMode === "single-line") return "single-line";
    return "wrap";
  }
  _applyStyleVars() {
    if (!this._element) return;
    this._element.style.setProperty(
      "--arvo-multi-sel-max-rows",
      String(this._options.maxRows)
    );
    this._element.style.setProperty(
      "--arvo-multi-sel-expanded-max-rows",
      String(this._options.expandedMaxRows)
    );
  }
  // ---------------------------------------------------------------------------
  // Chip rendering (inner ArvoChipList)
  // ---------------------------------------------------------------------------
  _buildChipItems() {
    const byVal = this._optionByValue();
    return this._value.map((v) => {
      const opt = byVal.get(v) ?? null;
      const label = (opt == null ? void 0 : opt.label) ?? String(v);
      return {
        key: String(v),
        label,
        variant: "input",
        icon: opt == null ? void 0 : opt.icon,
        avatar: opt == null ? void 0 : opt.avatar,
        dismissLabel: `Remove ${label}`
      };
    });
  }
  _renderChips() {
    if (!this._valueEl || !this._inputEl) return;
    const items = this._buildChipItems();
    this._inputEl.placeholder = items.length > 0 ? "" : this._options.placeholder;
    if (items.length === 0) {
      if (this._chipList) {
        this._chipList.destroy();
        this._chipList = null;
      }
      if (this._chipsEl) {
        this._chipsEl.remove();
        this._chipsEl = null;
      }
      this._overflowBtnEl = null;
      this._activeChipIndex = -1;
      this._syncActiveChipHighlight();
      return;
    }
    const mode = this._chipListOverflowMode();
    const expanded = this._expandedActive();
    const isStaticOverflow = this._options.overflowMode === "single-line";
    if (!this._chipList || !this._chipsEl) {
      this._chipsEl = document.createElement("div");
      this._valueEl.insertBefore(this._chipsEl, this._inputEl);
      this._chipList = ChipList.ArvoChipList.initialize(this._chipsEl, {
        ...this._options.chipListProps ?? void 0,
        variant: "input",
        appearance: this._options.chipAppearance,
        overflowMode: mode,
        maxRows: this._options.maxRows,
        isDisabled: this._isDisabled,
        isReadOnly: this._isReadonly,
        isLoading: this._isLoading,
        // The multi-select drives the persistent __overflow disclosure
        // via the chip-list's expansion props. When `overflowMode` is
        // 'single-line' the disclosure becomes a static, non-interactive
        // indicator and the expansion contract is suppressed.
        isWithinField: true,
        isStaticOverflow,
        isExpanded: expanded,
        onExpandedChange: (next) => this._setExpanded(next),
        expandedLabel: () => "Show less",
        ariaLabel: this._options.label ? `${this._options.label} selected options` : "Selected options",
        items
      });
      this._chipsEl.classList.add("arvo-multi-sel__chips");
    } else {
      this._chipList.readOnly(this._isReadonly);
      this._chipList.expanded(expanded);
      this._chipList.setItems(items);
      this._chipsEl.classList.add("arvo-multi-sel__chips");
    }
    this._assignChipIds();
    this._captureOverflowBtn();
    if (this._activeChipIndex >= this._getCursorSlotCount()) {
      this._activeChipIndex = -1;
    }
    this._syncActiveChipHighlight();
  }
  /**
   * Assign a stable id to each rendered chip element so the input can point
   * `aria-activedescendant` at it when the user walks chips via arrow keys.
   * The chip-list's __overflow disclosure also gets an id so the cursor can
   * land on it.
   */
  _assignChipIds() {
    if (!this._chipsEl) return;
    const chipEls = this._chipsEl.querySelectorAll(
      ":scope > .arvo-chip"
    );
    chipEls.forEach((el, i) => {
      el.id = `${this._id}-chip-${i}`;
    });
    const overflow = this._chipsEl.querySelector(
      ":scope > .arvo-chip-list__overflow"
    );
    if (overflow) overflow.id = `${this._id}-disclosure`;
  }
  /**
   * Capture the disclosure DOM element for the active-descendant walk.
   * Strict single-line mode renders the disclosure as a non-interactive
   * `<span>` (`.arvo-chip-list__overflow--static`); skip it so the
   * active-descendant cursor walks chips only.
   */
  _captureOverflowBtn() {
    if (!this._chipsEl) {
      this._overflowBtnEl = null;
      return;
    }
    if (this._options.overflowMode === "single-line") {
      this._overflowBtnEl = null;
      return;
    }
    this._overflowBtnEl = this._chipsEl.querySelector(
      ":scope > .arvo-chip-list__overflow"
    );
  }
  // ---------------------------------------------------------------------------
  // Active-descendant chip focus
  // ---------------------------------------------------------------------------
  /** Visible chip elements, in render order, excluding hidden overflow chips. */
  _getVisibleChipEls() {
    if (!this._chipsEl) return [];
    return Array.from(
      this._chipsEl.querySelectorAll(":scope > .arvo-chip")
    ).filter((el) => el.style.visibility !== "hidden");
  }
  /**
   * Number of slots the active-descendant cursor can walk through: visible
   * chips + the persistent __overflow disclosure (when one is rendered).
   * Mirrors the React twin's `getCursorSlotCount`.
   */
  _getCursorSlotCount() {
    const chipCount = this._getVisibleChipEls().length;
    const hasDisclosure = !!this._overflowBtnEl;
    return chipCount + (hasDisclosure ? 1 : 0);
  }
  /** True if the active descendant is currently the disclosure slot. */
  _activeIsDisclosure() {
    const chipCount = this._getVisibleChipEls().length;
    const hasDisclosure = !!this._overflowBtnEl;
    return hasDisclosure && this._activeChipIndex === chipCount;
  }
  _setActiveChip(index) {
    const slotCount = this._getCursorSlotCount();
    if (index < 0 || index >= slotCount) {
      this._activeChipIndex = -1;
    } else {
      this._activeChipIndex = index;
    }
    this._syncActiveChipHighlight();
  }
  _clearActiveChip() {
    if (this._activeChipIndex === -1) return;
    this._activeChipIndex = -1;
    this._syncActiveChipHighlight();
  }
  /** Mirror the active chip/disclosure index onto the DOM. */
  _syncActiveChipHighlight() {
    var _a;
    if (!this._inputEl) return;
    if (this._chipsEl) {
      const els = Array.from(
        this._chipsEl.querySelectorAll(":scope > .arvo-chip")
      );
      for (const el of els) el.classList.remove("highlighted");
    }
    (_a = this._overflowBtnEl) == null ? void 0 : _a.classList.remove("highlighted");
    const visible = this._getVisibleChipEls();
    const hasDisclosure = !!this._overflowBtnEl;
    const totalSlots = visible.length + (hasDisclosure ? 1 : 0);
    if (this._activeChipIndex < 0 || this._activeChipIndex >= totalSlots) {
      if (!this._isOpen) this._inputEl.removeAttribute("aria-activedescendant");
      return;
    }
    const activeEl = this._activeChipIndex < visible.length ? visible[this._activeChipIndex] : this._overflowBtnEl;
    activeEl == null ? void 0 : activeEl.classList.add("highlighted");
    if (!this._isOpen && (activeEl == null ? void 0 : activeEl.id)) {
      this._inputEl.setAttribute("aria-activedescendant", activeEl.id);
    } else if (!this._isOpen) {
      this._inputEl.removeAttribute("aria-activedescendant");
    }
  }
  // ---------------------------------------------------------------------------
  // Value mutations (shared by user interaction + imperative API)
  // ---------------------------------------------------------------------------
  /** Re-sync the chips, dropdown selection, dropdown items, and root classes. */
  _afterValueChange() {
    var _a;
    this._renderChips();
    (_a = this._optionList) == null ? void 0 : _a.value(this._value);
    if (this._options.maxSelections != null) this._refreshOptionListItems();
    this._applyRootClasses();
  }
  _refreshOptionListItems() {
    var _a, _b;
    (_a = this._optionList) == null ? void 0 : _a.setItems(this._processedItems());
    (_b = this._optionList) == null ? void 0 : _b.value(this._value);
  }
  _setExpanded(next) {
    var _a, _b;
    this._isExpanded = next;
    this._renderChips();
    this._applyRootClasses();
    (_b = (_a = this._options).onExpandedChange) == null ? void 0 : _b.call(_a, next);
    this._dispatch("multi-sel:expand", { expanded: next }, false);
  }
  _handleRemove(val, item) {
    var _a, _b, _c, _d;
    if (!this._interactive()) return;
    const ev = this._dispatch("multi-sel:remove", { value: val, item }, true);
    if (ev.defaultPrevented) return;
    const next = this._value.filter((v) => v !== val);
    this._value = next;
    this._afterValueChange();
    if (item) (_b = (_a = this._options).onRemove) == null ? void 0 : _b.call(_a, val, item);
    (_d = (_c = this._options).onChange) == null ? void 0 : _d.call(_c, next, item, false);
    this._dispatch("multi-sel:change", { value: next, item, isSelected: false }, true);
  }
  _handleClearAll() {
    var _a, _b, _c, _d, _e;
    if (!this._interactive()) return;
    if (this._value.length === 0 && this._inputText === "") return;
    const previousValue = [...this._value];
    this._value = [];
    this._inputText = "";
    if (this._inputEl) this._inputEl.value = "";
    this._afterValueChange();
    this._refreshOptionListItems();
    (_b = (_a = this._options).onClear) == null ? void 0 : _b.call(_a, { previousValue });
    this._dispatch("multi-sel:clear", { previousValue }, false);
    (_d = (_c = this._options).onChange) == null ? void 0 : _d.call(_c, [], null, false);
    this._dispatch("multi-sel:change", { value: [], item: null, isSelected: false }, true);
    (_e = this._inputEl) == null ? void 0 : _e.focus();
  }
  _handleChipListDismiss(e) {
    const detail = e.detail;
    const key = detail == null ? void 0 : detail.key;
    if (key == null) return;
    const val = this._value.find((v) => String(v) === String(key));
    if (val === void 0) return;
    this._handleRemove(val, this._optionByValue().get(val) ?? null);
  }
  _handleChevronClick(e) {
    var _a;
    e.stopPropagation();
    if (!this._interactive()) return;
    if (this._isOpen) this.close();
    else {
      this.open();
      (_a = this._inputEl) == null ? void 0 : _a.focus();
    }
  }
  _setInputText(text) {
    var _a, _b;
    this._inputText = text;
    if (this._inputEl) this._inputEl.value = text;
    (_b = (_a = this._options).onInputChange) == null ? void 0 : _b.call(_a, text);
    this._dispatch("multi-sel:input", { value: text }, false);
    this._refreshOptionListItems();
  }
  // ---------------------------------------------------------------------------
  // CSS Classes
  // ---------------------------------------------------------------------------
  _applyRootClasses() {
    const el = this._element;
    if (!el) return;
    el.classList.add("arvo-multi-sel", `arvo-multi-sel--surface-${this._options.surface}`);
    el.classList.toggle(`arvo-multi-sel--${this._options.overflowMode}`, true);
    el.classList.toggle("arvo-multi-sel--full-width", this._options.isFullWidth);
    el.classList.toggle("arvo-multi-sel--clearable", this._options.isClearable);
    el.classList.toggle("loading", this._isLoading);
    el.classList.toggle("is-disabled", this._isDisabled);
    el.classList.toggle("is-readonly", this._isReadonly);
    el.classList.toggle("has-error", this._options.isInvalid);
    el.classList.toggle(
      "error-tooltip",
      this._options.isInvalid && this._options.errorDisplay === "tooltip"
    );
    el.classList.toggle("open", this._isOpen);
    el.classList.toggle("has-value", this._value.length > 0);
    el.classList.toggle("arvo-multi-sel--expanded", this._expandedActive());
  }
  // ---------------------------------------------------------------------------
  // Width Style
  // ---------------------------------------------------------------------------
  _applyWidthStyle() {
    if (!this._element) return;
    const effectiveWidth = this._options.isFullWidth ? "100%" : this._options.width;
    if (effectiveWidth) {
      this._element.style.setProperty("--arvo-form-input-width", effectiveWidth);
    } else {
      this._element.style.removeProperty("--arvo-form-input-width");
    }
  }
  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------
  /**
   * Capture-phase mousedown on __field. Preserves input focus during clicks
   * on non-input controls (chip-list overflow disclosure, chip dismiss
   * spans, clear/chevron action buttons, chip bodies). Without this,
   * browsers move focus to the click target on mousedown -- the input
   * would blur (clearing typed text) and any active-descendant chip
   * highlight would be torn down. The actual click handler still runs on
   * the target; we only suppress the focus shift.
   */
  _handleFieldMouseDown(e) {
    if (!this._interactive()) return;
    const target = e.target;
    if (!target) return;
    if (target === this._inputEl) return;
    if (target.tagName === "INPUT") return;
    e.preventDefault();
  }
  _handleFieldClick(e) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!this._interactive()) return;
    const target = e.target;
    if ((_a = target.closest) == null ? void 0 : _a.call(target, ".arvo-multi-sel__actions")) return;
    if ((_b = target.closest) == null ? void 0 : _b.call(target, ".arvo-chip-list__overflow")) {
      (_c = this._inputEl) == null ? void 0 : _c.focus();
      return;
    }
    if ((_d = target.closest) == null ? void 0 : _d.call(target, ".arvo-chip__dismiss")) return;
    if ((_e = target.closest) == null ? void 0 : _e.call(target, ".arvo-chip")) {
      this._clearActiveChip();
      (_f = this._inputEl) == null ? void 0 : _f.focus();
      return;
    }
    this._clearActiveChip();
    (_g = this._inputEl) == null ? void 0 : _g.focus();
    if (!this._isOpen) this.open();
  }
  _handleInputKeyDown(e) {
    var _a, _b;
    if (this._isDisabled || this._isLoading || this._isReadonly) return;
    const hasText = this._inputText.length > 0;
    const chipActive = this._activeChipIndex >= 0;
    const slotCount = this._getCursorSlotCount();
    const disclosureActive = this._activeIsDisclosure();
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
        this._clearActiveChip();
        if (!this._isOpen) {
          e.preventDefault();
          this.open();
        }
        break;
      case "ArrowLeft": {
        if (!chipActive && (this._inputEl.selectionStart !== 0 || this._inputEl.selectionEnd !== 0)) {
          break;
        }
        if (slotCount === 0) break;
        e.preventDefault();
        e.stopPropagation();
        if (!chipActive) {
          this._setActiveChip(slotCount - 1);
        } else {
          this._setActiveChip(Math.max(0, this._activeChipIndex - 1));
        }
        break;
      }
      case "ArrowRight": {
        if (!chipActive) break;
        e.preventDefault();
        e.stopPropagation();
        const next = this._activeChipIndex + 1;
        if (next >= slotCount) {
          this._clearActiveChip();
        } else {
          this._setActiveChip(next);
        }
        break;
      }
      case "Home": {
        if (!chipActive) break;
        if (slotCount === 0) break;
        e.preventDefault();
        e.stopPropagation();
        this._setActiveChip(0);
        break;
      }
      case "End": {
        if (!chipActive) break;
        e.preventDefault();
        e.stopPropagation();
        this._clearActiveChip();
        break;
      }
      case "Enter": {
        if (disclosureActive) {
          e.preventDefault();
          e.stopPropagation();
          (_a = this._overflowBtnEl) == null ? void 0 : _a.click();
        }
        break;
      }
      case " ":
        if (disclosureActive) {
          e.preventDefault();
          e.stopPropagation();
          (_b = this._overflowBtnEl) == null ? void 0 : _b.click();
        } else if (hasText) {
          e.stopPropagation();
        } else {
          e.preventDefault();
          if (!this._isOpen) this.open();
        }
        break;
      case "Backspace":
        if (disclosureActive) {
          e.preventDefault();
          e.stopPropagation();
        } else if (chipActive) {
          e.preventDefault();
          e.stopPropagation();
          this._removeActiveChip();
        } else if (!hasText && this._value.length > 0) {
          e.stopPropagation();
          const last = this._value[this._value.length - 1];
          this._handleRemove(last, this._optionByValue().get(last) ?? null);
        }
        break;
      case "Delete":
        if (disclosureActive) {
          e.preventDefault();
          e.stopPropagation();
        } else if (chipActive) {
          e.preventDefault();
          e.stopPropagation();
          this._removeActiveChip();
        }
        break;
      case "Escape":
        if (this._isOpen) {
          this._clearActiveChip();
        } else if (chipActive) {
          e.preventDefault();
          e.stopPropagation();
          this._clearActiveChip();
        } else if (hasText) {
          e.preventDefault();
          e.stopPropagation();
          this._setInputText("");
        }
        break;
      case "Tab":
        if (this._isOpen) this.close();
        this._clearActiveChip();
        break;
    }
  }
  /** Remove the chip currently highlighted by the active-descendant cursor. */
  _removeActiveChip() {
    if (this._activeIsDisclosure()) return;
    const els = this._getVisibleChipEls();
    if (this._activeChipIndex < 0 || this._activeChipIndex >= els.length) return;
    const targetEl = els[this._activeChipIndex];
    const id = targetEl.id;
    const chipIndex = parseInt(id.replace(`${this._id}-chip-`, ""), 10);
    if (Number.isNaN(chipIndex)) return;
    const val = this._value[chipIndex];
    if (val === void 0) return;
    const prevActive = this._activeChipIndex;
    this._handleRemove(val, this._optionByValue().get(val) ?? null);
    const after = this._getVisibleChipEls();
    if (after.length === 0) {
      this._clearActiveChip();
    } else if (prevActive < after.length) {
      this._setActiveChip(prevActive);
    } else {
      this._setActiveChip(after.length - 1);
    }
  }
  _handleInputInput(e) {
    var _a, _b;
    if (!this._interactive()) return;
    const target = e.target;
    this._inputText = target.value;
    this._clearActiveChip();
    (_b = (_a = this._options).onInputChange) == null ? void 0 : _b.call(_a, this._inputText);
    this._dispatch("multi-sel:input", { value: this._inputText }, false);
    if (!this._isOpen && this._inputText.length > 0) this.open();
    this._refreshOptionListItems();
  }
  _handleInputFocus(_e) {
    this._clearActiveChip();
  }
  _handleInputBlur(e) {
    var _a;
    const nextTarget = e.relatedTarget;
    if (nextTarget && ((_a = this._element) == null ? void 0 : _a.contains(nextTarget))) return;
    if (this._inputText.length > 0) {
      this._setInputText("");
    }
    this._clearActiveChip();
  }
  // ---------------------------------------------------------------------------
  // Selection (driven by the composed ArvoOptionList)
  // ---------------------------------------------------------------------------
  _handleOptionChange(detail) {
    var _a, _b;
    const arr = Array.isArray(detail.value) ? [...detail.value] : [];
    this._value = arr;
    this._afterValueChange();
    (_b = (_a = this._options).onChange) == null ? void 0 : _b.call(_a, arr, detail.option, detail.isSelected);
    this._dispatch(
      "multi-sel:change",
      { value: arr, item: detail.option, isSelected: detail.isSelected },
      true
    );
  }
  // OptionList reports hub-driven dismissal (outside click / Escape) here.
  // Picker-silent contract (architecture/20-OVERLAY-MIGRATION-NOTES.md):
  // engine-driven dismissal is unconditional -- no `multi-sel:close` event,
  // no `onClose` veto. Only programmatic `close()` and field-driven toggle
  // paths route through `_doClose()`. Combobox is the reference
  // implementation. Unconditionally flipping local state here keeps us in
  // sync with the engine even if a veto path would otherwise leave
  // `_isOpen` stale.
  _handleListOpenChange(open) {
    var _a, _b, _c, _d;
    if (!open && this._isOpen) {
      this._isOpen = false;
      (_a = this._element) == null ? void 0 : _a.classList.remove("open");
      (_b = this._fieldEl) == null ? void 0 : _b.setAttribute("aria-expanded", "false");
      (_d = (_c = this._options).onOpenChange) == null ? void 0 : _d.call(_c, false);
      this._syncActiveChipHighlight();
    }
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  open() {
    this._doOpen(false);
  }
  _doOpen(silent) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (this._isOpen || this._isDisabled || this._isLoading || this._isReadonly) return;
    if (!silent && ((_b = (_a = this._options).onOpen) == null ? void 0 : _b.call(_a)) === false) return;
    if (!silent) {
      const event = new CustomEvent("multi-sel:open", {
        bubbles: true,
        cancelable: true
      });
      if (!((_c = this._element) == null ? void 0 : _c.dispatchEvent(event))) return;
    }
    this._isOpen = true;
    (_d = this._element) == null ? void 0 : _d.classList.add("open");
    (_e = this._fieldEl) == null ? void 0 : _e.setAttribute("aria-expanded", "true");
    (_f = this._optionList) == null ? void 0 : _f.open();
    if (!silent) (_h = (_g = this._options).onOpenChange) == null ? void 0 : _h.call(_g, true);
  }
  close() {
    if (!this._isOpen) return;
    this._doClose();
  }
  _doClose() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (((_b = (_a = this._options).onClose) == null ? void 0 : _b.call(_a)) === false) return false;
    const event = new CustomEvent("multi-sel:close", {
      bubbles: true,
      cancelable: true
    });
    if (!((_c = this._element) == null ? void 0 : _c.dispatchEvent(event))) return false;
    this._isOpen = false;
    (_d = this._element) == null ? void 0 : _d.classList.remove("open");
    (_e = this._fieldEl) == null ? void 0 : _e.setAttribute("aria-expanded", "false");
    (_f = this._optionList) == null ? void 0 : _f.close();
    (_h = (_g = this._options).onOpenChange) == null ? void 0 : _h.call(_g, false);
    return true;
  }
  toggle(force) {
    const shouldOpen = force !== void 0 ? force : !this._isOpen;
    if (shouldOpen) this.open();
    else this.close();
  }
  isOpen() {
    return this._isOpen;
  }
  value(newValue) {
    if (newValue === void 0) return [...this._value];
    this._value = [...newValue];
    this._afterValueChange();
    this._refreshOptionListItems();
    this._dispatch(
      "multi-sel:change",
      { value: [...this._value], item: null, isSelected: false },
      true
    );
  }
  add(val) {
    var _a, _b;
    if (this._value.includes(val)) return;
    const cap = this._options.maxSelections;
    if (typeof cap === "number" && this._value.length >= cap) return;
    const item = this._optionByValue().get(val) ?? null;
    const next = [...this._value, val];
    this._value = next;
    this._afterValueChange();
    (_b = (_a = this._options).onChange) == null ? void 0 : _b.call(_a, next, item, true);
    this._dispatch("multi-sel:change", { value: next, item, isSelected: true }, true);
  }
  remove(val) {
    var _a, _b, _c, _d;
    if (!this._value.includes(val)) return;
    const item = this._optionByValue().get(val) ?? null;
    const next = this._value.filter((v) => v !== val);
    this._value = next;
    this._afterValueChange();
    if (item) (_b = (_a = this._options).onRemove) == null ? void 0 : _b.call(_a, val, item);
    this._dispatch("multi-sel:remove", { value: val, item }, true);
    (_d = (_c = this._options).onChange) == null ? void 0 : _d.call(_c, next, item, false);
    this._dispatch("multi-sel:change", { value: next, item, isSelected: false }, true);
  }
  inputValue(text) {
    if (text === void 0) return this._inputText;
    this._inputText = text;
    if (this._inputEl) this._inputEl.value = text;
    this._refreshOptionListItems();
  }
  clear() {
    var _a, _b, _c, _d;
    const previousValue = [...this._value];
    if (previousValue.length === 0 && this._inputText === "") return;
    this._value = [];
    this._inputText = "";
    if (this._inputEl) this._inputEl.value = "";
    this._afterValueChange();
    this._refreshOptionListItems();
    (_b = (_a = this._options).onClear) == null ? void 0 : _b.call(_a, { previousValue });
    this._dispatch("multi-sel:clear", { previousValue }, false);
    (_d = (_c = this._options).onChange) == null ? void 0 : _d.call(_c, [], null, false);
    this._dispatch("multi-sel:change", { value: [], item: null, isSelected: false }, true);
  }
  expanded(state) {
    if (state === void 0) return this._isExpanded;
    this._setExpanded(state);
  }
  updateItems(items) {
    this._options.items = items;
    this._renderChips();
    this._refreshOptionListItems();
    this._applyRootClasses();
  }
  disabled(state) {
    var _a, _b, _c, _d, _e, _f;
    if (state === void 0) return this._isDisabled;
    this._isDisabled = state;
    this._options.isDisabled = state;
    if (state) {
      (_a = this._fieldEl) == null ? void 0 : _a.setAttribute("aria-disabled", "true");
      if (this._isOpen) this.close();
    } else {
      (_b = this._fieldEl) == null ? void 0 : _b.removeAttribute("aria-disabled");
    }
    if (this._inputEl) this._inputEl.disabled = state;
    (_c = this._clearBtn) == null ? void 0 : _c.disabled(state);
    (_d = this._chevronBtn) == null ? void 0 : _d.disabled(state);
    (_e = this._chipList) == null ? void 0 : _e.disabled(state);
    (_f = this._optionList) == null ? void 0 : _f.disabled(state);
    this._applyRootClasses();
  }
  setError(message) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const useTooltipError = this._options.errorDisplay === "tooltip";
    const useInlineAlert = this._options.errorDisplay === "inline";
    if (message === false) {
      this._options.isInvalid = false;
      this._options.errorMsg = null;
      (_a = this._element) == null ? void 0 : _a.classList.remove("has-error", "error-tooltip");
      (_b = this._fieldEl) == null ? void 0 : _b.removeAttribute("aria-invalid");
      (_c = this._fieldEl) == null ? void 0 : _c.removeAttribute("aria-describedby");
      if (this._alertEl) {
        (_d = this._inlineAlert) == null ? void 0 : _d.destroy();
        this._inlineAlert = null;
        this._alertEl.remove();
        this._alertEl = null;
      }
      if (this._errMsgAlert) {
        this._errMsgAlert.message(null);
      }
    } else {
      this._options.isInvalid = true;
      this._options.errorMsg = message;
      (_e = this._element) == null ? void 0 : _e.classList.add("has-error");
      (_f = this._element) == null ? void 0 : _f.classList.toggle("error-tooltip", useTooltipError);
      (_g = this._fieldEl) == null ? void 0 : _g.setAttribute("aria-invalid", "true");
      if (useTooltipError && this._errMsgAlert) {
        this._errMsgAlert.message(message);
      } else if (useInlineAlert) {
        if (this._alertEl) {
          (_h = this._inlineAlert) == null ? void 0 : _h.message(message);
        } else {
          this._inlineAlert = MessageAlert.ArvoMessageAlert.initialize(
            document.createElement("div"),
            { type: "negative", message, id: `${this._id}-err` }
          );
          this._alertEl = this._inlineAlert.el;
          (_i = this._element) == null ? void 0 : _i.appendChild(this._alertEl);
        }
        (_j = this._fieldEl) == null ? void 0 : _j.setAttribute("aria-describedby", `${this._id}-err`);
      }
    }
  }
  setLoading(isLoading) {
    var _a, _b, _c, _d, _e;
    this._isLoading = isLoading;
    this._options.isLoading = isLoading;
    (_a = this._element) == null ? void 0 : _a.classList.toggle("loading", isLoading);
    if (this._inputEl) this._inputEl.readOnly = this._isReadonly || isLoading;
    if (isLoading) {
      (_b = this._fieldEl) == null ? void 0 : _b.setAttribute("aria-busy", "true");
      (_c = this._inputEl) == null ? void 0 : _c.setAttribute("aria-busy", "true");
      if (this._isOpen) this.close();
    } else {
      (_d = this._fieldEl) == null ? void 0 : _d.removeAttribute("aria-busy");
      (_e = this._inputEl) == null ? void 0 : _e.removeAttribute("aria-busy");
    }
  }
  width(cssValue) {
    if (cssValue === void 0) return this._options.width ?? "";
    this._options.width = cssValue || null;
    this._applyWidthStyle();
  }
  focus() {
    var _a;
    (_a = this._inputEl) == null ? void 0 : _a.focus();
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
    (_a = this._optionList) == null ? void 0 : _a.destroy();
    this._optionList = null;
    (_b = this._chipList) == null ? void 0 : _b.destroy();
    this._chipList = null;
    (_c = this._clearBtn) == null ? void 0 : _c.destroy();
    this._clearBtn = null;
    (_d = this._chevronBtn) == null ? void 0 : _d.destroy();
    this._chevronBtn = null;
    (_e = this._inlineAlert) == null ? void 0 : _e.destroy();
    this._inlineAlert = null;
    (_f = this._errMsgAlert) == null ? void 0 : _f.destroy();
    this._errMsgAlert = null;
    this._overflowBtnEl = null;
    (_g = this._fieldEl) == null ? void 0 : _g.removeEventListener("click", this._boundHandleFieldClick);
    (_h = this._fieldEl) == null ? void 0 : _h.removeEventListener("mousedown", this._boundHandleFieldMouseDown);
    (_i = this._fieldEl) == null ? void 0 : _i.removeEventListener("chip-list:dismiss", this._boundChipListDismiss);
    (_j = this._inputEl) == null ? void 0 : _j.removeEventListener("keydown", this._boundHandleInputKeyDown);
    (_k = this._inputEl) == null ? void 0 : _k.removeEventListener("input", this._boundHandleInputInput);
    (_l = this._inputEl) == null ? void 0 : _l.removeEventListener("focus", this._boundHandleInputFocus);
    (_m = this._inputEl) == null ? void 0 : _m.removeEventListener("blur", this._boundHandleInputBlur);
    if (this._element) {
      this._element.textContent = "";
      this._element.className = "";
      this._element.style.removeProperty("--arvo-form-input-width");
    }
    this._isOpen = false;
    this._element = null;
    this._fieldEl = null;
    this._valueEl = null;
    this._chipsEl = null;
    this._inputEl = null;
    this._actionsEl = null;
    this._clearEl = null;
    this._sepEl = null;
    this._icoEl = null;
    this._errIcoEl = null;
    this._borderEl = null;
    this._labelEl = null;
    this._alertEl = null;
  }
};
_ArvoMultiSelect.DEFAULTS = {
  items: [],
  placeholder: "",
  label: "",
  contextHelp: null,
  isDisabled: false,
  isRequired: false,
  isInvalid: false,
  errorMsg: null,
  errorDisplay: "inline",
  isClearable: true,
  isLoading: false,
  isReadOnly: false,
  width: null,
  isFullWidth: false,
  surface: "filled",
  overflowMode: "expandable",
  maxRows: 3,
  expandedMaxRows: 5,
  chipAppearance: "outline",
  maxSelections: null,
  placement: "bottom-start",
  maxHeight: null,
  hasGroupDividers: true,
  filterFn: null,
  closeOnSelect: false,
  chipListProps: null,
  optionListProps: null,
  onChange: null,
  onInputChange: null,
  onRemove: null,
  onClear: null,
  onOpen: null,
  onClose: null,
  onOpenChange: null,
  onExpandedChange: null
};
let ArvoMultiSelect = _ArvoMultiSelect;
exports.ArvoMultiSelect = ArvoMultiSelect;
//# sourceMappingURL=MultiSelect.cjs.map
