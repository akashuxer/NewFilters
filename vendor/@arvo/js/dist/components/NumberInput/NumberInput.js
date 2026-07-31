import { connectTooltip, tooltipManager } from "@arvo/core";
import { ArvoIconButton } from "../IconButton/IconButton.js";
import { ArvoMessageAlert, ARVO_MSG_ALERT_DEFAULT_ERROR } from "../MessageAlert/MessageAlert.js";
import { ArvoFormLabel } from "../FormLabel/FormLabel.js";
let _idCounter = 0;
function getStepPrecision(step) {
  const str = String(step);
  const dotIndex = str.indexOf(".");
  return dotIndex === -1 ? 0 : str.length - dotIndex - 1;
}
const _ArvoNumberInput = class _ArvoNumberInput {
  constructor(element, options) {
    this._inputEl = null;
    this._fieldEl = null;
    this._borderEl = null;
    this._labelEl = null;
    this._steppersEl = null;
    this._incrementBtn = null;
    this._decrementBtn = null;
    this._stepperSepEl = null;
    this._incrementBtnInstance = null;
    this._decrementBtnInstance = null;
    this._actionsEl = null;
    this._prefixEl = null;
    this._prefixSepEl = null;
    this._prefixConnector = null;
    this._suffixEl = null;
    this._suffixConnector = null;
    this._errIcoEl = null;
    this._errIcoConnector = null;
    this._errMsgAlert = null;
    this._inlineAlert = null;
    this._inlineAlertEl = null;
    this._resizeObserver = null;
    this._previousValue = null;
    this._inputId = "";
    this._errorId = "";
    this._repeatInterval = null;
    this._repeatTimeout = null;
    this._repeatAccelTimeout = null;
    this._element = element;
    const size = (options == null ? void 0 : options.size) && _ArvoNumberInput.SIZES.includes(options.size) ? options.size : _ArvoNumberInput.DEFAULTS.size;
    const surface = (options == null ? void 0 : options.surface) && _ArvoNumberInput.SURFACES.includes(options.surface) ? options.surface : _ArvoNumberInput.DEFAULTS.surface;
    this._options = {
      ..._ArvoNumberInput.DEFAULTS,
      ...options,
      size,
      surface,
      value: (options == null ? void 0 : options.value) ?? null,
      min: (options == null ? void 0 : options.min) ?? null,
      max: (options == null ? void 0 : options.max) ?? null,
      label: (options == null ? void 0 : options.label) ?? null,
      contextHelp: (options == null ? void 0 : options.contextHelp) ?? null,
      errorMsg: (options == null ? void 0 : options.errorMsg) ?? null,
      width: (options == null ? void 0 : options.width) ?? null,
      prefix: (options == null ? void 0 : options.prefix) ?? null,
      prefixTooltip: (options == null ? void 0 : options.prefixTooltip) ?? null,
      suffix: (options == null ? void 0 : options.suffix) ?? null,
      suffixTooltip: (options == null ? void 0 : options.suffixTooltip) ?? null,
      onInput: (options == null ? void 0 : options.onInput) ?? null,
      onChange: (options == null ? void 0 : options.onChange) ?? null,
      onFocus: (options == null ? void 0 : options.onFocus) ?? null,
      onBlur: (options == null ? void 0 : options.onBlur) ?? null
    };
    this._previousValue = this._options.value;
    this._boundHandleInput = this._handleInput.bind(this);
    this._boundHandleChange = this._handleChange.bind(this);
    this._boundHandleFocus = this._handleFocus.bind(this);
    this._boundHandleBlur = this._handleBlur.bind(this);
    this._boundHandleKeyDown = this._handleKeyDown.bind(this);
    this._boundHandlePaste = this._handlePaste.bind(this);
    this._boundHandleIncrementMouseDown = this._handleIncrementMouseDown.bind(this);
    this._boundHandleDecrementMouseDown = this._handleDecrementMouseDown.bind(this);
    this._boundHandleMouseUp = this._clearRepeat.bind(this);
    this._boundHandleMouseLeave = this._clearRepeat.bind(this);
    this._boundHandleIncrementTouchStart = this._handleIncrementTouchStart.bind(this);
    this._boundHandleDecrementTouchStart = this._handleDecrementTouchStart.bind(this);
    this._boundHandleTouchEnd = this._clearRepeat.bind(this);
    this._boundHandleAffixMouseDown = this._handleAffixMouseDown.bind(this);
    this._render();
    this._bindEvents();
  }
  static initialize(element, options) {
    return new _ArvoNumberInput(element, options);
  }
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    const uid = ++_idCounter;
    this._inputId = `arvo-number-input-${uid}`;
    this._errorId = `arvo-number-input-err-${uid}`;
    const {
      size,
      surface,
      isFullWidth,
      width,
      label,
      contextHelp,
      isRequired,
      value,
      placeholder,
      isDisabled,
      isReadOnly,
      errorDisplay,
      isInvalid,
      errorMsg,
      isLoading,
      min,
      max,
      step,
      prefix,
      prefixTooltip,
      suffix,
      suffixTooltip
    } = this._options;
    const useTooltipError = errorDisplay === "tooltip";
    const useInlineAlert = errorDisplay === "inline";
    const hasPrefix = typeof prefix === "string" && prefix.length > 0;
    const hasSuffix = typeof suffix === "string" && suffix.length > 0;
    el.classList.add("arvo-number-input", `arvo-number-input--${size}`, `arvo-number-input--surface-${surface}`);
    el.setAttribute("role", "group");
    if (isFullWidth) el.classList.add("arvo-number-input--full-width");
    if (hasPrefix) el.classList.add("arvo-number-input--has-prefix");
    if (hasSuffix) el.classList.add("arvo-number-input--has-suffix");
    const effectiveWidth = isFullWidth ? "100%" : width;
    if (effectiveWidth) {
      el.style.setProperty("--arvo-form-input-width", effectiveWidth);
    }
    if (label) {
      const lbl = ArvoFormLabel.initialize(null, {
        text: label,
        isRequired,
        for: this._inputId,
        contextHelp
      });
      this._labelEl = lbl.el;
      this._labelEl.classList.add("arvo-number-input__lbl");
      el.appendChild(this._labelEl);
    }
    this._fieldEl = document.createElement("div");
    this._fieldEl.className = "arvo-number-input__field";
    if (hasPrefix) {
      this._prefixEl = document.createElement("span");
      this._prefixEl.className = "arvo-number-input__prefix";
      this._prefixEl.setAttribute("aria-hidden", "true");
      this._prefixEl.textContent = prefix;
      this._fieldEl.appendChild(this._prefixEl);
      this._prefixSepEl = document.createElement("span");
      this._prefixSepEl.className = "arvo-number-input__prefix-sep";
      this._prefixSepEl.setAttribute("aria-hidden", "true");
      this._fieldEl.appendChild(this._prefixSepEl);
      if (prefixTooltip) {
        this._prefixConnector = connectTooltip(tooltipManager, {
          anchor: this._prefixEl,
          content: prefixTooltip
        });
      }
    }
    this._inputEl = document.createElement("input");
    this._inputEl.type = "number";
    this._inputEl.className = "arvo-number-input__input";
    this._inputEl.id = this._inputId;
    this._inputEl.setAttribute("role", "spinbutton");
    if (placeholder) this._inputEl.placeholder = placeholder;
    this._inputEl.disabled = isDisabled;
    this._inputEl.readOnly = isReadOnly;
    this._inputEl.required = isRequired;
    if (min !== null) {
      this._inputEl.min = String(min);
      this._inputEl.setAttribute("aria-valuemin", String(min));
    }
    if (max !== null) {
      this._inputEl.max = String(max);
      this._inputEl.setAttribute("aria-valuemax", String(max));
    }
    this._inputEl.step = String(step);
    if (value !== null) {
      const precision = getStepPrecision(step);
      this._inputEl.value = value.toFixed(precision);
      this._inputEl.setAttribute("aria-valuenow", String(value));
    } else {
      this._inputEl.value = "";
      this._inputEl.removeAttribute("aria-valuenow");
    }
    if (isRequired) this._inputEl.setAttribute("aria-required", "true");
    if (isInvalid) this._inputEl.setAttribute("aria-invalid", "true");
    this._fieldEl.appendChild(this._inputEl);
    if (hasSuffix) {
      this._suffixEl = document.createElement("span");
      this._suffixEl.className = "arvo-number-input__suffix";
      this._suffixEl.setAttribute("aria-hidden", "true");
      this._suffixEl.textContent = suffix;
      this._fieldEl.appendChild(this._suffixEl);
      if (suffixTooltip) {
        this._suffixConnector = connectTooltip(tooltipManager, {
          anchor: this._suffixEl,
          content: suffixTooltip
        });
      }
    }
    this._actionsEl = document.createElement("div");
    this._actionsEl.className = "arvo-number-input__actions";
    if (useTooltipError && isInvalid) {
      const tooltip = errorMsg ?? ARVO_MSG_ALERT_DEFAULT_ERROR;
      this._errMsgAlert = ArvoMessageAlert.initialize(document.createElement("div"), {
        type: "negative",
        isInline: true,
        message: tooltip
      });
      this._errIcoEl = this._errMsgAlert.el;
      this._errIcoEl.classList.add("arvo-number-input__err-ico");
      this._errIcoConnector = connectTooltip(tooltipManager, {
        anchor: this._errIcoEl,
        content: tooltip
      });
      this._actionsEl.appendChild(this._errIcoEl);
    }
    this._fieldEl.appendChild(this._actionsEl);
    if (!isReadOnly) {
      this._steppersEl = document.createElement("div");
      this._steppersEl.className = "arvo-number-input__steppers";
      this._incrementBtn = document.createElement("button");
      this._incrementBtnInstance = ArvoIconButton.initialize(this._incrementBtn, {
        size: "sm",
        variant: "tertiary",
        icon: "plus",
        isDisabled: isDisabled || isLoading
      });
      this._incrementBtn.setAttribute("aria-label", "Increment");
      this._incrementBtn.tabIndex = -1;
      this._incrementBtn.classList.add("arvo-number-input__increment-btn");
      this._stepperSepEl = document.createElement("span");
      this._stepperSepEl.className = "arvo-number-input__stepper-sep";
      this._stepperSepEl.setAttribute("aria-hidden", "true");
      this._decrementBtn = document.createElement("button");
      this._decrementBtnInstance = ArvoIconButton.initialize(this._decrementBtn, {
        size: "sm",
        variant: "tertiary",
        icon: "minus",
        isDisabled: isDisabled || isLoading
      });
      this._decrementBtn.setAttribute("aria-label", "Decrement");
      this._decrementBtn.tabIndex = -1;
      this._decrementBtn.classList.add("arvo-number-input__decrement-btn");
      this._steppersEl.appendChild(this._incrementBtn);
      this._steppersEl.appendChild(this._stepperSepEl);
      this._steppersEl.appendChild(this._decrementBtn);
      this._fieldEl.appendChild(this._steppersEl);
    }
    this._borderEl = document.createElement("div");
    this._borderEl.className = "arvo-number-input__border";
    this._fieldEl.appendChild(this._borderEl);
    el.appendChild(this._fieldEl);
    this._resizeObserver = new ResizeObserver(() => {
      this._updatePadding();
    });
    this._resizeObserver.observe(this._actionsEl);
    this._updatePadding();
    if (useInlineAlert) {
      const message = errorMsg ?? ARVO_MSG_ALERT_DEFAULT_ERROR;
      this._inlineAlert = ArvoMessageAlert.initialize(document.createElement("div"), {
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
    if (isLoading) el.setAttribute("aria-busy", "true");
    if (isInvalid && useInlineAlert) {
      this._inputEl.setAttribute("aria-describedby", this._errorId);
    }
    if (isInvalid && useInlineAlert && this._inlineAlertEl) {
      this._inlineAlertEl.style.display = "";
    }
    this._updateMinMaxClasses(value);
  }
  _bindEvents() {
    const input = this._inputEl;
    if (!input) return;
    input.addEventListener("input", this._boundHandleInput);
    input.addEventListener("change", this._boundHandleChange);
    input.addEventListener("focus", this._boundHandleFocus);
    input.addEventListener("blur", this._boundHandleBlur);
    input.addEventListener("keydown", this._boundHandleKeyDown);
    input.addEventListener("paste", this._boundHandlePaste);
    if (this._incrementBtn) {
      this._incrementBtn.addEventListener("mousedown", this._boundHandleIncrementMouseDown);
      this._incrementBtn.addEventListener("mouseup", this._boundHandleMouseUp);
      this._incrementBtn.addEventListener("mouseleave", this._boundHandleMouseLeave);
      this._incrementBtn.addEventListener("touchstart", this._boundHandleIncrementTouchStart);
      this._incrementBtn.addEventListener("touchend", this._boundHandleTouchEnd);
    }
    if (this._decrementBtn) {
      this._decrementBtn.addEventListener("mousedown", this._boundHandleDecrementMouseDown);
      this._decrementBtn.addEventListener("mouseup", this._boundHandleMouseUp);
      this._decrementBtn.addEventListener("mouseleave", this._boundHandleMouseLeave);
      this._decrementBtn.addEventListener("touchstart", this._boundHandleDecrementTouchStart);
      this._decrementBtn.addEventListener("touchend", this._boundHandleTouchEnd);
    }
    if (this._prefixEl) {
      this._prefixEl.addEventListener("mousedown", this._boundHandleAffixMouseDown);
    }
    if (this._suffixEl) {
      this._suffixEl.addEventListener("mousedown", this._boundHandleAffixMouseDown);
    }
  }
  _handleInput(event) {
    var _a, _b, _c, _d, _e;
    if (this._options.isDisabled || this._options.isLoading) return;
    const raw = ((_a = this._inputEl) == null ? void 0 : _a.value) ?? "";
    const parsed = raw === "" ? null : parseFloat(raw);
    this._updateMinMaxClasses(parsed);
    if (parsed !== null) {
      (_b = this._inputEl) == null ? void 0 : _b.setAttribute("aria-valuenow", String(parsed));
    } else {
      (_c = this._inputEl) == null ? void 0 : _c.removeAttribute("aria-valuenow");
    }
    (_e = (_d = this._options).onInput) == null ? void 0 : _e.call(_d, event);
  }
  _handleChange(event) {
    var _a, _b;
    if (this._options.isDisabled || this._options.isLoading) return;
    const previousValue = this._previousValue;
    const newValue = this.value();
    this._previousValue = newValue;
    this._options.value = newValue;
    this._dispatchEvent("number-input:change", { value: newValue, previousValue });
    (_b = (_a = this._options).onChange) == null ? void 0 : _b.call(
      _a,
      { value: newValue, previousValue, source: "input" },
      event
    );
  }
  _handleFocus(event) {
    var _a, _b;
    (_b = (_a = this._options).onFocus) == null ? void 0 : _b.call(_a, event);
  }
  _handleBlur(event) {
    var _a, _b, _c, _d, _e;
    if (!this._options.isDisabled && !this._options.isLoading && !this._options.isReadOnly) {
      const raw = ((_a = this._inputEl) == null ? void 0 : _a.value) ?? "";
      if (raw !== "") {
        const parsed = parseFloat(raw);
        if (!isNaN(parsed)) {
          const clamped = this._clamp(parsed);
          const precision = getStepPrecision(this._options.step);
          const formatted = parseFloat(clamped.toFixed(precision));
          if (formatted !== parsed || raw !== clamped.toFixed(precision)) {
            const previousValue = this._previousValue;
            this._previousValue = formatted;
            this._options.value = formatted;
            if (this._inputEl) {
              this._inputEl.value = clamped.toFixed(precision);
              this._inputEl.setAttribute("aria-valuenow", String(formatted));
            }
            this._updateMinMaxClasses(formatted);
            this._dispatchEvent("number-input:change", { value: formatted, previousValue });
            (_c = (_b = this._options).onChange) == null ? void 0 : _c.call(
              _b,
              { value: formatted, previousValue, source: "blur" },
              null
            );
          }
        }
      }
    }
    (_e = (_d = this._options).onBlur) == null ? void 0 : _e.call(_d, event);
  }
  _handlePaste(event) {
    var _a, _b, _c;
    if (this._options.isDisabled || this._options.isLoading || this._options.isReadOnly) return;
    const text = ((_a = event.clipboardData) == null ? void 0 : _a.getData("text/plain")) ?? "";
    const parsed = parseFloat(text);
    if (isNaN(parsed)) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    const clamped = this._clamp(parsed);
    const precision = getStepPrecision(this._options.step);
    const formatted = parseFloat(clamped.toFixed(precision));
    const previousValue = this._previousValue;
    this._previousValue = formatted;
    this._options.value = formatted;
    if (this._inputEl) {
      this._inputEl.value = clamped.toFixed(precision);
      this._inputEl.setAttribute("aria-valuenow", String(formatted));
    }
    this._updateMinMaxClasses(formatted);
    this._dispatchEvent("number-input:change", { value: formatted, previousValue });
    (_c = (_b = this._options).onChange) == null ? void 0 : _c.call(
      _b,
      { value: formatted, previousValue, source: "paste" },
      event
    );
  }
  _handleKeyDown(event) {
    if (this._options.isDisabled || this._options.isLoading || this._options.isReadOnly) return;
    const { min, max, step } = this._options;
    let handled = false;
    switch (event.key) {
      case "ArrowUp": {
        const multiplier = event.shiftKey ? 10 : 1;
        this._stepBy(step * multiplier);
        handled = true;
        break;
      }
      case "ArrowDown": {
        const multiplier = event.shiftKey ? 10 : 1;
        this._stepBy(-step * multiplier);
        handled = true;
        break;
      }
      case "Home":
        if (min !== null) {
          this._setValueAndNotify(min);
          handled = true;
        }
        break;
      case "End":
        if (max !== null) {
          this._setValueAndNotify(max);
          handled = true;
        }
        break;
    }
    if (handled) {
      event.preventDefault();
    }
  }
  _handleIncrementMouseDown(event) {
    if (event.button !== 0) return;
    if (this._options.isDisabled || this._options.isLoading || this._options.isReadOnly) return;
    event.preventDefault();
    this._startLongPress(true);
  }
  _handleDecrementMouseDown(event) {
    if (event.button !== 0) return;
    if (this._options.isDisabled || this._options.isLoading || this._options.isReadOnly) return;
    event.preventDefault();
    this._startLongPress(false);
  }
  _handleIncrementTouchStart(event) {
    event.preventDefault();
    if (this._options.isDisabled || this._options.isLoading || this._options.isReadOnly) return;
    this._startLongPress(true);
  }
  _handleDecrementTouchStart(event) {
    event.preventDefault();
    if (this._options.isDisabled || this._options.isLoading || this._options.isReadOnly) return;
    this._startLongPress(false);
  }
  _startLongPress(increment) {
    var _a;
    const step = increment ? this._options.step : -this._options.step;
    this._stepBy(step);
    (_a = this._inputEl) == null ? void 0 : _a.focus();
    let intervalMs = 200;
    const startRepeat = () => {
      this._repeatInterval = setInterval(() => {
        this._stepBy(step);
      }, intervalMs);
      this._repeatAccelTimeout = setTimeout(() => {
        if (this._repeatInterval !== null) {
          clearInterval(this._repeatInterval);
        }
        intervalMs = 50;
        this._repeatInterval = setInterval(() => {
          this._stepBy(step);
        }, intervalMs);
      }, 1e3);
    };
    this._repeatTimeout = setTimeout(startRepeat, 400);
  }
  _clearRepeat() {
    if (this._repeatTimeout !== null) {
      clearTimeout(this._repeatTimeout);
      this._repeatTimeout = null;
    }
    if (this._repeatAccelTimeout !== null) {
      clearTimeout(this._repeatAccelTimeout);
      this._repeatAccelTimeout = null;
    }
    if (this._repeatInterval !== null) {
      clearInterval(this._repeatInterval);
      this._repeatInterval = null;
    }
  }
  _stepBy(delta) {
    const { min, max } = this._options;
    const current = this.value();
    let next;
    if (current === null) {
      next = delta > 0 ? min ?? 0 : max ?? 0;
    } else {
      next = current + delta;
    }
    if (min !== null) next = Math.max(next, min);
    if (max !== null) next = Math.min(next, max);
    this._setValueAndNotify(next);
  }
  _setValueAndNotify(newValue, source = "step") {
    var _a, _b;
    const previousValue = this._previousValue;
    const precision = getStepPrecision(this._options.step);
    const clamped = this._clamp(newValue);
    const formatted = parseFloat(clamped.toFixed(precision));
    this._previousValue = formatted;
    this._options.value = formatted;
    if (this._inputEl) {
      this._inputEl.value = clamped.toFixed(precision);
      this._inputEl.setAttribute("aria-valuenow", String(formatted));
    }
    this._updateMinMaxClasses(formatted);
    this._dispatchEvent("number-input:change", { value: formatted, previousValue });
    (_b = (_a = this._options).onChange) == null ? void 0 : _b.call(
      _a,
      { value: formatted, previousValue, source },
      null
    );
  }
  _clamp(value) {
    const { min, max } = this._options;
    let v = value;
    if (min !== null) v = Math.max(v, min);
    if (max !== null) v = Math.min(v, max);
    return v;
  }
  _updatePadding() {
    var _a;
    if (!this._actionsEl || !this._fieldEl) return;
    const w = this._actionsEl.offsetWidth;
    const pad = w > 0 ? w + 4 : 0;
    this._fieldEl.style.setProperty("--arvo-form-input-pad-r", `${pad}px`);
    const steppersWidth = ((_a = this._steppersEl) == null ? void 0 : _a.offsetWidth) ?? 0;
    this._actionsEl.style.setProperty("inset-inline-end", `${steppersWidth}px`);
  }
  _handleAffixMouseDown(event) {
    var _a;
    event.preventDefault();
    (_a = this._inputEl) == null ? void 0 : _a.focus();
  }
  _updateMinMaxClasses(value) {
    var _a, _b, _c, _d;
    const el = this._element;
    if (!el) return;
    const { min, max } = this._options;
    if (min !== null && value !== null && value <= min) {
      el.classList.add("at-min");
      (_a = this._decrementBtn) == null ? void 0 : _a.setAttribute("aria-disabled", "true");
    } else {
      el.classList.remove("at-min");
      (_b = this._decrementBtn) == null ? void 0 : _b.removeAttribute("aria-disabled");
    }
    if (max !== null && value !== null && value >= max) {
      el.classList.add("at-max");
      (_c = this._incrementBtn) == null ? void 0 : _c.setAttribute("aria-disabled", "true");
    } else {
      el.classList.remove("at-max");
      (_d = this._incrementBtn) == null ? void 0 : _d.removeAttribute("aria-disabled");
    }
  }
  _dispatchEvent(name, detail) {
    var _a;
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(name, { bubbles: true, cancelable: true, detail })
    );
  }
  value(newValue) {
    var _a;
    if (newValue === void 0) {
      const raw = ((_a = this._inputEl) == null ? void 0 : _a.value) ?? "";
      if (raw === "") return null;
      const parsed = parseFloat(raw);
      return isNaN(parsed) ? null : parsed;
    }
    if (newValue === null || isNaN(newValue)) {
      this.clear();
      return;
    }
    const precision = getStepPrecision(this._options.step);
    const clamped = this._clamp(newValue);
    const formatted = parseFloat(clamped.toFixed(precision));
    const previousValue = this._previousValue;
    this._previousValue = formatted;
    this._options.value = formatted;
    if (this._inputEl) {
      this._inputEl.value = clamped.toFixed(precision);
      this._inputEl.setAttribute("aria-valuenow", String(formatted));
    }
    this._updateMinMaxClasses(formatted);
    this._dispatchEvent("number-input:change", { value: formatted, previousValue });
  }
  clear() {
    var _a, _b, _c;
    const previousValue = this._previousValue;
    this._previousValue = null;
    this._options.value = null;
    if (this._inputEl) {
      this._inputEl.value = "";
      this._inputEl.removeAttribute("aria-valuenow");
    }
    (_a = this._element) == null ? void 0 : _a.classList.remove("at-min", "at-max");
    (_b = this._decrementBtn) == null ? void 0 : _b.removeAttribute("aria-disabled");
    (_c = this._incrementBtn) == null ? void 0 : _c.removeAttribute("aria-disabled");
    this._dispatchEvent("number-input:change", { value: null, previousValue });
  }
  validate() {
    const value = this.value();
    const errors = [];
    if (this._options.isRequired && value === null) {
      errors.push("This field is required");
    }
    if (value !== null) {
      if (this._options.min !== null && value < this._options.min) {
        errors.push(`Value must be at least ${this._options.min}`);
      }
      if (this._options.max !== null && value > this._options.max) {
        errors.push(`Value must be at most ${this._options.max}`);
      }
      if (this._options.step !== 1) {
        const remainder = (value - (this._options.min ?? 0)) % this._options.step;
        if (Math.abs(remainder) > 1e-10) {
          errors.push(`Value must be a multiple of ${this._options.step}`);
        }
      }
    }
    return { valid: errors.length === 0, errors };
  }
  setError(message) {
    var _a, _b, _c, _d, _e, _f, _g;
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
      if (this._errIcoEl) {
        this._errIcoEl.remove();
        (_b = this._errIcoConnector) == null ? void 0 : _b.destroy();
        this._errIcoConnector = null;
        (_c = this._errMsgAlert) == null ? void 0 : _c.destroy();
        this._errMsgAlert = null;
        this._errIcoEl = null;
        this._updatePadding();
      }
      if (this._inlineAlertEl) {
        this._inlineAlertEl.style.display = "none";
      }
      return;
    }
    const msg = message || ARVO_MSG_ALERT_DEFAULT_ERROR;
    this._options.isInvalid = true;
    this._options.errorMsg = msg;
    (_d = this._element) == null ? void 0 : _d.classList.add("has-error");
    if (this._inputEl) {
      this._inputEl.setAttribute("aria-invalid", "true");
      if (useInlineAlert) {
        this._inputEl.setAttribute("aria-describedby", this._errorId);
      }
    }
    if (useTooltipError) {
      if (!this._errIcoEl && this._actionsEl) {
        this._errMsgAlert = ArvoMessageAlert.initialize(document.createElement("div"), {
          type: "negative",
          isInline: true,
          message: msg
        });
        this._errIcoEl = this._errMsgAlert.el;
        this._errIcoEl.classList.add("arvo-number-input__err-ico");
        this._errIcoConnector = connectTooltip(tooltipManager, {
          anchor: this._errIcoEl,
          content: msg
        });
        this._actionsEl.appendChild(this._errIcoEl);
        this._updatePadding();
      } else if (this._errIcoEl) {
        (_e = this._errMsgAlert) == null ? void 0 : _e.message(msg);
        if (this._errIcoConnector) {
          this._errIcoConnector.update({ content: msg });
        }
      }
      (_f = this._element) == null ? void 0 : _f.classList.add("error-tooltip");
    }
    if (useInlineAlert && this._inlineAlertEl) {
      (_g = this._inlineAlert) == null ? void 0 : _g.message(msg);
      this._inlineAlertEl.style.display = "";
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
  suffix(value) {
    var _a;
    if (value === void 0) return this._options.suffix;
    const next = value && value.length > 0 ? value : null;
    this._options.suffix = next;
    const el = this._element;
    if (next) {
      el == null ? void 0 : el.classList.add("arvo-number-input--has-suffix");
      if (this._suffixEl) {
        this._suffixEl.textContent = next;
      } else if (this._fieldEl && this._inputEl) {
        this._suffixEl = document.createElement("span");
        this._suffixEl.className = "arvo-number-input__suffix";
        this._suffixEl.setAttribute("aria-hidden", "true");
        this._suffixEl.textContent = next;
        this._suffixEl.addEventListener("mousedown", this._boundHandleAffixMouseDown);
        this._fieldEl.insertBefore(this._suffixEl, this._inputEl.nextSibling);
      }
      if (this._options.suffixTooltip && !this._suffixConnector && this._suffixEl) {
        this._suffixConnector = connectTooltip(tooltipManager, {
          anchor: this._suffixEl,
          content: this._options.suffixTooltip
        });
      }
    } else {
      el == null ? void 0 : el.classList.remove("arvo-number-input--has-suffix");
      (_a = this._suffixConnector) == null ? void 0 : _a.destroy();
      this._suffixConnector = null;
      if (this._suffixEl) {
        this._suffixEl.removeEventListener("mousedown", this._boundHandleAffixMouseDown);
        this._suffixEl.remove();
        this._suffixEl = null;
      }
    }
  }
  suffixTooltip(text) {
    var _a;
    if (text === void 0) return this._options.suffixTooltip;
    this._options.suffixTooltip = text && text.length > 0 ? text : null;
    const next = this._options.suffixTooltip;
    if (next && this._suffixEl) {
      if (this._suffixConnector) {
        this._suffixConnector.update({ content: next });
      } else {
        this._suffixConnector = connectTooltip(tooltipManager, {
          anchor: this._suffixEl,
          content: next
        });
      }
    } else {
      (_a = this._suffixConnector) == null ? void 0 : _a.destroy();
      this._suffixConnector = null;
    }
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
      (_b = this._incrementBtnInstance) == null ? void 0 : _b.disabled(true);
      (_c = this._decrementBtnInstance) == null ? void 0 : _c.disabled(true);
    } else {
      (_d = this._element) == null ? void 0 : _d.classList.remove("is-disabled");
      if (this._inputEl) this._inputEl.disabled = false;
      (_e = this._incrementBtnInstance) == null ? void 0 : _e.disabled(false);
      (_f = this._decrementBtnInstance) == null ? void 0 : _f.disabled(false);
    }
  }
  setLoading(isLoading) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const wasFocused = document.activeElement === this._inputEl;
    this._options.isLoading = isLoading;
    if (isLoading) {
      (_a = this._element) == null ? void 0 : _a.classList.add("loading");
      (_b = this._element) == null ? void 0 : _b.setAttribute("aria-busy", "true");
      (_c = this._incrementBtnInstance) == null ? void 0 : _c.disabled(true);
      (_d = this._decrementBtnInstance) == null ? void 0 : _d.disabled(true);
      if (wasFocused) {
        (_e = this._inputEl) == null ? void 0 : _e.blur();
      }
    } else {
      (_f = this._element) == null ? void 0 : _f.classList.remove("loading");
      (_g = this._element) == null ? void 0 : _g.removeAttribute("aria-busy");
      if (!this._options.isDisabled) {
        (_h = this._incrementBtnInstance) == null ? void 0 : _h.disabled(false);
        (_i = this._decrementBtnInstance) == null ? void 0 : _i.disabled(false);
      }
    }
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
    const el = this._element;
    if (!el) return;
    this._clearRepeat();
    (_a = this._resizeObserver) == null ? void 0 : _a.disconnect();
    this._resizeObserver = null;
    (_b = this._prefixConnector) == null ? void 0 : _b.destroy();
    this._prefixConnector = null;
    if (this._prefixEl) {
      this._prefixEl.removeEventListener("mousedown", this._boundHandleAffixMouseDown);
    }
    (_c = this._suffixConnector) == null ? void 0 : _c.destroy();
    this._suffixConnector = null;
    if (this._suffixEl) {
      this._suffixEl.removeEventListener("mousedown", this._boundHandleAffixMouseDown);
    }
    (_d = this._inlineAlert) == null ? void 0 : _d.destroy();
    this._inlineAlert = null;
    (_e = this._errMsgAlert) == null ? void 0 : _e.destroy();
    this._errMsgAlert = null;
    (_f = this._incrementBtnInstance) == null ? void 0 : _f.destroy();
    (_g = this._decrementBtnInstance) == null ? void 0 : _g.destroy();
    if (this._inputEl) {
      this._inputEl.removeEventListener("input", this._boundHandleInput);
      this._inputEl.removeEventListener("change", this._boundHandleChange);
      this._inputEl.removeEventListener("focus", this._boundHandleFocus);
      this._inputEl.removeEventListener("blur", this._boundHandleBlur);
      this._inputEl.removeEventListener("keydown", this._boundHandleKeyDown);
      this._inputEl.removeEventListener("paste", this._boundHandlePaste);
    }
    if (this._incrementBtn) {
      this._incrementBtn.removeEventListener("mousedown", this._boundHandleIncrementMouseDown);
      this._incrementBtn.removeEventListener("mouseup", this._boundHandleMouseUp);
      this._incrementBtn.removeEventListener("mouseleave", this._boundHandleMouseLeave);
      this._incrementBtn.removeEventListener("touchstart", this._boundHandleIncrementTouchStart);
      this._incrementBtn.removeEventListener("touchend", this._boundHandleTouchEnd);
    }
    if (this._decrementBtn) {
      this._decrementBtn.removeEventListener("mousedown", this._boundHandleDecrementMouseDown);
      this._decrementBtn.removeEventListener("mouseup", this._boundHandleMouseUp);
      this._decrementBtn.removeEventListener("mouseleave", this._boundHandleMouseLeave);
      this._decrementBtn.removeEventListener("touchstart", this._boundHandleDecrementTouchStart);
      this._decrementBtn.removeEventListener("touchend", this._boundHandleTouchEnd);
    }
    el.classList.remove(
      "arvo-number-input",
      "arvo-number-input--full-width",
      "arvo-number-input--has-prefix",
      "arvo-number-input--has-suffix",
      "is-disabled",
      "is-readonly",
      "has-error",
      "error-tooltip",
      "loading",
      "at-min",
      "at-max"
    );
    _ArvoNumberInput.SIZES.forEach((s) => el.classList.remove(`arvo-number-input--${s}`));
    _ArvoNumberInput.SURFACES.forEach((s) => el.classList.remove(`arvo-number-input--surface-${s}`));
    el.removeAttribute("aria-busy");
    el.removeAttribute("role");
    el.style.removeProperty("--arvo-form-input-width");
    (_h = this._labelEl) == null ? void 0 : _h.remove();
    (_i = this._inlineAlertEl) == null ? void 0 : _i.remove();
    (_j = this._actionsEl) == null ? void 0 : _j.remove();
    (_k = this._errIcoEl) == null ? void 0 : _k.remove();
    (_l = this._prefixEl) == null ? void 0 : _l.remove();
    (_m = this._prefixSepEl) == null ? void 0 : _m.remove();
    (_n = this._suffixEl) == null ? void 0 : _n.remove();
    (_o = this._fieldEl) == null ? void 0 : _o.remove();
    (_p = this._borderEl) == null ? void 0 : _p.remove();
    this._element = null;
    this._inputEl = null;
    this._fieldEl = null;
    this._actionsEl = null;
    this._borderEl = null;
    this._labelEl = null;
    this._steppersEl = null;
    this._incrementBtn = null;
    this._decrementBtn = null;
    this._incrementBtnInstance = null;
    this._decrementBtnInstance = null;
    (_q = this._errIcoConnector) == null ? void 0 : _q.destroy();
    this._errIcoConnector = null;
    this._errIcoEl = null;
    this._inlineAlertEl = null;
    this._prefixEl = null;
    this._prefixSepEl = null;
    this._suffixEl = null;
  }
};
_ArvoNumberInput.SIZES = ["sm", "lg"];
_ArvoNumberInput.SURFACES = ["filled", "base"];
_ArvoNumberInput.DEFAULTS = {
  value: null,
  min: null,
  max: null,
  step: 1,
  placeholder: "",
  isDisabled: false,
  isReadOnly: false,
  label: null,
  contextHelp: null,
  isRequired: false,
  isInvalid: false,
  size: "lg",
  surface: "filled",
  errorMsg: null,
  errorDisplay: "inline",
  isLoading: false,
  isFullWidth: false,
  width: null,
  prefix: null,
  prefixTooltip: null,
  suffix: null,
  suffixTooltip: null,
  onInput: null,
  onChange: null,
  onFocus: null,
  onBlur: null
};
let ArvoNumberInput = _ArvoNumberInput;
export {
  ArvoNumberInput
};
//# sourceMappingURL=NumberInput.js.map
