import { connectTooltip, tooltipManager } from "@arvo/core";
import { ArvoBadge } from "../Badge/Badge.js";
import { ArvoStatus } from "../Status/Status.js";
function resolveIconButtonBadge(cfg) {
  const placement = cfg.placement ?? "top-right";
  const semanticType = cfg.semanticType ?? "neutral";
  return {
    ...cfg,
    placement,
    semanticType,
    size: "sm",
    appearance: "filled",
    colorMode: "semantic",
    variant: "counter",
    counterMode: "single",
    hasBadgeIcon: false
  };
}
function iconButtonStatusSize(buttonSize) {
  if (buttonSize === "xs") return "sm";
  return buttonSize;
}
function resolveIconButtonStatus(cfg, buttonSize) {
  return {
    ...cfg,
    size: iconButtonStatusSize(buttonSize),
    placement: cfg.placement ?? "top-right"
  };
}
const _ArvoIconButton = class _ArvoIconButton {
  constructor(element, options) {
    this._iconEl = null;
    this._badgeEl = null;
    this._badgeInstance = null;
    this._statusEl = null;
    this._statusInstance = null;
    this._tooltipConnector = null;
    this._element = element;
    const variant = (options == null ? void 0 : options.variant) && _ArvoIconButton.VARIANTS.includes(options.variant) ? options.variant : _ArvoIconButton.DEFAULTS.variant;
    const size = (options == null ? void 0 : options.size) && _ArvoIconButton.SIZES.includes(options.size) ? options.size : _ArvoIconButton.DEFAULTS.size;
    this._options = {
      ..._ArvoIconButton.DEFAULTS,
      ...options,
      variant,
      size,
      icon: (options == null ? void 0 : options.icon) ?? _ArvoIconButton.DEFAULTS.icon,
      tooltip: (options == null ? void 0 : options.tooltip) ?? _ArvoIconButton.DEFAULTS.tooltip,
      onClick: (options == null ? void 0 : options.onClick) ?? null,
      onKeyDown: (options == null ? void 0 : options.onKeyDown) ?? null,
      badge: (options == null ? void 0 : options.badge) ?? null,
      status: (options == null ? void 0 : options.status) ?? null
    };
    this._boundHandleClick = this._handleClick.bind(this);
    this._boundHandleKeydown = this._handleKeydown.bind(this);
    this._render();
    this._bindEvents();
    this._connectTooltip();
  }
  static initialize(element, options) {
    return new _ArvoIconButton(element, options);
  }
  _connectTooltip() {
    if (!this._element || !this._options.tooltip) return;
    const tip = this._options.tooltip;
    const config = typeof tip === "string" ? { content: tip } : tip;
    this._tooltipConnector = connectTooltip(tooltipManager, {
      anchor: this._element,
      content: config.content,
      placement: config.placement,
      shortcut: config.shortcut
    });
  }
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    el.classList.add("arvo-icon-btn");
    el.classList.add(`arvo-btn--${this._options.variant}`);
    el.classList.add(`arvo-btn--${this._options.size}`);
    el.setAttribute("type", this._options.type);
    if (this._options.icon) {
      this._iconEl = this._createIconEl(this._options.icon);
      el.appendChild(this._iconEl);
    }
    if (this._options.badge) {
      this._renderBadge(this._options.badge);
    }
    if (this._options.status) {
      this._renderStatus(this._options.status);
    }
    if (this._options.tooltip) {
      const tip = this._options.tooltip;
      el.setAttribute("aria-label", typeof tip === "string" ? tip : tip.content);
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
  _renderBadge(cfg) {
    if (!this._element) return;
    const resolved = resolveIconButtonBadge(cfg);
    this._badgeEl = document.createElement("span");
    this._element.appendChild(this._badgeEl);
    this._badgeInstance = ArvoBadge.initialize(this._badgeEl, resolved);
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
    const resolved = resolveIconButtonStatus(cfg, this._options.size);
    this._statusEl = document.createElement("span");
    this._element.appendChild(this._statusEl);
    this._statusInstance = ArvoStatus.initialize(this._statusEl, resolved);
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
  setIcon(iconName) {
    if (!iconName) return;
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
  setTooltip(tooltip) {
    var _a, _b;
    this._options.tooltip = tooltip;
    (_a = this._element) == null ? void 0 : _a.setAttribute("aria-label", tooltip);
    (_b = this._tooltipConnector) == null ? void 0 : _b.update({ content: tooltip });
  }
  setVariant(variant) {
    if (!_ArvoIconButton.VARIANTS.includes(variant)) return;
    const el = this._element;
    if (!el) return;
    _ArvoIconButton.VARIANTS.forEach((v) => el.classList.remove(`arvo-btn--${v}`));
    el.classList.add(`arvo-btn--${variant}`);
    this._options.variant = variant;
  }
  setSize(size) {
    if (!_ArvoIconButton.SIZES.includes(size)) return;
    const el = this._element;
    if (!el) return;
    _ArvoIconButton.SIZES.forEach((s) => el.classList.remove(`arvo-btn--${s}`));
    el.classList.add(`arvo-btn--${size}`);
    this._options.size = size;
    if (this._statusInstance && this._options.status) {
      this._statusInstance.setSize(iconButtonStatusSize(this._options.size));
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
   * Mirrors `ArvoButton.setBadge`.
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
   * Mirrors `ArvoButton.setStatus`.
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
    el.classList.remove("arvo-icon-btn", "active", "loading", "open", "focus-border");
    _ArvoIconButton.VARIANTS.forEach((v) => el.classList.remove(`arvo-btn--${v}`));
    _ArvoIconButton.SIZES.forEach((s) => el.classList.remove(`arvo-btn--${s}`));
    el.removeAttribute("aria-label");
    el.removeAttribute("aria-pressed");
    el.removeAttribute("aria-expanded");
    el.removeAttribute("aria-haspopup");
    el.removeAttribute("aria-busy");
    el.disabled = false;
    (_a = this._iconEl) == null ? void 0 : _a.remove();
    this._removeBadge();
    this._removeStatus();
    (_b = this._tooltipConnector) == null ? void 0 : _b.destroy();
    this._tooltipConnector = null;
    this._element = null;
    this._iconEl = null;
  }
};
_ArvoIconButton.VARIANTS = [
  "primary",
  "secondary",
  "tertiary",
  "outline",
  "danger-primary",
  "danger",
  "danger-tertiary",
  "danger-outline",
  "nova-primary"
];
_ArvoIconButton.SIZES = ["xs", "sm", "md", "lg"];
_ArvoIconButton.DEFAULTS = {
  variant: "primary",
  size: "md",
  type: "button",
  icon: "",
  tooltip: "",
  isDisabled: false,
  isSelected: void 0,
  isLoading: false,
  onClick: null,
  onKeyDown: null,
  badge: null,
  status: null
};
let ArvoIconButton = _ArvoIconButton;
export {
  ArvoIconButton,
  resolveIconButtonBadge,
  resolveIconButtonStatus
};
//# sourceMappingURL=IconButton.js.map
