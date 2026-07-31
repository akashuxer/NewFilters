import { warnDeprecated, createOverlaySurface } from "@arvo/core";
import { createPanelShell } from "../PanelShell/PanelShell.js";
function toCssLength(value) {
  if (value === null || value === void 0) return null;
  return typeof value === "number" ? `${value}px` : value;
}
function resolveMask(hasMask, closeOnOutsideClickProp) {
  if (hasMask === void 0 || hasMask === false) {
    return {
      hasMask: false,
      closeOnClick: closeOnOutsideClickProp
    };
  }
  if (hasMask === true) {
    return {
      hasMask: true,
      closeOnClick: closeOnOutsideClickProp
    };
  }
  return {
    hasMask: true,
    closeOnClick: hasMask.closeOnClick ?? closeOnOutsideClickProp
  };
}
function resolveSide(side) {
  var _a;
  const s = side ?? "right";
  if (s === "top" || s === "bottom") {
    if (typeof process !== "undefined" && ((_a = process.env) == null ? void 0 : _a.NODE_ENV) !== "production" && typeof console !== "undefined" && typeof console.warn === "function") {
      console.warn(
        `[ArvoDrawer] side="${s}" is not supported; the design system only allows "left" and "right". Falling back to "right".`
      );
    }
    return "right";
  }
  return s;
}
function resolveContainer(container) {
  if (container == null) return document.body;
  if (typeof container === "function") return container();
  return container;
}
const HOST_CLASSES = [
  "arvo-drw",
  "arvo-drw--side-left",
  "arvo-drw--side-right",
  "arvo-drw--with-mask",
  "loading",
  "is-disabled"
];
let _drawerIdCounter = 0;
class ArvoDrawer {
  constructor(element, options = {}) {
    this._overlayId = `arvo-drw-${++_drawerIdCounter}`;
    this._surface = null;
    this._closingProgrammatically = false;
    this._escapeListener = null;
    this._outsideClickListener = null;
    this._shellEventBindings = [];
    this._destroyed = false;
    warnDeprecated({
      component: "ArvoDrawer",
      successor: "ArvoPanel",
      reason: "Use displayMode='overlay' + placement='left'|'right' + isModal={hasMask}."
    });
    this._options = { ...options };
    this._markerEl = element;
    this._side = resolveSide(options.side);
    const closeOutside = options.closeOnOutsideClick !== void 0 ? options.closeOnOutsideClick !== false : options.closeOnMaskClick !== false;
    this._mask = resolveMask(options.hasMask, closeOutside);
    this._closeOnEscape = options.closeOnEscape !== false;
    this._lockScrollResolved = options.lockScroll === void 0 || options.lockScroll === "auto" ? this._mask.hasMask : options.lockScroll === true;
    this._isOpenState = options.isOpen ?? options.defaultOpen ?? false;
    this._isDisabled = !!options.isDisabled;
    this._isLoading = !!options.isLoading === true;
    this._container = resolveContainer(options.container);
    this._host = document.createElement("div");
    this._paneEl = document.createElement("div");
    this._paneEl.className = "arvo-drw__pane";
    this._host.appendChild(this._paneEl);
    this._applyClasses();
    this._applyStyleVars();
    const contentProps = {
      title: options.title ?? null,
      hasHeader: options.hasHeader,
      hasBackButton: options.hasBackButton,
      onBack: options.onBack,
      headerActions: options.headerActions,
      stickyHeader: options.stickyHeader,
      content: options.content,
      onSearchChange: options.onSearchChange,
      onTabSelect: options.onTabSelect,
      actions: options.actions,
      hasFooter: options.hasFooter,
      isClosable: options.isClosable !== false,
      onClose: () => {
        this._handleClose("close-button", { fromEngine: false });
      },
      isClosableCount: options.isClosable !== false ? 1 : 0
    };
    this.shell = createPanelShell({
      parentBlock: "arvo-drw",
      parent: this._paneEl,
      options: contentProps
    });
    this._applyAria();
    if (this._isLoading) {
      this.shell.loading(true);
      this._host.classList.add("loading");
    }
    if (this._isDisabled) {
      this.shell.disabled(true);
      this._host.classList.add("is-disabled");
    }
    this._wireShellEventReemit();
    this._container.appendChild(this._host);
    if (this._isOpenState) {
      this._createSurface();
      void this._surface.open().then(() => {
        if (this._isOpenState && !this._destroyed) {
          this._paneEl.dispatchEvent(
            new CustomEvent("drw:open", { bubbles: true })
          );
        }
      });
      if (this._closeOnEscape) this._setupEscapeListener();
      if (!this._mask.hasMask && this._mask.closeOnClick) {
        this._setupOutsideClickListener();
      }
    }
  }
  static initialize(element, options = {}) {
    return new ArvoDrawer(element, options);
  }
  // -------------------------------------------------------------------------
  // Public API -- lifecycle
  // -------------------------------------------------------------------------
  async open() {
    var _a, _b, _c, _d;
    if (this._destroyed) return;
    if (this._isOpenState) return;
    if (((_b = (_a = this._options).onOpen) == null ? void 0 : _b.call(_a)) === false) return;
    this._isOpenState = true;
    this._applyAria();
    if (!this._surface) this._createSurface();
    if (this._closeOnEscape) this._setupEscapeListener();
    if (!this._mask.hasMask && this._mask.closeOnClick) {
      this._setupOutsideClickListener();
    }
    await this._surface.open();
    if (this._isOpenState && !this._destroyed) {
      this._paneEl.dispatchEvent(
        new CustomEvent("drw:open", { bubbles: true })
      );
    }
    (_d = (_c = this._options).onOpenChange) == null ? void 0 : _d.call(_c, true);
  }
  close(reason = "programmatic") {
    this._handleClose(reason, { fromEngine: false });
  }
  toggle() {
    if (this._isOpenState) this.close("programmatic");
    else void this.open();
  }
  isOpen() {
    return this._isOpenState;
  }
  // -------------------------------------------------------------------------
  // Public API -- panel-shell delegates
  // -------------------------------------------------------------------------
  /** Replace the custom body content. */
  setContent(content) {
    this.shell.setContent(content);
  }
  /**
   * Update the sticky `__info` row in place (no sticky-region rebuild, so
   * search focus is preserved). Pass `false` to hide it. Use this to surface
   * a filtered-result message computed against your own custom content.
   */
  setInfo(config) {
    this.shell.setInfo(config);
  }
  setStickyHeader(config) {
    this.shell.setStickyHeader(config);
  }
  setHeaderActions(actions) {
    this.shell.setHeaderActions(actions);
  }
  setActions(actions) {
    this.shell.setActions(actions);
  }
  updateAction(id, patch) {
    this.shell.updateAction(id, patch);
  }
  search(query) {
    if (query === void 0) return this.shell.search() ?? "";
    this.shell.search(query);
  }
  selectedTab(id) {
    if (id === void 0) return this.shell.selectedTab() ?? null;
    this.shell.selectedTab(id);
  }
  setTitle(title) {
    this.shell.setTitle(title);
  }
  loading(state) {
    if (state === void 0) return this._isLoading;
    this._isLoading = state;
    this.shell.loading(state);
    this._host.classList.toggle("loading", state);
  }
  disabled(state) {
    if (state === void 0) return this._isDisabled;
    this._isDisabled = state;
    this.shell.disabled(state);
    this._host.classList.toggle("is-disabled", state);
  }
  focus(target) {
    this.shell.focus(target);
  }
  // -------------------------------------------------------------------------
  // Destroy
  // -------------------------------------------------------------------------
  destroy() {
    var _a;
    if (this._destroyed) return;
    this._destroyed = true;
    this._teardownEscapeListener();
    this._teardownOutsideClickListener();
    this._teardownShellEventReemit();
    (_a = this._surface) == null ? void 0 : _a.destroy();
    this._surface = null;
    this.shell.destroy();
    if (this._host.parentNode) {
      this._host.parentNode.removeChild(this._host);
    }
    if (this._options.className) {
      this._markerEl.classList.remove(this._options.className);
    }
  }
  // -------------------------------------------------------------------------
  // Private -- OverlaySurface engine
  // -------------------------------------------------------------------------
  _createSurface() {
    this._surface = createOverlaySurface({
      id: this._overlayId,
      surface: this._host,
      type: "side-panel",
      priority: 0,
      trigger: null,
      position: false,
      focus: {
        mode: "trap",
        initialFocus: "first",
        returnFocus: true,
        activateAfterTransition: true
      },
      mask: this._mask.hasMask ? {
        closeOnClick: this._mask.closeOnClick,
        onOutside: () => this._handleMaskOutside(),
        className: "arvo-drw__overlay-mask"
      } : void 0,
      managesOwnFocus: true,
      managesOwnBackdrop: true,
      lockScroll: this._lockScrollResolved,
      transition: "fade",
      transitionDuration: this._options.animationDuration ?? 200,
      closeOnOutside: false,
      triggerAria: false,
      onClose: () => this._handleEngineClose()
    });
  }
  // -------------------------------------------------------------------------
  // Private -- two-path close (notify-but-no-veto pattern)
  // -------------------------------------------------------------------------
  /**
   * Unified close handler.
   * - Programmatic path (`fromEngine: false`): user `onClose` can veto.
   * - Engine path (`fromEngine: true`): user `onClose` notified, veto ignored.
   */
  _handleClose(reason, opts) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (this._destroyed) return;
    if (!this._isOpenState) return;
    if (!opts.fromEngine) {
      if (((_b = (_a = this._options).onClose) == null ? void 0 : _b.call(_a, reason)) === false) return;
    } else {
      (_d = (_c = this._options).onClose) == null ? void 0 : _d.call(_c, reason);
    }
    this._isOpenState = false;
    this._paneEl.dispatchEvent(
      new CustomEvent("drw:close", {
        detail: { reason },
        bubbles: true,
        cancelable: !opts.fromEngine
      })
    );
    this._teardownEscapeListener();
    this._teardownOutsideClickListener();
    this._closingProgrammatically = true;
    void ((_e = this._surface) == null ? void 0 : _e.close());
    this._closingProgrammatically = false;
    this._applyAria();
    (_g = (_f = this._options).onOpenChange) == null ? void 0 : _g.call(_f, false);
  }
  /**
   * Engine's onClose callback. Safety-net path: shouldn't fire under normal
   * operation since the component owns Escape + outside-click via
   * `closeOnEscape: false` + `closeOnOutside: false`.
   */
  _handleEngineClose() {
    var _a, _b;
    if (this._closingProgrammatically) {
      return;
    }
    this._isOpenState = false;
    this._teardownEscapeListener();
    this._teardownOutsideClickListener();
    this._applyAria();
    (_b = (_a = this._options).onOpenChange) == null ? void 0 : _b.call(_a, false);
  }
  /** Mask `onOutside` callback -- dispatches `drw:mask-click` then closes. */
  _handleMaskOutside() {
    this._paneEl.dispatchEvent(
      new CustomEvent("drw:mask-click", { bubbles: true })
    );
    this._handleClose("mask-click", { fromEngine: true });
  }
  // -------------------------------------------------------------------------
  // Private -- DOM
  // -------------------------------------------------------------------------
  _applyClasses() {
    HOST_CLASSES.forEach((c) => this._host.classList.remove(c));
    this._host.classList.add("arvo-drw");
    this._host.classList.add(`arvo-drw--side-${this._side}`);
    if (this._mask.hasMask) {
      this._host.classList.add("arvo-drw--with-mask");
    }
    if (this._isLoading) this._host.classList.add("loading");
    if (this._isDisabled) this._host.classList.add("is-disabled");
    if (this._options.className) {
      this._host.classList.add(this._options.className);
    }
  }
  _applyStyleVars() {
    const w = toCssLength(this._options.width ?? 320);
    const minW = toCssLength(this._options.minWidth ?? 280);
    const maxW = toCssLength(this._options.maxWidth ?? "80vw");
    const h = toCssLength(this._options.height);
    if (w) this._host.style.setProperty("--arvo-drw-width", w);
    if (minW) this._host.style.setProperty("--arvo-drw-min-width", minW);
    if (maxW) this._host.style.setProperty("--arvo-drw-max-width", maxW);
    if (h) this._host.style.setProperty("--arvo-drw-height", h);
    if (this._options.animationDuration) {
      this._host.style.setProperty(
        "--arvo-drw-slide-duration",
        `${this._options.animationDuration}ms`
      );
    }
  }
  _applyAria() {
    this._paneEl.setAttribute("role", "dialog");
    this._paneEl.setAttribute(
      "aria-modal",
      this._mask.hasMask ? "true" : "false"
    );
    if (!this._isOpenState) {
      this._paneEl.setAttribute("aria-hidden", "true");
    } else {
      this._paneEl.removeAttribute("aria-hidden");
    }
    if (this._options.ariaLabel && !this._options.title) {
      this._paneEl.setAttribute("aria-label", this._options.ariaLabel);
    }
    if (this._options.ariaLabelledBy) {
      this._paneEl.setAttribute(
        "aria-labelledby",
        this._options.ariaLabelledBy
      );
    }
  }
  // -------------------------------------------------------------------------
  // Private -- component-owned Escape listener (capture-phase)
  // -------------------------------------------------------------------------
  _setupEscapeListener() {
    if (this._escapeListener) return;
    this._escapeListener = (e) => {
      if (e.key !== "Escape") return;
      if (!this._isOpenState) return;
      e.stopPropagation();
      this._handleClose("escape", { fromEngine: true });
    };
    document.addEventListener("keydown", this._escapeListener, true);
  }
  _teardownEscapeListener() {
    if (this._escapeListener) {
      document.removeEventListener("keydown", this._escapeListener, true);
      this._escapeListener = null;
    }
  }
  // -------------------------------------------------------------------------
  // Private -- component-owned outside-click listener (mask-less mode)
  // -------------------------------------------------------------------------
  _setupOutsideClickListener() {
    if (this._outsideClickListener) return;
    this._outsideClickListener = (e) => {
      if (!this._isOpenState) return;
      const target = e.target;
      if (!target) return;
      if (this._host.contains(target)) return;
      this._paneEl.dispatchEvent(
        new CustomEvent("drw:mask-click", { bubbles: true })
      );
      this._handleClose("mask-click", { fromEngine: true });
    };
    document.addEventListener("pointerdown", this._outsideClickListener, true);
  }
  _teardownOutsideClickListener() {
    if (this._outsideClickListener) {
      document.removeEventListener(
        "pointerdown",
        this._outsideClickListener,
        true
      );
      this._outsideClickListener = null;
    }
  }
  // -------------------------------------------------------------------------
  // Private -- shell event re-emit (prefix drw:*)
  // -------------------------------------------------------------------------
  _wireShellEventReemit() {
    const map = {
      back: "drw:back",
      action: "drw:action",
      "tab-select": "drw:tab-select",
      search: "drw:search"
    };
    for (const [src, dest] of Object.entries(map)) {
      const handler = (e) => {
        const ce = e;
        this._paneEl.dispatchEvent(
          new CustomEvent(dest, { bubbles: true, detail: ce.detail })
        );
      };
      this._paneEl.addEventListener(src, handler);
      this._shellEventBindings.push({ src, handler });
    }
  }
  _teardownShellEventReemit() {
    for (const { src, handler } of this._shellEventBindings) {
      this._paneEl.removeEventListener(src, handler);
    }
    this._shellEventBindings = [];
  }
}
export {
  ArvoDrawer
};
//# sourceMappingURL=Drawer.js.map
