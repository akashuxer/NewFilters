import { ArvoFormLabel } from "../FormLabel/FormLabel.js";
import { ArvoCheckbox } from "../Checkbox/Checkbox.js";
import { ArvoMessageAlert } from "../MessageAlert/MessageAlert.js";
let _idCounter = 0;
const _ArvoCheckboxGroup = class _ArvoCheckboxGroup {
  constructor(element, options) {
    this._labelEl = null;
    this._bdyEl = null;
    this._itemsEl = null;
    this._inlineAlert = null;
    this._inlineAlertEl = null;
    this._selectAllInstance = null;
    this._selectAllEl = null;
    this._childInstances = [];
    this._childStateMap = /* @__PURE__ */ new Map();
    this._batchUpdate = false;
    this._labelId = "";
    this._errorId = "";
    this._element = element;
    const size = (options == null ? void 0 : options.size) && _ArvoCheckboxGroup.SIZES.includes(options.size) ? options.size : _ArvoCheckboxGroup.DEFAULTS.size;
    this._options = {
      ..._ArvoCheckboxGroup.DEFAULTS,
      ...options,
      size,
      label: (options == null ? void 0 : options.label) ?? null,
      contextHelp: (options == null ? void 0 : options.contextHelp) ?? null,
      errorMsg: (options == null ? void 0 : options.errorMsg) ?? null,
      name: options == null ? void 0 : options.name,
      items: (options == null ? void 0 : options.items) ?? [],
      onChange: (options == null ? void 0 : options.onChange) ?? null
    };
    this._boundHandleItemChange = this._handleItemChange.bind(this);
    this._render();
    this._bindEvents();
  }
  static initialize(element, options) {
    return new _ArvoCheckboxGroup(element, options);
  }
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    this._childInstances = [];
    this._childStateMap = /* @__PURE__ */ new Map();
    const uid = ++_idCounter;
    this._labelId = `arvo-cb-grp-lbl-${uid}`;
    this._errorId = `arvo-cb-grp-err-${uid}`;
    const {
      label,
      hasSelectAll,
      orientation,
      labelPosition,
      size,
      isDisabled,
      isReadOnly: isReadonly,
      isRequired,
      isInvalid,
      errorMsg,
      isLoading,
      name,
      items
    } = this._options;
    el.classList.add("arvo-cb-grp", `arvo-cb-grp--${size}`);
    if (orientation === "horizontal") el.classList.add("arvo-cb-grp--horizontal");
    if (labelPosition === "start") el.classList.add("arvo-cb-grp--label-start");
    if (isLoading) el.classList.add("loading");
    if (isDisabled) el.classList.add("is-disabled");
    if (isReadonly) el.classList.add("is-readonly");
    if (isInvalid) el.classList.add("has-error");
    el.setAttribute("role", "group");
    if (isRequired) el.setAttribute("aria-required", "true");
    if (isInvalid) el.setAttribute("aria-invalid", "true");
    if (isLoading) el.setAttribute("aria-busy", "true");
    if (label) {
      this._labelEl = ArvoFormLabel.initialize(null, {
        text: label,
        as: "span",
        size,
        isRequired,
        isDisabled,
        isInvalid,
        contextHelp: this._options.contextHelp
      }).el;
      this._labelEl.id = this._labelId;
      this._labelEl.classList.add("arvo-cb-grp__lbl");
      el.setAttribute("aria-labelledby", this._labelId);
      el.appendChild(this._labelEl);
    }
    this._bdyEl = document.createElement("div");
    this._bdyEl.className = "arvo-cb-grp__bdy";
    this._itemsEl = document.createElement("div");
    this._itemsEl.className = "arvo-cb-grp__items";
    if (isLoading) this._itemsEl.setAttribute("data-arvo-loading", "true");
    if (hasSelectAll) {
      this._selectAllEl = document.createElement("div");
      this._itemsEl.appendChild(this._selectAllEl);
      this._selectAllInstance = ArvoCheckbox.initialize(this._selectAllEl, {
        label: "Select All",
        size,
        isDisabled,
        isReadOnly: isReadonly,
        isLoading,
        name,
        onChange: this._handleSelectAllChange.bind(this)
      });
    }
    for (const item of items) {
      const itemEl = document.createElement("div");
      this._itemsEl.appendChild(itemEl);
      const instance = ArvoCheckbox.initialize(itemEl, {
        label: item.label,
        value: item.value,
        isChecked: item.isChecked ?? false,
        isDisabled: item.isDisabled ?? isDisabled,
        isReadOnly: isReadonly,
        isExcluded: item.isExcluded ?? false,
        size,
        name,
        isLoading
      });
      this._childInstances.push(instance);
      this._childStateMap.set(item.value, item.isChecked ?? false);
    }
    this._bdyEl.appendChild(this._itemsEl);
    if (isInvalid && errorMsg) {
      this._inlineAlert = ArvoMessageAlert.initialize(document.createElement("div"), {
        id: this._errorId,
        message: errorMsg,
        type: "negative"
      });
      this._inlineAlertEl = this._inlineAlert.el;
      el.setAttribute("aria-describedby", this._errorId);
      this._bdyEl.appendChild(this._inlineAlertEl);
    }
    el.appendChild(this._bdyEl);
    this._syncSelectAllState();
  }
  _bindEvents() {
    if (!this._itemsEl) return;
    this._itemsEl.addEventListener("checkbox:change", this._boundHandleItemChange);
  }
  _handleItemChange(event) {
    if (this._batchUpdate) return;
    const customEvent = event;
    const { isChecked, value } = customEvent.detail;
    if (this._selectAllEl) {
      if (event.target === this._selectAllEl || this._selectAllEl.contains(event.target)) {
        return;
      }
    }
    if (this._childStateMap.has(value)) {
      this._childStateMap.set(value, isChecked);
    }
    this._syncSelectAllState();
    this._fireChange();
  }
  _handleSelectAllChange({ isChecked }) {
    if (isChecked) {
      this._checkAllChildren();
    } else {
      this._uncheckAllChildren();
    }
    this._syncSelectAllState();
    this._fireChange();
  }
  _checkAllChildren() {
    for (const [value] of this._childStateMap) {
      this._childStateMap.set(value, true);
    }
    for (const inst of this._childInstances) {
      if (!inst.disabled()) {
        inst.toggle(true);
      }
    }
  }
  _uncheckAllChildren() {
    for (const [value] of this._childStateMap) {
      this._childStateMap.set(value, false);
    }
    for (const inst of this._childInstances) {
      if (!inst.disabled()) {
        inst.toggle(false);
      }
    }
  }
  _syncSelectAllState() {
    if (!this._selectAllInstance) return;
    const states = Array.from(this._childStateMap.values());
    if (states.length === 0) {
      this._selectAllInstance.toggle(false);
      this._selectAllInstance.indeterminate(false);
      return;
    }
    const checkedCount = states.filter(Boolean).length;
    const allChecked = checkedCount === states.length;
    const someChecked = checkedCount > 0 && checkedCount < states.length;
    this._selectAllInstance.indeterminate(someChecked);
    if (!someChecked) {
      this._selectAllInstance.toggle(allChecked);
    }
  }
  _fireChange() {
    var _a, _b;
    const vals = this.values();
    const allChecked = this._childStateMap.size > 0 && Array.from(this._childStateMap.values()).every(Boolean);
    const detail = { values: vals, allChecked };
    this._dispatchEvent("cb-grp:change", detail);
    (_b = (_a = this._options).onChange) == null ? void 0 : _b.call(_a, detail);
  }
  _dispatchEvent(eventName, detail) {
    var _a;
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(eventName, { bubbles: true, cancelable: true, detail })
    );
  }
  values(newValues) {
    if (newValues === void 0) {
      return Array.from(this._childStateMap.entries()).filter(([, isChecked]) => isChecked).map(([value]) => value);
    }
    this._batchUpdate = true;
    const valueSet = new Set(newValues);
    for (const inst of this._childInstances) {
      const val = inst.value();
      const shouldCheck = valueSet.has(val);
      this._childStateMap.set(val, shouldCheck);
      inst.toggle(shouldCheck);
      if (inst.indeterminate()) {
        inst.indeterminate(false);
      }
    }
    this._batchUpdate = false;
    this._syncSelectAllState();
    this._fireChange();
  }
  toggleAll(force) {
    if (this._options.isDisabled || this._options.isReadOnly) return;
    if (force === void 0) {
      const allChecked = this._childStateMap.size > 0 && Array.from(this._childStateMap.values()).every(Boolean);
      force = !allChecked;
    }
    this._batchUpdate = true;
    if (force) {
      this._checkAllChildren();
    } else {
      this._uncheckAllChildren();
    }
    this._batchUpdate = false;
    this._syncSelectAllState();
    this._fireChange();
  }
  disabled(state) {
    var _a;
    if (state === void 0) return this._options.isDisabled;
    if (!this._element) return;
    this._options.isDisabled = state;
    this._element.classList.toggle("is-disabled", state);
    if (this._labelEl) this._labelEl.classList.toggle("is-disabled", state);
    (_a = this._selectAllInstance) == null ? void 0 : _a.disabled(state);
    for (const inst of this._childInstances) {
      inst.disabled(state);
    }
  }
  readonly(state) {
    var _a;
    if (state === void 0) return this._options.isReadOnly;
    if (!this._element) return;
    this._options.isReadOnly = state;
    this._element.classList.toggle("is-readonly", state);
    (_a = this._selectAllInstance) == null ? void 0 : _a.readonly(state);
    for (const inst of this._childInstances) {
      inst.readonly(state);
    }
  }
  setError(msgOrFalse) {
    if (!this._element) return;
    if (msgOrFalse !== false) {
      const msg = msgOrFalse || this._options.errorMsg || "Error";
      this._options.isInvalid = true;
      this._options.errorMsg = msg;
      this._element.classList.add("has-error");
      this._element.setAttribute("aria-invalid", "true");
      if (this._inlineAlert) {
        this._inlineAlert.type("negative");
        this._inlineAlert.message(msg);
      } else if (this._bdyEl) {
        this._inlineAlert = ArvoMessageAlert.initialize(document.createElement("div"), {
          id: this._errorId,
          message: msg,
          type: "negative"
        });
        this._inlineAlertEl = this._inlineAlert.el;
        this._element.setAttribute("aria-describedby", this._errorId);
        this._bdyEl.appendChild(this._inlineAlertEl);
      }
    } else {
      this._options.isInvalid = false;
      this._options.errorMsg = null;
      this._element.classList.remove("has-error");
      this._element.removeAttribute("aria-invalid");
      this._element.removeAttribute("aria-describedby");
      if (this._inlineAlert) {
        this._inlineAlert.destroy();
        this._inlineAlert = null;
      }
      if (this._inlineAlertEl) {
        this._inlineAlertEl.remove();
        this._inlineAlertEl = null;
      }
    }
  }
  setLoading(isLoading) {
    var _a;
    if (!this._element) return;
    this._options.isLoading = isLoading;
    this._element.classList.toggle("loading", isLoading);
    if (isLoading) {
      this._element.setAttribute("aria-busy", "true");
    } else {
      this._element.removeAttribute("aria-busy");
    }
    if (this._itemsEl) {
      if (isLoading) {
        this._itemsEl.setAttribute("data-arvo-loading", "true");
      } else {
        this._itemsEl.removeAttribute("data-arvo-loading");
      }
    }
    (_a = this._selectAllInstance) == null ? void 0 : _a.setLoading(isLoading);
    for (const inst of this._childInstances) {
      inst.setLoading(isLoading);
    }
  }
  setLabel(label) {
    var _a;
    if (!this._element) return;
    this._options.label = label;
    if (label) {
      if (this._labelEl) {
        for (const node of Array.from(this._labelEl.childNodes)) {
          if (node.nodeType === Node.TEXT_NODE) node.remove();
        }
        this._labelEl.insertAdjacentText("afterbegin", label);
      } else {
        const { size, isRequired, isDisabled, isInvalid, contextHelp } = this._options;
        this._labelEl = ArvoFormLabel.initialize(null, {
          text: label,
          as: "span",
          size,
          isRequired,
          isDisabled,
          isInvalid,
          contextHelp
        }).el;
        this._labelEl.id = this._labelId;
        this._labelEl.classList.add("arvo-cb-grp__lbl");
        this._element.setAttribute("aria-labelledby", this._labelId);
        this._element.insertBefore(this._labelEl, this._element.firstChild);
      }
    } else {
      (_a = this._labelEl) == null ? void 0 : _a.remove();
      this._labelEl = null;
      this._element.removeAttribute("aria-labelledby");
    }
  }
  destroy() {
    var _a, _b;
    if (this._itemsEl) {
      this._itemsEl.removeEventListener("checkbox:change", this._boundHandleItemChange);
    }
    (_a = this._inlineAlert) == null ? void 0 : _a.destroy();
    this._inlineAlert = null;
    (_b = this._selectAllInstance) == null ? void 0 : _b.destroy();
    this._selectAllInstance = null;
    this._selectAllEl = null;
    for (const inst of this._childInstances) {
      inst.destroy();
    }
    this._childInstances = [];
    this._childStateMap = /* @__PURE__ */ new Map();
    if (this._element) {
      this._element.textContent = "";
      this._element.removeAttribute("role");
      this._element.removeAttribute("aria-labelledby");
      this._element.removeAttribute("aria-required");
      this._element.removeAttribute("aria-invalid");
      this._element.removeAttribute("aria-describedby");
      this._element.removeAttribute("aria-busy");
      this._element.className = "";
    }
    this._element = null;
    this._labelEl = null;
    this._bdyEl = null;
    this._itemsEl = null;
    this._inlineAlertEl = null;
  }
};
_ArvoCheckboxGroup.SIZES = ["sm", "lg"];
_ArvoCheckboxGroup.DEFAULTS = {
  label: null,
  contextHelp: null,
  hasSelectAll: false,
  orientation: "vertical",
  labelPosition: "top",
  size: "lg",
  isDisabled: false,
  isReadOnly: false,
  isRequired: false,
  isInvalid: false,
  errorMsg: null,
  isLoading: false,
  name: void 0,
  items: [],
  onChange: null
};
let ArvoCheckboxGroup = _ArvoCheckboxGroup;
export {
  ArvoCheckboxGroup
};
//# sourceMappingURL=CheckboxGroup.js.map
