"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const utils = require("@arvo/utils");
const IconButton = require("../IconButton/IconButton.cjs");
const DropdownIconButton = require("../DropdownIconButton/DropdownIconButton.cjs");
const Status = require("../Status/Status.cjs");
const Badge = require("../Badge/Badge.cjs");
const Switch = require("../Switch/Switch.cjs");
const Search = require("../Search/Search.cjs");
const EmptyState = require("../EmptyState/EmptyState.cjs");
function toSet(value, mode) {
  if (value == null) return /* @__PURE__ */ new Set();
  if (mode === "multiple") {
    if (Array.isArray(value)) return new Set(value);
    return /* @__PURE__ */ new Set([value]);
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? /* @__PURE__ */ new Set([value[0]]) : /* @__PURE__ */ new Set();
  }
  return /* @__PURE__ */ new Set([value]);
}
function fromSet(set, mode) {
  if (mode === "multiple") return Array.from(set);
  const first = set.values().next();
  return first.done ? "" : first.value;
}
function seedExpandedValues(opts) {
  const mode = opts.expandMode ?? "single";
  if (opts.value !== void 0) return toSet(opts.value, mode);
  if (opts.defaultValue !== void 0) return toSet(opts.defaultValue, mode);
  return /* @__PURE__ */ new Set();
}
function resolveEmptyState(override) {
  return {
    title: override == null ? void 0 : override.title,
    message: (override == null ? void 0 : override.message) ?? "No Items Available",
    illustration: (override == null ? void 0 : override.illustration) ?? "no-data"
  };
}
const _ArvoAccordion = class _ArvoAccordion {
  constructor(element, options) {
    this._listEl = null;
    this._skelEl = null;
    this._entries = [];
    this._element = element;
    this._options = {
      ..._ArvoAccordion.DEFAULTS,
      ...options,
      variant: (options == null ? void 0 : options.variant) ?? _ArvoAccordion.DEFAULTS.variant,
      size: (options == null ? void 0 : options.size) ?? _ArvoAccordion.DEFAULTS.size,
      align: (options == null ? void 0 : options.align) ?? _ArvoAccordion.DEFAULTS.align,
      expandMode: (options == null ? void 0 : options.expandMode) ?? _ArvoAccordion.DEFAULTS.expandMode,
      isCollapsible: (options == null ? void 0 : options.isCollapsible) ?? _ArvoAccordion.DEFAULTS.isCollapsible,
      items: (options == null ? void 0 : options.items) ? options.items.map((i) => ({ ...i })) : [],
      expandedValues: seedExpandedValues(options ?? {}),
      ariaLabel: (options == null ? void 0 : options.ariaLabel) ?? null,
      ariaLabelledBy: (options == null ? void 0 : options.ariaLabelledBy) ?? null,
      onValueChange: (options == null ? void 0 : options.onValueChange) ?? null,
      onExpand: (options == null ? void 0 : options.onExpand) ?? null,
      onCollapse: (options == null ? void 0 : options.onCollapse) ?? null
    };
    this._boundHandleKeyDown = this._handleKeyDown.bind(this);
    this._render();
    this._bindEvents();
  }
  static initialize(element, options) {
    return new _ArvoAccordion(element, options);
  }
  // =========================================================================
  // Rendering
  // =========================================================================
  _render() {
    const el = this._element;
    if (!el) return;
    this._destroyInstances();
    el.textContent = "";
    this._entries = [];
    el.classList.add(
      "arvo-acc",
      `arvo-acc--${this._options.variant}`,
      `arvo-acc--${this._options.size}`,
      `arvo-acc--align-${this._options.align}`
    );
    if (this._options.isDisabled) el.classList.add("is-disabled");
    else el.classList.remove("is-disabled");
    if (this._options.isLoading) {
      el.classList.add("loading");
      el.setAttribute("aria-busy", "true");
    } else {
      el.classList.remove("loading");
      el.removeAttribute("aria-busy");
    }
    if (this._options.ariaLabel) {
      el.setAttribute("aria-label", this._options.ariaLabel);
    } else {
      el.removeAttribute("aria-label");
    }
    if (this._options.ariaLabelledBy) {
      el.setAttribute("aria-labelledby", this._options.ariaLabelledBy);
    } else {
      el.removeAttribute("aria-labelledby");
    }
    if (this._options.isLoading) {
      this._skelEl = document.createElement("div");
      this._skelEl.className = "arvo-acc__skel";
      this._skelEl.setAttribute("aria-hidden", "true");
      const count = Math.max(1, this._options.skeletonRowCount);
      for (let i = 0; i < count; i++) {
        const row = document.createElement("div");
        row.className = "arvo-acc__skel-row";
        this._skelEl.appendChild(row);
      }
      el.appendChild(this._skelEl);
      return;
    }
    this._listEl = document.createElement("div");
    this._listEl.className = "arvo-acc__list";
    for (const item of this._options.items) {
      const entry = this._createItemEntry(item);
      this._listEl.appendChild(entry.rootEl);
      this._entries.push(entry);
    }
    el.appendChild(this._listEl);
  }
  _createItemEntry(item) {
    var _a, _b, _c, _d;
    const isExpanded = this._options.expandedValues.has(item.value);
    const isItemDisabled = this._options.isDisabled || !!item.isDisabled;
    const isItemLoading = (this._options.isLoading || !!item.isLoading) === true;
    const hasDivider = item.hasDivider !== false;
    const panelPadding = item.panelPadding ?? "md";
    const triggerId = `arvo-acc-item-${this._uniqueId()}-trg`;
    const panelId = `arvo-acc-item-${this._uniqueId()}-panel`;
    const isItemEmpty = !!item.isEmpty;
    const rootEl = document.createElement("div");
    rootEl.className = [
      "arvo-acc-item",
      `arvo-acc-item--${this._options.size}`,
      `arvo-acc-item--align-${this._options.align}`,
      `arvo-acc-item--pad-${panelPadding}`,
      isExpanded ? "expanded" : "",
      isItemDisabled ? "is-disabled" : "",
      isItemLoading ? "loading" : "",
      isItemEmpty ? "is-empty" : "",
      !hasDivider ? "no-divider" : ""
    ].filter(Boolean).join(" ");
    rootEl.setAttribute("data-arvo-acc-item-value", item.value);
    const trgEl = document.createElement("button");
    trgEl.type = "button";
    trgEl.id = triggerId;
    trgEl.className = "arvo-acc-item__trg";
    trgEl.setAttribute("aria-expanded", isExpanded ? "true" : "false");
    trgEl.setAttribute("aria-controls", panelId);
    if (isItemDisabled) {
      trgEl.setAttribute("aria-disabled", "true");
      trgEl.disabled = true;
    }
    if (isItemLoading) trgEl.setAttribute("aria-busy", "true");
    const chevEl = document.createElement("span");
    chevEl.className = "arvo-acc-item__chev o9con o9con-angle-right";
    chevEl.setAttribute("aria-hidden", "true");
    const hdrEl = document.createElement("span");
    hdrEl.className = "arvo-acc-item__hdr";
    const lftEl = document.createElement("span");
    lftEl.className = "arvo-acc-item__lft";
    if (item.icon) {
      const ico = document.createElement("span");
      ico.className = `arvo-acc-item__ico o9con o9con-${item.icon}`;
      ico.setAttribute("aria-hidden", "true");
      lftEl.appendChild(ico);
    }
    const titleEl = document.createElement("span");
    titleEl.className = "arvo-acc-item__title";
    titleEl.textContent = item.title;
    lftEl.appendChild(titleEl);
    let statusInstance = null;
    if (item.status) {
      const stsWrap = document.createElement("span");
      stsWrap.className = "arvo-acc-item__sts";
      const stsHost = document.createElement("span");
      stsWrap.appendChild(stsHost);
      statusInstance = Status.ArvoStatus.initialize(stsHost, {
        ...item.statusProps ?? {},
        type: item.status.type,
        placement: "inline",
        size: "sm",
        tooltip: item.status.label
      });
      lftEl.appendChild(stsWrap);
    }
    hdrEl.appendChild(lftEl);
    if (item.description) {
      const desc = document.createElement("span");
      desc.className = "arvo-acc-item__desc";
      desc.textContent = item.description;
      hdrEl.appendChild(desc);
    }
    let badgeInstance = null;
    if (item.badge) {
      const bdgWrap = document.createElement("span");
      bdgWrap.className = "arvo-acc-item__bdg";
      const bdgHost = document.createElement("span");
      bdgWrap.appendChild(bdgHost);
      badgeInstance = Badge.ArvoBadge.initialize(bdgHost, {
        ...item.badgeProps ?? {},
        size: "sm",
        variant: "label",
        semanticType: item.badge.semanticType ?? "negative",
        appearance: ((_a = item.badgeProps) == null ? void 0 : _a.appearance) ?? "primary",
        message: item.badge.message,
        hasBadgeIcon: false
      });
      hdrEl.appendChild(bdgWrap);
    }
    const inlineButtons = [];
    if (item.actions && item.actions.length > 0) {
      const actionsEl = document.createElement("span");
      actionsEl.className = "arvo-acc-item__actions";
      actionsEl.addEventListener("click", (e) => e.stopPropagation());
      for (const action of item.actions) {
        const wrap = document.createElement("span");
        wrap.className = "arvo-acc-item__act";
        const btnEl = document.createElement("button");
        btnEl.type = "button";
        btnEl.tabIndex = -1;
        wrap.appendChild(btnEl);
        const inst = IconButton.ArvoIconButton.initialize(btnEl, {
          icon: action.icon,
          variant: "tertiary",
          size: "sm",
          tooltip: action.tooltip,
          isDisabled: isItemDisabled || !!action.isDisabled,
          isLoading: isItemLoading,
          onClick: (e) => {
            var _a2;
            e.stopPropagation();
            if (isItemDisabled || isItemLoading || action.isDisabled) return;
            (_a2 = action.onClick) == null ? void 0 : _a2.call(action, e);
          }
        });
        inlineButtons.push(inst);
        actionsEl.appendChild(wrap);
      }
      hdrEl.appendChild(actionsEl);
    }
    let menuButton = null;
    if (item.menuItems && item.menuItems.length > 0) {
      const menuWrap = document.createElement("span");
      menuWrap.className = "arvo-acc-item__menu";
      menuWrap.addEventListener("click", (e) => e.stopPropagation());
      const ddBtnEl = document.createElement("button");
      ddBtnEl.type = "button";
      ddBtnEl.tabIndex = -1;
      menuWrap.appendChild(ddBtnEl);
      menuButton = DropdownIconButton.ArvoDropdownIconButton.initialize(ddBtnEl, {
        ...item.menuProps ?? {},
        icon: "ellipsis-v",
        variant: "tertiary",
        size: "sm",
        isCompact: true,
        tooltip: "More actions",
        items: item.menuItems,
        isDisabled: isItemDisabled || isItemLoading,
        isLoading: isItemLoading,
        closeOnSelect: true
      });
      hdrEl.appendChild(menuWrap);
    }
    let switchInstance = null;
    if (item.switch) {
      const swWrap = document.createElement("span");
      swWrap.className = "arvo-acc-item__switch";
      swWrap.addEventListener("click", (e) => e.stopPropagation());
      swWrap.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") e.stopPropagation();
      });
      const swHost = document.createElement("div");
      swWrap.appendChild(swHost);
      switchInstance = Switch.ArvoSwitch.initialize(swHost, {
        ...item.switchProps ?? {},
        size: this._options.size,
        isChecked: item.switch.defaultChecked ?? item.switch.isChecked ?? false,
        isDisabled: isItemDisabled || item.switch.isDisabled,
        // Accordion header switches never render a visible label. The
        // visible meaning is the accordion title; the switch carries an
        // aria-label set directly on the inner input below for SR users.
        label: null,
        onChange: (detail) => {
          var _a2, _b2;
          (_b2 = (_a2 = item.switch) == null ? void 0 : _a2.onChange) == null ? void 0 : _b2.call(_a2, detail.isChecked);
        }
      });
      if (item.switch.ariaLabel) {
        const inputEl = swHost.querySelector("input");
        inputEl == null ? void 0 : inputEl.setAttribute("aria-label", item.switch.ariaLabel);
      }
      hdrEl.appendChild(swWrap);
    }
    let searchInstance = null;
    let searchExpanded = ((_b = item.search) == null ? void 0 : _b.isExpanded) ?? ((_c = item.search) == null ? void 0 : _c.defaultExpanded) ?? false;
    if (item.search) {
      const srchWrap = document.createElement("span");
      srchWrap.className = "arvo-acc-item__search";
      srchWrap.addEventListener("click", (e) => e.stopPropagation());
      srchWrap.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") e.stopPropagation();
      });
      const srchHost = document.createElement("div");
      srchWrap.appendChild(srchHost);
      searchInstance = Search.ArvoSearch.initialize(srchHost, {
        ...item.searchProps ?? {},
        variant: "expandable-filter",
        placeholder: item.search.placeholder ?? "Search",
        value: item.search.value,
        defaultValue: item.search.defaultValue,
        shortcut: item.search.shortcut ?? null,
        expandDirection: item.search.expandDirection ?? "start",
        isExpanded: searchExpanded,
        isDisabled: isItemDisabled || ((_d = item.searchProps) == null ? void 0 : _d.isDisabled),
        onChange: (next) => {
          var _a2, _b2;
          (_b2 = (_a2 = item.search) == null ? void 0 : _a2.onChange) == null ? void 0 : _b2.call(_a2, next);
        },
        onExpandedChange: (expanded) => {
          var _a2, _b2;
          searchExpanded = expanded;
          if (expanded) rootEl.classList.add("is-searching");
          else rootEl.classList.remove("is-searching");
          (_b2 = (_a2 = item.search) == null ? void 0 : _a2.onExpandedChange) == null ? void 0 : _b2.call(_a2, expanded);
        }
      });
      if (searchExpanded) rootEl.classList.add("is-searching");
      hdrEl.appendChild(srchWrap);
    }
    if (this._options.align === "start") {
      trgEl.appendChild(chevEl);
      trgEl.appendChild(hdrEl);
    } else {
      trgEl.appendChild(hdrEl);
      trgEl.appendChild(chevEl);
    }
    if (isItemLoading) {
      const skel = document.createElement("span");
      skel.className = "arvo-acc-item__skel";
      skel.setAttribute("aria-hidden", "true");
      const bar = document.createElement("span");
      bar.className = "arvo-acc-item__skel-bar";
      const trail = document.createElement("span");
      trail.className = "arvo-acc-item__skel-trail";
      skel.appendChild(bar);
      skel.appendChild(trail);
      trgEl.appendChild(skel);
    }
    trgEl.addEventListener("click", (e) => this._handleItemClick(item, e));
    rootEl.appendChild(trgEl);
    const panelEl = document.createElement("div");
    panelEl.id = panelId;
    panelEl.className = "arvo-acc-item__panel";
    panelEl.setAttribute("role", "region");
    panelEl.setAttribute("aria-labelledby", triggerId);
    if (!isExpanded) {
      panelEl.setAttribute("aria-hidden", "true");
      panelEl.setAttribute("inert", "");
    }
    const panelInner = document.createElement("div");
    panelInner.className = "arvo-acc-item__panel-inner";
    const panelPad = document.createElement("div");
    panelPad.className = "arvo-acc-item__panel-pad";
    panelInner.appendChild(panelPad);
    let emptyInstance = null;
    if (isItemEmpty && !isItemLoading) {
      const emptyWrap = document.createElement("div");
      emptyWrap.className = "arvo-acc-item__empty";
      const emptyHost = document.createElement("div");
      emptyWrap.appendChild(emptyHost);
      const resolved = resolveEmptyState(item.emptyState ?? null);
      emptyInstance = EmptyState.ArvoEmptyState.initialize(emptyHost, {
        size: "sm",
        orientation: "horizontal",
        title: resolved.title,
        message: resolved.message,
        illustration: resolved.illustration
      });
      panelPad.appendChild(emptyWrap);
    } else if (!isItemLoading && item.content !== void 0) {
      if (typeof item.content === "string") {
        panelPad.innerHTML = item.content;
      } else {
        panelPad.appendChild(item.content);
      }
    }
    panelEl.appendChild(panelInner);
    rootEl.appendChild(panelEl);
    let truncationHandle = null;
    if (!isItemLoading) {
      truncationHandle = utils.attachTitleTruncationTooltip({
        element: titleEl,
        content: item.title,
        placement: "bottom-center"
      });
    }
    return {
      data: item,
      rootEl,
      trgEl,
      panelEl,
      titleEl,
      chevEl,
      truncationHandle,
      statusInstance,
      badgeInstance,
      inlineButtons,
      menuButton,
      switchInstance,
      searchInstance,
      emptyInstance,
      searchExpanded
    };
  }
  _uniqueId() {
    return Math.random().toString(36).slice(2, 11);
  }
  // =========================================================================
  // Events
  // =========================================================================
  _bindEvents() {
    var _a;
    (_a = this._element) == null ? void 0 : _a.addEventListener("keydown", this._boundHandleKeyDown);
  }
  _unbindEvents() {
    var _a;
    (_a = this._element) == null ? void 0 : _a.removeEventListener("keydown", this._boundHandleKeyDown);
  }
  _handleItemClick(item, e) {
    if (this._options.isDisabled || this._options.isLoading) {
      e.preventDefault();
      return;
    }
    const itemDisabled = !!item.isDisabled;
    const itemLoading = !!item.isLoading === true;
    if (itemDisabled || itemLoading) {
      e.preventDefault();
      return;
    }
    this._toggleInternal(item.value);
  }
  _handleKeyDown(e) {
    var _a;
    const el = this._element;
    if (!el) return;
    const target = e.target;
    if (!target) return;
    if (!target.matches("button.arvo-acc-item__trg")) return;
    const triggers = Array.from(
      el.querySelectorAll(
        'button.arvo-acc-item__trg:not([aria-disabled="true"]):not([disabled])'
      )
    );
    if (triggers.length === 0) return;
    const currentIdx = triggers.indexOf(target);
    let nextIdx = null;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        nextIdx = currentIdx < 0 ? 0 : (currentIdx + 1) % triggers.length;
        break;
      case "ArrowUp":
        e.preventDefault();
        nextIdx = currentIdx < 0 ? triggers.length - 1 : (currentIdx - 1 + triggers.length) % triggers.length;
        break;
      case "Home":
        e.preventDefault();
        nextIdx = 0;
        break;
      case "End":
        e.preventDefault();
        nextIdx = triggers.length - 1;
        break;
      default:
        return;
    }
    if (nextIdx !== null) (_a = triggers[nextIdx]) == null ? void 0 : _a.focus();
  }
  _dispatchEvent(name, detail, cancelable = false) {
    if (!this._element) return true;
    const evt = new CustomEvent(name, { detail, bubbles: true, cancelable });
    return this._element.dispatchEvent(evt);
  }
  // =========================================================================
  // Internal expansion logic
  // =========================================================================
  _toggleInternal(itemValue) {
    const isExpanded = this._options.expandedValues.has(itemValue);
    if (isExpanded) this._collapseInternal(itemValue);
    else this._expandInternal(itemValue);
  }
  _expandInternal(itemValue) {
    var _a, _b, _c, _d;
    const existing = this._options.expandedValues;
    if (existing.has(itemValue)) return;
    const next = new Set(existing);
    if (this._options.expandMode === "single") next.clear();
    next.add(itemValue);
    const ok = this._dispatchEvent(
      "acc:expand",
      { itemValue, value: fromSet(next, this._options.expandMode) },
      true
    );
    if (!ok) return;
    this._options.expandedValues = next;
    this._applyExpansionState();
    const nextValue = fromSet(next, this._options.expandMode);
    this._dispatchEvent(
      "acc:change",
      { value: nextValue, itemValue, isExpanded: true },
      false
    );
    (_b = (_a = this._options).onValueChange) == null ? void 0 : _b.call(_a, nextValue, { itemValue, isExpanded: true });
    (_d = (_c = this._options).onExpand) == null ? void 0 : _d.call(_c, { itemValue });
  }
  _collapseInternal(itemValue) {
    var _a, _b, _c, _d;
    const existing = this._options.expandedValues;
    if (!existing.has(itemValue)) return;
    if (!this._options.isCollapsible && existing.size === 1) return;
    const next = new Set(existing);
    next.delete(itemValue);
    const ok = this._dispatchEvent(
      "acc:collapse",
      { itemValue, value: fromSet(next, this._options.expandMode) },
      true
    );
    if (!ok) return;
    this._options.expandedValues = next;
    this._applyExpansionState();
    const nextValue = fromSet(next, this._options.expandMode);
    this._dispatchEvent(
      "acc:change",
      { value: nextValue, itemValue, isExpanded: false },
      false
    );
    (_b = (_a = this._options).onValueChange) == null ? void 0 : _b.call(_a, nextValue, { itemValue, isExpanded: false });
    (_d = (_c = this._options).onCollapse) == null ? void 0 : _d.call(_c, { itemValue });
  }
  _applyExpansionState() {
    for (const entry of this._entries) {
      const isExpanded = this._options.expandedValues.has(entry.data.value);
      entry.rootEl.classList.toggle("expanded", isExpanded);
      entry.trgEl.setAttribute("aria-expanded", isExpanded ? "true" : "false");
      if (isExpanded) {
        entry.panelEl.removeAttribute("aria-hidden");
        entry.panelEl.removeAttribute("inert");
      } else {
        entry.panelEl.setAttribute("aria-hidden", "true");
        entry.panelEl.setAttribute("inert", "");
      }
    }
  }
  value(next) {
    if (arguments.length === 0) {
      return fromSet(
        this._options.expandedValues,
        this._options.expandMode
      );
    }
    this._options.expandedValues = toSet(next ?? null, this._options.expandMode);
    this._applyExpansionState();
  }
  expand(itemValue) {
    this._expandInternal(itemValue);
  }
  collapse(itemValue) {
    this._collapseInternal(itemValue);
  }
  toggle(itemValue) {
    this._toggleInternal(itemValue);
  }
  setItems(items) {
    const next = items.map((i) => ({ ...i }));
    this._options.items = next;
    const valid = new Set(next.map((i) => i.value));
    const trimmed = /* @__PURE__ */ new Set();
    for (const v of this._options.expandedValues) if (valid.has(v)) trimmed.add(v);
    this._options.expandedValues = trimmed;
    this._render();
  }
  addItem(item, index) {
    const next = [...this._options.items];
    if (typeof index === "number") next.splice(index, 0, { ...item });
    else next.push({ ...item });
    this._options.items = next;
    this._render();
  }
  removeItem(itemValue) {
    const next = this._options.items.filter((i) => i.value !== itemValue);
    this._options.expandedValues.delete(itemValue);
    this._options.items = next;
    this._render();
  }
  disabled(state) {
    if (arguments.length === 0) return this._options.isDisabled;
    this._options.isDisabled = !!state;
    this._render();
  }
  setLoading(loading) {
    this._options.isLoading = loading === true;
    this._render();
  }
  destroy() {
    this._unbindEvents();
    this._destroyInstances();
    if (this._element) {
      this._element.textContent = "";
      this._element.classList.remove(
        "arvo-acc",
        "arvo-acc--surface",
        "arvo-acc--transparent",
        "arvo-acc--sm",
        "arvo-acc--lg",
        "arvo-acc--align-start",
        "arvo-acc--align-end",
        "is-disabled",
        "loading"
      );
      this._element.removeAttribute("aria-busy");
      this._element.removeAttribute("aria-label");
      this._element.removeAttribute("aria-labelledby");
    }
    this._element = null;
    this._listEl = null;
    this._skelEl = null;
    this._entries = [];
  }
  _destroyInstances() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
    for (const entry of this._entries) {
      (_a = entry.truncationHandle) == null ? void 0 : _a.destroy();
      (_c = (_b = entry.statusInstance) == null ? void 0 : _b.destroy) == null ? void 0 : _c.call(_b);
      (_e = (_d = entry.badgeInstance) == null ? void 0 : _d.destroy) == null ? void 0 : _e.call(_d);
      for (const btn of entry.inlineButtons) (_f = btn.destroy) == null ? void 0 : _f.call(btn);
      (_h = (_g = entry.menuButton) == null ? void 0 : _g.destroy) == null ? void 0 : _h.call(_g);
      (_j = (_i = entry.switchInstance) == null ? void 0 : _i.destroy) == null ? void 0 : _j.call(_i);
      (_l = (_k = entry.searchInstance) == null ? void 0 : _k.destroy) == null ? void 0 : _l.call(_k);
      (_n = (_m = entry.emptyInstance) == null ? void 0 : _m.destroy) == null ? void 0 : _n.call(_m);
    }
  }
};
_ArvoAccordion.VARIANTS = ["surface", "transparent"];
_ArvoAccordion.SIZES = ["sm", "lg"];
_ArvoAccordion.ALIGNS = ["start", "end"];
_ArvoAccordion.EXPAND_MODES = ["single", "multiple"];
_ArvoAccordion.DEFAULTS = {
  variant: "surface",
  size: "lg",
  align: "end",
  expandMode: "single",
  isCollapsible: true,
  isDisabled: false,
  isLoading: false,
  skeletonRowCount: 4,
  ariaLabel: null,
  ariaLabelledBy: null,
  onValueChange: null,
  onExpand: null,
  onCollapse: null
};
let ArvoAccordion = _ArvoAccordion;
exports.ArvoAccordion = ArvoAccordion;
//# sourceMappingURL=Accordion.cjs.map
