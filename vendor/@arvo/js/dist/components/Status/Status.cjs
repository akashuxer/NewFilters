"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const TYPE_REGISTRY = {
  available: { icon: "basicshape-circle", label: "Available", iconOverridable: false },
  notAvailable: { icon: "circle-shape", label: "Not available", iconOverridable: false },
  partialComplete: { icon: "adjust", label: "Partial complete", iconOverridable: false },
  busy: { icon: "minus-circle", label: "Busy", iconOverridable: false },
  failed: { icon: "times-circle", label: "Failed", iconOverridable: false },
  blocked: { icon: "blocker-action-filled", label: "Blocked", iconOverridable: false },
  attention: { icon: "basicshape-circle", label: "Attention", iconOverridable: false },
  loading: { icon: "spinner", label: "Loading", iconOverridable: false },
  paused: { icon: "on-hold", label: "Paused", iconOverridable: false },
  critical: { icon: "square", label: "Critical", iconOverridable: false },
  high: { icon: "chevron-circle-up", label: "High", iconOverridable: false },
  medium: { icon: "basicshape-hexagon", label: "Medium", iconOverridable: false },
  low: { icon: "chevron-circle-down", label: "Low", iconOverridable: false },
  unknown: { icon: "question-circle", label: "Unknown", iconOverridable: false },
  positive: { icon: "check-circle", label: "Positive", iconOverridable: true },
  negative: { icon: "exclamation-circle-filled", label: "Negative", iconOverridable: true },
  warning: { icon: "exclamation-triangle-filled", label: "Warning", iconOverridable: true },
  info: { icon: "info-circle-filled", label: "Info", iconOverridable: true },
  neutral: { icon: null, label: "Neutral", iconOverridable: true }
};
const NEUTRAL_ICON_FALLBACK = "camera-retro";
const VALID_TYPES = Object.keys(TYPE_REGISTRY);
const VALID_SIZES = ["sm", "md", "lg"];
const VALID_PLACEMENTS = ["inline", "top-right", "bottom-right"];
const ARVO_STATUS_TYPES = VALID_TYPES;
const ARVO_STATUS_TYPE_REGISTRY = TYPE_REGISTRY;
const ARVO_STATUS_PLACEMENTS = VALID_PLACEMENTS;
function resolveStatusIcon(type, override) {
  const meta = TYPE_REGISTRY[type];
  if (meta.iconOverridable && override) return override;
  if (meta.icon) return meta.icon;
  return NEUTRAL_ICON_FALLBACK;
}
function resolveStatusLabel(type) {
  return TYPE_REGISTRY[type].label;
}
const DEFAULTS = {
  type: "positive",
  size: "lg",
  placement: "inline",
  tooltip: null,
  icon: null
};
const _ArvoStatus = class _ArvoStatus {
  constructor(element, options) {
    this._iconEl = null;
    this._destroyed = false;
    this.el = element;
    const safeType = (options == null ? void 0 : options.type) && VALID_TYPES.includes(options.type) ? options.type : DEFAULTS.type;
    const safeSize = (options == null ? void 0 : options.size) && VALID_SIZES.includes(options.size) ? options.size : DEFAULTS.size;
    const safePlacement = (options == null ? void 0 : options.placement) && VALID_PLACEMENTS.includes(options.placement) ? options.placement : DEFAULTS.placement;
    this._opts = {
      ...DEFAULTS,
      type: safeType,
      size: safeSize,
      placement: safePlacement,
      tooltip: (options == null ? void 0 : options.tooltip) ?? null,
      icon: (options == null ? void 0 : options.icon) ?? null
    };
    this._render();
  }
  /** Factory matching the rest of the @arvo/js components. */
  static initialize(element, options) {
    const host = element ?? document.createElement("span");
    return new _ArvoStatus(host, options);
  }
  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  _render() {
    this.el.textContent = "";
    this._iconEl = document.createElement("i");
    this._iconEl.setAttribute("aria-hidden", "true");
    this.el.appendChild(this._iconEl);
    this.el.setAttribute("role", "img");
    this._applyClasses();
    this._applyIcon();
    this._applyTooltip();
  }
  _applyClasses() {
    const { type, size, placement } = this._opts;
    this.el.className = [
      "arvo-sts",
      `arvo-sts--${size}`,
      `arvo-sts--${type}`,
      `arvo-sts--${placement}`
    ].join(" ");
  }
  _applyIcon() {
    if (!this._iconEl) return;
    const resolved = resolveStatusIcon(this._opts.type, this._opts.icon);
    this._iconEl.className = `arvo-sts__ico o9con o9con-${resolved}`;
  }
  _applyTooltip() {
    const label = this._opts.tooltip ?? resolveStatusLabel(this._opts.type);
    this.el.setAttribute("aria-label", label);
    this.el.setAttribute("title", label);
  }
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  /** Change the semantic type. */
  setType(type) {
    if (!VALID_TYPES.includes(type)) return;
    this._opts.type = type;
    this._applyClasses();
    this._applyIcon();
    if (this._opts.tooltip === null) {
      this._applyTooltip();
    }
  }
  /** Change the size. */
  setSize(size) {
    if (!VALID_SIZES.includes(size)) return;
    this._opts.size = size;
    this._applyClasses();
  }
  placement(value) {
    if (value === void 0) return this._opts.placement;
    if (!VALID_PLACEMENTS.includes(value)) return;
    this._opts.placement = value;
    this._applyClasses();
  }
  /**
   * Override the icon glyph. Pass null to revert to the type default.
   * Ignored for locked-icon types.
   */
  setIcon(icon) {
    this._opts.icon = icon;
    this._applyIcon();
  }
  /** Update the accessible label + native title. Pass null to revert. */
  setTooltip(tooltip) {
    this._opts.tooltip = tooltip;
    this._applyTooltip();
  }
  /** Read-only accessors mirroring the React props for testing. */
  type() {
    return this._opts.type;
  }
  size() {
    return this._opts.size;
  }
  /** Tear down inner DOM + decorations. The host element is preserved. */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    if (this._iconEl) {
      this._iconEl.remove();
      this._iconEl = null;
    }
    this.el.removeAttribute("class");
    this.el.removeAttribute("role");
    this.el.removeAttribute("aria-label");
    this.el.removeAttribute("title");
  }
};
_ArvoStatus.TYPES = VALID_TYPES;
_ArvoStatus.SIZES = VALID_SIZES;
_ArvoStatus.PLACEMENTS = VALID_PLACEMENTS;
_ArvoStatus.TYPE_REGISTRY = TYPE_REGISTRY;
let ArvoStatus = _ArvoStatus;
exports.ARVO_STATUS_PLACEMENTS = ARVO_STATUS_PLACEMENTS;
exports.ARVO_STATUS_TYPES = ARVO_STATUS_TYPES;
exports.ARVO_STATUS_TYPE_REGISTRY = ARVO_STATUS_TYPE_REGISTRY;
exports.ArvoStatus = ArvoStatus;
exports.resolveStatusIcon = resolveStatusIcon;
exports.resolveStatusLabel = resolveStatusLabel;
//# sourceMappingURL=Status.cjs.map
