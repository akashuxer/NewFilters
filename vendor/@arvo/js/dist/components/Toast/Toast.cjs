"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const core = require("@arvo/core");
const utils = require("@arvo/utils");
const IconButton = require("../IconButton/IconButton.cjs");
const Link = require("../Link/Link.cjs");
const NO_AUTO_DISMISS = /* @__PURE__ */ new Set(["block"]);
const ALERT_ROLES = /* @__PURE__ */ new Set(["negative", "block"]);
const DEFAULT_TIMEOUT_BY_TYPE = {
  positive: 4e3,
  neutral: 4e3,
  info: 5e3,
  warning: 6e3,
  negative: 8e3,
  block: null
};
const TYPE_SR_LABEL = {
  negative: "Error",
  block: "Blocked",
  warning: "Warning",
  info: "Info",
  positive: "Success",
  neutral: "Notification"
};
const LAYOUT_SHIFT_DURATION_MS = 220;
const LAYOUT_SHIFT_EASING = "cubic-bezier(0.2, 0, 0, 1)";
let idCounter = 0;
class ArvoToast {
  constructor(container, options) {
    this._container = null;
    this._toasts = /* @__PURE__ */ new Map();
    this._surface = null;
    this._destroyed = false;
    this._defaults = {
      position: (options == null ? void 0 : options.position) ?? "top-right",
      timeout: options == null ? void 0 : options.timeout,
      pauseOnHover: (options == null ? void 0 : options.pauseOnHover) ?? true
    };
    this._hub = options == null ? void 0 : options.hub;
    const el = document.createElement("div");
    el.className = `arvo-toast-container arvo-toast-container--${this._defaults.position}`;
    el.setAttribute("role", "region");
    el.setAttribute("aria-label", "Notifications");
    this._container = el;
    let parent = document.body;
    if (typeof container === "string") {
      parent = document.querySelector(container) ?? document.body;
    } else if (container instanceof HTMLElement) {
      parent = container;
    }
    parent.appendChild(el);
    this._surface = core.createOverlaySurface({
      id: `arvo-toast-container-${++idCounter}`,
      surface: el,
      type: "toast",
      priority: 0,
      position: false,
      focus: { mode: "none" },
      transition: null,
      closeOnOutside: false,
      triggerAria: false,
      ...this._hub ? { hub: this._hub } : {}
    });
    void this._surface.open();
  }
  static initialize(container, options) {
    return new ArvoToast(container, options);
  }
  // -- show -------------------------------------------------------------
  show(options) {
    if (this._destroyed || !this._container) return "";
    const type = options.type ?? "info";
    const resolvedTimeout = options.timeout !== void 0 ? options.timeout : this._defaults.timeout !== void 0 ? this._defaults.timeout : DEFAULT_TIMEOUT_BY_TYPE[type];
    const shouldFade = !NO_AUTO_DISMISS.has(type) && (options.fadeAway ?? true) && resolvedTimeout !== null && resolvedTimeout !== void 0;
    const timeout = resolvedTimeout ?? 0;
    const pauseOnHover = options.pauseOnHover ?? this._defaults.pauseOnHover;
    const role = ALERT_ROLES.has(type) ? "alert" : "status";
    const id = `arvo-toast-${++idCounter}`;
    const state = {
      id,
      element: null,
      timer: null,
      removed: false,
      link: null,
      closeBtn: null,
      titleTooltip: null,
      options: {
        type,
        title: options.title ?? null,
        message: options.message,
        fadeAway: shouldFade,
        timeout,
        pauseOnHover,
        icon: options.icon ?? null,
        link: options.link ?? null,
        onClose: options.onClose ?? null
      }
    };
    const hasIconOverride = type === "neutral" && !!state.options.icon;
    const toast = document.createElement("div");
    const classes = ["arvo-toast", `arvo-toast--${type}`];
    if (hasIconOverride) classes.push("has-icon-override");
    toast.className = classes.join(" ");
    toast.setAttribute("role", role);
    toast.setAttribute("aria-atomic", "true");
    toast.setAttribute("tabindex", "0");
    const srPrefix = document.createElement("span");
    srPrefix.className = "arvo-sr-only";
    srPrefix.textContent = `${TYPE_SR_LABEL[type]}: `;
    toast.appendChild(srPrefix);
    const ico = document.createElement("span");
    ico.className = "arvo-toast__ico o9con";
    ico.setAttribute("aria-hidden", "true");
    if (hasIconOverride) {
      const overrideEl = document.createElement("i");
      overrideEl.className = `o9con o9con-${state.options.icon}`;
      ico.appendChild(overrideEl);
    }
    toast.appendChild(ico);
    const content = document.createElement("div");
    content.className = "arvo-toast__content";
    const textWrap = document.createElement("div");
    textWrap.className = "arvo-toast__text";
    let titleEl = null;
    if (state.options.title) {
      titleEl = document.createElement("p");
      titleEl.className = "arvo-toast__title";
      titleEl.textContent = state.options.title;
      textWrap.appendChild(titleEl);
    }
    const msgEl = document.createElement("p");
    msgEl.className = "arvo-toast__msg";
    if (typeof state.options.message === "string") {
      msgEl.textContent = state.options.message;
    } else {
      msgEl.appendChild(
        core.renderInlineContentToDOM(state.options.message, { profile: "basic-inline" })
      );
    }
    textWrap.appendChild(msgEl);
    content.appendChild(textWrap);
    if (state.options.link) {
      const aEl = document.createElement("a");
      state.link = Link.ArvoLink.initialize(aEl, {
        size: "sm",
        variant: "primary",
        label: state.options.link.label,
        href: state.options.link.href,
        icon: state.options.link.icon ?? null,
        isExternal: state.options.link.isExternal ?? false,
        onClick: state.options.link.onClick
      });
      content.appendChild(aEl);
    }
    toast.appendChild(content);
    const closeEl = document.createElement("button");
    state.closeBtn = IconButton.ArvoIconButton.initialize(closeEl, {
      icon: "close",
      size: "xs",
      variant: "tertiary",
      tooltip: "Close notification",
      onClick: () => this._remove(id, "click")
    });
    toast.appendChild(closeEl);
    state.element = toast;
    this._toasts.set(id, state);
    const playLayoutShift = this._captureLayoutShift();
    this._container.insertBefore(toast, this._container.firstChild);
    if (titleEl) {
      state.titleTooltip = utils.attachTitleTruncationTooltip({
        element: titleEl,
        content: state.options.title ?? "",
        placement: "bottom-center"
      });
    }
    requestAnimationFrame(() => {
      if (state.removed) return;
      playLayoutShift();
      toast.classList.add("is-visible");
    });
    toast.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        this._remove(id, "escape");
      }
    });
    if (shouldFade) {
      this._startFadeTimer(state, timeout);
      if (pauseOnHover) {
        toast.addEventListener("mouseenter", () => {
          if (state.timer) {
            clearTimeout(state.timer);
            state.timer = null;
          }
          toast.classList.add("is-paused");
        });
        toast.addEventListener("mouseleave", () => {
          toast.classList.remove("is-paused");
          this._startFadeTimer(state, timeout);
        });
      }
    }
    return id;
  }
  // -- close ------------------------------------------------------------
  close(id) {
    this._remove(id, "programmatic");
  }
  // -- closeAll ---------------------------------------------------------
  closeAll() {
    const ids = [...this._toasts.keys()];
    for (const id of ids) {
      this._remove(id, "programmatic");
    }
  }
  // -- destroy ----------------------------------------------------------
  destroy() {
    var _a, _b;
    if (this._destroyed) return;
    this._destroyed = true;
    this.closeAll();
    (_a = this._surface) == null ? void 0 : _a.destroy();
    this._surface = null;
    (_b = this._container) == null ? void 0 : _b.remove();
    this._container = null;
  }
  // -- internal helpers -------------------------------------------------
  _startFadeTimer(state, timeout) {
    state.timer = setTimeout(() => {
      const el = state.element;
      if (core.prefersReducedMotion()) {
        this._remove(state.id, "fade");
        return;
      }
      el.classList.remove("is-paused");
      el.classList.remove("is-visible");
      el.classList.add("is-removing");
      const onEnd = (event) => {
        if (event.propertyName && event.propertyName !== "opacity") {
          return;
        }
        el.removeEventListener("transitionend", onEnd);
        this._remove(state.id, "fade");
      };
      el.addEventListener("transitionend", onEnd);
    }, timeout);
  }
  _remove(id, reason) {
    var _a, _b, _c, _d, _e, _f;
    const state = this._toasts.get(id);
    if (!state || state.removed) return;
    state.removed = true;
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = null;
    }
    (_b = (_a = state.options).onClose) == null ? void 0 : _b.call(_a);
    (_c = state.titleTooltip) == null ? void 0 : _c.destroy();
    state.titleTooltip = null;
    (_d = state.link) == null ? void 0 : _d.destroy();
    state.link = null;
    (_e = state.closeBtn) == null ? void 0 : _e.destroy();
    state.closeBtn = null;
    const playLayoutShift = this._captureLayoutShift(state.element);
    state.element.remove();
    this._toasts.delete(id);
    requestAnimationFrame(() => playLayoutShift());
    (_f = this._container) == null ? void 0 : _f.dispatchEvent(new CustomEvent("toast:close", {
      bubbles: true,
      cancelable: false,
      detail: { id, reason }
    }));
  }
  /**
   * FLIP layout-shift compensation for the toast stack. Reads the
   * pre-mutation rects of every toast (optionally excluding one that
   * is about to leave the DOM), and returns a callback that -- when
   * invoked after the DOM mutation -- animates each surviving toast
   * from its previous position back to (0, 0) via WAAPI. Matches the
   * `$arvo-motion-layout-shift` token (220ms emphasized easing).
   *
   * No-op on reduced-motion users and on browsers without
   * `Element.animate`.
   */
  _captureLayoutShift(excludeEl) {
    const container = this._container;
    if (!container) return () => {
    };
    if (core.prefersReducedMotion()) return () => {
    };
    const children = Array.from(container.children);
    const firstRects = /* @__PURE__ */ new Map();
    for (const child of children) {
      if (child === excludeEl) continue;
      firstRects.set(child, child.getBoundingClientRect());
    }
    return () => {
      for (const [el, first] of firstRects) {
        if (!el.isConnected) continue;
        const last = el.getBoundingClientRect();
        const deltaY = first.top - last.top;
        if (deltaY === 0) continue;
        if (typeof el.animate !== "function") continue;
        el.animate(
          [
            { transform: `translateY(${deltaY}px)` },
            { transform: "translateY(0)" }
          ],
          {
            duration: LAYOUT_SHIFT_DURATION_MS,
            easing: LAYOUT_SHIFT_EASING
          }
        );
      }
    };
  }
}
exports.ArvoToast = ArvoToast;
//# sourceMappingURL=Toast.cjs.map
