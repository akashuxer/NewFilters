"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const ActionMenu = require("../ActionMenu/ActionMenu.cjs");
function isGrouped(items) {
  return items.length > 0 && "items" in items[0];
}
function flattenItems(items) {
  if (isGrouped(items)) {
    const result = [];
    for (const group of items) {
      for (const item of group.items) result.push(item);
    }
    return result;
  }
  return items;
}
const _ArvoDropdownButton = class _ArvoDropdownButton {
  constructor(element, options) {
    var _a, _b;
    this._actionMenu = null;
    this._externalOverlay = null;
    this._iconEl = null;
    this._labelEl = null;
    this._caretEl = null;
    this._selectedItemId = null;
    this._isOpen = false;
    this._ariaExpandedObserver = null;
    this._element = element;
    const variant = (options == null ? void 0 : options.variant) && _ArvoDropdownButton.VARIANTS.includes(options.variant) ? options.variant : _ArvoDropdownButton.DEFAULTS.variant;
    const size = (options == null ? void 0 : options.size) && _ArvoDropdownButton.SIZES.includes(options.size) ? options.size : _ArvoDropdownButton.DEFAULTS.size;
    this._options = {
      ..._ArvoDropdownButton.DEFAULTS,
      ...options,
      variant,
      size,
      label: (options == null ? void 0 : options.label) ?? ((_a = element.textContent) == null ? void 0 : _a.trim()) ?? "",
      icon: (options == null ? void 0 : options.icon) ?? null,
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
    if (this._isExternalMode && this._options.mode === "selection" && typeof process !== "undefined" && ((_b = process.env) == null ? void 0 : _b.NODE_ENV) !== "production") {
      console.warn(
        'ArvoDropdownButton: `mode: "selection"` is only supported with the default internal ArvoActionMenu composition. Falling back to `mode: "action"`. To update the button label from an external overlay, call your overlay\'s onSelect handler with whatever payload makes sense and update the label via setLabel() yourself.'
      );
      this._options.mode = "action";
    }
    this._originalLabel = this._options.label;
    this._selectedItemId = (options == null ? void 0 : options.value) !== void 0 ? options.value ?? null : (options == null ? void 0 : options.defaultValue) !== void 0 ? options.defaultValue ?? null : null;
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
    if (this._selectedItemId != null && this._options.mode === "selection" && !this._isExternalMode) {
      this._applySelection(this._selectedItemId);
    }
    if (this._isExternalMode && this._options.isOpen === true) {
      this.setOpenState(true);
    }
  }
  static initialize(element, options) {
    return new _ArvoDropdownButton(element, options);
  }
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    el.classList.add("arvo-dd-btn", "arvo-btn");
    el.classList.add(`arvo-btn--${this._options.variant}`);
    el.classList.add(`arvo-btn--${this._options.size}`);
    if (el instanceof HTMLButtonElement) {
      el.setAttribute("type", "button");
    }
    if (this._options.icon) {
      this._iconEl = document.createElement("span");
      this._iconEl.className = `arvo-dd-btn__icon o9con o9con-${this._options.icon}`;
      this._iconEl.setAttribute("aria-hidden", "true");
      el.appendChild(this._iconEl);
    }
    this._labelEl = document.createElement("span");
    this._labelEl.className = "arvo-dd-btn__lbl";
    this._labelEl.textContent = this._options.label;
    el.appendChild(this._labelEl);
    this._caretEl = document.createElement("span");
    this._caretEl.className = "arvo-dd-btn__caret o9con o9con-angle-down";
    this._caretEl.setAttribute("aria-hidden", "true");
    el.appendChild(this._caretEl);
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
      items: this._getProcessedItems(),
      search: this._options.search,
      placement: this._options.placement,
      maxHeight: this._options.maxHeight ?? void 0,
      hasGroupDividers: this._options.hasGroupDividers,
      closeOnSelect: this._options.closeOnSelect,
      isDisabled: this._options.isDisabled || this._options.isLoading,
      onOpen: this._options.onOpen ?? void 0,
      onClose: this._options.onClose ?? void 0,
      onSelect: (item, index) => this._handleSelect(item, index),
      onOpenChange: (isOpen) => this.setOpenState(isOpen)
    };
    this._actionMenu = ActionMenu.ArvoActionMenu.initialize(this._element, menuOptions);
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
            "ArvoDropdownButton: overlay factory threw while initializing the external overlay.",
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
  // Selection Logic (internal mode only)
  // ---------------------------------------------------------------------------
  _getProcessedItems() {
    const { items, mode } = this._options;
    if (mode !== "selection" || this._selectedItemId == null) return items;
    const selId = String(this._selectedItemId);
    const mark = (item) => ({
      ...item,
      active: item.id === selId
    });
    if (isGrouped(items)) {
      return items.map((group) => ({
        ...group,
        items: group.items.map(mark)
      }));
    }
    return items.map(mark);
  }
  _handleSelect(item, index) {
    var _a, _b, _c;
    if (this._options.mode === "selection") {
      const previousId = this._selectedItemId;
      const previousItem = previousId != null ? flattenItems(this._options.items).find(
        (i) => i.id === String(previousId)
      ) ?? null : null;
      this._selectedItemId = item.id;
      this._updateDisplayLabel();
      (_a = this._actionMenu) == null ? void 0 : _a.updateItems(this._getProcessedItems());
      this._dispatchEvent("dd-btn:change", {
        item,
        index,
        previousItem
      });
    } else {
      this._dispatchEvent("dd-btn:select", { item, index });
    }
    return (_c = (_b = this._options).onSelect) == null ? void 0 : _c.call(_b, item, index);
  }
  _updateDisplayLabel() {
    if (!this._labelEl) return;
    if (this._options.mode === "action" || this._selectedItemId == null) {
      this._labelEl.textContent = this._originalLabel;
      return;
    }
    const flat = flattenItems(this._options.items);
    const selId = String(this._selectedItemId);
    const selectedItem = flat.find((item) => item.id === selId);
    if (!selectedItem) {
      this._labelEl.textContent = this._originalLabel;
      return;
    }
    if (this._options.displaySelected === "value") {
      const val = selectedItem.value;
      this._labelEl.textContent = val != null ? String(val) : selectedItem.id;
    } else {
      this._labelEl.textContent = selectedItem.label;
    }
  }
  _applySelection(itemId) {
    var _a;
    this._selectedItemId = itemId;
    this._updateDisplayLabel();
    (_a = this._actionMenu) == null ? void 0 : _a.updateItems(this._getProcessedItems());
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
  /**
   * Open the menu / overlay.
   * - Internal mode: delegates to ArvoActionMenu.open().
   * - External mode with factory + open(): forwards to the overlay instance.
   * - Headless / factory without open(): synthesizes a click on the trigger.
   */
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
  /**
   * Close the menu / overlay.
   * - Internal mode: delegates to ArvoActionMenu.close().
   * - External mode with factory + close(): forwards to the overlay instance.
   * - Headless without a close()-bearing instance: synthesizes a click
   *   on the trigger to toggle. Open click-trigger overlays close on a
   *   second click. Consumers using non-click overlays in pure headless
   *   mode should drive close via the controlled `isOpen` option.
   */
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
  /**
   * Returns the trigger element so a consumer-composed external overlay
   * can anchor against it (pass into ArvoPopover.initialize, etc.).
   * Returns null after destroy().
   */
  triggerElement() {
    return this._element;
  }
  /**
   * Manually flip the wrapper's open chrome state. Idempotent -- no-op on
   * transitions to the current state. Called automatically when the wrapper
   * observes `aria-expanded` changes on the trigger.
   */
  setOpenState(open) {
    var _a, _b, _c;
    if (this._isOpen === open) return;
    this._isOpen = open;
    (_a = this._element) == null ? void 0 : _a.classList.toggle("open", open);
    if (open) {
      this._dispatchEvent("dd-btn:open", {});
    } else {
      this._dispatchEvent("dd-btn:close", {});
    }
    (_c = (_b = this._options).onOpenChange) == null ? void 0 : _c.call(_b, open);
  }
  value(itemId) {
    var _a;
    if (itemId === void 0) {
      if (this._options.mode !== "selection" || this._selectedItemId == null) {
        return null;
      }
      const flat = flattenItems(this._options.items);
      return flat.find((item) => item.id === String(this._selectedItemId)) ?? null;
    }
    if (this._options.mode !== "selection") return;
    if (itemId == null) {
      this._selectedItemId = null;
      this._updateDisplayLabel();
      (_a = this._actionMenu) == null ? void 0 : _a.updateItems(this._getProcessedItems());
      return;
    }
    this._applySelection(itemId);
  }
  updateItems(items) {
    var _a;
    this._options.items = items;
    if (this._selectedItemId != null && this._options.mode === "selection") {
      const flat = flattenItems(items);
      const selId = String(this._selectedItemId);
      if (!flat.some((item) => item.id === selId)) {
        this._selectedItemId = null;
        this._updateDisplayLabel();
      }
    }
    (_a = this._actionMenu) == null ? void 0 : _a.updateItems(this._getProcessedItems());
  }
  setLabel(text) {
    this._originalLabel = text;
    if (this._options.mode === "action" || this._selectedItemId == null) {
      if (this._labelEl) this._labelEl.textContent = text;
    }
  }
  setIcon(iconName) {
    var _a;
    if (!iconName) {
      (_a = this._iconEl) == null ? void 0 : _a.remove();
      this._iconEl = null;
      this._options.icon = null;
      return;
    }
    if (this._iconEl) {
      const oldClass = this._options.icon ? `o9con-${this._options.icon}` : null;
      if (oldClass) this._iconEl.classList.remove(oldClass);
      this._iconEl.classList.add(`o9con-${iconName}`);
    } else if (this._element) {
      this._iconEl = document.createElement("span");
      this._iconEl.className = `arvo-dd-btn__icon o9con o9con-${iconName}`;
      this._iconEl.setAttribute("aria-hidden", "true");
      this._element.insertBefore(this._iconEl, this._element.firstChild);
    }
    this._options.icon = iconName;
  }
  setVariant(variant) {
    if (!_ArvoDropdownButton.VARIANTS.includes(variant))
      return;
    const el = this._element;
    if (!el) return;
    _ArvoDropdownButton.VARIANTS.forEach(
      (v) => el.classList.remove(`arvo-btn--${v}`)
    );
    el.classList.add(`arvo-btn--${variant}`);
    this._options.variant = variant;
  }
  setSize(size) {
    if (!_ArvoDropdownButton.SIZES.includes(size)) return;
    const el = this._element;
    if (!el) return;
    _ArvoDropdownButton.SIZES.forEach(
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
        "arvo-dd-btn",
        "arvo-btn",
        "open",
        "loading"
      );
      _ArvoDropdownButton.VARIANTS.forEach(
        (v) => el.classList.remove(`arvo-btn--${v}`)
      );
      _ArvoDropdownButton.SIZES.forEach(
        (s) => el.classList.remove(`arvo-btn--${s}`)
      );
      el.removeAttribute("aria-haspopup");
      el.removeAttribute("aria-controls");
      el.removeAttribute("aria-expanded");
      el.removeAttribute("aria-disabled");
      el.removeAttribute("aria-busy");
      if (el instanceof HTMLButtonElement) {
        el.disabled = false;
      }
      (_e = this._iconEl) == null ? void 0 : _e.remove();
      (_f = this._labelEl) == null ? void 0 : _f.remove();
      (_g = this._caretEl) == null ? void 0 : _g.remove();
    }
    this._element = null;
    this._iconEl = null;
    this._labelEl = null;
    this._caretEl = null;
  }
};
_ArvoDropdownButton.VARIANTS = ["primary", "secondary", "tertiary", "outline"];
_ArvoDropdownButton.SIZES = ["sm", "md", "lg"];
_ArvoDropdownButton.DEFAULTS = {
  label: "",
  variant: "primary",
  size: "md",
  icon: null,
  mode: "action",
  displaySelected: "label",
  value: null,
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
let ArvoDropdownButton = _ArvoDropdownButton;
exports.ArvoDropdownButton = ArvoDropdownButton;
//# sourceMappingURL=DropdownButton.cjs.map
