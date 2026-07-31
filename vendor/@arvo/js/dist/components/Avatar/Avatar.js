import { resolveInitials } from "@arvo/core";
const VALID_VARIANTS = [
  "image",
  "initials",
  "icon",
  "logo",
  "o9logo",
  "novai"
];
const VALID_SIZES = ["xs", "sm", "md", "lg", "xl"];
const VALID_APPEARANCES = ["filled", "outline", "primary"];
const VALID_COLOR_MODES = ["default", "semantic", "custom"];
const VALID_SEMANTIC_TYPES = [
  "positive",
  "negative",
  "warning",
  "info"
];
const VALID_CUSTOM_COLORS = [
  "purple",
  "pink",
  "glacier",
  "amber",
  "greenish",
  "bluish"
];
const DEFAULT_ICON = "user";
const O9LOGO_ICON = "o9-logo";
const NOVAI_ICON = "genai";
const DEFAULT_LOGO_BASE_URL = "/logos";
const DEFAULTS = {
  variant: "icon",
  size: "md",
  colorMode: "default",
  semanticType: "positive",
  customColor: "purple",
  isInteractive: false,
  isDisabled: false,
  isLoading: false
};
function autoTooltip(opts) {
  switch (opts.variant) {
    case "o9logo":
      return "o9 Platform";
    case "novai":
      return "Nova AI assistant";
    case "image":
      return opts.alt || opts.name || "User avatar";
    case "initials":
      return opts.name || "User";
    case "logo":
      return opts.name || opts.logo || "Logo";
    case "icon":
    default:
      return opts.name || "User";
  }
}
function defaultAppearance(variant) {
  return variant === "novai" ? "outline" : "filled";
}
function pickEnum(value, valid, fallback) {
  return value !== void 0 && valid.includes(value) ? value : fallback;
}
const _ArvoAvatar = class _ArvoAvatar {
  constructor(element, options) {
    this._imgEl = null;
    this._innerEl = null;
    this._imageFailed = false;
    this._destroyed = false;
    this._onClickBound = null;
    this._onKeyDownBound = null;
    this._onImageErrorBound = null;
    this._onImageLoadBound = null;
    this.el = element;
    this._opts = this._normalize(options);
    this._render();
    this._bindHandlers();
  }
  static initialize(element, options) {
    const host = element ?? document.createElement("span");
    return new _ArvoAvatar(host, options);
  }
  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------
  _normalize(options) {
    const o = options ?? {};
    const variant = pickEnum(o.variant, VALID_VARIANTS, DEFAULTS.variant);
    let appearance = pickEnum(
      o.appearance,
      VALID_APPEARANCES,
      defaultAppearance(variant)
    );
    if (variant === "logo" && appearance === "filled") appearance = "outline";
    if (variant === "novai" && appearance === "primary") appearance = "outline";
    return {
      variant,
      size: pickEnum(o.size, VALID_SIZES, DEFAULTS.size),
      appearance,
      colorMode: pickEnum(o.colorMode, VALID_COLOR_MODES, DEFAULTS.colorMode),
      semanticType: pickEnum(
        o.semanticType,
        VALID_SEMANTIC_TYPES,
        DEFAULTS.semanticType
      ),
      customColor: pickEnum(o.customColor, VALID_CUSTOM_COLORS, DEFAULTS.customColor),
      name: o.name ?? null,
      email: o.email ?? null,
      src: o.src ?? null,
      alt: o.alt ?? null,
      icon: o.icon ?? null,
      logo: o.logo ?? null,
      logoBaseUrl: o.logoBaseUrl ?? DEFAULT_LOGO_BASE_URL,
      tooltip: o.tooltip ?? null,
      isInteractive: o.isInteractive ?? DEFAULTS.isInteractive,
      isDisabled: o.isDisabled ?? DEFAULTS.isDisabled,
      isLoading: o.isLoading ?? DEFAULTS.isLoading,
      href: o.href ?? null,
      target: o.target ?? null,
      rel: o.rel ?? null,
      onClick: o.onClick ?? null,
      id: o.id ?? null
    };
  }
  _isSvgLogo() {
    return this._opts.variant === "logo" && Boolean(this._opts.logo);
  }
  _render() {
    this._teardownImageListeners();
    this.el.textContent = "";
    this._imgEl = null;
    this._innerEl = null;
    if (this._opts.id) this.el.id = this._opts.id;
    const effectiveVariant = this._effectiveVariant();
    const isSvgLogo = this._isSvgLogo();
    if (effectiveVariant === "image") {
      const img = document.createElement("img");
      img.className = "arvo-avt__img";
      if (this._opts.src) img.src = this._opts.src;
      img.alt = "";
      this._imgEl = img;
      this.el.appendChild(img);
    } else if (effectiveVariant === "initials") {
      const text = document.createElement("span");
      text.className = "arvo-avt__text";
      text.setAttribute("aria-hidden", "true");
      text.textContent = this._resolvedInitials();
      this._innerEl = text;
      this.el.appendChild(text);
    } else if (isSvgLogo) {
      const logoEl = document.createElement("span");
      logoEl.className = "arvo-avt__logo";
      logoEl.setAttribute("aria-hidden", "true");
      this._innerEl = logoEl;
      this.el.appendChild(logoEl);
    } else {
      const i = document.createElement("i");
      i.className = `arvo-avt__ico o9con o9con-${this._resolvedIcon(effectiveVariant)}`;
      i.setAttribute("aria-hidden", "true");
      this._innerEl = i;
      this.el.appendChild(i);
    }
    this._applyClasses();
    this._applyAttributes();
    this._applyLogoStyle();
  }
  _applyLogoStyle() {
    if (this._isSvgLogo() && this._opts.logo) {
      const base = this._opts.logoBaseUrl || DEFAULT_LOGO_BASE_URL;
      this.el.style.setProperty(
        "--arvo-avt-logo-url-light",
        `url('${base}/light/${this._opts.logo}.svg')`
      );
      this.el.style.setProperty(
        "--arvo-avt-logo-url-dark",
        `url('${base}/dark/${this._opts.logo}.svg')`
      );
    } else {
      this.el.style.removeProperty("--arvo-avt-logo-url-light");
      this.el.style.removeProperty("--arvo-avt-logo-url-dark");
    }
  }
  _bindHandlers() {
    if (this._imgEl) {
      this._onImageErrorBound = this._handleImageError.bind(this);
      this._onImageLoadBound = this._handleImageLoad.bind(this);
      this._imgEl.addEventListener("error", this._onImageErrorBound);
      this._imgEl.addEventListener("load", this._onImageLoadBound);
    }
    this._onClickBound = this._handleClick.bind(this);
    this._onKeyDownBound = this._handleKeyDown.bind(this);
    this.el.addEventListener("click", this._onClickBound);
    this.el.addEventListener("keydown", this._onKeyDownBound);
  }
  _teardownImageListeners() {
    if (this._imgEl) {
      if (this._onImageErrorBound) {
        this._imgEl.removeEventListener("error", this._onImageErrorBound);
      }
      if (this._onImageLoadBound) {
        this._imgEl.removeEventListener("load", this._onImageLoadBound);
      }
    }
    this._onImageErrorBound = null;
    this._onImageLoadBound = null;
  }
  // -------------------------------------------------------------------------
  // Resolution helpers
  // -------------------------------------------------------------------------
  _effectiveVariant() {
    const { variant, src } = this._opts;
    if (variant === "image" && (!src || this._imageFailed)) {
      return this._resolvedInitials() ? "initials" : "icon";
    }
    return variant;
  }
  _resolvedInitials() {
    return resolveInitials({
      name: this._opts.name ?? void 0,
      email: this._opts.email ?? void 0,
      maxChars: this._opts.size === "xs" ? 1 : 2
    });
  }
  _resolvedIcon(effectiveVariant) {
    if (effectiveVariant === "o9logo") return O9LOGO_ICON;
    if (effectiveVariant === "novai") return NOVAI_ICON;
    if (effectiveVariant === "logo") return this._opts.icon || DEFAULT_ICON;
    return this._opts.icon || DEFAULT_ICON;
  }
  _isEffectivelyInteractive() {
    return this._opts.isInteractive || Boolean(this._opts.href) || typeof this._opts.onClick === "function";
  }
  // -------------------------------------------------------------------------
  // Class + attribute application
  // -------------------------------------------------------------------------
  _applyClasses() {
    const {
      size,
      appearance,
      colorMode,
      semanticType,
      customColor,
      isLoading,
      variant
    } = this._opts;
    const effectiveVariant = this._effectiveVariant();
    const effectiveAppearance = colorMode === "semantic" ? "filled" : appearance;
    const themingApplies = effectiveVariant === "icon" || effectiveVariant === "initials" || effectiveVariant === "logo";
    const emitAppearanceClass = themingApplies || variant === "novai";
    const isInteractive = this._isEffectivelyInteractive();
    const isSvgLogo = this._isSvgLogo();
    const existing = Array.from(this.el.classList).filter(
      (c) => !c.startsWith("arvo-avt") && c !== "interactive" && c !== "loading"
    );
    const classes = [
      ...existing,
      "arvo-avt",
      `arvo-avt--${effectiveVariant}`,
      `arvo-avt--${size}`
    ];
    if (emitAppearanceClass) {
      classes.push(`arvo-avt--${effectiveAppearance}`);
    }
    if ((effectiveVariant === "icon" || effectiveVariant === "initials") && colorMode !== "default") {
      classes.push(`arvo-avt--${colorMode}`);
    }
    if ((effectiveVariant === "icon" || effectiveVariant === "initials") && colorMode === "semantic") {
      classes.push(`arvo-avt--${semanticType}`);
    }
    if ((effectiveVariant === "icon" || effectiveVariant === "initials") && colorMode === "custom") {
      classes.push(`arvo-avt--${customColor}`);
    }
    if (isSvgLogo) classes.push("arvo-avt--svg");
    if (isInteractive) classes.push("interactive");
    if (isLoading) classes.push("loading");
    this.el.className = classes.join(" ");
  }
  _applyAttributes() {
    const effectiveVariant = this._effectiveVariant();
    const { isDisabled, isLoading, tooltip, name, alt, logo, href, target, rel } = this._opts;
    const isInteractive = this._isEffectivelyInteractive();
    const resolvedTooltip = tooltip ?? autoTooltip({
      variant: effectiveVariant,
      name,
      alt,
      logo
    });
    this.el.setAttribute("aria-label", resolvedTooltip);
    this.el.setAttribute("title", resolvedTooltip);
    if (!isInteractive && !(this.el instanceof HTMLButtonElement) && !(this.el instanceof HTMLAnchorElement)) {
      this.el.setAttribute("role", "img");
    } else {
      this.el.removeAttribute("role");
    }
    if (isDisabled) {
      this.el.setAttribute("aria-disabled", "true");
      this.el.setAttribute("tabindex", "-1");
      if (this.el instanceof HTMLButtonElement) this.el.disabled = true;
    } else {
      this.el.removeAttribute("aria-disabled");
      this.el.removeAttribute("tabindex");
      if (this.el instanceof HTMLButtonElement) this.el.disabled = false;
    }
    if (isLoading) this.el.setAttribute("aria-busy", "true");
    else this.el.removeAttribute("aria-busy");
    if (this.el instanceof HTMLAnchorElement) {
      if (href && !isDisabled) this.el.href = href;
      else this.el.removeAttribute("href");
      if (target && !isDisabled) {
        this.el.target = target;
        const effectiveRel = rel ?? (target === "_blank" ? "noopener noreferrer" : null);
        if (effectiveRel) this.el.rel = effectiveRel;
        else this.el.removeAttribute("rel");
      } else {
        this.el.removeAttribute("target");
        this.el.removeAttribute("rel");
      }
    }
  }
  // -------------------------------------------------------------------------
  // Event handlers
  // -------------------------------------------------------------------------
  _handleClick(event) {
    var _a, _b;
    if (!this._isEffectivelyInteractive()) return;
    if (this._opts.isDisabled || this._opts.isLoading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    (_b = (_a = this._opts).onClick) == null ? void 0 : _b.call(_a, event);
    this.el.dispatchEvent(new CustomEvent("avt:click", { bubbles: true }));
  }
  _handleKeyDown(event) {
    if (!this._isEffectivelyInteractive()) return;
    if (this._opts.isDisabled || this._opts.isLoading) return;
    if (this.el instanceof HTMLButtonElement) {
      return;
    }
    const isAnchor = this.el instanceof HTMLAnchorElement;
    if (event.key === "Enter" && !isAnchor) {
      event.preventDefault();
      this.el.click();
    } else if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      this.el.click();
    }
  }
  _handleImageError() {
    this._imageFailed = true;
    const src = this._opts.src ?? "";
    this.el.dispatchEvent(
      new CustomEvent("avt:image-error", { bubbles: true, detail: { src } })
    );
    const fallback = this._resolvedInitials() ? "initials" : "icon";
    this._render();
    this._bindHandlers();
    this.el.dispatchEvent(
      new CustomEvent("avt:image-fallback", {
        bubbles: true,
        detail: { src, fallback }
      })
    );
  }
  _handleImageLoad() {
    const src = this._opts.src ?? "";
    this.el.dispatchEvent(
      new CustomEvent("avt:image-load", { bubbles: true, detail: { src } })
    );
  }
  // -------------------------------------------------------------------------
  // Public API (mirrors React props as method setters)
  // -------------------------------------------------------------------------
  setVariant(variant) {
    if (!VALID_VARIANTS.includes(variant)) return;
    const prevVariant = this._opts.variant;
    this._opts.variant = variant;
    if (variant === "logo" && this._opts.appearance === "filled") {
      this._opts.appearance = "outline";
    }
    if (variant === "novai" && this._opts.appearance === "primary") {
      this._opts.appearance = "outline";
    }
    if (this._opts.appearance === defaultAppearance(prevVariant)) {
      this._opts.appearance = defaultAppearance(variant);
    }
    this._imageFailed = false;
    this._render();
    this._bindHandlers();
  }
  setSize(size) {
    if (!VALID_SIZES.includes(size)) return;
    this._opts.size = size;
    this._render();
    this._bindHandlers();
  }
  setAppearance(appearance) {
    if (!VALID_APPEARANCES.includes(appearance)) return;
    if (this._opts.variant === "logo" && appearance === "filled") {
      this._opts.appearance = "outline";
    } else if (this._opts.variant === "novai" && appearance === "primary") {
      this._opts.appearance = "outline";
    } else {
      this._opts.appearance = appearance;
    }
    this._applyClasses();
  }
  setColorMode(mode) {
    if (!VALID_COLOR_MODES.includes(mode)) return;
    this._opts.colorMode = mode;
    this._applyClasses();
  }
  setSemanticType(type) {
    if (!VALID_SEMANTIC_TYPES.includes(type)) return;
    this._opts.semanticType = type;
    this._applyClasses();
  }
  setCustomColor(color) {
    if (!VALID_CUSTOM_COLORS.includes(color)) return;
    this._opts.customColor = color;
    this._applyClasses();
  }
  setName(name) {
    this._opts.name = name;
    this._render();
    this._bindHandlers();
  }
  setSrc(src) {
    this._opts.src = src;
    this._imageFailed = false;
    this._render();
    this._bindHandlers();
  }
  setIcon(icon) {
    this._opts.icon = icon;
    const effectiveVariant = this._effectiveVariant();
    if (this._innerEl && (effectiveVariant === "icon" || effectiveVariant === "logo") && !this._isSvgLogo()) {
      this._innerEl.className = `arvo-avt__ico o9con o9con-${this._resolvedIcon(effectiveVariant)}`;
    }
  }
  /** Switch the brand asset rendered by variant='logo'. Pass null to clear
   *  and fall back to the o9con `icon` glyph. */
  setLogo(logo) {
    this._opts.logo = logo;
    this._render();
    this._bindHandlers();
  }
  setLogoBaseUrl(baseUrl) {
    this._opts.logoBaseUrl = baseUrl || DEFAULT_LOGO_BASE_URL;
    this._applyLogoStyle();
  }
  setTooltip(tooltip) {
    this._opts.tooltip = tooltip;
    this._applyAttributes();
  }
  disabled(state) {
    if (state === void 0) return this._opts.isDisabled;
    this._opts.isDisabled = !!state;
    this._applyAttributes();
    this._applyClasses();
  }
  loading(state) {
    if (state === void 0) return this._opts.isLoading;
    this._opts.isLoading = !!state;
    this._applyClasses();
    this._applyAttributes();
  }
  /** Read-only accessors mirroring the React props for testing. */
  variant() {
    return this._opts.variant;
  }
  size() {
    return this._opts.size;
  }
  appearance() {
    return this._opts.appearance;
  }
  colorMode() {
    return this._opts.colorMode;
  }
  semanticType() {
    return this._opts.semanticType;
  }
  customColor() {
    return this._opts.customColor;
  }
  /** Tear down inner DOM + listeners + decorations. The host element is preserved. */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._teardownImageListeners();
    if (this._onClickBound) {
      this.el.removeEventListener("click", this._onClickBound);
    }
    if (this._onKeyDownBound) {
      this.el.removeEventListener("keydown", this._onKeyDownBound);
    }
    this._onClickBound = null;
    this._onKeyDownBound = null;
    this.el.textContent = "";
    this.el.removeAttribute("class");
    this.el.removeAttribute("role");
    this.el.removeAttribute("aria-label");
    this.el.removeAttribute("aria-disabled");
    this.el.removeAttribute("aria-busy");
    this.el.removeAttribute("tabindex");
    this.el.removeAttribute("title");
    if (this.el instanceof HTMLButtonElement) this.el.disabled = false;
  }
};
_ArvoAvatar.VARIANTS = VALID_VARIANTS;
_ArvoAvatar.SIZES = VALID_SIZES;
_ArvoAvatar.APPEARANCES = VALID_APPEARANCES;
_ArvoAvatar.COLOR_MODES = VALID_COLOR_MODES;
_ArvoAvatar.SEMANTIC_TYPES = VALID_SEMANTIC_TYPES;
_ArvoAvatar.CUSTOM_COLORS = VALID_CUSTOM_COLORS;
let ArvoAvatar = _ArvoAvatar;
export {
  ArvoAvatar
};
//# sourceMappingURL=Avatar.js.map
