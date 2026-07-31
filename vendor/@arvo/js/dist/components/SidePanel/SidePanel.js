import { warnDeprecated, createOverlaySurface } from "@arvo/core";
import { createPanelShell } from "../PanelShell/PanelShell.js";
import { ArvoIconButton } from "../IconButton/IconButton.js";
import { ArvoSplitter } from "../Splitter/Splitter.js";
const SIDE_PANEL_HOST_CLASSES = [
  "arvo-sp",
  "arvo-sp--layout",
  "arvo-sp--overlay",
  "arvo-sp--side-left",
  "arvo-sp--side-right",
  "arvo-sp--pinnable",
  "arvo-sp--closable",
  "arvo-sp--with-back",
  "arvo-sp--with-splitter-l",
  "arvo-sp--with-splitter-r",
  "is-pinned",
  "is-unpinned",
  "loading",
  "is-disabled"
];
function toCssLength(value) {
  if (value === null || value === void 0) return null;
  return typeof value === "number" ? `${value}px` : value;
}
let _sidePanelIdCounter = 0;
class ArvoSidePanel {
  constructor(element, options = {}) {
    this._overlayId = `arvo-sp-${++_sidePanelIdCounter}`;
    this._splitterEl = null;
    this._splitterInstance = null;
    this._resizedWidth = null;
    this._pinBtn = null;
    this._pinBtnEl = null;
    this._surface = null;
    this._closingProgrammatically = false;
    this._escapeListener = null;
    this._outsideListener = null;
    this._shellEventBindings = [];
    this._destroyed = false;
    warnDeprecated({
      component: "ArvoSidePanel",
      successor: "ArvoPanel",
      reason: "Use displayMode='overlay'|'docked' + placement='left'|'right'."
    });
    this._options = { ...options };
    this._host = element;
    this._host.classList.add("arvo-sp");
    this._isPinnedState = options.isPinned ?? options.defaultPinned ?? true;
    this._isOpenState = options.isOpen ?? options.defaultOpen ?? true;
    this._side = options.side ?? "right";
    this._variant = options.isPinnable ? this._isPinnedState ? "layout" : "overlay" : options.variant ?? "layout";
    this._isDisabled = !!options.isDisabled;
    this._isLoading = !!options.isLoading === true;
    this._splitterResolved = this._resolveSplitter();
    this._paneEl = document.createElement("div");
    this._paneEl.className = "arvo-sp__pane";
    if (this._splitterResolved && this._side === "right") {
      this._splitterEl = this._buildSplitter();
      this._host.appendChild(this._splitterEl);
    }
    this._host.appendChild(this._paneEl);
    if (this._splitterResolved && this._side === "left") {
      this._splitterEl = this._buildSplitter();
      this._host.appendChild(this._splitterEl);
    }
    this._applyWidthVars();
    this._applyClasses();
    this._applyAria();
    const contentProps = {
      title: options.title ?? null,
      hasHeader: options.hasHeader,
      hasBackButton: options.hasBackButton,
      onBack: options.onBack,
      headerActions: options.headerActions,
      stickyHeader: options.stickyHeader,
      content: options.content,
      actions: options.actions,
      hasFooter: options.hasFooter,
      isClosable: options.isClosable,
      onSearchChange: options.onSearchChange,
      onTabSelect: options.onTabSelect,
      onClose: () => {
        this._handleClose(false);
      },
      isPinnableCount: options.isPinnable ? 1 : 0,
      isClosableCount: options.isClosable ? 1 : 0
    };
    this.shell = createPanelShell({
      parentBlock: "arvo-sp",
      parent: this._paneEl,
      options: contentProps
    });
    if (options.isPinnable) {
      this._pinBtnEl = this._buildPinButtonEl();
      this._pinBtn = ArvoIconButton.initialize(this._pinBtnEl, {
        size: "sm",
        variant: "tertiary",
        icon: "push-pin",
        tooltip: this._isPinnedState ? "Unpin panel" : "Pin panel",
        isDisabled: this._isDisabled,
        isSelected: this._isPinnedState,
        onClick: () => this._handlePinClick()
      });
      this._pinBtnEl.classList.add("arvo-sp__pin");
      this.shell.setPinSlot(this._pinBtnEl);
    }
    if (this._isLoading) {
      this.shell.loading(true);
      this._host.classList.add("loading");
    }
    if (this._isDisabled) {
      this.shell.disabled(true);
      this._host.classList.add("is-disabled");
    }
    this._wireShellEventReemit();
    if (this._variant === "overlay") {
      this._setupOverlayListeners();
      if (this._isOpenState) {
        this._createSurface();
        void this._surface.open().then(() => {
          if (this._isOpenState && !this._destroyed) {
            this._paneEl.dispatchEvent(
              new CustomEvent("sp:open", { bubbles: true })
            );
          }
        });
      }
    }
  }
  static initialize(element, options = {}) {
    return new ArvoSidePanel(element, options);
  }
  // -------------------------------------------------------------------------
  // Public API -- overlay lifecycle
  // -------------------------------------------------------------------------
  async open() {
    var _a, _b, _c, _d;
    if (this._variant !== "overlay") return;
    if (this._isOpenState) return;
    if (((_b = (_a = this._options).onOpen) == null ? void 0 : _b.call(_a)) === false) return;
    this._isOpenState = true;
    if (!this._surface) this._createSurface();
    this._applyAria();
    await this._surface.open();
    if (this._isOpenState && !this._destroyed) {
      this._paneEl.dispatchEvent(
        new CustomEvent("sp:open", { bubbles: true })
      );
    }
    (_d = (_c = this._options).onOpenChange) == null ? void 0 : _d.call(_c, true);
  }
  close() {
    this._handleClose(false);
  }
  isOpen() {
    if (this._variant === "layout") return true;
    return this._isOpenState;
  }
  toggle() {
    if (this._variant !== "overlay") return;
    if (this._isOpenState) this.close();
    else void this.open();
  }
  pinned(value) {
    if (value === void 0) return this._isPinnedState;
    if (!this._options.isPinnable) return;
    this._setPinned(value);
  }
  setVariant(variant) {
    var _a;
    if (this._variant === variant) return;
    if (this._options.isPinnable) {
      this._setPinned(variant === "layout");
      return;
    }
    this._variant = variant;
    this._reflowSplitter();
    this._applyClasses();
    this._applyAria();
    if (variant === "overlay") {
      this._setupOverlayListeners();
      if (this._isOpenState) {
        if (!this._surface) this._createSurface();
        void this._surface.open();
      }
    } else {
      this._teardownOverlayListeners();
      (_a = this._surface) == null ? void 0 : _a.destroy();
      this._surface = null;
      this._host.classList.remove("open");
    }
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
  /**
   * Replace header actions. The shell's `renderHeaderActions` re-positions
   * the pin slot via `insertPinSlot` on every render, so the pin button
   * stays correctly placed (between user actions and __close) without
   * additional work here.
   */
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
    var _a, _b;
    if (state === void 0) return this._isDisabled;
    this._isDisabled = state;
    this.shell.disabled(state);
    this._host.classList.toggle("is-disabled", state);
    (_a = this._pinBtn) == null ? void 0 : _a.disabled(state);
    (_b = this._splitterInstance) == null ? void 0 : _b.disabled(state);
  }
  focus(target) {
    this.shell.focus(target);
  }
  // -------------------------------------------------------------------------
  // Destroy
  // -------------------------------------------------------------------------
  destroy() {
    var _a, _b, _c, _d;
    if (this._destroyed) return;
    this._destroyed = true;
    this._teardownOverlayListeners();
    this._teardownShellEventReemit();
    (_a = this._surface) == null ? void 0 : _a.destroy();
    this._surface = null;
    (_b = this._pinBtn) == null ? void 0 : _b.destroy();
    this._pinBtn = null;
    this._pinBtnEl = null;
    this.shell.destroy();
    (_c = this._splitterInstance) == null ? void 0 : _c.destroy();
    this._splitterInstance = null;
    (_d = this._splitterEl) == null ? void 0 : _d.remove();
    this._splitterEl = null;
    this._paneEl.remove();
    SIDE_PANEL_HOST_CLASSES.forEach((c) => this._host.classList.remove(c));
    if (this._options.className) {
      this._host.classList.remove(this._options.className);
    }
    this._host.style.removeProperty("--arvo-sp-width");
    this._host.style.removeProperty("--arvo-sp-min-width");
    this._host.style.removeProperty("--arvo-sp-max-width");
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
      transition: "fade",
      transitionDuration: 200,
      closeOnOutside: false,
      triggerAria: false,
      managesOwnFocus: true,
      managesOwnBackdrop: true,
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
   * - Layout variant: dispatches sp:close but does NOT close the surface
   *   (layout panels are always visible).
   */
  _handleClose(fromEngine) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (this._variant === "overlay" && !this._isOpenState) return;
    if (!fromEngine) {
      if (((_b = (_a = this._options).onClose) == null ? void 0 : _b.call(_a)) === false) return;
    } else {
      (_d = (_c = this._options).onClose) == null ? void 0 : _d.call(_c);
    }
    this._paneEl.dispatchEvent(
      new CustomEvent("sp:close", {
        detail: {},
        bubbles: true,
        cancelable: !fromEngine
      })
    );
    if (this._variant === "overlay") {
      this._isOpenState = false;
      this._closingProgrammatically = true;
      void ((_e = this._surface) == null ? void 0 : _e.close());
      this._closingProgrammatically = false;
      this._applyAria();
      (_g = (_f = this._options).onOpenChange) == null ? void 0 : _g.call(_f, false);
    }
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
    this._applyAria();
    (_b = (_a = this._options).onOpenChange) == null ? void 0 : _b.call(_a, false);
  }
  // -------------------------------------------------------------------------
  // Private -- DOM construction
  // -------------------------------------------------------------------------
  _buildPinButtonEl() {
    const el = document.createElement("button");
    el.type = "button";
    return el;
  }
  _resolveSplitter() {
    const opt = this._options.hasSplitter ?? false;
    if (opt === "auto") return this._variant === "layout";
    return opt === true;
  }
  /**
   * Re-resolves whether the splitter should be present and adds/removes the
   * `__splitter` element + side modifier class accordingly. Called whenever
   * the variant flips (pin/unpin or imperative `setVariant`) so `hasSplitter:'auto'`
   * stays in sync with the active variant.
   */
  _reflowSplitter() {
    var _a;
    const wantSplitter = this._resolveSplitter();
    if (wantSplitter === this._splitterResolved) return;
    this._splitterResolved = wantSplitter;
    if (wantSplitter) {
      if (!this._splitterEl) this._splitterEl = this._buildSplitter();
      if (this._side === "right") {
        this._host.insertBefore(this._splitterEl, this._paneEl);
      } else {
        if (this._paneEl.nextSibling) {
          this._host.insertBefore(this._splitterEl, this._paneEl.nextSibling);
        } else {
          this._host.appendChild(this._splitterEl);
        }
      }
    } else if (this._splitterEl) {
      (_a = this._splitterInstance) == null ? void 0 : _a.destroy();
      this._splitterInstance = null;
      this._splitterEl.remove();
      this._splitterEl = null;
    }
  }
  _buildSplitter() {
    const el = document.createElement("div");
    el.className = "arvo-sp__splitter";
    const numericMin = this._toNumericPx(this._options.minWidth, 100);
    const numericMax = this._toNumericPx(this._options.maxWidth, 2e3);
    const numericValue = this._resizedWidth ?? this._toNumericPx(this._options.width, numericMin);
    const clampedValue = Math.min(
      Math.max(numericValue, numericMin),
      numericMax
    );
    this._splitterInstance = ArvoSplitter.initialize(el, {
      orientation: "vertical",
      inverse: this._side === "right",
      minSize: numericMin,
      maxSize: numericMax,
      value: clampedValue,
      ariaLabel: "Resize side panel",
      isDisabled: this._isDisabled,
      onResize: ({ value }) => {
        this._resizedWidth = value;
        this._applyWidthVars();
      }
    });
    return el;
  }
  _toNumericPx(raw, fallback) {
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string") {
      const parsed = parseFloat(raw);
      if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
  }
  // -------------------------------------------------------------------------
  // Private -- class / aria / width application
  // -------------------------------------------------------------------------
  _applyClasses() {
    SIDE_PANEL_HOST_CLASSES.forEach((c) => {
      if (c === "open" || c === "loading" || c === "is-disabled") return;
      this._host.classList.remove(c);
    });
    this._host.classList.add("arvo-sp");
    this._host.classList.add(`arvo-sp--${this._variant}`);
    this._host.classList.add(`arvo-sp--side-${this._side}`);
    if (this._options.isPinnable) {
      this._host.classList.add("arvo-sp--pinnable");
      this._host.classList.add(this._isPinnedState ? "is-pinned" : "is-unpinned");
    }
    if (this._options.isClosable) this._host.classList.add("arvo-sp--closable");
    if (this._options.hasBackButton) this._host.classList.add("arvo-sp--with-back");
    if (this._splitterResolved) {
      this._host.classList.add(
        this._side === "right" ? "arvo-sp--with-splitter-l" : "arvo-sp--with-splitter-r"
      );
    }
    if (this._options.className) {
      this._host.classList.add(this._options.className);
    }
  }
  _applyAria() {
    if (this._variant === "overlay") {
      this._paneEl.setAttribute("role", "dialog");
      this._paneEl.setAttribute("aria-modal", "false");
      if (!this._isOpenState) {
        this._paneEl.setAttribute("aria-hidden", "true");
      } else {
        this._paneEl.removeAttribute("aria-hidden");
      }
    } else {
      this._paneEl.setAttribute("role", "region");
      this._paneEl.removeAttribute("aria-modal");
      this._paneEl.removeAttribute("aria-hidden");
    }
    if (this._options.ariaLabel) {
      this._paneEl.setAttribute("aria-label", this._options.ariaLabel);
    } else if (this._options.title) {
      this._paneEl.setAttribute("aria-label", this._options.title);
    }
  }
  _applyWidthVars() {
    const w = this._resizedWidth !== null ? `${this._resizedWidth}px` : toCssLength(this._options.width ?? 290);
    const minW = toCssLength(this._options.minWidth ?? 320);
    const maxW = toCssLength(this._options.maxWidth ?? null);
    if (w) this._host.style.setProperty("--arvo-sp-width", w);
    if (minW) this._host.style.setProperty("--arvo-sp-min-width", minW);
    if (maxW) this._host.style.setProperty("--arvo-sp-max-width", maxW);
  }
  // -------------------------------------------------------------------------
  // Private -- pin lifecycle
  // -------------------------------------------------------------------------
  _handlePinClick() {
    var _a;
    if (this._isDisabled || !this._options.isPinnable) return;
    this._setPinned(!this._isPinnedState);
    (_a = this._pinBtnEl) == null ? void 0 : _a.focus({ preventScroll: true });
  }
  _setPinned(next) {
    var _a, _b, _c, _d, _e;
    if (this._isPinnedState === next) return;
    this._isPinnedState = next;
    this._variant = next ? "layout" : "overlay";
    this._reflowSplitter();
    this._applyClasses();
    this._applyAria();
    (_a = this._pinBtn) == null ? void 0 : _a.selected(next);
    (_b = this._pinBtn) == null ? void 0 : _b.setTooltip(next ? "Unpin panel" : "Pin panel");
    if (this._variant === "overlay") {
      this._setupOverlayListeners();
      this._isOpenState = true;
      if (!this._surface) this._createSurface();
      void this._surface.open();
    } else {
      this._teardownOverlayListeners();
      (_c = this._surface) == null ? void 0 : _c.destroy();
      this._surface = null;
      this._host.classList.remove("open");
    }
    (_e = (_d = this._options).onPinChange) == null ? void 0 : _e.call(_d, next);
    this._paneEl.dispatchEvent(
      new CustomEvent("sp:pin", {
        bubbles: true,
        detail: { pinned: next }
      })
    );
  }
  // -------------------------------------------------------------------------
  // Private -- component-owned overlay listeners
  // -------------------------------------------------------------------------
  _setupOverlayListeners() {
    if (this._escapeListener || this._outsideListener) return;
    if (this._options.closeOnEscape !== false) {
      this._escapeListener = (e) => {
        if (e.key !== "Escape") return;
        if (!this._isOpenState) return;
        if (this._variant !== "overlay") return;
        e.stopPropagation();
        this._handleClose(true);
      };
      document.addEventListener("keydown", this._escapeListener, true);
    }
    if (this._options.closeOnOutside) {
      this._outsideListener = (e) => {
        if (!this._isOpenState) return;
        if (this._variant !== "overlay") return;
        const target = e.target;
        if (!target) return;
        if (this._host.contains(target)) return;
        this._handleClose(true);
      };
      document.addEventListener("mousedown", this._outsideListener, true);
    }
  }
  _teardownOverlayListeners() {
    if (this._escapeListener) {
      document.removeEventListener("keydown", this._escapeListener, true);
      this._escapeListener = null;
    }
    if (this._outsideListener) {
      document.removeEventListener("mousedown", this._outsideListener, true);
      this._outsideListener = null;
    }
  }
  // -------------------------------------------------------------------------
  // Private -- shell event re-emit (prefix sp:*)
  // -------------------------------------------------------------------------
  _wireShellEventReemit() {
    const map = {
      back: "sp:back",
      action: "sp:action",
      "tab-select": "sp:tab-select",
      search: "sp:search"
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
  ArvoSidePanel
};
//# sourceMappingURL=SidePanel.js.map
