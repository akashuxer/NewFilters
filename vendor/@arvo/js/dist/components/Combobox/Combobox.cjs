"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const core = require("@arvo/core");
const FormLabel = require("../FormLabel/FormLabel.cjs");
const IconButton = require("../IconButton/IconButton.cjs");
const MessageAlert = require("../MessageAlert/MessageAlert.cjs");
const OptionList = require("../OptionList/OptionList.cjs");
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
const _ArvoCombobox = class _ArvoCombobox {
  constructor(element, options) {
    this._fieldEl = null;
    this._inputEl = null;
    this._icoEl = null;
    this._prefixEl = null;
    this._prefixSepEl = null;
    this._prefixConnector = null;
    this._actionsEl = null;
    this._clearEl = null;
    this._clearBtn = null;
    this._sepEl = null;
    this._errIcoEl = null;
    this._errIcoConnector = null;
    this._chevronEl = null;
    this._chevronBtn = null;
    this._borderEl = null;
    this._labelEl = null;
    this._alertEl = null;
    this._inlineAlert = null;
    this._errMsgAlert = null;
    this._resizeObs = null;
    this._optionList = null;
    this._isOpen = false;
    this._isDisabled = false;
    this._isLoading = false;
    this._isReadonly = false;
    this._value = null;
    this._inputText = "";
    this._element = element;
    this._id = `arvo-combobox-${++_idCounter}`;
    this._options = {
      ..._ArvoCombobox.DEFAULTS,
      ...options,
      items: options.items ?? [],
      width: options.width ?? null,
      maxHeight: options.maxHeight ?? null,
      errorMsg: options.errorMsg ?? null,
      inputValue: options.inputValue ?? null,
      filterFn: options.filterFn ?? null,
      optionListProps: options.optionListProps ?? null,
      contextHelp: options.contextHelp ?? null,
      icon: options.icon ?? null,
      prefix: options.prefix ?? null,
      prefixTooltip: options.prefixTooltip ?? null,
      onChange: options.onChange ?? null,
      onInputChange: options.onInputChange ?? null,
      onOpen: options.onOpen ?? null,
      onClose: options.onClose ?? null,
      onClear: options.onClear ?? null,
      onOpenChange: options.onOpenChange ?? null
    };
    this._isDisabled = this._options.isDisabled;
    this._isLoading = this._options.isLoading === true;
    this._isReadonly = this._options.isReadOnly;
    this._value = options.value !== void 0 ? options.value : options.defaultValue ?? null;
    if (options.inputValue !== void 0) {
      this._inputText = options.inputValue;
    } else if (this._value != null) {
      const allFlat = flattenItems(this._options.items);
      const found = allFlat.find((item) => item.value === this._value);
      this._inputText = (found == null ? void 0 : found.label) ?? "";
    }
    this._boundHandleInputInput = this._handleInputInput.bind(this);
    this._boundHandleInputKeyDown = this._handleInputKeyDown.bind(this);
    this._boundHandleAffixMouseDown = this._handleAffixMouseDown.bind(this);
    this._boundHandleFieldMouseDown = this._handleFieldMouseDown.bind(this);
    this._buildRoot();
    this._applyRootClasses();
    this._applyWidthStyle();
    this._setupOptionList();
    this._setupResizeObserver();
    const initialOpen = options.isOpen !== void 0 ? options.isOpen : options.defaultOpen ?? false;
    if (initialOpen) this._doOpen(true);
  }
  static initialize(element, options) {
    return new _ArvoCombobox(element, options);
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
      lbl.classList.add("arvo-combobox__lbl");
      el.appendChild(lbl);
      this._labelEl = lbl;
    }
    this._fieldEl = document.createElement("div");
    this._fieldEl.className = "arvo-combobox__field";
    this._fieldEl.addEventListener("mousedown", this._boundHandleFieldMouseDown);
    if (this._options.icon) {
      this._icoEl = document.createElement("i");
      this._icoEl.className = `arvo-combobox__ico o9con o9con-${this._options.icon}`;
      this._icoEl.setAttribute("aria-hidden", "true");
      this._fieldEl.appendChild(this._icoEl);
    }
    const hasPrefix = typeof this._options.prefix === "string" && this._options.prefix.length > 0;
    if (hasPrefix) {
      this._prefixEl = document.createElement("span");
      this._prefixEl.className = "arvo-combobox__prefix";
      this._prefixEl.setAttribute("aria-hidden", "true");
      this._prefixEl.textContent = this._options.prefix;
      this._fieldEl.appendChild(this._prefixEl);
      this._prefixSepEl = document.createElement("span");
      this._prefixSepEl.className = "arvo-combobox__prefix-sep";
      this._prefixSepEl.setAttribute("aria-hidden", "true");
      this._fieldEl.appendChild(this._prefixSepEl);
      if (this._options.prefixTooltip) {
        this._prefixConnector = core.connectTooltip(core.tooltipManager, {
          anchor: this._prefixEl,
          content: this._options.prefixTooltip
        });
      }
    }
    this._inputEl = document.createElement("input");
    this._inputEl.type = "text";
    this._inputEl.id = `${this._id}-input`;
    this._inputEl.className = "arvo-combobox__input";
    this._inputEl.setAttribute("role", "combobox");
    this._inputEl.setAttribute("autocomplete", "off");
    this._inputEl.setAttribute("aria-autocomplete", "list");
    this._inputEl.value = this._inputText;
    if (this._options.placeholder) {
      this._inputEl.placeholder = this._options.placeholder;
    }
    if (this._isDisabled) {
      this._inputEl.disabled = true;
      this._inputEl.setAttribute("aria-disabled", "true");
    }
    if (this._isReadonly) {
      this._inputEl.readOnly = true;
    }
    if (this._options.isRequired) {
      this._inputEl.setAttribute("aria-required", "true");
    }
    if (this._options.isInvalid) {
      this._inputEl.setAttribute("aria-invalid", "true");
    }
    if (this._isLoading) {
      this._inputEl.setAttribute("aria-busy", "true");
    }
    if (this._labelEl) {
      this._inputEl.setAttribute("aria-labelledby", `${this._id}-lbl`);
    } else {
      this._inputEl.setAttribute(
        "aria-label",
        this._options.placeholder || "Combobox"
      );
    }
    this._inputEl.addEventListener("input", this._boundHandleInputInput);
    this._inputEl.addEventListener("keydown", this._boundHandleInputKeyDown);
    this._fieldEl.appendChild(this._inputEl);
    if (this._icoEl) {
      this._icoEl.addEventListener("mousedown", this._boundHandleAffixMouseDown);
    }
    if (this._prefixEl) {
      this._prefixEl.addEventListener("mousedown", this._boundHandleAffixMouseDown);
    }
    this._actionsEl = document.createElement("div");
    this._actionsEl.className = "arvo-combobox__actions";
    if (this._options.isClearable) {
      this._clearEl = document.createElement("button");
      this._clearBtn = IconButton.ArvoIconButton.initialize(this._clearEl, {
        variant: "tertiary",
        size: "xs",
        icon: "close",
        tooltip: "Clear",
        isDisabled: this._isDisabled,
        onClick: (e) => {
          e.stopPropagation();
          this.clear();
        }
      });
      this._clearEl.classList.add("arvo-combobox__clear");
      this._clearEl.setAttribute("tabindex", "-1");
      this._actionsEl.appendChild(this._clearEl);
      this._sepEl = document.createElement("span");
      this._sepEl.className = "arvo-combobox__sep";
      this._sepEl.setAttribute("aria-hidden", "true");
      this._actionsEl.appendChild(this._sepEl);
    }
    if (this._options.errorDisplay === "tooltip") {
      this._errMsgAlert = MessageAlert.ArvoMessageAlert.initialize(document.createElement("div"), {
        type: "negative",
        isInline: true,
        message: this._options.errorMsg ?? null
      });
      this._errIcoEl = this._errMsgAlert.el;
      this._errIcoEl.classList.add("arvo-combobox__err-ico");
      if (this._options.errorMsg) {
        this._errIcoConnector = core.connectTooltip(core.tooltipManager, {
          anchor: this._errIcoEl,
          content: this._options.errorMsg
        });
      }
      this._actionsEl.appendChild(this._errIcoEl);
    }
    this._fieldEl.appendChild(this._actionsEl);
    this._chevronEl = document.createElement("button");
    this._chevronBtn = IconButton.ArvoIconButton.initialize(this._chevronEl, {
      variant: "tertiary",
      size: "sm",
      icon: "angle-down",
      tooltip: "Toggle menu",
      isDisabled: this._isDisabled,
      onClick: (e) => this._handleChevronClick(e)
    });
    this._chevronEl.classList.add("arvo-combobox__chevron");
    this._chevronEl.setAttribute("tabindex", "-1");
    this._fieldEl.appendChild(this._chevronEl);
    this._borderEl = document.createElement("div");
    this._borderEl.className = "arvo-combobox__border";
    this._fieldEl.appendChild(this._borderEl);
    el.appendChild(this._fieldEl);
    if (this._options.isInvalid && this._options.errorMsg && this._options.errorDisplay === "inline") {
      this._alertEl = this._buildInlineAlert(this._options.errorMsg);
      if (this._alertEl) {
        this._inputEl.setAttribute("aria-describedby", `${this._id}-err`);
        el.appendChild(this._alertEl);
      }
    }
  }
  // ---------------------------------------------------------------------------
  // Composed OptionList
  // ---------------------------------------------------------------------------
  _setupOptionList() {
    if (!this._inputEl || !this._fieldEl) return;
    const listOptions = {
      ...this._options.optionListProps ?? void 0,
      items: this._filteredItems(),
      value: this._value,
      placement: this._options.placement,
      maxHeight: this._options.maxHeight ?? void 0,
      hasGroupDividers: this._options.hasGroupDividers,
      isDisabled: this._isDisabled,
      ariaLabel: this._options.label || void 0,
      // The field drives close on select so it can honor onChange returning
      // false; the inner list never auto-closes.
      closeOnSelect: false,
      // The field owns trigger click (chevron toggles, typing opens); the
      // list only wires ARIA + keyboard navigation. The keydown listener
      // attaches to the field (the trigger element); input keystrokes
      // bubble up to it.
      bindTrigger: false,
      // ARIA stays on the inner <input role="combobox"> per the
      // descriptor's ARIA 1.2 combobox prescription. `triggerAriaElement`
      // redirects haspopup / controls / expanded; `activeDescendantElement`
      // does the same for aria-activedescendant.
      triggerAriaElement: this._inputEl,
      activeDescendantElement: this._inputEl,
      onChange: (detail) => this._handleOptionChange(detail),
      onOpenChange: (open) => this._handleListOpenChange(open)
    };
    this._optionList = OptionList.ArvoOptionList.initialize(this._fieldEl, listOptions);
  }
  _filteredItems() {
    if (this._value != null) {
      const allFlat = flattenItems(this._options.items);
      const sel = allFlat.find((item) => item.value === this._value);
      if (sel && sel.label === this._inputText) {
        return this._options.items;
      }
    }
    return applyFilter(this._options.items, this._inputText, this._options.filterFn);
  }
  _refreshOptionListItems() {
    var _a, _b;
    (_a = this._optionList) == null ? void 0 : _a.setItems(this._filteredItems());
    (_b = this._optionList) == null ? void 0 : _b.value(this._value);
  }
  // ---------------------------------------------------------------------------
  // CSS Classes
  // ---------------------------------------------------------------------------
  _applyRootClasses() {
    const el = this._element;
    if (!el) return;
    const hasValue = this._value != null || this._inputText.length > 0;
    const hasPrefix = typeof this._options.prefix === "string" && this._options.prefix.length > 0;
    el.classList.add("arvo-combobox", `arvo-combobox--${this._options.size}`, `arvo-combobox--surface-${this._options.surface}`);
    el.classList.toggle("arvo-combobox--full-width", this._options.isFullWidth);
    el.classList.toggle("arvo-combobox--clearable", this._options.isClearable);
    el.classList.toggle("arvo-combobox--has-prefix", hasPrefix);
    el.classList.toggle("loading", this._isLoading);
    el.classList.toggle("is-disabled", this._isDisabled);
    el.classList.toggle("is-readonly", this._isReadonly);
    el.classList.toggle("has-error", this._options.isInvalid);
    el.classList.toggle(
      "error-tooltip",
      this._options.isInvalid && this._options.errorDisplay === "tooltip"
    );
    el.classList.toggle("open", this._isOpen);
    el.classList.toggle("has-value", hasValue);
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
  // Actions-overlay right padding (ResizeObserver)
  // ---------------------------------------------------------------------------
  _updatePadding() {
    if (!this._actionsEl || !this._fieldEl) return;
    const w = this._actionsEl.offsetWidth;
    const pad = w > 0 ? w + 4 : 0;
    this._fieldEl.style.setProperty("--arvo-combobox-pad-r", `${pad}px`);
  }
  _setupResizeObserver() {
    this._updatePadding();
    if (typeof ResizeObserver === "undefined" || !this._actionsEl) return;
    this._resizeObs = new ResizeObserver(() => this._updatePadding());
    this._resizeObs.observe(this._actionsEl);
  }
  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------
  _handleInputInput() {
    var _a, _b, _c, _d;
    if (this._isDisabled || this._isLoading || this._isReadonly) return;
    const text = ((_a = this._inputEl) == null ? void 0 : _a.value) ?? "";
    this._inputText = text;
    (_c = (_b = this._options).onInputChange) == null ? void 0 : _c.call(_b, text);
    if (this._value != null) {
      const allFlat = flattenItems(this._options.items);
      const sel = allFlat.find((item) => item.value === this._value);
      if (sel && sel.label !== text) this._value = null;
    }
    this._applyRootClasses();
    (_d = this._element) == null ? void 0 : _d.dispatchEvent(
      new CustomEvent("combobox:input", {
        bubbles: true,
        detail: { value: text }
      })
    );
    if (!this._isOpen && text.length > 0) this.open();
    this._refreshOptionListItems();
  }
  _handleInputKeyDown(e) {
    if (this._isDisabled || this._isLoading || this._isReadonly) return;
    if (!this._isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      this.open();
      return;
    }
    if (e.key === "Escape" && !this._isOpen) {
      if (this._inputText.length === 0 && this._value == null) return;
      e.preventDefault();
      this._inputText = "";
      this._value = null;
      if (this._inputEl) this._inputEl.value = "";
      this._applyRootClasses();
      this._refreshOptionListItems();
    }
  }
  _handleChevronClick(e) {
    var _a;
    e.stopPropagation();
    if (this._isDisabled || this._isLoading || this._isReadonly) return;
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
      (_a = this._inputEl) == null ? void 0 : _a.focus({ preventScroll: true });
    }
  }
  _handleAffixMouseDown(event) {
    var _a;
    event.preventDefault();
    (_a = this._inputEl) == null ? void 0 : _a.focus();
  }
  /**
   * Mousedown on the field. Preserves input focus during clicks on
   * non-input affordances (chevron, clear, actions cluster, leading
   * icon, prefix, the field background between them). Without this,
   * the browser moves focus to the click target on mousedown -- the
   * input would blur, the focus-within border styling would drop, and
   * any selection in the input would clear. The actual click handler
   * still runs on the target; we only suppress the focus shift.
   *
   * Required by the trigger-on-field overlay wiring: the chevron sits
   * inside the field (trigger boundary), so its click is correctly
   * treated as "inside" by the hub's outside-click dismissal, but we
   * still want pointer interactions across the field to feel like one
   * continuous interaction surface with the input as the focused
   * element.
   */
  _handleFieldMouseDown(event) {
    if (this._isDisabled || this._isLoading || this._isReadonly) return;
    const target = event.target;
    if (!target) return;
    if (target === this._inputEl) return;
    if (target.tagName === "INPUT") return;
    event.preventDefault();
  }
  // ---------------------------------------------------------------------------
  // Selection (driven by the composed ArvoOptionList)
  // ---------------------------------------------------------------------------
  _handleOptionChange(detail) {
    var _a, _b, _c;
    const allFlat = flattenItems(this._options.items);
    const index = allFlat.findIndex((i) => i.id === detail.option.id);
    const result = (_b = (_a = this._options).onChange) == null ? void 0 : _b.call(_a, detail.option, index);
    this._value = detail.value;
    this._inputText = detail.option.label;
    if (this._inputEl) this._inputEl.value = this._inputText;
    this._applyRootClasses();
    this._refreshOptionListItems();
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(
      new CustomEvent("combobox:change", {
        bubbles: true,
        cancelable: true,
        detail: { item: detail.option, index }
      })
    );
    if (result !== false && this._options.closeOnSelect) {
      this.close();
    }
  }
  // Hub-driven dismissal (outside-click / Escape) reports here.
  _handleListOpenChange(open) {
    var _a, _b, _c, _d;
    if (open) {
      if (!this._isOpen) {
        this._isOpen = true;
        this._applyRootClasses();
        (_b = (_a = this._options).onOpenChange) == null ? void 0 : _b.call(_a, true);
      }
      return;
    }
    if (!this._isOpen) return;
    this._isOpen = false;
    this._applyRootClasses();
    (_d = (_c = this._options).onOpenChange) == null ? void 0 : _d.call(_c, false);
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  open() {
    this._doOpen(false);
  }
  // `silent` skips the onOpen guard, the cancelable combobox:open event, and
  // the onOpenChange callback. Used for initial-open seeded by isOpen /
  // defaultOpen so init mirrors React's non-firing useState(defaultOpen).
  _doOpen(silent) {
    var _a, _b, _c, _d, _e, _f;
    if (this._isOpen || this._isDisabled || this._isLoading || this._isReadonly) {
      return;
    }
    if (!silent && ((_b = (_a = this._options).onOpen) == null ? void 0 : _b.call(_a)) === false) return;
    if (!silent) {
      const event = new CustomEvent("combobox:open", {
        bubbles: true,
        cancelable: true
      });
      if (!((_c = this._element) == null ? void 0 : _c.dispatchEvent(event))) return;
    }
    this._isOpen = true;
    this._applyRootClasses();
    (_d = this._optionList) == null ? void 0 : _d.open();
    if (!silent) (_f = (_e = this._options).onOpenChange) == null ? void 0 : _f.call(_e, true);
  }
  close() {
    var _a;
    if (!this._isOpen) return;
    if (this._doClose()) {
      (_a = this._optionList) == null ? void 0 : _a.close();
    }
  }
  // Runs the cancellable close gates (onClose + cancelable combobox:close) and
  // the shared state / class / onOpenChange side effects. Returns false when
  // vetoed.
  _doClose() {
    var _a, _b, _c, _d, _e;
    if (((_b = (_a = this._options).onClose) == null ? void 0 : _b.call(_a)) === false) return false;
    const event = new CustomEvent("combobox:close", {
      bubbles: true,
      cancelable: true
    });
    if (!((_c = this._element) == null ? void 0 : _c.dispatchEvent(event))) return false;
    this._isOpen = false;
    this._applyRootClasses();
    (_e = (_d = this._options).onOpenChange) == null ? void 0 : _e.call(_d, false);
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
    var _a;
    if (newValue === void 0) return this._value;
    this._value = newValue;
    const allFlat = flattenItems(this._options.items);
    const item = allFlat.find((i) => i.value === newValue);
    this._inputText = (item == null ? void 0 : item.label) ?? "";
    if (this._inputEl) this._inputEl.value = this._inputText;
    this._applyRootClasses();
    this._refreshOptionListItems();
    if (item) {
      const idx = allFlat.indexOf(item);
      (_a = this._element) == null ? void 0 : _a.dispatchEvent(
        new CustomEvent("combobox:change", {
          bubbles: true,
          cancelable: true,
          detail: { item, index: idx }
        })
      );
    }
  }
  inputValue(text) {
    if (text === void 0) return this._inputText;
    this._inputText = text;
    if (this._inputEl) this._inputEl.value = text;
    this._applyRootClasses();
    this._refreshOptionListItems();
  }
  icon(name) {
    if (name === void 0) return this._options.icon;
    const next = name && name.length > 0 ? name : null;
    this._options.icon = next;
    if (next) {
      if (this._icoEl) {
        this._icoEl.className = `arvo-combobox__ico o9con o9con-${next}`;
      } else if (this._fieldEl) {
        this._icoEl = document.createElement("i");
        this._icoEl.className = `arvo-combobox__ico o9con o9con-${next}`;
        this._icoEl.setAttribute("aria-hidden", "true");
        this._icoEl.addEventListener("mousedown", this._boundHandleAffixMouseDown);
        this._fieldEl.insertBefore(this._icoEl, this._fieldEl.firstChild);
      }
    } else if (this._icoEl) {
      this._icoEl.removeEventListener("mousedown", this._boundHandleAffixMouseDown);
      this._icoEl.remove();
      this._icoEl = null;
    }
  }
  prefix(value) {
    var _a, _b;
    if (value === void 0) return this._options.prefix;
    const next = value && value.length > 0 ? value : null;
    this._options.prefix = next;
    if (next) {
      if (this._prefixEl) {
        this._prefixEl.textContent = next;
      } else if (this._fieldEl && this._inputEl) {
        const anchor = this._icoEl ? this._icoEl.nextSibling : this._fieldEl.firstChild;
        this._prefixEl = document.createElement("span");
        this._prefixEl.className = "arvo-combobox__prefix";
        this._prefixEl.setAttribute("aria-hidden", "true");
        this._prefixEl.textContent = next;
        this._prefixEl.addEventListener("mousedown", this._boundHandleAffixMouseDown);
        this._fieldEl.insertBefore(this._prefixEl, anchor);
        this._prefixSepEl = document.createElement("span");
        this._prefixSepEl.className = "arvo-combobox__prefix-sep";
        this._prefixSepEl.setAttribute("aria-hidden", "true");
        this._fieldEl.insertBefore(this._prefixSepEl, anchor);
      }
      if (this._options.prefixTooltip && !this._prefixConnector && this._prefixEl) {
        this._prefixConnector = core.connectTooltip(core.tooltipManager, {
          anchor: this._prefixEl,
          content: this._options.prefixTooltip
        });
      }
    } else {
      (_a = this._prefixConnector) == null ? void 0 : _a.destroy();
      this._prefixConnector = null;
      if (this._prefixEl) {
        this._prefixEl.removeEventListener("mousedown", this._boundHandleAffixMouseDown);
        this._prefixEl.remove();
        this._prefixEl = null;
      }
      (_b = this._prefixSepEl) == null ? void 0 : _b.remove();
      this._prefixSepEl = null;
    }
    this._applyRootClasses();
  }
  clear() {
    var _a, _b, _c, _d;
    const previousValue = this._value;
    if (previousValue == null && this._inputText === "") return;
    this._value = null;
    this._inputText = "";
    if (this._inputEl) this._inputEl.value = "";
    this._applyRootClasses();
    this._refreshOptionListItems();
    (_b = (_a = this._options).onClear) == null ? void 0 : _b.call(_a, { previousValue });
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(
      new CustomEvent("combobox:clear", {
        bubbles: true,
        cancelable: false,
        detail: { previousValue }
      })
    );
    (_d = this._inputEl) == null ? void 0 : _d.focus({ preventScroll: true });
  }
  updateItems(items) {
    this._options.items = items;
    this._refreshOptionListItems();
    if (this._value != null && !this._isOpen) {
      const allFlat = flattenItems(items);
      const found = allFlat.find((item) => item.value === this._value);
      if (found) {
        this._inputText = found.label;
        if (this._inputEl) this._inputEl.value = this._inputText;
      }
    }
  }
  disabled(state) {
    var _a, _b, _c;
    if (state === void 0) return this._isDisabled;
    this._isDisabled = state;
    this._options.isDisabled = state;
    if (this._inputEl) {
      this._inputEl.disabled = state;
      if (state) {
        this._inputEl.setAttribute("aria-disabled", "true");
        if (this._isOpen) this.close();
      } else {
        this._inputEl.removeAttribute("aria-disabled");
      }
    }
    (_a = this._clearBtn) == null ? void 0 : _a.disabled(state);
    (_b = this._chevronBtn) == null ? void 0 : _b.disabled(state);
    (_c = this._optionList) == null ? void 0 : _c.disabled(state);
    this._applyRootClasses();
  }
  setError(message) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
    const useTooltipError = this._options.errorDisplay === "tooltip";
    const useInlineAlert = this._options.errorDisplay === "inline";
    if (message === false) {
      this._options.isInvalid = false;
      this._options.errorMsg = null;
      (_a = this._element) == null ? void 0 : _a.classList.remove("has-error", "error-tooltip");
      (_b = this._inputEl) == null ? void 0 : _b.removeAttribute("aria-invalid");
      (_c = this._inputEl) == null ? void 0 : _c.removeAttribute("aria-describedby");
      if (this._alertEl) {
        (_d = this._inlineAlert) == null ? void 0 : _d.destroy();
        this._inlineAlert = null;
        this._alertEl.remove();
        this._alertEl = null;
      }
      if (this._errIcoEl) {
        (_e = this._errMsgAlert) == null ? void 0 : _e.message(null);
        (_f = this._errIcoConnector) == null ? void 0 : _f.destroy();
        this._errIcoConnector = null;
      }
    } else {
      this._options.isInvalid = true;
      this._options.errorMsg = message;
      (_g = this._element) == null ? void 0 : _g.classList.add("has-error");
      (_h = this._element) == null ? void 0 : _h.classList.toggle("error-tooltip", useTooltipError);
      (_i = this._inputEl) == null ? void 0 : _i.setAttribute("aria-invalid", "true");
      if (useTooltipError) {
        if (this._errIcoEl) {
          (_j = this._errMsgAlert) == null ? void 0 : _j.message(message);
          if (this._errIcoConnector) {
            this._errIcoConnector.update({ content: message });
          } else {
            this._errIcoConnector = core.connectTooltip(core.tooltipManager, {
              anchor: this._errIcoEl,
              content: message
            });
          }
        }
      } else if (useInlineAlert) {
        if (this._alertEl) {
          (_k = this._inlineAlert) == null ? void 0 : _k.message(message);
        } else {
          this._alertEl = this._buildInlineAlert(message);
          if (this._alertEl) {
            (_l = this._element) == null ? void 0 : _l.appendChild(this._alertEl);
          }
        }
        (_m = this._inputEl) == null ? void 0 : _m.setAttribute(
          "aria-describedby",
          `${this._id}-err`
        );
      }
    }
  }
  _buildInlineAlert(message) {
    this._inlineAlert = MessageAlert.ArvoMessageAlert.initialize(document.createElement("div"), {
      type: "negative",
      message,
      id: `${this._id}-err`
    });
    this._alertEl = this._inlineAlert.el;
    return this._alertEl;
  }
  setLoading(isLoading) {
    var _a, _b, _c;
    this._isLoading = isLoading;
    this._options.isLoading = isLoading;
    (_a = this._element) == null ? void 0 : _a.classList.toggle("loading", isLoading);
    if (isLoading) {
      (_b = this._inputEl) == null ? void 0 : _b.setAttribute("aria-busy", "true");
      if (this._isOpen) this.close();
    } else {
      (_c = this._inputEl) == null ? void 0 : _c.removeAttribute("aria-busy");
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    (_a = this._optionList) == null ? void 0 : _a.destroy();
    this._optionList = null;
    (_b = this._inputEl) == null ? void 0 : _b.removeEventListener("input", this._boundHandleInputInput);
    (_c = this._inputEl) == null ? void 0 : _c.removeEventListener("keydown", this._boundHandleInputKeyDown);
    if (this._fieldEl) {
      this._fieldEl.removeEventListener("mousedown", this._boundHandleFieldMouseDown);
    }
    if (this._icoEl) {
      this._icoEl.removeEventListener("mousedown", this._boundHandleAffixMouseDown);
    }
    if (this._prefixEl) {
      this._prefixEl.removeEventListener("mousedown", this._boundHandleAffixMouseDown);
    }
    (_d = this._prefixConnector) == null ? void 0 : _d.destroy();
    this._prefixConnector = null;
    (_e = this._inlineAlert) == null ? void 0 : _e.destroy();
    this._inlineAlert = null;
    (_f = this._errMsgAlert) == null ? void 0 : _f.destroy();
    this._errMsgAlert = null;
    (_g = this._errIcoConnector) == null ? void 0 : _g.destroy();
    this._errIcoConnector = null;
    (_h = this._clearBtn) == null ? void 0 : _h.destroy();
    this._clearBtn = null;
    (_i = this._chevronBtn) == null ? void 0 : _i.destroy();
    this._chevronBtn = null;
    (_j = this._resizeObs) == null ? void 0 : _j.disconnect();
    this._resizeObs = null;
    if (this._element) {
      this._element.textContent = "";
      this._element.className = "";
      this._element.style.removeProperty("--arvo-form-input-width");
    }
    this._isOpen = false;
    this._element = null;
    this._fieldEl = null;
    this._inputEl = null;
    this._icoEl = null;
    this._prefixEl = null;
    this._prefixSepEl = null;
    this._actionsEl = null;
    this._clearEl = null;
    this._sepEl = null;
    this._errIcoEl = null;
    this._chevronEl = null;
    this._borderEl = null;
    this._labelEl = null;
    this._alertEl = null;
  }
};
_ArvoCombobox.DEFAULTS = {
  items: [],
  placeholder: "",
  icon: null,
  prefix: null,
  prefixTooltip: null,
  label: "",
  contextHelp: null,
  isDisabled: false,
  isRequired: false,
  isInvalid: false,
  errorMsg: null,
  errorDisplay: "inline",
  size: "lg",
  surface: "filled",
  isClearable: true,
  isLoading: false,
  isReadOnly: false,
  isFullWidth: false,
  width: null,
  placement: "bottom-start",
  maxHeight: null,
  hasGroupDividers: true,
  filterFn: null,
  closeOnSelect: true,
  inputValue: null,
  optionListProps: null,
  onChange: null,
  onInputChange: null,
  onOpen: null,
  onClose: null,
  onClear: null,
  onOpenChange: null
};
let ArvoCombobox = _ArvoCombobox;
exports.ArvoCombobox = ArvoCombobox;
//# sourceMappingURL=Combobox.cjs.map
