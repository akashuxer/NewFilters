"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const core = require("@arvo/core");
const Button = require("../Button/Button.cjs");
const IconButton = require("../IconButton/IconButton.cjs");
const ActionMenu = require("../ActionMenu/ActionMenu.cjs");
const _ArvoButtonGroup = class _ArvoButtonGroup {
  constructor(element, options) {
    this._childButtons = [];
    this._childElements = [];
    this._overflowTrigger = null;
    this._overflowTriggerEl = null;
    this._overflowMenu = null;
    this._indicatorEl = null;
    this._indicatorResizeObs = null;
    this._arrowNav = null;
    this._overflowMgr = null;
    this._hiddenValues = /* @__PURE__ */ new Set();
    this._labelMeasureToken = 0;
    this._element = element;
    const variant = (options == null ? void 0 : options.variant) && _ArvoButtonGroup.VARIANTS.includes(options.variant) ? options.variant : _ArvoButtonGroup.DEFAULTS.variant;
    const size = (options == null ? void 0 : options.size) && _ArvoButtonGroup.SIZES.includes(options.size) ? options.size : _ArvoButtonGroup.DEFAULTS.size;
    this._options = {
      ..._ArvoButtonGroup.DEFAULTS,
      ...options,
      variant,
      size,
      items: (options == null ? void 0 : options.items) ?? [],
      value: (options == null ? void 0 : options.value) ?? null,
      overflowMenuProps: (options == null ? void 0 : options.overflowMenuProps) ?? null,
      onChange: (options == null ? void 0 : options.onChange) ?? null
    };
    if (this._options.isMultiSelect) {
      this._options.expandOnSelect = false;
    }
    this._boundHandleKeydown = this._handleKeydown.bind(this);
    this._boundHandleClick = this._handleClick.bind(this);
    this._render();
    this._bindEvents();
  }
  static initialize(element, options) {
    return new _ArvoButtonGroup(element, options);
  }
  // -- Render -------------------------------------------------------------
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    this._childButtons = [];
    this._childElements = [];
    this._hiddenValues = /* @__PURE__ */ new Set();
    const {
      items,
      value: _value,
      variant: _variant,
      size,
      isMultiSelect: _multiSelect,
      isIconOnly,
      hasOverflow,
      expandOnSelect: _expandOnSelect,
      isDisabled,
      isLoading,
      ariaLabel
    } = this._options;
    el.className = this._buildRootClasses();
    el.setAttribute("role", "toolbar");
    el.setAttribute("aria-orientation", "horizontal");
    el.setAttribute("aria-label", ariaLabel);
    if (isLoading) el.setAttribute("aria-busy", "true");
    const buttonSize = size === "sm" ? "sm" : "md";
    for (const item of items) {
      const btnEl = document.createElement("button");
      el.appendChild(btnEl);
      this._childElements.push(btnEl);
      const isActive = this._isItemActive(item.value);
      const isItemDisabled = isDisabled || (item.isDisabled ?? false);
      const useIconOnly = isIconOnly;
      let instance;
      if (useIconOnly || !item.label && item.icon) {
        instance = IconButton.ArvoIconButton.initialize(btnEl, {
          icon: item.icon ?? "",
          tooltip: item.label ?? item.value,
          variant: "tertiary",
          size: buttonSize,
          isDisabled: isItemDisabled,
          isLoading: isLoading && !(item.isExcluded ?? false),
          isSelected: isActive
        });
      } else {
        instance = Button.ArvoButton.initialize(btnEl, {
          label: item.label ?? item.value,
          icon: item.icon ?? null,
          variant: "tertiary",
          size: buttonSize,
          isDisabled: isItemDisabled,
          isLoading: isLoading && !(item.isExcluded ?? false),
          isSelected: isActive
        });
      }
      btnEl.setAttribute("data-value", item.value);
      this._childButtons.push(instance);
    }
    if (hasOverflow) {
      this._mountOverflowTrigger(buttonSize);
    }
    if (!this._options.isMultiSelect) {
      this._indicatorEl = document.createElement("span");
      this._indicatorEl.className = "arvo-btn-grp__ind";
      this._indicatorEl.style.display = "none";
      el.insertBefore(this._indicatorEl, el.firstChild);
      this._indicatorEl.style.transition = "none";
      this._updateIndicator();
      requestAnimationFrame(() => {
        this._updateIndicator();
        requestAnimationFrame(() => {
          if (this._indicatorEl) {
            this._indicatorEl.style.transition = "";
          }
        });
      });
    }
    this._syncRovingTabindex();
    this._setupArrowNav();
    if (hasOverflow) {
      this._setupOverflowManager();
    }
    this._scheduleMeasureLabelWidths();
  }
  // -- Label-width measurement (expand-on-select smoothing) --------------
  //
  // The `.arvo-btn-grp--expand-lbl` modifier transitions each label's
  // `max-width` between `0` and `var(--arvo-btn-grp-lbl-w, 200px)`. The
  // hard 200px fallback is far wider than the typical short button label,
  // so on a class-driven `.active` toggle the segment width stops
  // visibly changing once `max-width` exceeds the content width -- the
  // collapsing label keeps its full visual width almost until the end
  // of the transition, then snaps shut (visible stutter), and during the
  // cross-segment swap the group temporarily bloats wider than the start
  // or end state. Pegging `max-width` to each label's measured natural
  // width restores lockstep: the activating segment grows while the
  // deactivating segment shrinks over identical ranges, total group
  // width stays constant, and the indicator follows the active button
  // smoothly via the existing ResizeObserver.
  _scheduleMeasureLabelWidths() {
    var _a;
    if (!this._options.expandOnSelect || this._options.isMultiSelect) return;
    const token = ++this._labelMeasureToken;
    this._measureLabelWidths();
    if (typeof document !== "undefined" && ((_a = document.fonts) == null ? void 0 : _a.ready)) {
      document.fonts.ready.then(() => {
        if (token !== this._labelMeasureToken) return;
        this._measureLabelWidths();
      }).catch(() => {
      });
    }
  }
  _measureLabelWidths() {
    if (!this._element) return;
    if (!this._options.expandOnSelect || this._options.isMultiSelect) return;
    for (let i = 0; i < this._childElements.length; i++) {
      const btnEl = this._childElements[i];
      if (!btnEl) continue;
      const lblEl = btnEl.querySelector(".arvo-btn__lbl");
      if (!lblEl) {
        btnEl.style.removeProperty("--arvo-btn-grp-lbl-w");
        continue;
      }
      const natural = lblEl.scrollWidth;
      if (natural <= 0) continue;
      const expanded = Math.ceil(natural) + 2;
      btnEl.style.setProperty("--arvo-btn-grp-lbl-w", `${expanded}px`);
    }
  }
  _buildRootClasses() {
    const { variant, size, isMultiSelect, isIconOnly, hasOverflow, expandOnSelect, isDisabled, isLoading } = this._options;
    return [
      "arvo-btn-grp",
      `arvo-btn-grp--${variant}`,
      `arvo-btn-grp--${size}`,
      isMultiSelect && "arvo-btn-grp--multi",
      isIconOnly && "arvo-btn-grp--icon-only",
      hasOverflow && "arvo-btn-grp--overflow",
      expandOnSelect && !isMultiSelect && "arvo-btn-grp--expand-lbl",
      isDisabled && "is-disabled",
      isLoading && "loading"
    ].filter(Boolean).join(" ");
  }
  // -- Events -------------------------------------------------------------
  _bindEvents() {
    var _a, _b;
    (_a = this._element) == null ? void 0 : _a.addEventListener("keydown", this._boundHandleKeydown);
    (_b = this._element) == null ? void 0 : _b.addEventListener("click", this._boundHandleClick);
  }
  _handleKeydown(event) {
    var _a;
    if (this._options.isDisabled || this._options.isLoading) return;
    (_a = this._arrowNav) == null ? void 0 : _a.handleKeyDown(event);
  }
  _handleClick(event) {
    if (this._options.isDisabled || this._options.isLoading) return;
    const target = event.target;
    const btnEl = target.closest("button[data-value]");
    if (!btnEl) return;
    if (btnEl === this._overflowTriggerEl) return;
    const itemValue = btnEl.getAttribute("data-value");
    if (!itemValue) return;
    const item = this._options.items.find((i) => i.value === itemValue);
    if (!item || item.isDisabled || this._options.isDisabled) return;
    if (this._options.isMultiSelect) {
      this._toggleMulti(itemValue);
    } else {
      this._selectSingle(itemValue);
    }
  }
  _selectSingle(newValue) {
    var _a, _b, _c;
    const previousValue = this._options.value;
    if (previousValue === newValue) return;
    this._options.value = newValue;
    this._syncActiveStates();
    this._syncRovingTabindex();
    this._updateIndicator();
    (_a = this._overflowMgr) == null ? void 0 : _a.refresh();
    this._updateOverflowMenuItems();
    const detail = { value: newValue, previousValue };
    this._dispatchEvent("btn-grp:change", detail);
    (_c = (_b = this._options).onChange) == null ? void 0 : _c.call(_b, detail);
  }
  _toggleMulti(itemValue) {
    var _a, _b;
    const currentValues = this._options.value ?? [];
    const previousValue = [...currentValues];
    const idx = currentValues.indexOf(itemValue);
    const isSelected = idx === -1;
    if (isSelected) {
      currentValues.push(itemValue);
    } else {
      currentValues.splice(idx, 1);
    }
    this._options.value = [...currentValues];
    this._syncActiveStates();
    this._syncRovingTabindex();
    this._updateOverflowMenuItems();
    const detail = {
      value: [...currentValues],
      previousValue,
      changedValue: itemValue,
      isSelected
    };
    this._dispatchEvent("btn-grp:change", detail);
    (_b = (_a = this._options).onChange) == null ? void 0 : _b.call(_a, detail);
  }
  // -- State sync ---------------------------------------------------------
  _isItemActive(itemValue) {
    const { value, isMultiSelect } = this._options;
    if (isMultiSelect) {
      return Array.isArray(value) && value.includes(itemValue);
    }
    return value === itemValue;
  }
  _syncActiveStates() {
    const { items } = this._options;
    for (let i = 0; i < items.length; i++) {
      const isActive = this._isItemActive(items[i].value);
      const btn = this._childButtons[i];
      if (btn) {
        btn.selected(isActive);
      }
    }
  }
  _syncIndicatorToButton(activeBtn) {
    if (!this._element || !this._indicatorEl) return false;
    const containerRect = this._element.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const width = btnRect.width;
    if (width === 0) return false;
    this._indicatorEl.style.display = "";
    this._element.style.setProperty(
      "--arvo-btn-grp-ind-x",
      `${btnRect.left - containerRect.left}px`
    );
    this._element.style.setProperty("--arvo-btn-grp-ind-w", `${width}px`);
    return true;
  }
  _updateIndicator() {
    var _a;
    if (!this._indicatorEl || !this._element || this._options.isMultiSelect) return;
    const activeIdx = this._options.items.findIndex((item) => this._isItemActive(item.value));
    if (activeIdx === -1) {
      this._indicatorEl.style.display = "none";
      (_a = this._indicatorResizeObs) == null ? void 0 : _a.disconnect();
      this._indicatorResizeObs = null;
      return;
    }
    const activeBtn = this._childElements[activeIdx];
    if (!activeBtn) return;
    this._syncIndicatorToButton(activeBtn);
    this._watchActiveResize(activeBtn);
  }
  _watchActiveResize(activeBtn) {
    var _a;
    (_a = this._indicatorResizeObs) == null ? void 0 : _a.disconnect();
    if (typeof ResizeObserver === "undefined") return;
    this._indicatorResizeObs = new ResizeObserver(() => {
      this._syncIndicatorToButton(activeBtn);
    });
    if (this._options.expandOnSelect) {
      for (const btn of this._childElements) {
        this._indicatorResizeObs.observe(btn);
      }
    } else {
      this._indicatorResizeObs.observe(activeBtn);
    }
  }
  _syncRovingTabindex() {
    const { items, value, isMultiSelect } = this._options;
    let selectedIdx = -1;
    let firstEnabledIdx = -1;
    for (let i = 0; i < items.length; i++) {
      if (this._hiddenValues.has(items[i].value)) continue;
      const isEnabled = !items[i].isDisabled && !this._options.isDisabled;
      if (isEnabled && firstEnabledIdx === -1) firstEnabledIdx = i;
      if (!isMultiSelect && value === items[i].value && isEnabled) {
        selectedIdx = i;
      } else if (isMultiSelect && Array.isArray(value) && value.includes(items[i].value) && isEnabled) {
        if (selectedIdx === -1) selectedIdx = i;
      }
    }
    const activeIdx = selectedIdx !== -1 ? selectedIdx : firstEnabledIdx;
    for (let i = 0; i < this._childElements.length; i++) {
      this._childElements[i].tabIndex = i === activeIdx ? 0 : -1;
    }
  }
  // -- Arrow Nav ----------------------------------------------------------
  _setupArrowNav() {
    var _a;
    (_a = this._arrowNav) == null ? void 0 : _a.destroy();
    const enabledElements = this._childElements.filter((el, i) => {
      const item = this._options.items[i];
      return !(item == null ? void 0 : item.isDisabled) && !this._options.isDisabled && !this._hiddenValues.has(item.value);
    });
    if (enabledElements.length === 0) {
      this._arrowNav = null;
      return;
    }
    const { isMultiSelect } = this._options;
    this._arrowNav = core.createArrowNav({
      items: enabledElements,
      orientation: "horizontal",
      wrap: true,
      onNavigate: (item, _index) => {
        for (const el of this._childElements) {
          el.tabIndex = -1;
        }
        item.tabIndex = 0;
        item.focus();
        if (!isMultiSelect) {
          const val = item.getAttribute("data-value");
          if (val) this._selectSingle(val);
        }
      },
      onSelect: (item) => {
        const val = item.getAttribute("data-value");
        if (!val) return;
        if (isMultiSelect) {
          this._toggleMulti(val);
        } else {
          this._selectSingle(val);
        }
      }
    });
  }
  // -- Overflow -----------------------------------------------------------
  _mountOverflowTrigger(buttonSize) {
    const el = this._element;
    if (!el) return;
    this._overflowTriggerEl = document.createElement("button");
    el.appendChild(this._overflowTriggerEl);
    this._overflowTriggerEl.className = "arvo-btn-grp__overflow";
    this._overflowTriggerEl.style.display = "none";
    this._overflowTrigger = IconButton.ArvoIconButton.initialize(this._overflowTriggerEl, {
      icon: "ellipsis-v",
      tooltip: "More actions",
      variant: "tertiary",
      size: buttonSize,
      isDisabled: this._options.isDisabled
    });
    this._overflowMenu = ActionMenu.ArvoActionMenu.initialize(this._overflowTriggerEl, {
      ...this._options.overflowMenuProps ?? void 0,
      items: this._buildOverflowMenuItems(),
      placement: "bottom-end",
      closeOnSelect: true,
      isDisabled: this._options.isDisabled || this._options.isLoading,
      onSelect: (item) => {
        if (item.isDisabled) return;
        if (this._options.isMultiSelect) {
          this._toggleMulti(item.id);
        } else {
          this._selectSingle(item.id);
        }
      }
    });
  }
  _buildOverflowMenuItems() {
    return this._options.items.filter((item) => this._hiddenValues.has(item.value)).map((item) => ({
      id: item.value,
      label: item.label ?? item.value,
      icon: item.icon,
      isDisabled: item.isDisabled,
      active: this._isItemActive(item.value)
    }));
  }
  _updateOverflowMenuItems() {
    var _a;
    (_a = this._overflowMenu) == null ? void 0 : _a.updateItems(this._buildOverflowMenuItems());
  }
  _setupOverflowManager() {
    var _a;
    if (!this._element || !this._options.hasOverflow) return;
    (_a = this._overflowMgr) == null ? void 0 : _a.destroy();
    this._overflowMgr = core.createOverflowManager({
      container: this._element,
      // Detect overflow against the PARENT element's width so the
      // button-group root itself can stay `inline-flex` (content-sized)
      // and the trigger sits flush with the last visible segment -- no
      // whitespace inside the group when there's room for the full
      // toolbar, and seamless growth/shrink as the parent resizes.
      // Falls back to the root when the component is detached.
      boundary: this._element.parentElement ?? this._element,
      getItems: () => {
        const out = [];
        for (let i = 0; i < this._options.items.length; i++) {
          const itemEl = this._childElements[i];
          if (itemEl) out.push({ id: this._options.items[i].value, el: itemEl });
        }
        return out;
      },
      getTriggerWidth: () => {
        var _a2;
        return ((_a2 = this._overflowTriggerEl) == null ? void 0 : _a2.offsetWidth) ?? 0;
      },
      getPromotedId: () => !this._options.isMultiSelect && typeof this._options.value === "string" ? this._options.value : null,
      onChange: (hidden) => {
        this._hiddenValues = hidden;
        if (this._overflowTriggerEl) {
          const hasHidden = hidden.size > 0;
          this._overflowTriggerEl.style.display = hasHidden ? "" : "none";
          if (hasHidden) {
            this._overflowTriggerEl.removeAttribute("aria-hidden");
          } else {
            this._overflowTriggerEl.setAttribute("aria-hidden", "true");
          }
        }
        for (let i = 0; i < this._options.items.length; i++) {
          if (this._hiddenValues.has(this._options.items[i].value)) {
            const itemEl = this._childElements[i];
            if (itemEl) itemEl.tabIndex = -1;
          }
        }
        this._syncRovingTabindex();
        this._setupArrowNav();
        this._updateOverflowMenuItems();
        this._updateIndicator();
      }
    });
  }
  _dispatchEvent(eventName, detail) {
    var _a;
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(eventName, { bubbles: true, cancelable: true, detail })
    );
  }
  value(newValue) {
    var _a, _b, _c;
    if (newValue === void 0) return this._options.value;
    if (!this._element) return;
    const previousValue = this._options.value;
    this._options.value = newValue;
    this._syncActiveStates();
    this._syncRovingTabindex();
    this._updateIndicator();
    (_a = this._overflowMgr) == null ? void 0 : _a.refresh();
    this._updateOverflowMenuItems();
    const detail = {
      value: newValue,
      previousValue
    };
    this._dispatchEvent("btn-grp:change", detail);
    (_c = (_b = this._options).onChange) == null ? void 0 : _c.call(_b, detail);
  }
  disabled(state) {
    var _a, _b;
    if (state === void 0) return this._options.isDisabled;
    if (!this._element) return;
    this._options.isDisabled = state;
    this._element.classList.toggle("is-disabled", state);
    for (const btn of this._childButtons) {
      btn.disabled(state);
    }
    (_a = this._overflowTrigger) == null ? void 0 : _a.disabled(state);
    (_b = this._overflowMenu) == null ? void 0 : _b.disabled(state);
  }
  setVariant(variant) {
    if (!_ArvoButtonGroup.VARIANTS.includes(variant)) return;
    const el = this._element;
    if (!el) return;
    _ArvoButtonGroup.VARIANTS.forEach((v) => el.classList.remove(`arvo-btn-grp--${v}`));
    el.classList.add(`arvo-btn-grp--${variant}`);
    this._options.variant = variant;
  }
  setLoading(isLoading) {
    var _a, _b;
    if (!this._element) return;
    this._options.isLoading = isLoading;
    this._element.classList.toggle("loading", isLoading);
    if (isLoading) {
      this._element.setAttribute("aria-busy", "true");
    } else {
      this._element.removeAttribute("aria-busy");
    }
    for (let i = 0; i < this._childButtons.length; i++) {
      const item = this._options.items[i];
      if (item == null ? void 0 : item.isExcluded) continue;
      this._childButtons[i].setLoading(isLoading);
    }
    (_a = this._overflowTrigger) == null ? void 0 : _a.setLoading(isLoading);
    (_b = this._overflowMenu) == null ? void 0 : _b.setLoading(isLoading);
  }
  setItems(items) {
    if (!this._element) return;
    this._element.removeEventListener("keydown", this._boundHandleKeydown);
    this._element.removeEventListener("click", this._boundHandleClick);
    this._options.items = items;
    this._options.value = this._options.isMultiSelect ? [] : null;
    this._destroyChildren();
    this._destroyOverflow();
    this._render();
    this._bindEvents();
  }
  focus() {
    const selectedIdx = this._childElements.findIndex((el) => el.tabIndex === 0);
    if (selectedIdx !== -1) {
      this._childElements[selectedIdx].focus();
    }
  }
  destroy() {
    var _a, _b, _c, _d;
    this._labelMeasureToken++;
    (_a = this._arrowNav) == null ? void 0 : _a.destroy();
    this._arrowNav = null;
    (_b = this._overflowMgr) == null ? void 0 : _b.destroy();
    this._overflowMgr = null;
    (_c = this._indicatorResizeObs) == null ? void 0 : _c.disconnect();
    this._indicatorResizeObs = null;
    (_d = this._indicatorEl) == null ? void 0 : _d.remove();
    this._indicatorEl = null;
    this._destroyOverflow();
    this._destroyChildren();
    if (this._element) {
      this._element.removeEventListener("keydown", this._boundHandleKeydown);
      this._element.removeEventListener("click", this._boundHandleClick);
      this._element.textContent = "";
      this._element.removeAttribute("role");
      this._element.removeAttribute("aria-orientation");
      this._element.removeAttribute("aria-label");
      this._element.removeAttribute("aria-busy");
      this._element.className = "";
    }
    this._element = null;
  }
  _destroyChildren() {
    for (const btn of this._childButtons) {
      btn.destroy();
    }
    this._childButtons = [];
    this._childElements = [];
  }
  _destroyOverflow() {
    if (this._overflowMenu) {
      this._overflowMenu.destroy();
      this._overflowMenu = null;
    }
    if (this._overflowTrigger) {
      this._overflowTrigger.destroy();
      this._overflowTrigger = null;
    }
    if (this._overflowTriggerEl) {
      this._overflowTriggerEl.remove();
      this._overflowTriggerEl = null;
    }
    this._hiddenValues = /* @__PURE__ */ new Set();
  }
};
_ArvoButtonGroup.VARIANTS = ["primary", "secondary", "outline"];
_ArvoButtonGroup.SIZES = ["sm", "lg"];
_ArvoButtonGroup.DEFAULTS = {
  items: [],
  value: null,
  variant: "primary",
  size: "lg",
  isMultiSelect: false,
  isIconOnly: false,
  hasOverflow: false,
  expandOnSelect: false,
  isDisabled: false,
  isLoading: false,
  ariaLabel: "",
  overflowMenuProps: null,
  onChange: null
};
let ArvoButtonGroup = _ArvoButtonGroup;
exports.ArvoButtonGroup = ArvoButtonGroup;
//# sourceMappingURL=ButtonGroup.cjs.map
