"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const utils = require("@arvo/utils");
const core = require("@arvo/core");
const FormLabel = require("../FormLabel/FormLabel.cjs");
const IconButton = require("../IconButton/IconButton.cjs");
const MessageAlert = require("../MessageAlert/MessageAlert.cjs");
let _idCounter = 0;
const _ArvoTextarea = class _ArvoTextarea {
  constructor(element, options) {
    this._textareaEl = null;
    this._fieldEl = null;
    this._actionsEl = null;
    this._borderEl = null;
    this._labelEl = null;
    this._counterEl = null;
    this._icoEl = null;
    this._clearEl = null;
    this._clearBtn = null;
    this._errIcoEl = null;
    this._errIcoConnector = null;
    this._errMsgAlert = null;
    this._inlineAlert = null;
    this._inlineAlertEl = null;
    this._resizeObserver = null;
    this._previousValue = "";
    this._inputId = "";
    this._errorId = "";
    this._element = element;
    const size = (options == null ? void 0 : options.size) && _ArvoTextarea.SIZES.includes(options.size) ? options.size : _ArvoTextarea.DEFAULTS.size;
    const surface = (options == null ? void 0 : options.surface) && _ArvoTextarea.SURFACES.includes(options.surface) ? options.surface : _ArvoTextarea.DEFAULTS.surface;
    const resizable = (options == null ? void 0 : options.resizable) && _ArvoTextarea.RESIZABLE.includes(options.resizable) ? options.resizable : _ArvoTextarea.DEFAULTS.resizable;
    this._options = {
      ..._ArvoTextarea.DEFAULTS,
      ...options,
      size,
      surface,
      resizable,
      label: (options == null ? void 0 : options.label) ?? null,
      contextHelp: (options == null ? void 0 : options.contextHelp) ?? null,
      errorMsg: (options == null ? void 0 : options.errorMsg) ?? null,
      maxLength: (options == null ? void 0 : options.maxLength) ?? null,
      icon: (options == null ? void 0 : options.icon) ?? null,
      width: (options == null ? void 0 : options.width) ?? null,
      onInput: (options == null ? void 0 : options.onInput) ?? null,
      onChange: (options == null ? void 0 : options.onChange) ?? null,
      onFocus: (options == null ? void 0 : options.onFocus) ?? null,
      onBlur: (options == null ? void 0 : options.onBlur) ?? null,
      onKeyDown: (options == null ? void 0 : options.onKeyDown) ?? null
    };
    this._previousValue = this._options.value;
    this._boundHandleInput = this._handleInput.bind(this);
    this._boundHandleChange = this._handleChange.bind(this);
    this._boundHandleFocus = this._handleFocus.bind(this);
    this._boundHandleBlur = this._handleBlur.bind(this);
    this._boundHandleKeydown = this._handleKeydown.bind(this);
    this._boundHandleClearClick = this._handleClearClick.bind(this);
    this._boundHandleIcoMouseDown = this._handleIcoMouseDown.bind(this);
    this._render();
    this._bindEvents();
  }
  static initialize(element, options) {
    return new _ArvoTextarea(element, options);
  }
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    const uid = ++_idCounter;
    this._inputId = `arvo-textarea-${uid}`;
    this._errorId = `arvo-textarea-err-${uid}`;
    const {
      size,
      surface,
      width,
      isFullWidth,
      label,
      contextHelp,
      isRequired,
      value,
      placeholder,
      isDisabled,
      isReadOnly,
      rows,
      maxLength,
      hasCounter,
      autoResize,
      resizable,
      errorDisplay,
      isInvalid,
      errorMsg,
      isLoading,
      icon
    } = this._options;
    const useTooltipError = errorDisplay === "tooltip";
    const useInlineAlert = errorDisplay === "inline";
    el.classList.add("arvo-textarea", `arvo-textarea--${size}`, `arvo-textarea--surface-${surface}`);
    el.setAttribute("role", "group");
    if (isFullWidth) el.classList.add("arvo-textarea--full-width");
    if (autoResize) el.classList.add("arvo-textarea--auto-resize");
    const effectiveWidth = isFullWidth ? "100%" : width;
    if (effectiveWidth) {
      el.style.setProperty("--arvo-form-input-width", effectiveWidth);
    }
    if (label) {
      const lbl = FormLabel.ArvoFormLabel.initialize(null, {
        text: label,
        isRequired,
        for: this._inputId,
        contextHelp
      });
      this._labelEl = lbl.el;
      this._labelEl.classList.add("arvo-textarea__lbl");
      el.appendChild(this._labelEl);
    }
    this._fieldEl = document.createElement("div");
    this._fieldEl.className = "arvo-textarea__field";
    if (icon) {
      this._icoEl = document.createElement("span");
      this._icoEl.className = `arvo-textarea__ico o9con o9con-${icon}`;
      this._icoEl.setAttribute("aria-hidden", "true");
      this._fieldEl.appendChild(this._icoEl);
    }
    this._textareaEl = document.createElement("textarea");
    this._textareaEl.className = "arvo-textarea__input";
    this._textareaEl.id = this._inputId;
    this._textareaEl.value = value;
    this._textareaEl.rows = rows;
    if (placeholder) this._textareaEl.placeholder = placeholder;
    this._textareaEl.disabled = isDisabled;
    this._textareaEl.readOnly = isReadOnly;
    this._textareaEl.required = isRequired;
    if (maxLength !== null) this._textareaEl.maxLength = maxLength;
    this._textareaEl.style.resize = autoResize ? "none" : resizable;
    this._fieldEl.appendChild(this._textareaEl);
    this._actionsEl = document.createElement("div");
    this._actionsEl.className = "arvo-textarea__actions";
    if (this._options.isClearable) {
      this._clearEl = document.createElement("button");
      this._clearBtn = IconButton.ArvoIconButton.initialize(this._clearEl, {
        size: "xs",
        variant: "tertiary",
        icon: "close",
        tooltip: "Clear",
        isDisabled: isDisabled || isLoading
      });
      this._clearEl.setAttribute("aria-label", "Clear");
      this._clearEl.classList.add("arvo-textarea__clear");
      this._actionsEl.appendChild(this._clearEl);
    }
    if (useTooltipError) {
      const tooltip = errorMsg ?? MessageAlert.ARVO_MSG_ALERT_DEFAULT_ERROR;
      this._errMsgAlert = MessageAlert.ArvoMessageAlert.initialize(document.createElement("div"), {
        type: "negative",
        isInline: true,
        message: tooltip
      });
      this._errIcoEl = this._errMsgAlert.el;
      this._errIcoEl.classList.add("arvo-textarea__err-ico");
      this._errIcoConnector = core.connectTooltip(core.tooltipManager, {
        anchor: this._errIcoEl,
        content: tooltip
      });
      this._actionsEl.appendChild(this._errIcoEl);
    }
    this._fieldEl.appendChild(this._actionsEl);
    this._borderEl = document.createElement("div");
    this._borderEl.className = "arvo-textarea__border";
    this._fieldEl.appendChild(this._borderEl);
    el.appendChild(this._fieldEl);
    this._resizeObserver = new ResizeObserver(() => this._updatePadding());
    this._resizeObserver.observe(this._actionsEl);
    this._updatePadding();
    if (hasCounter) {
      this._counterEl = utils.createCharCounter({ maxLength });
      this._counterEl.classList.add("arvo-textarea__counter");
      utils.updateCharCounter(this._counterEl, value.length, maxLength);
      el.appendChild(this._counterEl);
    }
    if (useInlineAlert) {
      const message = errorMsg ?? MessageAlert.ARVO_MSG_ALERT_DEFAULT_ERROR;
      this._inlineAlert = MessageAlert.ArvoMessageAlert.initialize(document.createElement("div"), {
        type: "negative",
        message,
        id: this._errorId
      });
      this._inlineAlertEl = this._inlineAlert.el;
      this._inlineAlertEl.style.display = "none";
      el.appendChild(this._inlineAlertEl);
    }
    if (isDisabled) el.classList.add("is-disabled");
    if (isReadOnly) el.classList.add("is-readonly");
    if (isInvalid) el.classList.add("has-error");
    if (isInvalid && useTooltipError) el.classList.add("error-tooltip");
    if (isLoading) el.classList.add("loading");
    if (value.length > 0) el.classList.add("has-value");
    if (isInvalid) {
      this._textareaEl.setAttribute("aria-invalid", "true");
      if (useInlineAlert) this._textareaEl.setAttribute("aria-describedby", this._errorId);
    }
    if (isRequired) this._textareaEl.setAttribute("aria-required", "true");
    if (isLoading) el.setAttribute("aria-busy", "true");
    if (isInvalid && useInlineAlert && this._inlineAlertEl) {
      this._inlineAlertEl.style.display = "";
      if (this._counterEl) this._counterEl.style.display = "none";
    }
    if (autoResize) {
      requestAnimationFrame(() => this._recalcAutoResize());
    }
    if (!autoResize && resizable !== "none") {
      requestAnimationFrame(() => this._captureMinHeight());
    }
  }
  // Reads the natural rendered height (from the `rows` attribute) and
  // exposes it as `--arvo-textarea-min-height` on the root so the SCSS
  // rule applies a `min-height` to the native <textarea>. Idempotent.
  _captureMinHeight() {
    const el = this._textareaEl;
    const root = this._element;
    if (!el || !root) return;
    const h = el.offsetHeight;
    if (h <= 0) return;
    root.style.setProperty("--arvo-textarea-min-height", `${h}px`);
  }
  _updatePadding() {
    if (!this._actionsEl || !this._fieldEl) return;
    const w = this._actionsEl.offsetWidth;
    const pad = w > 0 ? w + 4 : 0;
    this._fieldEl.style.setProperty("--arvo-form-input-pad-r", `${pad}px`);
  }
  _bindEvents() {
    const textarea = this._textareaEl;
    if (!textarea) return;
    textarea.addEventListener("input", this._boundHandleInput);
    textarea.addEventListener("change", this._boundHandleChange);
    textarea.addEventListener("focus", this._boundHandleFocus);
    textarea.addEventListener("blur", this._boundHandleBlur);
    textarea.addEventListener("keydown", this._boundHandleKeydown);
    if (this._icoEl) {
      this._icoEl.addEventListener("mousedown", this._boundHandleIcoMouseDown);
    }
    if (this._clearEl) {
      this._clearEl.addEventListener("click", this._boundHandleClearClick);
    }
  }
  _handleIcoMouseDown(event) {
    var _a;
    event.preventDefault();
    (_a = this._textareaEl) == null ? void 0 : _a.focus();
  }
  _handleInput(event) {
    var _a, _b, _c, _d;
    if (this._options.isDisabled || this._options.isLoading) return;
    const value = ((_a = this._textareaEl) == null ? void 0 : _a.value) ?? "";
    (_b = this._element) == null ? void 0 : _b.classList.toggle("has-value", value.length > 0);
    if (this._counterEl) {
      utils.updateCharCounter(this._counterEl, value.length, this._options.maxLength);
    }
    if (this._options.autoResize) {
      this._recalcAutoResize();
    }
    (_d = (_c = this._options).onInput) == null ? void 0 : _d.call(_c, event);
  }
  _handleChange(event) {
    var _a, _b, _c;
    if (this._options.isDisabled || this._options.isLoading) return;
    const value = ((_a = this._textareaEl) == null ? void 0 : _a.value) ?? "";
    const previousValue = this._previousValue;
    this._previousValue = value;
    this._dispatchEvent("textarea:change", { value, previousValue });
    (_c = (_b = this._options).onChange) == null ? void 0 : _c.call(_b, event);
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
    var _a, _b, _c;
    if (this._options.isDisabled || this._options.isLoading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.key === "Escape" && this._options.isClearable && !this._options.isReadOnly) {
      const value = ((_a = this._textareaEl) == null ? void 0 : _a.value) ?? "";
      if (value.length > 0) {
        this.clear();
        return;
      }
    }
    (_c = (_b = this._options).onKeyDown) == null ? void 0 : _c.call(_b, event);
  }
  _handleClearClick() {
    var _a;
    this.clear();
    (_a = this._textareaEl) == null ? void 0 : _a.focus();
  }
  _recalcAutoResize() {
    const el = this._textareaEl;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    el.style.overflow = el.scrollHeight > el.clientHeight ? "auto" : "hidden";
  }
  _dispatchEvent(name, detail) {
    var _a;
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(name, { bubbles: true, cancelable: true, detail })
    );
  }
  value(newValue) {
    var _a, _b;
    if (newValue === void 0) {
      return ((_a = this._textareaEl) == null ? void 0 : _a.value) ?? this._options.value;
    }
    const previousValue = this._previousValue;
    this._previousValue = newValue;
    this._options.value = newValue;
    if (this._textareaEl) {
      this._textareaEl.value = newValue;
    }
    (_b = this._element) == null ? void 0 : _b.classList.toggle("has-value", newValue.length > 0);
    if (this._counterEl) {
      utils.updateCharCounter(this._counterEl, newValue.length, this._options.maxLength);
    }
    if (this._options.autoResize) {
      requestAnimationFrame(() => this._recalcAutoResize());
    }
    this._dispatchEvent("textarea:change", { value: newValue, previousValue });
  }
  clear() {
    this._dispatchEvent("textarea:clear", {});
    this.value("");
    if (this._options.autoResize) {
      requestAnimationFrame(() => this._recalcAutoResize());
    }
  }
  validate() {
    const value = this.value();
    const errors = [];
    if (this._options.isRequired && value.trim().length === 0) {
      errors.push("This field is required");
    }
    if (this._options.maxLength !== null && value.length > this._options.maxLength) {
      errors.push(`Value must not exceed ${this._options.maxLength} characters`);
    }
    return { valid: errors.length === 0, errors };
  }
  setError(message) {
    var _a, _b, _c, _d, _e;
    const useTooltipError = this._options.errorDisplay === "tooltip";
    const useInlineAlert = this._options.errorDisplay === "inline";
    if (message === false) {
      this._options.isInvalid = false;
      this._options.errorMsg = null;
      (_a = this._element) == null ? void 0 : _a.classList.remove("has-error", "error-tooltip");
      if (this._textareaEl) {
        this._textareaEl.removeAttribute("aria-invalid");
        this._textareaEl.removeAttribute("aria-describedby");
      }
      if (this._inlineAlertEl) {
        this._inlineAlertEl.style.display = "none";
      }
      if (this._counterEl && this._options.hasCounter) {
        this._counterEl.style.display = "";
      }
      return;
    }
    const msg = message || MessageAlert.ARVO_MSG_ALERT_DEFAULT_ERROR;
    this._options.isInvalid = true;
    this._options.errorMsg = msg;
    (_b = this._element) == null ? void 0 : _b.classList.add("has-error");
    if (this._textareaEl) {
      this._textareaEl.setAttribute("aria-invalid", "true");
      if (useInlineAlert) {
        this._textareaEl.setAttribute("aria-describedby", this._errorId);
      }
    }
    if (useTooltipError && this._errIcoEl) {
      (_c = this._errMsgAlert) == null ? void 0 : _c.message(msg);
      if (this._errIcoConnector) {
        this._errIcoConnector.update({ content: msg });
      }
      (_d = this._element) == null ? void 0 : _d.classList.add("error-tooltip");
    }
    if (useInlineAlert && this._inlineAlertEl) {
      (_e = this._inlineAlert) == null ? void 0 : _e.message(msg);
      this._inlineAlertEl.style.display = "";
      if (this._counterEl) this._counterEl.style.display = "none";
    }
  }
  focus() {
    var _a;
    if (!this._options.isDisabled && !this._options.isLoading) {
      (_a = this._textareaEl) == null ? void 0 : _a.focus();
    }
  }
  width(value) {
    var _a;
    if (value === void 0) {
      return this._options.width;
    }
    this._options.width = value;
    (_a = this._element) == null ? void 0 : _a.style.setProperty("--arvo-form-input-width", value);
  }
  disabled(state) {
    var _a, _b, _c;
    if (state === void 0) {
      return this._options.isDisabled;
    }
    this._options.isDisabled = state;
    if (state) {
      (_a = this._element) == null ? void 0 : _a.classList.add("is-disabled");
    } else {
      (_b = this._element) == null ? void 0 : _b.classList.remove("is-disabled");
    }
    if (this._textareaEl) {
      this._textareaEl.disabled = state;
    }
    (_c = this._clearBtn) == null ? void 0 : _c.disabled(state || this._options.isLoading);
  }
  icon(name) {
    if (name === void 0) {
      return this._options.icon;
    }
    this._options.icon = name;
    if (name) {
      if (this._icoEl) {
        this._icoEl.className = `arvo-textarea__ico o9con o9con-${name}`;
      } else {
        this._icoEl = document.createElement("span");
        this._icoEl.className = `arvo-textarea__ico o9con o9con-${name}`;
        this._icoEl.setAttribute("aria-hidden", "true");
        this._icoEl.addEventListener("mousedown", this._boundHandleIcoMouseDown);
        if (this._fieldEl) {
          this._fieldEl.insertBefore(this._icoEl, this._fieldEl.firstChild);
        }
      }
    } else if (this._icoEl) {
      this._icoEl.removeEventListener("mousedown", this._boundHandleIcoMouseDown);
      this._icoEl.remove();
      this._icoEl = null;
    }
  }
  setLoading(isLoading) {
    var _a, _b, _c, _d, _e, _f, _g;
    const wasFocused = document.activeElement === this._textareaEl;
    this._options.isLoading = isLoading;
    if (isLoading) {
      (_a = this._element) == null ? void 0 : _a.classList.add("loading");
      (_b = this._element) == null ? void 0 : _b.setAttribute("aria-busy", "true");
      (_c = this._clearBtn) == null ? void 0 : _c.disabled(true);
      if (wasFocused) {
        (_d = this._textareaEl) == null ? void 0 : _d.blur();
      }
    } else {
      (_e = this._element) == null ? void 0 : _e.classList.remove("loading");
      (_f = this._element) == null ? void 0 : _f.removeAttribute("aria-busy");
      if (!this._options.isDisabled) {
        (_g = this._clearBtn) == null ? void 0 : _g.disabled(false);
      }
    }
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
    const el = this._element;
    if (!el) return;
    (_a = this._resizeObserver) == null ? void 0 : _a.disconnect();
    this._resizeObserver = null;
    (_b = this._inlineAlert) == null ? void 0 : _b.destroy();
    this._inlineAlert = null;
    (_c = this._errMsgAlert) == null ? void 0 : _c.destroy();
    this._errMsgAlert = null;
    if (this._textareaEl) {
      this._textareaEl.removeEventListener("input", this._boundHandleInput);
      this._textareaEl.removeEventListener("change", this._boundHandleChange);
      this._textareaEl.removeEventListener("focus", this._boundHandleFocus);
      this._textareaEl.removeEventListener("blur", this._boundHandleBlur);
      this._textareaEl.removeEventListener("keydown", this._boundHandleKeydown);
    }
    if (this._icoEl) {
      this._icoEl.removeEventListener("mousedown", this._boundHandleIcoMouseDown);
    }
    (_d = this._clearBtn) == null ? void 0 : _d.destroy();
    if (this._clearEl) {
      this._clearEl.removeEventListener("click", this._boundHandleClearClick);
    }
    el.classList.remove(
      "arvo-textarea",
      "arvo-textarea--full-width",
      "arvo-textarea--auto-resize",
      "is-disabled",
      "is-readonly",
      "has-error",
      "error-tooltip",
      "loading",
      "has-value"
    );
    _ArvoTextarea.SIZES.forEach((s) => el.classList.remove(`arvo-textarea--${s}`));
    _ArvoTextarea.SURFACES.forEach((s) => el.classList.remove(`arvo-textarea--surface-${s}`));
    el.removeAttribute("aria-busy");
    el.removeAttribute("role");
    el.style.removeProperty("--arvo-form-input-width");
    el.style.removeProperty("--arvo-textarea-min-height");
    (_e = this._labelEl) == null ? void 0 : _e.remove();
    (_f = this._counterEl) == null ? void 0 : _f.remove();
    (_g = this._inlineAlertEl) == null ? void 0 : _g.remove();
    (_h = this._errIcoEl) == null ? void 0 : _h.remove();
    (_i = this._icoEl) == null ? void 0 : _i.remove();
    (_j = this._clearEl) == null ? void 0 : _j.remove();
    (_k = this._actionsEl) == null ? void 0 : _k.remove();
    (_l = this._fieldEl) == null ? void 0 : _l.remove();
    (_m = this._borderEl) == null ? void 0 : _m.remove();
    this._element = null;
    this._textareaEl = null;
    this._fieldEl = null;
    this._actionsEl = null;
    this._borderEl = null;
    this._labelEl = null;
    this._counterEl = null;
    this._icoEl = null;
    this._clearEl = null;
    this._clearBtn = null;
    (_n = this._errIcoConnector) == null ? void 0 : _n.destroy();
    this._errIcoConnector = null;
    this._errIcoEl = null;
    this._inlineAlertEl = null;
  }
};
_ArvoTextarea.SIZES = ["sm", "lg"];
_ArvoTextarea.SURFACES = ["filled", "base"];
_ArvoTextarea.RESIZABLE = ["none", "vertical", "both"];
_ArvoTextarea.DEFAULTS = {
  value: "",
  placeholder: "",
  isDisabled: false,
  isReadOnly: false,
  label: null,
  contextHelp: null,
  isRequired: false,
  isInvalid: false,
  size: "sm",
  surface: "filled",
  rows: 3,
  icon: null,
  maxLength: null,
  hasCounter: false,
  autoResize: false,
  resizable: "none",
  errorMsg: null,
  errorDisplay: "inline",
  isClearable: false,
  isLoading: false,
  width: null,
  isFullWidth: false,
  onInput: null,
  onChange: null,
  onFocus: null,
  onBlur: null,
  onKeyDown: null
};
let ArvoTextarea = _ArvoTextarea;
exports.ArvoTextarea = ArvoTextarea;
//# sourceMappingURL=Textarea.cjs.map
