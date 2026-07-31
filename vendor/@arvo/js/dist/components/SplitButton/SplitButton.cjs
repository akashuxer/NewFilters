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
const _ArvoSplitButton = class _ArvoSplitButton {
  constructor(element, options) {
    var _a;
    this._actionEl = null;
    this._triggerEl = null;
    this._iconEl = null;
    this._labelEl = null;
    this._caretEl = null;
    this._actionMenu = null;
    this._externalOverlay = null;
    this._selectedItemId = null;
    this._isOpen = false;
    this._ariaExpandedObserver = null;
    this._activeSegment = "action";
    this._element = element;
    const variant = (options == null ? void 0 : options.variant) && _ArvoSplitButton.VARIANTS.includes(options.variant) ? options.variant : _ArvoSplitButton.DEFAULTS.variant;
    const size = (options == null ? void 0 : options.size) && _ArvoSplitButton.SIZES.includes(options.size) ? options.size : _ArvoSplitButton.DEFAULTS.size;
    this._options = {
      ..._ArvoSplitButton.DEFAULTS,
      ...options,
      variant,
      size,
      label: (options == null ? void 0 : options.label) ?? _ArvoSplitButton.DEFAULTS.label,
      icon: (options == null ? void 0 : options.icon) ?? null,
      maxHeight: (options == null ? void 0 : options.maxHeight) ?? null,
      items: (options == null ? void 0 : options.items) ?? [],
      menuProps: (options == null ? void 0 : options.menuProps) ?? null,
      overlay: (options == null ? void 0 : options.overlay) ?? null,
      isOpen: (options == null ? void 0 : options.isOpen) ?? null,
      onAction: (options == null ? void 0 : options.onAction) ?? null,
      onSelect: (options == null ? void 0 : options.onSelect) ?? null,
      onOpen: (options == null ? void 0 : options.onOpen) ?? null,
      onClose: (options == null ? void 0 : options.onClose) ?? null,
      onOpenChange: (options == null ? void 0 : options.onOpenChange) ?? null,
      onFocus: (options == null ? void 0 : options.onFocus) ?? null,
      onBlur: (options == null ? void 0 : options.onBlur) ?? null
    };
    const hasItems = Array.isArray(options == null ? void 0 : options.items) && options.items.length > 0;
    const hasMenuProps = (options == null ? void 0 : options.menuProps) != null;
    this._isExternalMode = this._options.overlay != null || !hasItems && !hasMenuProps;
    if (this._isExternalMode && this._options.mode === "selection" && typeof process !== "undefined" && ((_a = process.env) == null ? void 0 : _a.NODE_ENV) !== "production") {
      console.warn(
        'ArvoSplitButton: `mode: "selection"` is only supported with the default internal ArvoActionMenu composition. Falling back to `mode: "action"`. To update the action segment label from an external overlay, call your overlay\'s callback with whatever payload makes sense and update the label via setLabel() yourself.'
      );
      this._options.mode = "action";
    }
    this._selectedItemId = (options == null ? void 0 : options.value) !== void 0 ? options.value ?? null : (options == null ? void 0 : options.defaultValue) !== void 0 ? options.defaultValue ?? null : null;
    this._boundHandleActionClick = this._handleActionClick.bind(this);
    this._boundHandleTriggerClick = this._handleTriggerClick.bind(this);
    this._boundHandleActionKeydown = this._handleActionKeydown.bind(this);
    this._boundHandleActionFocus = this._handleActionFocus.bind(this);
    this._boundHandleActionBlur = this._handleActionBlur.bind(this);
    this._boundHandleWrapperKeydown = this._handleWrapperKeydown.bind(this);
    this._boundHandleWrapperFocusin = this._handleWrapperFocusin.bind(this);
    this._render();
    this._bindEvents();
    if (this._isExternalMode) {
      this._initExternalOverlay();
    } else {
      this._initActionMenu();
    }
    if (this._isExternalMode && this._options.isOpen === true) {
      this.setOpenState(true);
    }
  }
  static initialize(element, options) {
    return new _ArvoSplitButton(element, options);
  }
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    el.classList.add("arvo-split-btn");
    el.classList.add(`arvo-split-btn--${this._options.variant}`);
    el.classList.add(`arvo-split-btn--${this._options.size}`);
    el.setAttribute("role", "group");
    const actionEl = document.createElement("button");
    actionEl.type = "button";
    actionEl.className = `arvo-btn arvo-btn--${this._options.variant} arvo-btn--${this._options.size} arvo-split-btn__action`;
    this._actionEl = actionEl;
    const initialIcon = this._resolveDisplayIcon();
    if (initialIcon) {
      const iconEl = document.createElement("span");
      iconEl.className = `arvo-split-btn__icon o9con o9con-${initialIcon}`;
      iconEl.setAttribute("aria-hidden", "true");
      actionEl.appendChild(iconEl);
      this._iconEl = iconEl;
    }
    const labelEl = document.createElement("span");
    labelEl.className = "arvo-split-btn__lbl";
    labelEl.textContent = this._resolveDisplayLabel();
    actionEl.appendChild(labelEl);
    this._labelEl = labelEl;
    const triggerEl = document.createElement("button");
    triggerEl.type = "button";
    triggerEl.className = `arvo-btn arvo-btn--${this._options.variant} arvo-btn--${this._options.size} arvo-split-btn__trigger`;
    triggerEl.setAttribute("aria-label", this._options.triggerLabel);
    this._triggerEl = triggerEl;
    const caretEl = document.createElement("span");
    caretEl.className = "arvo-split-btn__caret o9con o9con-angle-down";
    caretEl.setAttribute("aria-hidden", "true");
    triggerEl.appendChild(caretEl);
    this._caretEl = caretEl;
    el.appendChild(actionEl);
    el.appendChild(triggerEl);
    this._applySegmentDisabled();
    if (this._options.isLoading) {
      el.classList.add("loading");
      el.setAttribute("aria-busy", "true");
    }
    if (this._options.isDisabled) {
      el.setAttribute("aria-disabled", "true");
    }
  }
  _applySegmentDisabled() {
    if (this._actionEl) {
      this._actionEl.disabled = this._options.isDisabled || this._options.isActionDisabled || this._options.isLoading;
    }
    if (this._triggerEl) {
      this._triggerEl.disabled = this._options.isDisabled || this._options.isTriggerDisabled || this._options.isLoading;
    }
    this._applyRovingTabindex();
  }
  // ---------------------------------------------------------------------------
  // Roving tabindex
  // ---------------------------------------------------------------------------
  _isActionDisabled() {
    return this._options.isDisabled || this._options.isActionDisabled || this._options.isLoading;
  }
  _isTriggerDisabled() {
    return this._options.isDisabled || this._options.isTriggerDisabled || this._options.isLoading;
  }
  _effectiveActiveSegment() {
    const actionOff = this._isActionDisabled();
    const triggerOff = this._isTriggerDisabled();
    if (this._activeSegment === "action" && actionOff && !triggerOff)
      return "trigger";
    if (this._activeSegment === "trigger" && triggerOff && !actionOff)
      return "action";
    return this._activeSegment;
  }
  _applyRovingTabindex() {
    const active = this._effectiveActiveSegment();
    if (this._actionEl) {
      const tabIdx = this._isActionDisabled() || active !== "action" ? -1 : 0;
      this._actionEl.tabIndex = tabIdx;
    }
    if (this._triggerEl) {
      const tabIdx = this._isTriggerDisabled() || active !== "trigger" ? -1 : 0;
      this._triggerEl.tabIndex = tabIdx;
    }
  }
  _setActiveSegment(next) {
    this._activeSegment = next;
    this._applyRovingTabindex();
  }
  _focusSegment(next) {
    this._setActiveSegment(next);
    const target = next === "action" ? this._actionEl : this._triggerEl;
    target == null ? void 0 : target.focus({ preventScroll: true });
  }
  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  _bindEvents() {
    var _a, _b, _c, _d, _e, _f, _g;
    (_a = this._actionEl) == null ? void 0 : _a.addEventListener("click", this._boundHandleActionClick);
    (_b = this._actionEl) == null ? void 0 : _b.addEventListener("keydown", this._boundHandleActionKeydown);
    (_c = this._actionEl) == null ? void 0 : _c.addEventListener("focus", this._boundHandleActionFocus);
    (_d = this._actionEl) == null ? void 0 : _d.addEventListener("blur", this._boundHandleActionBlur);
    (_e = this._triggerEl) == null ? void 0 : _e.addEventListener("click", this._boundHandleTriggerClick);
    (_f = this._element) == null ? void 0 : _f.addEventListener("keydown", this._boundHandleWrapperKeydown);
    (_g = this._element) == null ? void 0 : _g.addEventListener("focusin", this._boundHandleWrapperFocusin);
  }
  _handleActionClick(event) {
    var _a, _b, _c, _d;
    if (!this._actionEl || this._actionEl.disabled || this._options.isLoading) {
      return;
    }
    if (this._options.mode === "selection") {
      const selectedItem = this._getSelectedItem();
      if (selectedItem) {
        const flat = flattenItems(this._options.items);
        const currentIndex = flat.findIndex((i) => i.id === selectedItem.id);
        this._dispatchEvent("split-btn:action", { selectedItem });
        (_b = (_a = this._options).onSelect) == null ? void 0 : _b.call(_a, selectedItem, currentIndex);
        return;
      }
    }
    this._dispatchEvent("split-btn:action", { selectedItem: null });
    (_d = (_c = this._options).onAction) == null ? void 0 : _d.call(_c, event, null);
  }
  _handleTriggerClick(event) {
    if (!this._triggerEl || this._triggerEl.disabled || this._options.isLoading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }
  _handleActionKeydown(event) {
    if ((event.key === "Enter" || event.key === " ") && (this._options.isDisabled || this._options.isActionDisabled || this._options.isLoading)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  _handleActionFocus(event) {
    var _a, _b;
    (_b = (_a = this._options).onFocus) == null ? void 0 : _b.call(_a, event);
  }
  _handleActionBlur(event) {
    var _a, _b;
    (_b = (_a = this._options).onBlur) == null ? void 0 : _b.call(_a, event);
  }
  /**
   * Wrapper-level keydown -- composite-widget keyboard model.
   *
   * ArrowLeft / ArrowRight / Home / End move the rover between the action
   * and trigger segments (roving tabindex). ArrowDown / Alt+ArrowDown on
   * either segment opens the menu (focus-trap moves into the first item).
   * The open-menu shortcut works even if the trigger segment itself is
   * disabled, because the menu only needs the trigger element as an anchor
   * for positioning + focus return -- not as an interactive surface.
   *
   * In external mode ArrowDown synthesizes a click on the caret segment
   * so any click-trigger overlay opens; consumers using non-click overlays
   * should drive the open state via the controlled `isOpen` option.
   */
  _handleWrapperKeydown(event) {
    var _a, _b, _c;
    if (event.defaultPrevented) return;
    const target = event.target;
    const onAction = target === this._actionEl;
    const onTrigger = target === this._triggerEl;
    if (!onAction && !onTrigger) return;
    const { key, altKey } = event;
    const actionOff = this._isActionDisabled();
    const triggerOff = this._isTriggerDisabled();
    if (key === "ArrowDown" || altKey && key === "ArrowDown") {
      if (actionOff && triggerOff) return;
      event.preventDefault();
      if (this._isExternalMode) {
        if ((_a = this._externalOverlay) == null ? void 0 : _a.open) {
          this._externalOverlay.open();
        } else {
          (_b = this._triggerEl) == null ? void 0 : _b.click();
        }
      } else {
        (_c = this._actionMenu) == null ? void 0 : _c.open();
      }
      return;
    }
    if (key === "ArrowRight" && onAction) {
      if (triggerOff) return;
      event.preventDefault();
      this._focusSegment("trigger");
      return;
    }
    if (key === "ArrowLeft" && onTrigger) {
      if (actionOff) return;
      event.preventDefault();
      this._focusSegment("action");
      return;
    }
    if (key === "Home") {
      if (actionOff) return;
      event.preventDefault();
      this._focusSegment("action");
      return;
    }
    if (key === "End") {
      if (triggerOff) return;
      event.preventDefault();
      this._focusSegment("trigger");
      return;
    }
  }
  _handleWrapperFocusin(event) {
    const target = event.target;
    if (target === this._actionEl) this._setActiveSegment("action");
    else if (target === this._triggerEl) this._setActiveSegment("trigger");
  }
  // ---------------------------------------------------------------------------
  // ActionMenu Init (internal mode)
  // ---------------------------------------------------------------------------
  _initActionMenu() {
    if (!this._triggerEl) return;
    const menuOptions = {
      ...this._options.menuProps ?? void 0,
      items: this._getProcessedItems(),
      search: this._options.search,
      placement: this._options.placement,
      maxHeight: this._options.maxHeight ?? void 0,
      hasGroupDividers: this._options.hasGroupDividers,
      closeOnSelect: this._options.closeOnSelect,
      isDisabled: this._options.isDisabled || this._options.isTriggerDisabled || this._options.isLoading,
      onOpen: this._options.onOpen ?? void 0,
      onClose: this._options.onClose ?? void 0,
      onSelect: (item, index) => this._handleSelect(item, index),
      onOpenChange: (isOpen) => this.setOpenState(isOpen)
    };
    this._actionMenu = ActionMenu.ArvoActionMenu.initialize(this._triggerEl, menuOptions);
  }
  // ---------------------------------------------------------------------------
  // External overlay init
  // ---------------------------------------------------------------------------
  _initExternalOverlay() {
    var _a;
    if (!this._triggerEl) return;
    if (this._options.overlay) {
      try {
        this._externalOverlay = this._options.overlay(this._triggerEl);
      } catch (err) {
        if (typeof process !== "undefined" && ((_a = process.env) == null ? void 0 : _a.NODE_ENV) !== "production") {
          console.error(
            "ArvoSplitButton: overlay factory threw while initializing.",
            err
          );
        }
      }
    }
    if (this._options.isOpen == null && typeof MutationObserver !== "undefined") {
      this._ariaExpandedObserver = new MutationObserver(() => {
        var _a2;
        const value = (_a2 = this._triggerEl) == null ? void 0 : _a2.getAttribute("aria-expanded");
        this.setOpenState(value === "true");
      });
      this._ariaExpandedObserver.observe(this._triggerEl, {
        attributes: true,
        attributeFilter: ["aria-expanded"]
      });
    }
  }
  // ---------------------------------------------------------------------------
  // Selection Logic (internal mode only)
  // ---------------------------------------------------------------------------
  _getSelectedItem() {
    if (this._selectedItemId == null) return null;
    const flat = flattenItems(this._options.items);
    const id = String(this._selectedItemId);
    return flat.find((item) => item.id === id) ?? null;
  }
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
      const previousItem = this._getSelectedItem();
      this._selectedItemId = item.id;
      this._updateDisplayLabelAndIcon();
      (_a = this._actionMenu) == null ? void 0 : _a.updateItems(this._getProcessedItems());
      this._dispatchEvent(
        "split-btn:change",
        { item, previousItem },
        false
      );
    } else {
      this._dispatchEvent("split-btn:select", { item, index });
    }
    return (_c = (_b = this._options).onSelect) == null ? void 0 : _c.call(_b, item, index);
  }
  // ---------------------------------------------------------------------------
  // Display Label / Icon Resolution
  // ---------------------------------------------------------------------------
  _resolveDisplayLabel() {
    if (this._options.mode === "action" || this._selectedItemId == null) {
      return this._options.label;
    }
    const selectedItem = this._getSelectedItem();
    if (!selectedItem) return this._options.label;
    if (this._options.displaySelected === "value") {
      const val = selectedItem.value;
      return val != null ? String(val) : selectedItem.id;
    }
    return selectedItem.label;
  }
  _resolveDisplayIcon() {
    if (this._options.mode === "action") return this._options.icon;
    const selectedItem = this._getSelectedItem();
    return (selectedItem == null ? void 0 : selectedItem.icon) ?? this._options.icon;
  }
  _updateDisplayLabelAndIcon() {
    if (this._labelEl) {
      this._labelEl.textContent = this._resolveDisplayLabel();
    }
    this._setRenderedIcon(this._resolveDisplayIcon());
  }
  _setRenderedIcon(iconName) {
    var _a;
    if (!this._actionEl) return;
    if (!iconName) {
      (_a = this._iconEl) == null ? void 0 : _a.remove();
      this._iconEl = null;
      return;
    }
    const existing = this._iconEl;
    if (existing) {
      const toRemove = [];
      existing.classList.forEach((c) => {
        if (c.startsWith("o9con-")) toRemove.push(c);
      });
      toRemove.forEach((c) => existing.classList.remove(c));
      existing.classList.add(`o9con-${iconName}`);
      return;
    }
    const iconEl = document.createElement("span");
    iconEl.className = `arvo-split-btn__icon o9con o9con-${iconName}`;
    iconEl.setAttribute("aria-hidden", "true");
    this._actionEl.insertBefore(iconEl, this._actionEl.firstChild);
    this._iconEl = iconEl;
  }
  _applySelection(itemId) {
    var _a;
    this._selectedItemId = itemId;
    this._updateDisplayLabelAndIcon();
    (_a = this._actionMenu) == null ? void 0 : _a.updateItems(this._getProcessedItems());
  }
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  _dispatchEvent(name, detail, cancelable = true) {
    var _a;
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(name, { bubbles: true, cancelable, detail })
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
        (_b = this._triggerEl) == null ? void 0 : _b.click();
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
        (_b = this._triggerEl) == null ? void 0 : _b.click();
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
        (_b = this._triggerEl) == null ? void 0 : _b.click();
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
   * Returns the CARET (trigger) segment so a consumer-composed external
   * overlay can anchor against it. NOT the action segment -- using the
   * action segment as an overlay anchor would misalign the popover.
   * Returns null after destroy().
   */
  triggerElement() {
    return this._triggerEl;
  }
  /**
   * Manually flip the wrapper's open chrome state. Idempotent -- no-op on
   * transitions to the current state. Called automatically when the wrapper
   * observes `aria-expanded` changes on the caret segment.
   */
  setOpenState(open) {
    var _a, _b, _c;
    if (this._isOpen === open) return;
    this._isOpen = open;
    (_a = this._element) == null ? void 0 : _a.classList.toggle("open", open);
    if (open) {
      this._dispatchEvent("split-btn:open", {});
    } else {
      this._dispatchEvent("split-btn:close", {});
    }
    (_c = (_b = this._options).onOpenChange) == null ? void 0 : _c.call(_b, open);
  }
  value(itemId) {
    var _a;
    if (itemId === void 0) {
      if (this._options.mode !== "selection" || this._selectedItemId == null) {
        return null;
      }
      return this._getSelectedItem();
    }
    if (this._options.mode !== "selection") return;
    if (itemId == null) {
      this._selectedItemId = null;
      this._updateDisplayLabelAndIcon();
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
      }
    }
    (_a = this._actionMenu) == null ? void 0 : _a.updateItems(this._getProcessedItems());
    this._updateDisplayLabelAndIcon();
  }
  setLabel(text) {
    this._options.label = text;
    this._updateDisplayLabelAndIcon();
  }
  setIcon(iconName) {
    this._options.icon = iconName;
    this._updateDisplayLabelAndIcon();
  }
  setVariant(variant) {
    var _a, _b;
    if (!_ArvoSplitButton.VARIANTS.includes(variant))
      return;
    const oldVariant = this._options.variant;
    (_a = this._element) == null ? void 0 : _a.classList.remove(`arvo-split-btn--${oldVariant}`);
    (_b = this._element) == null ? void 0 : _b.classList.add(`arvo-split-btn--${variant}`);
    if (this._actionEl) {
      this._actionEl.classList.remove(`arvo-btn--${oldVariant}`);
      this._actionEl.classList.add(`arvo-btn--${variant}`);
    }
    if (this._triggerEl) {
      this._triggerEl.classList.remove(`arvo-btn--${oldVariant}`);
      this._triggerEl.classList.add(`arvo-btn--${variant}`);
    }
    this._options.variant = variant;
  }
  setSize(size) {
    var _a, _b;
    if (!_ArvoSplitButton.SIZES.includes(size)) return;
    const oldSize = this._options.size;
    (_a = this._element) == null ? void 0 : _a.classList.remove(`arvo-split-btn--${oldSize}`);
    (_b = this._element) == null ? void 0 : _b.classList.add(`arvo-split-btn--${size}`);
    if (this._actionEl) {
      this._actionEl.classList.remove(`arvo-btn--${oldSize}`);
      this._actionEl.classList.add(`arvo-btn--${size}`);
    }
    if (this._triggerEl) {
      this._triggerEl.classList.remove(`arvo-btn--${oldSize}`);
      this._triggerEl.classList.add(`arvo-btn--${size}`);
    }
    this._options.size = size;
  }
  setLoading(loading) {
    var _a;
    this._options.isLoading = loading;
    const el = this._element;
    if (el) {
      if (loading) {
        el.classList.add("loading");
        el.setAttribute("aria-busy", "true");
      } else {
        el.classList.remove("loading");
        el.removeAttribute("aria-busy");
      }
    }
    this._applySegmentDisabled();
    (_a = this._actionMenu) == null ? void 0 : _a.disabled(
      this._options.isDisabled || this._options.isTriggerDisabled || loading
    );
  }
  disabled(state) {
    var _a;
    if (state === void 0) {
      return this._options.isDisabled;
    }
    this._options.isDisabled = state;
    this._applySegmentDisabled();
    if (this._element) {
      if (state) {
        this._element.setAttribute("aria-disabled", "true");
      } else {
        this._element.removeAttribute("aria-disabled");
      }
    }
    (_a = this._actionMenu) == null ? void 0 : _a.disabled(
      state || this._options.isTriggerDisabled || this._options.isLoading
    );
  }
  actionDisabled(state) {
    if (state === void 0) {
      return this._options.isActionDisabled;
    }
    this._options.isActionDisabled = state;
    this._applySegmentDisabled();
  }
  triggerDisabled(state) {
    var _a;
    if (state === void 0) {
      return this._options.isTriggerDisabled;
    }
    this._options.isTriggerDisabled = state;
    this._applySegmentDisabled();
    (_a = this._actionMenu) == null ? void 0 : _a.disabled(
      this._options.isDisabled || state || this._options.isLoading
    );
  }
  focus() {
    var _a;
    (_a = this._actionEl) == null ? void 0 : _a.focus();
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    (_a = this._actionMenu) == null ? void 0 : _a.destroy();
    this._actionMenu = null;
    (_c = (_b = this._externalOverlay) == null ? void 0 : _b.destroy) == null ? void 0 : _c.call(_b);
    this._externalOverlay = null;
    (_d = this._ariaExpandedObserver) == null ? void 0 : _d.disconnect();
    this._ariaExpandedObserver = null;
    if (this._actionEl) {
      this._actionEl.removeEventListener("click", this._boundHandleActionClick);
      this._actionEl.removeEventListener("keydown", this._boundHandleActionKeydown);
      this._actionEl.removeEventListener("focus", this._boundHandleActionFocus);
      this._actionEl.removeEventListener("blur", this._boundHandleActionBlur);
    }
    if (this._triggerEl) {
      this._triggerEl.removeEventListener("click", this._boundHandleTriggerClick);
    }
    const el = this._element;
    if (el) {
      el.removeEventListener("keydown", this._boundHandleWrapperKeydown);
      el.removeEventListener("focusin", this._boundHandleWrapperFocusin);
      el.classList.remove("arvo-split-btn", "open", "loading");
      _ArvoSplitButton.VARIANTS.forEach(
        (v) => el.classList.remove(`arvo-split-btn--${v}`)
      );
      _ArvoSplitButton.SIZES.forEach(
        (s) => el.classList.remove(`arvo-split-btn--${s}`)
      );
      el.removeAttribute("role");
      el.removeAttribute("aria-disabled");
      el.removeAttribute("aria-busy");
      (_e = this._iconEl) == null ? void 0 : _e.remove();
      (_f = this._labelEl) == null ? void 0 : _f.remove();
      (_g = this._caretEl) == null ? void 0 : _g.remove();
      (_h = this._actionEl) == null ? void 0 : _h.remove();
      (_i = this._triggerEl) == null ? void 0 : _i.remove();
    }
    this._element = null;
    this._actionEl = null;
    this._triggerEl = null;
    this._iconEl = null;
    this._labelEl = null;
    this._caretEl = null;
  }
};
_ArvoSplitButton.VARIANTS = ["primary", "secondary", "tertiary"];
_ArvoSplitButton.SIZES = ["sm", "md", "lg"];
_ArvoSplitButton.DEFAULTS = {
  label: "",
  variant: "primary",
  size: "md",
  icon: null,
  mode: "action",
  displaySelected: "label",
  value: null,
  isDisabled: false,
  isActionDisabled: false,
  isTriggerDisabled: false,
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
  triggerLabel: "Show options",
  onAction: null,
  onSelect: null,
  onOpen: null,
  onClose: null,
  onOpenChange: null,
  onFocus: null,
  onBlur: null
};
let ArvoSplitButton = _ArvoSplitButton;
exports.ArvoSplitButton = ArvoSplitButton;
//# sourceMappingURL=SplitButton.cjs.map
