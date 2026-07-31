"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const utils = require("@arvo/utils");
const core = require("@arvo/core");
const FormLabel = require("../FormLabel/FormLabel.cjs");
const IconButton = require("../IconButton/IconButton.cjs");
const MessageAlert = require("../MessageAlert/MessageAlert.cjs");
function resolveLeadingIcon(type, userIcon) {
  if (type === "password") return null;
  if (type === "email") return "envelope-o";
  if (type === "url") return "desktop";
  return userIcon;
}
function warnTypeConflicts(type, options) {
  if (typeof process !== "undefined" && process.env && process.env.NODE_ENV === "production") return;
  if (!options) return;
  if ((type === "email" || type === "url" || type === "password") && options.icon) {
    const locked = type === "password" ? "Password inputs render no leading icon." : `The leading icon is locked to "${type === "email" ? "envelope-o" : "desktop"}".`;
    console.warn(
      `[ArvoTextbox] The "icon" option is ignored when type="${type}". ${locked}`
    );
  }
  if (type === "password") {
    const ignored = [];
    if (options.prefix) ignored.push("prefix");
    if (options.prefixTooltip) ignored.push("prefixTooltip");
    if (options.suffix) ignored.push("suffix");
    if (options.suffixTooltip) ignored.push("suffixTooltip");
    if (options.isClearable) ignored.push("isClearable");
    if (ignored.length > 0) {
      console.warn(
        `[ArvoTextbox] The following options are ignored when type="password": ${ignored.join(", ")}.`
      );
    }
  }
}
let _idCounter = 0;
const _ArvoTextbox = class _ArvoTextbox {
  constructor(element, options) {
    this._inputEl = null;
    this._fieldEl = null;
    this._actionsEl = null;
    this._borderEl = null;
    this._labelEl = null;
    this._counterEl = null;
    this._clearEl = null;
    this._clearBtn = null;
    this._errIcoEl = null;
    this._errIcoConnector = null;
    this._errMsgAlert = null;
    this._inlineAlert = null;
    this._inlineAlertEl = null;
    this._icoEl = null;
    this._prefixEl = null;
    this._prefixSepEl = null;
    this._suffixEl = null;
    this._prefixConnector = null;
    this._suffixConnector = null;
    this._resizeObserver = null;
    this._previousValue = "";
    this._inputId = "";
    this._errorId = "";
    this._pwToggleEl = null;
    this._pwToggleBtn = null;
    this._isPasswordVisible = false;
    this._element = element;
    const size = (options == null ? void 0 : options.size) && _ArvoTextbox.SIZES.includes(options.size) ? options.size : _ArvoTextbox.DEFAULTS.size;
    const surface = (options == null ? void 0 : options.surface) && _ArvoTextbox.SURFACES.includes(options.surface) ? options.surface : _ArvoTextbox.DEFAULTS.surface;
    const type = (options == null ? void 0 : options.type) && _ArvoTextbox.TYPES.includes(options.type) ? options.type : _ArvoTextbox.DEFAULTS.type;
    warnTypeConflicts(type, options);
    const isPassword = type === "password";
    const resolvedIcon = resolveLeadingIcon(type, (options == null ? void 0 : options.icon) ?? null);
    const resolvedPrefix = isPassword ? null : (options == null ? void 0 : options.prefix) ?? null;
    const resolvedPrefixTooltip = isPassword ? null : (options == null ? void 0 : options.prefixTooltip) ?? null;
    const resolvedSuffix = isPassword ? null : (options == null ? void 0 : options.suffix) ?? null;
    const resolvedSuffixTooltip = isPassword ? null : (options == null ? void 0 : options.suffixTooltip) ?? null;
    const resolvedClearable = isPassword ? false : (options == null ? void 0 : options.isClearable) ?? _ArvoTextbox.DEFAULTS.isClearable;
    this._options = {
      ..._ArvoTextbox.DEFAULTS,
      ...options,
      size,
      surface,
      type,
      isClearable: resolvedClearable,
      label: (options == null ? void 0 : options.label) ?? null,
      contextHelp: (options == null ? void 0 : options.contextHelp) ?? null,
      errorMsg: (options == null ? void 0 : options.errorMsg) ?? null,
      icon: resolvedIcon,
      prefix: resolvedPrefix,
      prefixTooltip: resolvedPrefixTooltip,
      suffix: resolvedSuffix,
      suffixTooltip: resolvedSuffixTooltip,
      maxLength: (options == null ? void 0 : options.maxLength) ?? null,
      width: (options == null ? void 0 : options.width) ?? null,
      isPasswordVisible: (options == null ? void 0 : options.isPasswordVisible) ?? _ArvoTextbox.DEFAULTS.isPasswordVisible,
      onInput: (options == null ? void 0 : options.onInput) ?? null,
      onChange: (options == null ? void 0 : options.onChange) ?? null,
      onFocus: (options == null ? void 0 : options.onFocus) ?? null,
      onBlur: (options == null ? void 0 : options.onBlur) ?? null,
      onKeyDown: (options == null ? void 0 : options.onKeyDown) ?? null
    };
    this._isPasswordVisible = isPassword ? this._options.isPasswordVisible : false;
    this._previousValue = this._options.value;
    this._boundHandleInput = this._handleInput.bind(this);
    this._boundHandleChange = this._handleChange.bind(this);
    this._boundHandleFocus = this._handleFocus.bind(this);
    this._boundHandleBlur = this._handleBlur.bind(this);
    this._boundHandleKeydown = this._handleKeydown.bind(this);
    this._boundHandleClearClick = this._handleClear.bind(this);
    this._boundHandleAffixMouseDown = this._handleAffixMouseDown.bind(this);
    this._boundHandlePwToggleClick = this._handlePwToggleClick.bind(this);
    this._render();
    this._bindEvents();
  }
  static initialize(element, options) {
    return new _ArvoTextbox(element, options);
  }
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    const uid = ++_idCounter;
    this._inputId = `arvo-textbox-${uid}`;
    this._errorId = `arvo-textbox-err-${uid}`;
    const {
      size,
      surface,
      isFullWidth,
      width,
      label,
      contextHelp,
      isRequired,
      icon,
      prefix,
      prefixTooltip,
      suffix,
      suffixTooltip,
      type,
      value,
      placeholder,
      isDisabled,
      isReadOnly,
      maxLength,
      isClearable,
      errorDisplay,
      hasCounter,
      isInvalid,
      errorMsg,
      isLoading
    } = this._options;
    const useTooltipError = errorDisplay === "tooltip";
    const useInlineAlert = errorDisplay === "inline";
    const hasPrefix = typeof prefix === "string" && prefix.length > 0;
    const hasSuffix = typeof suffix === "string" && suffix.length > 0;
    el.classList.add("arvo-textbox", `arvo-textbox--${size}`, `arvo-textbox--surface-${surface}`);
    el.setAttribute("role", "group");
    if (isFullWidth) el.classList.add("arvo-textbox--full-width");
    if (hasPrefix) el.classList.add("arvo-textbox--has-prefix");
    if (hasSuffix) el.classList.add("arvo-textbox--has-suffix");
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
      this._labelEl.classList.add("arvo-textbox__lbl");
      el.appendChild(this._labelEl);
    }
    this._fieldEl = document.createElement("div");
    this._fieldEl.className = "arvo-textbox__field";
    if (icon) {
      this._icoEl = document.createElement("i");
      this._icoEl.className = `arvo-textbox__ico o9con o9con-${icon}`;
      this._icoEl.setAttribute("aria-hidden", "true");
      this._fieldEl.appendChild(this._icoEl);
    }
    if (hasPrefix) {
      this._prefixEl = document.createElement("span");
      this._prefixEl.className = "arvo-textbox__prefix";
      this._prefixEl.setAttribute("aria-hidden", "true");
      this._prefixEl.textContent = prefix;
      this._fieldEl.appendChild(this._prefixEl);
      this._prefixSepEl = document.createElement("span");
      this._prefixSepEl.className = "arvo-textbox__prefix-sep";
      this._prefixSepEl.setAttribute("aria-hidden", "true");
      this._fieldEl.appendChild(this._prefixSepEl);
      if (prefixTooltip) {
        this._prefixConnector = core.connectTooltip(core.tooltipManager, {
          anchor: this._prefixEl,
          content: prefixTooltip
        });
      }
    }
    this._inputEl = document.createElement("input");
    this._inputEl.className = "arvo-textbox__input";
    this._inputEl.id = this._inputId;
    this._inputEl.type = type === "password" && this._isPasswordVisible ? "text" : type;
    this._inputEl.value = value;
    if (placeholder) this._inputEl.placeholder = placeholder;
    this._inputEl.disabled = isDisabled;
    this._inputEl.readOnly = isReadOnly;
    this._inputEl.required = isRequired;
    if (maxLength !== null) this._inputEl.maxLength = maxLength;
    this._fieldEl.appendChild(this._inputEl);
    this._actionsEl = document.createElement("div");
    this._actionsEl.className = "arvo-textbox__actions";
    if (isClearable) {
      this._clearEl = document.createElement("button");
      this._clearBtn = IconButton.ArvoIconButton.initialize(this._clearEl, {
        size: "xs",
        variant: "tertiary",
        icon: "close",
        tooltip: "Clear",
        isDisabled: isDisabled || isLoading
      });
      this._clearEl.setAttribute("aria-label", "Clear");
      this._clearEl.classList.add("arvo-textbox__clear");
      this._actionsEl.appendChild(this._clearEl);
    }
    if (type === "password") {
      const visibleLabel = this._isPasswordVisible ? "Hide password" : "Show password";
      this._pwToggleEl = document.createElement("button");
      this._pwToggleBtn = IconButton.ArvoIconButton.initialize(this._pwToggleEl, {
        size: "sm",
        variant: "tertiary",
        icon: this._isPasswordVisible ? "eye-slash" : "eye",
        tooltip: visibleLabel,
        isDisabled: isDisabled || isLoading
      });
      this._pwToggleEl.setAttribute("aria-label", visibleLabel);
      this._pwToggleEl.setAttribute("aria-pressed", this._isPasswordVisible ? "true" : "false");
      this._pwToggleEl.classList.add("arvo-textbox__pw-toggle");
      this._actionsEl.appendChild(this._pwToggleEl);
    }
    if (useTooltipError) {
      const tooltip = errorMsg ?? MessageAlert.ARVO_MSG_ALERT_DEFAULT_ERROR;
      this._errMsgAlert = MessageAlert.ArvoMessageAlert.initialize(document.createElement("div"), {
        type: "negative",
        isInline: true,
        message: tooltip
      });
      this._errIcoEl = this._errMsgAlert.el;
      this._errIcoEl.classList.add("arvo-textbox__err-ico");
      this._errIcoConnector = core.connectTooltip(core.tooltipManager, {
        anchor: this._errIcoEl,
        content: tooltip
      });
      this._actionsEl.appendChild(this._errIcoEl);
    }
    this._fieldEl.appendChild(this._actionsEl);
    if (hasSuffix) {
      this._suffixEl = document.createElement("span");
      this._suffixEl.className = "arvo-textbox__suffix";
      this._suffixEl.setAttribute("aria-hidden", "true");
      this._suffixEl.textContent = suffix;
      this._fieldEl.appendChild(this._suffixEl);
      if (suffixTooltip) {
        this._suffixConnector = core.connectTooltip(core.tooltipManager, {
          anchor: this._suffixEl,
          content: suffixTooltip
        });
      }
    }
    this._borderEl = document.createElement("div");
    this._borderEl.className = "arvo-textbox__border";
    this._fieldEl.appendChild(this._borderEl);
    el.appendChild(this._fieldEl);
    this._resizeObserver = new ResizeObserver(() => {
      this._updatePadding();
    });
    this._resizeObserver.observe(this._actionsEl);
    this._updatePadding();
    if (hasCounter) {
      this._counterEl = utils.createCharCounter({ maxLength });
      this._counterEl.classList.add("arvo-textbox__counter");
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
      this._inputEl.setAttribute("aria-invalid", "true");
      if (useInlineAlert) this._inputEl.setAttribute("aria-describedby", this._errorId);
    }
    if (isRequired) this._inputEl.setAttribute("aria-required", "true");
    if (isLoading) el.setAttribute("aria-busy", "true");
    if (isInvalid && useInlineAlert && this._inlineAlertEl) {
      this._inlineAlertEl.style.display = "";
      if (this._counterEl) this._counterEl.style.display = "none";
    }
  }
  _updatePadding() {
    if (!this._actionsEl || !this._fieldEl) return;
    const w = this._actionsEl.offsetWidth;
    const pad = w > 0 ? w + 4 : 0;
    this._fieldEl.style.setProperty("--arvo-form-input-pad-r", `${pad}px`);
  }
  _bindEvents() {
    const input = this._inputEl;
    if (!input) return;
    input.addEventListener("input", this._boundHandleInput);
    input.addEventListener("change", this._boundHandleChange);
    input.addEventListener("focus", this._boundHandleFocus);
    input.addEventListener("blur", this._boundHandleBlur);
    input.addEventListener("keydown", this._boundHandleKeydown);
    if (this._clearEl) {
      this._clearEl.addEventListener("click", this._boundHandleClearClick);
    }
    if (this._pwToggleEl) {
      this._pwToggleEl.addEventListener("click", this._boundHandlePwToggleClick);
    }
    if (this._icoEl) {
      this._icoEl.addEventListener("mousedown", this._boundHandleAffixMouseDown);
    }
    if (this._prefixEl) {
      this._prefixEl.addEventListener("mousedown", this._boundHandleAffixMouseDown);
    }
    if (this._suffixEl) {
      this._suffixEl.addEventListener("mousedown", this._boundHandleAffixMouseDown);
    }
  }
  _handleInput(event) {
    var _a, _b, _c, _d;
    if (this._options.isDisabled || this._options.isLoading) return;
    const value = ((_a = this._inputEl) == null ? void 0 : _a.value) ?? "";
    (_b = this._element) == null ? void 0 : _b.classList.toggle("has-value", value.length > 0);
    if (this._counterEl) {
      utils.updateCharCounter(this._counterEl, value.length, this._options.maxLength);
    }
    (_d = (_c = this._options).onInput) == null ? void 0 : _d.call(_c, event);
  }
  _handleChange(event) {
    var _a, _b, _c;
    if (this._options.isDisabled || this._options.isLoading) return;
    const value = ((_a = this._inputEl) == null ? void 0 : _a.value) ?? "";
    const previousValue = this._previousValue;
    this._previousValue = value;
    this._dispatchEvent("textbox:change", { value, previousValue });
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
    if (event.key === "Escape" && this._options.isClearable) {
      const value = ((_a = this._inputEl) == null ? void 0 : _a.value) ?? "";
      if (value.length > 0) {
        this.clear();
        return;
      }
    }
    (_c = (_b = this._options).onKeyDown) == null ? void 0 : _c.call(_b, event);
  }
  _handleClear() {
    var _a;
    this.clear();
    (_a = this._inputEl) == null ? void 0 : _a.focus();
  }
  _handlePwToggleClick(event) {
    if (this._options.isDisabled || this._options.isLoading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.passwordVisible(!this._isPasswordVisible);
  }
  _handleAffixMouseDown(event) {
    var _a;
    event.preventDefault();
    (_a = this._inputEl) == null ? void 0 : _a.focus();
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
      return ((_a = this._inputEl) == null ? void 0 : _a.value) ?? this._options.value;
    }
    const previousValue = this._previousValue;
    this._previousValue = newValue;
    this._options.value = newValue;
    if (this._inputEl) {
      this._inputEl.value = newValue;
    }
    (_b = this._element) == null ? void 0 : _b.classList.toggle("has-value", newValue.length > 0);
    if (this._counterEl) {
      utils.updateCharCounter(this._counterEl, newValue.length, this._options.maxLength);
    }
    this._dispatchEvent("textbox:change", { value: newValue, previousValue });
  }
  clear() {
    this._dispatchEvent("textbox:clear", {});
    this.value("");
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
    const type = this._options.type;
    if (value.length > 0) {
      if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push("Enter a valid email address");
      } else if (type === "url" && !/^https?:\/\/.+/.test(value)) {
        errors.push("Enter a valid URL");
      }
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
      if (this._inputEl) {
        this._inputEl.removeAttribute("aria-invalid");
        this._inputEl.removeAttribute("aria-describedby");
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
    if (this._inputEl) {
      this._inputEl.setAttribute("aria-invalid", "true");
      if (useInlineAlert) {
        this._inputEl.setAttribute("aria-describedby", this._errorId);
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
      (_a = this._inputEl) == null ? void 0 : _a.focus();
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
  passwordVisible(value) {
    if (value === void 0) {
      return this._isPasswordVisible;
    }
    if (this._options.type !== "password") return;
    const next = !!value;
    if (next === this._isPasswordVisible) return;
    this._isPasswordVisible = next;
    this._options.isPasswordVisible = next;
    if (this._inputEl) {
      this._inputEl.type = next ? "text" : "password";
    }
    if (this._pwToggleBtn && this._pwToggleEl) {
      const label = next ? "Hide password" : "Show password";
      this._pwToggleBtn.setIcon(next ? "eye-slash" : "eye");
      this._pwToggleBtn.setTooltip(label);
      this._pwToggleEl.setAttribute("aria-label", label);
      this._pwToggleEl.setAttribute("aria-pressed", next ? "true" : "false");
    }
    this._dispatchEvent("textbox:password-visibility", { visible: next });
  }
  disabled(state) {
    var _a, _b, _c, _d, _e, _f;
    if (state === void 0) {
      return this._options.isDisabled;
    }
    this._options.isDisabled = state;
    if (state) {
      (_a = this._element) == null ? void 0 : _a.classList.add("is-disabled");
      if (this._inputEl) this._inputEl.disabled = true;
      (_b = this._clearBtn) == null ? void 0 : _b.disabled(true);
      (_c = this._pwToggleBtn) == null ? void 0 : _c.disabled(true);
    } else {
      (_d = this._element) == null ? void 0 : _d.classList.remove("is-disabled");
      if (this._inputEl) this._inputEl.disabled = false;
      (_e = this._clearBtn) == null ? void 0 : _e.disabled(false);
      (_f = this._pwToggleBtn) == null ? void 0 : _f.disabled(false);
    }
  }
  icon(name) {
    if (name === void 0) return this._options.icon;
    if (this._options.type === "url" || this._options.type === "email" || this._options.type === "password") {
      return;
    }
    this._options.icon = name && name.length > 0 ? name : null;
    const next = this._options.icon;
    if (next) {
      if (this._icoEl) {
        this._icoEl.className = `arvo-textbox__ico o9con o9con-${next}`;
      } else if (this._fieldEl) {
        this._icoEl = document.createElement("i");
        this._icoEl.className = `arvo-textbox__ico o9con o9con-${next}`;
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
    if (this._options.type === "password") return;
    const next = value && value.length > 0 ? value : null;
    this._options.prefix = next;
    const el = this._element;
    if (next) {
      el == null ? void 0 : el.classList.add("arvo-textbox--has-prefix");
      if (this._prefixEl) {
        this._prefixEl.textContent = next;
      } else if (this._fieldEl) {
        const anchor = this._icoEl ? this._icoEl.nextSibling : this._fieldEl.firstChild;
        this._prefixEl = document.createElement("span");
        this._prefixEl.className = "arvo-textbox__prefix";
        this._prefixEl.setAttribute("aria-hidden", "true");
        this._prefixEl.textContent = next;
        this._prefixEl.addEventListener("mousedown", this._boundHandleAffixMouseDown);
        this._fieldEl.insertBefore(this._prefixEl, anchor);
        this._prefixSepEl = document.createElement("span");
        this._prefixSepEl.className = "arvo-textbox__prefix-sep";
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
      el == null ? void 0 : el.classList.remove("arvo-textbox--has-prefix");
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
  }
  suffix(value) {
    var _a;
    if (value === void 0) return this._options.suffix;
    if (this._options.type === "password") return;
    const next = value && value.length > 0 ? value : null;
    this._options.suffix = next;
    const el = this._element;
    if (next) {
      el == null ? void 0 : el.classList.add("arvo-textbox--has-suffix");
      if (this._suffixEl) {
        this._suffixEl.textContent = next;
      } else if (this._fieldEl) {
        this._suffixEl = document.createElement("span");
        this._suffixEl.className = "arvo-textbox__suffix";
        this._suffixEl.setAttribute("aria-hidden", "true");
        this._suffixEl.textContent = next;
        this._suffixEl.addEventListener("mousedown", this._boundHandleAffixMouseDown);
        this._fieldEl.insertBefore(this._suffixEl, this._borderEl);
      }
      if (this._options.suffixTooltip && !this._suffixConnector && this._suffixEl) {
        this._suffixConnector = core.connectTooltip(core.tooltipManager, {
          anchor: this._suffixEl,
          content: this._options.suffixTooltip
        });
      }
    } else {
      el == null ? void 0 : el.classList.remove("arvo-textbox--has-suffix");
      (_a = this._suffixConnector) == null ? void 0 : _a.destroy();
      this._suffixConnector = null;
      if (this._suffixEl) {
        this._suffixEl.removeEventListener("mousedown", this._boundHandleAffixMouseDown);
        this._suffixEl.remove();
        this._suffixEl = null;
      }
    }
  }
  setLoading(isLoading) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const wasFocused = document.activeElement === this._inputEl;
    this._options.isLoading = isLoading;
    if (isLoading) {
      (_a = this._element) == null ? void 0 : _a.classList.add("loading");
      (_b = this._element) == null ? void 0 : _b.setAttribute("aria-busy", "true");
      (_c = this._clearBtn) == null ? void 0 : _c.disabled(true);
      (_d = this._pwToggleBtn) == null ? void 0 : _d.disabled(true);
      if (wasFocused) {
        (_e = this._inputEl) == null ? void 0 : _e.blur();
      }
    } else {
      (_f = this._element) == null ? void 0 : _f.classList.remove("loading");
      (_g = this._element) == null ? void 0 : _g.removeAttribute("aria-busy");
      if (!this._options.isDisabled) {
        (_h = this._clearBtn) == null ? void 0 : _h.disabled(false);
        (_i = this._pwToggleBtn) == null ? void 0 : _i.disabled(false);
      }
    }
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
    const el = this._element;
    if (!el) return;
    (_a = this._resizeObserver) == null ? void 0 : _a.disconnect();
    this._resizeObserver = null;
    if (this._inputEl) {
      this._inputEl.removeEventListener("input", this._boundHandleInput);
      this._inputEl.removeEventListener("change", this._boundHandleChange);
      this._inputEl.removeEventListener("focus", this._boundHandleFocus);
      this._inputEl.removeEventListener("blur", this._boundHandleBlur);
      this._inputEl.removeEventListener("keydown", this._boundHandleKeydown);
    }
    (_b = this._inlineAlert) == null ? void 0 : _b.destroy();
    this._inlineAlert = null;
    (_c = this._errMsgAlert) == null ? void 0 : _c.destroy();
    this._errMsgAlert = null;
    (_d = this._clearBtn) == null ? void 0 : _d.destroy();
    (_e = this._pwToggleBtn) == null ? void 0 : _e.destroy();
    if (this._clearEl) {
      this._clearEl.removeEventListener("click", this._boundHandleClearClick);
    }
    if (this._pwToggleEl) {
      this._pwToggleEl.removeEventListener("click", this._boundHandlePwToggleClick);
    }
    if (this._icoEl) {
      this._icoEl.removeEventListener("mousedown", this._boundHandleAffixMouseDown);
    }
    if (this._prefixEl) {
      this._prefixEl.removeEventListener("mousedown", this._boundHandleAffixMouseDown);
    }
    if (this._suffixEl) {
      this._suffixEl.removeEventListener("mousedown", this._boundHandleAffixMouseDown);
    }
    (_f = this._prefixConnector) == null ? void 0 : _f.destroy();
    this._prefixConnector = null;
    (_g = this._suffixConnector) == null ? void 0 : _g.destroy();
    this._suffixConnector = null;
    el.classList.remove(
      "arvo-textbox",
      "arvo-textbox--full-width",
      "arvo-textbox--has-prefix",
      "arvo-textbox--has-suffix",
      "is-disabled",
      "is-readonly",
      "has-error",
      "error-tooltip",
      "loading",
      "has-value"
    );
    _ArvoTextbox.SIZES.forEach((s) => el.classList.remove(`arvo-textbox--${s}`));
    _ArvoTextbox.SURFACES.forEach((s) => el.classList.remove(`arvo-textbox--surface-${s}`));
    el.removeAttribute("aria-busy");
    el.removeAttribute("role");
    el.style.removeProperty("--arvo-form-input-width");
    (_h = this._labelEl) == null ? void 0 : _h.remove();
    (_i = this._counterEl) == null ? void 0 : _i.remove();
    (_j = this._inlineAlertEl) == null ? void 0 : _j.remove();
    (_k = this._actionsEl) == null ? void 0 : _k.remove();
    (_l = this._fieldEl) == null ? void 0 : _l.remove();
    this._element = null;
    this._inputEl = null;
    this._fieldEl = null;
    this._actionsEl = null;
    this._borderEl = null;
    this._labelEl = null;
    this._counterEl = null;
    this._clearEl = null;
    this._clearBtn = null;
    this._pwToggleEl = null;
    this._pwToggleBtn = null;
    (_m = this._errIcoConnector) == null ? void 0 : _m.destroy();
    this._errIcoConnector = null;
    this._errIcoEl = null;
    this._inlineAlertEl = null;
    this._icoEl = null;
    this._prefixEl = null;
    this._prefixSepEl = null;
    this._suffixEl = null;
  }
};
_ArvoTextbox.SIZES = ["sm", "lg"];
_ArvoTextbox.SURFACES = ["filled", "base"];
_ArvoTextbox.TYPES = ["text", "url", "password", "email"];
_ArvoTextbox.DEFAULTS = {
  value: "",
  placeholder: "",
  isDisabled: false,
  isReadOnly: false,
  label: null,
  contextHelp: null,
  isRequired: false,
  isInvalid: false,
  size: "lg",
  surface: "filled",
  type: "text",
  maxLength: null,
  hasCounter: false,
  errorMsg: null,
  errorDisplay: "inline",
  isClearable: false,
  isLoading: false,
  isFullWidth: false,
  width: null,
  icon: null,
  prefix: null,
  prefixTooltip: null,
  suffix: null,
  suffixTooltip: null,
  isPasswordVisible: false,
  onInput: null,
  onChange: null,
  onFocus: null,
  onBlur: null,
  onKeyDown: null
};
let ArvoTextbox = _ArvoTextbox;
exports.ArvoTextbox = ArvoTextbox;
//# sourceMappingURL=Textbox.cjs.map
