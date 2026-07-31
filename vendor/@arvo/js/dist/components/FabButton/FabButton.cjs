"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const Button = require("../Button/Button.cjs");
const IconButton = require("../IconButton/IconButton.cjs");
const VALID_VARIANTS = ["primary", "secondary"];
const _ArvoFabButton = class _ArvoFabButton {
  constructor(element, options) {
    this._wrapperEl = null;
    this._buttonEl = null;
    this._innerButton = null;
    this._container = element;
    const variant = (options == null ? void 0 : options.variant) && VALID_VARIANTS.includes(options.variant) ? options.variant : _ArvoFabButton.DEFAULTS.variant;
    this._options = {
      ..._ArvoFabButton.DEFAULTS,
      ...options,
      variant,
      icon: (options == null ? void 0 : options.icon) ?? _ArvoFabButton.DEFAULTS.icon,
      label: (options == null ? void 0 : options.label) ?? _ArvoFabButton.DEFAULTS.label,
      tooltip: (options == null ? void 0 : options.tooltip) ?? null,
      onClick: (options == null ? void 0 : options.onClick) ?? null,
      onFocus: (options == null ? void 0 : options.onFocus) ?? null,
      onBlur: (options == null ? void 0 : options.onBlur) ?? null,
      zIndex: (options == null ? void 0 : options.zIndex) ?? null
    };
    this._render();
  }
  static initialize(element, options) {
    return new _ArvoFabButton(element, options);
  }
  _render() {
    if (!this._container) return;
    this._wrapperEl = document.createElement("div");
    this._applyWrapperClasses();
    this._applyZIndex();
    this._buttonEl = document.createElement("button");
    this._wrapperEl.appendChild(this._buttonEl);
    this._createInnerButton();
    this._container.appendChild(this._wrapperEl);
  }
  _applyWrapperClasses() {
    if (!this._wrapperEl) return;
    const isWithLabel = !!this._options.label;
    this._wrapperEl.className = [
      "arvo-fab-btn",
      `arvo-fab-btn--${this._options.variant}`,
      isWithLabel ? "arvo-fab-btn--with-label" : "arvo-fab-btn--icon-only",
      this._options.isDisabled ? "is-disabled" : "",
      this._options.isLoading ? "loading" : ""
    ].filter(Boolean).join(" ");
  }
  _applyZIndex() {
    if (!this._wrapperEl) return;
    if (this._options.zIndex !== null) {
      this._wrapperEl.style.zIndex = String(this._options.zIndex);
    } else {
      this._wrapperEl.style.removeProperty("z-index");
    }
  }
  _createInnerButton() {
    if (!this._buttonEl) return;
    if (this._options.label) {
      this._innerButton = new Button.ArvoButton(this._buttonEl, {
        variant: this._options.variant,
        size: "md",
        icon: this._options.icon,
        label: this._options.label,
        isDisabled: this._options.isDisabled,
        isLoading: this._options.isLoading,
        onClick: this._options.onClick ?? void 0
      });
    } else {
      this._innerButton = new IconButton.ArvoIconButton(this._buttonEl, {
        variant: this._options.variant,
        size: "lg",
        icon: this._options.icon,
        tooltip: this._options.tooltip ?? "",
        isDisabled: this._options.isDisabled,
        isLoading: this._options.isLoading,
        onClick: this._options.onClick ?? void 0
      });
    }
    if (this._options.onFocus) {
      this._buttonEl.addEventListener("focus", this._options.onFocus);
    }
    if (this._options.onBlur) {
      this._buttonEl.addEventListener("blur", this._options.onBlur);
    }
  }
  _destroyInnerButton() {
    var _a;
    if (this._buttonEl && this._options.onFocus) {
      this._buttonEl.removeEventListener("focus", this._options.onFocus);
    }
    if (this._buttonEl && this._options.onBlur) {
      this._buttonEl.removeEventListener("blur", this._options.onBlur);
    }
    (_a = this._innerButton) == null ? void 0 : _a.destroy();
    this._innerButton = null;
  }
  setVariant(variant) {
    if (!VALID_VARIANTS.includes(variant)) return;
    this._options.variant = variant;
    this._applyWrapperClasses();
    if (this._innerButton) {
      this._innerButton.setVariant(variant);
    }
    this._dispatchEvent("fab-btn:variant", { variant });
  }
  setIcon(iconName) {
    this._options.icon = iconName;
    if (this._innerButton) {
      this._innerButton.setIcon(iconName);
    }
  }
  setLabel(label) {
    var _a, _b;
    const wasWithLabel = !!this._options.label;
    const isWithLabel = !!label;
    this._options.label = label;
    if (wasWithLabel !== isWithLabel) {
      this._destroyInnerButton();
      (_a = this._buttonEl) == null ? void 0 : _a.remove();
      this._buttonEl = document.createElement("button");
      (_b = this._wrapperEl) == null ? void 0 : _b.appendChild(this._buttonEl);
      this._createInnerButton();
      this._applyWrapperClasses();
    } else if (isWithLabel && this._innerButton instanceof Button.ArvoButton) {
      this._innerButton.setLabel(label);
    }
  }
  setZIndex(zIndex) {
    this._options.zIndex = zIndex;
    this._applyZIndex();
  }
  disabled(state) {
    if (state === void 0) {
      return this._options.isDisabled;
    }
    this._options.isDisabled = state;
    this._applyWrapperClasses();
    if (this._innerButton) {
      this._innerButton.disabled(state);
    }
  }
  setLoading(isLoading) {
    this._options.isLoading = isLoading;
    this._applyWrapperClasses();
    if (this._innerButton) {
      this._innerButton.setLoading(isLoading);
    }
    if (this._wrapperEl) {
      if (isLoading) {
        this._wrapperEl.setAttribute("aria-busy", "true");
      } else {
        this._wrapperEl.removeAttribute("aria-busy");
      }
    }
  }
  focus() {
    if (this._buttonEl && !this._options.isLoading) {
      this._buttonEl.focus();
    }
  }
  destroy() {
    var _a, _b;
    this._destroyInnerButton();
    (_a = this._buttonEl) == null ? void 0 : _a.remove();
    this._buttonEl = null;
    (_b = this._wrapperEl) == null ? void 0 : _b.remove();
    this._wrapperEl = null;
    this._container = null;
  }
  _dispatchEvent(name, detail) {
    var _a;
    (_a = this._wrapperEl) == null ? void 0 : _a.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      cancelable: true,
      detail
    }));
  }
};
_ArvoFabButton.VARIANTS = VALID_VARIANTS;
_ArvoFabButton.DEFAULTS = {
  variant: "primary",
  icon: "plus",
  label: null,
  isDisabled: false,
  isLoading: false,
  zIndex: null,
  tooltip: null,
  onClick: null,
  onFocus: null,
  onBlur: null
};
let ArvoFabButton = _ArvoFabButton;
exports.ArvoFabButton = ArvoFabButton;
//# sourceMappingURL=FabButton.cjs.map
