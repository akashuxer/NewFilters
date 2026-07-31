import { connectTooltip, tooltipManager } from "@arvo/core";
import { ArvoFormLabel } from "../FormLabel/FormLabel.js";
import { ArvoMessageAlert } from "../MessageAlert/MessageAlert.js";
import { ArvoOptionList } from "../OptionList/OptionList.js";
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
const _ArvoSelect = class _ArvoSelect {
  constructor(element, options) {
    this._fieldEl = null;
    this._displayEl = null;
    this._icoEl = null;
    this._errIcoEl = null;
    this._errIcoConnector = null;
    this._chevronEl = null;
    this._borderEl = null;
    this._hiddenInputEl = null;
    this._labelEl = null;
    this._alertEl = null;
    this._inlineAlert = null;
    this._errMsgAlert = null;
    this._optionList = null;
    this._isOpen = false;
    this._isDisabled = false;
    this._isLoading = false;
    this._isReadonly = false;
    this._isSearchable = false;
    this._value = null;
    this._element = element;
    this._id = `arvo-sel-${++_idCounter}`;
    this._options = {
      ..._ArvoSelect.DEFAULTS,
      ...options,
      items: options.items ?? [],
      width: options.width ?? null,
      maxHeight: options.maxHeight ?? null,
      errorMsg: options.errorMsg ?? null,
      contextHelp: options.contextHelp ?? null,
      optionListProps: options.optionListProps ?? null,
      icon: options.icon ?? null,
      onChange: options.onChange ?? null,
      onOpen: options.onOpen ?? null,
      onClose: options.onClose ?? null,
      onOpenChange: options.onOpenChange ?? null
    };
    this._isDisabled = this._options.isDisabled;
    this._isLoading = this._options.isLoading === true;
    this._isReadonly = this._options.isReadOnly;
    this._isSearchable = !!this._options.search;
    this._value = options.value !== void 0 ? options.value : options.defaultValue ?? null;
    this._boundHandleFieldClick = this._handleFieldClick.bind(this);
    this._boundHandleFieldKeyDown = this._handleFieldKeyDown.bind(this);
    this._buildRoot();
    this._applyRootClasses();
    this._applyWidthStyle();
    this._updateValueDisplay();
    this._setupOptionList();
    const initialOpen = options.isOpen !== void 0 ? options.isOpen : options.defaultOpen ?? false;
    if (initialOpen) this._doOpen(true);
  }
  static initialize(element, options) {
    return new _ArvoSelect(element, options);
  }
  // ---------------------------------------------------------------------------
  // Root DOM Build
  // ---------------------------------------------------------------------------
  _buildRoot() {
    const el = this._element;
    if (this._options.label) {
      const lbl = ArvoFormLabel.initialize(null, {
        text: this._options.label,
        for: `${this._id}-field`,
        isRequired: this._options.isRequired,
        contextHelp: this._options.contextHelp
      }).el;
      lbl.id = `${this._id}-lbl`;
      lbl.classList.add("arvo-sel__lbl");
      el.appendChild(lbl);
      this._labelEl = lbl;
    }
    this._fieldEl = document.createElement("div");
    this._fieldEl.id = `${this._id}-field`;
    this._fieldEl.className = "arvo-sel__field";
    this._fieldEl.setAttribute("role", "combobox");
    this._fieldEl.setAttribute("tabindex", this._isDisabled ? "-1" : "0");
    if (this._options.isRequired) {
      this._fieldEl.setAttribute("aria-required", "true");
    }
    if (this._options.isInvalid) {
      this._fieldEl.setAttribute("aria-invalid", "true");
    }
    if (this._isDisabled) {
      this._fieldEl.setAttribute("aria-disabled", "true");
    }
    if (this._isLoading) {
      this._fieldEl.setAttribute("aria-busy", "true");
    }
    if (this._labelEl) {
      this._fieldEl.setAttribute("aria-labelledby", `${this._id}-lbl`);
    } else {
      this._fieldEl.setAttribute(
        "aria-label",
        this._options.placeholder || "Select"
      );
    }
    this._fieldEl.addEventListener("click", this._boundHandleFieldClick);
    this._fieldEl.addEventListener("keydown", this._boundHandleFieldKeyDown);
    if (this._options.icon) {
      this._icoEl = document.createElement("i");
      this._icoEl.className = `arvo-sel__ico o9con o9con-${this._options.icon}`;
      this._icoEl.setAttribute("aria-hidden", "true");
      this._fieldEl.appendChild(this._icoEl);
    }
    this._displayEl = document.createElement("span");
    this._displayEl.className = "arvo-sel__input";
    this._fieldEl.appendChild(this._displayEl);
    if (this._options.errorDisplay === "tooltip") {
      this._errMsgAlert = ArvoMessageAlert.initialize(document.createElement("div"), {
        type: "negative",
        isInline: true,
        message: this._options.errorMsg ?? null
      });
      this._errIcoEl = this._errMsgAlert.el;
      this._errIcoEl.classList.add("arvo-sel__err-ico");
      if (this._options.errorMsg) {
        this._errIcoConnector = connectTooltip(tooltipManager, {
          anchor: this._errIcoEl,
          content: this._options.errorMsg
        });
      }
      this._fieldEl.appendChild(this._errIcoEl);
    }
    this._chevronEl = document.createElement("span");
    this._chevronEl.className = "arvo-sel__chevron o9con o9con-angle-down";
    this._chevronEl.setAttribute("aria-hidden", "true");
    this._fieldEl.appendChild(this._chevronEl);
    this._borderEl = document.createElement("div");
    this._borderEl.className = "arvo-sel__border";
    this._fieldEl.appendChild(this._borderEl);
    el.appendChild(this._fieldEl);
    this._hiddenInputEl = document.createElement("input");
    this._hiddenInputEl.type = "hidden";
    this._hiddenInputEl.name = el.getAttribute("data-name") ?? "";
    el.appendChild(this._hiddenInputEl);
    if (this._options.isInvalid && this._options.errorMsg && this._options.errorDisplay === "inline") {
      this._alertEl = this._buildInlineAlert(this._options.errorMsg);
      if (this._alertEl) {
        this._fieldEl.setAttribute("aria-describedby", `${this._id}-err`);
        el.appendChild(this._alertEl);
      }
    }
  }
  // ---------------------------------------------------------------------------
  // Composed OptionList
  // ---------------------------------------------------------------------------
  _setupOptionList() {
    if (!this._fieldEl) return;
    const listOptions = {
      ...this._options.optionListProps ?? void 0,
      items: this._options.items,
      value: this._value,
      search: this._options.search,
      placement: this._options.placement,
      maxHeight: this._options.maxHeight ?? void 0,
      hasGroupDividers: this._options.hasGroupDividers,
      isDisabled: this._isDisabled,
      ariaLabel: this._options.label || void 0,
      // The field drives close-on-select so it can honor onChange returning
      // false; the inner list never auto-closes.
      closeOnSelect: false,
      // The field owns trigger click (toggle); the list only wires ARIA +
      // keyboard navigation onto it.
      bindTrigger: false,
      onChange: (detail) => this._handleOptionChange(detail),
      onOpenChange: (open) => this._handleListOpenChange(open)
    };
    this._optionList = ArvoOptionList.initialize(this._fieldEl, listOptions);
  }
  // ---------------------------------------------------------------------------
  // CSS Classes
  // ---------------------------------------------------------------------------
  _applyRootClasses() {
    const el = this._element;
    if (!el) return;
    el.classList.add("arvo-sel", `arvo-sel--${this._options.size}`, `arvo-sel--surface-${this._options.surface}`);
    el.classList.toggle("arvo-sel--full-width", this._options.isFullWidth);
    el.classList.toggle("arvo-sel--filterable", this._isSearchable);
    el.classList.toggle("loading", this._isLoading);
    el.classList.toggle("is-disabled", this._isDisabled);
    el.classList.toggle("is-readonly", this._isReadonly);
    el.classList.toggle("has-error", this._options.isInvalid);
    el.classList.toggle("error-tooltip", this._options.isInvalid && this._options.errorDisplay === "tooltip");
    el.classList.toggle("open", this._isOpen);
    el.classList.toggle("has-value", this._value != null);
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
  // Value Display
  // ---------------------------------------------------------------------------
  _updateValueDisplay() {
    var _a, _b, _c;
    if (!this._displayEl) return;
    const selectedItem = this._getAllFlatItems().find((item) => item.value === this._value);
    if (selectedItem) {
      this._displayEl.className = "arvo-sel__input";
      this._displayEl.textContent = selectedItem.label;
      (_a = this._element) == null ? void 0 : _a.classList.add("has-value");
    } else if (this._options.placeholder) {
      this._displayEl.className = "arvo-sel__placeholder";
      this._displayEl.textContent = this._options.placeholder;
      (_b = this._element) == null ? void 0 : _b.classList.remove("has-value");
    } else {
      this._displayEl.className = "arvo-sel__input";
      this._displayEl.textContent = "";
      (_c = this._element) == null ? void 0 : _c.classList.remove("has-value");
    }
    if (this._hiddenInputEl) {
      this._hiddenInputEl.value = this._value != null ? String(this._value) : "";
    }
  }
  _getAllFlatItems() {
    return flattenItems(this._options.items);
  }
  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------
  _handleFieldClick() {
    if (this._isDisabled || this._isLoading || this._isReadonly) return;
    this.toggle();
  }
  _handleFieldKeyDown(e) {
    var _a, _b, _c, _d;
    if (this._isDisabled || this._isLoading) return;
    if (this._isOpen) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.open();
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const allFlat = this._getAllFlatItems();
      const char = e.key.toLowerCase();
      const currentIdx = this._value != null ? allFlat.findIndex((item) => item.value === this._value) : -1;
      for (let i = 1; i <= allFlat.length; i++) {
        const idx = (currentIdx + i) % allFlat.length;
        const item = allFlat[idx];
        if (item && !item.isDisabled && item.label.toLowerCase().startsWith(char)) {
          this._value = item.value;
          (_a = this._optionList) == null ? void 0 : _a.value(item.value);
          this._updateValueDisplay();
          this._applyRootClasses();
          (_c = (_b = this._options).onChange) == null ? void 0 : _c.call(_b, item, idx);
          (_d = this._element) == null ? void 0 : _d.dispatchEvent(
            new CustomEvent("sel:change", {
              bubbles: true,
              cancelable: true,
              detail: { item, index: idx }
            })
          );
          break;
        }
      }
    }
  }
  // ---------------------------------------------------------------------------
  // Selection (driven by the composed ArvoOptionList)
  // ---------------------------------------------------------------------------
  _handleOptionChange(detail) {
    var _a, _b, _c;
    this._value = detail.value;
    this._updateValueDisplay();
    this._applyRootClasses();
    const allFlat = this._getAllFlatItems();
    const index = allFlat.findIndex((i) => i.id === detail.option.id);
    const result = (_b = (_a = this._options).onChange) == null ? void 0 : _b.call(_a, detail.option, index);
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(
      new CustomEvent("sel:change", {
        bubbles: true,
        cancelable: true,
        detail: { item: detail.option, index }
      })
    );
    if (result !== false && this._options.closeOnSelect) {
      this.close();
    }
  }
  // OptionList reports hub-driven dismissal (outside click / Escape) here.
  // Picker-silent contract (architecture/20-OVERLAY-MIGRATION-NOTES.md):
  // engine-driven dismissal is unconditional -- no `sel:close` event, no
  // `onClose` veto. Only programmatic `close()` / field-driven toggle paths
  // route through `_doClose()` and honor those signals. Combobox is the
  // reference implementation.
  _handleListOpenChange(open) {
    var _a, _b, _c, _d, _e, _f;
    if (open) {
      if (!this._isOpen) {
        this._isOpen = true;
        (_a = this._element) == null ? void 0 : _a.classList.add("open");
        (_c = (_b = this._options).onOpenChange) == null ? void 0 : _c.call(_b, true);
      }
      return;
    }
    if (!this._isOpen) return;
    this._isOpen = false;
    (_d = this._element) == null ? void 0 : _d.classList.remove("open");
    (_f = (_e = this._options).onOpenChange) == null ? void 0 : _f.call(_e, false);
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  open() {
    this._doOpen(false);
  }
  // `silent` skips the onOpen guard, the cancelable sel:open event, and the
  // onOpenChange callback. Used for the initial open seeded by isOpen /
  // defaultOpen so init mirrors React's non-firing useState(defaultOpen).
  _doOpen(silent) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (this._isOpen || this._isDisabled || this._isLoading || this._isReadonly) return;
    if (!silent && ((_b = (_a = this._options).onOpen) == null ? void 0 : _b.call(_a)) === false) return;
    if (!silent) {
      const event = new CustomEvent("sel:open", { bubbles: true, cancelable: true });
      if (!((_c = this._element) == null ? void 0 : _c.dispatchEvent(event))) return;
    }
    this._isOpen = true;
    (_d = this._element) == null ? void 0 : _d.classList.add("open");
    (_e = this._optionList) == null ? void 0 : _e.open();
    if (!silent) (_g = (_f = this._options).onOpenChange) == null ? void 0 : _g.call(_f, true);
  }
  close() {
    var _a;
    if (!this._isOpen) return;
    if (this._doClose()) {
      (_a = this._optionList) == null ? void 0 : _a.close();
    }
  }
  // Runs the cancellable close gates (onClose + cancelable sel:close) and the
  // shared state/class/onOpenChange side effects. Returns false when vetoed.
  _doClose() {
    var _a, _b, _c, _d, _e, _f;
    if (((_b = (_a = this._options).onClose) == null ? void 0 : _b.call(_a)) === false) return false;
    const event = new CustomEvent("sel:close", { bubbles: true, cancelable: true });
    if (!((_c = this._element) == null ? void 0 : _c.dispatchEvent(event))) return false;
    this._isOpen = false;
    (_d = this._element) == null ? void 0 : _d.classList.remove("open");
    (_f = (_e = this._options).onOpenChange) == null ? void 0 : _f.call(_e, false);
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
    var _a, _b, _c;
    if (newValue === void 0) return this._value;
    this._value = newValue;
    (_a = this._optionList) == null ? void 0 : _a.value(newValue);
    this._updateValueDisplay();
    this._applyRootClasses();
    if (newValue == null) {
      (_b = this._element) == null ? void 0 : _b.dispatchEvent(
        new CustomEvent("sel:change", {
          bubbles: true,
          cancelable: true,
          detail: { item: null, index: -1 }
        })
      );
      return;
    }
    const allFlat = this._getAllFlatItems();
    const idx = allFlat.findIndex((item2) => item2.value === newValue);
    const item = idx >= 0 ? allFlat[idx] : null;
    if (item) {
      (_c = this._element) == null ? void 0 : _c.dispatchEvent(
        new CustomEvent("sel:change", {
          bubbles: true,
          cancelable: true,
          detail: { item, index: idx }
        })
      );
    }
  }
  updateItems(items) {
    var _a;
    this._options.items = items;
    (_a = this._optionList) == null ? void 0 : _a.setItems(items);
    this._updateValueDisplay();
  }
  disabled(state) {
    var _a, _b, _c, _d, _e;
    if (state === void 0) return this._isDisabled;
    this._isDisabled = state;
    this._options.isDisabled = state;
    if (state) {
      (_a = this._fieldEl) == null ? void 0 : _a.setAttribute("tabindex", "-1");
      (_b = this._fieldEl) == null ? void 0 : _b.setAttribute("aria-disabled", "true");
      if (this._isOpen) this.close();
    } else {
      (_c = this._fieldEl) == null ? void 0 : _c.setAttribute("tabindex", "0");
      (_d = this._fieldEl) == null ? void 0 : _d.removeAttribute("aria-disabled");
    }
    (_e = this._optionList) == null ? void 0 : _e.disabled(state);
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
      (_b = this._fieldEl) == null ? void 0 : _b.removeAttribute("aria-invalid");
      (_c = this._fieldEl) == null ? void 0 : _c.removeAttribute("aria-describedby");
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
      (_i = this._fieldEl) == null ? void 0 : _i.setAttribute("aria-invalid", "true");
      if (useTooltipError) {
        if (this._errIcoEl) {
          (_j = this._errMsgAlert) == null ? void 0 : _j.message(message);
          if (this._errIcoConnector) {
            this._errIcoConnector.update({ content: message });
          } else {
            this._errIcoConnector = connectTooltip(tooltipManager, {
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
        (_m = this._fieldEl) == null ? void 0 : _m.setAttribute("aria-describedby", `${this._id}-err`);
      }
    }
  }
  _buildInlineAlert(message) {
    this._inlineAlert = ArvoMessageAlert.initialize(document.createElement("div"), {
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
      (_b = this._fieldEl) == null ? void 0 : _b.setAttribute("aria-busy", "true");
      if (this._isOpen) this.close();
    } else {
      (_c = this._fieldEl) == null ? void 0 : _c.removeAttribute("aria-busy");
    }
  }
  width(cssValue) {
    if (cssValue === void 0) {
      return this._options.width ?? "";
    }
    this._options.width = cssValue || null;
    this._applyWidthStyle();
  }
  icon(name) {
    if (name === void 0) return this._options.icon;
    const next = name && name.length > 0 ? name : null;
    this._options.icon = next;
    if (next) {
      if (this._icoEl) {
        this._icoEl.className = `arvo-sel__ico o9con o9con-${next}`;
      } else if (this._fieldEl) {
        this._icoEl = document.createElement("i");
        this._icoEl.className = `arvo-sel__ico o9con o9con-${next}`;
        this._icoEl.setAttribute("aria-hidden", "true");
        this._fieldEl.insertBefore(this._icoEl, this._fieldEl.firstChild);
      }
    } else if (this._icoEl) {
      this._icoEl.remove();
      this._icoEl = null;
    }
  }
  focus() {
    var _a;
    (_a = this._fieldEl) == null ? void 0 : _a.focus();
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f;
    (_a = this._optionList) == null ? void 0 : _a.destroy();
    this._optionList = null;
    (_b = this._fieldEl) == null ? void 0 : _b.removeEventListener("click", this._boundHandleFieldClick);
    (_c = this._fieldEl) == null ? void 0 : _c.removeEventListener("keydown", this._boundHandleFieldKeyDown);
    (_d = this._inlineAlert) == null ? void 0 : _d.destroy();
    this._inlineAlert = null;
    (_e = this._errMsgAlert) == null ? void 0 : _e.destroy();
    this._errMsgAlert = null;
    (_f = this._errIcoConnector) == null ? void 0 : _f.destroy();
    this._errIcoConnector = null;
    if (this._element) {
      this._element.textContent = "";
      this._element.className = "";
      this._element.style.removeProperty("--arvo-form-input-width");
    }
    this._isOpen = false;
    this._element = null;
    this._fieldEl = null;
    this._displayEl = null;
    this._icoEl = null;
    this._errIcoEl = null;
    this._chevronEl = null;
    this._borderEl = null;
    this._hiddenInputEl = null;
    this._labelEl = null;
    this._alertEl = null;
  }
};
_ArvoSelect.DEFAULTS = {
  items: [],
  value: void 0,
  placeholder: "",
  icon: null,
  label: "",
  contextHelp: null,
  isDisabled: false,
  isRequired: false,
  isInvalid: false,
  errorMsg: null,
  errorDisplay: "inline",
  size: "lg",
  surface: "filled",
  search: void 0,
  isLoading: false,
  isReadOnly: false,
  width: null,
  isFullWidth: false,
  placement: "bottom-start",
  maxHeight: null,
  hasGroupDividers: true,
  closeOnSelect: true,
  optionListProps: null,
  onChange: null,
  onOpen: null,
  onClose: null,
  onOpenChange: null
};
let ArvoSelect = _ArvoSelect;
export {
  ArvoSelect
};
//# sourceMappingURL=Select.js.map
