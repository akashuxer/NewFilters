"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const core = require("@arvo/core");
const FormLabel = require("../FormLabel/FormLabel.cjs");
const Search = require("../Search/Search.cjs");
const menuSearch = require("../../types/menu-search.cjs");
const optionListRender = require("../../internal/option-list-render.cjs");
let _idCounter = 0;
const isGrouped = optionListRender.isGroupedOptions;
const flattenItems = optionListRender.flattenOptions;
const SKELETON_WIDTHS = [60, 67, 74, 81, 58];
const _ArvoListbox = class _ArvoListbox {
  constructor(element, options) {
    this._listEl = null;
    this._searchEl = null;
    this._searchInstance = null;
    this._skeletonEl = null;
    this._emptyEl = null;
    this._labelEl = null;
    this._searchCfg = null;
    this._highlightedIndex = -1;
    this._flatOptions = [];
    this._query = "";
    this._arrowNav = null;
    this._optionEls = [];
    this._truncationHandles = [];
    this._handleKeyDown = (e) => {
      var _a;
      if (this._options.isDisabled || this._options.isLoading) return;
      (_a = this._arrowNav) == null ? void 0 : _a.handleKeyDown(e);
    };
    this._handleListClick = (e) => {
      if (this._options.isDisabled || this._options.isLoading) return;
      const target = e.target.closest(".arvo-listbox__opt");
      if (!target) return;
      const indexStr = target.getAttribute("data-index");
      if (indexStr == null) return;
      const index = parseInt(indexStr, 10);
      const item = this._flatOptions[index];
      if (!item || item.isDisabled) return;
      this._highlightOption(index, false);
      this._selectOption(item);
    };
    this._element = element;
    this._id = `arvo-listbox-${++_idCounter}`;
    const initialValue = options.value !== void 0 ? options.value ?? null : options.defaultValue !== void 0 ? options.defaultValue ?? null : null;
    this._options = {
      ..._ArvoListbox.DEFAULTS,
      ...options,
      value: initialValue,
      onChange: options.onChange ?? null,
      onHighlight: options.onHighlight ?? null,
      onFilter: options.onFilter ?? null
    };
    this._searchCfg = menuSearch.normalizeSearch(
      this._options.search,
      { shortcut: "/" }
    );
    this._selection = this._initSelection(this._options.value);
    this._render();
    this._buildOptions();
    this._setupKeyboard();
  }
  static initialize(element, options) {
    return new _ArvoListbox(element, options);
  }
  // ---------------------------------------------------------------------------
  // Selection initialization
  // ---------------------------------------------------------------------------
  _initSelection(value) {
    if (value == null) return /* @__PURE__ */ new Set();
    if (this._options.isMultiple && Array.isArray(value)) return new Set(value);
    return /* @__PURE__ */ new Set([value]);
  }
  _isSelected(optionValue) {
    return this._selection.has(optionValue);
  }
  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  _render() {
    const el = this._element;
    if (!el) return;
    this._applyClasses();
    if (this._options.label) {
      this._labelEl = FormLabel.ArvoFormLabel.initialize(null, {
        text: this._options.label,
        for: this._id,
        isRequired: this._options.isRequired,
        contextHelp: this._options.contextHelp
      }).el;
      this._labelEl.id = `${this._id}-lbl`;
      this._labelEl.classList.add("arvo-listbox__lbl");
      el.appendChild(this._labelEl);
    }
    if (this._searchCfg) {
      this._searchEl = document.createElement("div");
      const classes = ["arvo-listbox__search"];
      if (this._searchCfg.className) classes.push(this._searchCfg.className);
      this._searchEl.className = classes.join(" ");
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
        isDisabled: this._options.isDisabled,
        "aria-label": "Filter options",
        onSearch: (value) => {
          this._handleFilterSearch(value);
        },
        onClear: () => {
          this._handleFilterClear();
        }
      });
      this._searchEl.addEventListener("keydown", (e) => {
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
      });
      el.appendChild(this._searchEl);
    }
    this._listEl = document.createElement("div");
    this._listEl.id = this._id;
    this._listEl.className = "arvo-listbox__list";
    this._listEl.setAttribute("role", "listbox");
    this._listEl.setAttribute("tabindex", this._options.isDisabled ? "-1" : "0");
    if (this._options.isMultiple) {
      this._listEl.setAttribute("aria-multiselectable", "true");
    }
    if (this._labelEl) {
      this._listEl.setAttribute("aria-labelledby", `${this._id}-lbl`);
    }
    if (this._options.isLoading) {
      this._listEl.setAttribute("aria-busy", "true");
    }
    if (this._options.isDisabled) {
      this._listEl.setAttribute("aria-disabled", "true");
    }
    if (this._options.isRequired) {
      this._listEl.setAttribute("aria-required", "true");
    }
    this._listEl.addEventListener("click", this._handleListClick);
    el.appendChild(this._listEl);
  }
  _applyClasses() {
    const el = this._element;
    if (!el) return;
    el.className = [
      "arvo-listbox",
      this._options.isMultiple && "arvo-listbox--multiple",
      this._searchCfg && "arvo-listbox--searchable",
      this._options.isLoading && "loading",
      this._options.isDisabled && "is-disabled"
    ].filter(Boolean).join(" ");
  }
  // ---------------------------------------------------------------------------
  // Options rendering
  // ---------------------------------------------------------------------------
  _buildOptions() {
    var _a;
    if (!this._listEl) return;
    this._clearListContent();
    const filtered = this._getFilteredItems();
    this._flatOptions = flattenItems(filtered);
    this._optionEls = [];
    if (this._options.isLoading) {
      this._renderSkeleton();
      return;
    }
    if (this._flatOptions.length === 0) {
      this._renderEmpty();
      return;
    }
    this._emptyEl = null;
    this._skeletonEl = null;
    for (const handle of this._truncationHandles) handle.destroy();
    this._truncationHandles = [];
    this._optionEls = optionListRender.renderOptionListBody(this._listEl, {
      block: "arvo-listbox",
      filteredItems: filtered,
      groupIdPrefix: `${this._id}-grp`,
      hasGroupDividers: this._options.hasGroupDividers,
      optionId: (i) => `${this._id}-opt-${i}`,
      isSelected: (v) => this._isSelected(v),
      highlightedIndex: this._highlightedIndex,
      onTruncationHandle: (h) => this._truncationHandles.push(h)
    });
    const firstEnabled = this._flatOptions.findIndex((item) => !item.isDisabled);
    if (firstEnabled >= 0) {
      this._highlightOption(firstEnabled, false);
    }
    (_a = this._arrowNav) == null ? void 0 : _a.setItems(this._optionEls);
  }
  _renderSkeleton() {
    this._skeletonEl = document.createElement("div");
    this._skeletonEl.className = "arvo-listbox__skeleton";
    for (let i = 0; i < 5; i++) {
      const row = document.createElement("div");
      row.className = "arvo-listbox__skeleton-row";
      const icon = document.createElement("div");
      icon.className = "arvo-listbox__skeleton-icon";
      row.appendChild(icon);
      const text = document.createElement("div");
      text.className = "arvo-listbox__skeleton-text";
      text.style.width = `${SKELETON_WIDTHS[i]}%`;
      row.appendChild(text);
      this._skeletonEl.appendChild(row);
    }
    this._listEl.appendChild(this._skeletonEl);
  }
  _renderEmpty() {
    this._emptyEl = document.createElement("div");
    this._emptyEl.className = "arvo-listbox__empty";
    this._emptyEl.setAttribute("role", "status");
    this._emptyEl.textContent = this._options.emptyMessage;
    this._listEl.appendChild(this._emptyEl);
  }
  _clearListContent() {
    if (!this._listEl) return;
    this._listEl.textContent = "";
    this._optionEls = [];
    this._flatOptions = [];
    this._skeletonEl = null;
    this._emptyEl = null;
  }
  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------
  _getFilteredItems() {
    if (!this._searchCfg || !this._query) return this._options.items;
    if (isGrouped(this._options.items)) {
      return core.filterGroups(this._options.items, { query: this._query });
    }
    return core.filterItems(this._options.items, { query: this._query });
  }
  // ---------------------------------------------------------------------------
  // Keyboard Setup
  // ---------------------------------------------------------------------------
  _setupKeyboard() {
    if (!this._listEl) return;
    this._arrowNav = core.createArrowNav({
      items: this._optionEls,
      orientation: "vertical",
      wrap: true,
      onNavigate: (_item, index) => {
        this._highlightOption(index);
      },
      onSelect: (_item, index) => {
        this._selectOption(this._flatOptions[index]);
      },
      skipDisabled: (index) => {
        var _a;
        return ((_a = this._flatOptions[index]) == null ? void 0 : _a.isDisabled) === true;
      },
      typeAhead: {
        getLabel: (index) => {
          var _a;
          return ((_a = this._flatOptions[index]) == null ? void 0 : _a.label) ?? "";
        }
      }
    });
    this._listEl.addEventListener("keydown", this._handleKeyDown);
  }
  _handleFilterSearch(value) {
    var _a, _b, _c, _d, _e;
    this._query = value;
    this._highlightedIndex = -1;
    this._buildOptions();
    const matchCount = this._flatOptions.length;
    if (this._query) {
      const detail = { query: this._query, matchCount };
      (_b = (_a = this._searchCfg) == null ? void 0 : _a.onFilter) == null ? void 0 : _b.call(_a, this._query, matchCount);
      (_d = (_c = this._options).onFilter) == null ? void 0 : _d.call(_c, detail);
      (_e = this._element) == null ? void 0 : _e.dispatchEvent(
        new CustomEvent("listbox:filter", {
          bubbles: true,
          cancelable: true,
          detail
        })
      );
    }
    this._updateSearchCounter();
  }
  _handleFilterClear() {
    var _a, _b;
    this._query = "";
    this._highlightedIndex = -1;
    this._buildOptions();
    (_b = (_a = this._searchCfg) == null ? void 0 : _a.onClear) == null ? void 0 : _b.call(_a);
    this._updateSearchCounter();
  }
  _updateSearchCounter() {
    var _a;
    if (!((_a = this._searchCfg) == null ? void 0 : _a.counter) || !this._searchInstance) return;
    if (this._query) {
      const total = flattenItems(this._options.items).length;
      this._searchInstance.counter(this._flatOptions.length, total);
    } else {
      this._searchInstance.counter();
    }
  }
  // _handleListMouseOver intentionally removed -- hovering a listbox option
  // does not promote it to the keyboard-active item. Use the dropdown / action
  // menu hover pattern for that behavior.
  // ---------------------------------------------------------------------------
  // Highlight Logic
  // ---------------------------------------------------------------------------
  _highlightOption(index, scroll = true) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (this._highlightedIndex >= 0 && this._highlightedIndex < this._optionEls.length) {
      this._optionEls[this._highlightedIndex].classList.remove("highlighted");
    }
    this._highlightedIndex = index;
    if (index >= 0 && index < this._optionEls.length) {
      const el = this._optionEls[index];
      el.classList.add("highlighted");
      const optId = `${this._id}-opt-${index}`;
      (_a = this._listEl) == null ? void 0 : _a.setAttribute("aria-activedescendant", optId);
      const searchInput = (_b = this._searchEl) == null ? void 0 : _b.querySelector("input");
      searchInput == null ? void 0 : searchInput.setAttribute("aria-activedescendant", optId);
      if (scroll) {
        el.scrollIntoView({ block: "nearest" });
      }
      const option = this._flatOptions[index];
      if (option) {
        const detail = { value: option.value, option };
        (_d = (_c = this._options).onHighlight) == null ? void 0 : _d.call(_c, detail);
        (_e = this._element) == null ? void 0 : _e.dispatchEvent(
          new CustomEvent("listbox:highlight", {
            bubbles: true,
            cancelable: true,
            detail
          })
        );
      }
    } else {
      (_f = this._listEl) == null ? void 0 : _f.removeAttribute("aria-activedescendant");
      const searchInput = (_g = this._searchEl) == null ? void 0 : _g.querySelector("input");
      searchInput == null ? void 0 : searchInput.removeAttribute("aria-activedescendant");
    }
  }
  // ---------------------------------------------------------------------------
  // Selection Logic
  // ---------------------------------------------------------------------------
  _selectOption(option) {
    var _a, _b, _c;
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
    const detail = {
      value: option.value,
      option,
      isSelected
    };
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent("listbox:change", {
        bubbles: true,
        cancelable: true,
        detail
      })
    );
    (_c = (_b = this._options).onChange) == null ? void 0 : _c.call(_b, detail);
  }
  _updateAriaSelected() {
    for (let i = 0; i < this._optionEls.length; i++) {
      const item = this._flatOptions[i];
      if (item) {
        const isSelected = this._isSelected(item.value);
        this._optionEls[i].setAttribute("aria-selected", String(isSelected));
        this._optionEls[i].classList.toggle("active", isSelected);
      }
    }
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  value(newValue) {
    if (newValue === void 0) {
      if (this._options.isMultiple) {
        return Array.from(this._selection);
      }
      const vals = Array.from(this._selection);
      return vals.length > 0 ? vals[0] : null;
    }
    this._selection = this._initSelection(newValue);
    this._options.value = newValue;
    this._updateAriaSelected();
  }
  updateItems(items) {
    var _a;
    this._options.items = items;
    this._query = "";
    (_a = this._searchInstance) == null ? void 0 : _a.clear();
    this._highlightedIndex = -1;
    this._buildOptions();
  }
  highlightOption(optValue) {
    const index = this._flatOptions.findIndex((item) => item.value === optValue);
    if (index >= 0) {
      this._highlightOption(index);
    }
  }
  getHighlightedOption() {
    if (this._highlightedIndex >= 0 && this._highlightedIndex < this._flatOptions.length) {
      const opt = this._flatOptions[this._highlightedIndex];
      return { value: opt.value, label: opt.label };
    }
    return null;
  }
  clear() {
    this._selection.clear();
    this._updateAriaSelected();
  }
  filter(query) {
    var _a, _b, _c, _d;
    this._query = query;
    (_a = this._searchInstance) == null ? void 0 : _a.value(query);
    this._highlightedIndex = -1;
    this._buildOptions();
    if (query) {
      const detail = { query, matchCount: this._flatOptions.length };
      (_c = (_b = this._options).onFilter) == null ? void 0 : _c.call(_b, detail);
      (_d = this._element) == null ? void 0 : _d.dispatchEvent(
        new CustomEvent("listbox:filter", {
          bubbles: true,
          cancelable: true,
          detail
        })
      );
    }
  }
  clearFilter() {
    this.filter("");
  }
  disabled(state) {
    var _a, _b;
    if (state === void 0) return this._options.isDisabled;
    this._options.isDisabled = state;
    (_a = this._element) == null ? void 0 : _a.classList.toggle("is-disabled", state);
    if (this._listEl) {
      this._listEl.setAttribute("tabindex", state ? "-1" : "0");
      if (state) {
        this._listEl.setAttribute("aria-disabled", "true");
      } else {
        this._listEl.removeAttribute("aria-disabled");
      }
    }
    (_b = this._searchInstance) == null ? void 0 : _b.disabled(state);
  }
  setLoading(isLoading) {
    var _a;
    this._options.isLoading = isLoading;
    (_a = this._element) == null ? void 0 : _a.classList.toggle("loading", isLoading);
    if (this._listEl) {
      if (isLoading) {
        this._listEl.setAttribute("aria-busy", "true");
      } else {
        this._listEl.removeAttribute("aria-busy");
      }
    }
    this._buildOptions();
  }
  scrollToOption(optValue) {
    const index = this._flatOptions.findIndex((item) => item.value === optValue);
    if (index >= 0 && index < this._optionEls.length) {
      this._optionEls[index].scrollIntoView({ block: "nearest" });
    }
  }
  destroy() {
    var _a, _b, _c, _d;
    (_a = this._listEl) == null ? void 0 : _a.removeEventListener("keydown", this._handleKeyDown);
    (_b = this._listEl) == null ? void 0 : _b.removeEventListener("click", this._handleListClick);
    (_c = this._searchInstance) == null ? void 0 : _c.destroy();
    this._searchInstance = null;
    (_d = this._arrowNav) == null ? void 0 : _d.destroy();
    this._arrowNav = null;
    if (this._element) {
      this._element.textContent = "";
      this._element.className = "";
    }
    for (const handle of this._truncationHandles) handle.destroy();
    this._truncationHandles = [];
    this._element = null;
    this._listEl = null;
    this._searchEl = null;
    this._skeletonEl = null;
    this._emptyEl = null;
    this._labelEl = null;
    this._optionEls = [];
    this._flatOptions = [];
  }
};
_ArvoListbox.DEFAULTS = {
  items: [],
  value: null,
  label: "",
  contextHelp: null,
  isMultiple: false,
  search: void 0,
  isLoading: false,
  isDisabled: false,
  isRequired: false,
  emptyMessage: "No options",
  hasGroupDividers: true,
  onChange: null,
  onHighlight: null,
  onFilter: null
};
let ArvoListbox = _ArvoListbox;
exports.ArvoListbox = ArvoListbox;
//# sourceMappingURL=Listbox.cjs.map
