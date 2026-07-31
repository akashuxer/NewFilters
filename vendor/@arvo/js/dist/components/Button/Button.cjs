"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const utils = require("@arvo/utils");
const Badge = require("../Badge/Badge.cjs");
const Status = require("../Status/Status.cjs");
function resolveButtonBadge(cfg, buttonVariant) {
  const placement = cfg.placement ?? "inline";
  const isPositioned = placement !== "inline";
  const variant = isPositioned ? "counter" : cfg.variant ?? "label";
  const counterMode = isPositioned ? "single" : cfg.counterMode;
  const semanticType = isPositioned ? cfg.semanticType ?? "neutral" : "neutral";
  const inlineAppearance = buttonVariant === "secondary" ? "filled" : "primary";
  return {
    ...cfg,
    placement,
    variant,
    counterMode,
    semanticType,
    size: "sm",
    appearance: isPositioned ? "filled" : inlineAppearance,
    colorMode: "semantic",
    hasBadgeIcon: false
  };
}
function resolveButtonStatus(cfg, buttonSize) {
  return {
    ...cfg,
    size: buttonSize,
    placement: cfg.placement ?? "top-right"
  };
}
const _ArvoButton = class _ArvoButton {
  constructor(element, options) {
    var _a;
    this._iconEl = null;
    this._labelEl = null;
    this._badgeEl = null;
    this._badgeInstance = null;
    this._statusEl = null;
    this._statusInstance = null;
    this._truncationTooltip = null;
    this._element = element;
    this._originalContent = ((_a = element.textContent) == null ? void 0 : _a.trim()) ?? "";
    const variant = (options == null ? void 0 : options.variant) && _ArvoButton.VARIANTS.includes(options.variant) ? options.variant : _ArvoButton.DEFAULTS.variant;
    const size = (options == null ? void 0 : options.size) && _ArvoButton.SIZES.includes(options.size) ? options.size : _ArvoButton.DEFAULTS.size;
    this._options = {
      ..._ArvoButton.DEFAULTS,
      ...options,
      variant,
      size,
      label: (options == null ? void 0 : options.label) ?? this._originalContent,
      icon: (options == null ? void 0 : options.icon) ?? null,
      onClick: (options == null ? void 0 : options.onClick) ?? null,
      onKeyDown: (options == null ? void 0 : options.onKeyDown) ?? null,
      badge: (options == null ? void 0 : options.badge) ?? null,
      status: (options == null ? void 0 : options.status) ?? null
    };
    this._boundHandleClick = this._handleClick.bind(this);
    this._boundHandleKeydown = this._handleKeydown.bind(this);
    this._render();
    this._bindEvents();
  }
  static initialize(element, options) {
    return new _ArvoButton(element, options);
  }
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    el.classList.add("arvo-btn");
    el.classList.add(`arvo-btn--${this._options.variant}`);
    el.classList.add(`arvo-btn--${this._options.size}`);
    el.setAttribute("type", this._options.type);
    if (this._options.isFullWidth) {
      el.classList.add("arvo-btn--full-width");
    }
    if (this._options.icon) {
      this._iconEl = this._createIconEl(this._options.icon);
      el.appendChild(this._iconEl);
    }
    this._labelEl = document.createElement("span");
    this._labelEl.className = "arvo-btn__lbl";
    this._labelEl.textContent = this._options.label;
    el.appendChild(this._labelEl);
    if (this._options.hasTruncationTooltip && this._options.label) {
      this._attachTruncationTooltip();
    }
    if (this._options.badge) {
      this._renderBadge(this._options.badge);
    }
    if (this._options.status) {
      this._renderStatus(this._options.status);
    }
    if (this._options.isDisabled) {
      el.disabled = true;
    }
    if (this._options.isSelected !== void 0) {
      const isOn = this._options.isSelected === true;
      el.setAttribute("aria-pressed", String(isOn));
      if (isOn) el.classList.add("active");
    }
    if (this._options.isLoading) {
      el.classList.add("loading");
      el.setAttribute("aria-busy", "true");
    }
  }
  _createIconEl(iconName) {
    const span = document.createElement("span");
    span.className = `arvo-btn__ico o9con o9con-${iconName}`;
    span.setAttribute("aria-hidden", "true");
    return span;
  }
  /**
   * Wire the internal truncation tooltip onto the live label span. The
   * `triggerElement` is the button itself so hover/focus events fire on
   * the full surface; the connector measures `_labelEl` for clipping
   * and yields automatically to any explicit `ArvoTooltip` attached to
   * the button.
   */
  _attachTruncationTooltip() {
    if (this._truncationTooltip || !this._element || !this._labelEl) return;
    this._truncationTooltip = utils.attachTitleTruncationTooltip({
      triggerElement: this._element,
      element: this._labelEl,
      content: () => this._options.label,
      placement: "bottom-center"
    });
  }
  _detachTruncationTooltip() {
    var _a;
    (_a = this._truncationTooltip) == null ? void 0 : _a.destroy();
    this._truncationTooltip = null;
  }
  _renderBadge(cfg) {
    if (!this._element) return;
    const resolved = resolveButtonBadge(cfg, this._options.variant);
    this._badgeEl = document.createElement("span");
    this._element.appendChild(this._badgeEl);
    this._badgeInstance = Badge.ArvoBadge.initialize(this._badgeEl, resolved);
  }
  _removeBadge() {
    var _a, _b;
    (_a = this._badgeInstance) == null ? void 0 : _a.destroy();
    this._badgeInstance = null;
    (_b = this._badgeEl) == null ? void 0 : _b.remove();
    this._badgeEl = null;
  }
  _renderStatus(cfg) {
    if (!this._element) return;
    const resolved = resolveButtonStatus(cfg, this._options.size);
    this._statusEl = document.createElement("span");
    this._element.appendChild(this._statusEl);
    this._statusInstance = Status.ArvoStatus.initialize(this._statusEl, resolved);
  }
  _removeStatus() {
    var _a, _b;
    (_a = this._statusInstance) == null ? void 0 : _a.destroy();
    this._statusInstance = null;
    (_b = this._statusEl) == null ? void 0 : _b.remove();
    this._statusEl = null;
  }
  _bindEvents() {
    var _a, _b;
    (_a = this._element) == null ? void 0 : _a.addEventListener("click", this._boundHandleClick);
    (_b = this._element) == null ? void 0 : _b.addEventListener("keydown", this._boundHandleKeydown);
  }
  _handleClick(event) {
    if (this._options.isDisabled || this._options.isLoading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (this._options.onClick) {
      this._options.onClick(event);
    }
  }
  _handleKeydown(event) {
    if ((event.key === "Enter" || event.key === " ") && (this._options.isDisabled || this._options.isLoading)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (this._options.onKeyDown) {
      this._options.onKeyDown(event);
    }
  }
  _dispatchEvent(name, detail) {
    var _a;
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      cancelable: true,
      detail
    }));
  }
  setLabel(text) {
    this._options.label = text;
    if (this._labelEl) {
      this._labelEl.textContent = text;
    } else if (this._element) {
      this._labelEl = document.createElement("span");
      this._labelEl.className = "arvo-btn__lbl";
      this._labelEl.textContent = text;
      this._element.appendChild(this._labelEl);
    }
    if (!this._options.hasTruncationTooltip) {
      this._detachTruncationTooltip();
      return;
    }
    if (text) {
      if (this._truncationTooltip) {
        this._truncationTooltip.update(() => this._options.label);
      } else {
        this._attachTruncationTooltip();
      }
    } else {
      this._detachTruncationTooltip();
    }
  }
  setIcon(iconName) {
    if (!iconName) {
      if (this._iconEl) {
        this._iconEl.remove();
        this._iconEl = null;
      }
      this._options.icon = null;
      return;
    }
    if (this._iconEl) {
      const oldClass = this._options.icon ? `o9con-${this._options.icon}` : null;
      if (oldClass) {
        this._iconEl.classList.remove(oldClass);
      }
      this._iconEl.classList.add(`o9con-${iconName}`);
    } else if (this._element) {
      this._iconEl = this._createIconEl(iconName);
      this._element.insertBefore(this._iconEl, this._element.firstChild);
    }
    this._options.icon = iconName;
  }
  setVariant(variant) {
    if (!_ArvoButton.VARIANTS.includes(variant)) return;
    const el = this._element;
    if (!el) return;
    _ArvoButton.VARIANTS.forEach((v) => el.classList.remove(`arvo-btn--${v}`));
    el.classList.add(`arvo-btn--${variant}`);
    this._options.variant = variant;
    if (this._badgeInstance && this._options.badge) {
      const resolved = resolveButtonBadge(
        this._options.badge,
        this._options.variant
      );
      this._badgeInstance.setAppearance(resolved.appearance);
    }
  }
  setSize(size) {
    if (!_ArvoButton.SIZES.includes(size)) return;
    const el = this._element;
    if (!el) return;
    _ArvoButton.SIZES.forEach((s) => el.classList.remove(`arvo-btn--${s}`));
    el.classList.add(`arvo-btn--${size}`);
    this._options.size = size;
    if (this._statusInstance && this._options.status) {
      this._statusInstance.setSize(this._options.size);
    }
  }
  setLoading(isLoading) {
    var _a, _b, _c, _d;
    this._options.isLoading = isLoading;
    if (isLoading) {
      (_a = this._element) == null ? void 0 : _a.classList.add("loading");
      (_b = this._element) == null ? void 0 : _b.setAttribute("aria-busy", "true");
    } else {
      (_c = this._element) == null ? void 0 : _c.classList.remove("loading");
      (_d = this._element) == null ? void 0 : _d.removeAttribute("aria-busy");
    }
    this._dispatchEvent("btn:loading", { isLoading });
  }
  selected(state) {
    var _a, _b, _c;
    if (state === void 0) {
      return this._options.isSelected === true;
    }
    this._options.isSelected = state;
    if (state) {
      (_a = this._element) == null ? void 0 : _a.classList.add("active");
    } else {
      (_b = this._element) == null ? void 0 : _b.classList.remove("active");
    }
    (_c = this._element) == null ? void 0 : _c.setAttribute("aria-pressed", String(state));
  }
  disabled(state) {
    if (state === void 0) {
      return this._options.isDisabled;
    }
    this._options.isDisabled = state;
    if (this._element) {
      this._element.disabled = state;
    }
    this._dispatchEvent("btn:disabled", { isDisabled: state });
  }
  /**
   * Add, update, or remove the embedded ArvoBadge slot. Pass `null` to
   * tear the badge down; pass a config object to render or re-render.
   */
  setBadge(config) {
    this._options.badge = config;
    if (!config) {
      this._removeBadge();
      return;
    }
    this._removeBadge();
    this._renderBadge(config);
  }
  /**
   * Add, update, or remove the embedded ArvoStatus slot. Pass `null` to
   * tear the status down; pass a config object to render or re-render.
   */
  setStatus(config) {
    this._options.status = config;
    if (!config) {
      this._removeStatus();
      return;
    }
    this._removeStatus();
    this._renderStatus(config);
  }
  focus() {
    if (this._element && !this._options.isLoading) {
      this._element.focus();
    }
  }
  destroy() {
    var _a, _b;
    const el = this._element;
    if (!el) return;
    el.removeEventListener("click", this._boundHandleClick);
    el.removeEventListener("keydown", this._boundHandleKeydown);
    el.classList.remove("arvo-btn", "arvo-btn--full-width", "active", "open", "loading", "focus-border");
    _ArvoButton.VARIANTS.forEach((v) => el.classList.remove(`arvo-btn--${v}`));
    _ArvoButton.SIZES.forEach((s) => el.classList.remove(`arvo-btn--${s}`));
    el.removeAttribute("aria-pressed");
    el.removeAttribute("aria-expanded");
    el.removeAttribute("aria-haspopup");
    el.removeAttribute("aria-busy");
    el.disabled = false;
    this._detachTruncationTooltip();
    (_a = this._iconEl) == null ? void 0 : _a.remove();
    (_b = this._labelEl) == null ? void 0 : _b.remove();
    this._removeBadge();
    this._removeStatus();
    el.textContent = this._originalContent;
    this._element = null;
    this._iconEl = null;
    this._labelEl = null;
  }
};
_ArvoButton.VARIANTS = [
  "primary",
  "secondary",
  "tertiary",
  "outline",
  "danger-primary",
  "danger",
  "danger-tertiary",
  "danger-outline",
  "nova-primary",
  "inline"
];
_ArvoButton.SIZES = ["sm", "md", "lg"];
_ArvoButton.DEFAULTS = {
  variant: "primary",
  size: "md",
  type: "button",
  label: "",
  icon: null,
  isDisabled: false,
  isSelected: void 0,
  isFullWidth: false,
  isLoading: false,
  badge: null,
  status: null,
  hasTruncationTooltip: true,
  onClick: null,
  onKeyDown: null
};
let ArvoButton = _ArvoButton;
exports.ArvoButton = ArvoButton;
exports.resolveButtonBadge = resolveButtonBadge;
exports.resolveButtonStatus = resolveButtonStatus;
//# sourceMappingURL=Button.cjs.map
