import { createOverlaySurface, createResizeHandle } from "@arvo/core";
import { clampFooterActions, attachOverlayFooterFit } from "@arvo/utils";
import { ArvoButton } from "../Button/Button.js";
import { ArvoIconButton } from "../IconButton/IconButton.js";
import { ArvoDropdownIconButton } from "../DropdownIconButton/DropdownIconButton.js";
import { ArvoSwitch } from "../Switch/Switch.js";
import { ArvoEmptyState } from "../EmptyState/EmptyState.js";
import { ArvoStatus } from "../Status/Status.js";
import { ArvoBadge } from "../Badge/Badge.js";
const ALERT_ICON_GLYPH = {
  positive: "status-success-filled",
  warning: "exclamation-triangle-filled",
  negative: "status-error-filled",
  block: "prohibit",
  info: "info-circle-filled"
};
let _idCounter = 0;
function mapPlacement(p) {
  switch (p) {
    case "top":
      return "top-start";
    case "bottom":
      return "bottom-start";
    case "left":
      return "left-start";
    case "right":
      return "right-start";
    default:
      return p;
  }
}
function renderContent(container, content) {
  container.textContent = "";
  if (typeof content === "string") {
    container.innerHTML = content;
  } else if (typeof content === "function") {
    content(container);
  } else if (content instanceof Node) {
    container.appendChild(content);
  }
}
const _ArvoPopover = class _ArvoPopover {
  constructor(element, options) {
    this._panelEl = null;
    this._arrowEl = null;
    this._headerEl = null;
    this._bodyEl = null;
    this._footerEl = null;
    this._titleEl = null;
    this._stickyHeaderEl = null;
    this._closeBtnInstance = null;
    this._backBtnInstance = null;
    this._headerActionInstances = [];
    this._statusInstance = null;
    this._badgeInstance = null;
    this._emptyStateInstance = null;
    this._footerBtnInstances = [];
    this._footerLeftEl = null;
    this._footerActionsEl = null;
    this._footerFit = null;
    this._resizeHostEl = null;
    this._resizeHandle = null;
    this._footerVisible = true;
    this._surface = null;
    this._isOpen = false;
    this._closingProgrammatically = false;
    this._hoverOpenTimer = null;
    this._hoverCloseTimer = null;
    this._element = element;
    this._panelId = `arvo-popover-${++_idCounter}`;
    this._options = {
      ..._ArvoPopover.DEFAULTS,
      ...options,
      headerActions: (options == null ? void 0 : options.headerActions) ?? [],
      actions: (options == null ? void 0 : options.actions) ?? [],
      stickyHeader: (options == null ? void 0 : options.stickyBody) ?? (options == null ? void 0 : options.stickyHeader) ?? null,
      content: (options == null ? void 0 : options.content) ?? null,
      emptyContent: (options == null ? void 0 : options.emptyContent) ?? null,
      footerLeftSlot: (options == null ? void 0 : options.footerLeftSlot) ?? null,
      width: (options == null ? void 0 : options.width) ?? null,
      icon: (options == null ? void 0 : options.icon) ?? null,
      badge: (options == null ? void 0 : options.badge) ?? null,
      onOpen: (options == null ? void 0 : options.onOpen) ?? null,
      onClose: (options == null ? void 0 : options.onClose) ?? null,
      onBack: (options == null ? void 0 : options.onBack) ?? null,
      onResize: (options == null ? void 0 : options.onResize) ?? null,
      onResizeCommit: (options == null ? void 0 : options.onResizeCommit) ?? null
    };
    this._boundHandleTriggerClick = this._handleTriggerClick.bind(this);
    this._boundHandleTriggerPointerEnter = this._handleTriggerPointerEnter.bind(this);
    this._boundHandleTriggerPointerLeave = this._handleTriggerPointerLeave.bind(this);
    this._boundHandleTriggerFocus = this._handleTriggerFocus.bind(this);
    this._boundHandleTriggerBlur = this._handleTriggerBlur.bind(this);
    this._boundHandlePanelPointerEnter = this._handlePanelPointerEnter.bind(this);
    this._boundHandlePanelPointerLeave = this._handlePanelPointerLeave.bind(this);
    this._render();
    this._bindEvents();
    this._surface = createOverlaySurface({
      id: this._panelId,
      surface: this._panelEl,
      type: "popover",
      priority: 10,
      trigger: element,
      position: this._options.isInline ? false : {
        placement: mapPlacement(this._options.placement),
        gap: this._options.offset,
        width: this._options.width === "anchor" ? "anchor" : void 0,
        apply: (result, surface) => {
          this._applyPosition(result, surface);
        }
      },
      focus: { mode: this._options.isInteractive ? "trap" : "none" },
      transition: "fade",
      transitionDuration: 150,
      closeOnOutside: this._options.closeOnOutside,
      triggerAria: { haspopup: "dialog", controls: this._panelId },
      onClose: () => this._handleEngineClose()
    });
    if (this._options.isResizable && !this._options.isInline && this._panelEl && this._resizeHostEl) {
      this._mountResizeHandle();
    }
  }
  static initialize(element, options) {
    return new _ArvoPopover(element, options);
  }
  // ---------------------------------------------------------------------------
  // Resize handle (isResizable=true). Same affordance as HybridPopover --
  // single bottom-right corner grip rendered into __resize. Width/height
  // bounds match $arvo-popover-wmin / wmax / hmax (270 / 700 / 700) clamped
  // by remaining viewport space. The shared `resize-handle` SCSS mixin
  // styles the chrome; createResizeHandle from @arvo/core writes
  // `arvo-popover__handle` class via the `block` option.
  // ---------------------------------------------------------------------------
  _mountResizeHandle() {
    if (!this._panelEl || !this._resizeHostEl) return;
    const POPOVER_MIN_WIDTH = 270;
    const POPOVER_MAX_WIDTH = 700;
    const POPOVER_MIN_HEIGHT = 80;
    const POPOVER_MAX_HEIGHT = 700;
    const VIEWPORT_PADDING = 16;
    const panel = this._panelEl;
    const host = this._resizeHostEl;
    this._resizeHandle = createResizeHandle(panel, {
      corners: ["bottom-right"],
      min: { width: POPOVER_MIN_WIDTH, height: POPOVER_MIN_HEIGHT },
      max: (rect) => ({
        width: Math.max(
          POPOVER_MIN_WIDTH,
          Math.min(
            POPOVER_MAX_WIDTH,
            window.innerWidth - rect.left - VIEWPORT_PADDING
          )
        ),
        height: Math.max(
          POPOVER_MIN_HEIGHT,
          Math.min(
            POPOVER_MAX_HEIGHT,
            window.innerHeight - rect.top - VIEWPORT_PADDING
          )
        )
      }),
      viewportPadding: VIEWPORT_PADDING,
      block: "arvo-popover",
      host,
      onResize: (rect) => {
        var _a, _b;
        (_b = (_a = this._options).onResize) == null ? void 0 : _b.call(_a, rect);
      },
      onCommit: (rect) => {
        var _a, _b;
        (_b = (_a = this._options).onResizeCommit) == null ? void 0 : _b.call(_a, rect);
      }
    });
    this._resizeHandle.mount();
  }
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  _render() {
    this._panelEl = document.createElement("div");
    this._panelEl.id = this._panelId;
    this._panelEl.className = this._buildPanelClasses();
    this._panelEl.setAttribute(
      "role",
      this._options.isInteractive ? "dialog" : "tooltip"
    );
    if (this._options.isLoading) {
      this._panelEl.setAttribute("aria-busy", "true");
    }
    if (this._options.isInteractive) {
      this._panelEl.tabIndex = -1;
    }
    const titleId = `${this._panelId}-title`;
    if (this._options.title) {
      this._panelEl.setAttribute("aria-labelledby", titleId);
    }
    if (this._options.hasArrow) {
      this._arrowEl = document.createElement("div");
      this._arrowEl.className = "arvo-popover__arrow";
      this._arrowEl.setAttribute("aria-hidden", "true");
      this._panelEl.appendChild(this._arrowEl);
    }
    if (this._options.hasHeader && this._shouldRenderHeader()) {
      this._renderHeader(titleId);
    }
    if (this._options.stickyHeader) {
      this._stickyHeaderEl = document.createElement("div");
      this._stickyHeaderEl.className = "arvo-popover__sticky-header";
      renderContent(this._stickyHeaderEl, this._options.stickyHeader);
      this._panelEl.appendChild(this._stickyHeaderEl);
    }
    this._bodyEl = document.createElement("div");
    this._bodyEl.className = "arvo-popover__body";
    this._renderBodyContent();
    this._panelEl.appendChild(this._bodyEl);
    if (this._shouldShowFooter()) {
      this._renderFooter();
    }
    if (this._options.isResizable && !this._options.isInline) {
      this._resizeHostEl = document.createElement("div");
      this._resizeHostEl.className = "arvo-popover__resize";
      this._resizeHostEl.setAttribute("aria-hidden", "true");
      this._panelEl.appendChild(this._resizeHostEl);
    }
    this._panelEl.addEventListener("pointerenter", this._boundHandlePanelPointerEnter);
    this._panelEl.addEventListener("pointerleave", this._boundHandlePanelPointerLeave);
    if (this._options.isInline && this._element) {
      this._element.appendChild(this._panelEl);
    } else {
      document.body.appendChild(this._panelEl);
    }
  }
  _shouldRenderHeader() {
    const o = this._options;
    return o.isClosable || !!o.title || o.hasBackButton || o.hasIcon || o.hasAlert || o.hasStatusIndicator || o.badge != null || o.headerActions.length > 0;
  }
  _renderHeader(titleId) {
    if (!this._panelEl) return;
    this._headerEl = document.createElement("div");
    this._headerEl.className = "arvo-popover__header";
    const headerLeft = document.createElement("div");
    headerLeft.className = "arvo-popover__header-left";
    if (this._options.hasBackButton) {
      const backBtnWrap = document.createElement("span");
      backBtnWrap.className = "arvo-popover__back-btn";
      const backBtnEl = document.createElement("button");
      backBtnWrap.appendChild(backBtnEl);
      this._backBtnInstance = ArvoIconButton.initialize(backBtnEl, {
        variant: "secondary",
        size: "sm",
        icon: "arrow-left",
        tooltip: "Back",
        isDisabled: this._options.isLoading,
        onClick: () => {
          var _a, _b;
          return (_b = (_a = this._options).onBack) == null ? void 0 : _b.call(_a);
        }
      });
      backBtnEl.setAttribute("aria-label", "Back");
      headerLeft.appendChild(backBtnWrap);
    }
    if (this._options.hasAlert) {
      const alertGlyph = ALERT_ICON_GLYPH[this._options.alertType];
      const alertEl = document.createElement("i");
      alertEl.className = `arvo-popover__alert-ico arvo-popover__alert-ico--${this._options.alertType} o9con o9con-${alertGlyph}`;
      alertEl.setAttribute("aria-hidden", "true");
      headerLeft.appendChild(alertEl);
    }
    if (this._options.hasIcon && this._options.icon) {
      const leadEl = document.createElement("i");
      leadEl.className = `arvo-popover__lead-ico o9con o9con-${this._options.icon}`;
      leadEl.setAttribute("aria-hidden", "true");
      headerLeft.appendChild(leadEl);
    }
    if (this._options.title) {
      this._titleEl = document.createElement("span");
      this._titleEl.id = titleId;
      this._titleEl.className = "arvo-popover__title";
      this._titleEl.textContent = this._options.title;
      headerLeft.appendChild(this._titleEl);
    }
    if (this._options.hasStatusIndicator) {
      const statusWrap = document.createElement("span");
      statusWrap.className = "arvo-popover__status";
      this._statusInstance = ArvoStatus.initialize(statusWrap, {
        type: this._options.statusType,
        size: "sm",
        placement: "inline"
      });
      headerLeft.appendChild(statusWrap);
    }
    if (this._options.badge) {
      const badgeWrap = document.createElement("span");
      badgeWrap.className = "arvo-popover__badge";
      this._badgeInstance = ArvoBadge.initialize(badgeWrap, {
        ...this._options.badge,
        variant: "label",
        size: "sm",
        placement: "inline"
      });
      headerLeft.appendChild(badgeWrap);
    }
    const headerActions = document.createElement("div");
    headerActions.className = "arvo-popover__header-actions";
    for (const ha of this._options.headerActions) {
      const actionWrap = document.createElement("span");
      actionWrap.className = "arvo-popover__header-action";
      actionWrap.dataset.actionId = ha.id;
      actionWrap.dataset.actionType = ha.type;
      if (ha.type === "btn") {
        const actionBtnEl2 = document.createElement("button");
        actionWrap.appendChild(actionBtnEl2);
        const inst2 = ArvoIconButton.initialize(actionBtnEl2, {
          variant: "tertiary",
          size: "sm",
          icon: ha.icon,
          tooltip: ha.label ?? ha.id,
          isDisabled: this._options.isLoading || ha.isDisabled,
          onClick: ha.onClick ? () => ha.onClick() : void 0
        });
        this._headerActionInstances.push(inst2);
        headerActions.appendChild(actionWrap);
        continue;
      }
      if (ha.type === "inline") {
        const actionBtnEl2 = document.createElement("button");
        actionWrap.appendChild(actionBtnEl2);
        const inst2 = ArvoButton.initialize(actionBtnEl2, {
          variant: "inline",
          size: "sm",
          label: ha.label,
          icon: ha.icon ?? void 0,
          isDisabled: this._options.isLoading || ha.isDisabled,
          onClick: ha.onClick ? () => ha.onClick() : void 0
        });
        this._headerActionInstances.push(inst2);
        headerActions.appendChild(actionWrap);
        continue;
      }
      if (ha.type === "switch") {
        const switchEl = document.createElement("div");
        actionWrap.appendChild(switchEl);
        const inst2 = ArvoSwitch.initialize(switchEl, {
          isChecked: ha.isChecked ?? ha.defaultChecked ?? false,
          isDisabled: this._options.isLoading || ha.isDisabled,
          isLoading: this._options.isLoading,
          onChange: (detail) => {
            var _a;
            if (this._options.isLoading || ha.isDisabled) return;
            (_a = ha.onChange) == null ? void 0 : _a.call(ha, detail.isChecked);
          }
        });
        switchEl.setAttribute("aria-label", ha.label ?? ha.id);
        this._headerActionInstances.push(inst2);
        headerActions.appendChild(actionWrap);
        continue;
      }
      const triggerWrap = document.createElement("span");
      triggerWrap.className = "arvo-popover__header-action-trigger";
      const actionBtnEl = document.createElement("button");
      triggerWrap.appendChild(actionBtnEl);
      actionWrap.appendChild(triggerWrap);
      const tooltip = ha.ariaLabel ?? ha.label ?? ha.id;
      const inst = ArvoDropdownIconButton.initialize(actionBtnEl, {
        variant: "tertiary",
        size: "sm",
        icon: ha.icon,
        tooltip,
        items: ha.items,
        placement: ha.placement ?? "bottom-end",
        isDisabled: this._options.isLoading || ha.isDisabled,
        isLoading: this._options.isLoading,
        onSelect: (item) => {
          var _a;
          if (this._options.isLoading || ha.isDisabled) return;
          (_a = ha.onSelect) == null ? void 0 : _a.call(ha, item.id);
        }
      });
      this._headerActionInstances.push(inst);
      headerActions.appendChild(actionWrap);
    }
    if (this._options.isClosable) {
      const closeBtnWrap = document.createElement("span");
      closeBtnWrap.className = "arvo-popover__close-btn";
      const closeBtnEl = document.createElement("button");
      closeBtnWrap.appendChild(closeBtnEl);
      this._closeBtnInstance = ArvoIconButton.initialize(closeBtnEl, {
        variant: "tertiary",
        size: "sm",
        icon: "close",
        tooltip: "Close",
        isDisabled: this._options.isLoading,
        onClick: () => this.close()
      });
      closeBtnEl.setAttribute("aria-label", "Close");
      headerActions.appendChild(closeBtnWrap);
    }
    this._headerEl.appendChild(headerLeft);
    this._headerEl.appendChild(headerActions);
    this._panelEl.appendChild(this._headerEl);
  }
  _renderFooter() {
    if (!this._panelEl) return;
    this._footerEl = document.createElement("div");
    this._footerEl.className = "arvo-popover__footer";
    if (this._options.footerLeftSlot) {
      this._footerLeftEl = document.createElement("div");
      this._footerLeftEl.className = "arvo-popover__footer-left";
      renderContent(this._footerLeftEl, this._options.footerLeftSlot);
      this._footerEl.appendChild(this._footerLeftEl);
    }
    const footerActions = clampFooterActions(this._options.actions, {
      componentName: "ArvoPopover"
    });
    if (footerActions.length > 0) {
      this._footerActionsEl = document.createElement("div");
      this._footerActionsEl.className = "arvo-popover__footer-actions";
      for (const action of footerActions) {
        if (action.icon && !action.label) {
          const btnEl = document.createElement("button");
          const inst = ArvoIconButton.initialize(btnEl, {
            variant: action.variant ?? "tertiary",
            size: "md",
            icon: action.icon,
            tooltip: action.label ?? action.id,
            isDisabled: this._options.isLoading || action.isDisabled,
            onClick: (e) => this._handleFooterAction(action, e)
          });
          this._footerBtnInstances.push(inst);
          btnEl.setAttribute("data-action-id", action.id);
          this._footerActionsEl.appendChild(btnEl);
        } else {
          const btnEl = document.createElement("button");
          const inst = ArvoButton.initialize(btnEl, {
            variant: action.variant ?? "secondary",
            size: "md",
            label: action.label,
            icon: action.icon ?? void 0,
            isDisabled: this._options.isLoading || action.isDisabled,
            onClick: (e) => this._handleFooterAction(action, e)
          });
          this._footerBtnInstances.push(inst);
          btnEl.setAttribute("data-action-id", action.id);
          this._footerActionsEl.appendChild(btnEl);
        }
      }
      this._footerEl.appendChild(this._footerActionsEl);
      this._footerFit = attachOverlayFooterFit(this._footerActionsEl, {
        gap: 6
      });
    }
    this._panelEl.appendChild(this._footerEl);
  }
  _shouldShowFooter() {
    return this._options.hasFooter && this._footerVisible && !this._options.emptyContent && (this._options.actions.length > 0 || this._options.footerLeftSlot != null);
  }
  _renderBodyContent() {
    var _a;
    if (!this._bodyEl) return;
    (_a = this._emptyStateInstance) == null ? void 0 : _a.destroy();
    this._emptyStateInstance = null;
    this._bodyEl.textContent = "";
    if (this._options.emptyContent) {
      const empty = ArvoEmptyState.create({
        ...this._options.emptyContent,
        size: "sm",
        orientation: "vertical"
      });
      this._emptyStateInstance = empty;
      this._bodyEl.appendChild(empty.el);
      return;
    }
    if (this._options.content) {
      renderContent(this._bodyEl, this._options.content);
    }
  }
  _buildPanelClasses() {
    const {
      variant,
      hasArrow,
      isClosable,
      isLoading,
      isInline,
      isResizable,
      footerLeftSlot
    } = this._options;
    return [
      "arvo-popover",
      variant === "edge" && "arvo-popover--edge",
      hasArrow && "arvo-popover--with-arrow",
      this._shouldShowFooter() && "arvo-popover--with-footer",
      footerLeftSlot != null && "arvo-popover--with-footer-left",
      isClosable && "arvo-popover--closable",
      isResizable && !isInline && "arvo-popover--with-resize",
      isInline && "arvo-popover--inline",
      isLoading && "loading"
    ].filter(Boolean).join(" ");
  }
  _handleFooterAction(action, event) {
    var _a;
    const result = (_a = action.action) == null ? void 0 : _a.call(action, event);
    if (result !== false) this.close();
  }
  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  _bindEvents() {
    const el = this._element;
    if (!el) return;
    if (this._options.isInline) return;
    const { trigger } = this._options;
    if (trigger === "click") {
      el.addEventListener("click", this._boundHandleTriggerClick);
    } else if (trigger === "hover") {
      el.addEventListener("pointerenter", this._boundHandleTriggerPointerEnter);
      el.addEventListener("pointerleave", this._boundHandleTriggerPointerLeave);
    } else if (trigger === "focus") {
      el.addEventListener("focus", this._boundHandleTriggerFocus);
      el.addEventListener("blur", this._boundHandleTriggerBlur);
    }
  }
  _handleTriggerClick() {
    this.toggle();
  }
  _handleTriggerPointerEnter() {
    this._clearHoverTimers();
    this._hoverOpenTimer = setTimeout(() => this.open(), 150);
  }
  _handleTriggerPointerLeave() {
    this._clearHoverTimers();
    this._hoverCloseTimer = setTimeout(() => this.close(), 100);
  }
  _handleTriggerFocus() {
    this.open();
  }
  _handleTriggerBlur() {
    setTimeout(() => {
      if (this._panelEl && !this._panelEl.contains(document.activeElement)) {
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
  // ---------------------------------------------------------------------------
  // Two-path close: engine callback
  // ---------------------------------------------------------------------------
  _handleEngineClose() {
    var _a, _b, _c;
    if (this._closingProgrammatically) {
      return;
    }
    this._isOpen = false;
    this._clearHoverTimers();
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent("popover:close", { bubbles: true, cancelable: false })
    );
    (_c = (_b = this._options).onClose) == null ? void 0 : _c.call(_b);
  }
  // ---------------------------------------------------------------------------
  // Width (kept for the `width` option: anchor / number / string)
  // ---------------------------------------------------------------------------
  _applyWidth() {
    if (!this._panelEl) return;
    const w = this._options.width;
    if (w == null) {
      this._panelEl.style.removeProperty("--arvo-popover-width");
    } else if (w === "anchor" && this._element) {
      this._panelEl.style.setProperty("--arvo-popover-width", `${this._element.offsetWidth}px`);
    } else if (typeof w === "number") {
      this._panelEl.style.setProperty("--arvo-popover-width", `${w}px`);
    } else if (typeof w === "string") {
      this._panelEl.style.setProperty("--arvo-popover-width", w);
    }
  }
  // ---------------------------------------------------------------------------
  // Positioning -- bespoke CSS vars
  // ---------------------------------------------------------------------------
  _applyPosition(result, surface) {
    surface.style.translate = `${result.x}px ${result.y}px`;
    surface.setAttribute(
      "data-arvo-side",
      result.placement.startsWith("top") ? "top" : result.placement.startsWith("left") ? "left" : result.placement.startsWith("right") ? "right" : "bottom"
    );
    if (result.maxHeight != null) {
      surface.style.setProperty("--arvo-popover-max-height", `${result.maxHeight}px`);
    }
    if (result.width != null) {
      surface.style.setProperty("--arvo-popover-width", result.width);
    }
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  open() {
    var _a, _b, _c, _d, _e;
    if (this._isOpen) return;
    if (((_b = (_a = this._options).onOpen) == null ? void 0 : _b.call(_a)) === false) return;
    this._isOpen = true;
    this._applyWidth();
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(
      new CustomEvent("popover:open", { bubbles: true })
    );
    if (this._options.isInline) {
      (_d = this._panelEl) == null ? void 0 : _d.classList.add("open");
    } else {
      void ((_e = this._surface) == null ? void 0 : _e.open());
    }
  }
  close() {
    var _a, _b, _c, _d, _e;
    if (!this._isOpen) return;
    if (((_b = (_a = this._options).onClose) == null ? void 0 : _b.call(_a)) === false) return;
    const evt = new CustomEvent("popover:close", {
      bubbles: true,
      cancelable: true
    });
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(evt);
    if (evt.defaultPrevented) return;
    this._isOpen = false;
    this._clearHoverTimers();
    if (this._options.isInline) {
      (_d = this._panelEl) == null ? void 0 : _d.classList.remove("open");
    } else {
      this._closingProgrammatically = true;
      void ((_e = this._surface) == null ? void 0 : _e.close());
      this._closingProgrammatically = false;
    }
  }
  isOpen() {
    return this._isOpen;
  }
  toggle() {
    if (this._isOpen) this.close();
    else this.open();
  }
  renderBody(content) {
    var _a;
    this._options.content = content;
    this._options.emptyContent = null;
    this._renderBodyContent();
    if (this._panelEl) {
      this._panelEl.className = this._buildPanelClasses();
    }
    if (this._isOpen) (_a = this._surface) == null ? void 0 : _a.reposition();
  }
  setLoading(isLoading) {
    var _a, _b;
    this._options.isLoading = isLoading;
    if (!this._panelEl) return;
    this._panelEl.classList.toggle("loading", isLoading);
    if (isLoading) {
      this._panelEl.setAttribute("aria-busy", "true");
    } else {
      this._panelEl.removeAttribute("aria-busy");
    }
    (_a = this._closeBtnInstance) == null ? void 0 : _a.disabled(isLoading);
    (_b = this._backBtnInstance) == null ? void 0 : _b.disabled(isLoading);
    for (const inst of this._headerActionInstances) {
      inst.disabled(isLoading);
      if (inst instanceof ArvoSwitch) {
        inst.setLoading(isLoading);
      }
    }
  }
  setFooterVisible(visible) {
    this._footerVisible = visible;
    if (!this._footerEl) return;
    this._footerEl.style.display = visible ? "" : "none";
    if (this._panelEl) {
      this._panelEl.classList.toggle(
        "arvo-popover--with-footer",
        this._shouldShowFooter()
      );
    }
  }
  updateFooterAction(actionId, props) {
    var _a;
    const idx = this._options.actions.findIndex((a) => a.id === actionId);
    if (idx === -1) return;
    const action = this._options.actions[idx];
    if (props.isDisabled !== void 0) action.isDisabled = props.isDisabled;
    if (props.label !== void 0) action.label = props.label;
    if (props.icon !== void 0) action.icon = props.icon;
    const inst = this._footerBtnInstances[idx];
    if (inst && props.isDisabled !== void 0) inst.disabled(props.isDisabled);
    if (props.label !== void 0 || props.icon !== void 0) {
      (_a = this._footerFit) == null ? void 0 : _a.measure();
    }
  }
  reposition() {
    var _a;
    (_a = this._surface) == null ? void 0 : _a.reposition();
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    (_a = this._surface) == null ? void 0 : _a.destroy();
    this._surface = null;
    (_b = this._resizeHandle) == null ? void 0 : _b.destroy();
    this._resizeHandle = null;
    (_c = this._footerFit) == null ? void 0 : _c.destroy();
    this._footerFit = null;
    this._isOpen = false;
    this._clearHoverTimers();
    const el = this._element;
    if (el) {
      el.removeEventListener("click", this._boundHandleTriggerClick);
      el.removeEventListener("pointerenter", this._boundHandleTriggerPointerEnter);
      el.removeEventListener("pointerleave", this._boundHandleTriggerPointerLeave);
      el.removeEventListener("focus", this._boundHandleTriggerFocus);
      el.removeEventListener("blur", this._boundHandleTriggerBlur);
    }
    (_d = this._closeBtnInstance) == null ? void 0 : _d.destroy();
    (_e = this._backBtnInstance) == null ? void 0 : _e.destroy();
    this._headerActionInstances.forEach((i) => i.destroy());
    (_f = this._statusInstance) == null ? void 0 : _f.destroy();
    (_g = this._badgeInstance) == null ? void 0 : _g.destroy();
    (_h = this._emptyStateInstance) == null ? void 0 : _h.destroy();
    this._footerBtnInstances.forEach((i) => i.destroy());
    if (this._panelEl) {
      this._panelEl.removeEventListener("pointerenter", this._boundHandlePanelPointerEnter);
      this._panelEl.removeEventListener("pointerleave", this._boundHandlePanelPointerLeave);
      this._panelEl.remove();
    }
    this._element = null;
    this._panelEl = null;
    this._arrowEl = null;
    this._headerEl = null;
    this._bodyEl = null;
    this._footerEl = null;
    this._footerLeftEl = null;
    this._footerActionsEl = null;
    this._titleEl = null;
    this._stickyHeaderEl = null;
    this._resizeHostEl = null;
    this._closeBtnInstance = null;
    this._backBtnInstance = null;
    this._headerActionInstances = [];
    this._statusInstance = null;
    this._badgeInstance = null;
    this._emptyStateInstance = null;
    this._footerBtnInstances = [];
  }
};
_ArvoPopover.DEFAULTS = {
  variant: "space",
  placement: "auto",
  title: "",
  hasHeader: true,
  isClosable: true,
  hasBackButton: false,
  hasIcon: false,
  icon: null,
  hasAlert: false,
  alertType: "warning",
  hasStatusIndicator: false,
  statusType: "available",
  badge: null,
  headerActions: [],
  stickyHeader: null,
  content: null,
  emptyContent: null,
  actions: [],
  footerLeftSlot: null,
  hasFooter: true,
  width: null,
  offset: 4,
  trigger: "click",
  closeOnOutside: true,
  hasArrow: false,
  isLoading: false,
  isInteractive: true,
  isInline: false,
  isResizable: false,
  onOpen: null,
  onClose: null,
  onBack: null,
  onResize: null,
  onResizeCommit: null
};
let ArvoPopover = _ArvoPopover;
export {
  ArvoPopover
};
//# sourceMappingURL=Popover.js.map
