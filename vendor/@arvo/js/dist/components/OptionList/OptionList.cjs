"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const core = require("@arvo/core");
const Search = require("../Search/Search.cjs");
const EmptyState = require("../EmptyState/EmptyState.cjs");
const menuSearch = require("../../types/menu-search.cjs");
const optionListRender = require("../../internal/option-list-render.cjs");
let _idCounter = 0;
const isGrouped = optionListRender.isGroupedOptions;
const flattenItems = optionListRender.flattenOptions;
const SKELETON_WIDTHS = [60, 67, 74, 81, 58];
const _ArvoOptionList = class _ArvoOptionList {
  constructor(trigger, options) {
    this._panelEl = null;
    this._scrollEl = null;
    this._searchEl = null;
    this._searchInstance = null;
    this._surface = null;
    this._arrowNav = null;
    this._searchCfg = null;
    this._flatOptions = [];
    this._optionEls = [];
    this._highlightedIndex = -1;
    this._query = "";
    this._isOpen = false;
    this._emptyStateInstance = null;
    this._checkboxInstances = [];
    this._truncationHandles = [];
    this._handleTriggerKeyDown = (e) => {
      var _a;
      if (this._options.isDisabled || this._options.isLoading) return;
      if (!this._isOpen) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.open();
        }
        return;
      }
      (_a = this._arrowNav) == null ? void 0 : _a.handleKeyDown(e);
    };
    this._handleSearchKeyDown = (e) => {
      var _a;
      if (this._options.isDisabled || this._options.isLoading) return;
      switch (e.key) {
        case "ArrowDown":
        case "ArrowUp":
        case "Home":
        case "End":
          e.preventDefault();
          (_a = this._arrowNav) == null ? void 0 : _a.handleKeyDown(e);
          break;
        case "Enter":
          e.preventDefault();
          if (this._highlightedIndex >= 0 && this._highlightedIndex < this._flatOptions.length) {
            const item = this._flatOptions[this._highlightedIndex];
            if (!item.isDisabled) this._selectOption(item);
          }
          break;
      }
    };
    this._handleListClick = (e) => {
      if (this._options.isDisabled || this._options.isLoading) return;
      const target = e.target.closest(".arvo-opt-list__opt");
      if (!target) return;
      const indexStr = target.getAttribute("data-index");
      if (indexStr == null) return;
      const index = parseInt(indexStr, 10);
      const item = this._flatOptions[index];
      if (!item || item.isDisabled) return;
      this._highlightOption(index, false);
      this._selectOption(item);
    };
    this._handleListMouseDown = (e) => {
      e.preventDefault();
    };
    this._handleListMouseOver = (e) => {
      const target = e.target.closest(".arvo-opt-list__opt");
      if (!target) return;
      const indexStr = target.getAttribute("data-index");
      if (indexStr == null) return;
      const index = parseInt(indexStr, 10);
      if (this._flatOptions[index] && !this._flatOptions[index].isDisabled) {
        this._highlightOption(index, false);
      }
    };
    this._handleTriggerClick = () => {
      if (this._options.isDisabled || this._options.isLoading) return;
      this.toggle();
    };
    this._trigger = trigger;
    this._id = `arvo-opt-list-${++_idCounter}`;
    const initialValue = options.value !== void 0 ? options.value ?? null : options.defaultValue !== void 0 ? options.defaultValue ?? null : null;
    this._options = {
      ..._ArvoOptionList.DEFAULTS,
      ...options,
      value: initialValue,
      emptyConfig: options.emptyConfig ?? null,
      activeDescendantElement: options.activeDescendantElement ?? null,
      triggerAriaElement: options.triggerAriaElement ?? null,
      closeOnSelect: options.closeOnSelect ?? null,
      onChange: options.onChange ?? null,
      onCreate: options.onCreate ?? null,
      onOpenChange: options.onOpenChange ?? null,
      onOpen: options.onOpen ?? null,
      onClose: options.onClose ?? null
    };
    this._searchCfg = menuSearch.normalizeSearch(this._options.search, { shortcut: "/" });
    this._selection = this._initSelection(initialValue);
    this._render();
    this._setupSurface();
    this._setupKeyboard();
    this._buildOptions();
    this._bindTrigger();
    if (this._options.defaultOpen && !this._options.isDisabled) {
      this.open();
    }
  }
  static initialize(trigger, options) {
    return new _ArvoOptionList(trigger, options);
  }
  // -------------------------------------------------------------------------
  // Selection
  // -------------------------------------------------------------------------
  _initSelection(value) {
    if (value == null) return /* @__PURE__ */ new Set();
    if (this._options.isMultiple && Array.isArray(value)) return new Set(value);
    return /* @__PURE__ */ new Set([value]);
  }
  _isSelected(optionValue) {
    return this._selection.has(optionValue);
  }
  get _closeOnSelect() {
    return this._options.closeOnSelect ?? !this._options.isMultiple;
  }
  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  _render() {
    const panel = document.createElement("div");
    panel.id = this._id;
    panel.className = this._buildClasses();
    if (this._options.maxHeight) {
      panel.style.setProperty("--arvo-overlay-max-height", this._options.maxHeight);
    }
    if (this._searchCfg) {
      this._searchEl = document.createElement("div");
      this._searchEl.className = "arvo-opt-list__search";
      const searchRoot = document.createElement("div");
      this._searchEl.appendChild(searchRoot);
      this._searchInstance = Search.ArvoSearch.initialize(searchRoot, {
        variant: "filter",
        placeholder: this._searchCfg.placeholder,
        searchMode: this._searchCfg.searchMode,
        minChars: this._searchCfg.minChars,
        isClearable: this._searchCfg.isClearable,
        shortcut: this._searchCfg.shortcut ?? null,
        errorMsg: this._searchCfg.errorMsg,
        errorDisplay: "tooltip",
        "aria-label": "Filter options",
        onSearch: (v) => this._handleFilterSearch(v),
        onClear: () => this._handleFilterClear()
      });
      this._searchEl.addEventListener("keydown", this._handleSearchKeyDown);
      panel.appendChild(this._searchEl);
    }
    this._scrollEl = document.createElement("div");
    this._scrollEl.className = "arvo-opt-list__scroll";
    this._scrollEl.id = `${this._id}-listbox`;
    this._scrollEl.setAttribute("role", "listbox");
    this._scrollEl.setAttribute("aria-label", this._options.ariaLabel);
    if (this._options.isMultiple) {
      this._scrollEl.setAttribute("aria-multiselectable", "true");
    }
    if (this._options.isLoading) {
      this._scrollEl.setAttribute("aria-busy", "true");
    }
    this._scrollEl.addEventListener("click", this._handleListClick);
    this._scrollEl.addEventListener("mousedown", this._handleListMouseDown);
    this._scrollEl.addEventListener("mouseover", this._handleListMouseOver);
    panel.appendChild(this._scrollEl);
    document.body.appendChild(panel);
    this._panelEl = panel;
  }
  _buildClasses() {
    return [
      "arvo-opt-list",
      this._options.variant === "rich" && "arvo-opt-list--rich",
      this._options.isMultiple && "arvo-opt-list--multiple",
      this._searchCfg && "arvo-opt-list--searchable",
      this._options.isLoading && "loading"
    ].filter(Boolean).join(" ");
  }
  _setupSurface() {
    if (!this._panelEl || !this._trigger) return;
    this._surface = core.createOverlaySurface({
      id: this._id,
      surface: this._panelEl,
      type: "dropdown",
      priority: 20,
      trigger: this._trigger,
      position: { placement: this._options.placement, gap: 4, width: this._options.width },
      focus: { mode: "none" },
      closeOnOutside: true,
      transition: "fade",
      triggerAria: {
        haspopup: "listbox",
        controls: `${this._id}-listbox`,
        // Redirect haspopup / controls / expanded to a nested element when
        // the consumer provides one (e.g. ArvoCombobox sends the inner
        // <input role="combobox">). When null the engine falls back to the
        // trigger automatically.
        element: this._options.triggerAriaElement
      },
      onClose: () => this._afterClose()
    });
  }
  // -------------------------------------------------------------------------
  // Options
  // -------------------------------------------------------------------------
  _getFiltered() {
    if (!this._searchCfg || !this._query) return this._options.items;
    if (isGrouped(this._options.items)) {
      return core.filterGroups(this._options.items, { query: this._query });
    }
    return core.filterItems(this._options.items, { query: this._query });
  }
  _teardownTransientInstances() {
    var _a;
    (_a = this._emptyStateInstance) == null ? void 0 : _a.destroy();
    this._emptyStateInstance = null;
    for (const cb of this._checkboxInstances) cb.destroy();
    this._checkboxInstances = [];
    for (const handle of this._truncationHandles) handle.destroy();
    this._truncationHandles = [];
  }
  _buildOptions() {
    var _a, _b, _c;
    if (!this._scrollEl) return;
    this._teardownTransientInstances();
    this._scrollEl.textContent = "";
    this._optionEls = [];
    const filtered = this._getFiltered();
    this._flatOptions = flattenItems(filtered);
    if (this._options.isLoading) {
      this._renderSkeleton();
      (_a = this._arrowNav) == null ? void 0 : _a.setItems([]);
      return;
    }
    if (this._flatOptions.length === 0) {
      this._renderEmptyState();
      (_b = this._arrowNav) == null ? void 0 : _b.setItems([]);
      return;
    }
    this._optionEls = optionListRender.renderOptionListBody(this._scrollEl, {
      block: "arvo-opt-list",
      filteredItems: filtered,
      groupIdPrefix: `${this._id}-grp`,
      hasGroupDividers: this._options.hasGroupDividers,
      optionId: (i) => `${this._id}-opt-${i}`,
      isSelected: (v) => this._isSelected(v),
      highlightedIndex: this._highlightedIndex,
      variant: this._options.variant,
      selectionMode: this._options.isMultiple ? "multiple" : "single",
      onCheckbox: (cb) => this._checkboxInstances.push(cb),
      onTruncationHandle: (h) => this._truncationHandles.push(h)
    });
    const firstEnabled = this._flatOptions.findIndex((o) => !o.isDisabled);
    if (firstEnabled >= 0) this._highlightOption(firstEnabled, false);
    (_c = this._arrowNav) == null ? void 0 : _c.setItems(this._optionEls);
  }
  _renderEmptyState() {
    if (!this._scrollEl) return;
    const wrapper = document.createElement("div");
    wrapper.className = "arvo-opt-list__empty";
    const trimmed = this._query.trim();
    const isFilterActive = !!this._searchCfg && !!trimmed;
    const totalCount = flattenItems(this._options.items).length;
    const hasAnyItems = totalCount > 0;
    let baseOpts;
    if (isFilterActive && this._options.isCreatable) {
      baseOpts = {
        size: "sm",
        orientation: "vertical",
        illustration: "no-tasks",
        title: "No results found",
        message: `Do you want to add new item "${trimmed}"`,
        secondaryAction: {
          label: "Create",
          icon: "plus",
          onClick: () => this._handleCreate()
        }
      };
    } else if (isFilterActive) {
      baseOpts = {
        size: "sm",
        orientation: "vertical",
        illustration: "no-results",
        title: "No results found",
        message: "Adjust your search query",
        secondaryAction: {
          label: "Clear search",
          onClick: () => this._handleFilterClear()
        }
      };
    } else if (!hasAnyItems) {
      baseOpts = {
        size: "sm",
        orientation: "vertical",
        illustration: "help",
        title: "No data available yet",
        message: "There are no values to display"
      };
    } else {
      baseOpts = {
        size: "sm",
        orientation: "vertical",
        illustration: "help",
        title: "No data available yet",
        message: "There are no values to display"
      };
    }
    const cfg = this._options.emptyConfig ?? {};
    const emptyOpts = {
      ...baseOpts,
      ...cfg.illustration !== void 0 ? { illustration: cfg.illustration } : {},
      ...cfg.title !== void 0 ? { title: cfg.title } : {},
      ...cfg.message !== void 0 ? { message: cfg.message } : {},
      ...cfg.secondaryAction !== void 0 ? { secondaryAction: cfg.secondaryAction } : {},
      // Force-reapply size + orientation in case emptyConfig spread above
      // overrode them via a wider type. The slot always renders compact.
      size: "sm",
      orientation: "vertical"
    };
    this._emptyStateInstance = EmptyState.ArvoEmptyState.create(emptyOpts);
    wrapper.appendChild(this._emptyStateInstance.el);
    this._scrollEl.appendChild(wrapper);
  }
  _handleCreate() {
    var _a, _b;
    const trimmed = this._query.trim();
    if (!this._options.isCreatable || !trimmed) return;
    const detail = { value: trimmed };
    (_b = (_a = this._options).onCreate) == null ? void 0 : _b.call(_a, trimmed);
    this._dispatch("option-list:create", detail);
  }
  _renderSkeleton() {
    if (!this._scrollEl) return;
    const wrap = document.createElement("div");
    wrap.className = "arvo-opt-list__skeleton";
    for (let i = 0; i < 5; i++) {
      const row = document.createElement("div");
      row.className = "arvo-opt-list__skeleton-row";
      const icon = document.createElement("div");
      icon.className = "arvo-opt-list__skeleton-icon";
      row.appendChild(icon);
      const text = document.createElement("div");
      text.className = "arvo-opt-list__skeleton-text";
      text.style.width = `${SKELETON_WIDTHS[i]}%`;
      row.appendChild(text);
      wrap.appendChild(row);
    }
    this._scrollEl.appendChild(wrap);
  }
  // -------------------------------------------------------------------------
  // Keyboard
  // -------------------------------------------------------------------------
  _setupKeyboard() {
    const hasExternalInput = !!this._options.activeDescendantElement;
    this._arrowNav = core.createArrowNav({
      items: this._optionEls,
      orientation: "vertical",
      wrap: this._options.wrapNavigation,
      onNavigate: (_el, index) => this._highlightOption(index),
      onSelect: (_el, index) => this._selectOption(this._flatOptions[index]),
      skipDisabled: (index) => {
        var _a;
        return ((_a = this._flatOptions[index]) == null ? void 0 : _a.isDisabled) === true;
      },
      ...hasExternalInput ? {} : {
        typeAhead: {
          getLabel: (index) => {
            var _a;
            return ((_a = this._flatOptions[index]) == null ? void 0 : _a.label) ?? "";
          }
        }
      }
    });
  }
  _highlightOption(index, scroll = true) {
    var _a, _b, _c, _d;
    if (this._highlightedIndex >= 0 && this._highlightedIndex < this._optionEls.length) {
      this._optionEls[this._highlightedIndex].classList.remove("highlighted");
    }
    this._highlightedIndex = index;
    if (index >= 0 && index < this._optionEls.length) {
      const el = this._optionEls[index];
      el.classList.add("highlighted");
      const optId = `${this._id}-opt-${index}`;
      (_a = this._options.activeDescendantElement ?? this._trigger) == null ? void 0 : _a.setAttribute(
        "aria-activedescendant",
        optId
      );
      (_c = (_b = this._searchEl) == null ? void 0 : _b.querySelector("input")) == null ? void 0 : _c.setAttribute("aria-activedescendant", optId);
      if (scroll) el.scrollIntoView({ block: "nearest" });
      const option = this._flatOptions[index];
      if (option) {
        this._dispatch("option-list:highlight", { value: option.value, option });
      }
    } else {
      (_d = this._options.activeDescendantElement ?? this._trigger) == null ? void 0 : _d.removeAttribute(
        "aria-activedescendant"
      );
    }
  }
  // -------------------------------------------------------------------------
  // Selection
  // -------------------------------------------------------------------------
  _selectOption(option) {
    var _a, _b;
    if (!option || option.isDisabled) return;
    let isSelected;
    if (this._options.isMultiple) {
      if (this._selection.has(option.value)) {
        this._selection.delete(option.value);
        isSelected = false;
      } else {
        this._selection.add(option.value);
        isSelected = true;
      }
      this._updateAriaSelected();
    } else {
      this._selection.clear();
      this._selection.add(option.value);
      isSelected = true;
      this._updateAriaSelected();
    }
    const value = this._options.isMultiple ? Array.from(this._selection) : option.value;
    const detail = { value, option, isSelected };
    (_b = (_a = this._options).onChange) == null ? void 0 : _b.call(_a, detail);
    this._dispatch("option-list:change", detail);
    if (this._closeOnSelect) this.close();
  }
  _updateAriaSelected() {
    const isMulti = this._options.isMultiple;
    for (let i = 0; i < this._optionEls.length; i++) {
      const item = this._flatOptions[i];
      if (!item) continue;
      const selected = this._isSelected(item.value);
      const optEl = this._optionEls[i];
      optEl.setAttribute("aria-selected", String(selected));
      if (isMulti) {
        optEl.classList.remove("active");
        const cb = this._checkboxInstances[i];
        if (cb) {
          if (cb.disabled()) {
            const input = optEl.querySelector(
              'input[type="checkbox"]'
            );
            if (input) input.checked = selected;
          } else {
            cb.toggle(selected);
          }
        }
      } else {
        optEl.classList.toggle("active", selected);
      }
    }
  }
  // -------------------------------------------------------------------------
  // Filter
  // -------------------------------------------------------------------------
  _handleFilterSearch(value) {
    var _a, _b, _c;
    this._query = value;
    this._highlightedIndex = -1;
    this._buildOptions();
    if (this._query) {
      const detail = { query: this._query, matchCount: this._flatOptions.length };
      (_b = (_a = this._searchCfg) == null ? void 0 : _a.onFilter) == null ? void 0 : _b.call(_a, this._query, this._flatOptions.length);
      this._dispatch("option-list:filter", detail);
    }
    this._updateSearchCounter();
    (_c = this._surface) == null ? void 0 : _c.reposition();
  }
  _handleFilterClear() {
    var _a, _b, _c;
    this._query = "";
    this._highlightedIndex = -1;
    this._buildOptions();
    (_b = (_a = this._searchCfg) == null ? void 0 : _a.onClear) == null ? void 0 : _b.call(_a);
    this._updateSearchCounter();
    (_c = this._surface) == null ? void 0 : _c.reposition();
  }
  _updateSearchCounter() {
    var _a;
    if (!((_a = this._searchCfg) == null ? void 0 : _a.counter) || !this._searchInstance) return;
    if (this._query) {
      this._searchInstance.counter(this._flatOptions.length, flattenItems(this._options.items).length);
    } else {
      this._searchInstance.counter();
    }
  }
  // -------------------------------------------------------------------------
  // Trigger binding
  // -------------------------------------------------------------------------
  _bindTrigger() {
    if (!this._trigger) return;
    this._trigger.addEventListener("keydown", this._handleTriggerKeyDown);
    if (this._options.bindTrigger) {
      this._trigger.addEventListener("click", this._handleTriggerClick);
    }
  }
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  open() {
    var _a, _b, _c, _d, _e;
    if (this._isOpen || this._options.isDisabled) return;
    if (((_b = (_a = this._options).onOpen) == null ? void 0 : _b.call(_a)) === false) return;
    this._isOpen = true;
    void ((_c = this._surface) == null ? void 0 : _c.open());
    (_e = (_d = this._options).onOpenChange) == null ? void 0 : _e.call(_d, true);
    this._dispatch("option-list:open");
  }
  close() {
    var _a, _b, _c, _d, _e;
    if (!this._isOpen) return;
    if (((_b = (_a = this._options).onClose) == null ? void 0 : _b.call(_a)) === false) return;
    this._isOpen = false;
    void ((_c = this._surface) == null ? void 0 : _c.close());
    (_e = (_d = this._options).onOpenChange) == null ? void 0 : _e.call(_d, false);
    this._dispatch("option-list:close");
  }
  _afterClose() {
    var _a, _b;
    if (this._isOpen) {
      this._isOpen = false;
      (_b = (_a = this._options).onOpenChange) == null ? void 0 : _b.call(_a, false);
      this._dispatch("option-list:close");
    }
  }
  isOpen() {
    return this._isOpen;
  }
  toggle(force) {
    const next = force ?? !this._isOpen;
    if (next) this.open();
    else this.close();
  }
  value(newValue) {
    if (newValue === void 0) {
      if (this._options.isMultiple) return Array.from(this._selection);
      const vals = Array.from(this._selection);
      return vals.length > 0 ? vals[0] : null;
    }
    this._selection = this._initSelection(newValue);
    this._options.value = newValue;
    this._updateAriaSelected();
  }
  setItems(items) {
    var _a, _b;
    this._options.items = items;
    this._query = "";
    (_a = this._searchInstance) == null ? void 0 : _a.clear();
    this._highlightedIndex = -1;
    this._buildOptions();
    (_b = this._surface) == null ? void 0 : _b.reposition();
  }
  setLoading(isLoading) {
    var _a, _b, _c;
    this._options.isLoading = isLoading;
    (_a = this._panelEl) == null ? void 0 : _a.classList.toggle("loading", isLoading);
    if (isLoading) (_b = this._scrollEl) == null ? void 0 : _b.setAttribute("aria-busy", "true");
    else (_c = this._scrollEl) == null ? void 0 : _c.removeAttribute("aria-busy");
    this._buildOptions();
  }
  disabled(state) {
    if (state === void 0) return this._options.isDisabled;
    this._options.isDisabled = state;
    if (state && this._isOpen) this.close();
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    this._teardownTransientInstances();
    (_a = this._surface) == null ? void 0 : _a.destroy();
    this._surface = null;
    (_b = this._arrowNav) == null ? void 0 : _b.destroy();
    this._arrowNav = null;
    (_c = this._searchInstance) == null ? void 0 : _c.destroy();
    this._searchInstance = null;
    if (this._trigger) {
      this._trigger.removeEventListener("keydown", this._handleTriggerKeyDown);
      this._trigger.removeEventListener("click", this._handleTriggerClick);
      (this._options.activeDescendantElement ?? this._trigger).removeAttribute(
        "aria-activedescendant"
      );
    }
    (_d = this._searchEl) == null ? void 0 : _d.removeEventListener("keydown", this._handleSearchKeyDown);
    (_e = this._scrollEl) == null ? void 0 : _e.removeEventListener("click", this._handleListClick);
    (_f = this._scrollEl) == null ? void 0 : _f.removeEventListener("mousedown", this._handleListMouseDown);
    (_g = this._scrollEl) == null ? void 0 : _g.removeEventListener("mouseover", this._handleListMouseOver);
    (_h = this._panelEl) == null ? void 0 : _h.remove();
    this._panelEl = null;
    this._scrollEl = null;
    this._searchEl = null;
    this._trigger = null;
    this._optionEls = [];
    this._flatOptions = [];
  }
  _dispatch(name, detail = {}) {
    var _a;
    (_a = this._trigger) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(name, { bubbles: true, cancelable: true, detail })
    );
  }
};
_ArvoOptionList.DEFAULTS = {
  items: [],
  variant: "standard",
  isMultiple: false,
  value: null,
  search: void 0,
  hasGroupDividers: true,
  isDisabled: false,
  isLoading: false,
  isCreatable: false,
  emptyConfig: null,
  ariaLabel: "Options",
  activeDescendantElement: null,
  triggerAriaElement: null,
  placement: "bottom-start",
  width: "anchor",
  maxHeight: "",
  defaultOpen: false,
  closeOnSelect: null,
  bindTrigger: true,
  wrapNavigation: true,
  onChange: null,
  onCreate: null,
  onOpenChange: null,
  onOpen: null,
  onClose: null
};
let ArvoOptionList = _ArvoOptionList;
exports.ArvoOptionList = ArvoOptionList;
//# sourceMappingURL=OptionList.cjs.map
