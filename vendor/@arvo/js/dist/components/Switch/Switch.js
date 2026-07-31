import { ArvoFormLabel } from "../FormLabel/FormLabel.js";
let _idCounter = 0;
const _ArvoSwitch = class _ArvoSwitch {
  constructor(element, options) {
    this._inputEl = null;
    this._fieldEl = null;
    this._trackEl = null;
    this._labelEl = null;
    this._labelId = "";
    this._element = element;
    const size = (options == null ? void 0 : options.size) && _ArvoSwitch.SIZES.includes(options.size) ? options.size : _ArvoSwitch.DEFAULTS.size;
    this._options = {
      ..._ArvoSwitch.DEFAULTS,
      ...options,
      size,
      label: (options == null ? void 0 : options.label) ?? null,
      contextHelp: (options == null ? void 0 : options.contextHelp) ?? null,
      name: options == null ? void 0 : options.name,
      onChange: (options == null ? void 0 : options.onChange) ?? null,
      onFocus: (options == null ? void 0 : options.onFocus) ?? null,
      onBlur: (options == null ? void 0 : options.onBlur) ?? null
    };
    this._boundHandleChange = this._handleChange.bind(this);
    this._boundHandleKeyDown = this._handleKeyDown.bind(this);
    this._boundHandleFocus = this._handleFocus.bind(this);
    this._boundHandleBlur = this._handleBlur.bind(this);
    this._render();
    this._bindEvents();
  }
  static initialize(element, options) {
    return new _ArvoSwitch(element, options);
  }
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    const uid = ++_idCounter;
    const inputId = `arvo-sw-${uid}`;
    this._labelId = `arvo-sw-lbl-${uid}`;
    const {
      label,
      isChecked,
      isDisabled,
      isReadOnly: isReadonly,
      isRequired,
      value,
      name,
      labelPosition,
      size,
      isLoading
    } = this._options;
    el.classList.add("arvo-sw");
    el.classList.add(`arvo-sw--${size}`);
    if (labelPosition === "start") el.classList.add("arvo-sw--label-start");
    if (isLoading) el.classList.add("loading");
    if (isDisabled) el.classList.add("is-disabled");
    if (isReadonly) el.classList.add("is-readonly");
    if (isLoading) el.setAttribute("aria-busy", "true");
    this._fieldEl = document.createElement("label");
    this._fieldEl.className = "arvo-sw__field";
    this._inputEl = document.createElement("input");
    this._inputEl.className = "arvo-sw__input";
    this._inputEl.type = "checkbox";
    this._inputEl.setAttribute("role", "switch");
    this._inputEl.id = inputId;
    if (name) this._inputEl.name = name;
    this._inputEl.value = value;
    this._inputEl.checked = isChecked;
    this._inputEl.disabled = isDisabled;
    this._inputEl.required = isRequired;
    this._inputEl.setAttribute("aria-checked", String(isChecked));
    if (isRequired) this._inputEl.setAttribute("aria-required", "true");
    if (label) this._inputEl.setAttribute("aria-labelledby", this._labelId);
    this._fieldEl.appendChild(this._inputEl);
    this._trackEl = document.createElement("span");
    this._trackEl.className = "arvo-sw__track";
    this._trackEl.setAttribute("aria-hidden", "true");
    const thumbEl = document.createElement("span");
    thumbEl.className = "arvo-sw__thumb";
    this._trackEl.appendChild(thumbEl);
    this._fieldEl.appendChild(this._trackEl);
    if (label) {
      this._labelEl = this._createLabelEl(label, isRequired);
      this._fieldEl.appendChild(this._labelEl);
    }
    el.appendChild(this._fieldEl);
  }
  _createLabelEl(text, isRequired) {
    const { isDisabled, contextHelp } = this._options;
    const lbl = ArvoFormLabel.initialize(null, {
      text,
      as: "span",
      isRequired,
      isDisabled,
      contextHelp
    }).el;
    lbl.classList.add("arvo-sw__lbl");
    lbl.id = this._labelId;
    return lbl;
  }
  _bindEvents() {
    if (!this._inputEl) return;
    this._inputEl.addEventListener("change", this._boundHandleChange);
    this._inputEl.addEventListener("keydown", this._boundHandleKeyDown);
    this._inputEl.addEventListener("focus", this._boundHandleFocus);
    this._inputEl.addEventListener("blur", this._boundHandleBlur);
  }
  _handleChange(_event) {
    var _a, _b;
    if (this._options.isDisabled || this._options.isLoading || this._options.isReadOnly) return;
    const newChecked = !this._options.isChecked;
    this._syncCheckedState(newChecked);
    const { value } = this._options;
    this._dispatchEvent("sw:change", { isChecked: newChecked, value });
    (_b = (_a = this._options).onChange) == null ? void 0 : _b.call(_a, { isChecked: newChecked, value });
  }
  _handleKeyDown(event) {
    var _a, _b;
    const e = event;
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (this._options.isDisabled || this._options.isLoading || this._options.isReadOnly) return;
    const newChecked = !this._options.isChecked;
    this._syncCheckedState(newChecked);
    const { value } = this._options;
    this._dispatchEvent("sw:change", { isChecked: newChecked, value });
    (_b = (_a = this._options).onChange) == null ? void 0 : _b.call(_a, { isChecked: newChecked, value });
  }
  _handleFocus(event) {
    var _a, _b;
    (_b = (_a = this._options).onFocus) == null ? void 0 : _b.call(_a, event);
  }
  _handleBlur(event) {
    var _a, _b;
    (_b = (_a = this._options).onBlur) == null ? void 0 : _b.call(_a, event);
  }
  _syncCheckedState(isChecked) {
    this._options.isChecked = isChecked;
    if (this._inputEl) {
      this._inputEl.checked = isChecked;
      this._inputEl.setAttribute("aria-checked", String(isChecked));
    }
  }
  _dispatchEvent(eventName, detail) {
    var _a;
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(eventName, { bubbles: true, cancelable: true, detail })
    );
  }
  // --- Public Methods ---
  toggle(force) {
    var _a, _b;
    if (this._options.isDisabled || this._options.isLoading || this._options.isReadOnly) return;
    const newChecked = force ?? !this._options.isChecked;
    if (newChecked === this._options.isChecked) return;
    this._syncCheckedState(newChecked);
    const { value } = this._options;
    this._dispatchEvent("sw:change", { isChecked: newChecked, value });
    (_b = (_a = this._options).onChange) == null ? void 0 : _b.call(_a, { isChecked: newChecked, value });
  }
  checked() {
    var _a;
    return ((_a = this._inputEl) == null ? void 0 : _a.checked) ?? this._options.isChecked;
  }
  disabled(state) {
    var _a;
    if (state === void 0) {
      return this._options.isDisabled;
    }
    this._options.isDisabled = state;
    (_a = this._element) == null ? void 0 : _a.classList.toggle("is-disabled", state);
    if (this._inputEl) this._inputEl.disabled = state;
  }
  readonly(state) {
    var _a;
    if (state === void 0) {
      return this._options.isReadOnly;
    }
    this._options.isReadOnly = state;
    (_a = this._element) == null ? void 0 : _a.classList.toggle("is-readonly", state);
  }
  setLabel(label) {
    var _a, _b, _c, _d;
    this._options.label = label;
    if (label) {
      if (this._labelEl) {
        this._labelEl.remove();
      }
      this._labelEl = this._createLabelEl(label, this._options.isRequired);
      (_a = this._fieldEl) == null ? void 0 : _a.appendChild(this._labelEl);
      (_b = this._inputEl) == null ? void 0 : _b.setAttribute("aria-labelledby", this._labelId);
    } else {
      (_c = this._labelEl) == null ? void 0 : _c.remove();
      this._labelEl = null;
      (_d = this._inputEl) == null ? void 0 : _d.removeAttribute("aria-labelledby");
    }
  }
  setLoading(isLoading) {
    var _a, _b, _c, _d;
    this._options.isLoading = isLoading;
    if (isLoading) {
      (_a = this._element) == null ? void 0 : _a.classList.add("loading");
      (_b = this._element) == null ? void 0 : _b.setAttribute("aria-busy", "true");
      if (this._inputEl && document.activeElement === this._inputEl) {
        this._inputEl.blur();
      }
    } else {
      (_c = this._element) == null ? void 0 : _c.classList.remove("loading");
      (_d = this._element) == null ? void 0 : _d.removeAttribute("aria-busy");
    }
  }
  focus() {
    var _a;
    (_a = this._inputEl) == null ? void 0 : _a.focus();
  }
  destroy() {
    var _a;
    const el = this._element;
    if (!el) return;
    if (this._inputEl) {
      this._inputEl.removeEventListener("change", this._boundHandleChange);
      this._inputEl.removeEventListener("keydown", this._boundHandleKeyDown);
      this._inputEl.removeEventListener("focus", this._boundHandleFocus);
      this._inputEl.removeEventListener("blur", this._boundHandleBlur);
    }
    el.classList.remove(
      "arvo-sw",
      "arvo-sw--label-start",
      "is-disabled",
      "is-readonly",
      "loading"
    );
    _ArvoSwitch.SIZES.forEach((s) => el.classList.remove(`arvo-sw--${s}`));
    el.removeAttribute("aria-busy");
    (_a = this._fieldEl) == null ? void 0 : _a.remove();
    this._element = null;
    this._inputEl = null;
    this._fieldEl = null;
    this._trackEl = null;
    this._labelEl = null;
  }
};
_ArvoSwitch.SIZES = ["sm", "lg"];
_ArvoSwitch.DEFAULTS = {
  label: null,
  contextHelp: null,
  isChecked: false,
  isDisabled: false,
  isReadOnly: false,
  isRequired: false,
  value: "on",
  name: void 0,
  labelPosition: "end",
  size: "lg",
  isLoading: false,
  onChange: null,
  onFocus: null,
  onBlur: null
};
let ArvoSwitch = _ArvoSwitch;
export {
  ArvoSwitch
};
//# sourceMappingURL=Switch.js.map
