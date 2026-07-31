import { createPanelBase } from "../PanelBase/PanelBase.js";
import { ArvoList } from "../List/List.js";
import { ArvoAccordion } from "../Accordion/Accordion.js";
function toArraySelection(next) {
  if (next == null) return [];
  return Array.isArray(next) ? next : [next];
}
function setListSearchQuery(list, query) {
  var _a;
  const internal = list;
  if (internal._options) {
    internal._options.searchQuery = query || null;
    (_a = internal._render) == null ? void 0 : _a.call(internal);
  }
}
class ArvoFilterPanel {
  constructor(element, options = {}) {
    this._flatList = null;
    this._accordion = null;
    this._sectionLists = /* @__PURE__ */ new Map();
    this._unsubscribeSearch = null;
    this._currentQuery = "";
    this._destroyed = false;
    this._filterView = options.filterView ?? "flat";
    this._selectionMode = options.selectionMode ?? "multiple";
    this._items = options.items ?? null;
    this._groups = options.groups ?? null;
    this._selectedIds = options.selectedIds ?? options.defaultSelectedIds ?? [];
    this._listProps = options.listProps;
    this._accordionProps = options.accordionProps;
    this._onSelectionChange = options.onSelectionChange;
    this._bodyHostEl = document.createElement("div");
    this._bodyHostEl.className = "arvo-pnl__filter-host";
    this._base = createPanelBase(element, {
      ...options,
      body: this._bodyHostEl,
      panelType: "filter",
      extraHostClasses: [
        `arvo-pnl--filter-${this._filterView}`,
        `arvo-pnl--select-${this._selectionMode}`
      ]
    });
    this._buildBody();
    this._unsubscribeSearch = this._base.onSearchQueryChange((query) => {
      this._currentQuery = query;
      this._applySearchQuery();
    });
  }
  static initialize(element, options = {}) {
    return new ArvoFilterPanel(element, options);
  }
  _emitSelectionChange(next) {
    var _a;
    this._selectedIds = next;
    (_a = this._onSelectionChange) == null ? void 0 : _a.call(this, next);
    this._base.paneEl.dispatchEvent(
      new CustomEvent("pnl:filter-change", {
        bubbles: true,
        detail: { selectedIds: next }
      })
    );
  }
  _handleSectionSelection(sectionIdSet, nextForSection) {
    const preserved = this._selectedIds.filter((id) => !sectionIdSet.has(id));
    this._emitSelectionChange([...preserved, ...nextForSection]);
  }
  _innerListSelectionMode() {
    return this._selectionMode === "multiple" ? "multi" : "single";
  }
  _destroyBody() {
    var _a, _b;
    (_a = this._flatList) == null ? void 0 : _a.destroy();
    this._flatList = null;
    for (const list of this._sectionLists.values()) list.destroy();
    this._sectionLists.clear();
    (_b = this._accordion) == null ? void 0 : _b.destroy();
    this._accordion = null;
    this._bodyHostEl.textContent = "";
  }
  _buildBody() {
    this._destroyBody();
    if (this._filterView === "grouped" && this._groups) {
      this._buildGroupedBody(this._groups);
    } else {
      this._buildFlatBody(this._items ?? []);
    }
  }
  _buildFlatBody(items) {
    const mode = this._innerListSelectionMode();
    const listHost = document.createElement("div");
    this._bodyHostEl.appendChild(listHost);
    const listOptions = {
      ...this._listProps ?? {},
      selectionMode: mode,
      items,
      selectedIds: mode === "single" ? this._selectedIds[0] ?? null : this._selectedIds,
      searchQuery: this._currentQuery || void 0,
      onSelectionChange: (detail) => {
        this._emitSelectionChange(toArraySelection(detail.selectedIds));
      }
    };
    this._flatList = ArvoList.initialize(listHost, listOptions);
  }
  _buildGroupedBody(groups) {
    const mode = this._innerListSelectionMode();
    const accordionHost = document.createElement("div");
    this._bodyHostEl.appendChild(accordionHost);
    const perGroupContentEls = /* @__PURE__ */ new Map();
    const items = groups.map((group) => {
      const contentEl = document.createElement("div");
      contentEl.className = "arvo-pnl__filter-group-content";
      perGroupContentEls.set(group.id, contentEl);
      return {
        value: group.id,
        title: group.title,
        icon: group.icon,
        content: contentEl
      };
    });
    this._accordion = ArvoAccordion.initialize(accordionHost, {
      ...this._accordionProps ?? {},
      items
    });
    for (const group of groups) {
      const contentEl = perGroupContentEls.get(group.id);
      if (!contentEl) continue;
      const sectionIdSet = new Set(group.items.map((i) => i.id));
      const listHost = document.createElement("div");
      contentEl.appendChild(listHost);
      const listOptions = {
        ...this._listProps ?? {},
        selectionMode: mode,
        items: group.items,
        selectedIds: mode === "single" ? this._selectedIds.find((id) => sectionIdSet.has(id)) ?? null : this._selectedIds.filter((id) => sectionIdSet.has(id)),
        searchQuery: this._currentQuery || void 0,
        onSelectionChange: (detail) => {
          const nextForSection = toArraySelection(detail.selectedIds);
          this._handleSectionSelection(sectionIdSet, nextForSection);
        }
      };
      const list = ArvoList.initialize(listHost, listOptions);
      this._sectionLists.set(group.id, list);
    }
  }
  _applySearchQuery() {
    if (this._flatList) {
      setListSearchQuery(this._flatList, this._currentQuery);
    }
    for (const list of this._sectionLists.values()) {
      setListSearchQuery(list, this._currentQuery);
    }
  }
  // -- Public API -----------------------------------------------------
  open() {
    this._base.open();
  }
  close(reason = "programmatic") {
    this._base.close(reason);
  }
  toggle() {
    this._base.toggle();
  }
  isOpen() {
    return this._base.isOpen();
  }
  pinned(value) {
    if (value === void 0) return this._base.pinned();
    this._base.pinned(value);
  }
  setDisplayMode(mode) {
    this._base.setDisplayMode(mode);
  }
  setStickyHeader(config) {
    this._base.setStickyHeader(config);
  }
  setHeaderActions(actions) {
    this._base.setHeaderActions(actions);
  }
  setActions(actions) {
    this._base.setActions(actions);
  }
  setTitle(title) {
    this._base.setTitle(title);
  }
  setIcon(icon) {
    this._base.setIcon(icon);
  }
  setRichHeader(config) {
    this._base.setRichHeader(config);
  }
  setItems(items) {
    this._items = items;
    this._groups = null;
    if (this._filterView === "flat") this._buildBody();
  }
  setGroups(groups) {
    this._groups = groups;
    this._items = null;
    if (this._filterView === "grouped") this._buildBody();
  }
  setSelectedIds(ids) {
    this._selectedIds = ids;
    this._buildBody();
  }
  setFilterView(view) {
    if (this._filterView === view) return;
    const host = this._base.hostEl;
    host.classList.remove(`arvo-pnl--filter-${this._filterView}`);
    host.classList.add(`arvo-pnl--filter-${view}`);
    this._filterView = view;
    this._buildBody();
  }
  setSelectionMode(mode) {
    if (this._selectionMode === mode) return;
    const host = this._base.hostEl;
    host.classList.remove(`arvo-pnl--select-${this._selectionMode}`);
    host.classList.add(`arvo-pnl--select-${mode}`);
    this._selectionMode = mode;
    this._buildBody();
  }
  search(query) {
    if (query === void 0) return this._base.search();
    this._base.search(query);
  }
  selectedTab(id) {
    if (id === void 0) return this._base.selectedTab();
    this._base.selectedTab(id);
  }
  loading(state) {
    if (state === void 0) return this._base.loading();
    this._base.loading(state);
  }
  disabled(state) {
    var _a;
    if (state === void 0) return this._base.disabled();
    this._base.disabled(state);
    (_a = this._flatList) == null ? void 0 : _a.disabled(state);
    for (const list of this._sectionLists.values()) list.disabled(state);
  }
  focus(target) {
    this._base.focus(target);
  }
  size(next) {
    if (next === void 0) return this._base.size();
    this._base.size(next);
  }
  destroy() {
    var _a;
    if (this._destroyed) return;
    this._destroyed = true;
    (_a = this._unsubscribeSearch) == null ? void 0 : _a.call(this);
    this._unsubscribeSearch = null;
    this._destroyBody();
    this._base.destroy();
  }
}
export {
  ArvoFilterPanel
};
//# sourceMappingURL=FilterPanel.js.map
