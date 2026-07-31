"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const _ArvoLink = class _ArvoLink {
  constructor(element, options) {
    var _a;
    this._iconEl = null;
    this._labelEl = null;
    this._extEl = null;
    this._element = element;
    this._originalHref = element.getAttribute("href") ?? "";
    this._originalContent = ((_a = element.textContent) == null ? void 0 : _a.trim()) ?? "";
    const variant = (options == null ? void 0 : options.variant) && _ArvoLink.VARIANTS.includes(options.variant) ? options.variant : _ArvoLink.DEFAULTS.variant;
    const size = (options == null ? void 0 : options.size) && _ArvoLink.SIZES.includes(options.size) ? options.size : _ArvoLink.DEFAULTS.size;
    this._options = {
      ..._ArvoLink.DEFAULTS,
      ...options,
      variant,
      size,
      label: (options == null ? void 0 : options.label) ?? this._originalContent,
      href: (options == null ? void 0 : options.href) ?? this._originalHref,
      target: (options == null ? void 0 : options.target) ?? null,
      icon: (options == null ? void 0 : options.icon) ?? null,
      onClick: (options == null ? void 0 : options.onClick) ?? null
    };
    this._boundHandleClick = this._handleClick.bind(this);
    this._boundHandleKeyDown = this._handleKeyDown.bind(this);
    this._render();
    this._bindEvents();
  }
  static initialize(element, options) {
    return new _ArvoLink(element, options);
  }
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    el.classList.add("arvo-lnk");
    el.classList.add(`arvo-lnk--${this._options.variant}`);
    el.classList.add(`arvo-lnk--${this._options.size}`);
    if (this._options.icon) {
      this._iconEl = this._createIconEl(this._options.icon);
      el.appendChild(this._iconEl);
    }
    this._labelEl = document.createElement("span");
    this._labelEl.className = "arvo-lnk__lbl";
    this._labelEl.textContent = this._options.label;
    el.appendChild(this._labelEl);
    if (this._options.isExternal) {
      this._extEl = this._createExtEl();
      el.appendChild(this._extEl);
    }
    this._applyHref();
    this._applyTarget();
    if (this._options.isVisited) {
      el.classList.add("visited");
    }
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
    span.className = `arvo-lnk__ico o9con o9con-${iconName}`;
    span.setAttribute("aria-hidden", "true");
    return span;
  }
  _createExtEl() {
    const span = document.createElement("span");
    span.className = "arvo-lnk__ext o9con o9con-external-link";
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
    const effectiveTarget = this._options.isExternal && !this._options.target ? "_blank" : this._options.target;
    if (effectiveTarget) {
      el.setAttribute("target", effectiveTarget);
      if (effectiveTarget === "_blank") {
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
    var _a, _b;
    (_a = this._element) == null ? void 0 : _a.addEventListener("click", this._boundHandleClick);
    (_b = this._element) == null ? void 0 : _b.addEventListener("keydown", this._boundHandleKeyDown);
  }
  _handleClick(event) {
    if (this._options.isDisabled || this._options.isLoading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this._dispatchEvent("lnk:click", {
      href: this._options.href,
      isExternal: this._options.isExternal
    });
    if (this._options.onClick) {
      this._options.onClick(event);
    }
  }
  // Anchors normally activate on Enter via a browser-synthesized click, but
  // some embedding environments swallow that synthetic event. Activate
  // explicitly so onClick / lnk:click / navigation always fire, and suppress
  // activation when blocked. preventDefault prevents a double-fire when the
  // browser would have synthesized its own click.
  _handleKeyDown(event) {
    var _a;
    if (event.key !== "Enter") return;
    if (this._options.isDisabled || this._options.isLoading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.defaultPrevented) return;
    event.preventDefault();
    (_a = this._element) == null ? void 0 : _a.click();
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
  setExternal(isExternal) {
    var _a;
    this._options.isExternal = isExternal;
    if (isExternal && !this._extEl) {
      this._extEl = this._createExtEl();
      (_a = this._element) == null ? void 0 : _a.appendChild(this._extEl);
    } else if (!isExternal && this._extEl) {
      this._extEl.remove();
      this._extEl = null;
    }
    this._applyTarget();
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
    el.removeEventListener("keydown", this._boundHandleKeyDown);
    el.classList.remove("arvo-lnk", "visited", "is-disabled", "loading");
    _ArvoLink.VARIANTS.forEach((v) => el.classList.remove(`arvo-lnk--${v}`));
    _ArvoLink.SIZES.forEach((s) => el.classList.remove(`arvo-lnk--${s}`));
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
    (_c = this._extEl) == null ? void 0 : _c.remove();
    el.textContent = this._originalContent;
    this._element = null;
    this._iconEl = null;
    this._labelEl = null;
    this._extEl = null;
  }
};
_ArvoLink.VARIANTS = ["primary", "secondary", "tertiary"];
_ArvoLink.SIZES = ["sm", "lg"];
_ArvoLink.DEFAULTS = {
  variant: "primary",
  size: "lg",
  label: "",
  href: "",
  target: null,
  icon: null,
  isExternal: false,
  isDisabled: false,
  isVisited: true,
  isLoading: false,
  onClick: null
};
let ArvoLink = _ArvoLink;
exports.ArvoLink = ArvoLink;
//# sourceMappingURL=Link.cjs.map
