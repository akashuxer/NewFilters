"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const core = require("@arvo/core");
const utils = require("@arvo/utils");
const Button = require("../Button/Button.cjs");
const IconButton = require("../IconButton/IconButton.cjs");
const DropdownButton = require("../DropdownButton/DropdownButton.cjs");
const SplitButton = require("../SplitButton/SplitButton.cjs");
const DropdownIconButton = require("../DropdownIconButton/DropdownIconButton.cjs");
const SplitIconButton = require("../SplitIconButton/SplitIconButton.cjs");
const Switch = require("../Switch/Switch.cjs");
const Badge = require("../Badge/Badge.cjs");
const Status = require("../Status/Status.cjs");
const EmptyState = require("../EmptyState/EmptyState.cjs");
const MAX_HEADER_ACTIONS = 3;
const MAX_SECONDARY_ACTIONS = 2;
const ALLOWED_HEADER_VARIANTS = /* @__PURE__ */ new Set(["tertiary", "outline", "inline"]);
const HEADER_EXCLUDE_DRAG_SELECTOR = [
  ".arvo-win__back-btn",
  ".arvo-win__max-btn",
  ".arvo-win__close-btn",
  ".arvo-win__header-actions",
  ".arvo-win__status",
  ".arvo-win__badge",
  "button",
  '[role="button"]',
  "a[href]",
  "input",
  "select",
  "textarea",
  '[tabindex]:not([tabindex="-1"])'
].join(", ");
const warnedKeys = /* @__PURE__ */ new Set();
function warnOnce(key, message) {
  var _a;
  if (typeof process === "undefined" || ((_a = process.env) == null ? void 0 : _a.NODE_ENV) === "production") {
    return;
  }
  if (warnedKeys.has(key)) return;
  warnedKeys.add(key);
  console.warn(message);
}
function clampHeaderActions(actions) {
  if (!actions || actions.length === 0) return [];
  if (actions.length > MAX_HEADER_ACTIONS) {
    warnOnce(
      `win-header-overflow-${actions.length}`,
      `[ArvoWindow] headerActions accepts at most ${MAX_HEADER_ACTIONS} consumer items (Maximize and Close are system-controlled). Extra items are dropped.`
    );
  }
  return actions.slice(0, MAX_HEADER_ACTIONS);
}
function clampSecondaryActions(actions) {
  if (!actions || actions.length === 0) return [];
  if (actions.length > MAX_SECONDARY_ACTIONS) {
    warnOnce(
      `win-footer-secondary-overflow-${actions.length}`,
      `[ArvoWindow] secondaryActions accepts at most ${MAX_SECONDARY_ACTIONS} items. Extra items are dropped.`
    );
  }
  return actions.slice(0, MAX_SECONDARY_ACTIONS);
}
function renderInto(container, content) {
  container.textContent = "";
  if (typeof content === "string") {
    container.innerHTML = content;
  } else if (typeof content === "function") {
    content(container);
  } else if (content instanceof Node) {
    container.appendChild(content);
  }
}
let _idCounter = 0;
class ArvoWindow {
  constructor(options) {
    this._rootEl = null;
    this._panelEl = null;
    this._headerEl = null;
    this._headerLeftEl = null;
    this._headerActionsEl = null;
    this._titleEl = null;
    this._bodyEl = null;
    this._footerEl = null;
    this._footerLeftEl = null;
    this._actionsEl = null;
    this._footerFit = null;
    this._backBtn = null;
    this._maxBtn = null;
    this._closeBtn = null;
    this._badgeInstance = null;
    this._statusInstance = null;
    this._headerActionInstances = [];
    this._headerActionWrappers = [];
    this._primaryBtn = null;
    this._secondaryBtns = [];
    this._emptyStateInstance = null;
    this._surface = null;
    this._drag = null;
    this._dragOffset = { x: 0, y: 0 };
    this._preMaximizeOffset = null;
    this._isOpen = false;
    this._isMaximized = false;
    this._isLoading = false;
    this._isDisabled = false;
    this._closingProgrammatically = false;
    const uid = ++_idCounter;
    this._windowId = `arvo-win-${uid}`;
    this._titleId = `arvo-win-title-${uid}`;
    this._bodyId = `arvo-win-body-${uid}`;
    this._options = this._normalizeOptions(options);
    this._isLoading = !!this._options.isLoading === true;
    this._isDisabled = !!this._options.isDisabled;
    this._isMaximized = !!this._options.isMaximized;
    this._boundHandleKeyDown = this._handleKeyDown.bind(this);
    this._validateAccessibleName();
    this._render();
  }
  static initialize(options) {
    return new ArvoWindow(options);
  }
  // -----------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------
  open() {
    var _a, _b;
    if (this._isOpen) return;
    if (((_b = (_a = this._options).onOpen) == null ? void 0 : _b.call(_a)) === false) return;
    if (!this._rootEl || !this._panelEl) return;
    this._isOpen = true;
    const container = this._resolveContainer();
    container.appendChild(this._rootEl);
    this._rootEl.classList.add("open");
    if (!this._surface) {
      this._surface = core.createOverlaySurface({
        id: this._windowId,
        surface: this._panelEl,
        // Pin the outer host's stacking context to the panel's hub-assigned
        // z-index so consumer-level zIndexBase tuning (overlayHub.configure)
        // lifts the WHOLE window above sibling overlays -- not just the
        // inner panel inside a wrapper trapped at the SCSS fallback layer.
        surfaceRoot: this._rootEl,
        type: "modal",
        priority: 10,
        trigger: null,
        position: false,
        focus: {
          mode: "trap",
          initialFocus: "first",
          returnFocus: true,
          activateAfterTransition: true
        },
        mask: this._options.hasBackdrop !== false ? {
          className: "arvo-win__overlay-mask",
          closeOnClick: this._options.closeOnBackdrop ?? false,
          onOutside: () => this._closeViaEngine()
        } : void 0,
        managesOwnBackdrop: true,
        lockScroll: this._options.hasBackdrop !== false,
        transition: "scale",
        transitionDuration: 150,
        closeOnOutside: this._options.closeOnBackdrop ?? false,
        triggerAria: false,
        onClose: () => this._handleEngineClose()
      });
    }
    void this._surface.open();
    if (this._options.closeOnEscape !== false) {
      document.addEventListener("keydown", this._boundHandleKeyDown, true);
    }
    window.requestAnimationFrame(() => {
      this._attachDragHandle();
    });
    this._dispatchEvent("win:open", {});
  }
  close(reason = "programmatic") {
    var _a, _b, _c;
    if (!this._isOpen) return;
    if (((_b = (_a = this._options).onClose) == null ? void 0 : _b.call(_a, { reason })) === false) return;
    this._isOpen = false;
    document.removeEventListener("keydown", this._boundHandleKeyDown, true);
    this._dispatchEvent("win:close", { reason });
    this._detachDragHandle();
    this._closingProgrammatically = true;
    const closePromise = (_c = this._surface) == null ? void 0 : _c.close();
    this._closingProgrammatically = false;
    if (closePromise) {
      void closePromise.then(() => this._finalizeClose());
    } else {
      this._finalizeClose();
    }
  }
  /**
   * Picker-silent close path for engine-driven triggers (Escape via this
   * component's own keydown listener, backdrop click via the mask's
   * onOutside). Does NOT call the user's `onClose` and does NOT dispatch
   * `win:close` -- those are reserved for the programmatic path. The root
   * teardown is chained off the engine's close Promise so it lands exactly
   * when the exit transition finishes (no racing setTimeout).
   */
  _closeViaEngine() {
    var _a;
    if (!this._isOpen) return;
    this._isOpen = false;
    document.removeEventListener("keydown", this._boundHandleKeyDown, true);
    this._detachDragHandle();
    const closePromise = (_a = this._surface) == null ? void 0 : _a.close();
    if (closePromise) {
      void closePromise.then(() => this._finalizeClose());
    } else {
      this._finalizeClose();
    }
  }
  /**
   * Removes the root wrapper from the DOM after the exit transition has
   * fully resolved. Called exactly once per open/close cycle via the
   * engine's close() Promise -- never via a racing setTimeout.
   */
  _finalizeClose() {
    const root = this._rootEl;
    if (!root) return;
    root.classList.remove("open");
    if (root.parentNode) {
      root.parentNode.removeChild(root);
    }
  }
  isOpen() {
    return this._isOpen;
  }
  toggle() {
    if (this._isOpen) this.close();
    else this.open();
  }
  title(value) {
    if (value === void 0) return this._options.title ?? "";
    this._options.title = value;
    if (this._titleEl) this._titleEl.textContent = value;
  }
  maximized(value) {
    var _a, _b, _c, _d, _e, _f;
    if (value === void 0) return this._isMaximized;
    if (value === this._isMaximized) return;
    if (value) {
      this._preMaximizeOffset = { ...this._dragOffset };
      this._detachDragHandle();
      this._isMaximized = true;
      (_a = this._rootEl) == null ? void 0 : _a.classList.add("arvo-win--maximized");
      (_b = this._rootEl) == null ? void 0 : _b.classList.remove("arvo-win--draggable");
      this._dispatchEvent("win:maximize", {});
    } else {
      this._isMaximized = false;
      (_c = this._rootEl) == null ? void 0 : _c.classList.remove("arvo-win--maximized");
      if (this._options.isDraggable !== false && this._options.hasHeader !== false) {
        (_d = this._rootEl) == null ? void 0 : _d.classList.add("arvo-win--draggable");
      }
      if (this._preMaximizeOffset) {
        this._dragOffset = { ...this._preMaximizeOffset };
        this._preMaximizeOffset = null;
        if (this._panelEl) {
          this._panelEl.style.setProperty("--arvo-win-x", `${this._dragOffset.x}px`);
          this._panelEl.style.setProperty("--arvo-win-y", `${this._dragOffset.y}px`);
        }
      }
      if (this._isOpen) this._attachDragHandle();
      this._dispatchEvent("win:restore", {});
    }
    (_f = (_e = this._options).onMaximizeChange) == null ? void 0 : _f.call(_e, this._isMaximized);
    if (this._maxBtn) {
      this._maxBtn.setIcon(this._isMaximized ? "priority-edge" : "expand");
    }
  }
  renderBody(content) {
    this._options.content = content;
    this._options.isEmptyState = false;
    if (!this._bodyEl) return;
    this._destroyEmptyState();
    renderInto(this._bodyEl, content);
  }
  setSize(size) {
    if (size === this._options.size) return;
    if (this._rootEl) {
      this._rootEl.classList.remove(`arvo-win--${this._options.size ?? "md"}`);
      this._rootEl.classList.add(`arvo-win--${size}`);
    }
    this._options.size = size;
  }
  setLoading(loading) {
    var _a, _b, _c, _d;
    if (this._isLoading === loading) return;
    this._isLoading = loading;
    (_a = this._rootEl) == null ? void 0 : _a.classList.toggle("loading", loading);
    if (this._panelEl) {
      if (loading) this._panelEl.setAttribute("aria-busy", "true");
      else this._panelEl.removeAttribute("aria-busy");
    }
    (_b = this._backBtn) == null ? void 0 : _b.disabled(loading || this._isDisabled);
    (_c = this._maxBtn) == null ? void 0 : _c.disabled(loading || this._isDisabled);
    (_d = this._closeBtn) == null ? void 0 : _d.disabled(loading || this._isDisabled);
  }
  setHeaderActions(actions) {
    this._options.headerActions = actions;
    if (!this._headerActionsEl) return;
    this._destroyHeaderActions();
    const clamped = clampHeaderActions(actions);
    const maxOrCloseWrapper = this._headerActionsEl.querySelector(
      ".arvo-win__max-btn, .arvo-win__close-btn"
    );
    clamped.forEach((action, i) => {
      const node = this._buildHeaderAction(action, i);
      if (!node) return;
      if (maxOrCloseWrapper) {
        this._headerActionsEl.insertBefore(node, maxOrCloseWrapper);
      } else {
        this._headerActionsEl.appendChild(node);
      }
    });
  }
  setFooterActions(actions) {
    var _a;
    if (actions.primary !== void 0) this._options.primaryAction = actions.primary;
    if (actions.secondary !== void 0)
      this._options.secondaryActions = actions.secondary;
    this._destroyFooterActions();
    (_a = this._footerFit) == null ? void 0 : _a.destroy();
    this._footerFit = null;
    if (this._actionsEl) {
      this._actionsEl.remove();
      this._actionsEl = null;
    }
    this._renderFooterActions();
  }
  setEmptyContent(config) {
    this._options.emptyContent = config ?? void 0;
    if (this._options.isEmptyState) {
      this._destroyEmptyState();
      this._renderEmptyStateBody();
    }
  }
  resetPosition() {
    var _a;
    this._dragOffset = { x: 0, y: 0 };
    if (this._panelEl) {
      this._panelEl.style.setProperty("--arvo-win-x", "0px");
      this._panelEl.style.setProperty("--arvo-win-y", "0px");
    }
    (_a = this._drag) == null ? void 0 : _a.reset();
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    (_a = this._drag) == null ? void 0 : _a.destroy();
    this._drag = null;
    (_b = this._surface) == null ? void 0 : _b.destroy();
    this._surface = null;
    if (this._isOpen) {
      this._isOpen = false;
      document.removeEventListener("keydown", this._boundHandleKeyDown, true);
    }
    (_c = this._backBtn) == null ? void 0 : _c.destroy();
    (_d = this._maxBtn) == null ? void 0 : _d.destroy();
    (_e = this._closeBtn) == null ? void 0 : _e.destroy();
    (_f = this._badgeInstance) == null ? void 0 : _f.destroy();
    (_g = this._statusInstance) == null ? void 0 : _g.destroy();
    this._destroyHeaderActions();
    this._destroyFooterActions();
    (_h = this._footerFit) == null ? void 0 : _h.destroy();
    this._footerFit = null;
    this._destroyEmptyState();
    this._backBtn = null;
    this._maxBtn = null;
    this._closeBtn = null;
    this._badgeInstance = null;
    this._statusInstance = null;
    if (this._rootEl && this._rootEl.parentNode) {
      this._rootEl.parentNode.removeChild(this._rootEl);
    }
    this._rootEl = null;
    this._panelEl = null;
    this._headerEl = null;
    this._headerLeftEl = null;
    this._headerActionsEl = null;
    this._titleEl = null;
    this._bodyEl = null;
    this._footerEl = null;
    this._footerLeftEl = null;
    this._actionsEl = null;
  }
  // -----------------------------------------------------------------
  // Two-path close (picker-silent)
  // -----------------------------------------------------------------
  /**
   * Engine-driven onClose callback. Called synchronously inside
   * `surface.close()` regardless of who initiated the close.
   *
   * - When `close()` or `_closeViaEngine()` is the initiator, `_isOpen` is
   *   already `false` by the time we get here, so the early-return short-
   *   circuits and the Promise-chained `_finalizeClose` in the caller owns
   *   the teardown.
   * - When the overlay hub forcibly closes us (rare; e.g. a higher-priority
   *   modal opens), `_isOpen` is still `true`. We tear down picker-silent
   *   and schedule `_finalizeClose` to run just after the engine's exit
   *   transition completes (we have no Promise reference in that case).
   */
  _handleEngineClose() {
    if (this._closingProgrammatically) return;
    if (!this._isOpen) return;
    this._isOpen = false;
    document.removeEventListener("keydown", this._boundHandleKeyDown, true);
    this._detachDragHandle();
    window.setTimeout(() => this._finalizeClose(), 170);
  }
  _handleKeyDown(e) {
    if (e.key !== "Escape") return;
    if (!this._isOpen) return;
    e.stopPropagation();
    this._closeViaEngine();
  }
  // -----------------------------------------------------------------
  // Drag handle
  // -----------------------------------------------------------------
  _attachDragHandle() {
    if (this._drag) return;
    if (!this._isOpen) return;
    if (this._isMaximized) return;
    if (this._isDisabled || this._isLoading) return;
    if (this._options.isDraggable === false) return;
    if (this._options.hasHeader === false) return;
    if (!this._headerEl || !this._panelEl) return;
    this._drag = core.createDragHandle({
      handle: this._headerEl,
      target: this._panelEl,
      excludeSelector: HEADER_EXCLUDE_DRAG_SELECTOR,
      bounds: "viewport",
      initialOffset: this._dragOffset,
      cssVar: { x: "--arvo-win-x", y: "--arvo-win-y" },
      draggingClass: "",
      onDragStart: (e) => {
        var _a, _b, _c;
        (_a = this._rootEl) == null ? void 0 : _a.classList.add("dragging");
        (_c = (_b = this._options).onDragStart) == null ? void 0 : _c.call(_b, e);
        this._dispatchEvent("win:drag-start", { offset: { ...this._dragOffset } });
      },
      onDrag: (offset) => {
        this._dragOffset = offset;
      },
      onDragEnd: (offset) => {
        var _a, _b, _c;
        this._dragOffset = offset;
        (_a = this._rootEl) == null ? void 0 : _a.classList.remove("dragging");
        (_c = (_b = this._options).onDragEnd) == null ? void 0 : _c.call(_b, offset);
        this._dispatchEvent("win:drag-end", { offset: { ...offset } });
      }
    });
  }
  _detachDragHandle() {
    var _a, _b;
    (_a = this._drag) == null ? void 0 : _a.destroy();
    this._drag = null;
    (_b = this._rootEl) == null ? void 0 : _b.classList.remove("dragging");
  }
  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  _normalizeOptions(o) {
    return {
      ...o,
      size: o.size ?? "md",
      icon: o.icon ?? "desktop",
      statusType: o.statusType ?? "available",
      backLabel: o.backLabel ?? "Go back",
      closeLabel: o.closeLabel ?? "Close window",
      hasTitle: o.hasTitle ?? true,
      hasHeader: o.hasHeader ?? true,
      hasFooter: o.hasFooter ?? true,
      isDraggable: o.isDraggable ?? true,
      hasBackdrop: o.hasBackdrop ?? true,
      closeOnBackdrop: o.closeOnBackdrop ?? false,
      closeOnEscape: o.closeOnEscape ?? true
    };
  }
  _validateAccessibleName() {
    const o = this._options;
    const hasVisibleTitle = o.hasHeader !== false && o.hasTitle !== false && !!o.title;
    if (!hasVisibleTitle && !o.ariaLabel) {
      warnOnce(
        "win-no-accessible-name-js",
        "[ArvoWindow] Provide either a visible `title` or an `ariaLabel`. Windows must have an accessible name."
      );
    }
  }
  _render() {
    const o = this._options;
    this._rootEl = document.createElement("div");
    this._rootEl.className = this._buildRootClasses();
    this._panelEl = document.createElement("div");
    this._panelEl.id = this._windowId;
    this._panelEl.className = "arvo-win__panel";
    this._panelEl.setAttribute("role", "dialog");
    this._panelEl.setAttribute("aria-modal", o.hasBackdrop !== false ? "true" : "false");
    const renderTitle = o.hasHeader !== false && o.hasTitle !== false && !!o.title;
    if (renderTitle) {
      this._panelEl.setAttribute("aria-labelledby", this._titleId);
    } else if (o.ariaLabel) {
      this._panelEl.setAttribute("aria-label", o.ariaLabel);
    }
    if (o.ariaDescribedBy) {
      this._panelEl.setAttribute("aria-describedby", o.ariaDescribedBy);
    }
    if (this._isLoading) this._panelEl.setAttribute("aria-busy", "true");
    this._panelEl.tabIndex = -1;
    if (o.hasHeader !== false) this._renderHeader();
    this._renderBody();
    if (o.hasFooter !== false) this._renderFooter();
    if (this._headerEl) this._panelEl.appendChild(this._headerEl);
    if (this._bodyEl) this._panelEl.appendChild(this._bodyEl);
    if (this._footerEl) this._panelEl.appendChild(this._footerEl);
    this._rootEl.appendChild(this._panelEl);
  }
  _buildRootClasses() {
    const o = this._options;
    const dragEnabled = o.isDraggable !== false && o.hasHeader !== false && !this._isMaximized;
    return [
      "arvo-win",
      `arvo-win--${o.size ?? "md"}`,
      this._isMaximized && "arvo-win--maximized",
      dragEnabled && "arvo-win--draggable",
      o.hasBackdrop === false && "arvo-win--no-backdrop",
      o.hasIcon && "arvo-win--has-icon",
      o.hasStatusIndicator && "arvo-win--has-status",
      o.badge && "arvo-win--has-badge",
      o.hasBackBtn && "arvo-win--has-back-btn",
      o.hasMaximize && "arvo-win--has-maximize",
      o.isEmptyState && "arvo-win--empty",
      this._isLoading && "loading"
    ].filter(Boolean).join(" ");
  }
  _renderHeader() {
    const o = this._options;
    this._headerEl = document.createElement("div");
    this._headerEl.className = "arvo-win__header";
    this._headerLeftEl = document.createElement("div");
    this._headerLeftEl.className = "arvo-win__header-left";
    if (o.hasBackBtn) {
      const wrap = document.createElement("span");
      wrap.className = "arvo-win__back-btn";
      const btn = document.createElement("button");
      this._backBtn = IconButton.ArvoIconButton.initialize(btn, {
        icon: "arrow-left",
        size: "sm",
        variant: "secondary",
        tooltip: o.backLabel ?? "Go back",
        isDisabled: this._isLoading || this._isDisabled,
        onClick: (e) => {
          var _a;
          if (this._isLoading || this._isDisabled) return;
          (_a = o.onBack) == null ? void 0 : _a.call(o, e);
          this._dispatchEvent("win:back", {});
        }
      });
      btn.setAttribute("aria-label", o.backLabel ?? "Go back");
      wrap.appendChild(btn);
      this._headerLeftEl.appendChild(wrap);
    }
    if (o.hasIcon) {
      const ico = document.createElement("span");
      ico.className = `arvo-win__ico o9con o9con-${o.icon}`;
      ico.setAttribute("aria-hidden", "true");
      this._headerLeftEl.appendChild(ico);
    }
    const renderTitle = o.hasTitle !== false && !!o.title;
    if (renderTitle) {
      this._titleEl = document.createElement("p");
      this._titleEl.id = this._titleId;
      this._titleEl.className = "arvo-win__title";
      this._titleEl.textContent = o.title;
      this._headerLeftEl.appendChild(this._titleEl);
    }
    if (o.hasStatusIndicator) {
      const wrap = document.createElement("span");
      wrap.className = "arvo-win__status";
      wrap.setAttribute("aria-hidden", "true");
      const host = document.createElement("span");
      this._statusInstance = Status.ArvoStatus.initialize(host, {
        type: o.statusType ?? "available",
        size: "sm"
      });
      wrap.appendChild(host);
      this._headerLeftEl.appendChild(wrap);
    }
    if (o.badge) {
      const wrap = document.createElement("span");
      wrap.className = "arvo-win__badge";
      const host = document.createElement("span");
      this._badgeInstance = Badge.ArvoBadge.initialize(host, {
        ...o.badge,
        variant: "label",
        size: "sm",
        placement: "inline",
        hasStatus: false
      });
      wrap.appendChild(host);
      this._headerLeftEl.appendChild(wrap);
    }
    this._headerActionsEl = document.createElement("div");
    this._headerActionsEl.className = "arvo-win__header-actions";
    const clamped = clampHeaderActions(o.headerActions);
    clamped.forEach((action, i) => {
      const node = this._buildHeaderAction(action, i);
      if (node) this._headerActionsEl.appendChild(node);
    });
    if (o.hasMaximize) {
      const wrap = document.createElement("span");
      wrap.className = "arvo-win__max-btn";
      const btn = document.createElement("button");
      this._maxBtn = IconButton.ArvoIconButton.initialize(btn, {
        icon: this._isMaximized ? "priority-edge" : "expand",
        size: "sm",
        variant: "tertiary",
        tooltip: this._isMaximized ? "Restore Exit Full screen" : "Maximize Full Screen",
        isDisabled: this._isLoading || this._isDisabled,
        onClick: () => {
          if (this._isLoading || this._isDisabled) return;
          this.maximized(!this._isMaximized);
        }
      });
      btn.setAttribute(
        "aria-label",
        this._isMaximized ? "Restore Exit Full screen" : "Maximize Full Screen"
      );
      wrap.appendChild(btn);
      this._headerActionsEl.appendChild(wrap);
    }
    const closeWrap = document.createElement("span");
    closeWrap.className = "arvo-win__close-btn";
    const closeBtnEl = document.createElement("button");
    this._closeBtn = IconButton.ArvoIconButton.initialize(closeBtnEl, {
      icon: "close",
      size: "sm",
      variant: "tertiary",
      tooltip: o.closeLabel ?? "Close window",
      isDisabled: this._isLoading || this._isDisabled,
      onClick: () => this.close("close-button")
    });
    closeBtnEl.setAttribute("aria-label", o.closeLabel ?? "Close window");
    closeWrap.appendChild(closeBtnEl);
    this._headerActionsEl.appendChild(closeWrap);
    this._headerEl.appendChild(this._headerLeftEl);
    this._headerEl.appendChild(this._headerActionsEl);
  }
  _buildHeaderAction(action, index) {
    if (action.type !== "switch") {
      const v = action.variant;
      if (v && !ALLOWED_HEADER_VARIANTS.has(v)) {
        warnOnce(
          `win-header-variant-${action.id ?? action.type}-${v}`,
          `[ArvoWindow] Header action variant '${v}' is not allowed. Use one of: ${[...ALLOWED_HEADER_VARIANTS].join(", ")}.`
        );
      }
    }
    const disabled = this._isLoading || this._isDisabled || !!action.isDisabled;
    const host = document.createElement("span");
    this._headerActionWrappers.push(host);
    switch (action.type) {
      case "icon-button": {
        const btn = document.createElement("button");
        const variant = action.variant && ALLOWED_HEADER_VARIANTS.has(action.variant) ? action.variant : "tertiary";
        const inst = IconButton.ArvoIconButton.initialize(btn, {
          icon: action.icon,
          size: "sm",
          variant,
          tooltip: action.tooltip ?? "",
          isDisabled: disabled,
          isLoading: action.isLoading,
          onClick: action.onClick
        });
        this._headerActionInstances.push(inst);
        host.appendChild(btn);
        return host;
      }
      case "button": {
        const btn = document.createElement("button");
        const variant = action.variant && ALLOWED_HEADER_VARIANTS.has(action.variant) ? action.variant : "inline";
        const inst = Button.ArvoButton.initialize(btn, {
          label: action.label,
          icon: action.icon,
          variant,
          size: "sm",
          isDisabled: disabled,
          isLoading: action.isLoading,
          onClick: action.onClick
        });
        this._headerActionInstances.push(inst);
        host.appendChild(btn);
        return host;
      }
      case "dropdown-button": {
        const btn = document.createElement("button");
        const variant = action.variant && ALLOWED_HEADER_VARIANTS.has(action.variant) ? action.variant : "tertiary";
        const inst = DropdownButton.ArvoDropdownButton.initialize(btn, {
          label: action.label,
          icon: action.icon,
          items: action.items,
          variant,
          size: "sm",
          isDisabled: disabled,
          isLoading: action.isLoading,
          onSelect: action.onSelect
        });
        this._headerActionInstances.push(inst);
        host.appendChild(btn);
        return host;
      }
      case "dropdown-icon-button": {
        const btn = document.createElement("button");
        const variant = action.variant && ALLOWED_HEADER_VARIANTS.has(action.variant) ? action.variant : "tertiary";
        const inst = DropdownIconButton.ArvoDropdownIconButton.initialize(btn, {
          icon: action.icon ?? "ellipsis-v",
          tooltip: action.tooltip ?? "",
          items: action.items,
          variant,
          size: "sm",
          isDisabled: disabled,
          isLoading: action.isLoading,
          onSelect: action.onSelect
        });
        this._headerActionInstances.push(inst);
        host.appendChild(btn);
        return host;
      }
      case "split-button": {
        if (action.variant === "outline") {
          warnOnce(
            `win-split-button-outline-js-${action.id ?? index}`,
            `[ArvoWindow] SplitButton header action does not support variant 'outline'; falling back to 'tertiary'.`
          );
        }
        const btn = document.createElement("div");
        const inst = SplitButton.ArvoSplitButton.initialize(btn, {
          label: action.label,
          icon: action.icon,
          items: action.items,
          variant: "tertiary",
          size: "sm",
          isDisabled: disabled,
          isLoading: action.isLoading,
          onAction: action.onPrimaryClick ? (e) => action.onPrimaryClick(e) : void 0,
          onSelect: action.onSelect
        });
        this._headerActionInstances.push(inst);
        host.appendChild(btn);
        return host;
      }
      case "split-icon-button": {
        if (action.variant === "outline") {
          warnOnce(
            `win-split-icon-button-outline-js-${action.id ?? index}`,
            `[ArvoWindow] SplitIconButton header action does not support variant 'outline'; falling back to 'tertiary'.`
          );
        }
        const btn = document.createElement("div");
        const inst = SplitIconButton.ArvoSplitIconButton.initialize(btn, {
          icon: action.icon,
          tooltip: action.tooltip ?? "",
          items: action.items,
          variant: "tertiary",
          size: "sm",
          isDisabled: disabled,
          isLoading: action.isLoading,
          onAction: action.onPrimaryClick ? (e) => action.onPrimaryClick(e) : void 0,
          onSelect: action.onSelect
        });
        this._headerActionInstances.push(inst);
        host.appendChild(btn);
        return host;
      }
      case "switch": {
        const sw = document.createElement("div");
        const inst = Switch.ArvoSwitch.initialize(sw, {
          label: action.label ?? null,
          size: "sm",
          isChecked: action.isChecked ?? action.defaultChecked,
          isDisabled: disabled,
          isLoading: action.isLoading,
          onChange: action.onChange
        });
        this._headerActionInstances.push(inst);
        host.appendChild(sw);
        return host;
      }
      default:
        return null;
    }
  }
  _renderBody() {
    const o = this._options;
    this._bodyEl = document.createElement("div");
    this._bodyEl.id = this._bodyId;
    this._bodyEl.className = "arvo-win__body";
    if (o.isEmptyState) {
      this._renderEmptyStateBody();
    } else if (o.content !== null && o.content !== void 0) {
      renderInto(this._bodyEl, o.content);
    }
  }
  _renderEmptyStateBody() {
    if (!this._bodyEl) return;
    const o = this._options;
    const host = document.createElement("div");
    this._bodyEl.appendChild(host);
    this._emptyStateInstance = EmptyState.ArvoEmptyState.initialize(host, {
      ...o.emptyContent ?? {},
      size: this._isMaximized ? "lg" : "sm",
      orientation: "vertical"
    });
  }
  _destroyEmptyState() {
    var _a, _b;
    (_b = (_a = this._emptyStateInstance) == null ? void 0 : _a.destroy) == null ? void 0 : _b.call(_a);
    this._emptyStateInstance = null;
    if (this._bodyEl) this._bodyEl.textContent = "";
  }
  _renderFooter() {
    const o = this._options;
    this._footerEl = document.createElement("div");
    this._footerEl.className = "arvo-win__footer";
    if (o.footerLeft !== void 0 && o.footerLeft !== null) {
      this._footerLeftEl = document.createElement("div");
      this._footerLeftEl.className = "arvo-win__footer-left";
      renderInto(this._footerLeftEl, o.footerLeft);
      this._footerEl.appendChild(this._footerLeftEl);
    }
    this._renderFooterActions();
  }
  _renderFooterActions() {
    var _a;
    if (!this._footerEl) return;
    const primary = this._options.primaryAction;
    const secondaries = clampSecondaryActions(this._options.secondaryActions);
    if (!primary && secondaries.length === 0) return;
    this._actionsEl = document.createElement("div");
    this._actionsEl.className = "arvo-win__actions";
    secondaries.forEach((a, i) => {
      const node = this._buildFooterAction(a, "secondary", "secondary", i);
      if (node) this._actionsEl.appendChild(node);
    });
    if (primary) {
      const node = this._buildFooterAction(primary, "primary", "primary", 0);
      if (node) this._actionsEl.appendChild(node);
    }
    this._footerEl.appendChild(this._actionsEl);
    (_a = this._footerFit) == null ? void 0 : _a.destroy();
    this._footerFit = utils.attachOverlayFooterFit(this._actionsEl, { gap: 6 });
  }
  _buildFooterAction(action, reason, role, index) {
    const disabled = this._isLoading || this._isDisabled || !!action.isDisabled;
    const type = action.type ?? "button";
    const buttonVariant = role === "primary" ? action.semantic === "danger-primary" ? "danger-primary" : "primary" : "secondary";
    const ddVariant = role === "primary" ? "primary" : "secondary";
    const runClick = (e) => {
      var _a;
      if (this._isLoading || this._isDisabled || action.isDisabled) return;
      this._dispatchEvent("win:action", { action: role, actionId: action.id ?? null });
      const result = (_a = action.onClick) == null ? void 0 : _a.call(action, e);
      if (result === false) return;
      if (action.closeOnClick !== false) {
        this.close(reason);
      }
    };
    switch (type) {
      case "dropdown-button": {
        const btn = document.createElement("button");
        const inst = DropdownButton.ArvoDropdownButton.initialize(btn, {
          label: action.label,
          icon: action.icon,
          items: action.items ?? [],
          variant: ddVariant,
          size: "md",
          isDisabled: disabled,
          isLoading: action.isLoading,
          onSelect: action.onSelect,
          onClick: runClick
        });
        if (role === "primary") this._primaryBtn = inst;
        else this._secondaryBtns.push(inst);
        return btn;
      }
      case "split-button": {
        const btn = document.createElement("div");
        const inst = SplitButton.ArvoSplitButton.initialize(btn, {
          label: action.label,
          icon: action.icon,
          items: action.items ?? [],
          variant: ddVariant,
          size: "md",
          isDisabled: disabled,
          isLoading: action.isLoading,
          onAction: (e) => {
            var _a;
            const r = (_a = action.onPrimaryClick) == null ? void 0 : _a.call(action, e);
            if (r === false) return;
            runClick(e);
          },
          onSelect: action.onSelect
        });
        if (role === "primary") this._primaryBtn = inst;
        else this._secondaryBtns.push(inst);
        return btn;
      }
      case "button":
      default: {
        const btn = document.createElement("button");
        const inst = Button.ArvoButton.initialize(btn, {
          label: action.label,
          icon: action.icon,
          variant: buttonVariant,
          size: "md",
          isDisabled: disabled,
          isLoading: action.isLoading,
          onClick: runClick
        });
        if (role === "primary") this._primaryBtn = inst;
        else this._secondaryBtns.push(inst);
        return btn;
      }
    }
  }
  _destroyHeaderActions() {
    var _a;
    for (const inst of this._headerActionInstances) {
      (_a = inst.destroy) == null ? void 0 : _a.call(inst);
    }
    this._headerActionInstances = [];
    for (const wrap of this._headerActionWrappers) {
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }
    this._headerActionWrappers = [];
  }
  _destroyFooterActions() {
    var _a, _b, _c;
    (_b = (_a = this._primaryBtn) == null ? void 0 : _a.destroy) == null ? void 0 : _b.call(_a);
    this._primaryBtn = null;
    for (const inst of this._secondaryBtns) (_c = inst.destroy) == null ? void 0 : _c.call(inst);
    this._secondaryBtns = [];
  }
  _resolveContainer() {
    const c = this._options.container;
    if (!c) return document.body;
    if (typeof c === "string") {
      return document.querySelector(c) ?? document.body;
    }
    return c;
  }
  _dispatchEvent(eventName, detail = {}) {
    var _a;
    (_a = this._panelEl) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(eventName, { bubbles: true, cancelable: false, detail })
    );
  }
}
exports.ArvoWindow = ArvoWindow;
//# sourceMappingURL=Window.cjs.map
