import { connectTooltip, tooltipManager } from "@arvo/core";
import { ArvoBadge } from "../Badge/Badge.js";
import { ArvoStatus } from "../Status/Status.js";
function resolveToggleButtonBadge(cfg) {
  const placement = cfg.placement ?? "inline";
  const isPositioned = placement !== "inline";
  const variant = isPositioned ? "counter" : cfg.variant ?? "label";
  const counterMode = isPositioned ? "single" : cfg.counterMode;
  const semanticType = isPositioned ? cfg.semanticType ?? "neutral" : "neutral";
  return {
    ...cfg,
    placement,
    variant,
    counterMode,
    semanticType,
    size: "sm",
    appearance: isPositioned ? "filled" : "primary",
    colorMode: "semantic",
    hasBadgeIcon: false
  };
}
function resolveToggleButtonStatus(cfg, toggleSize) {
  return {
    ...cfg,
    size: toggleSize,
    placement: cfg.placement ?? "top-right"
  };
}
const _ArvoToggleButton = class _ArvoToggleButton {
  constructor(element, options) {
    this._innerEl = null;
    this._iconEl = null;
    this._labelEl = null;
    this._badgeEl = null;
    this._badgeInstance = null;
    this._statusEl = null;
    this._statusInstance = null;
    this._tooltipConnector = null;
    this._element = element;
    this._originalContent = element.textContent ?? "";
    this._originalType = element.getAttribute("type");
    const variant = (options == null ? void 0 : options.variant) && _ArvoToggleButton.VARIANTS.includes(options.variant) ? options.variant : _ArvoToggleButton.DEFAULTS.variant;
    const size = (options == null ? void 0 : options.size) && _ArvoToggleButton.SIZES.includes(options.size) ? options.size : _ArvoToggleButton.DEFAULTS.size;
    this._options = {
      ..._ArvoToggleButton.DEFAULTS,
      ...options,
      variant,
      size,
      icon: (options == null ? void 0 : options.icon) ?? _ArvoToggleButton.DEFAULTS.icon,
      selectedIcon: (options == null ? void 0 : options.selectedIcon) ?? null,
      label: (options == null ? void 0 : options.label) ?? null,
      tooltip: (options == null ? void 0 : options.tooltip) ?? _ArvoToggleButton.DEFAULTS.tooltip,
      onClick: (options == null ? void 0 : options.onClick) ?? null,
      onKeyDown: (options == null ? void 0 : options.onKeyDown) ?? null,
      onSelectedChange: (options == null ? void 0 : options.onSelectedChange) ?? null,
      badge: (options == null ? void 0 : options.badge) ?? null,
      status: (options == null ? void 0 : options.status) ?? null
    };
    if ((options == null ? void 0 : options.isSelected) === void 0) {
      this._options.isSelected = (options == null ? void 0 : options.defaultSelected) ?? false;
    }
    this._boundHandleClick = this._handleClick.bind(this);
    this._boundHandleKeydown = this._handleKeydown.bind(this);
    this._render();
    this._bindEvents();
    this._connectTooltip();
  }
  static initialize(element, options) {
    return new _ArvoToggleButton(element, options);
  }
  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  _connectTooltip() {
    if (!this._element || !this._options.tooltip) return;
    const tip = this._options.tooltip;
    const config = typeof tip === "string" ? { content: tip } : tip;
    if (!config.content) return;
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
    el.setAttribute("type", this._options.type);
    el.classList.add("arvo-toggle-btn");
    el.classList.add(`arvo-toggle-btn--${this._options.variant}`);
    el.classList.add(`arvo-toggle-btn--${this._options.size}`);
    const hasLabel = typeof this._options.label === "string" && this._options.label.length > 0;
    if (!hasLabel) {
      el.classList.add("arvo-toggle-btn--icon-only");
    }
    el.setAttribute("aria-pressed", this._options.isSelected ? "true" : "false");
    if (this._options.isSelected) {
      el.classList.add("active");
    }
    if (!hasLabel) {
      const tip = this._options.tooltip;
      const tipContent = typeof tip === "string" ? tip : (tip == null ? void 0 : tip.content) ?? "";
      if (tipContent) {
        el.setAttribute("aria-label", tipContent);
      }
    }
    const innerEl = document.createElement("span");
    innerEl.className = "arvo-toggle-btn__inner";
    this._innerEl = innerEl;
    el.appendChild(innerEl);
    const renderedIcon = this._resolveDisplayedIcon();
    if (renderedIcon) {
      this._iconEl = this._createIconEl(renderedIcon);
      innerEl.appendChild(this._iconEl);
    }
    if (hasLabel) {
      this._labelEl = document.createElement("span");
      this._labelEl.className = "arvo-toggle-btn__lbl";
      this._labelEl.textContent = this._options.label;
      innerEl.appendChild(this._labelEl);
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
    if (this._options.isLoading) {
      el.classList.add("loading");
      el.setAttribute("aria-busy", "true");
    }
  }
  _resolveDisplayedIcon() {
    if (this._options.isSelected && this._options.selectedIcon) {
      return this._options.selectedIcon;
    }
    return this._options.icon;
  }
  _createIconEl(iconName) {
    const span = document.createElement("span");
    span.className = `arvo-toggle-btn__ico o9con o9con-${iconName}`;
    span.setAttribute("aria-hidden", "true");
    return span;
  }
  _renderBadge(cfg) {
    if (!this._element) return;
    const resolved = resolveToggleButtonBadge(cfg);
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
    const resolved = resolveToggleButtonStatus(cfg, this._options.size);
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
  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------
  _bindEvents() {
    var _a, _b;
    (_a = this._element) == null ? void 0 : _a.addEventListener("click", this._boundHandleClick);
    (_b = this._element) == null ? void 0 : _b.addEventListener("keydown", this._boundHandleKeydown);
  }
  _handleClick(event) {
    var _a, _b;
    if (this._options.isDisabled || this._options.isLoading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const next = !this._options.isSelected;
    this._applySelected(next);
    (_b = (_a = this._options).onSelectedChange) == null ? void 0 : _b.call(_a, next);
    this._dispatchEvent("toggle-btn:change", { isSelected: next });
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
  _applySelected(next) {
    const previous = this._options.isSelected;
    this._options.isSelected = next;
    const el = this._element;
    if (!el) return;
    el.setAttribute("aria-pressed", String(next));
    if (next) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
    if (this._iconEl && this._options.selectedIcon && next !== previous) {
      const upcoming = next ? this._options.selectedIcon : this._options.icon;
      const removeName = next ? this._options.icon : this._options.selectedIcon;
      if (removeName) this._iconEl.classList.remove(`o9con-${removeName}`);
      if (upcoming) this._iconEl.classList.add(`o9con-${upcoming}`);
    }
  }
  _dispatchEvent(name, detail) {
    var _a;
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        cancelable: true,
        detail
      })
    );
  }
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  /**
   * Add, update, or remove the visible label. Adds / removes the
   * `arvo-toggle-btn--icon-only` modifier as the shape changes.
   */
  setLabel(text) {
    var _a, _b;
    const el = this._element;
    if (!el) return;
    typeof this._options.label === "string" && this._options.label.length > 0;
    const hasLabel = typeof text === "string" && text.length > 0;
    this._options.label = hasLabel ? text : null;
    if (hasLabel) {
      if (this._labelEl) {
        this._labelEl.textContent = text;
      } else {
        this._labelEl = document.createElement("span");
        this._labelEl.className = "arvo-toggle-btn__lbl";
        this._labelEl.textContent = text;
        if (this._iconEl) {
          this._iconEl.insertAdjacentElement("afterend", this._labelEl);
        } else {
          (_a = this._innerEl) == null ? void 0 : _a.appendChild(this._labelEl);
        }
      }
      el.classList.remove("arvo-toggle-btn--icon-only");
      el.removeAttribute("aria-label");
    } else {
      (_b = this._labelEl) == null ? void 0 : _b.remove();
      this._labelEl = null;
      el.classList.add("arvo-toggle-btn--icon-only");
      const tip = this._options.tooltip;
      const tipContent = typeof tip === "string" ? tip : (tip == null ? void 0 : tip.content) ?? "";
      if (tipContent) {
        el.setAttribute("aria-label", tipContent);
      }
    }
  }
  /** Swap the resting icon glyph. */
  setIcon(iconName) {
    if (!iconName) return;
    if (!this._iconEl && this._innerEl) {
      this._iconEl = this._createIconEl(iconName);
      this._innerEl.insertBefore(this._iconEl, this._innerEl.firstChild);
    } else if (this._iconEl) {
      const previous = this._options.icon;
      if (previous) this._iconEl.classList.remove(`o9con-${previous}`);
      this._iconEl.classList.add(`o9con-${iconName}`);
    }
    this._options.icon = iconName;
    if (!this._options.isSelected || !this._options.selectedIcon) {
      this._syncDisplayedIcon();
    }
  }
  /** Set or clear the alternate icon shown when the toggle is on. */
  setSelectedIcon(iconName) {
    this._options.selectedIcon = iconName ?? null;
    if (this._options.isSelected) {
      this._syncDisplayedIcon();
    }
  }
  /**
   * Internal helper to (re)apply the resolved displayed icon based on
   * current `isSelected` + `selectedIcon`. Used by setIcon /
   * setSelectedIcon when the resolved glyph must change without a flip.
   */
  _syncDisplayedIcon() {
    if (!this._iconEl) return;
    const desired = this._resolveDisplayedIcon();
    if (!desired) return;
    const toRemove = [];
    this._iconEl.classList.forEach((cls) => {
      if (cls.startsWith("o9con-")) toRemove.push(cls);
    });
    toRemove.forEach((cls) => {
      var _a;
      return (_a = this._iconEl) == null ? void 0 : _a.classList.remove(cls);
    });
    this._iconEl.classList.add(`o9con-${desired}`);
  }
  /**
   * Update the tooltip content (and aria-label when the toggle is
   * icon-only).
   */
  setTooltip(text) {
    var _a;
    this._options.tooltip = text;
    const el = this._element;
    if (!el) return;
    const hasLabel = typeof this._options.label === "string" && this._options.label.length > 0;
    if (!hasLabel && text) {
      el.setAttribute("aria-label", text);
    }
    (_a = this._tooltipConnector) == null ? void 0 : _a.update({ content: text });
  }
  setVariant(variant) {
    if (!_ArvoToggleButton.VARIANTS.includes(variant)) return;
    const el = this._element;
    if (!el) return;
    _ArvoToggleButton.VARIANTS.forEach(
      (v) => el.classList.remove(`arvo-toggle-btn--${v}`)
    );
    el.classList.add(`arvo-toggle-btn--${variant}`);
    this._options.variant = variant;
  }
  setSize(size) {
    if (!_ArvoToggleButton.SIZES.includes(size)) return;
    const el = this._element;
    if (!el) return;
    _ArvoToggleButton.SIZES.forEach(
      (s) => el.classList.remove(`arvo-toggle-btn--${s}`)
    );
    el.classList.add(`arvo-toggle-btn--${size}`);
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
    this._dispatchEvent("toggle-btn:loading", { isLoading });
  }
  /**
   * Dual-purpose getter/setter for the selected state. Omit `state` to
   * read; pass a boolean to write. Programmatic writes do NOT invoke
   * the consumer `onSelectedChange` callback, but the
   * `toggle-btn:change` DOM event still fires so external listeners
   * stay in sync.
   */
  selected(state) {
    if (state === void 0) {
      return this._options.isSelected === true;
    }
    if (state === this._options.isSelected) return;
    this._applySelected(state);
    this._dispatchEvent("toggle-btn:change", { isSelected: state });
  }
  /**
   * Flip the selected state, or force a target value. Returns the new
   * `isSelected` value. Fires the `toggle-btn:change` DOM event but does
   * NOT invoke `onSelectedChange` (programmatic, not user-driven).
   */
  toggle(force) {
    const current = this._options.isSelected === true;
    const next = typeof force === "boolean" ? force : !current;
    if (next === current) return current;
    this._applySelected(next);
    this._dispatchEvent("toggle-btn:change", { isSelected: next });
    return next;
  }
  disabled(state) {
    if (state === void 0) {
      return this._options.isDisabled;
    }
    this._options.isDisabled = state;
    if (this._element) {
      this._element.disabled = state;
    }
    this._dispatchEvent("toggle-btn:disabled", { isDisabled: state });
  }
  /** Add, update, or remove the embedded ArvoBadge slot. */
  setBadge(config) {
    this._options.badge = config;
    if (!config) {
      this._removeBadge();
      return;
    }
    this._removeBadge();
    this._renderBadge(config);
  }
  /** Add, update, or remove the embedded ArvoStatus slot. */
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
    el.classList.remove(
      "arvo-toggle-btn",
      "arvo-toggle-btn--icon-only",
      "active",
      "loading",
      "focus-border"
    );
    _ArvoToggleButton.VARIANTS.forEach(
      (v) => el.classList.remove(`arvo-toggle-btn--${v}`)
    );
    _ArvoToggleButton.SIZES.forEach(
      (s) => el.classList.remove(`arvo-toggle-btn--${s}`)
    );
    el.removeAttribute("aria-pressed");
    el.removeAttribute("aria-busy");
    el.removeAttribute("aria-label");
    if (this._originalType === null) {
      el.removeAttribute("type");
    } else {
      el.setAttribute("type", this._originalType);
    }
    el.disabled = false;
    (_a = this._innerEl) == null ? void 0 : _a.remove();
    this._removeBadge();
    this._removeStatus();
    (_b = this._tooltipConnector) == null ? void 0 : _b.destroy();
    this._tooltipConnector = null;
    el.textContent = this._originalContent;
    this._element = null;
    this._innerEl = null;
    this._iconEl = null;
    this._labelEl = null;
  }
};
_ArvoToggleButton.VARIANTS = ["secondary", "tertiary", "outline"];
_ArvoToggleButton.SIZES = ["sm", "md", "lg"];
_ArvoToggleButton.DEFAULTS = {
  variant: "secondary",
  size: "md",
  type: "button",
  icon: "",
  selectedIcon: null,
  label: null,
  tooltip: "",
  isDisabled: false,
  isSelected: false,
  defaultSelected: false,
  isLoading: false,
  onClick: null,
  onKeyDown: null,
  onSelectedChange: null,
  badge: null,
  status: null
};
let ArvoToggleButton = _ArvoToggleButton;
export {
  ArvoToggleButton,
  resolveToggleButtonBadge,
  resolveToggleButtonStatus
};
//# sourceMappingURL=ToggleButton.js.map
