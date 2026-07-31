"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const FormLabel = require("../FormLabel/FormLabel.cjs");
const MessageAlert = require("../MessageAlert/MessageAlert.cjs");
let _idCounter = 0;
const _ArvoRadio = class _ArvoRadio {
  constructor(element, options) {
    this._inputEl = null;
    this._inputWrapperEl = null;
    this._fieldEl = null;
    this._controlEl = null;
    this._textContainerEl = null;
    this._textEl = null;
    this._descEl = null;
    this._inlineAlert = null;
    this._inlineAlertEl = null;
    this._inputId = "";
    this._errorId = "";
    this._element = element;
    this._options = {
      ..._ArvoRadio.DEFAULTS,
      ...options,
      description: (options == null ? void 0 : options.description) ?? null,
      contextHelp: (options == null ? void 0 : options.contextHelp) ?? null,
      onChange: (options == null ? void 0 : options.onChange) ?? null,
      onFocus: (options == null ? void 0 : options.onFocus) ?? null,
      onBlur: (options == null ? void 0 : options.onBlur) ?? null
    };
    this._boundHandleChange = this._handleChange.bind(this);
    this._boundHandleFocus = this._handleFocus.bind(this);
    this._boundHandleBlur = this._handleBlur.bind(this);
    this._boundHandleKeydown = this._handleKeydown.bind(this);
    this._render();
    this._bindEvents();
  }
  static initialize(element, options) {
    return new _ArvoRadio(element, options);
  }
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    const uid = ++_idCounter;
    this._inputId = `arvo-radio-${uid}`;
    this._errorId = `arvo-radio-err-${uid}`;
    const {
      value,
      name,
      label,
      isChecked,
      isDisabled,
      isRequired,
      isReadOnly,
      isInvalid,
      isLoading,
      size,
      hasDescription,
      description,
      errorMsg
    } = this._options;
    const classes = [
      "arvo-radio",
      `arvo-radio--${size}`,
      isLoading && "loading",
      isDisabled && "is-disabled",
      isReadOnly && "is-readonly",
      isInvalid && "has-error"
    ].filter(Boolean);
    el.className = classes.join(" ");
    if (isLoading) {
      el.setAttribute("aria-busy", "true");
    }
    this._fieldEl = document.createElement("label");
    this._fieldEl.className = "arvo-radio__field";
    this._fieldEl.htmlFor = this._inputId;
    this._inputWrapperEl = document.createElement("span");
    this._inputWrapperEl.className = "arvo-radio__input-wrapper";
    this._inputEl = document.createElement("input");
    this._inputEl.className = "arvo-radio__input";
    this._inputEl.type = "radio";
    this._inputEl.id = this._inputId;
    this._inputEl.name = name;
    this._inputEl.value = value;
    this._inputEl.checked = isChecked;
    this._inputEl.disabled = isDisabled;
    this._inputEl.readOnly = isReadOnly;
    this._inputEl.required = isRequired;
    this._inputEl.tabIndex = isReadOnly ? -1 : 0;
    if (isInvalid) this._inputEl.setAttribute("aria-invalid", "true");
    if (isRequired) this._inputEl.setAttribute("aria-required", "true");
    if (isInvalid && errorMsg) this._inputEl.setAttribute("aria-describedby", this._errorId);
    this._inputWrapperEl.appendChild(this._inputEl);
    this._controlEl = document.createElement("span");
    this._controlEl.className = "arvo-radio__control";
    this._controlEl.setAttribute("aria-hidden", "true");
    this._inputWrapperEl.appendChild(this._controlEl);
    this._fieldEl.appendChild(this._inputWrapperEl);
    const showDescription = hasDescription && !!description;
    if (label || showDescription) {
      this._textContainerEl = document.createElement("span");
      this._textContainerEl.className = "arvo-radio__text-container";
      if (label) {
        this._textEl = FormLabel.ArvoFormLabel.initialize(null, {
          text: label,
          as: "span",
          size: this._options.size ?? "lg",
          isDisabled,
          isInvalid,
          isRequired,
          contextHelp: this._options.contextHelp
        }).el;
        this._textEl.classList.add("arvo-radio__text");
        this._textContainerEl.appendChild(this._textEl);
      }
      if (showDescription) {
        this._descEl = document.createElement("span");
        this._descEl.className = "arvo-radio__desc";
        this._descEl.textContent = description;
        this._textContainerEl.appendChild(this._descEl);
      }
      this._fieldEl.appendChild(this._textContainerEl);
    }
    el.appendChild(this._fieldEl);
    if (isInvalid && errorMsg) {
      this._renderInlineAlert(errorMsg);
    }
  }
  _bindEvents() {
    if (!this._inputEl) return;
    this._inputEl.addEventListener("change", this._boundHandleChange);
    this._inputEl.addEventListener("focus", this._boundHandleFocus);
    this._inputEl.addEventListener("blur", this._boundHandleBlur);
    this._inputEl.addEventListener("keydown", this._boundHandleKeydown);
  }
  _handleChange(_event) {
    var _a, _b;
    if (this._options.isDisabled || this._options.isLoading || this._options.isReadOnly) return;
    this._syncCheckedState(true);
    const { value, name } = this._options;
    this._dispatchEvent("radio:change", { value, name });
    (_b = (_a = this._options).onChange) == null ? void 0 : _b.call(_a, { value, name });
  }
  _handleFocus(event) {
    var _a, _b;
    (_b = (_a = this._options).onFocus) == null ? void 0 : _b.call(_a, event);
  }
  _handleBlur(event) {
    var _a, _b;
    (_b = (_a = this._options).onBlur) == null ? void 0 : _b.call(_a, event);
  }
  _handleKeydown(event) {
    if (this._options.isDisabled || this._options.isLoading || this._options.isReadOnly) return;
    const ke = event;
    const { key } = ke;
    if (key === " ") {
      if (!this.checked()) {
        ke.preventDefault();
        this.select();
      }
      return;
    }
    const isNext = key === "ArrowDown" || key === "ArrowRight";
    const isPrev = key === "ArrowUp" || key === "ArrowLeft";
    if (!isNext && !isPrev) return;
    ke.preventDefault();
    const groupInputs = this._getGroupInputs();
    const currentIndex = groupInputs.indexOf(this._inputEl);
    if (currentIndex === -1) return;
    const total = groupInputs.length;
    let nextIndex = currentIndex;
    for (let i = 1; i < total; i++) {
      const candidate = isNext ? (currentIndex + i) % total : (currentIndex - i + total) % total;
      const candidateInput = groupInputs[candidate];
      if (!candidateInput.disabled) {
        nextIndex = candidate;
        break;
      }
    }
    if (nextIndex === currentIndex) return;
    const targetInput = groupInputs[nextIndex];
    targetInput.focus();
    targetInput.click();
  }
  _getGroupInputs() {
    const name = this._options.name;
    const escaped = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(name) : name.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
    return Array.from(
      document.querySelectorAll(`input[type="radio"][name="${escaped}"]`)
    );
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
  _renderInlineAlert(errorMsg) {
    if (!this._element) return;
    if (this._inlineAlert) {
      this._inlineAlert.message(errorMsg);
      return;
    }
    this._inlineAlert = MessageAlert.ArvoMessageAlert.initialize(document.createElement("div"), {
      type: "negative",
      message: errorMsg,
      id: this._errorId
    });
    this._inlineAlertEl = this._inlineAlert.el;
    this._element.appendChild(this._inlineAlertEl);
  }
  _removeInlineAlert() {
    var _a, _b;
    (_a = this._inlineAlert) == null ? void 0 : _a.destroy();
    this._inlineAlert = null;
    (_b = this._inlineAlertEl) == null ? void 0 : _b.remove();
    this._inlineAlertEl = null;
  }
  _ensureTextContainer() {
    if (!this._fieldEl) {
      throw new Error("ArvoRadio: cannot manage label/description before render");
    }
    if (!this._textContainerEl) {
      this._textContainerEl = document.createElement("span");
      this._textContainerEl.className = "arvo-radio__text-container";
      this._fieldEl.appendChild(this._textContainerEl);
    }
    return this._textContainerEl;
  }
  _removeTextContainerIfEmpty() {
    if (!this._textContainerEl) return;
    if (!this._textEl && !this._descEl) {
      this._textContainerEl.remove();
      this._textContainerEl = null;
    }
  }
  value() {
    return this._options.value;
  }
  select() {
    var _a, _b;
    if (this._options.isDisabled || this._options.isLoading || this._options.isReadOnly) return;
    if (this.checked()) return;
    this._syncCheckedState(true);
    const { value, name } = this._options;
    this._dispatchEvent("radio:change", { value, name });
    (_b = (_a = this._options).onChange) == null ? void 0 : _b.call(_a, { value, name });
  }
  deselect() {
    this._syncCheckedState(false);
  }
  checked() {
    var _a;
    return ((_a = this._inputEl) == null ? void 0 : _a.checked) ?? this._options.isChecked;
  }
  setTabIndex(index) {
    if (this._inputEl) this._inputEl.tabIndex = index;
  }
  disabled(state) {
    var _a, _b;
    if (state === void 0) return this._options.isDisabled;
    this._options.isDisabled = state;
    if (state) {
      (_a = this._element) == null ? void 0 : _a.classList.add("is-disabled");
    } else {
      (_b = this._element) == null ? void 0 : _b.classList.remove("is-disabled");
    }
    if (this._inputEl) this._inputEl.disabled = state;
  }
  readonly(state) {
    var _a, _b;
    if (state === void 0) return this._options.isReadOnly;
    this._options.isReadOnly = state;
    if (state) {
      (_a = this._element) == null ? void 0 : _a.classList.add("is-readonly");
      if (this._inputEl) this._inputEl.tabIndex = -1;
    } else {
      (_b = this._element) == null ? void 0 : _b.classList.remove("is-readonly");
      if (this._inputEl) this._inputEl.tabIndex = 0;
    }
  }
  setLabel(label) {
    var _a;
    this._options.label = label;
    if (label) {
      if (this._textEl) {
        this._textEl.firstChild.textContent = label;
      } else {
        const container = this._ensureTextContainer();
        this._textEl = FormLabel.ArvoFormLabel.initialize(null, {
          text: label,
          as: "span",
          size: this._options.size ?? "lg",
          isDisabled: this._options.isDisabled,
          isInvalid: this._options.isInvalid,
          isRequired: this._options.isRequired,
          contextHelp: this._options.contextHelp
        }).el;
        this._textEl.classList.add("arvo-radio__text");
        container.insertBefore(this._textEl, container.firstChild);
      }
    } else {
      (_a = this._textEl) == null ? void 0 : _a.remove();
      this._textEl = null;
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
        this._descEl.className = "arvo-radio__desc";
        this._descEl.textContent = description;
        container.appendChild(this._descEl);
      }
    } else {
      (_a = this._descEl) == null ? void 0 : _a.remove();
      this._descEl = null;
      this._removeTextContainerIfEmpty();
    }
  }
  setError(messageOrFalse) {
    var _a, _b;
    const hasError = messageOrFalse !== false;
    this._options.isInvalid = hasError;
    if (hasError) {
      (_a = this._element) == null ? void 0 : _a.classList.add("has-error");
      if (this._inputEl) this._inputEl.setAttribute("aria-invalid", "true");
      const errorMsg = (typeof messageOrFalse === "string" ? messageOrFalse : "") || this._options.errorMsg || "";
      if (errorMsg) {
        this._options.errorMsg = errorMsg;
        if (this._inputEl) this._inputEl.setAttribute("aria-describedby", this._errorId);
        this._renderInlineAlert(errorMsg);
      }
    } else {
      (_b = this._element) == null ? void 0 : _b.classList.remove("has-error");
      if (this._inputEl) {
        this._inputEl.removeAttribute("aria-invalid");
        this._inputEl.removeAttribute("aria-describedby");
      }
      this._removeInlineAlert();
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
  destroy() {
    var _a, _b, _c;
    const el = this._element;
    if (!el) return;
    (_a = this._inlineAlert) == null ? void 0 : _a.destroy();
    this._inlineAlert = null;
    if (this._inputEl) {
      this._inputEl.removeEventListener("change", this._boundHandleChange);
      this._inputEl.removeEventListener("focus", this._boundHandleFocus);
      this._inputEl.removeEventListener("blur", this._boundHandleBlur);
      this._inputEl.removeEventListener("keydown", this._boundHandleKeydown);
    }
    el.classList.remove(
      "arvo-radio",
      "arvo-radio--sm",
      "arvo-radio--lg",
      "is-disabled",
      "is-readonly",
      "has-error",
      "loading"
    );
    el.removeAttribute("aria-busy");
    (_b = this._fieldEl) == null ? void 0 : _b.remove();
    (_c = this._inlineAlertEl) == null ? void 0 : _c.remove();
    this._element = null;
    this._inputEl = null;
    this._inputWrapperEl = null;
    this._fieldEl = null;
    this._controlEl = null;
    this._textContainerEl = null;
    this._textEl = null;
    this._descEl = null;
    this._inlineAlertEl = null;
  }
};
_ArvoRadio.DEFAULTS = {
  value: "",
  name: "",
  label: null,
  contextHelp: null,
  isChecked: false,
  isDisabled: false,
  isRequired: false,
  isReadOnly: false,
  isInvalid: false,
  isLoading: false,
  size: "lg",
  hasDescription: false,
  description: null,
  errorMsg: null,
  onChange: null,
  onFocus: null,
  onBlur: null
};
let ArvoRadio = _ArvoRadio;
exports.ArvoRadio = ArvoRadio;
//# sourceMappingURL=Radio.cjs.map
