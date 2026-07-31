import { ArvoActionMenu } from "../ActionMenu/ActionMenu.js";
import { connectTooltip, tooltipManager } from "@arvo/core";
const _ArvoDropdownIconButton = class _ArvoDropdownIconButton {
  constructor(element, options) {
    this._actionMenu = null;
    this._externalOverlay = null;
    this._iconEl = null;
    this._caretEl = null;
    this._tooltipConnector = null;
    this._isOpen = false;
    this._ariaExpandedObserver = null;
    this._element = element;
    const variant = (options == null ? void 0 : options.variant) && _ArvoDropdownIconButton.VARIANTS.includes(options.variant) ? options.variant : _ArvoDropdownIconButton.DEFAULTS.variant;
    const size = (options == null ? void 0 : options.size) && _ArvoDropdownIconButton.SIZES.includes(options.size) ? options.size : _ArvoDropdownIconButton.DEFAULTS.size;
    this._options = {
      ..._ArvoDropdownIconButton.DEFAULTS,
      ...options,
      variant,
      size,
      icon: (options == null ? void 0 : options.icon) ?? _ArvoDropdownIconButton.DEFAULTS.icon,
      tooltip: (options == null ? void 0 : options.tooltip) ?? null,
      maxHeight: (options == null ? void 0 : options.maxHeight) ?? null,
      items: (options == null ? void 0 : options.items) ?? [],
      menuProps: (options == null ? void 0 : options.menuProps) ?? null,
      overlay: (options == null ? void 0 : options.overlay) ?? null,
      isOpen: (options == null ? void 0 : options.isOpen) ?? null,
      onSelect: (options == null ? void 0 : options.onSelect) ?? null,
      onOpen: (options == null ? void 0 : options.onOpen) ?? null,
      onClose: (options == null ? void 0 : options.onClose) ?? null,
      onOpenChange: (options == null ? void 0 : options.onOpenChange) ?? null,
      onClick: (options == null ? void 0 : options.onClick) ?? null,
      onFocus: (options == null ? void 0 : options.onFocus) ?? null,
      onBlur: (options == null ? void 0 : options.onBlur) ?? null
    };
    const hasItems = Array.isArray(options == null ? void 0 : options.items) && options.items.length > 0;
    const hasMenuProps = (options == null ? void 0 : options.menuProps) != null;
    this._isExternalMode = this._options.overlay != null || !hasItems && !hasMenuProps;
    this._boundHandleClick = this._handleClick.bind(this);
    this._boundHandleFocus = this._handleFocus.bind(this);
    this._boundHandleBlur = this._handleBlur.bind(this);
    this._boundHandleKeydown = this._handleKeydown.bind(this);
    this._render();
    this._bindEvents();
    if (this._isExternalMode) {
      this._initExternalOverlay();
    } else {
      this._initActionMenu();
    }
    this._connectTooltip();
    if (this._isExternalMode && this._options.isOpen === true) {
      this.setOpenState(true);
    }
  }
  static initialize(element, options) {
    return new _ArvoDropdownIconButton(element, options);
  }
  _connectTooltip() {
    if (!this._element || !this._options.tooltip) return;
    const tip = this._options.tooltip;
    const config = typeof tip === "string" ? { content: tip } : tip;
    this._tooltipConnector = connectTooltip(tooltipManager, {
      anchor: this._element,
      content: config.content,
      placement: config.placement,
      shortcut: config.shortcut
    });
  }
  _tooltipText() {
    const tip = this._options.tooltip;
    if (!tip) return "";
    return typeof tip === "string" ? tip : tip.content;
  }
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    el.classList.add("arvo-dd-icon-btn", "arvo-btn");
    el.classList.add(`arvo-btn--${this._options.variant}`);
    el.classList.add(`arvo-btn--${this._options.size}`);
    if (this._options.isCompact) {
      el.classList.add("arvo-dd-icon-btn--compact");
    }
    if (el instanceof HTMLButtonElement) {
      el.setAttribute("type", "button");
    }
    this._iconEl = document.createElement("span");
    this._iconEl.className = `arvo-dd-icon-btn__icon o9con o9con-${this._options.icon}`;
    this._iconEl.setAttribute("aria-hidden", "true");
    el.appendChild(this._iconEl);
    if (!this._options.isCompact) {
      this._caretEl = document.createElement("span");
      this._caretEl.className = "arvo-dd-icon-btn__caret o9con o9con-angle-down";
      this._caretEl.setAttribute("aria-hidden", "true");
      el.appendChild(this._caretEl);
    }
    const tipText = this._tooltipText();
    if (tipText) {
      el.setAttribute("aria-label", tipText);
    }
    if (this._options.isDisabled) {
      if (el instanceof HTMLButtonElement) {
        el.disabled = true;
      } else {
        el.setAttribute("aria-disabled", "true");
      }
    }
    if (this._options.isLoading) {
      el.classList.add("loading");
      el.setAttribute("aria-busy", "true");
    }
  }
  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  _bindEvents() {
    var _a, _b, _c, _d;
    (_a = this._element) == null ? void 0 : _a.addEventListener("click", this._boundHandleClick);
    (_b = this._element) == null ? void 0 : _b.addEventListener("focus", this._boundHandleFocus);
    (_c = this._element) == null ? void 0 : _c.addEventListener("blur", this._boundHandleBlur);
    (_d = this._element) == null ? void 0 : _d.addEventListener("keydown", this._boundHandleKeydown);
  }
  _handleClick(event) {
    var _a, _b;
    if (this._options.isDisabled || this._options.isLoading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    (_b = (_a = this._options).onClick) == null ? void 0 : _b.call(_a, event);
  }
  _handleFocus(event) {
    var _a, _b;
    (_b = (_a = this._options).onFocus) == null ? void 0 : _b.call(_a, event);
  }
  _handleBlur(event) {
    var _a, _b;
    (_b = (_a = this._options).onBlur) == null ? void 0 : _b.call(_a, event);
  }
  _handleKeydown(event) {
    var _a, _b, _c;
    if ((event.key === "Enter" || event.key === " ") && (this._options.isDisabled || this._options.isLoading)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.key === "ArrowDown" && !event.ctrlKey && !event.metaKey && !event.shiftKey && !this._options.isDisabled && !this._options.isLoading) {
      event.preventDefault();
      if (this._isExternalMode) {
        if ((_a = this._externalOverlay) == null ? void 0 : _a.open) {
          this._externalOverlay.open();
        } else {
          (_b = this._element) == null ? void 0 : _b.click();
        }
      } else {
        (_c = this._actionMenu) == null ? void 0 : _c.open();
      }
    }
  }
  // ---------------------------------------------------------------------------
  // ActionMenu Init (internal mode)
  // ---------------------------------------------------------------------------
  _initActionMenu() {
    if (!this._element) return;
    const menuOptions = {
      ...this._options.menuProps ?? void 0,
      items: this._options.items,
      search: this._options.search,
      placement: this._options.placement,
      maxHeight: this._options.maxHeight ?? void 0,
      hasGroupDividers: this._options.hasGroupDividers,
      closeOnSelect: this._options.closeOnSelect,
      isDisabled: this._options.isDisabled || this._options.isLoading,
      onOpen: this._options.onOpen ?? void 0,
      onClose: this._options.onClose ?? void 0,
      onSelect: (item, index) => this._handleMenuSelect(item, index),
      onOpenChange: (isOpen) => this.setOpenState(isOpen)
    };
    this._actionMenu = ArvoActionMenu.initialize(this._element, menuOptions);
  }
  // ---------------------------------------------------------------------------
  // External overlay init (overlay-slot / headless)
  // ---------------------------------------------------------------------------
  _initExternalOverlay() {
    var _a;
    if (!this._element) return;
    if (this._options.overlay) {
      try {
        this._externalOverlay = this._options.overlay(this._element);
      } catch (err) {
        if (typeof process !== "undefined" && ((_a = process.env) == null ? void 0 : _a.NODE_ENV) !== "production") {
          console.error(
            "ArvoDropdownIconButton: overlay factory threw while initializing.",
            err
          );
        }
      }
    }
    if (this._options.isOpen == null && typeof MutationObserver !== "undefined") {
      this._ariaExpandedObserver = new MutationObserver(() => {
        var _a2;
        const value = (_a2 = this._element) == null ? void 0 : _a2.getAttribute("aria-expanded");
        this.setOpenState(value === "true");
      });
      this._ariaExpandedObserver.observe(this._element, {
        attributes: true,
        attributeFilter: ["aria-expanded"]
      });
    }
  }
  // ---------------------------------------------------------------------------
  // Menu Handlers
  // ---------------------------------------------------------------------------
  _handleMenuSelect(item, index) {
    var _a, _b;
    this._dispatchEvent("dd-icon-btn:select", { item, index });
    return (_b = (_a = this._options).onSelect) == null ? void 0 : _b.call(_a, item, index);
  }
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  _dispatchEvent(name, detail) {
    var _a;
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(name, { bubbles: true, cancelable: true, detail })
    );
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  open() {
    var _a, _b, _c;
    if (this._isExternalMode) {
      if ((_a = this._externalOverlay) == null ? void 0 : _a.open) {
        this._externalOverlay.open();
      } else {
        (_b = this._element) == null ? void 0 : _b.click();
      }
      return;
    }
    (_c = this._actionMenu) == null ? void 0 : _c.open();
  }
  close() {
    var _a, _b, _c;
    if (this._isExternalMode) {
      if ((_a = this._externalOverlay) == null ? void 0 : _a.close) {
        this._externalOverlay.close();
      } else if (this._isOpen) {
        (_b = this._element) == null ? void 0 : _b.click();
      }
      return;
    }
    (_c = this._actionMenu) == null ? void 0 : _c.close();
  }
  toggle(force) {
    var _a, _b, _c;
    if (this._isExternalMode) {
      if ((_a = this._externalOverlay) == null ? void 0 : _a.toggle) {
        this._externalOverlay.toggle(force);
        return;
      }
      if (force === void 0) {
        (_b = this._element) == null ? void 0 : _b.click();
        return;
      }
      if (force && !this._isOpen) this.open();
      else if (!force && this._isOpen) this.close();
      return;
    }
    (_c = this._actionMenu) == null ? void 0 : _c.toggle(force);
  }
  isOpen() {
    return this._isOpen;
  }
  triggerElement() {
    return this._element;
  }
  setOpenState(open) {
    var _a, _b, _c;
    if (this._isOpen === open) return;
    this._isOpen = open;
    (_a = this._element) == null ? void 0 : _a.classList.toggle("open", open);
    if (open) {
      this._dispatchEvent("dd-icon-btn:open", {});
    } else {
      this._dispatchEvent("dd-icon-btn:close", {});
    }
    (_c = (_b = this._options).onOpenChange) == null ? void 0 : _c.call(_b, open);
  }
  updateItems(items) {
    var _a;
    this._options.items = items;
    (_a = this._actionMenu) == null ? void 0 : _a.updateItems(items);
  }
  setIcon(iconName) {
    if (!this._iconEl) return;
    const oldClass = `o9con-${this._options.icon}`;
    this._iconEl.classList.remove(oldClass);
    this._iconEl.classList.add(`o9con-${iconName}`);
    this._options.icon = iconName;
  }
  setTooltip(tooltip) {
    var _a, _b, _c, _d, _e;
    this._options.tooltip = tooltip;
    const tipText = this._tooltipText();
    if (tipText) {
      (_a = this._element) == null ? void 0 : _a.setAttribute("aria-label", tipText);
    } else {
      (_b = this._element) == null ? void 0 : _b.removeAttribute("aria-label");
    }
    if (!tooltip) {
      (_c = this._tooltipConnector) == null ? void 0 : _c.update({ content: "" });
    } else if (typeof tooltip === "string") {
      (_d = this._tooltipConnector) == null ? void 0 : _d.update({ content: tooltip });
    } else {
      (_e = this._tooltipConnector) == null ? void 0 : _e.update({
        content: tooltip.content,
        placement: tooltip.placement,
        shortcut: tooltip.shortcut
      });
    }
  }
  compact(state) {
    var _a, _b, _c;
    if (state === void 0) {
      return this._options.isCompact;
    }
    if (state === this._options.isCompact) return;
    this._options.isCompact = state;
    if (state) {
      (_a = this._element) == null ? void 0 : _a.classList.add("arvo-dd-icon-btn--compact");
      (_b = this._caretEl) == null ? void 0 : _b.remove();
      this._caretEl = null;
    } else {
      (_c = this._element) == null ? void 0 : _c.classList.remove("arvo-dd-icon-btn--compact");
      if (!this._caretEl && this._element) {
        this._caretEl = document.createElement("span");
        this._caretEl.className = "arvo-dd-icon-btn__caret o9con o9con-angle-down";
        this._caretEl.setAttribute("aria-hidden", "true");
        this._element.appendChild(this._caretEl);
      }
    }
  }
  setVariant(variant) {
    if (!_ArvoDropdownIconButton.VARIANTS.includes(variant))
      return;
    const el = this._element;
    if (!el) return;
    _ArvoDropdownIconButton.VARIANTS.forEach(
      (v) => el.classList.remove(`arvo-btn--${v}`)
    );
    el.classList.add(`arvo-btn--${variant}`);
    this._options.variant = variant;
  }
  setSize(size) {
    if (!_ArvoDropdownIconButton.SIZES.includes(size))
      return;
    const el = this._element;
    if (!el) return;
    _ArvoDropdownIconButton.SIZES.forEach(
      (s) => el.classList.remove(`arvo-btn--${s}`)
    );
    el.classList.add(`arvo-btn--${size}`);
    this._options.size = size;
  }
  setLoading(isLoading) {
    var _a, _b, _c, _d, _e;
    this._options.isLoading = isLoading;
    if (isLoading) {
      (_a = this._element) == null ? void 0 : _a.classList.add("loading");
      (_b = this._element) == null ? void 0 : _b.setAttribute("aria-busy", "true");
    } else {
      (_c = this._element) == null ? void 0 : _c.classList.remove("loading");
      (_d = this._element) == null ? void 0 : _d.removeAttribute("aria-busy");
    }
    (_e = this._actionMenu) == null ? void 0 : _e.disabled(isLoading || this._options.isDisabled);
  }
  disabled(state) {
    var _a;
    if (state === void 0) {
      return this._options.isDisabled;
    }
    this._options.isDisabled = state;
    if (this._element instanceof HTMLButtonElement) {
      this._element.disabled = state;
    } else if (this._element) {
      if (state) {
        this._element.setAttribute("aria-disabled", "true");
      } else {
        this._element.removeAttribute("aria-disabled");
      }
    }
    (_a = this._actionMenu) == null ? void 0 : _a.disabled(state || this._options.isLoading);
  }
  focus() {
    var _a;
    (_a = this._element) == null ? void 0 : _a.focus();
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f, _g;
    (_a = this._actionMenu) == null ? void 0 : _a.destroy();
    this._actionMenu = null;
    (_c = (_b = this._externalOverlay) == null ? void 0 : _b.destroy) == null ? void 0 : _c.call(_b);
    this._externalOverlay = null;
    (_d = this._ariaExpandedObserver) == null ? void 0 : _d.disconnect();
    this._ariaExpandedObserver = null;
    const el = this._element;
    if (el) {
      el.removeEventListener("click", this._boundHandleClick);
      el.removeEventListener("focus", this._boundHandleFocus);
      el.removeEventListener("blur", this._boundHandleBlur);
      el.removeEventListener("keydown", this._boundHandleKeydown);
      el.classList.remove(
        "arvo-dd-icon-btn",
        "arvo-dd-icon-btn--compact",
        "arvo-btn",
        "open",
        "loading"
      );
      _ArvoDropdownIconButton.VARIANTS.forEach(
        (v) => el.classList.remove(`arvo-btn--${v}`)
      );
      _ArvoDropdownIconButton.SIZES.forEach(
        (s) => el.classList.remove(`arvo-btn--${s}`)
      );
      el.removeAttribute("aria-haspopup");
      el.removeAttribute("aria-controls");
      el.removeAttribute("aria-expanded");
      el.removeAttribute("aria-disabled");
      el.removeAttribute("aria-busy");
      el.removeAttribute("aria-label");
      if (el instanceof HTMLButtonElement) {
        el.disabled = false;
      }
      (_e = this._iconEl) == null ? void 0 : _e.remove();
      (_f = this._caretEl) == null ? void 0 : _f.remove();
    }
    (_g = this._tooltipConnector) == null ? void 0 : _g.destroy();
    this._tooltipConnector = null;
    this._element = null;
    this._iconEl = null;
    this._caretEl = null;
  }
};
_ArvoDropdownIconButton.VARIANTS = ["primary", "secondary", "tertiary", "outline"];
_ArvoDropdownIconButton.SIZES = ["sm", "md", "lg"];
_ArvoDropdownIconButton.DEFAULTS = {
  icon: "ellipsis-v",
  tooltip: null,
  variant: "primary",
  size: "md",
  isCompact: false,
  isDisabled: false,
  isLoading: false,
  items: [],
  search: void 0,
  placement: "bottom-end",
  maxHeight: null,
  hasGroupDividers: true,
  closeOnSelect: true,
  menuProps: null,
  overlay: null,
  isOpen: null,
  onSelect: null,
  onOpen: null,
  onClose: null,
  onOpenChange: null,
  onClick: null,
  onFocus: null,
  onBlur: null
};
let ArvoDropdownIconButton = _ArvoDropdownIconButton;
export {
  ArvoDropdownIconButton
};
//# sourceMappingURL=DropdownIconButton.js.map
