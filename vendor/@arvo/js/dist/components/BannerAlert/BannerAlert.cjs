"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const core = require("@arvo/core");
const utils = require("@arvo/utils");
const IconButton = require("../IconButton/IconButton.cjs");
const Button = require("../Button/Button.cjs");
const Link = require("../Link/Link.cjs");
const TYPES = [
  "positive",
  "info",
  "neutral",
  "warning",
  "negative",
  "block"
];
const ASSERTIVE_TYPES = /* @__PURE__ */ new Set([
  "negative",
  "block"
]);
function resolveRole(type, roleOverride) {
  if (roleOverride) return roleOverride;
  return ASSERTIVE_TYPES.has(type) ? "alert" : "status";
}
class ArvoBannerAlert {
  constructor(element, options) {
    var _a;
    this._iconEl = null;
    this._iconOverrideEl = null;
    this._contentEl = null;
    this._copyEl = null;
    this._titleEl = null;
    this._msgEl = null;
    this._actionsEl = null;
    this._btnEl = null;
    this._btnInstance = null;
    this._linkEl = null;
    this._linkInstance = null;
    this._closeEl = null;
    this._closeBtnInstance = null;
    this._titleTooltip = null;
    this._addedRole = false;
    this._addedAriaBusy = false;
    this._destroyed = false;
    this._isClosing = false;
    this._root = element;
    this._options = { ...options };
    const rawType = options == null ? void 0 : options.type;
    this._currentType = rawType && TYPES.includes(rawType) ? rawType : "info";
    this._isCompact = (options == null ? void 0 : options.isCompact) === true;
    this._isDismissible = (options == null ? void 0 : options.isDismissible) !== false;
    this._icon = (options == null ? void 0 : options.icon) ?? null;
    this._isLoading = (options == null ? void 0 : options.isLoading) === true;
    this._userRoleOverride = (options == null ? void 0 : options.role) !== void 0;
    if (this._isCompact && (options == null ? void 0 : options.title) != null && typeof process !== "undefined" && ((_a = process.env) == null ? void 0 : _a.NODE_ENV) !== "production" && typeof console !== "undefined" && typeof console.warn === "function") {
      console.warn(
        "[ArvoBannerAlert] `title` is ignored when `isCompact` is true. The title will not be rendered in compact mode."
      );
    }
    this._render();
  }
  // Custom icon override is gated on `type === 'neutral'` -- every other
  // type renders its semantic glyph via the SCSS pattern and ignores `_icon`.
  get _iconOverrideActive() {
    return this._currentType === "neutral" && this._icon !== null && this._icon !== "";
  }
  static initialize(element, options) {
    return new ArvoBannerAlert(element, options);
  }
  // -- Render -------------------------------------------------------------
  _render() {
    const root = this._root;
    if (!root) return;
    root.classList.add("arvo-bnr-alert");
    root.classList.add(`arvo-bnr-alert--${this._currentType}`);
    if (this._isCompact) root.classList.add("arvo-bnr-alert--compact");
    if (this._isCompact || this._options.title == null) {
      root.classList.add("arvo-bnr-alert--no-title");
    }
    if (this._isLoading) root.classList.add("loading");
    if (this._iconOverrideActive) root.classList.add("has-icon-override");
    const resolvedRole = resolveRole(this._currentType, this._options.role);
    root.setAttribute("role", resolvedRole);
    this._addedRole = true;
    if (this._isLoading) {
      root.setAttribute("aria-busy", "true");
      this._addedAriaBusy = true;
    }
    const ico = document.createElement("span");
    ico.className = "arvo-bnr-alert__ico o9con";
    ico.setAttribute("aria-hidden", "true");
    this._iconEl = ico;
    if (this._iconOverrideActive) {
      this._iconOverrideEl = document.createElement("i");
      this._iconOverrideEl.className = `o9con o9con-${this._icon}`;
      ico.appendChild(this._iconOverrideEl);
    }
    root.appendChild(ico);
    const content = document.createElement("div");
    content.className = "arvo-bnr-alert__content";
    this._contentEl = content;
    if (this._isCompact) {
      const msg = document.createElement("p");
      msg.className = "arvo-bnr-alert__msg";
      this._writeMessageInto(msg, this._options.message);
      this._msgEl = msg;
      content.appendChild(msg);
    } else {
      const copy = document.createElement("div");
      copy.className = "arvo-bnr-alert__copy";
      this._copyEl = copy;
      if (this._options.title != null) {
        const titleEl = document.createElement("p");
        titleEl.className = "arvo-bnr-alert__title";
        titleEl.textContent = this._options.title;
        this._titleEl = titleEl;
        copy.appendChild(titleEl);
      }
      const msg = document.createElement("p");
      msg.className = "arvo-bnr-alert__msg";
      this._writeMessageInto(msg, this._options.message);
      this._msgEl = msg;
      copy.appendChild(msg);
      content.appendChild(copy);
      if (this._options.button || this._options.link) {
        const actions = document.createElement("div");
        actions.className = "arvo-bnr-alert__actions";
        this._actionsEl = actions;
        if (this._options.button) {
          const btnEl = document.createElement("button");
          btnEl.className = "arvo-bnr-alert__btn";
          this._btnEl = btnEl;
          this._btnInstance = Button.ArvoButton.initialize(btnEl, {
            variant: "outline",
            size: "sm",
            label: this._options.button.label,
            icon: this._options.button.icon ?? null,
            isDisabled: this._options.button.isDisabled,
            isLoading: this._options.button.isLoading,
            onClick: this._options.button.onClick
          });
          if (this._options.button.ariaLabel) {
            btnEl.setAttribute("aria-label", this._options.button.ariaLabel);
          }
          actions.appendChild(btnEl);
        }
        if (this._options.link) {
          const aEl = document.createElement("a");
          aEl.className = "arvo-bnr-alert__link";
          this._linkEl = aEl;
          this._linkInstance = Link.ArvoLink.initialize(aEl, {
            size: "sm",
            variant: "primary",
            label: this._options.link.label,
            href: this._options.link.href,
            target: this._options.link.target,
            icon: this._options.link.icon ?? null,
            isExternal: this._options.link.isExternal ?? false,
            onClick: this._options.link.onClick
          });
          if (this._options.link.rel && aEl.getAttribute("target") !== "_blank") {
            aEl.setAttribute("rel", this._options.link.rel);
          }
          if (this._options.link.ariaLabel) {
            aEl.setAttribute("aria-label", this._options.link.ariaLabel);
          }
          actions.appendChild(aEl);
        }
        content.appendChild(actions);
      }
    }
    root.appendChild(content);
    if (!this._isCompact && this._titleEl && this._options.title) {
      this._titleTooltip = utils.attachTitleTruncationTooltip({
        element: this._titleEl,
        content: this._options.title,
        placement: "bottom-center"
      });
    }
    if (this._isDismissible) {
      const closeBtn = document.createElement("button");
      closeBtn.className = "arvo-bnr-alert__close";
      this._closeBtnInstance = IconButton.ArvoIconButton.initialize(closeBtn, {
        variant: "tertiary",
        size: "xs",
        icon: "close",
        tooltip: "Dismiss alert",
        onClick: () => this.dismiss()
      });
      closeBtn.setAttribute("aria-label", "Dismiss alert");
      this._closeEl = closeBtn;
      root.appendChild(closeBtn);
    }
  }
  _writeMessageInto(target, message) {
    while (target.firstChild) target.removeChild(target.firstChild);
    if (typeof message === "string") {
      target.textContent = message;
      return;
    }
    target.appendChild(
      core.renderInlineContentToDOM(message, { profile: "basic-inline" })
    );
  }
  type(newType) {
    if (newType === void 0) return this._currentType;
    if (this._destroyed) return;
    if (!TYPES.includes(newType)) return;
    if (newType === this._currentType) return;
    const root = this._root;
    if (!root) return;
    root.classList.remove(`arvo-bnr-alert--${this._currentType}`);
    root.classList.add(`arvo-bnr-alert--${newType}`);
    this._currentType = newType;
    this._options.type = newType;
    if (!this._userRoleOverride) {
      const resolved = resolveRole(newType, void 0);
      root.setAttribute("role", resolved);
      this._addedRole = true;
    }
    this._syncIconOverride();
  }
  icon(next) {
    if (next === void 0) return this._icon;
    if (this._destroyed) return;
    this._icon = next ?? null;
    this._options.icon = this._icon;
    this._syncIconOverride();
  }
  // Re-render (or tear down) the override `<i>` glyph inside `__ico` and
  // toggle the `has-icon-override` state class to match the current
  // (`type`, `_icon`) pair. Idempotent: safe to call from `type()` and
  // `icon()` setters AND from `_render()` for the initial mount path.
  _syncIconOverride() {
    const root = this._root;
    if (!root) return;
    root.classList.toggle("has-icon-override", this._iconOverrideActive);
    if (this._iconOverrideEl) {
      this._iconOverrideEl.remove();
      this._iconOverrideEl = null;
    }
    if (this._iconEl && this._iconOverrideActive) {
      this._iconOverrideEl = document.createElement("i");
      this._iconOverrideEl.className = `o9con o9con-${this._icon}`;
      this._iconEl.appendChild(this._iconOverrideEl);
    }
  }
  message(content) {
    if (content === void 0) return this._options.message ?? "";
    if (this._destroyed) return;
    this._options.message = content;
    if (this._msgEl) {
      this._writeMessageInto(this._msgEl, content);
    }
  }
  title(text) {
    var _a, _b, _c;
    if (arguments.length === 0) {
      return this._options.title ?? null;
    }
    if (this._destroyed) return;
    if (this._isCompact) {
      this._options.title = text ?? null;
      return;
    }
    const copy = this._copyEl;
    if (!copy) return;
    if (text == null) {
      if (this._titleTooltip) {
        this._titleTooltip.destroy();
        this._titleTooltip = null;
      }
      if (this._titleEl) {
        this._titleEl.remove();
        this._titleEl = null;
      }
      this._options.title = null;
      (_a = this._root) == null ? void 0 : _a.classList.add("arvo-bnr-alert--no-title");
      return;
    }
    if (this._titleEl) {
      this._titleEl.textContent = text;
      (_b = this._titleTooltip) == null ? void 0 : _b.update(text);
    } else {
      const titleEl = document.createElement("p");
      titleEl.className = "arvo-bnr-alert__title";
      titleEl.textContent = text;
      this._titleEl = titleEl;
      copy.insertBefore(titleEl, copy.firstChild);
      this._titleTooltip = utils.attachTitleTruncationTooltip({
        element: titleEl,
        content: text,
        placement: "bottom-center"
      });
    }
    this._options.title = text;
    (_c = this._root) == null ? void 0 : _c.classList.remove("arvo-bnr-alert--no-title");
  }
  loading(state) {
    if (state === void 0) return this._isLoading;
    if (this._destroyed) return;
    const root = this._root;
    if (!root) return;
    const next = state === true;
    if (next === this._isLoading) return;
    this._isLoading = next;
    this._options.isLoading = next;
    if (next) {
      root.classList.add("loading");
      root.setAttribute("aria-busy", "true");
      this._addedAriaBusy = true;
    } else {
      root.classList.remove("loading");
      root.removeAttribute("aria-busy");
      this._addedAriaBusy = false;
    }
  }
  // -- dismiss / destroy --------------------------------------------------
  dismiss() {
    var _a, _b;
    if (this._destroyed || this._isClosing) return;
    const root = this._root;
    if (!root) return;
    this._isClosing = true;
    root.dispatchEvent(
      new CustomEvent("bnr-alert:dismiss", {
        bubbles: false,
        cancelable: false
      })
    );
    (_b = (_a = this._options).onDismiss) == null ? void 0 : _b.call(_a);
    if (core.prefersReducedMotion()) {
      this.destroy();
      root.remove();
      return;
    }
    root.style.maxHeight = `${root.offsetHeight}px`;
    void root.offsetHeight;
    root.classList.add("is-closing");
    root.style.maxHeight = "0";
    const onEnd = (event) => {
      if (event.propertyName !== "opacity") return;
      root.removeEventListener("transitionend", onEnd);
      this.destroy();
      root.remove();
    };
    root.addEventListener("transitionend", onEnd);
  }
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    const root = this._root;
    if (this._titleTooltip) {
      this._titleTooltip.destroy();
      this._titleTooltip = null;
    }
    if (this._btnInstance) {
      this._btnInstance.destroy();
      this._btnInstance = null;
    }
    if (this._linkInstance) {
      this._linkInstance.destroy();
      this._linkInstance = null;
    }
    if (this._closeBtnInstance) {
      this._closeBtnInstance.destroy();
      this._closeBtnInstance = null;
    }
    if (root) {
      root.innerHTML = "";
      const toRemove = [];
      for (const cls of Array.from(root.classList)) {
        if (cls === "loading" || cls === "has-icon-override" || cls.startsWith("arvo-bnr-alert")) {
          toRemove.push(cls);
        }
      }
      for (const cls of toRemove) {
        root.classList.remove(cls);
      }
      if (this._addedRole) {
        root.removeAttribute("role");
      }
      if (this._addedAriaBusy) {
        root.removeAttribute("aria-busy");
      }
    }
    this._root = null;
    this._iconEl = null;
    this._iconOverrideEl = null;
    this._contentEl = null;
    this._copyEl = null;
    this._titleEl = null;
    this._msgEl = null;
    this._actionsEl = null;
    this._btnEl = null;
    this._linkEl = null;
    this._closeEl = null;
  }
}
exports.ArvoBannerAlert = ArvoBannerAlert;
//# sourceMappingURL=BannerAlert.cjs.map
