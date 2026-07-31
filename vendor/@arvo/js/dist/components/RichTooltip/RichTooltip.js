import { createOverlaySurface, applyPositionToSurface, renderInlineContentToDOM } from "@arvo/core";
import { ArvoStatus } from "../Status/Status.js";
import { ArvoBadge } from "../Badge/Badge.js";
import { ArvoBannerAlert } from "../BannerAlert/BannerAlert.js";
import { ArvoLink } from "../Link/Link.js";
import { ArvoButtonLink } from "../ButtonLink/ButtonLink.js";
import { ArvoButton } from "../Button/Button.js";
const MAX_ACTIONS = 3;
const VALID_PLACEMENTS = [
  "top-start",
  "top-center",
  "top-end",
  "right-start",
  "right-center",
  "right-end",
  "bottom-start",
  "bottom-center",
  "bottom-end",
  "left-start",
  "left-center",
  "left-end"
];
const VALID_TRIGGERS = ["hover", "focus", "click", "manual"];
const VALID_CLOSE_BEHAVIORS = ["escape", "outsideClick", "both", "manual"];
let _idCounter = 0;
function truncateActions(actions) {
  if (!actions || actions.length === 0) return [];
  if (actions.length <= MAX_ACTIONS) return actions;
  if (typeof console !== "undefined" && typeof console.warn === "function") {
    console.warn(
      `[ArvoRichTooltip] actions limited to ${MAX_ACTIONS}; received ${actions.length}. Extra actions were dropped.`
    );
  }
  return actions.slice(0, MAX_ACTIONS);
}
function resolveCloseFlags(behavior) {
  switch (behavior) {
    case "escape":
      return { closeOnEscape: true, closeOnOutside: false };
    case "outsideClick":
      return { closeOnEscape: false, closeOnOutside: true };
    case "manual":
      return { closeOnEscape: false, closeOnOutside: false };
    case "both":
    default:
      return { closeOnEscape: true, closeOnOutside: true };
  }
}
const _ArvoRichTooltip = class _ArvoRichTooltip {
  constructor(element, options) {
    this._panelEl = null;
    this._hdrEl = null;
    this._titleEl = null;
    this._hdrMetaEl = null;
    this._bodyEl = null;
    this._bannerWrapEl = null;
    this._msgEl = null;
    this._slotEl = null;
    this._footerEl = null;
    this._pointerEl = null;
    this._statusInstance = null;
    this._badgeInstance = null;
    this._bannerInstance = null;
    this._actionInstances = [];
    this._surface = null;
    this._isOpen = false;
    this._closingProgrammatically = false;
    this._suppressFocusOpen = false;
    this._suppressFocusOpenTimer = null;
    this._hoverOpenTimer = null;
    this._hoverCloseTimer = null;
    this._addedAriaDescribedBy = false;
    this._previousAriaDescribedBy = null;
    this._element = element;
    this._panelId = (options == null ? void 0 : options.id) ?? `arvo-rtip-${++_idCounter}`;
    this._titleId = `${this._panelId}-title`;
    const trigger = (options == null ? void 0 : options.trigger) && VALID_TRIGGERS.includes(options.trigger) ? options.trigger : _ArvoRichTooltip.DEFAULTS.trigger;
    const placement = (options == null ? void 0 : options.placement) && VALID_PLACEMENTS.includes(options.placement) ? options.placement : _ArvoRichTooltip.DEFAULTS.placement;
    const closeBehavior = (options == null ? void 0 : options.closeBehavior) && VALID_CLOSE_BEHAVIORS.includes(options.closeBehavior) ? options.closeBehavior : _ArvoRichTooltip.DEFAULTS.closeBehavior;
    this._options = {
      ..._ArvoRichTooltip.DEFAULTS,
      ...options,
      trigger,
      placement,
      closeBehavior,
      actions: truncateActions(options == null ? void 0 : options.actions),
      status: (options == null ? void 0 : options.status) ?? null,
      badge: (options == null ? void 0 : options.badge) ?? null,
      banner: (options == null ? void 0 : options.banner) ?? null,
      message: (options == null ? void 0 : options.message) ?? null,
      bodyContent: (options == null ? void 0 : options.bodyContent) ?? null,
      title: (options == null ? void 0 : options.title) ?? null,
      ariaLabel: (options == null ? void 0 : options.ariaLabel) ?? null,
      maxWidth: (options == null ? void 0 : options.maxWidth) ?? null,
      onOpen: (options == null ? void 0 : options.onOpen) ?? null,
      onClose: (options == null ? void 0 : options.onClose) ?? null,
      isDisabled: (options == null ? void 0 : options.isDisabled) === true,
      isLoading: (options == null ? void 0 : options.isLoading) === true === true,
      isOpen: (options == null ? void 0 : options.isOpen) === true
    };
    this._boundHandleTriggerClick = this._handleTriggerClick.bind(this);
    this._boundHandleTriggerPointerEnter = this._handleTriggerPointerEnter.bind(this);
    this._boundHandleTriggerPointerLeave = this._handleTriggerPointerLeave.bind(this);
    this._boundHandleTriggerFocus = this._handleTriggerFocus.bind(this);
    this._boundHandleTriggerBlur = this._handleTriggerBlur.bind(this);
    this._boundHandlePanelPointerEnter = this._handlePanelPointerEnter.bind(this);
    this._boundHandlePanelPointerLeave = this._handlePanelPointerLeave.bind(this);
    this._render();
    this._writeTriggerAriaDescribedBy();
    this._bindTriggerEvents();
    this._surface = createOverlaySurface({
      id: this._panelId,
      surface: this._panelEl,
      type: "tooltip",
      priority: 10,
      trigger: element,
      position: {
        placement: this._options.placement,
        gap: this._options.offset,
        // Tooltips intentionally cascade to adjacent (perpendicular) sides
        // when neither the requested side nor its opposite fits.
        flip: "any",
        apply: (result, surface) => {
          applyPositionToSurface(result, surface);
        }
      },
      // ArvoRichTooltip never owns focus (mode: 'none'), so the engine's
      // default "return focus to trigger on close" belt-and-braces would
      // fight our own trigger listeners. For `trigger: 'hover'` and
      // `trigger: 'focus'` we bind `focus` on the trigger (WCAG 1.4.13
      // keyboard parity). If the engine programmatically re-focuses the
      // trigger after an outside-click / pointerleave / Escape close, that
      // synthetic focus event immediately re-opens the tooltip, producing
      // the "flash close, reopen" loop reported in the playground and
      // consumer apps. Opting out here keeps focus where the user's action
      // landed and breaks the loop. When focus WAS inside the panel (user
      // tabbed into a footer action then closed), `close()` restores focus
      // to the trigger explicitly with `_suppressFocusOpen` set so our own
      // trigger-focus listener doesn't loop.
      focus: { mode: "none", returnFocus: false },
      transition: "fade",
      transitionDuration: 150,
      closeOnOutside: resolveCloseFlags(this._options.closeBehavior).closeOnOutside,
      triggerAria: false,
      // we write aria-describedby ourselves
      onClose: () => this._handleEngineClose()
    });
    if (this._options.isOpen && !this._options.isDisabled) {
      this.open();
    }
  }
  static initialize(element, options) {
    return new _ArvoRichTooltip(element, options);
  }
  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  _render() {
    this._panelEl = document.createElement("div");
    this._panelEl.id = this._panelId;
    this._panelEl.setAttribute("role", "tooltip");
    this._panelEl.className = this._buildPanelClasses();
    if (this._options.isLoading) {
      this._panelEl.setAttribute("aria-busy", "true");
    }
    if (this._options.ariaLabel) {
      this._panelEl.setAttribute("aria-label", this._options.ariaLabel);
    } else if (this._options.title) {
      this._panelEl.setAttribute("aria-labelledby", this._titleId);
    }
    if (typeof this._options.maxWidth === "number") {
      this._panelEl.style.setProperty(
        "--arvo-rtip-max-width",
        `${this._options.maxWidth}px`
      );
    } else if (typeof this._options.maxWidth === "string") {
      this._panelEl.style.setProperty(
        "--arvo-rtip-max-width",
        this._options.maxWidth
      );
    }
    if (this._shouldRenderHeader()) {
      this._renderHeader();
    }
    this._renderBody();
    if (this._shouldShowFooter()) {
      this._renderFooter();
    }
    if (this._options.hasPointer) {
      this._pointerEl = document.createElement("div");
      this._pointerEl.className = "arvo-rtip__pointer";
      this._pointerEl.setAttribute("aria-hidden", "true");
      this._panelEl.appendChild(this._pointerEl);
    }
    this._panelEl.addEventListener("pointerenter", this._boundHandlePanelPointerEnter);
    this._panelEl.addEventListener("pointerleave", this._boundHandlePanelPointerLeave);
    document.body.appendChild(this._panelEl);
  }
  _shouldRenderHeader() {
    return Boolean(
      this._options.title || this._options.status || this._options.badge
    );
  }
  _renderHeader() {
    if (!this._panelEl) return;
    this._hdrEl = document.createElement("div");
    this._hdrEl.className = "arvo-rtip__hdr";
    if (this._options.title) {
      this._titleEl = document.createElement("span");
      this._titleEl.id = this._titleId;
      this._titleEl.className = "arvo-rtip__title";
      if (typeof this._options.title === "string") {
        this._titleEl.textContent = this._options.title;
      } else if (this._options.title instanceof Node) {
        this._titleEl.appendChild(this._options.title);
      }
      this._hdrEl.appendChild(this._titleEl);
    }
    if (this._options.status || this._options.badge) {
      this._hdrMetaEl = document.createElement("div");
      this._hdrMetaEl.className = "arvo-rtip__hdr-meta";
      if (this._options.status) {
        const statusHost = document.createElement("span");
        this._statusInstance = ArvoStatus.initialize(statusHost, {
          ...this._options.status,
          size: "sm",
          placement: "inline"
        });
        this._hdrMetaEl.appendChild(statusHost);
      }
      if (this._options.badge) {
        const badgeHost = document.createElement("span");
        this._badgeInstance = ArvoBadge.initialize(badgeHost, {
          ...this._options.badge,
          size: "sm",
          placement: "inline"
        });
        this._hdrMetaEl.appendChild(badgeHost);
      }
      this._hdrEl.appendChild(this._hdrMetaEl);
    }
    this._panelEl.appendChild(this._hdrEl);
  }
  _renderBody() {
    if (!this._panelEl) return;
    this._bodyEl = document.createElement("div");
    this._bodyEl.className = "arvo-rtip__bdy";
    if (this._options.banner) {
      this._bannerWrapEl = document.createElement("div");
      this._bannerWrapEl.className = "arvo-rtip__banner";
      const bannerHost = document.createElement("div");
      this._bannerInstance = ArvoBannerAlert.initialize(bannerHost, {
        message: this._options.banner.message,
        type: this._options.banner.type ?? "warning",
        isCompact: true,
        isDismissible: this._options.banner.isDismissible !== false,
        role: this._options.banner.role,
        onDismiss: this._options.banner.onDismiss
      });
      if (this._options.banner.className) {
        bannerHost.classList.add(...this._options.banner.className.split(/\s+/));
      }
      this._bannerWrapEl.appendChild(bannerHost);
      this._bodyEl.appendChild(this._bannerWrapEl);
    }
    if (this._options.message != null) {
      this._msgEl = document.createElement("div");
      this._msgEl.className = "arvo-rtip__msg";
      this._writeMessage(this._msgEl, this._options.message);
      this._bodyEl.appendChild(this._msgEl);
    }
    if (this._options.bodyContent != null) {
      this._slotEl = document.createElement("div");
      this._slotEl.className = "arvo-rtip__slot";
      this._writeBodyContent(this._slotEl, this._options.bodyContent);
      this._bodyEl.appendChild(this._slotEl);
    }
    this._panelEl.appendChild(this._bodyEl);
  }
  _renderFooter() {
    if (!this._panelEl) return;
    this._footerEl = document.createElement("div");
    this._footerEl.className = "arvo-rtip__ftr";
    for (let i = 0; i < this._options.actions.length; i++) {
      const action = this._options.actions[i];
      const actionId = action.id ?? `rtip-action-${i}`;
      const instance = this._buildAction(action, actionId);
      if (instance) {
        this._actionInstances.push(instance);
      }
    }
    this._panelEl.appendChild(this._footerEl);
  }
  _buildAction(action, dataActionId) {
    if (!this._footerEl) return null;
    const handle = (e) => {
      var _a;
      if (action.isDisabled) return;
      (_a = action.onClick) == null ? void 0 : _a.call(action, e);
    };
    if (action.kind === "link") {
      const a = document.createElement("a");
      a.dataset.actionId = dataActionId;
      this._footerEl.appendChild(a);
      return ArvoLink.initialize(a, {
        variant: "primary",
        size: "sm",
        label: action.label,
        href: action.href ?? "#",
        icon: action.icon ?? null,
        isExternal: action.isExternal === true,
        isDisabled: action.isDisabled === true,
        onClick: handle
      });
    }
    if (action.kind === "buttonLink") {
      const a = document.createElement("a");
      a.dataset.actionId = dataActionId;
      this._footerEl.appendChild(a);
      return ArvoButtonLink.initialize(a, {
        variant: "outline",
        size: "sm",
        label: action.label,
        href: action.href ?? "#",
        icon: action.icon ?? null,
        hasExternalLink: action.isExternal === true,
        isDisabled: action.isDisabled === true,
        onClick: handle
      });
    }
    const btn = document.createElement("button");
    btn.dataset.actionId = dataActionId;
    this._footerEl.appendChild(btn);
    return ArvoButton.initialize(btn, {
      variant: "inline",
      size: "sm",
      label: action.label,
      icon: action.icon ?? null,
      isDisabled: action.isDisabled === true,
      onClick: handle
    });
  }
  _shouldShowFooter() {
    return this._options.actions.length > 0 && !this._options.isLoading;
  }
  _writeMessage(target, content) {
    while (target.firstChild) target.removeChild(target.firstChild);
    target.appendChild(
      renderInlineContentToDOM(content, { profile: "basic-inline" })
    );
  }
  _writeBodyContent(target, content) {
    while (target.firstChild) target.removeChild(target.firstChild);
    if (typeof content === "string") {
      target.textContent = content;
    } else if (typeof content === "function") {
      content(target);
    } else if (content instanceof Node) {
      target.appendChild(content);
    }
  }
  _buildPanelClasses() {
    return [
      "arvo-rtip",
      `arvo-rtip--${this._options.placement}`,
      this._options.hasPointer && "arvo-rtip--with-pointer",
      this._shouldShowFooter() && "arvo-rtip--with-footer",
      this._options.isLoading && "loading"
    ].filter(Boolean).join(" ");
  }
  // -------------------------------------------------------------------------
  // Trigger ARIA + events
  // -------------------------------------------------------------------------
  _writeTriggerAriaDescribedBy() {
    const el = this._element;
    if (!el) return;
    const existing = el.getAttribute("aria-describedby");
    this._previousAriaDescribedBy = existing;
    const ids = existing ? existing.split(/\s+/).filter(Boolean) : [];
    if (!ids.includes(this._panelId)) {
      ids.push(this._panelId);
      el.setAttribute("aria-describedby", ids.join(" "));
      this._addedAriaDescribedBy = true;
    }
  }
  _removeTriggerAriaDescribedBy() {
    const el = this._element;
    if (!el || !this._addedAriaDescribedBy) return;
    const current = el.getAttribute("aria-describedby");
    if (!current) return;
    const next = current.split(/\s+/).filter((token) => token && token !== this._panelId);
    if (next.length > 0) {
      el.setAttribute("aria-describedby", next.join(" "));
    } else {
      el.removeAttribute("aria-describedby");
    }
    this._addedAriaDescribedBy = false;
    this._previousAriaDescribedBy = null;
  }
  _bindTriggerEvents() {
    const el = this._element;
    if (!el || this._options.trigger === "manual") return;
    if (this._options.trigger === "click") {
      el.addEventListener("click", this._boundHandleTriggerClick);
      return;
    }
    if (this._options.trigger === "hover") {
      el.addEventListener("pointerenter", this._boundHandleTriggerPointerEnter);
      el.addEventListener("pointerleave", this._boundHandleTriggerPointerLeave);
      el.addEventListener("focus", this._boundHandleTriggerFocus);
      el.addEventListener("blur", this._boundHandleTriggerBlur);
      return;
    }
    if (this._options.trigger === "focus") {
      el.addEventListener("focus", this._boundHandleTriggerFocus);
      el.addEventListener("blur", this._boundHandleTriggerBlur);
    }
  }
  _unbindTriggerEvents() {
    const el = this._element;
    if (!el) return;
    el.removeEventListener("click", this._boundHandleTriggerClick);
    el.removeEventListener("pointerenter", this._boundHandleTriggerPointerEnter);
    el.removeEventListener("pointerleave", this._boundHandleTriggerPointerLeave);
    el.removeEventListener("focus", this._boundHandleTriggerFocus);
    el.removeEventListener("blur", this._boundHandleTriggerBlur);
  }
  _handleTriggerClick() {
    if (this._options.isDisabled) return;
    this.toggle();
  }
  _handleTriggerPointerEnter() {
    if (this._options.isDisabled) return;
    this._clearHoverTimers();
    this._hoverOpenTimer = setTimeout(() => this.open(), 150);
  }
  _handleTriggerPointerLeave() {
    this._clearHoverTimers();
    this._hoverCloseTimer = setTimeout(() => this.close(), 100);
  }
  _handleTriggerFocus() {
    if (this._options.isDisabled) return;
    if (this._suppressFocusOpen) return;
    this.open();
  }
  _handleTriggerBlur() {
    if (this._suppressFocusOpen) return;
    setTimeout(() => {
      if (this._panelEl && document.activeElement && !this._panelEl.contains(document.activeElement)) {
        this.close();
      }
    }, 0);
  }
  _handlePanelPointerEnter() {
    if (this._options.trigger !== "hover") return;
    this._clearHoverTimers();
  }
  _handlePanelPointerLeave() {
    if (this._options.trigger !== "hover") return;
    this._hoverCloseTimer = setTimeout(() => this.close(), 100);
  }
  _clearHoverTimers() {
    if (this._hoverOpenTimer) {
      clearTimeout(this._hoverOpenTimer);
      this._hoverOpenTimer = null;
    }
    if (this._hoverCloseTimer) {
      clearTimeout(this._hoverCloseTimer);
      this._hoverCloseTimer = null;
    }
  }
  /**
   * If focus is currently inside the panel (user tabbed into a footer
   * action), move it back to the trigger before the panel unmounts so
   * keyboard users don't lose their focus context. Suppress our own
   * trigger-focus listener so the synthetic focus event doesn't
   * immediately reopen the tooltip we're trying to close.
   */
  _restorePanelFocusToTrigger() {
    const trigger = this._element;
    const panel = this._panelEl;
    const active = document.activeElement;
    if (!trigger || !panel || !active) return;
    if (!panel.contains(active)) return;
    this._suppressFocusOpen = true;
    trigger.focus({ preventScroll: true });
    if (this._suppressFocusOpenTimer) {
      clearTimeout(this._suppressFocusOpenTimer);
    }
    this._suppressFocusOpenTimer = setTimeout(() => {
      this._suppressFocusOpen = false;
      this._suppressFocusOpenTimer = null;
    }, 0);
  }
  // -------------------------------------------------------------------------
  // Engine close (two-path split)
  // -------------------------------------------------------------------------
  _handleEngineClose() {
    var _a, _b, _c;
    if (this._closingProgrammatically) return;
    this._isOpen = false;
    this._clearHoverTimers();
    this._restorePanelFocusToTrigger();
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent("rtip:close", { bubbles: true, cancelable: false })
    );
    this._dispatchOpenChange(false);
    (_c = (_b = this._options).onClose) == null ? void 0 : _c.call(_b);
  }
  _dispatchOpenChange(isOpen) {
    var _a;
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent("rtip:openchange", {
        bubbles: true,
        detail: { isOpen }
      })
    );
  }
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  open() {
    var _a, _b, _c, _d;
    if (this._isOpen || this._options.isDisabled) return;
    if (((_b = (_a = this._options).onOpen) == null ? void 0 : _b.call(_a)) === false) return;
    const evt = new CustomEvent("rtip:open", {
      bubbles: true,
      cancelable: true
    });
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(evt);
    if (evt.defaultPrevented) return;
    this._isOpen = true;
    void ((_d = this._surface) == null ? void 0 : _d.open());
    this._dispatchOpenChange(true);
  }
  close() {
    var _a, _b, _c, _d;
    if (!this._isOpen) return;
    if (((_b = (_a = this._options).onClose) == null ? void 0 : _b.call(_a)) === false) return;
    const evt = new CustomEvent("rtip:close", {
      bubbles: true,
      cancelable: true
    });
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(evt);
    if (evt.defaultPrevented) return;
    this._isOpen = false;
    this._clearHoverTimers();
    this._restorePanelFocusToTrigger();
    this._closingProgrammatically = true;
    void ((_d = this._surface) == null ? void 0 : _d.close());
    this._closingProgrammatically = false;
    this._dispatchOpenChange(false);
  }
  toggle() {
    if (this._isOpen) this.close();
    else this.open();
  }
  isOpen() {
    return this._isOpen;
  }
  disabled(value) {
    if (value === void 0) return this._options.isDisabled;
    this._options.isDisabled = value === true;
    if (this._options.isDisabled && this._isOpen) {
      this.close();
    }
  }
  setLoading(loading) {
    this._options.isLoading = loading === true;
    if (!this._panelEl) return;
    this._panelEl.classList.toggle("loading", this._options.isLoading);
    if (this._options.isLoading) {
      this._panelEl.setAttribute("aria-busy", "true");
    } else {
      this._panelEl.removeAttribute("aria-busy");
    }
  }
  setActions(actions) {
    var _a;
    this._options.actions = truncateActions(actions);
    this._destroyActionInstances();
    if (this._footerEl) {
      this._footerEl.remove();
      this._footerEl = null;
    }
    if (this._shouldShowFooter() && this._panelEl) {
      this._renderFooter();
    }
    if (this._panelEl) {
      this._panelEl.className = this._buildPanelClasses();
    }
    if (this._isOpen) (_a = this._surface) == null ? void 0 : _a.reposition();
  }
  renderMessage(content) {
    var _a;
    this._options.message = content;
    if (!this._panelEl || !this._bodyEl) return;
    if (!this._msgEl) {
      this._msgEl = document.createElement("div");
      this._msgEl.className = "arvo-rtip__msg";
      if (this._slotEl) {
        this._bodyEl.insertBefore(this._msgEl, this._slotEl);
      } else {
        this._bodyEl.appendChild(this._msgEl);
      }
    }
    this._writeMessage(this._msgEl, content);
    if (this._isOpen) (_a = this._surface) == null ? void 0 : _a.reposition();
  }
  reposition() {
    var _a;
    (_a = this._surface) == null ? void 0 : _a.reposition();
  }
  get element() {
    return this._panelEl;
  }
  get triggerId() {
    return this._panelId;
  }
  _destroyActionInstances() {
    for (const inst of this._actionInstances) {
      const candidate = inst;
      if (typeof candidate.destroy === "function") candidate.destroy();
    }
    this._actionInstances = [];
  }
  destroy() {
    var _a, _b, _c, _d;
    (_a = this._surface) == null ? void 0 : _a.destroy();
    this._surface = null;
    this._isOpen = false;
    this._clearHoverTimers();
    if (this._suppressFocusOpenTimer) {
      clearTimeout(this._suppressFocusOpenTimer);
      this._suppressFocusOpenTimer = null;
    }
    this._suppressFocusOpen = false;
    this._unbindTriggerEvents();
    this._removeTriggerAriaDescribedBy();
    (_b = this._statusInstance) == null ? void 0 : _b.destroy();
    this._statusInstance = null;
    this._badgeInstance = null;
    (_d = (_c = this._bannerInstance) == null ? void 0 : _c.destroy) == null ? void 0 : _d.call(_c);
    this._bannerInstance = null;
    this._destroyActionInstances();
    if (this._panelEl) {
      this._panelEl.removeEventListener("pointerenter", this._boundHandlePanelPointerEnter);
      this._panelEl.removeEventListener("pointerleave", this._boundHandlePanelPointerLeave);
      this._panelEl.remove();
    }
    this._element = null;
    this._panelEl = null;
    this._hdrEl = null;
    this._titleEl = null;
    this._hdrMetaEl = null;
    this._bodyEl = null;
    this._bannerWrapEl = null;
    this._msgEl = null;
    this._slotEl = null;
    this._footerEl = null;
    this._pointerEl = null;
  }
};
_ArvoRichTooltip.DEFAULTS = {
  trigger: "hover",
  placement: "bottom-center",
  offset: 4,
  maxWidth: null,
  hasPointer: false,
  title: null,
  status: null,
  badge: null,
  banner: null,
  message: null,
  bodyContent: null,
  actions: [],
  closeBehavior: "both",
  ariaLabel: null,
  isOpen: false,
  isDisabled: false,
  isLoading: false,
  onOpen: null,
  onClose: null
};
let ArvoRichTooltip = _ArvoRichTooltip;
export {
  ArvoRichTooltip
};
//# sourceMappingURL=RichTooltip.js.map
