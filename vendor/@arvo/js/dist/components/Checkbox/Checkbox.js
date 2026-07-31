import { ArvoFormLabel } from "../FormLabel/FormLabel.js";
import { ArvoMessageAlert } from "../MessageAlert/MessageAlert.js";
let _idCounter = 0;
const CHECK_SVG_PATH = "M3.5 8.5L6.5 11.5L12.5 4.5";
const DASH_SVG_PATH = "M4 8H12";
const SVG_NS = "http://www.w3.org/2000/svg";
function createCheckboxIcon(kind) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", `arvo-cb__icon arvo-cb__icon--${kind}`);
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", kind === "check" ? CHECK_SVG_PATH : DASH_SVG_PATH);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.5");
  path.setAttribute("stroke-linecap", "round");
  if (kind === "check") {
    path.setAttribute("stroke-linejoin", "round");
  }
  svg.appendChild(path);
  return svg;
}
const _ArvoCheckbox = class _ArvoCheckbox {
  constructor(element, options) {
    this._inputEl = null;
    this._inputWrapperEl = null;
    this._fieldEl = null;
    this._textContainerEl = null;
    this._labelEl = null;
    this._descEl = null;
    this._inlineAlert = null;
    this._inlineAlertEl = null;
    this._inputId = "";
    this._errorId = "";
    this._element = element;
    const size = (options == null ? void 0 : options.size) && _ArvoCheckbox.SIZES.includes(options.size) ? options.size : _ArvoCheckbox.DEFAULTS.size;
    this._options = {
      ..._ArvoCheckbox.DEFAULTS,
      ...options,
      size,
      label: (options == null ? void 0 : options.label) ?? null,
      contextHelp: (options == null ? void 0 : options.contextHelp) ?? null,
      description: (options == null ? void 0 : options.description) ?? null,
      errorMsg: (options == null ? void 0 : options.errorMsg) ?? null,
      name: options == null ? void 0 : options.name,
      onChange: (options == null ? void 0 : options.onChange) ?? null,
      onFocus: (options == null ? void 0 : options.onFocus) ?? null,
      onBlur: (options == null ? void 0 : options.onBlur) ?? null
    };
    this._boundHandleChange = this._handleChange.bind(this);
    this._boundHandleFocus = this._handleFocus.bind(this);
    this._boundHandleBlur = this._handleBlur.bind(this);
    this._render();
    this._bindEvents();
  }
  static initialize(element, options) {
    return new _ArvoCheckbox(element, options);
  }
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    const uid = ++_idCounter;
    this._inputId = `arvo-cb-${uid}`;
    this._errorId = `arvo-cb-err-${uid}`;
    const {
      label,
      isChecked,
      isIndeterminate,
      isDisabled,
      isReadOnly: isReadonly,
      isRequired,
      isInvalid,
      isExcluded,
      size,
      value,
      name,
      hasDescription,
      description,
      errorMsg,
      errorDisplay,
      isLoading
    } = this._options;
    const useInlineAlert = errorDisplay === "inline";
    el.classList.add("arvo-cb", `arvo-cb--${size}`);
    if (isLoading) el.classList.add("loading");
    if (isDisabled) el.classList.add("is-disabled");
    if (isReadonly) el.classList.add("is-readonly");
    if (isInvalid) el.classList.add("has-error");
    if (isExcluded) el.setAttribute("data-excluded", "true");
    if (isIndeterminate) el.setAttribute("data-indeterminate", "true");
    if (isLoading) el.setAttribute("aria-busy", "true");
    this._fieldEl = document.createElement("label");
    this._fieldEl.className = "arvo-cb__field";
    this._inputWrapperEl = document.createElement("span");
    this._inputWrapperEl.className = "arvo-cb__input-wrapper";
    this._inputEl = document.createElement("input");
    this._inputEl.className = "arvo-cb__input";
    this._inputEl.type = "checkbox";
    this._inputEl.id = this._inputId;
    if (name) this._inputEl.name = name;
    this._inputEl.value = value;
    this._inputEl.checked = isChecked;
    this._inputEl.indeterminate = isIndeterminate;
    this._inputEl.disabled = isDisabled;
    this._inputEl.required = isRequired;
    if (isIndeterminate) this._inputEl.setAttribute("data-indeterminate", "true");
    if (isInvalid) this._inputEl.setAttribute("aria-invalid", "true");
    if (isRequired) this._inputEl.setAttribute("aria-required", "true");
    const showAlert = isInvalid && useInlineAlert;
    if (showAlert) {
      this._inputEl.setAttribute("aria-describedby", this._errorId);
    }
    this._inputWrapperEl.appendChild(this._inputEl);
    this._inputWrapperEl.appendChild(createCheckboxIcon("check"));
    this._inputWrapperEl.appendChild(createCheckboxIcon("dash"));
    this._fieldEl.appendChild(this._inputWrapperEl);
    const showDescription = hasDescription && !!description;
    if (label || showDescription) {
      this._textContainerEl = document.createElement("span");
      this._textContainerEl.className = "arvo-cb__text-container";
      if (label) {
        this._labelEl = ArvoFormLabel.initialize(null, {
          text: label,
          as: "span",
          size: this._options.size ?? "lg",
          isDisabled,
          isInvalid,
          isRequired,
          contextHelp: this._options.contextHelp
        }).el;
        this._labelEl.classList.add("arvo-cb__lbl");
        this._textContainerEl.appendChild(this._labelEl);
      }
      if (showDescription) {
        this._descEl = document.createElement("span");
        this._descEl.className = "arvo-cb__desc";
        this._descEl.textContent = description;
        this._textContainerEl.appendChild(this._descEl);
      }
      this._fieldEl.appendChild(this._textContainerEl);
    }
    el.appendChild(this._fieldEl);
    if (useInlineAlert) {
      const message = errorMsg || "Error";
      this._inlineAlert = ArvoMessageAlert.initialize(document.createElement("div"), {
        type: "negative",
        message,
        id: this._errorId
      });
      this._inlineAlertEl = this._inlineAlert.el;
      if (!isInvalid) {
        this._inlineAlertEl.style.display = "none";
      }
      el.appendChild(this._inlineAlertEl);
    }
  }
  _bindEvents() {
    if (!this._inputEl) return;
    this._inputEl.addEventListener("change", this._boundHandleChange);
    this._inputEl.addEventListener("focus", this._boundHandleFocus);
    this._inputEl.addEventListener("blur", this._boundHandleBlur);
  }
  _handleChange(_event) {
    var _a, _b, _c;
    if (this._options.isDisabled || this._options.isLoading || this._options.isReadOnly) return;
    let newChecked;
    if (this._options.isIndeterminate) {
      newChecked = true;
      this._options.isIndeterminate = false;
      if (this._inputEl) {
        this._inputEl.indeterminate = false;
        this._inputEl.removeAttribute("data-indeterminate");
      }
      (_a = this._element) == null ? void 0 : _a.removeAttribute("data-indeterminate");
    } else {
      newChecked = !this._options.isChecked;
    }
    this._syncCheckedState(newChecked);
    const { value } = this._options;
    this._dispatchEvent("checkbox:change", { isChecked: newChecked, value });
    (_c = (_b = this._options).onChange) == null ? void 0 : _c.call(_b, { isChecked: newChecked, value });
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
    if (this._inputEl) this._inputEl.checked = isChecked;
  }
  _dispatchEvent(eventName, detail) {
    var _a;
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(eventName, { bubbles: true, cancelable: true, detail })
    );
  }
  _ensureTextContainer() {
    if (!this._fieldEl) {
      throw new Error("ArvoCheckbox: cannot manage label/description before render");
    }
    if (!this._textContainerEl) {
      this._textContainerEl = document.createElement("span");
      this._textContainerEl.className = "arvo-cb__text-container";
      this._fieldEl.appendChild(this._textContainerEl);
    }
    return this._textContainerEl;
  }
  _removeTextContainerIfEmpty() {
    if (!this._textContainerEl) return;
    if (!this._labelEl && !this._descEl) {
      this._textContainerEl.remove();
      this._textContainerEl = null;
    }
  }
  // --- Public Methods ---
  toggle(force) {
    var _a, _b, _c;
    if (this._options.isDisabled || this._options.isLoading || this._options.isReadOnly) return;
    const newChecked = force ?? (this._options.isIndeterminate ? true : !this._options.isChecked);
    if (newChecked === this._options.isChecked && !this._options.isIndeterminate) return;
    if (this._options.isIndeterminate) {
      this._options.isIndeterminate = false;
      if (this._inputEl) {
        this._inputEl.indeterminate = false;
        this._inputEl.removeAttribute("data-indeterminate");
      }
      (_a = this._element) == null ? void 0 : _a.removeAttribute("data-indeterminate");
    }
    this._syncCheckedState(newChecked);
    const { value } = this._options;
    this._dispatchEvent("checkbox:change", { isChecked: newChecked, value });
    (_c = (_b = this._options).onChange) == null ? void 0 : _c.call(_b, { isChecked: newChecked, value });
  }
  checked() {
    var _a;
    return ((_a = this._inputEl) == null ? void 0 : _a.checked) ?? this._options.isChecked;
  }
  indeterminate(state) {
    var _a, _b, _c;
    if (state === void 0) {
      return ((_a = this._inputEl) == null ? void 0 : _a.indeterminate) ?? false;
    }
    this._options.isIndeterminate = state;
    if (this._inputEl) {
      this._inputEl.indeterminate = state;
      if (state) {
        this._inputEl.setAttribute("data-indeterminate", "true");
      } else {
        this._inputEl.removeAttribute("data-indeterminate");
      }
    }
    if (state) {
      (_b = this._element) == null ? void 0 : _b.setAttribute("data-indeterminate", "true");
    } else {
      (_c = this._element) == null ? void 0 : _c.removeAttribute("data-indeterminate");
    }
  }
  excluded(state) {
    var _a, _b;
    if (state === void 0) {
      return this._options.isExcluded;
    }
    this._options.isExcluded = state;
    if (state) {
      (_a = this._element) == null ? void 0 : _a.setAttribute("data-excluded", "true");
    } else {
      (_b = this._element) == null ? void 0 : _b.removeAttribute("data-excluded");
    }
  }
  setLabel(label) {
    var _a;
    this._options.label = label;
    if (label) {
      if (this._labelEl) {
        this._labelEl.firstChild.textContent = label;
      } else {
        const container = this._ensureTextContainer();
        this._labelEl = ArvoFormLabel.initialize(null, {
          text: label,
          as: "span",
          size: this._options.size ?? "lg",
          isDisabled: this._options.isDisabled,
          isInvalid: this._options.isInvalid,
          isRequired: this._options.isRequired,
          contextHelp: this._options.contextHelp
        }).el;
        this._labelEl.classList.add("arvo-cb__lbl");
        container.insertBefore(this._labelEl, container.firstChild);
      }
    } else {
      (_a = this._labelEl) == null ? void 0 : _a.remove();
      this._labelEl = null;
      this._removeTextContainerIfEmpty();
    }
  }
  setDescription(description) {
    var _a;
    this._options.description = description;
    const shouldShow = this._options.hasDescription && !!description;
    if (shouldShow) {
      if (this._descEl) {
        this._descEl.textContent = description;
      } else {
        const container = this._ensureTextContainer();
        this._descEl = document.createElement("span");
        this._descEl.className = "arvo-cb__desc";
        this._descEl.textContent = description;
        container.appendChild(this._descEl);
      }
    } else {
      (_a = this._descEl) == null ? void 0 : _a.remove();
      this._descEl = null;
      this._removeTextContainerIfEmpty();
    }
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
  setError(messageOrFalse) {
    var _a, _b, _c;
    const hasError = messageOrFalse !== false;
    this._options.isInvalid = hasError;
    if (hasError) {
      const msg = messageOrFalse || this._options.errorMsg || "Error";
      this._options.errorMsg = msg;
      (_a = this._element) == null ? void 0 : _a.classList.add("has-error");
      if (this._inputEl) {
        this._inputEl.setAttribute("aria-invalid", "true");
      }
      if (this._options.errorDisplay === "inline") {
        if (this._inlineAlertEl) {
          (_b = this._inlineAlert) == null ? void 0 : _b.message(msg);
          this._inlineAlertEl.style.display = "";
        }
        if (this._inputEl) {
          this._inputEl.setAttribute("aria-describedby", this._errorId);
        }
      }
    } else {
      this._options.errorMsg = null;
      (_c = this._element) == null ? void 0 : _c.classList.remove("has-error");
      if (this._inputEl) {
        this._inputEl.removeAttribute("aria-invalid");
        this._inputEl.removeAttribute("aria-describedby");
      }
      if (this._inlineAlertEl) {
        this._inlineAlertEl.style.display = "none";
      }
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
  value() {
    return this._options.value;
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const el = this._element;
    if (!el) return;
    (_a = this._inlineAlert) == null ? void 0 : _a.destroy();
    this._inlineAlert = null;
    if (this._inputEl) {
      this._inputEl.removeEventListener("change", this._boundHandleChange);
      this._inputEl.removeEventListener("focus", this._boundHandleFocus);
      this._inputEl.removeEventListener("blur", this._boundHandleBlur);
    }
    el.classList.remove(
      "arvo-cb",
      "is-disabled",
      "is-readonly",
      "has-error",
      "loading"
    );
    _ArvoCheckbox.SIZES.forEach((s) => el.classList.remove(`arvo-cb--${s}`));
    el.removeAttribute("aria-busy");
    el.removeAttribute("data-excluded");
    el.removeAttribute("data-indeterminate");
    (_b = this._inputEl) == null ? void 0 : _b.remove();
    (_c = this._inputWrapperEl) == null ? void 0 : _c.remove();
    (_d = this._fieldEl) == null ? void 0 : _d.remove();
    (_e = this._textContainerEl) == null ? void 0 : _e.remove();
    (_f = this._labelEl) == null ? void 0 : _f.remove();
    (_g = this._descEl) == null ? void 0 : _g.remove();
    (_h = this._inlineAlertEl) == null ? void 0 : _h.remove();
    this._element = null;
    this._inputEl = null;
    this._inputWrapperEl = null;
    this._fieldEl = null;
    this._textContainerEl = null;
    this._labelEl = null;
    this._descEl = null;
    this._inlineAlertEl = null;
  }
};
_ArvoCheckbox.SIZES = ["sm", "lg"];
_ArvoCheckbox.DEFAULTS = {
  label: null,
  contextHelp: null,
  isChecked: false,
  isIndeterminate: false,
  isDisabled: false,
  isReadOnly: false,
  isRequired: false,
  isInvalid: false,
  isExcluded: false,
  size: "lg",
  value: "on",
  name: void 0,
  hasDescription: false,
  description: null,
  errorMsg: null,
  errorDisplay: "inline",
  isLoading: false,
  onChange: null,
  onFocus: null,
  onBlur: null
};
let ArvoCheckbox = _ArvoCheckbox;
export {
  ArvoCheckbox
};
//# sourceMappingURL=Checkbox.js.map
