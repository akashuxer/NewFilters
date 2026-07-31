import { ArvoContextHelp } from "../ContextHelp/ContextHelp.js";
const BLOCK = "arvo-form-lbl";
const M_LG = `${BLOCK}--lg`;
const M_REQUIRED = `${BLOCK}--required`;
const E_REQ = `${BLOCK}__req`;
const E_CTX_HELP = `${BLOCK}__ctx-help`;
const STATE_DISABLED = "is-disabled";
const STATE_INVALID = "is-invalid";
class ArvoFormLabel {
  constructor(element, options) {
    this._textNode = null;
    this._reqEl = null;
    this._ctxHelpWrapperEl = null;
    this._ctxHelp = null;
    this._destroyed = false;
    this._text = options.text;
    this._as = options.as ?? (element instanceof HTMLSpanElement ? "span" : "label");
    this._for = options.for ?? null;
    this._size = options.size ?? "sm";
    this._isRequired = options.isRequired ?? false;
    this._isDisabled = options.isDisabled ?? false;
    this._isInvalid = options.isInvalid ?? false;
    this._requiredIndicator = options.requiredIndicator ?? null;
    this._contextHelpConfig = options.contextHelp ?? null;
    if (element) {
      this.el = element;
    } else {
      this.el = document.createElement(this._as);
    }
    this._render();
  }
  /**
   * Factory entry point. If `element` is `null`, a new element of the
   * configured tag is created. If an existing element is passed, the tag is
   * preserved -- the `as` option is ignored and inferred from the element.
   */
  static initialize(element, options) {
    return new ArvoFormLabel(element, options);
  }
  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  _render() {
    const el = this.el;
    this._unmountContextHelp();
    while (el.firstChild) el.removeChild(el.firstChild);
    this._reqEl = null;
    el.classList.add(BLOCK);
    el.classList.toggle(M_LG, this._size === "lg");
    el.classList.toggle(M_REQUIRED, this._isRequired);
    el.classList.toggle(STATE_DISABLED, this._isDisabled);
    el.classList.toggle(STATE_INVALID, this._isInvalid);
    if (this._as === "label" && this._for) {
      el.setAttribute("for", this._for);
    } else {
      el.removeAttribute("for");
    }
    this._textNode = document.createTextNode(this._text);
    el.appendChild(this._textNode);
    if (this._isRequired) {
      this._mountRequiredIndicator();
    }
    if (this._contextHelpConfig) {
      this._mountContextHelp();
    }
  }
  _mountRequiredIndicator() {
    this._reqEl = document.createElement("span");
    this._reqEl.className = E_REQ;
    this._reqEl.setAttribute("aria-hidden", "true");
    const custom = this._requiredIndicator;
    if (custom instanceof HTMLElement) {
      this._reqEl.appendChild(custom);
    } else if (typeof custom === "string" && custom.length > 0) {
      this._reqEl.textContent = custom;
    } else {
      this._reqEl.textContent = "*";
    }
    if (this._ctxHelpWrapperEl) {
      this.el.insertBefore(this._reqEl, this._ctxHelpWrapperEl);
    } else {
      this.el.appendChild(this._reqEl);
    }
  }
  _unmountRequiredIndicator() {
    if (this._reqEl) {
      this._reqEl.remove();
      this._reqEl = null;
    }
  }
  _mountContextHelp() {
    const cfg = this._contextHelpConfig;
    if (!cfg) return;
    this._ctxHelpWrapperEl = document.createElement("span");
    this._ctxHelpWrapperEl.className = E_CTX_HELP;
    const btn = document.createElement("button");
    btn.type = "button";
    this._ctxHelpWrapperEl.appendChild(btn);
    this.el.appendChild(this._ctxHelpWrapperEl);
    this._ctxHelp = ArvoContextHelp.initialize(btn, {
      content: cfg.content,
      variant: cfg.variant,
      ariaLabel: cfg.ariaLabel,
      placement: cfg.placement,
      size: "sm"
    });
  }
  _unmountContextHelp() {
    if (this._ctxHelp) {
      this._ctxHelp.destroy();
      this._ctxHelp = null;
    }
    if (this._ctxHelpWrapperEl) {
      this._ctxHelpWrapperEl.remove();
      this._ctxHelpWrapperEl = null;
    }
  }
  text(next) {
    if (next === void 0) return this._text;
    this._text = next;
    if (this._textNode) this._textNode.nodeValue = next;
    else this._render();
  }
  size(next) {
    if (next === void 0) return this._size;
    if (this._size === next) return;
    this._size = next;
    this.el.classList.toggle(M_LG, next === "lg");
  }
  required(next) {
    if (next === void 0) return this._isRequired;
    if (this._isRequired === next) return;
    this._isRequired = next;
    this.el.classList.toggle(M_REQUIRED, next);
    if (next) this._mountRequiredIndicator();
    else this._unmountRequiredIndicator();
  }
  disabled(next) {
    if (next === void 0) return this._isDisabled;
    if (this._isDisabled === next) return;
    this._isDisabled = next;
    this.el.classList.toggle(STATE_DISABLED, next);
  }
  invalid(next) {
    if (next === void 0) return this._isInvalid;
    if (this._isInvalid === next) return;
    this._isInvalid = next;
    this.el.classList.toggle(STATE_INVALID, next);
  }
  for(next) {
    if (next === void 0) return this._for;
    this._for = next ?? null;
    if (this._as !== "label") return;
    if (next) this.el.setAttribute("for", next);
    else this.el.removeAttribute("for");
  }
  /** Returns the rendered tag. Set at construction; cannot be changed. */
  as() {
    return this._as;
  }
  /**
   * Returns the embedded ArvoContextHelp instance, or null when no
   * `contextHelp` option was provided. Read-only -- the embedded instance is
   * set at construction. Use the returned instance to mutate the tooltip,
   * e.g. `lbl.contextHelp()?.setContent('...')`.
   */
  contextHelp() {
    return this._ctxHelp;
  }
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._unmountContextHelp();
    this._unmountRequiredIndicator();
    while (this.el.firstChild) this.el.removeChild(this.el.firstChild);
    this._textNode = null;
  }
}
export {
  ArvoFormLabel
};
//# sourceMappingURL=FormLabel.js.map
