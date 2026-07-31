import { connectTooltip, tooltipManager } from "@arvo/core";
const _ArvoContextHelp = class _ArvoContextHelp {
  constructor(element, options) {
    this._iconEl = null;
    this._tooltipConnector = null;
    this._isHover = false;
    this._isFocused = false;
    if (element.tagName.toLowerCase() !== "button") {
      console.warn(
        '[ArvoContextHelp] Expected a <button> element but received <%s>. Setting type="button".',
        element.tagName.toLowerCase()
      );
      element.setAttribute("type", "button");
    }
    this._element = element;
    const variant = options.variant && _ArvoContextHelp.VARIANTS.includes(options.variant) ? options.variant : _ArvoContextHelp.DEFAULTS.variant;
    const size = options.size && _ArvoContextHelp.SIZES.includes(options.size) ? options.size : _ArvoContextHelp.DEFAULTS.size;
    this._options = {
      ..._ArvoContextHelp.DEFAULTS,
      ...options,
      variant,
      size,
      ariaLabel: options.ariaLabel ?? null,
      onClick: options.onClick ?? null,
      onFocus: options.onFocus ?? null,
      onBlur: options.onBlur ?? null
    };
    this._boundHandleClick = this._handleClick.bind(this);
    this._boundHandleKeydown = this._handleKeydown.bind(this);
    this._boundHandleMouseEnter = this._handleMouseEnter.bind(this);
    this._boundHandleMouseLeave = this._handleMouseLeave.bind(this);
    this._boundHandleFocus = this._handleFocus.bind(this);
    this._boundHandleBlur = this._handleBlur.bind(this);
    this._render();
    this._bindEvents();
    this._connectTooltip();
  }
  static initialize(element, options) {
    return new _ArvoContextHelp(element, options);
  }
  _blocked() {
    return this._options.isDisabled || this._options.isLoading;
  }
  _glyphClass() {
    const isActive = (this._isHover || this._isFocused) && !this._blocked();
    if (this._options.variant === "question") {
      return isActive ? "o9con-question" : "o9con-question-circle";
    }
    return isActive ? "o9con-info-circle-filled" : "o9con-info-circle";
  }
  _refreshGlyph() {
    const icon = this._iconEl;
    if (!icon) return;
    const allGlyphs = ["o9con-info-circle", "o9con-info-circle-filled", "o9con-question-circle", "o9con-question"];
    allGlyphs.forEach((cls) => icon.classList.remove(cls));
    icon.classList.add(this._glyphClass());
  }
  _connectTooltip() {
    if (!this._element || this._blocked()) return;
    this._tooltipConnector = connectTooltip(tooltipManager, {
      anchor: this._element,
      content: this._options.content,
      placement: this._options.placement
    });
  }
  _disconnectTooltip() {
    var _a;
    (_a = this._tooltipConnector) == null ? void 0 : _a.destroy();
    this._tooltipConnector = null;
  }
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    el.classList.add("arvo-ctx-help");
    el.classList.add(`arvo-ctx-help--${this._options.variant}`);
    el.classList.add(`arvo-ctx-help--${this._options.size}`);
    el.setAttribute("type", "button");
    el.setAttribute("aria-label", this._options.ariaLabel ?? this._options.content);
    if (this._options.isDisabled) {
      el.disabled = true;
    }
    if (this._options.isLoading) {
      el.classList.add("loading");
      el.setAttribute("aria-busy", "true");
    }
    this._iconEl = document.createElement("span");
    this._iconEl.className = `arvo-ctx-help__ico o9con ${this._glyphClass()}`;
    this._iconEl.setAttribute("aria-hidden", "true");
    el.appendChild(this._iconEl);
  }
  _bindEvents() {
    const el = this._element;
    if (!el) return;
    el.addEventListener("click", this._boundHandleClick);
    el.addEventListener("keydown", this._boundHandleKeydown);
    el.addEventListener("mouseenter", this._boundHandleMouseEnter);
    el.addEventListener("mouseleave", this._boundHandleMouseLeave);
    el.addEventListener("focus", this._boundHandleFocus);
    el.addEventListener("blur", this._boundHandleBlur);
  }
  _handleClick(event) {
    var _a, _b;
    if (this._blocked()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    (_b = (_a = this._options).onClick) == null ? void 0 : _b.call(_a, event);
  }
  _handleKeydown(event) {
    if (this._blocked() && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }
  _handleMouseEnter() {
    this._isHover = true;
    this._refreshGlyph();
  }
  _handleMouseLeave() {
    this._isHover = false;
    this._refreshGlyph();
  }
  _handleFocus(event) {
    var _a, _b;
    this._isFocused = true;
    this._refreshGlyph();
    (_b = (_a = this._options).onFocus) == null ? void 0 : _b.call(_a, event);
  }
  _handleBlur(event) {
    var _a, _b;
    this._isFocused = false;
    this._refreshGlyph();
    (_b = (_a = this._options).onBlur) == null ? void 0 : _b.call(_a, event);
  }
  // ---------------------------------------------------------------------------
  // Public methods
  // ---------------------------------------------------------------------------
  setContent(content) {
    var _a, _b;
    this._options.content = content;
    if (!this._options.ariaLabel) {
      (_a = this._element) == null ? void 0 : _a.setAttribute("aria-label", content);
    }
    (_b = this._tooltipConnector) == null ? void 0 : _b.update({ content });
  }
  setVariant(variant) {
    if (!_ArvoContextHelp.VARIANTS.includes(variant)) return;
    const el = this._element;
    if (!el) return;
    _ArvoContextHelp.VARIANTS.forEach((v) => el.classList.remove(`arvo-ctx-help--${v}`));
    el.classList.add(`arvo-ctx-help--${variant}`);
    this._options.variant = variant;
    this._refreshGlyph();
  }
  setSize(size) {
    if (!_ArvoContextHelp.SIZES.includes(size)) return;
    const el = this._element;
    if (!el) return;
    _ArvoContextHelp.SIZES.forEach((s) => el.classList.remove(`arvo-ctx-help--${s}`));
    el.classList.add(`arvo-ctx-help--${size}`);
    this._options.size = size;
  }
  setLoading(loading) {
    var _a, _b, _c, _d;
    this._options.isLoading = loading;
    if (loading) {
      (_a = this._element) == null ? void 0 : _a.classList.add("loading");
      (_b = this._element) == null ? void 0 : _b.setAttribute("aria-busy", "true");
      this._disconnectTooltip();
    } else {
      (_c = this._element) == null ? void 0 : _c.classList.remove("loading");
      (_d = this._element) == null ? void 0 : _d.removeAttribute("aria-busy");
      if (!this._options.isDisabled) {
        this._connectTooltip();
      }
    }
    this._refreshGlyph();
  }
  disabled(state) {
    if (state === void 0) {
      return this._options.isDisabled;
    }
    this._options.isDisabled = state;
    if (this._element) {
      this._element.disabled = state;
    }
    if (state) {
      this._disconnectTooltip();
    } else if (!this._options.isLoading) {
      this._connectTooltip();
    }
    this._refreshGlyph();
  }
  focus() {
    if (this._element && !this._options.isLoading) {
      this._element.focus();
    }
  }
  destroy() {
    var _a;
    const el = this._element;
    if (!el) return;
    el.removeEventListener("click", this._boundHandleClick);
    el.removeEventListener("keydown", this._boundHandleKeydown);
    el.removeEventListener("mouseenter", this._boundHandleMouseEnter);
    el.removeEventListener("mouseleave", this._boundHandleMouseLeave);
    el.removeEventListener("focus", this._boundHandleFocus);
    el.removeEventListener("blur", this._boundHandleBlur);
    el.classList.remove("arvo-ctx-help", "loading");
    _ArvoContextHelp.VARIANTS.forEach((v) => el.classList.remove(`arvo-ctx-help--${v}`));
    _ArvoContextHelp.SIZES.forEach((s) => el.classList.remove(`arvo-ctx-help--${s}`));
    el.removeAttribute("aria-label");
    el.removeAttribute("aria-busy");
    el.disabled = false;
    (_a = this._iconEl) == null ? void 0 : _a.remove();
    this._disconnectTooltip();
    this._element = null;
    this._iconEl = null;
  }
};
_ArvoContextHelp.VARIANTS = ["info", "question"];
_ArvoContextHelp.SIZES = ["sm", "lg"];
_ArvoContextHelp.DEFAULTS = {
  content: "",
  variant: "info",
  size: "sm",
  placement: "bottom-center",
  ariaLabel: null,
  isDisabled: false,
  isLoading: false,
  onClick: null,
  onFocus: null,
  onBlur: null
};
let ArvoContextHelp = _ArvoContextHelp;
export {
  ArvoContextHelp
};
//# sourceMappingURL=ContextHelp.js.map
