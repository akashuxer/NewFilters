"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const core = require("@arvo/core");
const PanelShell = require("../PanelShell/PanelShell.cjs");
const IconButton = require("../IconButton/IconButton.cjs");
const Splitter = require("../Splitter/Splitter.cjs");
const FabButton = require("../FabButton/FabButton.cjs");
const Status = require("../Status/Status.cjs");
const Badge = require("../Badge/Badge.cjs");
function toCssLength(value) {
  if (value == null) return null;
  return typeof value === "number" ? `${value}px` : String(value);
}
function toNumericPx(value, fallback) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}
function resolveExplicitContainer(container) {
  if (container === void 0) return null;
  if (container === null) return document.body;
  if (typeof container === "function") return container();
  return container;
}
function resolveEffectiveContainer(opts, effectiveMode) {
  const explicit = resolveExplicitContainer(opts.container);
  if (explicit) return explicit;
  if (effectiveMode === "overlay") return core.overlayHub.getContainer();
  return null;
}
function renderContentToElement(container, content) {
  container.textContent = "";
  if (content == null) return;
  if (typeof content === "string") {
    container.innerHTML = content;
  } else if (typeof content === "function") {
    content(container);
  } else if (content instanceof Node) {
    container.appendChild(content);
  }
}
function isRichHeaderShape(value) {
  if (value == null) return false;
  if (typeof value === "string") return false;
  if (value instanceof HTMLElement) return false;
  return typeof value === "object" && "content" in value;
}
let _panelBaseIdCounter = 0;
function createPanelBase(element, options) {
  const overlayId = `arvo-pnl-${++_panelBaseIdCounter}`;
  const host = element;
  host.classList.add("arvo-pnl");
  let _opts = { ...options };
  const _panelType = options.panelType;
  let _displayMode = options.displayMode ?? "overlay";
  const _placement = options.placement ?? "left";
  let _isPinnedState = options.isPinned ?? options.defaultPinned ?? false;
  let _isOpenState = options.isOpen ?? options.defaultOpen ?? false;
  let _isExpandedState = options.isExpanded ?? options.defaultExpanded ?? false;
  let _isDisabled = !!options.isDisabled;
  let _isLoading = !!options.isLoading === true;
  const resolveEffectiveDisplayMode = () => {
    if (_opts.isPinnable) return _isPinnedState ? "docked" : "overlay";
    return _displayMode;
  };
  let _effectiveDisplayMode = resolveEffectiveDisplayMode();
  if (_effectiveDisplayMode === "docked") _isOpenState = true;
  const isVertical = _placement === "left" || _placement === "right";
  const _numericDefaultSize = toNumericPx(options.defaultSize, 400);
  const _numericMinSize = toNumericPx(options.minSize, isVertical ? 160 : 240);
  const _numericMaxSize = toNumericPx(options.maxSize, 800);
  let _resizedSize = null;
  const paneEl = document.createElement("div");
  paneEl.className = "arvo-pnl__pane";
  paneEl.id = `arvo-pnl-pane-${overlayId}`;
  host.appendChild(paneEl);
  let _searchQuery = "";
  const _searchListeners = /* @__PURE__ */ new Set();
  let _iconOverride = options.icon;
  let _richHdrEl = null;
  let _richHdrClearBtn = null;
  const resolveSearchCfgFromCurrentOpts = () => {
    const cfg = _opts.stickyHeader && typeof _opts.stickyHeader === "object" ? _opts.stickyHeader.search : void 0;
    if (!cfg) return null;
    return cfg === true ? {} : cfg;
  };
  const handleShellSearchEvent = (e) => {
    var _a, _b;
    const ce = e;
    e.stopPropagation();
    const value = ce.detail.value;
    const previous = _searchQuery;
    _searchQuery = value;
    for (const l of _searchListeners) l(value);
    const searchCfg = resolveSearchCfgFromCurrentOpts();
    (_a = searchCfg == null ? void 0 : searchCfg.onChange) == null ? void 0 : _a.call(searchCfg, value);
    if (value === "" && previous !== "") (_b = searchCfg == null ? void 0 : searchCfg.onClear) == null ? void 0 : _b.call(searchCfg);
    paneEl.dispatchEvent(
      new CustomEvent("pnl:search", {
        bubbles: true,
        detail: { value }
      })
    );
  };
  paneEl.addEventListener("search", handleShellSearchEvent);
  const buildComposedHeaderActions = () => {
    const list = [..._opts.headerActions ?? []];
    if (_opts.hasOverflowMenu && _opts.overflowMenuItems && _opts.overflowMenuItems.length > 0) {
      list.push({
        id: "__overflow__",
        type: "dropdown",
        icon: "ellipsis-v",
        items: _opts.overflowMenuItems,
        isCompact: true
      });
    }
    if (_opts.isExpandable) {
      list.push({
        id: "__expand__",
        type: "btn",
        icon: _isExpandedState ? "priority-edge" : "expand",
        tooltip: _isExpandedState ? "Restore panel size" : "Expand panel",
        onClick: () => handleExpandClick(),
        isDisabled: _isDisabled
      });
    }
    return list;
  };
  const shellOpts = {
    title: options.title ?? null,
    hasHeader: options.hasHeader,
    hasBackButton: options.hasBackButton,
    onBack: options.onBack,
    headerActions: buildComposedHeaderActions(),
    stickyHeader: options.stickyHeader,
    content: null,
    actions: options.actions,
    isClosable: options.isDismissible ?? true,
    onClose: () => handleProgrammaticClose("close-button"),
    isPinnableCount: options.isPinnable ? 1 : 0,
    isClosableCount: options.isDismissible ?? true ? 1 : 0
  };
  const shell = PanelShell.createPanelShell({
    parentBlock: "arvo-pnl",
    parent: paneEl,
    options: shellOpts
  });
  const bodyEl = shell.bodyEl;
  if (options.body instanceof HTMLElement) {
    bodyEl.appendChild(options.body);
  }
  options.body ?? null;
  let _pinBtn = null;
  let _pinBtnEl = null;
  if (options.isPinnable) {
    _pinBtnEl = document.createElement("button");
    _pinBtnEl.type = "button";
    _pinBtn = IconButton.ArvoIconButton.initialize(_pinBtnEl, {
      size: "sm",
      variant: "tertiary",
      icon: "push-pin",
      tooltip: _isPinnedState ? "Unpin panel" : "Pin panel",
      isDisabled: _isDisabled,
      isSelected: _isPinnedState,
      onClick: () => handlePinClick()
    });
    _pinBtnEl.classList.add("arvo-pnl__pin");
    shell.setPinSlot(_pinBtnEl);
  }
  let _titleLeadingEl = null;
  const buildTitleLeading = (icon) => {
    _titleLeadingEl = document.createElement("i");
    _titleLeadingEl.className = `arvo-pnl__icon o9con o9con-${icon}`;
    _titleLeadingEl.setAttribute("aria-hidden", "true");
    shell.setTitleLeading(_titleLeadingEl);
  };
  const updateTitleLeading = (icon) => {
    const nextIcon = icon && typeof icon === "string" ? icon : null;
    if (!nextIcon) {
      destroyTitleLeading();
      return;
    }
    if (!_titleLeadingEl) {
      buildTitleLeading(nextIcon);
      return;
    }
    _titleLeadingEl.className = `arvo-pnl__icon o9con o9con-${nextIcon}`;
  };
  const destroyTitleLeading = () => {
    if (_titleLeadingEl) {
      try {
        shell.setTitleLeading(null);
      } catch {
        _titleLeadingEl.remove();
      }
    }
    _titleLeadingEl = null;
  };
  if (options.icon) buildTitleLeading(options.icon);
  let _titleTrailingEl = null;
  let _statusInstance = null;
  let _badgeInstance = null;
  const buildTitleTrailing = (statusCfg, badgeCfg) => {
    _titleTrailingEl = document.createElement("span");
    _titleTrailingEl.className = "arvo-pnl__title-cluster";
    if (statusCfg) {
      const statusHost = document.createElement("span");
      statusHost.className = "arvo-pnl__status";
      const statusInner = document.createElement("span");
      statusHost.appendChild(statusInner);
      _titleTrailingEl.appendChild(statusHost);
      _statusInstance = Status.ArvoStatus.initialize(statusInner, {
        type: statusCfg.type,
        size: statusCfg.size ?? "sm",
        icon: statusCfg.icon,
        tooltip: statusCfg.tooltip
      });
    }
    if (badgeCfg) {
      const badgeHost = document.createElement("span");
      badgeHost.className = "arvo-pnl__badge";
      const badgeInner = document.createElement("span");
      badgeHost.appendChild(badgeInner);
      _titleTrailingEl.appendChild(badgeHost);
      const { placement: _stripPlacement, ...badgeCfgNoPlacement } = badgeCfg;
      _badgeInstance = Badge.ArvoBadge.initialize(badgeInner, {
        variant: "label",
        size: "sm",
        appearance: "outline",
        ...badgeCfgNoPlacement,
        placement: "inline"
      });
    }
    shell.setTitleTrailing(_titleTrailingEl);
  };
  const destroyTitleTrailing = () => {
    _statusInstance == null ? void 0 : _statusInstance.destroy();
    _statusInstance = null;
    _badgeInstance == null ? void 0 : _badgeInstance.destroy();
    _badgeInstance = null;
    if (_titleTrailingEl) {
      try {
        shell.setTitleTrailing(null);
      } catch {
        _titleTrailingEl.remove();
      }
    }
    _titleTrailingEl = null;
  };
  if (options.status || options.badge) {
    buildTitleTrailing(options.status, options.badge);
  }
  let _richHdrBackBtn = null;
  let _richHdrCloseBtn = null;
  const destroyRichHeader = () => {
    _richHdrBackBtn == null ? void 0 : _richHdrBackBtn.destroy();
    _richHdrBackBtn = null;
    _richHdrClearBtn == null ? void 0 : _richHdrClearBtn.destroy();
    _richHdrClearBtn = null;
    _richHdrCloseBtn == null ? void 0 : _richHdrCloseBtn.destroy();
    _richHdrCloseBtn = null;
    _richHdrEl == null ? void 0 : _richHdrEl.remove();
    _richHdrEl = null;
  };
  const buildRichHeader = (config) => {
    _richHdrEl = document.createElement("div");
    _richHdrEl.className = "arvo-pnl__rich-hdr";
    let contentValue;
    let hasBack = false;
    let hasClose = false;
    let hasClear = false;
    let onBackCb;
    let onCloseCb;
    let onClearCb;
    if (isRichHeaderShape(config)) {
      contentValue = config.content;
      hasBack = config.hasBack === true;
      hasClose = config.hasClose === true;
      hasClear = config.hasClear === true;
      onBackCb = config.onBack;
      onCloseCb = config.onClose;
      onClearCb = config.onClear;
      if (hasClose) hasClear = false;
    } else {
      contentValue = config;
    }
    if (hasBack) {
      const backEl = document.createElement("button");
      backEl.type = "button";
      _richHdrBackBtn = IconButton.ArvoIconButton.initialize(backEl, {
        size: "xs",
        variant: "tertiary",
        icon: "arrow-left",
        tooltip: "Back",
        isDisabled: _isDisabled,
        onClick: () => {
          if (_isDisabled) return;
          onBackCb == null ? void 0 : onBackCb();
          paneEl.dispatchEvent(
            new CustomEvent("pnl:rich-hdr-back", { bubbles: true })
          );
        }
      });
      backEl.classList.add("arvo-pnl__rich-hdr-back");
      backEl.setAttribute("aria-label", "Back");
      _richHdrEl.appendChild(backEl);
    }
    const contentEl = document.createElement("div");
    contentEl.className = "arvo-pnl__rich-hdr-content";
    if (typeof contentValue === "string") {
      contentEl.innerHTML = contentValue;
    } else if (contentValue instanceof HTMLElement) {
      contentEl.appendChild(contentValue);
    }
    _richHdrEl.appendChild(contentEl);
    if (hasClose) {
      const closeEl = document.createElement("button");
      closeEl.type = "button";
      _richHdrCloseBtn = IconButton.ArvoIconButton.initialize(closeEl, {
        size: "xs",
        variant: "tertiary",
        icon: "close",
        tooltip: "Close",
        isDisabled: _isDisabled,
        onClick: () => {
          if (_isDisabled) return;
          onCloseCb == null ? void 0 : onCloseCb();
          paneEl.dispatchEvent(
            new CustomEvent("pnl:rich-hdr-close", { bubbles: true })
          );
        }
      });
      closeEl.classList.add("arvo-pnl__rich-hdr-close");
      closeEl.setAttribute("aria-label", "Close");
      _richHdrEl.appendChild(closeEl);
    } else if (hasClear) {
      const clearEl = document.createElement("button");
      clearEl.type = "button";
      _richHdrClearBtn = IconButton.ArvoIconButton.initialize(clearEl, {
        size: "xs",
        variant: "tertiary",
        icon: "close",
        tooltip: "Clear",
        isDisabled: _isDisabled,
        onClick: () => {
          destroyRichHeader();
          applyClasses();
          onClearCb == null ? void 0 : onClearCb();
        }
      });
      clearEl.classList.add("arvo-pnl__rich-hdr-clear");
      clearEl.setAttribute("aria-label", "Clear rich header");
      _richHdrEl.appendChild(clearEl);
    }
    const hdrEl = shell.hdrEl;
    if (hdrEl && hdrEl.parentElement === paneEl) {
      const afterHdr = hdrEl.nextSibling;
      if (afterHdr) {
        paneEl.insertBefore(_richHdrEl, afterHdr);
      } else {
        paneEl.appendChild(_richHdrEl);
      }
    } else {
      const shellFirstChild = paneEl.firstChild;
      if (shellFirstChild) {
        paneEl.insertBefore(_richHdrEl, shellFirstChild);
      } else {
        paneEl.appendChild(_richHdrEl);
      }
    }
  };
  if (options.richHeader) {
    buildRichHeader(options.richHeader);
  }
  let _fabEl = null;
  let _fabInstance = null;
  const buildFab = (config) => {
    _fabEl = document.createElement("div");
    _fabEl.className = "arvo-pnl__fab";
    _fabInstance = FabButton.ArvoFabButton.initialize(_fabEl, config);
    paneEl.appendChild(_fabEl);
  };
  if (options.fab) buildFab(options.fab);
  let _splitterEl = null;
  let _splitterInstance = null;
  const buildSplitter = () => {
    const el = document.createElement("div");
    el.className = "arvo-pnl__splitter";
    _splitterEl = el;
    const inverse = _placement === "right" || _placement === "bottom";
    const currentSize = Math.min(
      Math.max(_resizedSize ?? _numericDefaultSize, _numericMinSize),
      _numericMaxSize
    );
    _splitterInstance = Splitter.ArvoSplitter.initialize(el, {
      orientation: isVertical ? "vertical" : "horizontal",
      inverse,
      minSize: _numericMinSize,
      maxSize: _numericMaxSize,
      value: currentSize,
      ariaLabel: "Resize panel",
      isDisabled: _isDisabled,
      onResize: ({ value }) => {
        var _a;
        _resizedSize = value;
        applySizeVars();
        (_a = _opts.onResize) == null ? void 0 : _a.call(_opts, value);
        paneEl.dispatchEvent(
          new CustomEvent("pnl:resize", {
            bubbles: true,
            detail: { size: value }
          })
        );
      },
      onResizeEnd: ({ value }) => {
        var _a;
        (_a = _opts.onResizeCommit) == null ? void 0 : _a.call(_opts, value);
        paneEl.dispatchEvent(
          new CustomEvent("pnl:resize-end", {
            bubbles: true,
            detail: { size: value }
          })
        );
      }
    });
    host.appendChild(el);
  };
  if (options.isResizable && !_isExpandedState) buildSplitter();
  const resolveIsModal = () => {
    if (_effectiveDisplayMode === "docked") return false;
    return _opts.isModal ?? true;
  };
  const resolveCloseOnOutsideClick = () => _opts.closeOnOutsideClick ?? true;
  const resolveExpandMode = () => _opts.expandMode ?? (_effectiveDisplayMode === "overlay" ? "fullscreen" : "maxSize");
  let _isAnimatingExpand = false;
  let _expandAnimTimer = null;
  const applyClasses = () => {
    const isModal = resolveIsModal();
    const expandMode = resolveExpandMode();
    const isDismissible = _opts.isDismissible ?? true;
    const classes = [
      "arvo-pnl",
      `arvo-pnl--mode-${_effectiveDisplayMode}`,
      `arvo-pnl--placement-${_placement}`,
      `arvo-pnl--type-${_panelType}`
    ];
    classes.push(isModal ? "arvo-pnl--modal" : "arvo-pnl--non-modal");
    if (_isExpandedState) {
      classes.push("arvo-pnl--expanded");
      classes.push(`arvo-pnl--expand-${expandMode}`);
      classes.push("is-expanded");
    }
    if (_isAnimatingExpand) classes.push("arvo-pnl--animating-expand");
    if (_opts.isResizable) {
      classes.push("arvo-pnl--resizable");
      classes.push("arvo-pnl--with-splitter");
    }
    if (_opts.isPinnable) {
      classes.push("arvo-pnl--pinnable");
      classes.push(_isPinnedState ? "is-pinned" : "is-unpinned");
    }
    if (isDismissible) classes.push("arvo-pnl--dismissible");
    if (_richHdrEl) classes.push("arvo-pnl--with-rich-hdr");
    if (_opts.fab) classes.push("arvo-pnl--with-fab");
    if (_opts.isEdge) classes.push("arvo-pnl--edge");
    if (_effectiveDisplayMode === "overlay" && _container && _container !== document.body) {
      classes.push("arvo-pnl--scoped");
    }
    if (_effectiveDisplayMode === "overlay" && _isOpenState) {
      classes.push("open");
    }
    if (_isLoading) classes.push("loading");
    if (_isDisabled) classes.push("is-disabled");
    if (_opts.extraHostClasses) classes.push(..._opts.extraHostClasses);
    if (_opts.className) classes.push(_opts.className);
    host.className = classes.join(" ");
  };
  const applyAria = () => {
    const computedRole = _effectiveDisplayMode === "overlay" ? "dialog" : _panelType === "navigation" ? "navigation" : "region";
    paneEl.setAttribute("role", computedRole);
    if (_effectiveDisplayMode === "overlay") {
      const isModal = resolveIsModal();
      paneEl.setAttribute("aria-modal", isModal ? "true" : "false");
    } else {
      paneEl.removeAttribute("aria-modal");
    }
    if (_isLoading) paneEl.setAttribute("aria-busy", "true");
    else paneEl.removeAttribute("aria-busy");
    if (_isDisabled) paneEl.setAttribute("aria-disabled", "true");
    else paneEl.removeAttribute("aria-disabled");
    if (_opts.ariaLabelledBy) {
      paneEl.setAttribute("aria-labelledby", _opts.ariaLabelledBy);
      paneEl.removeAttribute("aria-label");
    } else {
      const label = _opts.ariaLabel ?? _opts.title ?? void 0;
      if (label) paneEl.setAttribute("aria-label", label);
      else paneEl.removeAttribute("aria-label");
      paneEl.removeAttribute("aria-labelledby");
    }
    if (_opts.ariaDescribedBy) {
      paneEl.setAttribute("aria-describedby", _opts.ariaDescribedBy);
    } else {
      paneEl.removeAttribute("aria-describedby");
    }
  };
  const applySizeVars = () => {
    const size = _resizedSize ?? _numericDefaultSize;
    const sizeCss = toCssLength(size);
    const minCss = toCssLength(_numericMinSize);
    const maxCss = toCssLength(_numericMaxSize);
    if (sizeCss) host.style.setProperty("--arvo-pnl-size", sizeCss);
    if (minCss) host.style.setProperty("--arvo-pnl-min-size", minCss);
    if (maxCss) host.style.setProperty("--arvo-pnl-max-size", maxCss);
  };
  let _surface = null;
  let _closingProgrammatically = false;
  let _escapeListener = null;
  let _outsideListener = null;
  const dispatchCloseEvent = (reason, cancelable) => {
    paneEl.dispatchEvent(
      new CustomEvent("pnl:close", {
        bubbles: true,
        cancelable,
        detail: { reason }
      })
    );
  };
  const handleProgrammaticClose = (reason) => {
    var _a, _b;
    if (_effectiveDisplayMode === "overlay" && !_isOpenState) return;
    const veto = ((_a = _opts.onClose) == null ? void 0 : _a.call(_opts, reason)) === false;
    if (veto) return;
    dispatchCloseEvent(reason, true);
    _isOpenState = false;
    if (_effectiveDisplayMode === "overlay" && _surface) {
      _closingProgrammatically = true;
      void _surface.close();
      _closingProgrammatically = false;
    }
    applyClasses();
    applyAria();
    (_b = _opts.onOpenChange) == null ? void 0 : _b.call(_opts, false);
  };
  const handleEngineClose = () => {
    var _a, _b;
    if (_closingProgrammatically) return;
    const reason = resolveIsModal() ? "mask-click" : "outside-click";
    (_a = _opts.onClose) == null ? void 0 : _a.call(_opts, reason);
    dispatchCloseEvent(reason, false);
    _isOpenState = false;
    applyClasses();
    applyAria();
    (_b = _opts.onOpenChange) == null ? void 0 : _b.call(_opts, false);
  };
  const setupOverlayListeners = () => {
    if (_escapeListener || _outsideListener) return;
    const isDismissible = _opts.isDismissible ?? true;
    const closeOnEscape = _opts.closeOnEscape ?? true;
    if (isDismissible && closeOnEscape) {
      _escapeListener = (e) => {
        var _a, _b;
        if (e.key !== "Escape") return;
        if (!_isOpenState) return;
        if (_effectiveDisplayMode !== "overlay") return;
        (_a = _opts.onClose) == null ? void 0 : _a.call(_opts, "escape");
        dispatchCloseEvent("escape", false);
        _isOpenState = false;
        if (_surface) {
          _closingProgrammatically = true;
          void _surface.close();
          _closingProgrammatically = false;
        }
        applyClasses();
        applyAria();
        (_b = _opts.onOpenChange) == null ? void 0 : _b.call(_opts, false);
      };
      document.addEventListener("keydown", _escapeListener);
    }
    const isModal = resolveIsModal();
    const closeOnOutside = resolveCloseOnOutsideClick();
    if (isDismissible && closeOnOutside && !isModal) {
      _outsideListener = (e) => {
        var _a, _b;
        if (!_isOpenState) return;
        if (_effectiveDisplayMode !== "overlay") return;
        const target = e.target;
        if (!target) return;
        if (paneEl.contains(target)) return;
        (_a = _opts.onClose) == null ? void 0 : _a.call(_opts, "outside-click");
        dispatchCloseEvent("outside-click", false);
        _isOpenState = false;
        if (_surface) {
          _closingProgrammatically = true;
          void _surface.close();
          _closingProgrammatically = false;
        }
        applyClasses();
        applyAria();
        (_b = _opts.onOpenChange) == null ? void 0 : _b.call(_opts, false);
      };
      document.addEventListener("mousedown", _outsideListener, true);
    }
  };
  const teardownOverlayListeners = () => {
    if (_escapeListener) {
      document.removeEventListener("keydown", _escapeListener);
      _escapeListener = null;
    }
    if (_outsideListener) {
      document.removeEventListener("mousedown", _outsideListener, true);
      _outsideListener = null;
    }
  };
  const createSurface = () => {
    const isModal = resolveIsModal();
    const closeOnOutside = resolveCloseOnOutsideClick();
    const maskContainer = _container && _container !== document.body ? _container : void 0;
    _surface = core.createOverlaySurface({
      id: overlayId,
      surface: host,
      type: "side-panel",
      priority: 0,
      trigger: null,
      position: false,
      focus: {
        mode: isModal ? "trap" : "none",
        initialFocus: "first",
        returnFocus: true,
        activateAfterTransition: true
      },
      mask: isModal ? {
        closeOnClick: closeOnOutside,
        className: "arvo-pnl__overlay-mask",
        container: maskContainer
      } : void 0,
      transition: null,
      transitionDuration: 200,
      closeOnOutside: false,
      triggerAria: false,
      managesOwnFocus: true,
      managesOwnBackdrop: true,
      onClose: () => handleEngineClose()
    });
  };
  const setPinned = (next) => {
    var _a;
    if (_isPinnedState === next) return;
    _isPinnedState = next;
    _effectiveDisplayMode = resolveEffectiveDisplayMode();
    _pinBtn == null ? void 0 : _pinBtn.selected(next);
    _pinBtn == null ? void 0 : _pinBtn.setTooltip(next ? "Unpin panel" : "Pin panel");
    reflowDisplayMode();
    (_a = _opts.onPinChange) == null ? void 0 : _a.call(_opts, next);
    paneEl.dispatchEvent(
      new CustomEvent("pnl:pin", {
        bubbles: true,
        detail: { pinned: next }
      })
    );
  };
  const handlePinClick = () => {
    if (_isDisabled || !_opts.isPinnable) return;
    setPinned(!_isPinnedState);
  };
  const beginExpandAnimation = () => {
    _isAnimatingExpand = true;
    if (_expandAnimTimer != null) clearTimeout(_expandAnimTimer);
    _expandAnimTimer = setTimeout(() => endExpandAnimation(), 360);
  };
  const endExpandAnimation = () => {
    if (!_isAnimatingExpand) return;
    _isAnimatingExpand = false;
    if (_expandAnimTimer != null) {
      clearTimeout(_expandAnimTimer);
      _expandAnimTimer = null;
    }
    applyClasses();
  };
  const handlePaneTransitionEnd = (e) => {
    if (e.target !== paneEl) return;
    if (e.propertyName !== "width" && e.propertyName !== "height") return;
    endExpandAnimation();
  };
  paneEl.addEventListener("transitionend", handlePaneTransitionEnd);
  const setExpanded = (next) => {
    var _a;
    if (_isExpandedState === next) return;
    beginExpandAnimation();
    _isExpandedState = next;
    applyClasses();
    if (next && _splitterInstance) {
      _splitterInstance.destroy();
      _splitterInstance = null;
      _splitterEl == null ? void 0 : _splitterEl.remove();
      _splitterEl = null;
    } else if (!next && _opts.isResizable && !_splitterInstance) {
      buildSplitter();
    }
    (_a = _opts.onExpandChange) == null ? void 0 : _a.call(_opts, next);
    paneEl.dispatchEvent(
      new CustomEvent("pnl:expand", {
        bubbles: true,
        detail: { isExpanded: next }
      })
    );
  };
  const handleExpandClick = () => {
    if (_isDisabled || !_opts.isExpandable) return;
    setExpanded(!_isExpandedState);
  };
  const _isContainerExplicit = options.container !== void 0;
  const _originalParent = element.parentElement;
  let _container = resolveEffectiveContainer(
    options,
    _effectiveDisplayMode
  );
  if (_container && _container !== element.parentElement && (_effectiveDisplayMode === "overlay" || _isContainerExplicit)) {
    _container.appendChild(host);
  }
  applyClasses();
  applyAria();
  applySizeVars();
  if (_isLoading) {
    shell.loading(true);
    host.classList.add("loading");
  }
  if (_isDisabled) {
    shell.disabled(true);
    host.classList.add("is-disabled");
  }
  const reflowDisplayMode = () => {
    if (_effectiveDisplayMode === "overlay") {
      setupOverlayListeners();
      _isOpenState = true;
      _container = resolveEffectiveContainer(_opts, _effectiveDisplayMode);
      if (_container && host.parentElement !== _container) {
        _container.appendChild(host);
      }
      if (!_surface) createSurface();
      void _surface.open();
    } else {
      teardownOverlayListeners();
      _surface == null ? void 0 : _surface.destroy();
      _surface = null;
      host.classList.remove("open");
      if (_isContainerExplicit && _container) {
        if (host.parentElement !== _container) {
          _container.appendChild(host);
        }
      } else if (_originalParent && host.parentElement !== _originalParent) {
        _originalParent.appendChild(host);
      }
    }
    applyClasses();
    applyAria();
  };
  const shellEventBindings = [];
  const wireShellEventReemit = () => {
    const map = {
      back: "pnl:back",
      action: "pnl:action",
      "tab-select": "pnl:tab-select"
    };
    for (const [src, dest] of Object.entries(map)) {
      const handler = (e) => {
        const ce = e;
        paneEl.dispatchEvent(
          new CustomEvent(dest, { bubbles: true, detail: ce.detail })
        );
      };
      paneEl.addEventListener(src, handler);
      shellEventBindings.push({ src, handler });
    }
  };
  const teardownShellEventReemit = () => {
    for (const { src, handler } of shellEventBindings) {
      paneEl.removeEventListener(src, handler);
    }
    shellEventBindings.length = 0;
  };
  wireShellEventReemit();
  if (_effectiveDisplayMode === "overlay") {
    setupOverlayListeners();
    if (_isOpenState) {
      createSurface();
      void _surface.open();
    }
  }
  let _destroyed = false;
  const destroy = () => {
    if (_destroyed) return;
    _destroyed = true;
    teardownOverlayListeners();
    teardownShellEventReemit();
    paneEl.removeEventListener("search", handleShellSearchEvent);
    paneEl.removeEventListener("transitionend", handlePaneTransitionEnd);
    if (_expandAnimTimer != null) {
      clearTimeout(_expandAnimTimer);
      _expandAnimTimer = null;
    }
    _surface == null ? void 0 : _surface.destroy();
    _surface = null;
    _pinBtn == null ? void 0 : _pinBtn.destroy();
    _pinBtn = null;
    _pinBtnEl = null;
    destroyRichHeader();
    destroyTitleLeading();
    destroyTitleTrailing();
    _fabInstance == null ? void 0 : _fabInstance.destroy();
    _fabInstance = null;
    _fabEl == null ? void 0 : _fabEl.remove();
    _fabEl = null;
    shell.destroy();
    _splitterInstance == null ? void 0 : _splitterInstance.destroy();
    _splitterInstance = null;
    _splitterEl == null ? void 0 : _splitterEl.remove();
    _splitterEl = null;
    paneEl.remove();
    host.className = "";
    host.style.removeProperty("--arvo-pnl-size");
    host.style.removeProperty("--arvo-pnl-min-size");
    host.style.removeProperty("--arvo-pnl-max-size");
    if (_originalParent && host.parentElement !== _originalParent) {
      _originalParent.appendChild(host);
    }
  };
  const instance = {
    hostEl: host,
    paneEl,
    bodyEl,
    shell,
    open() {
      var _a, _b;
      if (_effectiveDisplayMode === "docked") return;
      if (_isOpenState) return;
      if (((_a = _opts.onOpen) == null ? void 0 : _a.call(_opts)) === false) return;
      _isOpenState = true;
      applyClasses();
      applyAria();
      if (!_surface) createSurface();
      void _surface.open();
      paneEl.dispatchEvent(
        new CustomEvent("pnl:open", { bubbles: true, detail: {} })
      );
      (_b = _opts.onOpenChange) == null ? void 0 : _b.call(_opts, true);
    },
    close(reason = "programmatic") {
      handleProgrammaticClose(reason);
    },
    toggle() {
      if (_effectiveDisplayMode === "docked") return;
      if (_isOpenState) this.close("programmatic");
      else this.open();
    },
    isOpen() {
      if (_effectiveDisplayMode === "docked") return true;
      return _isOpenState;
    },
    pinned(value) {
      if (value === void 0) return _isPinnedState;
      if (!_opts.isPinnable) return;
      setPinned(value);
    },
    expanded(value) {
      if (value === void 0) return _isExpandedState;
      setExpanded(value);
    },
    size(value) {
      if (value === void 0) return _resizedSize ?? _numericDefaultSize;
      const clamped = Math.min(
        Math.max(value, _numericMinSize),
        _numericMaxSize
      );
      _resizedSize = clamped;
      applySizeVars();
    },
    setDisplayMode(mode) {
      if (_opts.isPinnable) {
        setPinned(mode === "docked");
        return;
      }
      if (_displayMode === mode) return;
      _displayMode = mode;
      _effectiveDisplayMode = resolveEffectiveDisplayMode();
      reflowDisplayMode();
    },
    setStickyHeader(config) {
      _opts = { ..._opts, stickyHeader: config };
      shell.setStickyHeader(config);
    },
    setHeaderActions(actions) {
      _opts = { ..._opts, headerActions: actions };
      shell.setHeaderActions(buildComposedHeaderActions());
    },
    setActions(actions) {
      _opts = { ..._opts, actions };
      shell.setActions(actions);
    },
    setTitle(title) {
      _opts = { ..._opts, title: title ?? void 0 };
      shell.setTitle(title);
    },
    setIcon(icon) {
      const nextIcon = icon && typeof icon === "string" ? icon : null;
      _iconOverride = nextIcon ?? void 0;
      _opts = { ..._opts, icon: _iconOverride };
      updateTitleLeading(_iconOverride ?? null);
    },
    setRichHeader(config) {
      destroyRichHeader();
      if (config) buildRichHeader(config);
      applyClasses();
    },
    replaceBody(next) {
      bodyEl.textContent = "";
      if (next) bodyEl.appendChild(next);
    },
    setContent(content) {
      renderContentToElement(bodyEl, content);
    },
    search(query) {
      if (query === void 0) return shell.search() ?? "";
      shell.search(query);
    },
    selectedTab(id) {
      if (id === void 0) return shell.selectedTab() ?? null;
      shell.selectedTab(id);
    },
    loading(state) {
      if (state === void 0) return _isLoading;
      _isLoading = state;
      shell.loading(state);
      host.classList.toggle("loading", state);
    },
    disabled(state) {
      if (state === void 0) return _isDisabled;
      _isDisabled = state;
      shell.disabled(state);
      host.classList.toggle("is-disabled", state);
      _pinBtn == null ? void 0 : _pinBtn.disabled(state);
      _splitterInstance == null ? void 0 : _splitterInstance.disabled(state);
    },
    focus(target) {
      shell.focus(target);
    },
    onSearchQueryChange(listener) {
      _searchListeners.add(listener);
      listener(_searchQuery);
      return () => _searchListeners.delete(listener);
    },
    destroy
  };
  return instance;
}
exports.createPanelBase = createPanelBase;
exports.renderContentToElement = renderContentToElement;
//# sourceMappingURL=PanelBase.cjs.map
