import { formatBadgeCount } from "@arvo/core";
import { ArvoStatus } from "../Status/Status.js";
const ARVO_BADGE_PLACEMENTS = [
  "inline",
  "top-right"
];
const SEMANTIC_ICON_MAP = {
  positive: "check-circle",
  info: "info-circle-filled",
  neutral: "speaker",
  warning: "exclamation-triangle-filled",
  negative: "exclamation-circle-filled",
  block: "blocker-action-filled",
  none: null
};
const VALID_VARIANTS = ["label", "counter"];
const VALID_SIZES = ["sm", "md", "lg"];
const VALID_APPEARANCES = ["primary", "outline", "filled"];
const VALID_COLOR_MODES = ["semantic", "custom"];
const VALID_SEMANTIC_TYPES = ["positive", "info", "neutral", "warning", "negative", "block", "none"];
const VALID_CUSTOM_COLORS = ["purple", "pink", "glacier", "amber", "greenish", "bluish"];
const VALID_COUNTER_MODES = ["single", "ratio"];
const DEFAULTS = {
  variant: "label",
  size: "md",
  appearance: "primary",
  colorMode: "semantic",
  semanticType: "neutral",
  customColor: "purple",
  message: "Status Message",
  counterMode: "single",
  count: 0,
  total: null,
  overflowCount: 99,
  hideWhenZero: true,
  autoFormat: false,
  localeAware: false,
  hasBadgeIcon: true,
  icon: null,
  placement: "inline",
  hasStatus: false,
  statusType: "available",
  statusPosition: "top-right",
  tooltip: null,
  role: "status"
};
class ArvoBadge {
  constructor(element, options) {
    this._icoEl = null;
    this._msgEl = null;
    this._countEl = null;
    this._sepEl = null;
    this._totalEl = null;
    this._statusSpan = null;
    this._statusInstance = null;
    this._animEndHandler = null;
    this._destroyed = false;
    this.el = element;
    this._opts = {
      variant: (options == null ? void 0 : options.variant) && VALID_VARIANTS.includes(options.variant) ? options.variant : DEFAULTS.variant,
      size: (options == null ? void 0 : options.size) && VALID_SIZES.includes(options.size) ? options.size : DEFAULTS.size,
      appearance: (options == null ? void 0 : options.appearance) && VALID_APPEARANCES.includes(options.appearance) ? options.appearance : DEFAULTS.appearance,
      colorMode: (options == null ? void 0 : options.colorMode) && VALID_COLOR_MODES.includes(options.colorMode) ? options.colorMode : DEFAULTS.colorMode,
      semanticType: (options == null ? void 0 : options.semanticType) && VALID_SEMANTIC_TYPES.includes(options.semanticType) ? options.semanticType : DEFAULTS.semanticType,
      customColor: (options == null ? void 0 : options.customColor) && VALID_CUSTOM_COLORS.includes(options.customColor) ? options.customColor : DEFAULTS.customColor,
      message: (options == null ? void 0 : options.message) ?? DEFAULTS.message,
      counterMode: (options == null ? void 0 : options.counterMode) && VALID_COUNTER_MODES.includes(options.counterMode) ? options.counterMode : DEFAULTS.counterMode,
      count: typeof (options == null ? void 0 : options.count) === "number" ? options.count : DEFAULTS.count,
      total: (options == null ? void 0 : options.total) ?? DEFAULTS.total,
      overflowCount: typeof (options == null ? void 0 : options.overflowCount) === "number" ? options.overflowCount : DEFAULTS.overflowCount,
      hideWhenZero: (options == null ? void 0 : options.hideWhenZero) ?? DEFAULTS.hideWhenZero,
      autoFormat: (options == null ? void 0 : options.autoFormat) ?? DEFAULTS.autoFormat,
      localeAware: (options == null ? void 0 : options.localeAware) ?? DEFAULTS.localeAware,
      hasBadgeIcon: (options == null ? void 0 : options.hasBadgeIcon) ?? DEFAULTS.hasBadgeIcon,
      icon: (options == null ? void 0 : options.icon) ?? DEFAULTS.icon,
      placement: (options == null ? void 0 : options.placement) && ARVO_BADGE_PLACEMENTS.includes(options.placement) ? options.placement : DEFAULTS.placement,
      hasStatus: (options == null ? void 0 : options.hasStatus) ?? DEFAULTS.hasStatus,
      statusType: (options == null ? void 0 : options.statusType) ?? DEFAULTS.statusType,
      statusPosition: (options == null ? void 0 : options.statusPosition) ?? DEFAULTS.statusPosition,
      tooltip: (options == null ? void 0 : options.tooltip) ?? DEFAULTS.tooltip,
      role: (options == null ? void 0 : options.role) ?? DEFAULTS.role
    };
    this._render();
  }
  static initialize(element, options) {
    return new ArvoBadge(element, options);
  }
  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  _render() {
    this.el.textContent = "";
    this._icoEl = null;
    this._msgEl = null;
    this._countEl = null;
    this._sepEl = null;
    this._totalEl = null;
    this._animEndHandler = null;
    this._statusSpan = null;
    this._statusInstance = null;
    this.el.className = this._buildRootClasses();
    this.el.setAttribute("role", this._opts.role);
    this._applyAccessibleName();
    this._applyTitle();
    this._applyHidden();
    this._renderContentDOM();
    if (this._opts.hasStatus) {
      this._renderStatus();
    }
  }
  _buildRootClasses() {
    const { variant, size, appearance, counterMode, placement } = this._opts;
    const parts = [
      "arvo-bdg",
      `arvo-bdg--${variant}`,
      `arvo-bdg--${size}`,
      `arvo-bdg--${appearance}`,
      this._resolveColorClass()
    ];
    if (variant === "counter") parts.push(`arvo-bdg--${counterMode}`);
    parts.push(`arvo-bdg--${placement}`);
    return parts.join(" ");
  }
  _resolveColorClass() {
    const { colorMode, semanticType, customColor } = this._opts;
    if (colorMode === "custom" || semanticType === "none") return `arvo-bdg--${customColor}`;
    return `arvo-bdg--${semanticType}`;
  }
  _resolveIcon() {
    const { hasBadgeIcon, icon, colorMode, semanticType } = this._opts;
    if (!hasBadgeIcon) return null;
    if (icon) return icon;
    if (colorMode === "semantic" && semanticType !== "none") return SEMANTIC_ICON_MAP[semanticType];
    return null;
  }
  _resolveAccessibleName() {
    const { tooltip, variant, counterMode, count, overflowCount, total } = this._opts;
    if (tooltip) return tooltip;
    if (variant === "counter") {
      if (counterMode === "single") {
        return count > overflowCount ? `${overflowCount} or more` : String(count);
      }
      return `${count} out of ${total ?? 0}`;
    }
    return void 0;
  }
  _applyAccessibleName() {
    const name = this._resolveAccessibleName();
    if (name !== void 0) {
      this.el.setAttribute("aria-label", name);
    } else {
      this.el.removeAttribute("aria-label");
    }
  }
  _applyTitle() {
    if (this._opts.tooltip) {
      this.el.setAttribute("title", this._opts.tooltip);
    } else {
      this.el.removeAttribute("title");
    }
  }
  _applyHidden() {
    const { variant, counterMode, hideWhenZero, count } = this._opts;
    this.el.hidden = variant === "counter" && counterMode === "single" && hideWhenZero && count === 0;
  }
  _renderContentDOM() {
    const { variant, counterMode, message, count, total, autoFormat, overflowCount, localeAware } = this._opts;
    const resolvedIcon = this._resolveIcon();
    if (resolvedIcon) {
      this._icoEl = document.createElement("i");
      this._icoEl.className = `arvo-bdg__ico o9con o9con-${resolvedIcon}`;
      this._icoEl.setAttribute("aria-hidden", "true");
      this.el.appendChild(this._icoEl);
    }
    if (variant === "label") {
      this._msgEl = document.createElement("span");
      this._msgEl.className = "arvo-bdg__msg";
      this._msgEl.textContent = message;
      this.el.appendChild(this._msgEl);
    } else if (counterMode === "single") {
      this._countEl = document.createElement("span");
      this._countEl.className = "arvo-bdg__count";
      this._countEl.textContent = formatBadgeCount(count, { autoFormat, overflowCount, localeAware });
      this._attachAnimEndHandler();
      this.el.appendChild(this._countEl);
    } else {
      this._countEl = document.createElement("span");
      this._countEl.className = "arvo-bdg__count";
      this._countEl.textContent = formatBadgeCount(count, { autoFormat, localeAware, isRatioPart: true });
      this._attachAnimEndHandler();
      this.el.appendChild(this._countEl);
      this._sepEl = document.createElement("span");
      this._sepEl.className = "arvo-bdg__sep";
      this._sepEl.setAttribute("aria-hidden", "true");
      this._sepEl.textContent = "/";
      this.el.appendChild(this._sepEl);
      this._totalEl = document.createElement("span");
      this._totalEl.className = "arvo-bdg__total";
      this._totalEl.textContent = formatBadgeCount(total ?? 0, { autoFormat, localeAware, isRatioPart: true });
      this.el.appendChild(this._totalEl);
    }
  }
  _attachAnimEndHandler() {
    if (!this._countEl) return;
    this._animEndHandler = () => {
      var _a;
      (_a = this._countEl) == null ? void 0 : _a.classList.remove("is-increasing", "is-decreasing");
    };
    this._countEl.addEventListener("animationend", this._animEndHandler);
  }
  _removeContentDOM() {
    var _a, _b, _c, _d, _e;
    if (this._animEndHandler && this._countEl) {
      this._countEl.removeEventListener("animationend", this._animEndHandler);
    }
    (_a = this._icoEl) == null ? void 0 : _a.remove();
    (_b = this._msgEl) == null ? void 0 : _b.remove();
    (_c = this._countEl) == null ? void 0 : _c.remove();
    (_d = this._sepEl) == null ? void 0 : _d.remove();
    (_e = this._totalEl) == null ? void 0 : _e.remove();
    this._icoEl = null;
    this._msgEl = null;
    this._countEl = null;
    this._sepEl = null;
    this._totalEl = null;
    this._animEndHandler = null;
  }
  _renderStatus() {
    this._statusSpan = document.createElement("span");
    this._statusInstance = ArvoStatus.initialize(this._statusSpan, {
      type: this._opts.statusType,
      placement: this._opts.statusPosition,
      size: "sm"
    });
    this.el.appendChild(this._statusSpan);
  }
  _removeStatusDOM() {
    var _a, _b;
    (_a = this._statusInstance) == null ? void 0 : _a.destroy();
    this._statusInstance = null;
    (_b = this._statusSpan) == null ? void 0 : _b.remove();
    this._statusSpan = null;
  }
  _applyColorClass() {
    [...VALID_SEMANTIC_TYPES, ...VALID_CUSTOM_COLORS].forEach((v) => {
      this.el.classList.remove(`arvo-bdg--${v}`);
    });
    this.el.classList.add(this._resolveColorClass());
  }
  _updateIcon() {
    const resolvedIcon = this._resolveIcon();
    if (resolvedIcon) {
      if (this._icoEl) {
        this._icoEl.className = `arvo-bdg__ico o9con o9con-${resolvedIcon}`;
      } else {
        this._icoEl = document.createElement("i");
        this._icoEl.className = `arvo-bdg__ico o9con o9con-${resolvedIcon}`;
        this._icoEl.setAttribute("aria-hidden", "true");
        this.el.insertBefore(this._icoEl, this.el.firstChild);
      }
    } else if (this._icoEl) {
      this._icoEl.remove();
      this._icoEl = null;
    }
  }
  count(value) {
    if (value === void 0) return this._opts.count;
    const prev = this._opts.count;
    this._opts.count = value;
    this._applyHidden();
    this._applyAccessibleName();
    if (this._countEl && this._opts.variant === "counter") {
      const { autoFormat, overflowCount, localeAware, counterMode } = this._opts;
      if (counterMode === "single") {
        this._countEl.textContent = formatBadgeCount(value, { autoFormat, overflowCount, localeAware });
      } else {
        this._countEl.textContent = formatBadgeCount(value, { autoFormat, localeAware, isRatioPart: true });
      }
      if (value > prev) {
        this._countEl.classList.remove("is-decreasing");
        this._countEl.classList.add("is-increasing");
      } else if (value < prev) {
        this._countEl.classList.remove("is-increasing");
        this._countEl.classList.add("is-decreasing");
      }
    }
  }
  increment(by = 1) {
    this.count(this._opts.count + by);
  }
  decrement(by = 1) {
    this.count(this._opts.count - by);
  }
  setMessage(text) {
    this._opts.message = text;
    if (this._msgEl) this._msgEl.textContent = text;
  }
  setTotal(total) {
    this._opts.total = total;
    if (this._totalEl) {
      const { autoFormat, localeAware } = this._opts;
      this._totalEl.textContent = formatBadgeCount(total ?? 0, { autoFormat, localeAware, isRatioPart: true });
    }
    this._applyAccessibleName();
  }
  setOverflowCount(max) {
    this._opts.overflowCount = max;
    if (this._countEl && this._opts.variant === "counter" && this._opts.counterMode === "single") {
      const { count, autoFormat, localeAware } = this._opts;
      this._countEl.textContent = formatBadgeCount(count, { autoFormat, overflowCount: max, localeAware });
    }
    this._applyAccessibleName();
  }
  setVariant(variant) {
    if (!VALID_VARIANTS.includes(variant)) return;
    if (this._opts.variant === variant) return;
    VALID_VARIANTS.forEach((v) => this.el.classList.remove(`arvo-bdg--${v}`));
    this.el.classList.add(`arvo-bdg--${variant}`);
    if (variant === "counter") {
      this.el.classList.add(`arvo-bdg--${this._opts.counterMode}`);
    } else {
      VALID_COUNTER_MODES.forEach((m) => this.el.classList.remove(`arvo-bdg--${m}`));
    }
    this._opts.variant = variant;
    this._removeContentDOM();
    this._renderContentDOM();
    if (this._statusSpan) this.el.appendChild(this._statusSpan);
    this._applyHidden();
    this._applyAccessibleName();
  }
  setSize(size) {
    if (!VALID_SIZES.includes(size)) return;
    VALID_SIZES.forEach((s) => this.el.classList.remove(`arvo-bdg--${s}`));
    this.el.classList.add(`arvo-bdg--${size}`);
    this._opts.size = size;
  }
  placement(value) {
    if (value === void 0) return this._opts.placement;
    if (!ARVO_BADGE_PLACEMENTS.includes(value)) return;
    ARVO_BADGE_PLACEMENTS.forEach((p) => this.el.classList.remove(`arvo-bdg--${p}`));
    this.el.classList.add(`arvo-bdg--${value}`);
    this._opts.placement = value;
  }
  setAppearance(appearance) {
    if (!VALID_APPEARANCES.includes(appearance)) return;
    VALID_APPEARANCES.forEach((a) => this.el.classList.remove(`arvo-bdg--${a}`));
    this.el.classList.add(`arvo-bdg--${appearance}`);
    this._opts.appearance = appearance;
  }
  setColorMode(mode) {
    if (!VALID_COLOR_MODES.includes(mode)) return;
    this._opts.colorMode = mode;
    this._applyColorClass();
    this._updateIcon();
  }
  setSemanticType(type) {
    if (!VALID_SEMANTIC_TYPES.includes(type)) return;
    this._opts.semanticType = type;
    this._applyColorClass();
    this._updateIcon();
  }
  setCustomColor(color) {
    if (!VALID_CUSTOM_COLORS.includes(color)) return;
    this._opts.customColor = color;
    this._applyColorClass();
  }
  setTooltip(text) {
    this._opts.tooltip = text;
    this._applyTitle();
    this._applyAccessibleName();
  }
  setStatus(config) {
    if (config === false) {
      this._opts.hasStatus = false;
      this._removeStatusDOM();
    } else {
      this._opts.statusType = config.type;
      if (config.position) this._opts.statusPosition = config.position;
      if (this._statusInstance) {
        this._statusInstance.setType(config.type);
        if (config.position) this._statusInstance.placement(config.position);
      } else {
        this._opts.hasStatus = true;
        this._renderStatus();
      }
    }
  }
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._removeContentDOM();
    this._removeStatusDOM();
    this.el.className = "";
    this.el.removeAttribute("role");
    this.el.removeAttribute("aria-label");
    this.el.removeAttribute("title");
    this.el.hidden = false;
  }
}
export {
  ARVO_BADGE_PLACEMENTS,
  ArvoBadge
};
//# sourceMappingURL=Badge.js.map
