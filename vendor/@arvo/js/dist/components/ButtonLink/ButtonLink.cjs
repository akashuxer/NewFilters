"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const _ArvoButtonLink = class _ArvoButtonLink {
  constructor(element, options) {
    var _a;
    this._iconEl = null;
    this._labelEl = null;
    this._externalIconEl = null;
    this._element = element;
    this._originalHref = element.getAttribute("href") ?? "";
    this._originalContent = ((_a = element.textContent) == null ? void 0 : _a.trim()) ?? "";
    const variant = (options == null ? void 0 : options.variant) && _ArvoButtonLink.VARIANTS.includes(options.variant) ? options.variant : _ArvoButtonLink.DEFAULTS.variant;
    const size = (options == null ? void 0 : options.size) && _ArvoButtonLink.SIZES.includes(options.size) ? options.size : _ArvoButtonLink.DEFAULTS.size;
    this._options = {
      ..._ArvoButtonLink.DEFAULTS,
      ...options,
      variant,
      size,
      label: (options == null ? void 0 : options.label) ?? this._originalContent,
      href: (options == null ? void 0 : options.href) ?? this._originalHref,
      target: (options == null ? void 0 : options.target) ?? null,
      icon: (options == null ? void 0 : options.icon) ?? null,
      ariaLabel: (options == null ? void 0 : options.ariaLabel) ?? null,
      onClick: (options == null ? void 0 : options.onClick) ?? null
    };
    this._boundHandleClick = this._handleClick.bind(this);
    this._render();
    this._bindEvents();
  }
  static initialize(element, options) {
    return new _ArvoButtonLink(element, options);
  }
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    el.classList.add("arvo-btn");
    el.classList.add(`arvo-btn--${this._options.variant}`);
    el.classList.add(`arvo-btn--${this._options.size}`);
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
    if (this._options.hasExternalLink) {
      this._externalIconEl = this._createExternalIconEl();
      el.appendChild(this._externalIconEl);
    }
    if (this._options.ariaLabel) {
      el.setAttribute("aria-label", this._options.ariaLabel);
    }
    this._applyHref();
    this._applyTarget();
    if (this._options.isDisabled) {
      this._applyDisabled(true);
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
  _createExternalIconEl() {
    const span = document.createElement("span");
    span.className = "arvo-btn__ico o9con o9con-external-link";
    span.setAttribute("aria-hidden", "true");
    return span;
  }
  _applyHref() {
    const el = this._element;
    if (!el) return;
    if (this._options.isDisabled) {
      el.removeAttribute("href");
    } else {
      el.setAttribute("href", this._options.href);
    }
  }
  _applyTarget() {
    const el = this._element;
    if (!el || this._options.isDisabled) return;
    if (this._options.target) {
      el.setAttribute("target", this._options.target);
      if (this._options.target === "_blank") {
        el.setAttribute("rel", "noopener noreferrer");
      }
    } else {
      el.removeAttribute("target");
      el.removeAttribute("rel");
    }
  }
  _applyDisabled(state) {
    const el = this._element;
    if (!el) return;
    if (state) {
      el.classList.add("is-disabled");
      el.setAttribute("aria-disabled", "true");
      el.removeAttribute("href");
      el.removeAttribute("target");
      el.removeAttribute("rel");
      el.setAttribute("tabindex", "0");
    } else {
      el.classList.remove("is-disabled");
      el.removeAttribute("aria-disabled");
      el.removeAttribute("tabindex");
      this._applyHref();
      this._applyTarget();
    }
  }
  _bindEvents() {
    var _a;
    (_a = this._element) == null ? void 0 : _a.addEventListener("click", this._boundHandleClick);
  }
  _handleClick(event) {
    if (this._options.isDisabled || this._options.isLoading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this._dispatchEvent("btn-lnk:click", {
      href: this._options.href
    });
    if (this._options.onClick) {
      this._options.onClick(event);
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
    }
  }
  setHref(href) {
    this._options.href = href;
    this._applyHref();
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
    if (!_ArvoButtonLink.VARIANTS.includes(variant)) return;
    const el = this._element;
    if (!el) return;
    _ArvoButtonLink.VARIANTS.forEach((v) => el.classList.remove(`arvo-btn--${v}`));
    el.classList.add(`arvo-btn--${variant}`);
    this._options.variant = variant;
  }
  setSize(size) {
    if (!_ArvoButtonLink.SIZES.includes(size)) return;
    const el = this._element;
    if (!el) return;
    _ArvoButtonLink.SIZES.forEach((s) => el.classList.remove(`arvo-btn--${s}`));
    el.classList.add(`arvo-btn--${size}`);
    this._options.size = size;
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
  }
  setExternalLink(hasExternalLink) {
    this._options.hasExternalLink = hasExternalLink;
    const el = this._element;
    if (!el) return;
    if (hasExternalLink) {
      if (!this._externalIconEl) {
        this._externalIconEl = this._createExternalIconEl();
        el.appendChild(this._externalIconEl);
      }
    } else if (this._externalIconEl) {
      this._externalIconEl.remove();
      this._externalIconEl = null;
    }
  }
  setAriaLabel(ariaLabel) {
    this._options.ariaLabel = ariaLabel;
    const el = this._element;
    if (!el) return;
    if (ariaLabel) {
      el.setAttribute("aria-label", ariaLabel);
    } else {
      el.removeAttribute("aria-label");
    }
  }
  disabled(state) {
    if (state === void 0) {
      return this._options.isDisabled;
    }
    this._options.isDisabled = state;
    this._applyDisabled(state);
  }
  focus() {
    if (this._element && !this._options.isLoading) {
      this._element.focus();
    }
  }
  destroy() {
    var _a, _b, _c;
    const el = this._element;
    if (!el) return;
    el.removeEventListener("click", this._boundHandleClick);
    el.classList.remove("arvo-btn", "arvo-btn--full-width", "is-disabled", "loading");
    _ArvoButtonLink.VARIANTS.forEach((v) => el.classList.remove(`arvo-btn--${v}`));
    _ArvoButtonLink.SIZES.forEach((s) => el.classList.remove(`arvo-btn--${s}`));
    el.removeAttribute("aria-label");
    el.removeAttribute("aria-disabled");
    el.removeAttribute("aria-busy");
    el.removeAttribute("tabindex");
    el.removeAttribute("target");
    el.removeAttribute("rel");
    if (this._originalHref) {
      el.setAttribute("href", this._originalHref);
    }
    (_a = this._iconEl) == null ? void 0 : _a.remove();
    (_b = this._labelEl) == null ? void 0 : _b.remove();
    (_c = this._externalIconEl) == null ? void 0 : _c.remove();
    el.textContent = this._originalContent;
    this._element = null;
    this._iconEl = null;
    this._labelEl = null;
    this._externalIconEl = null;
  }
};
_ArvoButtonLink.VARIANTS = ["primary", "secondary", "tertiary", "outline"];
_ArvoButtonLink.SIZES = ["sm", "md", "lg"];
_ArvoButtonLink.DEFAULTS = {
  variant: "primary",
  size: "md",
  label: "",
  href: "",
  target: null,
  icon: null,
  hasExternalLink: false,
  isDisabled: false,
  isFullWidth: false,
  isLoading: false,
  ariaLabel: null,
  onClick: null
};
let ArvoButtonLink = _ArvoButtonLink;
exports.ArvoButtonLink = ArvoButtonLink;
//# sourceMappingURL=ButtonLink.cjs.map
