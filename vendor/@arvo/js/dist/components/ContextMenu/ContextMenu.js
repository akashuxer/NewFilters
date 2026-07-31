import { createContextMenuController, createOverlaySurface } from "@arvo/core";
import { ArvoEmptyState } from "../EmptyState/EmptyState.js";
import { createMenuContent } from "../../internal/menu/menu-content.js";
let _idCounter = 0;
function nextId() {
  _idCounter += 1;
  return `arvo-context-menu-${_idCounter}`;
}
class ArvoContextMenu {
  constructor(target, options) {
    this._controller = null;
    this._surface = null;
    this._menuContent = null;
    this._emptyStateInstance = null;
    this._scrollEl = null;
    this._panelEl = null;
    this._activeRequest = null;
    this._resolvedItems = null;
    this._closeSource = null;
    this._reanchorSuppressor = null;
    if (!target) throw new Error("ArvoContextMenu: target element is required");
    if (options == null || options.items == null) {
      throw new Error("ArvoContextMenu: `items` option is required");
    }
    this._target = target;
    this._options = options;
    this._panelId = nextId();
    this._disabledLocal = options.isDisabled === true;
    this._bindController();
  }
  static initialize(element, options) {
    return new ArvoContextMenu(element, options);
  }
  // -- Public API --------------------------------------------------------
  open(init) {
    if (this._disabledLocal) return;
    const request = this._normalizeRequest(init);
    this._openWithRequest(request);
  }
  close() {
    var _a, _b;
    if (!this._surface || !this._surface.isOpen()) return;
    this._closeSource = "programmatic";
    if (((_b = (_a = this._options).onClose) == null ? void 0 : _b.call(_a)) === false) {
      this._closeSource = null;
      return;
    }
    if (!this._dispatch("context-menu:close", {}, true)) {
      this._closeSource = null;
      return;
    }
    void this._surface.close();
  }
  isOpen() {
    var _a;
    return !!((_a = this._surface) == null ? void 0 : _a.isOpen());
  }
  updateItems(items) {
    var _a;
    this._options = { ...this._options, items };
    if (this.isOpen() && this._activeRequest) {
      const resolved = this._resolveItems(this._activeRequest.context);
      this._resolvedItems = resolved;
      const isEmpty = Array.isArray(resolved) && resolved.length === 0;
      const wasEmpty = !this._menuContent;
      if (isEmpty !== wasEmpty || isEmpty) {
        this._openSurface(this._activeRequest, resolved);
      } else {
        (_a = this._menuContent) == null ? void 0 : _a.update({
          items: resolved,
          context: this._activeRequest.context
        });
      }
    }
  }
  disabled(state) {
    var _a, _b;
    if (state === void 0) return this._disabledLocal;
    this._disabledLocal = state;
    if (state) {
      (_a = this._controller) == null ? void 0 : _a.destroy();
      this._controller = null;
      this._unbindReanchorSuppressor();
      if (this.isOpen()) void ((_b = this._surface) == null ? void 0 : _b.close());
    } else if (!this._controller) {
      this._bindController();
    }
    return state;
  }
  destroy() {
    var _a, _b, _c, _d;
    (_a = this._controller) == null ? void 0 : _a.destroy();
    this._controller = null;
    this._unbindReanchorSuppressor();
    if ((_b = this._surface) == null ? void 0 : _b.isOpen()) {
      void this._surface.close();
    }
    (_c = this._surface) == null ? void 0 : _c.destroy();
    this._surface = null;
    this._destroyPanelContents();
    if ((_d = this._panelEl) == null ? void 0 : _d.parentNode) {
      this._panelEl.parentNode.removeChild(this._panelEl);
    }
    this._panelEl = null;
  }
  // -- Private internals -------------------------------------------------
  _bindController() {
    this._controller = createContextMenuController({
      target: this._target,
      contextSelector: this._options.contextSelector,
      resolveContext: this._options.resolveContext,
      longPressMs: this._options.longPressMs,
      keyboard: this._options.keyboard,
      onRequest: (request, helpers) => {
        var _a, _b, _c, _d;
        if (((_b = (_a = this._options).onContextRequest) == null ? void 0 : _b.call(_a, request)) === false) return false;
        if (!this._dispatch("context-menu:request", { request }, true)) return false;
        const items = this._resolveItems(request.context);
        if (Array.isArray(items) && items.length === 0 && !this._options.emptyConfig) {
          return false;
        }
        if (((_d = (_c = this._options).onOpen) == null ? void 0 : _d.call(_c, request)) === false) return false;
        if (!this._dispatch("context-menu:open", { request }, true)) return false;
        helpers.preventDefault();
        this._openSurface(request, items);
        return true;
      }
    });
  }
  _resolveItems(context) {
    const it = this._options.items;
    return typeof it === "function" ? it(context) : it;
  }
  _normalizeRequest(init) {
    if (init && "modality" in init && "context" in init && "originalEvent" in init) {
      return init;
    }
    const invoker = (init == null ? void 0 : init.invoker) ?? this._target;
    const anchor = (init == null ? void 0 : init.anchor) ?? { kind: "element", element: invoker };
    const context = (init == null ? void 0 : init.context) ?? (this._options.resolveContext ? this._options.resolveContext(invoker) : null);
    return {
      invoker,
      anchor,
      context,
      modality: (init == null ? void 0 : init.modality) ?? "pointer",
      originalEvent: (init == null ? void 0 : init.originalEvent) ?? new MouseEvent("contextmenu")
    };
  }
  _openWithRequest(request) {
    var _a, _b, _c, _d;
    if (((_b = (_a = this._options).onContextRequest) == null ? void 0 : _b.call(_a, request)) === false) return;
    if (!this._dispatch("context-menu:request", { request }, true)) return;
    const items = this._resolveItems(request.context);
    if (Array.isArray(items) && items.length === 0 && !this._options.emptyConfig) {
      return;
    }
    if (((_d = (_c = this._options).onOpen) == null ? void 0 : _d.call(_c, request)) === false) return;
    if (!this._dispatch("context-menu:open", { request }, true)) return;
    this._openSurface(request, items);
  }
  _openSurface(request, items) {
    var _a, _b, _c, _d;
    const reanchor = ((_a = this._surface) == null ? void 0 : _a.isOpen()) ?? false;
    this._activeRequest = request;
    this._resolvedItems = items;
    this._ensurePanel();
    if (!this._panelEl) return;
    const onSelectHandler = (info) => {
      var _a2, _b2, _c2;
      this._dispatch(
        "context-menu:select",
        { item: info.item, index: info.index, context: info.context },
        true
      );
      (_b2 = (_a2 = this._options).onSelect) == null ? void 0 : _b2.call(_a2, info);
      if (info.closeOnSelect && (this._options.closeOnSelect ?? true)) {
        this._closeSource = null;
        void ((_c2 = this._surface) == null ? void 0 : _c2.close());
      }
    };
    this._destroyPanelContents();
    const itemsEmpty = Array.isArray(items) && items.length === 0;
    if (itemsEmpty && this._options.emptyConfig) {
      this._renderEmptyState();
    } else {
      this._menuContent = createMenuContent({
        items,
        context: request.context,
        surfaceId: this._panelId,
        parentSurfaceId: this._panelId,
        submenuHoverDelayMs: 200,
        hasGroupDividers: true,
        createSubmenuController: (args) => this._buildSubmenuController(args),
        onSelect: onSelectHandler,
        onRequestClose: () => {
          this.close();
        }
      });
      this._panelEl.appendChild(this._menuContent.element);
      this._scrollEl = this._menuContent.element;
    }
    if (!this._surface) {
      this._surface = createOverlaySurface({
        id: this._panelId,
        surface: this._panelEl,
        type: "action-menu",
        priority: 15,
        trigger: request.anchor.kind === "element" ? request.anchor.element : null,
        anchorRect: request.anchor.kind === "point" ? { x: request.anchor.x, y: request.anchor.y } : null,
        position: {
          placement: this._options.placement ?? "bottom-start",
          gap: 0
        },
        focus: {
          mode: "trap",
          initialFocus: "first"
        },
        transition: "fade",
        closeOnOutside: this._options.closeOnOutside ?? true,
        triggerAria: false,
        onClose: () => this._handleSurfaceClosed()
      });
    } else {
      this._surface.setTrigger(
        request.anchor.kind === "element" ? request.anchor.element : null
      );
      this._surface.setAnchorRect(
        request.anchor.kind === "point" ? { x: request.anchor.x, y: request.anchor.y } : null
      );
    }
    if (reanchor) {
      this._surface.reposition();
      (_b = this._menuContent) == null ? void 0 : _b.focus();
      return;
    }
    this._bindReanchorSuppressor();
    void this._surface.open().then(() => {
      var _a2;
      (_a2 = this._menuContent) == null ? void 0 : _a2.focus();
    });
    (_d = (_c = this._options).onOpenChange) == null ? void 0 : _d.call(_c, true);
  }
  _destroyPanelContents() {
    if (this._menuContent) {
      this._menuContent.destroy();
      this._menuContent = null;
    }
    this._emptyStateInstance = null;
    if (this._panelEl) {
      while (this._panelEl.firstChild) {
        this._panelEl.removeChild(this._panelEl.firstChild);
      }
    }
    this._scrollEl = null;
  }
  _renderEmptyState() {
    if (!this._panelEl) return;
    const cfg = this._options.emptyConfig ?? {};
    const scroll = document.createElement("div");
    scroll.className = "arvo-context-menu__scroll";
    const wrapper = document.createElement("div");
    wrapper.className = "arvo-context-menu__empty";
    const emptyOpts = {
      size: "sm",
      orientation: "vertical",
      illustration: cfg.illustration ?? "no-data",
      title: cfg.title ?? "No options available",
      message: cfg.message ?? "There are no actions to display for this item.",
      secondaryAction: cfg.secondaryAction
    };
    this._emptyStateInstance = ArvoEmptyState.create(emptyOpts);
    wrapper.appendChild(this._emptyStateInstance.el);
    scroll.appendChild(wrapper);
    this._panelEl.appendChild(scroll);
    this._scrollEl = scroll;
  }
  // Window-capture pointerdown + mousedown listener that swallows
  // right-clicks INSIDE the controller's target while the menu is open.
  //
  // Without this suppressor, the browser dispatches pointerdown ->
  // mousedown -> contextmenu in sequence on a right-click. The overlay
  // hub's outside-click handler (document, mousedown) removes the menu
  // entry; the engine's exit transition begins; the subsequent
  // contextmenu opens a new state but the in-flight exit transition
  // unmounts the panel anyway. The user sees the menu close with no
  // replacement appearing.
  //
  // Window-capture fires BEFORE document-capture and document-bubble
  // listeners (capture flows window -> document -> ... -> target). Calling
  // stopPropagation here prevents both the hub's mousedown handler and
  // useOverlaySurface's pointerdown handler from firing for this gesture.
  // The subsequent contextmenu event re-anchors the existing surface in
  // place via setTrigger / setAnchorRect, with no close/reopen cycle.
  _bindReanchorSuppressor() {
    if (this._reanchorSuppressor) return;
    this._reanchorSuppressor = (e) => {
      var _a;
      if (e.button !== 2) return;
      const t = e.target;
      if (!t || !this._target.contains(t)) return;
      if (!((_a = this._surface) == null ? void 0 : _a.isOpen())) return;
      e.stopPropagation();
    };
    window.addEventListener("pointerdown", this._reanchorSuppressor, true);
    window.addEventListener("mousedown", this._reanchorSuppressor, true);
  }
  _unbindReanchorSuppressor() {
    if (!this._reanchorSuppressor) return;
    window.removeEventListener("pointerdown", this._reanchorSuppressor, true);
    window.removeEventListener("mousedown", this._reanchorSuppressor, true);
    this._reanchorSuppressor = null;
  }
  _ensurePanel() {
    if (this._panelEl) return;
    const panel = document.createElement("div");
    panel.id = this._panelId;
    panel.className = "arvo-context-menu";
    panel.setAttribute("role", "menu");
    if (this._options.ariaLabelledBy) {
      panel.setAttribute("aria-labelledby", this._options.ariaLabelledBy);
    } else {
      panel.setAttribute("aria-label", this._options.ariaLabel ?? "Context menu");
    }
    document.body.appendChild(panel);
    this._panelEl = panel;
  }
  _handleSurfaceClosed() {
    var _a, _b, _c;
    const wasProgrammatic = this._closeSource === "programmatic";
    this._closeSource = null;
    this._unbindReanchorSuppressor();
    const targetEl = ((_a = this._activeRequest) == null ? void 0 : _a.invoker) ?? null;
    this._activeRequest = null;
    this._destroyPanelContents();
    (_c = (_b = this._options).onOpenChange) == null ? void 0 : _c.call(_b, false);
    if (!wasProgrammatic && targetEl) {
      try {
        targetEl.focus({ preventScroll: true });
      } catch {
      }
    }
  }
  _buildSubmenuController(args) {
    const submenuPanel = document.createElement("div");
    submenuPanel.className = "arvo-context-menu";
    submenuPanel.setAttribute("role", "menu");
    const parentLabel = "label" in args.parentItem ? args.parentItem.label : "Submenu";
    submenuPanel.setAttribute("aria-label", parentLabel ?? "Submenu");
    const scroll = document.createElement("div");
    scroll.className = "arvo-context-menu__scroll";
    submenuPanel.appendChild(scroll);
    document.body.appendChild(submenuPanel);
    const submenuId = `${args.parentSurfaceId}-sub-${args.parentItem.id}`;
    let submenuContent = null;
    let surface = null;
    const openSurface = () => {
      submenuContent = createMenuContent({
        items: args.parentItem.submenu,
        context: args.context,
        surfaceId: submenuId,
        parentSurfaceId: submenuId,
        submenuHoverDelayMs: 200,
        hasGroupDividers: true,
        createSubmenuController: (next) => this._buildSubmenuController(next),
        onSelect: (info) => args.onSelect(info),
        onRequestClose: () => args.onClose()
      });
      scroll.appendChild(submenuContent.element);
      surface = createOverlaySurface({
        id: submenuId,
        surface: submenuPanel,
        type: "action-menu",
        priority: 15,
        parentId: args.parentSurfaceId,
        relation: "submenu",
        trigger: args.parentRowEl,
        position: { placement: "right-start", gap: 0 },
        focus: { mode: "trap", initialFocus: "first" },
        transition: "fade",
        triggerAria: false,
        onClose: () => {
          if (submenuContent) {
            submenuContent.destroy();
            submenuContent = null;
          }
          while (scroll.firstChild) scroll.removeChild(scroll.firstChild);
          args.onClose();
        }
      });
      void surface.open().then(() => submenuContent == null ? void 0 : submenuContent.focus());
    };
    return {
      panelEl: submenuPanel,
      open: () => {
        if (surface == null ? void 0 : surface.isOpen()) return;
        openSurface();
      },
      close: () => {
        if (surface == null ? void 0 : surface.isOpen()) void surface.close();
      },
      destroy: () => {
        submenuContent == null ? void 0 : submenuContent.destroy();
        submenuContent = null;
        surface == null ? void 0 : surface.destroy();
        surface = null;
        if (submenuPanel.parentNode) {
          submenuPanel.parentNode.removeChild(submenuPanel);
        }
      },
      isOpen: () => !!(surface == null ? void 0 : surface.isOpen())
    };
  }
  _dispatch(name, detail, cancelable) {
    const evt = new CustomEvent(name, { bubbles: true, cancelable, detail });
    return this._target.dispatchEvent(evt);
  }
}
export {
  ArvoContextMenu
};
//# sourceMappingURL=ContextMenu.js.map
