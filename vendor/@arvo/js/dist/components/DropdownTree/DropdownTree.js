import { createResizeHandle } from "@arvo/core";
import { ArvoPopover } from "../Popover/Popover.js";
import { ArvoSearch } from "../Search/Search.js";
import { ArvoDropdownIconButton } from "../DropdownIconButton/DropdownIconButton.js";
import { ArvoTreeView } from "../TreeView/TreeView.js";
import { ArvoEmptyState } from "../EmptyState/EmptyState.js";
import { ArvoCheckbox } from "../Checkbox/Checkbox.js";
const DD_TREE_MIN_WIDTH = 270;
const DD_TREE_DEFAULT_WIDTH = 362;
const DD_TREE_MAX_WIDTH = 700;
const DD_TREE_MIN_HEIGHT = 272;
const SKELETON_ROW_COUNT = 6;
const NO_RESULTS_TITLE = "No results found";
const NO_RESULTS_MESSAGE = "Try adjusting your search query.";
const CLEAR_SEARCH_LABEL = "Clear Search";
const NO_DATA_DEFAULT = {
  illustration: "no-data",
  title: "No data available",
  message: "There are no items to display."
};
const HEADER_ACTIONS_MAX = 4;
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function collectAllEligibleIds(items) {
  const ids = [];
  function walk(nodes) {
    for (const node of nodes) {
      if (node.isDisabled) continue;
      ids.push(node.id);
      if (Array.isArray(node.children)) walk(node.children);
    }
  }
  walk(items);
  return ids;
}
function filterTreeByQuery(items, query) {
  const trimmed = query.trim();
  if (!trimmed) return { items, expanded: [] };
  const needle = trimmed.toLowerCase();
  const expanded = [];
  function walk(node) {
    const labelMatches = node.label.toLowerCase().includes(needle);
    const children = Array.isArray(node.children) ? node.children : null;
    if (children && children.length > 0) {
      const filteredChildren = [];
      for (const child of children) {
        const kept = walk(child);
        if (kept) filteredChildren.push(kept);
      }
      if (filteredChildren.length > 0) {
        expanded.push(node.id);
        return { ...node, children: filteredChildren };
      }
      return labelMatches ? { ...node, children } : null;
    }
    return labelMatches ? node : null;
  }
  const filtered = [];
  for (const root of items) {
    const kept = walk(root);
    if (kept) filtered.push(kept);
  }
  return { items: filtered, expanded };
}
let _idCounter = 0;
class ArvoDropdownTree {
  constructor(element, options) {
    var _a;
    this._popover = null;
    this._panelEl = null;
    this._stickyEl = null;
    this._bodyEl = null;
    this._treeHostEl = null;
    this._emptyHostEl = null;
    this._skeletonEl = null;
    this._searchInstance = null;
    this._filterInstance = null;
    this._treeInstance = null;
    this._emptyInstance = null;
    this._selectAllInstance = null;
    this._bodyState = "data";
    this._lastSeededQuery = "";
    this._resize = null;
    this._trigger = element;
    this._options = { ...options ?? {} };
    this._id = `arvo-dd-tree-${++_idCounter}`;
    this._selectionMode = this._options.selectionMode ?? "multiple";
    this._items = this._options.items ?? [];
    this._query = this._options.searchQuery ?? "";
    this._isLoading = (this._options.isLoading ?? false) === true;
    this._isControlledSelection = this._options.selectedIds !== void 0;
    this._isControlledExpansion = this._options.expandedIds !== void 0;
    this._selectedIds = this._options.selectedIds ?? this._options.defaultSelectedIds ?? [];
    this._expandedIds = this._options.expandedIds ?? this._options.defaultExpandedIds ?? [];
    this._isCommitOnApply = (this._options.commitOn ?? "apply") === "apply";
    this._draftSelectedIds = [...this._selectedIds];
    this._openSnapshot = [...this._selectedIds];
    if (typeof process !== "undefined" && process.env && process.env.NODE_ENV !== "production") {
      const closeCount = this._options.isClosable === false ? 0 : 1;
      const headerCount = (((_a = this._options.headerActions) == null ? void 0 : _a.length) ?? 0) + closeCount;
      if (headerCount > HEADER_ACTIONS_MAX) {
        console.warn(
          `ArvoDropdownTree: header has ${headerCount} actions (including the close X) -- the spec allows a maximum of ${HEADER_ACTIONS_MAX}. Consider moving overflow into the body or footer.`
        );
      }
    }
    this._resizedWidth = clamp(
      this._options.width ?? DD_TREE_DEFAULT_WIDTH,
      DD_TREE_MIN_WIDTH,
      DD_TREE_MAX_WIDTH
    );
    this._resizedHeight = this._options.height ?? null;
    if (this._options.sections !== void 0 && this._options.sections.length > 0) {
      console.warn(
        "ArvoDropdownTree: `sections` is reserved for a follow-up release and is ignored in this build. The dropdown renders the flat `items` option instead."
      );
    }
    this._stickyEl = document.createElement("div");
    this._stickyEl.className = "arvo-dd-tree__sticky";
    this._bodyEl = document.createElement("div");
    this._bodyEl.className = "arvo-dd-tree__body";
    this._treeHostEl = document.createElement("div");
    this._treeHostEl.className = "arvo-dd-tree__tree";
    this._popover = new ArvoPopover(element, {
      ...this._options.popoverProps ?? {},
      variant: "edge",
      title: this._options.title ?? "",
      hasHeader: this._options.hasHeader ?? true,
      isClosable: this._options.isClosable ?? true,
      hasBackButton: this._options.hasBackButton ?? false,
      onBack: this._options.onBack,
      headerActions: this._options.headerActions ?? [],
      placement: this._options.placement ?? "auto",
      offset: this._options.offset ?? 4,
      closeOnOutside: this._options.closeOnOutside ?? true,
      isLoading: this._isLoading,
      stickyHeader: this._stickyEl,
      content: this._bodyEl,
      actions: this._buildPopoverActions(),
      hasFooter: true,
      onOpen: () => {
        var _a2, _b;
        return (_b = (_a2 = this._options).onOpen) == null ? void 0 : _b.call(_a2);
      },
      onClose: () => {
        var _a2, _b;
        return (_b = (_a2 = this._options).onClose) == null ? void 0 : _b.call(_a2);
      }
    });
    const panelId = element.getAttribute("aria-controls");
    if (panelId) {
      this._panelEl = document.getElementById(panelId);
    }
    this._applyPanelClasses();
    this._boundOnPopoverOpen = this._handlePopoverOpen.bind(this);
    this._boundOnPopoverClose = this._handlePopoverClose.bind(this);
    element.addEventListener("popover:open", this._boundOnPopoverOpen);
    element.addEventListener("popover:close", this._boundOnPopoverClose);
    this._renderSticky();
    this._renderBody();
    if (this._isLoading) {
      this._popover.setFooterVisible(false);
    }
    if (this._options.defaultOpen) {
      queueMicrotask(() => this.open());
    }
  }
  static initialize(element, options) {
    return new ArvoDropdownTree(element, options);
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  open() {
    var _a, _b;
    this._openSnapshot = [...this._selectedIds];
    this._draftSelectedIds = [...this._selectedIds];
    (_a = this._treeInstance) == null ? void 0 : _a.selected(this._draftSelectedIds);
    this._syncSelectAllUi();
    (_b = this._popover) == null ? void 0 : _b.open();
    const searchEnabled = this._options.search !== false;
    requestAnimationFrame(() => {
      var _a2;
      if (searchEnabled && this._stickyEl) {
        const input = this._stickyEl.querySelector(
          ".arvo-dd-tree__search input, .arvo-dd-tree__search textarea"
        );
        input == null ? void 0 : input.focus();
        return;
      }
      const panel = this._panelEl;
      const firstRow = panel == null ? void 0 : panel.querySelector(
        '[role="treeitem"]:not([aria-disabled="true"])'
      );
      if (firstRow) {
        const itemId = (_a2 = firstRow.id.match(/-row-(.+)$/)) == null ? void 0 : _a2[1];
        if (itemId && this._treeInstance) {
          this._treeInstance.focusItem(itemId);
        } else {
          firstRow.focus();
        }
      }
    });
  }
  close() {
    var _a;
    (_a = this._popover) == null ? void 0 : _a.close();
  }
  isOpen() {
    var _a;
    return ((_a = this._popover) == null ? void 0 : _a.isOpen()) ?? false;
  }
  toggle() {
    var _a;
    (_a = this._popover) == null ? void 0 : _a.toggle();
  }
  selected(ids) {
    var _a;
    if (ids === void 0) {
      return [...this._selectedIds];
    }
    this._selectedIds = [...ids];
    this._draftSelectedIds = [...ids];
    (_a = this._treeInstance) == null ? void 0 : _a.selected(ids);
    this._syncSelectAllUi();
  }
  expanded(ids) {
    var _a;
    if (ids === void 0) {
      return this._treeInstance ? this._treeInstance.expanded() : [...this._expandedIds];
    }
    this._expandedIds = [...ids];
    (_a = this._treeInstance) == null ? void 0 : _a.expanded(ids);
  }
  setLoading(loading) {
    var _a, _b;
    if (this._isLoading === loading) return;
    this._isLoading = loading;
    (_a = this._popover) == null ? void 0 : _a.setLoading(loading);
    (_b = this._popover) == null ? void 0 : _b.setFooterVisible(!loading);
    this._applyPanelClasses();
    this._renderSticky();
    this._renderBody();
  }
  updateItems(items) {
    this._items = items;
    this._renderBody();
  }
  reposition() {
    var _a;
    (_a = this._popover) == null ? void 0 : _a.reposition();
  }
  destroy() {
    var _a, _b, _c;
    const trigger = this._trigger;
    if (trigger) {
      trigger.removeEventListener("popover:open", this._boundOnPopoverOpen);
      trigger.removeEventListener("popover:close", this._boundOnPopoverClose);
    }
    this._teardownResize();
    this._destroyInnerInstances();
    (_a = this._popover) == null ? void 0 : _a.destroy();
    this._popover = null;
    (_b = this._stickyEl) == null ? void 0 : _b.remove();
    (_c = this._bodyEl) == null ? void 0 : _c.remove();
    this._stickyEl = null;
    this._bodyEl = null;
    this._treeHostEl = null;
    this._panelEl = null;
    this._trigger = null;
  }
  // ---------------------------------------------------------------------------
  // Popover lifecycle wiring
  // ---------------------------------------------------------------------------
  _handlePopoverOpen() {
    this._applyPanelClasses();
    this._applyDimensions();
    this._mountResize();
    this._dispatchEvent("dd-tree:open", {});
  }
  _handlePopoverClose() {
    this._teardownResize();
    this._dispatchEvent("dd-tree:close", {});
  }
  // ---------------------------------------------------------------------------
  // Panel chrome
  // ---------------------------------------------------------------------------
  _applyPanelClasses() {
    const panel = this._panelEl;
    if (!panel) return;
    const searchEnabled = this._options.search !== false;
    const filterEnabled = this._options.filter !== false;
    const isResizable = this._options.isResizable !== false;
    const toRemove = [];
    panel.classList.forEach((c) => {
      if (c.startsWith("arvo-dd-tree")) toRemove.push(c);
    });
    toRemove.forEach((c) => panel.classList.remove(c));
    panel.classList.add("arvo-dd-tree");
    panel.classList.add(`arvo-dd-tree--${this._selectionMode}`);
    if (searchEnabled) panel.classList.add("arvo-dd-tree--with-search");
    if (filterEnabled) panel.classList.add("arvo-dd-tree--with-filter");
    if (isResizable) panel.classList.add("arvo-dd-tree--with-resize");
    if (this._isLoading) panel.classList.add("loading");
  }
  _applyDimensions() {
    const panel = this._panelEl;
    if (!panel) return;
    panel.style.width = `${clamp(
      this._resizedWidth,
      DD_TREE_MIN_WIDTH,
      DD_TREE_MAX_WIDTH
    )}px`;
    if (this._resizedHeight != null) {
      const maxH = Math.floor(window.innerHeight * 0.9);
      panel.style.height = `${clamp(
        this._resizedHeight,
        DD_TREE_MIN_HEIGHT,
        maxH
      )}px`;
    } else {
      panel.style.removeProperty("height");
    }
  }
  // ---------------------------------------------------------------------------
  // Sticky header (search + filter)
  // ---------------------------------------------------------------------------
  _renderSticky() {
    var _a, _b, _c;
    const sticky = this._stickyEl;
    if (!sticky) return;
    (_a = this._searchInstance) == null ? void 0 : _a.destroy();
    this._searchInstance = null;
    (_b = this._filterInstance) == null ? void 0 : _b.destroy();
    this._filterInstance = null;
    (_c = this._selectAllInstance) == null ? void 0 : _c.destroy();
    this._selectAllInstance = null;
    sticky.textContent = "";
    if (this._isLoading) {
      sticky.style.display = "none";
      return;
    }
    const searchEnabled = this._options.search !== false;
    const filterEnabled = this._options.filter !== false;
    const selectAllEnabled = this._options.hasGlobalSelectAll === true && this._selectionMode === "multiple" && this._items.length > 0;
    if (!searchEnabled && !filterEnabled && !selectAllEnabled) {
      sticky.style.display = "none";
      return;
    }
    sticky.style.display = "";
    let row = null;
    if (searchEnabled || filterEnabled) {
      row = document.createElement("div");
      row.className = "arvo-dd-tree__search";
      sticky.appendChild(row);
    }
    if (searchEnabled && row) {
      const searchWrap = document.createElement("div");
      searchWrap.className = "arvo-dd-tree__search-input";
      const searchHost = document.createElement("div");
      searchWrap.appendChild(searchHost);
      const searchCfg = typeof this._options.search === "object" ? this._options.search : {};
      this._searchInstance = ArvoSearch.initialize(searchHost, {
        variant: "filter",
        value: this._query,
        placeholder: searchCfg.placeholder ?? "Search",
        shortcut: searchCfg.shortcut,
        isFullWidth: true,
        "aria-label": "Filter tree",
        onChange: (value) => this._handleSearchInput(value),
        onSearch: (value) => this._handleSearchInput(value),
        onClear: () => this._handleSearchClear()
      });
      row.appendChild(searchWrap);
    }
    if (filterEnabled && row) {
      const filterWrap = document.createElement("div");
      filterWrap.className = "arvo-dd-tree__filter";
      const filterHost = document.createElement("button");
      filterHost.type = "button";
      filterWrap.appendChild(filterHost);
      const filterCfg = typeof this._options.filter === "object" ? this._options.filter : {};
      this._filterInstance = ArvoDropdownIconButton.initialize(filterHost, {
        icon: filterCfg.icon ?? "filter",
        tooltip: filterCfg.tooltip ?? "Filter",
        variant: "secondary",
        size: "sm",
        items: filterCfg.items ?? [],
        onSelect: filterCfg.onSelect
      });
      row.appendChild(filterWrap);
    }
    if (selectAllEnabled) {
      const saRow = document.createElement("div");
      saRow.className = "arvo-dd-tree__sa";
      const cbHost = document.createElement("div");
      saRow.appendChild(cbHost);
      const label = document.createElement("span");
      label.className = "arvo-dd-tree__sa__lbl";
      label.textContent = "Select all";
      label.addEventListener("click", () => this._handleSelectAllToggle());
      saRow.appendChild(label);
      sticky.appendChild(saRow);
      const state = this._computeSelectAllState();
      this._selectAllInstance = ArvoCheckbox.initialize(cbHost, {
        isChecked: state === "all",
        isIndeterminate: state === "some",
        label: null,
        onChange: () => this._handleSelectAllToggle()
      });
      const cbInput = cbHost.querySelector('input[type="checkbox"]');
      cbInput == null ? void 0 : cbInput.setAttribute("aria-label", "Select all");
    }
  }
  _handleSearchInput(value) {
    var _a, _b;
    if (this._query === value) return;
    this._query = value;
    (_b = (_a = this._options).onSearchChange) == null ? void 0 : _b.call(_a, value);
    this._renderBody();
  }
  _handleSearchClear() {
    var _a, _b, _c;
    if (this._query === "") {
      (_a = this._searchInstance) == null ? void 0 : _a.value("");
      return;
    }
    this._query = "";
    if (this._searchInstance) {
      this._searchInstance.value("");
    }
    (_c = (_b = this._options).onSearchChange) == null ? void 0 : _c.call(_b, "");
    this._renderBody();
  }
  // ---------------------------------------------------------------------------
  // Body (data / noData / noResults / loading branches)
  // ---------------------------------------------------------------------------
  /**
   * Re-paint the body slot for the current `(items, query, isLoading)` tuple.
   * Mirrors the React four-branch `renderBody`: loading > noData > noResults
   * > data. The tree host element is preserved across renders so the inner
   * ArvoTreeView keeps its DOM identity when the user types/clears within
   * the data branch.
   */
  _renderBody() {
    var _a, _b;
    const body = this._bodyEl;
    if (!body) return;
    const trimmedQuery = this._query.trim();
    const isQueryActive = trimmedQuery.length > 0;
    const { items: filteredItems, expanded: queryExpandedIds } = filterTreeByQuery(this._items, trimmedQuery);
    if (trimmedQuery !== this._lastSeededQuery && trimmedQuery.length > 0 && queryExpandedIds.length > 0 && !this._isControlledExpansion) {
      const next = Array.from(
        /* @__PURE__ */ new Set([...this._expandedIds, ...queryExpandedIds])
      );
      this._expandedIds = next;
      (_a = this._treeInstance) == null ? void 0 : _a.expanded(next);
    }
    this._lastSeededQuery = trimmedQuery;
    const nextState = this._isLoading ? "loading" : this._items.length === 0 ? "noData" : isQueryActive && filteredItems.length === 0 ? "noResults" : "data";
    const wasState = this._bodyState;
    this._bodyState = nextState;
    if (nextState !== "data" && this._treeInstance) {
      this._treeInstance.destroy();
      this._treeInstance = null;
    }
    if (nextState !== "noData" && nextState !== "noResults") {
      (_b = this._emptyInstance) == null ? void 0 : _b.destroy();
      this._emptyInstance = null;
      this._emptyHostEl = null;
    }
    if (nextState !== "loading") {
      this._skeletonEl = null;
    }
    if (wasState !== nextState) {
      body.replaceChildren();
    }
    if (nextState === "loading") {
      body.setAttribute("aria-busy", "true");
    } else {
      body.removeAttribute("aria-busy");
    }
    if (nextState === "loading") {
      this._renderSkeleton(body);
      return;
    }
    if (nextState === "noData" || nextState === "noResults") {
      this._renderEmpty(body, nextState);
      return;
    }
    if (!this._treeHostEl) {
      this._treeHostEl = document.createElement("div");
      this._treeHostEl.className = "arvo-dd-tree__tree";
    }
    if (this._treeHostEl.parentElement !== body) {
      body.replaceChildren(this._treeHostEl);
    }
    if (this._treeInstance) {
      this._treeInstance.setItems(filteredItems);
      this._treeInstance.setSearchQuery(trimmedQuery);
      if (!this._isControlledExpansion) {
        this._treeInstance.expanded(this._expandedIds);
      }
    } else {
      this._treeInstance = ArvoTreeView.initialize(this._treeHostEl, {
        ...this._options.treeProps ?? {},
        items: filteredItems,
        variant: this._selectionMode === "multiple" ? "multiSelect" : "singleSelect",
        size: this._options.size ?? "sm",
        appearance: this._options.appearance ?? "default",
        // Always treat the draft as controlled state for the embedded
        // tree so commit-on-apply works without races.
        selectedIds: this._draftSelectedIds,
        expandedIds: this._isControlledExpansion ? this._expandedIds : void 0,
        defaultExpandedIds: this._isControlledExpansion ? void 0 : this._expandedIds,
        searchQuery: trimmedQuery,
        ariaLabel: this._options.title ?? "Tree items",
        onSelectionChange: (ids, ctx) => this._handleTreeSelectionChange(ids, ctx),
        onExpandedChange: (ids, ctx) => this._handleTreeExpandedChange(ids, ctx)
      });
    }
  }
  /**
   * B4 helper -- compute the select-all checkbox state from the
   * current draft against the eligible (non-disabled) ids in the
   * unfiltered tree.
   */
  _computeSelectAllState() {
    const allEligible = collectAllEligibleIds(this._items);
    if (allEligible.length === 0) return "none";
    const draftSet = new Set(this._draftSelectedIds);
    let count = 0;
    for (const id of allEligible) if (draftSet.has(id)) count += 1;
    if (count === 0) return "none";
    if (count === allEligible.length) return "all";
    return "some";
  }
  _syncSelectAllUi() {
    if (!this._selectAllInstance) return;
    const state = this._computeSelectAllState();
    this._selectAllInstance.toggle(state === "all");
    this._selectAllInstance.indeterminate(state === "some");
  }
  _handleSelectAllToggle() {
    var _a, _b, _c;
    const state = this._computeSelectAllState();
    const next = state === "all" ? [] : collectAllEligibleIds(this._items);
    this._draftSelectedIds = next;
    (_a = this._treeInstance) == null ? void 0 : _a.selected(next);
    this._syncSelectAllUi();
    if (!this._isCommitOnApply) {
      this._selectedIds = [...next];
      const ctx = {
        item: this._items[0] ?? { id: "", label: "" },
        isSelected: state !== "all"
      };
      (_c = (_b = this._options).onSelectionChange) == null ? void 0 : _c.call(_b, next, ctx);
      this._dispatchEvent("dd-tree:change", {
        ids: [...next],
        item: ctx.item,
        isSelected: ctx.isSelected
      });
    }
  }
  _renderSkeleton(body) {
    if (!this._skeletonEl) {
      const skel = document.createElement("div");
      skel.className = "arvo-dd-tree__skeleton";
      for (let i = 0; i < SKELETON_ROW_COUNT; i++) {
        const row = document.createElement("div");
        row.className = "arvo-dd-tree__skeleton-row";
        const lead = document.createElement("span");
        lead.className = "arvo-dd-tree__skeleton-icon";
        lead.setAttribute("aria-hidden", "true");
        const text = document.createElement("span");
        text.className = "arvo-dd-tree__skeleton-text";
        text.setAttribute("aria-hidden", "true");
        const trail1 = document.createElement("span");
        trail1.className = "arvo-dd-tree__skeleton-icon";
        trail1.setAttribute("aria-hidden", "true");
        const trail2 = document.createElement("span");
        trail2.className = "arvo-dd-tree__skeleton-icon";
        trail2.setAttribute("aria-hidden", "true");
        row.append(lead, text, trail1, trail2);
        skel.appendChild(row);
      }
      this._skeletonEl = skel;
    }
    if (this._skeletonEl.parentElement !== body) {
      body.replaceChildren(this._skeletonEl);
    }
  }
  _renderEmpty(body, state) {
    if (!this._emptyHostEl) {
      this._emptyHostEl = document.createElement("div");
      this._emptyHostEl.className = "arvo-dd-tree__empty";
    }
    if (this._emptyHostEl.parentElement !== body) {
      body.replaceChildren(this._emptyHostEl);
    }
    const isNoResults = state === "noResults";
    const customCfg = this._options.emptyConfig;
    const illustration = isNoResults ? "no-results" : (customCfg == null ? void 0 : customCfg.illustration) ?? NO_DATA_DEFAULT.illustration;
    const title = isNoResults ? NO_RESULTS_TITLE : (customCfg == null ? void 0 : customCfg.title) ?? NO_DATA_DEFAULT.title;
    const message = isNoResults ? NO_RESULTS_MESSAGE : (customCfg == null ? void 0 : customCfg.message) ?? NO_DATA_DEFAULT.message;
    const noDataAction = (customCfg == null ? void 0 : customCfg.primaryAction) ? {
      label: customCfg.primaryAction.label,
      variant: customCfg.primaryAction.variant ?? "outline",
      onClick: customCfg.primaryAction.onClick
    } : void 0;
    const primaryAction = isNoResults ? {
      label: CLEAR_SEARCH_LABEL,
      variant: "outline",
      onClick: () => this._handleSearchClear()
    } : noDataAction;
    if (this._emptyInstance) {
      this._emptyInstance.update({
        size: "sm",
        orientation: "vertical",
        illustration,
        title,
        message,
        primaryAction
      });
    } else {
      this._emptyInstance = ArvoEmptyState.create({
        size: "sm",
        orientation: "vertical",
        illustration,
        title,
        message,
        primaryAction
      });
      this._emptyHostEl.appendChild(this._emptyInstance.el);
    }
  }
  _handleTreeSelectionChange(ids, ctx) {
    var _a, _b;
    this._draftSelectedIds = [...ids];
    this._syncSelectAllUi();
    if (!this._isCommitOnApply) {
      this._selectedIds = [...ids];
      (_b = (_a = this._options).onSelectionChange) == null ? void 0 : _b.call(_a, ids, ctx);
      this._dispatchEvent("dd-tree:change", {
        ids: [...ids],
        item: ctx.item,
        isSelected: ctx.isSelected
      });
    }
  }
  _handleTreeExpandedChange(ids, ctx) {
    var _a, _b;
    this._expandedIds = [...ids];
    (_b = (_a = this._options).onExpandedChange) == null ? void 0 : _b.call(_a, ids, ctx);
  }
  // ---------------------------------------------------------------------------
  // Footer actions
  // ---------------------------------------------------------------------------
  _buildPopoverActions() {
    if (this._options.actions === false) return [];
    if (this._options.actions) return this._options.actions;
    return [
      {
        id: "reset",
        label: "Reset",
        variant: "tertiary",
        action: () => {
          this._handleReset();
          return false;
        }
      },
      {
        id: "cancel",
        label: "Cancel",
        variant: "secondary",
        action: () => this._handleCancel()
      },
      {
        id: "apply",
        label: "Apply",
        variant: "primary",
        action: () => this._handleApply()
      }
    ];
  }
  _handleReset() {
    var _a, _b, _c;
    this._draftSelectedIds = [];
    (_a = this._treeInstance) == null ? void 0 : _a.selected([]);
    if (!this._isCommitOnApply) {
      this._selectedIds = [];
    }
    this._syncSelectAllUi();
    (_c = (_b = this._options).onReset) == null ? void 0 : _c.call(_b);
    this._dispatchEvent("dd-tree:reset", {});
    return false;
  }
  _handleCancel() {
    var _a, _b, _c;
    this._draftSelectedIds = [...this._openSnapshot];
    (_a = this._treeInstance) == null ? void 0 : _a.selected(this._draftSelectedIds);
    this._syncSelectAllUi();
    (_c = (_b = this._options).onCancel) == null ? void 0 : _c.call(_b);
    this._dispatchEvent("dd-tree:cancel", {});
  }
  _handleApply() {
    var _a, _b, _c, _d;
    const ids = [...this._draftSelectedIds];
    const result = (_b = (_a = this._options).onApply) == null ? void 0 : _b.call(_a, ids);
    if (result === false) return false;
    if (this._isCommitOnApply) {
      this._selectedIds = ids;
      (_d = (_c = this._options).onSelectionChange) == null ? void 0 : _d.call(_c, ids, {
        item: this._items[0] ?? { id: "", label: "" },
        isSelected: true
      });
    }
    this._dispatchEvent("dd-tree:apply", { ids });
    return void 0;
  }
  // ---------------------------------------------------------------------------
  // Resize adapter
  // ---------------------------------------------------------------------------
  _mountResize() {
    if (this._resize) return;
    if (this._options.isResizable === false) return;
    const panel = this._panelEl;
    if (!panel) return;
    this._resize = createResizeHandle(panel, {
      corners: ["bottom-left", "bottom-right"],
      min: { width: DD_TREE_MIN_WIDTH, height: DD_TREE_MIN_HEIGHT },
      max: (rect) => ({
        width: Math.max(
          DD_TREE_MIN_WIDTH,
          Math.min(DD_TREE_MAX_WIDTH, window.innerWidth - rect.left - 16)
        ),
        height: Math.max(
          DD_TREE_MIN_HEIGHT,
          Math.min(
            Math.floor(window.innerHeight * 0.9),
            window.innerHeight - rect.top - 16
          )
        )
      }),
      viewportPadding: 16,
      onResize: (rect) => {
        var _a, _b;
        this._resizedWidth = rect.width;
        this._resizedHeight = rect.height;
        (_b = (_a = this._options).onResize) == null ? void 0 : _b.call(_a, rect);
      },
      onCommit: (rect) => {
        var _a, _b, _c;
        this._resizedWidth = rect.width;
        this._resizedHeight = rect.height;
        (_b = (_a = this._options).onResizeCommit) == null ? void 0 : _b.call(_a, rect);
        (_c = this._popover) == null ? void 0 : _c.reposition();
      }
    });
    this._resize.mount();
  }
  _teardownResize() {
    var _a;
    (_a = this._resize) == null ? void 0 : _a.destroy();
    this._resize = null;
  }
  // ---------------------------------------------------------------------------
  // Inner instance teardown
  // ---------------------------------------------------------------------------
  _destroyInnerInstances() {
    var _a, _b, _c, _d, _e;
    (_a = this._searchInstance) == null ? void 0 : _a.destroy();
    this._searchInstance = null;
    (_b = this._filterInstance) == null ? void 0 : _b.destroy();
    this._filterInstance = null;
    (_c = this._treeInstance) == null ? void 0 : _c.destroy();
    this._treeInstance = null;
    (_d = this._emptyInstance) == null ? void 0 : _d.destroy();
    this._emptyInstance = null;
    (_e = this._selectAllInstance) == null ? void 0 : _e.destroy();
    this._selectAllInstance = null;
    this._emptyHostEl = null;
    this._skeletonEl = null;
  }
  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------
  _dispatchEvent(name, detail) {
    var _a;
    (_a = this._trigger) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(name, { bubbles: true, cancelable: true, detail })
    );
  }
}
export {
  ArvoDropdownTree,
  DD_TREE_DEFAULT_WIDTH,
  DD_TREE_MAX_WIDTH,
  DD_TREE_MIN_HEIGHT,
  DD_TREE_MIN_WIDTH
};
//# sourceMappingURL=DropdownTree.js.map
