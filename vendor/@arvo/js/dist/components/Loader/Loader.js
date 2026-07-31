const VALID_VARIANTS = ["dot", "circular", "square"];
const VALID_SIZES = ["sm", "md", "lg"];
const VALID_ORIENTATIONS = ["horizontal", "vertical"];
const VALID_TONES = ["theme", "inverse", "subtle"];
const ARVO_LOADER_DEFAULT_MESSAGE = "Loading";
const ARVO_LOADER_VARIANTS = VALID_VARIANTS;
const ARVO_LOADER_SIZES = VALID_SIZES;
const ARVO_LOADER_ORIENTATIONS = VALID_ORIENTATIONS;
const ARVO_LOADER_TONES = VALID_TONES;
const DEFAULTS = {
  variant: "dot",
  size: "md",
  orientation: "horizontal",
  tone: "theme"
};
function normalizeMessage(value) {
  if (value === null || value === void 0) return null;
  return value.length > 0 ? value : null;
}
const _ArvoLoader = class _ArvoLoader {
  constructor(element, options) {
    this._shapeEl = null;
    this._msgEl = null;
    this._destroyed = false;
    this.el = element;
    const safeVariant = (options == null ? void 0 : options.variant) && VALID_VARIANTS.includes(options.variant) ? options.variant : DEFAULTS.variant;
    const safeSize = (options == null ? void 0 : options.size) && VALID_SIZES.includes(options.size) ? options.size : DEFAULTS.size;
    const safeOrientation = (options == null ? void 0 : options.orientation) && VALID_ORIENTATIONS.includes(options.orientation) ? options.orientation : DEFAULTS.orientation;
    const safeTone = (options == null ? void 0 : options.tone) && VALID_TONES.includes(options.tone) ? options.tone : DEFAULTS.tone;
    this._opts = {
      variant: safeVariant,
      size: safeSize,
      orientation: safeOrientation,
      tone: safeTone,
      message: options && "message" in options ? normalizeMessage(options.message) : ARVO_LOADER_DEFAULT_MESSAGE
    };
    this._render();
  }
  /** Factory matching the rest of the @arvo/js components. */
  static initialize(element, options) {
    const host = element ?? document.createElement("div");
    return new _ArvoLoader(host, options);
  }
  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  _render() {
    this.el.textContent = "";
    this.el.setAttribute("role", "status");
    this.el.setAttribute("aria-live", "polite");
    this._shapeEl = document.createElement("span");
    this._shapeEl.className = "arvo-loader__shape";
    this._shapeEl.setAttribute("aria-hidden", "true");
    this.el.appendChild(this._shapeEl);
    this._renderShape();
    this._msgEl = null;
    this._applyMessage();
    this._applyClasses();
  }
  /** Rebuild the inner shape DOM for the current variant. */
  _renderShape() {
    if (!this._shapeEl) return;
    this._shapeEl.textContent = "";
    const variant = this._opts.variant;
    if (variant === "dot") {
      for (let i = 0; i < 3; i += 1) {
        const dot = document.createElement("span");
        dot.className = "arvo-loader__dot";
        this._shapeEl.appendChild(dot);
      }
    } else if (variant === "circular") {
      const circle = document.createElement("span");
      circle.className = "arvo-loader__circle";
      this._shapeEl.appendChild(circle);
    } else {
      const square = document.createElement("span");
      square.className = "arvo-loader__square";
      this._shapeEl.appendChild(square);
    }
  }
  _applyClasses() {
    const { variant, size, orientation, tone } = this._opts;
    this.el.className = [
      "arvo-loader",
      `arvo-loader--${variant}`,
      `arvo-loader--${size}`,
      `arvo-loader--${orientation}`,
      `arvo-loader--${tone}`
    ].join(" ");
  }
  _applyMessage() {
    const visible = this._opts.message;
    const aria = visible ?? ARVO_LOADER_DEFAULT_MESSAGE;
    this.el.setAttribute("aria-label", aria);
    if (visible === null) {
      if (this._msgEl) {
        this._msgEl.remove();
        this._msgEl = null;
      }
      return;
    }
    if (!this._msgEl) {
      this._msgEl = document.createElement("span");
      this._msgEl.className = "arvo-loader__msg";
      this.el.appendChild(this._msgEl);
    }
    this._msgEl.textContent = visible;
  }
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  setVariant(variant) {
    if (!VALID_VARIANTS.includes(variant)) return;
    if (this._opts.variant === variant) return;
    this._opts.variant = variant;
    this._renderShape();
    this._applyClasses();
  }
  setSize(size) {
    if (!VALID_SIZES.includes(size)) return;
    this._opts.size = size;
    this._applyClasses();
  }
  setOrientation(orientation) {
    if (!VALID_ORIENTATIONS.includes(orientation)) return;
    this._opts.orientation = orientation;
    this._applyClasses();
  }
  setTone(tone) {
    if (!VALID_TONES.includes(tone)) return;
    this._opts.tone = tone;
    this._applyClasses();
  }
  setMessage(message) {
    this._opts.message = normalizeMessage(message);
    this._applyMessage();
  }
  /** Read-only accessors mirroring the React props (for tests / introspection). */
  variant() {
    return this._opts.variant;
  }
  size() {
    return this._opts.size;
  }
  orientation() {
    return this._opts.orientation;
  }
  tone() {
    return this._opts.tone;
  }
  message() {
    return this._opts.message;
  }
  /** Tear down inner DOM + decorations. The host element is preserved. */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this.el.textContent = "";
    this._shapeEl = null;
    this._msgEl = null;
    this.el.removeAttribute("class");
    this.el.removeAttribute("role");
    this.el.removeAttribute("aria-live");
    this.el.removeAttribute("aria-label");
  }
};
_ArvoLoader.VARIANTS = VALID_VARIANTS;
_ArvoLoader.SIZES = VALID_SIZES;
_ArvoLoader.ORIENTATIONS = VALID_ORIENTATIONS;
_ArvoLoader.TONES = VALID_TONES;
_ArvoLoader.DEFAULT_MESSAGE = ARVO_LOADER_DEFAULT_MESSAGE;
let ArvoLoader = _ArvoLoader;
export {
  ARVO_LOADER_DEFAULT_MESSAGE,
  ARVO_LOADER_ORIENTATIONS,
  ARVO_LOADER_SIZES,
  ARVO_LOADER_TONES,
  ARVO_LOADER_VARIANTS,
  ArvoLoader
};
//# sourceMappingURL=Loader.js.map
