import { createSortableList, getFocusableElements } from "@arvo/core";
import { ArvoChip } from "../Chip/Chip.js";
import { ArvoDisclosureButton } from "../DisclosureButton/DisclosureButton.js";
function hideChipEl(el) {
  el.style.visibility = "hidden";
  el.style.position = "absolute";
  el.style.pointerEvents = "none";
  el.setAttribute("tabindex", "-1");
}
function showChipEl(el) {
  el.style.visibility = "";
  el.style.position = "";
  el.style.pointerEvents = "";
  if (el.getAttribute("tabindex") === "-1") el.removeAttribute("tabindex");
}
const _ArvoChipList = class _ArvoChipList {
  constructor(element, options = {}) {
    this._chips = [];
    this._overflowEl = null;
    this._overflowBtn = null;
    this._liveRegionEl = null;
    this._resizeObserver = null;
    this._sortable = null;
    this._selectedSet = /* @__PURE__ */ new Set();
    this._hiddenCount = 0;
    this._isExpanded = false;
    this._expansionOptIn = false;
    this._pointerReorder = false;
    this._activeKey = null;
    this.el = element;
    const variant = options.variant ?? _ArvoChipList.DEFAULTS.variant;
    this._options = {
      ..._ArvoChipList.DEFAULTS,
      ...options,
      items: options.items ?? [],
      // selectionMode resolves from variant when unset: general/input -> none,
      // filter -> multiple (mirror React).
      selectionMode: options.selectionMode ?? (variant === "filter" ? "multiple" : "none"),
      selectedKeys: options.selectedKeys ?? null,
      defaultSelectedKeys: options.defaultSelectedKeys ?? null,
      maxRows: options.maxRows ?? null,
      ariaLabel: options.ariaLabel ?? null,
      ariaLabelledBy: options.ariaLabelledBy ?? null,
      overflowLabel: options.overflowLabel ?? null,
      overflowAriaLabel: options.overflowAriaLabel ?? null,
      expandedLabel: options.expandedLabel ?? null,
      onSelectionChange: options.onSelectionChange ?? null,
      onReorder: options.onReorder ?? null,
      onOverflowPress: options.onOverflowPress ?? null,
      onExpandedChange: options.onExpandedChange ?? null
    };
    const seed = options.selectedKeys ?? options.defaultSelectedKeys ?? [];
    this._selectedSet = new Set(seed.map((k) => String(k)));
    this._isExpanded = options.isExpanded !== void 0 ? options.isExpanded : options.defaultExpanded ?? false;
    this._expansionOptIn = this._options.isStaticOverflow !== true && (options.isExpanded !== void 0 || options.defaultExpanded !== void 0 || options.onExpandedChange !== void 0 || options.expandedLabel !== void 0 || this._options.isWithinField === true);
    this._boundOverflowClick = (event) => this._handleOverflowPress(event);
    this._boundOverflowMouseDown = (event) => this._handleOverflowMouseDown(event);
    this._boundChipDismiss = (event) => this._onChipDismiss(event);
    this._boundKeyDown = (event) => this._handleListKeyDown(event);
    this.el.addEventListener("chip:dismiss", this._boundChipDismiss);
    this.el.addEventListener("keydown", this._boundKeyDown);
    this._build();
  }
  static initialize(element, options) {
    return new _ArvoChipList(element, options);
  }
  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------
  get _reorderAllowed() {
    const o = this._options;
    return o.isReorderable && !o.isDisabled && !o.isReadOnly;
  }
  get _showOverflowAction() {
    const m = this._options.overflowMode;
    return m === "single-line" || m === "max-rows";
  }
  /**
   * Effective overflow mode used for chip measurement. While expanded AND the
   * consumer opted into the expansion contract, treat the mode as 'wrap' so
   * no chips are hidden -- the SCSS modifier class still reflects the
   * consumer-provided overflowMode so layout rules apply correctly.
   */
  get _effectiveOverflowMode() {
    if (this._isExpanded && this._expansionOptIn && this._showOverflowAction) {
      return "wrap";
    }
    return this._options.overflowMode;
  }
  get _effectiveAppearance() {
    return this._options.colorMode === "custom" ? "utility" : this._options.appearance;
  }
  // ---------------------------------------------------------------------------
  // Build / teardown lifecycle
  // ---------------------------------------------------------------------------
  _build() {
    this.el.textContent = "";
    this._applyRootClassesAndAria();
    this._buildChips();
    this._buildOverflow();
    this._buildLiveRegion();
    this._setupOverflow();
    this._setupReorder();
    this._applyRovingTabindex();
  }
  _teardown() {
    var _a, _b;
    (_a = this._resizeObserver) == null ? void 0 : _a.disconnect();
    this._resizeObserver = null;
    (_b = this._sortable) == null ? void 0 : _b.destroy();
    this._sortable = null;
    for (const rec of this._chips) rec.instance.destroy();
    this._chips = [];
    if (this._overflowEl) {
      if (this._overflowBtn) {
        this._overflowEl.removeEventListener("click", this._boundOverflowClick, true);
        this._overflowEl.removeEventListener("mousedown", this._boundOverflowMouseDown);
        this._overflowBtn.destroy();
        this._overflowBtn = null;
      }
      this._overflowEl.remove();
      this._overflowEl = null;
    }
    if (this._liveRegionEl) {
      this._liveRegionEl.remove();
      this._liveRegionEl = null;
    }
  }
  _rebuild() {
    this._teardown();
    this._build();
  }
  _applyRootClassesAndAria() {
    const o = this._options;
    const classes = [
      "arvo-chip-list",
      `arvo-chip-list--${o.variant}`,
      `arvo-chip-list--${this._effectiveAppearance}`,
      `arvo-chip-list--${o.size}`,
      // overflowMode 'none' emits no layout class (parent owns clipping).
      o.overflowMode !== "none" ? `arvo-chip-list--${o.overflowMode}` : "",
      this._reorderAllowed ? "arvo-chip-list--reorderable" : "",
      o.isDisabled ? "is-disabled" : "",
      o.isReadOnly ? "is-readonly" : "",
      o.isLoading ? "loading" : ""
    ].filter(Boolean).join(" ");
    this.el.className = classes;
    this.el.setAttribute("role", "group");
    this._setOrRemoveAttr("aria-label", o.ariaLabel);
    this._setOrRemoveAttr("aria-labelledby", o.ariaLabelledBy);
    this._toggleAttr("aria-disabled", o.isDisabled);
    this._toggleAttr("aria-readonly", o.isReadOnly);
    this._toggleAttr("aria-busy", o.isLoading);
    if (o.isWithinField) {
      this.el.setAttribute("data-within-field", "true");
    } else {
      this.el.removeAttribute("data-within-field");
    }
    if (o.overflowMode === "max-rows" && typeof o.maxRows === "number" && o.maxRows > 0) {
      this.el.style.setProperty("--arvo-chip-list-max-rows", String(o.maxRows));
    } else {
      this.el.style.removeProperty("--arvo-chip-list-max-rows");
    }
  }
  _buildChips() {
    const o = this._options;
    this._chips = [];
    for (const item of o.items) {
      const resolvedVariant = item.variant ?? o.variant;
      const hostEl = document.createElement(resolvedVariant === "filter" ? "button" : "span");
      this.el.appendChild(hostEl);
      const rawKey = item.key;
      const keyStr = String(rawKey);
      const chipOpts = {
        // Shared axis defaults from the list, overridden per item where set.
        variant: resolvedVariant,
        appearance: item.appearance ?? o.appearance,
        size: item.size ?? o.size,
        colorMode: item.colorMode ?? o.colorMode,
        isDisabled: item.isDisabled ?? o.isDisabled,
        isReadOnly: item.isReadOnly ?? o.isReadOnly,
        isLoading: o.isLoading,
        // Per-chip content / validation pass through (chip applies its defaults).
        label: item.label,
        title: item.title,
        icon: item.icon,
        avatar: item.avatar,
        counter: item.counter,
        semanticType: item.semanticType,
        customColor: item.customColor,
        isInvalid: item.isInvalid,
        isWarning: item.isWarning,
        isExcluded: item.isExcluded,
        maxWidth: item.maxWidth
      };
      if (o.selectionMode !== "none") {
        chipOpts.isSelected = this._selectedSet.has(keyStr);
        chipOpts.onSelectedChange = (selected) => this._handleChipToggle(rawKey, selected);
      }
      if (this._reorderAllowed) {
        chipOpts.dragHandleProps = {
          "aria-label": `Reorder ${item.label}`,
          tabIndex: 0
        };
      }
      if (resolvedVariant === "input") {
        chipOpts.dismissLabel = item.dismissLabel;
        chipOpts.onDismiss = () => this._focusAfterDismiss(rawKey);
      }
      const instance = ArvoChip.initialize(hostEl, chipOpts);
      this._chips.push({ instance, el: hostEl, rawKey, key: keyStr });
    }
  }
  _buildOverflow() {
    if (!this._showOverflowAction) return;
    if (this._options.isStaticOverflow) {
      const span = document.createElement("span");
      span.className = "arvo-chip-list__overflow arvo-chip-list__overflow--static";
      span.style.display = "none";
      if (this._options.isDisabled) {
        span.setAttribute("aria-hidden", "true");
      }
      this.el.appendChild(span);
      this._overflowEl = span;
      return;
    }
    const btn = document.createElement("button");
    const disclosureSize = "md";
    this._overflowBtn = ArvoDisclosureButton.initialize(btn, {
      size: disclosureSize,
      hasChevron: true,
      isExpanded: this._isExpanded,
      label: ""
    });
    btn.classList.add("arvo-chip-list__overflow");
    btn.style.display = "none";
    if (this._options.isDisabled || this._options.isWithinField) {
      btn.setAttribute("tabindex", "-1");
    }
    if (this._options.isDisabled) {
      btn.setAttribute("aria-hidden", "true");
    }
    btn.addEventListener("click", this._boundOverflowClick, true);
    if (this._options.isWithinField) {
      btn.addEventListener("mousedown", this._boundOverflowMouseDown);
    }
    this.el.appendChild(btn);
    this._overflowEl = btn;
  }
  _handleOverflowMouseDown(event) {
    if (!this._options.isWithinField) return;
    event.preventDefault();
  }
  // ---------------------------------------------------------------------------
  // Live-region status node -- announces selection / dismissal / overflow
  // changes to assistive technology. Visually hidden.
  // ---------------------------------------------------------------------------
  _buildLiveRegion() {
    const div = document.createElement("div");
    div.className = "arvo-chip-list__live";
    div.setAttribute("role", "status");
    div.setAttribute("aria-live", "polite");
    div.setAttribute("aria-atomic", "true");
    div.style.cssText = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;";
    this.el.appendChild(div);
    this._liveRegionEl = div;
  }
  _announce(message) {
    if (!this._liveRegionEl || !message) return;
    this._liveRegionEl.textContent = "";
    requestAnimationFrame(() => {
      if (this._liveRegionEl) this._liveRegionEl.textContent = message;
    });
  }
  // ---------------------------------------------------------------------------
  // Overflow detection (ResizeObserver)
  // ---------------------------------------------------------------------------
  _setupOverflow() {
    const mode = this._options.overflowMode;
    if (mode === "none" || mode === "wrap") {
      this._measureOverflow();
      return;
    }
    if (typeof ResizeObserver === "undefined") {
      this._measureOverflow();
      return;
    }
    this._resizeObserver = new ResizeObserver(() => this._measureOverflow());
    this._resizeObserver.observe(this.el);
    this._measureOverflow();
  }
  _getChipEls() {
    return Array.from(this.el.querySelectorAll(":scope > .arvo-chip"));
  }
  _measureOverflow() {
    var _a;
    const mode = this._effectiveOverflowMode;
    const chips = this._getChipEls();
    for (const el of chips) showChipEl(el);
    if (mode === "none" || mode === "wrap") {
      this._setHiddenCount(0);
      return;
    }
    if (typeof this._options.maxVisibleChips === "number") {
      const cap = this._options.maxVisibleChips;
      let hidden = 0;
      chips.forEach((el, i) => {
        if (i >= cap) {
          hideChipEl(el);
          hidden += 1;
        }
      });
      this._setHiddenCount(hidden);
      return;
    }
    let firstHidden = -1;
    if (mode === "single-line") {
      const rootRect = this.el.getBoundingClientRect();
      const overflowWidth = ((_a = this._overflowEl) == null ? void 0 : _a.offsetWidth) ?? 0;
      const limitRight = rootRect.right - overflowWidth;
      for (let i = 0; i < chips.length; i++) {
        if (chips[i].getBoundingClientRect().right > limitRight) {
          firstHidden = i;
          break;
        }
      }
    } else {
      const rows = typeof this._options.maxRows === "number" && this._options.maxRows > 0 ? this._options.maxRows : 1;
      const rowTops = [];
      for (let i = 0; i < chips.length; i++) {
        const top = chips[i].offsetTop;
        if (!rowTops.includes(top)) rowTops.push(top);
        if (rowTops.indexOf(top) >= rows) {
          firstHidden = i;
          break;
        }
      }
    }
    if (firstHidden >= 0) {
      for (let i = firstHidden; i < chips.length; i++) hideChipEl(chips[i]);
      this._setHiddenCount(chips.length - firstHidden);
    } else {
      this._setHiddenCount(0);
    }
  }
  _setHiddenCount(n) {
    const prev = this._hiddenCount;
    this._hiddenCount = n;
    this._updateOverflowButton();
    this._applyRovingTabindex();
    if (n !== prev && (n > 0 || prev > 0)) {
      this._announce(
        n > 0 ? `${n} more ${n === 1 ? "chip" : "chips"} hidden.` : "All chips visible."
      );
    }
  }
  _updateOverflowButton() {
    var _a, _b;
    const el = this._overflowEl;
    if (!el) return;
    const n = this._hiddenCount;
    const isStatic = this._options.isStaticOverflow === true;
    const showNow = isStatic ? n > 0 : n > 0 || this._isExpanded && this._expansionOptIn;
    if (!showNow) {
      el.style.display = "none";
      return;
    }
    el.style.display = "";
    const labelFn = this._options.overflowLabel ?? ((c) => `+${c} more`);
    const ariaFn = this._options.overflowAriaLabel ?? ((c) => `Show ${c} more chips`);
    if (isStatic) {
      el.textContent = labelFn(n);
      el.setAttribute("aria-label", ariaFn(n));
      return;
    }
    if (this._isExpanded) {
      const expandedFn = this._options.expandedLabel ?? (() => "Show less");
      const label = expandedFn();
      (_a = this._overflowBtn) == null ? void 0 : _a.setLabel(label);
      el.setAttribute("aria-label", label);
    } else {
      (_b = this._overflowBtn) == null ? void 0 : _b.setLabel(labelFn(n));
      el.setAttribute("aria-label", ariaFn(n));
    }
  }
  _handleOverflowPress(event) {
    var _a, _b;
    if (this._options.isDisabled) return;
    if (event) {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
    }
    if (this._showOverflowAction && this._expansionOptIn) {
      this._setExpanded(!this._isExpanded);
    }
    const detail = { hiddenCount: this._hiddenCount };
    this._dispatch("chip-list:overflow-press", detail, false);
    (_b = (_a = this._options).onOverflowPress) == null ? void 0 : _b.call(_a);
  }
  _setExpanded(next) {
    var _a, _b, _c;
    if (this._isExpanded === next) return;
    this._isExpanded = next;
    (_a = this._overflowBtn) == null ? void 0 : _a.expanded(next);
    this._applyRootClassesAndAria();
    this._measureOverflow();
    this._updateOverflowButton();
    (_c = (_b = this._options).onExpandedChange) == null ? void 0 : _c.call(_b, next);
    this._dispatch("chip-list:expand-change", { isExpanded: next }, false);
  }
  // ---------------------------------------------------------------------------
  // Reorder (@arvo/core dnd)
  // ---------------------------------------------------------------------------
  _setupReorder() {
    if (!this._reorderAllowed) return;
    this._sortable = createSortableList(this.el, {
      itemSelector: ".arvo-chip",
      handleSelector: ".arvo-chip__grip",
      onPreview: () => {
        this._pointerReorder = true;
      },
      onCancel: () => {
        this._pointerReorder = false;
      },
      onCommit: (fromIndex, toIndex) => this._handleReorderCommit(fromIndex, toIndex)
    });
  }
  _handleReorderCommit(fromIndex, toIndex) {
    var _a, _b;
    const records = this._chips;
    if (fromIndex < 0 || fromIndex >= records.length) return;
    const fromPointer = this._pointerReorder;
    this._pointerReorder = false;
    const keys = records.map((r) => r.rawKey);
    const next = keys.slice();
    const [movedKey] = next.splice(fromIndex, 1);
    const insertAt = fromPointer ? fromIndex < toIndex ? toIndex - 1 : toIndex : toIndex;
    const clamped = Math.max(0, Math.min(insertAt, next.length));
    next.splice(clamped, 0, movedKey);
    const detail = { keys: next, key: movedKey, fromIndex, toIndex };
    const notPrevented = this._dispatch("chip-list:reorder", detail, true);
    (_b = (_a = this._options).onReorder) == null ? void 0 : _b.call(_a, detail);
    if (!notPrevented) return;
    const [movedRec] = records.splice(fromIndex, 1);
    records.splice(clamped, 0, movedRec);
    const anchor = this._overflowEl;
    for (const rec of records) this.el.insertBefore(rec.el, anchor);
    requestAnimationFrame(() => {
      var _a2;
      const moved = this._chips[clamped];
      (_a2 = moved == null ? void 0 : moved.el.querySelector(".arvo-chip__grip")) == null ? void 0 : _a2.focus();
    });
    this._measureOverflow();
  }
  // ---------------------------------------------------------------------------
  // Filter selection
  // ---------------------------------------------------------------------------
  _handleChipToggle(rawKey, selected) {
    var _a, _b;
    if (this._options.selectionMode === "none") return;
    const keyStr = String(rawKey);
    let nextSet;
    if (this._options.selectionMode === "single") {
      nextSet = selected ? /* @__PURE__ */ new Set([keyStr]) : /* @__PURE__ */ new Set();
    } else {
      nextSet = new Set(this._selectedSet);
      if (selected) nextSet.add(keyStr);
      else nextSet.delete(keyStr);
    }
    this._selectedSet = nextSet;
    this._syncChipSelection();
    this._activeKey = keyStr;
    this._applyRovingTabindex();
    const detail = { keys: Array.from(this._selectedSet), key: rawKey, isSelected: selected };
    this._dispatch("chip-list:selection-change", detail, false);
    (_b = (_a = this._options).onSelectionChange) == null ? void 0 : _b.call(_a, detail);
    const rec = this._chips.find((r) => r.key === keyStr);
    if (rec) {
      const label = this._chipLabel(rec);
      this._announce(
        selected ? `${label} filter selected.` : `${label} filter removed.`
      );
    }
  }
  _syncChipSelection() {
    for (const rec of this._chips) {
      rec.instance.selected(this._selectedSet.has(rec.key));
    }
  }
  // ---------------------------------------------------------------------------
  // Dismiss (input chips)
  // ---------------------------------------------------------------------------
  _onChipDismiss(event) {
    var _a;
    const target = event.target;
    if (!target) return;
    const record = this._chips.find((r) => r.el === target || r.el.contains(target));
    if (!record) return;
    const originalEvent = ((_a = event.detail) == null ? void 0 : _a.originalEvent) ?? event;
    this._announce(`${this._chipLabel(record)} removed.`);
    this._dispatch("chip-list:dismiss", { key: record.rawKey, originalEvent }, true);
  }
  _chipLabel(record) {
    var _a;
    return ((_a = record.el.querySelector(".arvo-chip__lbl")) == null ? void 0 : _a.textContent) ?? String(record.rawKey);
  }
  _focusAfterDismiss(rawKey) {
    const idx = this._chips.findIndex((r) => r.rawKey === rawKey);
    if (idx === -1) return;
    const order = [];
    for (let i = idx + 1; i < this._chips.length; i++) order.push(this._chips[i]);
    for (let i = idx - 1; i >= 0; i--) order.push(this._chips[i]);
    for (const rec of order) {
      const f = this._firstFocusable(rec);
      if (f) {
        f.focus();
        return;
      }
    }
  }
  // ---------------------------------------------------------------------------
  // Public methods (descriptor-driven)
  // ---------------------------------------------------------------------------
  setItems(items) {
    this._options.items = items;
    this._rebuild();
  }
  expanded(state) {
    if (state === void 0) return this._isExpanded;
    if (!this._showOverflowAction) return;
    this._expansionOptIn = true;
    this._setExpanded(state);
  }
  selectedKeys(next) {
    var _a, _b;
    if (next === void 0) {
      return Array.from(this._selectedSet);
    }
    if (this._options.selectionMode === "none") return;
    const prev = this._selectedSet;
    const nextSet = new Set(next.map((k) => String(k)));
    let changedKey;
    let changedSelected = true;
    for (const k of nextSet) {
      if (!prev.has(k)) {
        changedKey = k;
        changedSelected = true;
        break;
      }
    }
    if (changedKey === void 0) {
      for (const k of prev) {
        if (!nextSet.has(k)) {
          changedKey = k;
          changedSelected = false;
          break;
        }
      }
    }
    this._selectedSet = nextSet;
    this._syncChipSelection();
    if (changedKey !== void 0) {
      const detail = { keys: Array.from(this._selectedSet), key: changedKey, isSelected: changedSelected };
      this._dispatch("chip-list:selection-change", detail, false);
      (_b = (_a = this._options).onSelectionChange) == null ? void 0 : _b.call(_a, detail);
    }
  }
  disabled(state) {
    if (state === void 0) return this._options.isDisabled;
    const prevReorder = this._reorderAllowed;
    this._options.isDisabled = state;
    this.el.classList.toggle("is-disabled", state);
    this._toggleAttr("aria-disabled", state);
    if (this._overflowEl) {
      if (state) {
        this._overflowEl.setAttribute("tabindex", "-1");
        this._overflowEl.setAttribute("aria-hidden", "true");
      } else {
        this._overflowEl.removeAttribute("tabindex");
        this._overflowEl.removeAttribute("aria-hidden");
      }
    }
    if (this._reorderAllowed !== prevReorder) {
      this._rebuild();
    } else {
      for (const rec of this._chips) rec.instance.disabled(state);
    }
  }
  readOnly(state) {
    if (state === void 0) return this._options.isReadOnly;
    const prevReorder = this._reorderAllowed;
    this._options.isReadOnly = state;
    this.el.classList.toggle("is-readonly", state);
    this._toggleAttr("aria-readonly", state);
    if (this._reorderAllowed !== prevReorder) {
      this._rebuild();
    } else {
      for (const rec of this._chips) rec.instance.readOnly(state);
    }
  }
  setLoading(loading) {
    this._options.isLoading = loading;
    this.el.classList.toggle("loading", loading);
    this._toggleAttr("aria-busy", loading);
    for (const rec of this._chips) rec.instance.setLoading(loading);
    this._dispatch("chip-list:loading", { isLoading: loading }, false);
  }
  focus() {
    for (const rec of this._chips) {
      const f = this._firstFocusable(rec);
      if (f) {
        f.focus();
        return;
      }
    }
    const btn = this._overflowEl;
    if (btn && btn.style.display !== "none" && btn.getAttribute("tabindex") !== "-1") {
      btn.focus();
    }
  }
  destroy() {
    this.el.removeEventListener("chip:dismiss", this._boundChipDismiss);
    this.el.removeEventListener("keydown", this._boundKeyDown);
    this._teardown();
    this.el.textContent = "";
    this.el.className = "";
    this.el.removeAttribute("role");
    this.el.removeAttribute("aria-label");
    this.el.removeAttribute("aria-labelledby");
    this.el.removeAttribute("aria-disabled");
    this.el.removeAttribute("aria-readonly");
    this.el.removeAttribute("aria-busy");
    this.el.style.removeProperty("--arvo-chip-list-max-rows");
  }
  // ---------------------------------------------------------------------------
  // Roving tabindex (Arrow / Home / End across visible focusable chips)
  // ---------------------------------------------------------------------------
  _isChipFocusable(rec) {
    const el = rec.el;
    if (el.style.visibility === "hidden") return false;
    if (el instanceof HTMLButtonElement) return !el.disabled;
    return el.hasAttribute("tabindex");
  }
  /**
   * Apply roving tabindex among visible focusable chips: only the active
   * chip carries tabindex=0, all others carry tabindex=-1. Resolves the
   * active chip from `_activeKey` (preserved across renders), else the
   * first selected chip (filter), else the first focusable chip.
   */
  _applyRovingTabindex() {
    const focusable = this._chips.filter((rec) => this._isChipFocusable(rec));
    if (focusable.length <= 1) {
      return;
    }
    let activeRec;
    if (this._activeKey !== null) {
      activeRec = focusable.find((r) => r.key === this._activeKey);
    }
    if (!activeRec && this._options.selectionMode !== "none" && this._selectedSet.size > 0) {
      activeRec = focusable.find((r) => this._selectedSet.has(r.key));
    }
    if (!activeRec) activeRec = focusable[0];
    this._activeKey = activeRec.key;
    for (const rec of focusable) {
      rec.el.setAttribute("tabindex", rec === activeRec ? "0" : "-1");
    }
  }
  _handleListKeyDown(event) {
    const key = event.key;
    if (key !== "ArrowRight" && key !== "ArrowLeft" && key !== "ArrowUp" && key !== "ArrowDown" && key !== "Home" && key !== "End") {
      return;
    }
    const target = event.target;
    if (!target) return;
    const visible = this._chips.filter((rec) => this._isChipFocusable(rec));
    if (visible.length === 0) return;
    const currentIdx = visible.findIndex(
      (rec) => rec.el === target || rec.el.contains(target)
    );
    if (currentIdx === -1) return;
    let nextIdx = currentIdx;
    if (key === "ArrowRight" || key === "ArrowDown") {
      nextIdx = Math.min(currentIdx + 1, visible.length - 1);
    } else if (key === "ArrowLeft" || key === "ArrowUp") {
      nextIdx = Math.max(currentIdx - 1, 0);
    } else if (key === "Home") {
      nextIdx = 0;
    } else if (key === "End") {
      nextIdx = visible.length - 1;
    }
    event.preventDefault();
    if (nextIdx === currentIdx) return;
    this._activeKey = visible[nextIdx].key;
    for (const rec of visible) {
      rec.el.setAttribute("tabindex", rec === visible[nextIdx] ? "0" : "-1");
    }
    visible[nextIdx].el.focus();
  }
  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------
  _firstFocusable(rec) {
    const el = rec.el;
    if (el.style.visibility === "hidden") return null;
    if (el instanceof HTMLButtonElement && !el.disabled) return el;
    if (el.hasAttribute("tabindex")) return el;
    const focusables = getFocusableElements(el);
    return focusables[0] ?? null;
  }
  _dispatch(name, detail, cancelable) {
    return this.el.dispatchEvent(new CustomEvent(name, { bubbles: true, cancelable, detail }));
  }
  _toggleAttr(name, on) {
    if (on) this.el.setAttribute(name, "true");
    else this.el.removeAttribute(name);
  }
  _setOrRemoveAttr(name, value) {
    if (value != null) this.el.setAttribute(name, value);
    else this.el.removeAttribute(name);
  }
};
_ArvoChipList.DEFAULTS = {
  items: [],
  variant: "general",
  appearance: "primary",
  size: "md",
  colorMode: "default",
  selectionMode: "none",
  selectedKeys: null,
  defaultSelectedKeys: null,
  onSelectionChange: null,
  overflowMode: "wrap",
  maxVisibleChips: "auto",
  maxRows: null,
  overflowLabel: null,
  overflowAriaLabel: null,
  expandedLabel: null,
  onOverflowPress: null,
  onExpandedChange: null,
  isWithinField: false,
  isStaticOverflow: false,
  isReorderable: false,
  onReorder: null,
  isDisabled: false,
  isReadOnly: false,
  isLoading: false,
  ariaLabel: null,
  ariaLabelledBy: null
};
let ArvoChipList = _ArvoChipList;
export {
  ArvoChipList
};
//# sourceMappingURL=ChipList.js.map
