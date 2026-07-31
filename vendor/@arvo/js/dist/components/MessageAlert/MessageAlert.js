import { renderInlineContentToDOM, prefersReducedMotion } from "@arvo/core";
import { ArvoIconButton } from "../IconButton/IconButton.js";
const ARVO_MSG_ALERT_DEFAULT_ERROR = "Form field value is invalid";
const BLOCK = "arvo-msg-alert";
const E_ICO = `${BLOCK}__ico`;
const E_MSG = `${BLOCK}__msg`;
const E_BODY = `${BLOCK}__body`;
const E_CLOSE = `${BLOCK}__close`;
const M_INLINE = `${BLOCK}--inline`;
const M_DISMISSABLE = `${BLOCK}--dismissable`;
const STATE_ICON_OVERRIDE = "has-icon-override";
const ASSERTIVE_TYPES = ["negative", "warning", "block"];
const TYPE_DEFAULT_LABEL = {
  negative: "Error",
  positive: "Success",
  warning: "Warning",
  info: "Information",
  neutral: "Notice",
  block: "Blocked"
};
const ALL_TYPES = [
  "negative",
  "positive",
  "warning",
  "info",
  "neutral",
  "block"
];
function resolveRole(type) {
  return ASSERTIVE_TYPES.includes(type) ? "alert" : "status";
}
const _ArvoMessageAlert = class _ArvoMessageAlert {
  constructor(element, options = {}) {
    this._bodyEl = null;
    this._icoEl = null;
    this._msgEl = null;
    this._iconOverrideEl = null;
    this._closeBtn = null;
    this._closeEl = null;
    this._destroyed = false;
    this._isClosing = false;
    this.el = element ?? document.createElement("div");
    this._type = options.type ?? "negative";
    this._isInline = options.isInline ?? false;
    this._message = options.message ?? null;
    this._icon = options.icon ?? null;
    this._isDismissable = options.isDismissable ?? false;
    this._onDismiss = options.onDismiss ?? null;
    this._id = options.id;
    this._roleExplicit = options.role !== void 0;
    this._role = options.role ?? resolveRole(this._type);
    this._boundHandleCloseClick = this._handleCloseClick.bind(this);
    this._render();
  }
  // Custom icon override is gated on `type === 'neutral'` -- every other
  // type renders its semantic glyph via the SCSS pattern and ignores `_icon`.
  get _iconOverrideActive() {
    return this._type === "neutral" && this._icon !== null && this._icon !== "";
  }
  static initialize(element, options = {}) {
    return new _ArvoMessageAlert(element, options);
  }
  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  _render() {
    const el = this.el;
    while (el.firstChild) el.removeChild(el.firstChild);
    el.classList.add(BLOCK);
    ALL_TYPES.forEach((t) => el.classList.remove(`${BLOCK}--${t}`));
    el.classList.add(`${BLOCK}--${this._type}`);
    el.classList.toggle(M_INLINE, this._isInline);
    const wantDismiss = this._isDismissable && !this._isInline;
    el.classList.toggle(M_DISMISSABLE, wantDismiss);
    el.classList.toggle(STATE_ICON_OVERRIDE, this._iconOverrideActive);
    el.setAttribute("role", this._role);
    if (this._id) {
      el.id = this._id;
    } else {
      el.removeAttribute("id");
    }
    if (this._isInline) {
      this._applyInlineAriaLabel();
    } else {
      el.removeAttribute("aria-label");
    }
    if (this._isInline) {
      this._icoEl = this._buildIconEl();
      el.appendChild(this._icoEl);
    } else {
      this._bodyEl = document.createElement("span");
      this._bodyEl.className = E_BODY;
      this._icoEl = this._buildIconEl();
      this._bodyEl.appendChild(this._icoEl);
      this._msgEl = document.createElement("span");
      this._msgEl.className = E_MSG;
      this._writeMessage();
      this._bodyEl.appendChild(this._msgEl);
      el.appendChild(this._bodyEl);
      if (wantDismiss) {
        this._mountCloseBtn();
      }
    }
  }
  // Renders the current message into `__msg` using the shared inline-content
  // adapter (basic-inline profile). No-op in inline mode where `__msg` is absent.
  _writeMessage() {
    if (!this._msgEl) return;
    while (this._msgEl.firstChild) this._msgEl.removeChild(this._msgEl.firstChild);
    if (this._message != null && this._message !== "") {
      this._msgEl.appendChild(
        renderInlineContentToDOM(this._message, { profile: "basic-inline" })
      );
    }
  }
  _buildIconEl() {
    const ico = document.createElement("span");
    ico.className = E_ICO;
    ico.setAttribute("aria-hidden", "true");
    if (this._iconOverrideActive) {
      this._iconOverrideEl = document.createElement("i");
      this._iconOverrideEl.className = `o9con o9con-${this._icon}`;
      ico.appendChild(this._iconOverrideEl);
    } else {
      this._iconOverrideEl = null;
    }
    return ico;
  }
  _mountCloseBtn() {
    this._closeEl = document.createElement("button");
    this._closeEl.classList.add(E_CLOSE);
    this._closeBtn = ArvoIconButton.initialize(this._closeEl, {
      variant: "tertiary",
      size: "xs",
      icon: "close",
      tooltip: "Dismiss"
    });
    this._closeEl.addEventListener("click", this._boundHandleCloseClick);
    this.el.appendChild(this._closeEl);
  }
  _unmountCloseBtn() {
    if (this._closeEl) {
      this._closeEl.removeEventListener("click", this._boundHandleCloseClick);
    }
    if (this._closeBtn) {
      this._closeBtn.destroy();
      this._closeBtn = null;
    }
    if (this._closeEl) {
      this._closeEl.remove();
      this._closeEl = null;
    }
  }
  _applyInlineAriaLabel() {
    const label = typeof this._message === "string" && this._message.length > 0 ? this._message : TYPE_DEFAULT_LABEL[this._type];
    this.el.setAttribute("aria-label", label);
  }
  // -------------------------------------------------------------------------
  // Event handlers
  // -------------------------------------------------------------------------
  _handleCloseClick(_event) {
    this.dismiss();
  }
  type(next) {
    if (next === void 0) return this._type;
    if (this._type === next) return;
    this._type = next;
    ALL_TYPES.forEach((t) => this.el.classList.remove(`${BLOCK}--${t}`));
    this.el.classList.add(`${BLOCK}--${next}`);
    if (!this._roleExplicit) {
      this._role = resolveRole(next);
      this.el.setAttribute("role", this._role);
    }
    this._syncIconOverride();
    if (this._isInline) {
      this._applyInlineAriaLabel();
    }
  }
  message(next) {
    if (next === void 0) return this._message ?? "";
    this._message = next;
    this._writeMessage();
    if (this._isInline) {
      this._applyInlineAriaLabel();
    }
  }
  inline(next) {
    if (next === void 0) return this._isInline;
    if (this._isInline === next) return;
    this._isInline = next;
    this._unmountCloseBtn();
    this._render();
  }
  dismissable(next) {
    if (next === void 0) return this._isDismissable;
    if (this._isDismissable === next) return;
    this._isDismissable = next;
    if (this._isInline) {
      this.el.classList.toggle(M_DISMISSABLE, false);
      return;
    }
    this.el.classList.toggle(M_DISMISSABLE, next);
    if (next) {
      if (!this._closeBtn) this._mountCloseBtn();
    } else {
      this._unmountCloseBtn();
    }
  }
  icon(next) {
    if (next === void 0) return this._icon;
    this._icon = next ?? null;
    this._syncIconOverride();
  }
  // Re-render (or tear down) the override `<i>` glyph inside `__ico` and
  // toggle the `has-icon-override` state class to match the current
  // (`type`, `_icon`) pair. Idempotent: safe to call from `type()` and
  // `icon()` setters AND from `_render()` for the initial mount path.
  _syncIconOverride() {
    this.el.classList.toggle(STATE_ICON_OVERRIDE, this._iconOverrideActive);
    if (this._iconOverrideEl) {
      this._iconOverrideEl.remove();
      this._iconOverrideEl = null;
    }
    if (this._icoEl && this._iconOverrideActive) {
      this._iconOverrideEl = document.createElement("i");
      this._iconOverrideEl.className = `o9con o9con-${this._icon}`;
      this._icoEl.appendChild(this._iconOverrideEl);
    }
  }
  // Dismissal lifecycle. Mirrors ArvoBannerAlert: fires the
  // `msg-alert:dismiss` event + `onDismiss` callback synchronously, plays a
  // collapse-from-bottom-to-top transition (opacity + transform via the
  // .is-closing class, max-height locked-to-current then transitioned to 0
  // via inline style), then tears down the instance and detaches the host
  // element from the DOM on `transitionend`. Skips the transition when
  // `prefers-reduced-motion: reduce` is active.
  dismiss() {
    var _a;
    if (this._destroyed || this._isClosing) return;
    this._isClosing = true;
    this.el.dispatchEvent(new CustomEvent("msg-alert:dismiss", { bubbles: true }));
    (_a = this._onDismiss) == null ? void 0 : _a.call(this);
    if (prefersReducedMotion()) {
      const root2 = this.el;
      this.destroy();
      root2.remove();
      return;
    }
    const root = this.el;
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
    this._unmountCloseBtn();
    while (this.el.firstChild) this.el.removeChild(this.el.firstChild);
    this._bodyEl = null;
    this._icoEl = null;
    this._msgEl = null;
    this._iconOverrideEl = null;
  }
};
_ArvoMessageAlert.defaultErrorMessage = ARVO_MSG_ALERT_DEFAULT_ERROR;
let ArvoMessageAlert = _ArvoMessageAlert;
ArvoMessageAlert.defaultErrorMessage = ARVO_MSG_ALERT_DEFAULT_ERROR;
export {
  ARVO_MSG_ALERT_DEFAULT_ERROR,
  ArvoMessageAlert
};
//# sourceMappingURL=MessageAlert.js.map
