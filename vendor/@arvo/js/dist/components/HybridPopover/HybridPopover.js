import { filterGroups, filterItems, createResizeHandle, createInlinePanelStack } from "@arvo/core";
import { formatMatchCountMessage } from "@arvo/utils";
import { ArvoPopover } from "../Popover/Popover.js";
import { ArvoSearch } from "../Search/Search.js";
import { ArvoButtonGroup } from "../ButtonGroup/ButtonGroup.js";
import { ArvoBannerAlert } from "../BannerAlert/BannerAlert.js";
import { ArvoMessageAlert } from "../MessageAlert/MessageAlert.js";
import { ArvoList } from "../List/List.js";
import { toListPayload, mapListEmptyState, resolveItemInline, isPopoverInlineConfig } from "./hpop-helpers.js";
const HPOP_MIN_WIDTH = 270;
const HPOP_DEFAULT_WIDTH = 360;
const HPOP_MAX_WIDTH = 700;
const HPOP_MIN_HEIGHT = 272;
const HPOP_SKELETON_ROWS = 12;
function isGrouped(items) {
  return items.length > 0 && "items" in items[0];
}
function flattenItems(items) {
  if (isGrouped(items)) return items.flatMap((g) => g.items);
  return items;
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function resolveSelection(variant, selectionMode) {
  if (selectionMode) return selectionMode;
  if (variant === "multi") return "multi";
  if (variant === "single") return "single";
  return "multi";
}
function defaultDraft(selection, seedValue) {
  const seed = seedValue ?? null;
  if (selection === "multi") {
    return Array.isArray(seed) ? [...seed] : [];
  }
  if (selection === "single") {
    return typeof seed === "string" ? seed : null;
  }
  return null;
}
function valuesEqual(a, b) {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
  }
  return false;
}
function cloneValue(v) {
  if (Array.isArray(v)) return [...v];
  return v;
}
function applyReorder(items, fromIndex, toIndex, fromGroup, toGroup) {
  if (!isGrouped(items)) {
    const arr = [...items];
    if (fromIndex < 0 || fromIndex >= arr.length) return items;
    const [moved2] = arr.splice(fromIndex, 1);
    const insertIdx2 = clamp(toIndex, 0, arr.length);
    arr.splice(insertIdx2, 0, moved2);
    return arr;
  }
  const groups = items;
  const flat = [];
  groups.forEach(
    (g) => g.items.forEach((it) => flat.push({ item: it, groupId: g.id }))
  );
  if (fromIndex < 0 || fromIndex >= flat.length) return items;
  const [moved] = flat.splice(fromIndex, 1);
  const targetGroupId = toGroup ?? fromGroup ?? moved.groupId;
  moved.groupId = targetGroupId;
  const insertIdx = clamp(toIndex, 0, flat.length);
  flat.splice(insertIdx, 0, moved);
  return groups.map((g) => ({
    ...g,
    items: flat.filter((entry) => entry.groupId === g.id).map((e) => e.item)
  }));
}
let _inlineIdCounter = 0;
let _idCounter = 0;
class ArvoHybridPopover {
  constructor(element, options) {
    this._query = "";
    this._popover = null;
    this._panelEl = null;
    this._stickyEl = null;
    this._bodyEl = null;
    this._searchInstance = null;
    this._bannerInstance = null;
    this._messageAlertInstance = null;
    this._conditionalInstance = null;
    this._inlinePanelStack = null;
    this._inlinePanelInstances = /* @__PURE__ */ new Map();
    this._listInstance = null;
    this._clearSearchInstance = null;
    this._appliesToAllAlertInstance = null;
    this._resize = null;
    this._trigger = element;
    this._options = { ...options ?? {} };
    this._id = `arvo-hpop-${++_idCounter}`;
    const variant = this._options.variant ?? "multi";
    this._selection = resolveSelection(variant, this._options.selectionMode);
    if (variant === "boolean" || variant === "conditional" || variant === "custom") {
      console.warn(
        `HybridPopover: variant "${variant}" is not yet implemented.`
      );
    }
    this._isControlledItems = this._options.items !== void 0 && this._options.defaultItems === void 0;
    this._items = this._options.items ?? this._options.defaultItems ?? [];
    this._isLoading = !!this._options.isLoading;
    this._resizedWidth = clamp(
      this._options.width ?? HPOP_DEFAULT_WIDTH,
      HPOP_MIN_WIDTH,
      HPOP_MAX_WIDTH
    );
    this._resizedHeight = this._options.height ?? null;
    const seedRaw = this._options.value !== void 0 ? this._options.value : this._options.defaultValue ?? null;
    this._committed = defaultDraft(this._selection, seedRaw);
    this._draft = defaultDraft(this._selection, this._committed);
    this._stickyEl = document.createElement("div");
    this._stickyEl.className = "arvo-hpop__sticky";
    this._bodyEl = document.createElement("div");
    this._bodyEl.className = "arvo-hpop__body-root";
    this._popover = new ArvoPopover(element, {
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
      isInline: this._options.isInline ?? false,
      stickyHeader: this._stickyEl,
      content: this._bodyEl,
      actions: this._buildPopoverActions(),
      hasFooter: true,
      onOpen: () => {
        var _a, _b;
        return (_b = (_a = this._options).onOpen) == null ? void 0 : _b.call(_a);
      },
      onClose: () => {
        var _a, _b;
        return (_b = (_a = this._options).onClose) == null ? void 0 : _b.call(_a);
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
    return new ArvoHybridPopover(element, options);
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  open() {
    var _a;
    (_a = this._popover) == null ? void 0 : _a.open();
    if (this._options.search !== false && this._stickyEl) {
      requestAnimationFrame(() => {
        var _a2;
        const input = (_a2 = this._stickyEl) == null ? void 0 : _a2.querySelector(
          ".arvo-hpop__search input, .arvo-hpop__search textarea"
        );
        input == null ? void 0 : input.focus();
      });
    }
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
  value(newValue) {
    if (newValue === void 0) {
      return cloneValue(this._committed);
    }
    const prev = this._committed;
    this._committed = cloneValue(newValue);
    this._draft = defaultDraft(this._selection, this._committed);
    this._renderBody();
    if (!valuesEqual(this._committed, prev)) {
      this._fireChange(this._committed, { item: null, action: "apply" });
    }
  }
  setLoading(loading) {
    var _a, _b;
    if (this._isLoading === loading) return;
    this._isLoading = loading;
    (_a = this._popover) == null ? void 0 : _a.setLoading(loading);
    (_b = this._popover) == null ? void 0 : _b.setFooterVisible(!loading);
    this._renderSticky();
    this._renderBody();
    this._applyPanelClasses();
  }
  updateItems(items) {
    this._items = items;
    this._renderSticky();
    this._renderBody();
    this._applyPanelClasses();
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
    this._closeAllInlinePanels();
    this._teardownResize();
    this._teardownInlineStack();
    this._destroyInnerInstances();
    (_a = this._popover) == null ? void 0 : _a.destroy();
    this._popover = null;
    (_b = this._stickyEl) == null ? void 0 : _b.remove();
    (_c = this._bodyEl) == null ? void 0 : _c.remove();
    this._stickyEl = null;
    this._bodyEl = null;
    this._panelEl = null;
    this._trigger = null;
  }
  // ---------------------------------------------------------------------------
  // Popover lifecycle wiring
  // ---------------------------------------------------------------------------
  _handlePopoverOpen() {
    this._draft = defaultDraft(this._selection, this._committed);
    this._query = "";
    this._renderSticky();
    this._renderBody();
    this._applyPanelClasses();
    this._applyDimensions();
    this._mountInlineStack();
    this._mountResize();
    this._dispatchEvent("hpop:open", {});
  }
  _handlePopoverClose() {
    this._closeAllInlinePanels();
    this._teardownResize();
    this._teardownInlineStack();
    this._dispatchEvent("hpop:close", {});
  }
  // ---------------------------------------------------------------------------
  // Panel chrome
  // ---------------------------------------------------------------------------
  /**
   * Effective data state: explicit prop wins over inferred. Precedence
   * mirrors spec 6.10: isLoading > noResults > noData > appliesToAll > data.
   * `dataState='data'` defers to the inferred path
   * (totalCount === 0 -> noData, otherwise filteredCount === 0 -> noResults).
   */
  _resolveDataState() {
    const prop = this._options.dataState ?? "data";
    if (prop !== "data") return prop;
    const flatAll = flattenItems(this._items);
    const totalCount = flatAll.length;
    if (totalCount === 0) return "noData";
    const filteredCount = this._getFilteredItems().__filteredCount;
    if (filteredCount === 0) return "noResults";
    return "data";
  }
  _applyPanelClasses() {
    var _a;
    const panel = this._panelEl;
    if (!panel) return;
    const variant = this._options.variant ?? "multi";
    const searchEnabled = this._options.search !== false;
    const conditional = this._options.conditional;
    const isResizable = this._options.isResizable ?? true;
    const dataState = this._resolveDataState();
    const toRemove = [];
    panel.classList.forEach((c) => {
      if (c.startsWith("arvo-hpop")) toRemove.push(c);
    });
    toRemove.forEach((c) => panel.classList.remove(c));
    panel.classList.add("arvo-hpop");
    panel.classList.add(`arvo-hpop--${variant}`);
    const bannerAlert = this._options.bannerAlert;
    if (bannerAlert !== false && bannerAlert) {
      panel.classList.add("arvo-hpop--with-banner");
    }
    if (searchEnabled) panel.classList.add("arvo-hpop--with-search");
    if (conditional) {
      panel.classList.add("arvo-hpop--with-conditional");
    }
    if (isResizable) panel.classList.add("arvo-hpop--with-resize");
    if (dataState === "noData") panel.classList.add("arvo-hpop--no-data");
    else if (dataState === "noResults") panel.classList.add("arvo-hpop--no-results");
    else if (dataState === "appliesToAll") panel.classList.add("arvo-hpop--applies-to-all");
    if (!this._isLoading) {
      (_a = this._popover) == null ? void 0 : _a.setFooterVisible(dataState !== "noData");
    }
    if (this._isLoading) panel.classList.add("loading");
  }
  _applyDimensions() {
    const panel = this._panelEl;
    if (!panel) return;
    panel.style.width = `${clamp(
      this._resizedWidth,
      HPOP_MIN_WIDTH,
      HPOP_MAX_WIDTH
    )}px`;
    if (this._resizedHeight != null) {
      const maxH = Math.floor(window.innerHeight * 0.9);
      panel.style.height = `${clamp(
        this._resizedHeight,
        HPOP_MIN_HEIGHT,
        maxH
      )}px`;
    } else {
      panel.style.removeProperty("height");
    }
  }
  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------
  _getFilteredItems() {
    const items = this._items;
    const grouped = isGrouped(items);
    const searchEnabled = this._options.search !== false;
    const query = this._query;
    let filtered;
    if (!searchEnabled || !query) {
      filtered = items;
    } else if (grouped) {
      filtered = filterGroups(items, {
        query,
        keys: ["label"]
      });
    } else {
      filtered = filterItems(items, {
        query,
        keys: ["label"]
      });
    }
    const flatFiltered = flattenItems(filtered);
    const flatAll = flattenItems(items);
    return {
      filtered,
      flatFiltered,
      flatAll,
      grouped,
      __filteredCount: flatFiltered.length
    };
  }
  // ---------------------------------------------------------------------------
  // Sticky header (search + conditional)
  // ---------------------------------------------------------------------------
  _renderSticky() {
    var _a, _b, _c, _d;
    const sticky = this._stickyEl;
    if (!sticky) return;
    (_a = this._searchInstance) == null ? void 0 : _a.destroy();
    this._searchInstance = null;
    (_b = this._bannerInstance) == null ? void 0 : _b.destroy();
    this._bannerInstance = null;
    (_c = this._messageAlertInstance) == null ? void 0 : _c.destroy();
    this._messageAlertInstance = null;
    (_d = this._conditionalInstance) == null ? void 0 : _d.destroy();
    this._conditionalInstance = null;
    sticky.textContent = "";
    if (this._isLoading) {
      sticky.style.display = "none";
      return;
    }
    const searchEnabled = this._options.search !== false;
    const conditional = this._options.conditional;
    const bannerAlert = this._options.bannerAlert;
    const showBanner = bannerAlert !== false && !!bannerAlert;
    const showSearch = searchEnabled;
    const showConditional = !!conditional;
    const dataState = this._resolveDataState();
    if (dataState === "noData" || !showBanner && !showSearch && !showConditional) {
      sticky.style.display = "none";
      return;
    }
    sticky.style.display = "";
    if (showBanner && bannerAlert) {
      const bannerWrap = document.createElement("div");
      bannerWrap.className = "arvo-hpop__banner";
      const bannerHost = document.createElement("div");
      bannerWrap.appendChild(bannerHost);
      this._bannerInstance = ArvoBannerAlert.initialize(bannerHost, bannerAlert);
      sticky.appendChild(bannerWrap);
    }
    if (showSearch) {
      const searchWrap = document.createElement("div");
      searchWrap.className = "arvo-hpop__search";
      const searchEl = document.createElement("div");
      searchWrap.appendChild(searchEl);
      const searchCfg = searchEnabled && this._options.search ? this._options.search : {};
      const placeholder = searchCfg.placeholder ?? "Search";
      const shortcut = searchCfg.shortcut ?? null;
      const showCounter = !!searchCfg.counter && !!this._query;
      const counter = showCounter ? {
        current: this._getFilteredItems().__filteredCount,
        total: flattenItems(this._items).length
      } : null;
      this._searchInstance = ArvoSearch.initialize(searchEl, {
        variant: "filter",
        value: this._query,
        placeholder,
        shortcut: shortcut ?? void 0,
        counter,
        isFullWidth: true,
        "aria-label": "Filter options",
        onChange: (value) => this._handleSearchInput(value),
        onSearch: (value) => this._handleSearchInput(value),
        onClear: () => this._handleSearchClear()
      });
      const msgText = this._resolveMessageAlertText();
      if (msgText) {
        const msgWrap = document.createElement("div");
        msgWrap.className = "arvo-hpop__search-msg";
        const msgHost = document.createElement("div");
        msgWrap.appendChild(msgHost);
        const msgCfg = searchCfg.messageAlert && typeof searchCfg.messageAlert === "object" ? searchCfg.messageAlert : {};
        this._messageAlertInstance = ArvoMessageAlert.initialize(msgHost, {
          type: msgCfg.type ?? "info",
          message: msgText,
          icon: msgCfg.icon ?? void 0
        });
        searchWrap.appendChild(msgWrap);
      }
      sticky.appendChild(searchWrap);
    }
    if (showConditional && conditional) {
      const condWrap = document.createElement("div");
      condWrap.className = "arvo-hpop__cond";
      const condEl = document.createElement("div");
      condWrap.appendChild(condEl);
      this._conditionalInstance = ArvoButtonGroup.initialize(condEl, {
        ariaLabel: "Combine filters",
        items: [
          { value: "and", label: "And" },
          { value: "or", label: "Or" }
        ],
        value: conditional.value,
        size: "sm",
        onChange: (detail) => {
          const v = detail.value;
          if (v === "and" || v === "or") conditional.onChange(v);
        }
      });
      sticky.appendChild(condWrap);
    }
  }
  // ---------------------------------------------------------------------------
  // Body (mounted ArvoList | appliesToAll info alert | unimplemented stub)
  // ---------------------------------------------------------------------------
  _renderBody() {
    const body = this._bodyEl;
    if (!body) return;
    this._destroyBodyInstances();
    body.textContent = "";
    const variant = this._options.variant ?? "multi";
    const isUnimplemented = variant === "boolean" || variant === "conditional" || variant === "custom";
    const dataState = this._resolveDataState();
    if (!this._isLoading && dataState === "appliesToAll") {
      body.appendChild(this._buildAppliesToAll());
      return;
    }
    if (isUnimplemented && !this._isLoading) {
      return;
    }
    const { filtered } = this._getFilteredItems();
    const enableReorder = !!this._options.enableReorder;
    const payload = toListPayload(filtered, enableReorder);
    const isEmpty = dataState === "noData" || dataState === "noResults";
    const emptyState = isEmpty ? mapListEmptyState(
      dataState === "noResults" ? "no-results" : "no-data",
      this._options.emptyConfig,
      dataState === "noResults" ? () => this._handleSearchClear() : void 0
    ) : null;
    const listHost = document.createElement("div");
    body.appendChild(listHost);
    const listProps = this._options.listProps ?? {};
    const listVariant = listProps.variant ?? "standard";
    const selectedIds = this._selection === "none" ? null : this._draft;
    this._listInstance = ArvoList.initialize(listHost, {
      ...listProps,
      variant: listVariant,
      selectionMode: this._selection,
      items: payload.items,
      groups: payload.groups,
      selectedIds: selectedIds ?? void 0,
      hasGlobalSelectAll: !!this._options.hasGlobalSelectAll && this._selection === "multi",
      isReorderable: enableReorder,
      crossGroupReorder: !!this._options.crossGroupDrag,
      isLoading: this._isLoading,
      skeletonRows: listProps.skeletonRows ?? HPOP_SKELETON_ROWS,
      isEmpty,
      emptyState,
      searchQuery: this._query || void 0,
      ariaLabel: listProps.ariaLabel ?? this._options.title ?? "Filter options",
      onSelectionChange: (detail) => this._handleListSelectionChange(detail),
      onReorder: (detail) => this._handleListReorder(detail),
      onItemActivate: (detail) => this._handleListItemActivate(detail)
    });
  }
  _buildAppliesToAll() {
    var _a;
    const wrap = document.createElement("div");
    wrap.className = "arvo-hpop__applies-to-all";
    const host = document.createElement("div");
    wrap.appendChild(host);
    const cfgMessage = (_a = this._options.emptyConfig) == null ? void 0 : _a.appliesToAllMessage;
    const message = cfgMessage ?? "This filter currently applies to all values.";
    this._appliesToAllAlertInstance = ArvoMessageAlert.initialize(host, {
      type: "info",
      message
    });
    return wrap;
  }
  _resolveMessageAlertText() {
    const searchEnabled = this._options.search !== false;
    if (!searchEnabled) return null;
    const searchCfg = this._options.search && typeof this._options.search === "object" ? this._options.search : {};
    if (searchCfg.messageAlert === false) return null;
    if (!searchCfg.counter || !this._query) return null;
    const msgCfg = searchCfg.messageAlert && typeof searchCfg.messageAlert === "object" ? searchCfg.messageAlert : {};
    const filteredCount = this._getFilteredItems().__filteredCount;
    const totalCount = flattenItems(this._items).length;
    if (typeof msgCfg.message === "function") {
      return msgCfg.message(filteredCount, totalCount);
    }
    const template = typeof msgCfg.message === "string" ? msgCfg.message : "{count} matching results found.";
    return formatMatchCountMessage(filteredCount, template);
  }
  // ---------------------------------------------------------------------------
  // ArvoList bridge handlers (selection / reorder / inline drill-down)
  // ---------------------------------------------------------------------------
  /**
   * Bridge ArvoList's onSelectionChange into HybridPopover's draft path.
   * The legacy onChange meta is reconstructed from a prev/next diff so the
   * public contract `onChange(value, { item, action })` stays unchanged.
   */
  _handleListSelectionChange(detail) {
    if (this._selection === "none") return;
    const next = detail.selectedIds;
    if (this._selection === "single") {
      const nextId = typeof next === "string" ? next : null;
      const item = nextId ? flattenItems(this._items).find((i) => i.id === nextId) ?? null : null;
      this._updateDraft(nextId, { item, action: "toggle" });
      return;
    }
    const prevArr = Array.isArray(this._draft) ? this._draft : [];
    const nextArr = Array.isArray(next) ? next : [];
    const prevSet = new Set(prevArr);
    const nextSet = new Set(nextArr);
    const added = [];
    const removed = [];
    nextArr.forEach((id) => {
      if (!prevSet.has(id)) added.push(id);
    });
    prevArr.forEach((id) => {
      if (!nextSet.has(id)) removed.push(id);
    });
    const changed = [...added, ...removed].sort();
    if (changed.length === 0) {
      this._updateDraft(nextArr, { item: null, action: "toggle" });
      return;
    }
    const flatAll = flattenItems(this._items);
    if (changed.length === 1) {
      const id = changed[0];
      const item = flatAll.find((i) => i.id === id) ?? null;
      this._updateDraft(nextArr, { item, action: "toggle" });
      return;
    }
    const globalEnabled = flatAll.filter((i) => !i.isDisabled).map((i) => i.id).sort();
    const matchesSet = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
    if (this._options.hasGlobalSelectAll && matchesSet(changed, globalEnabled)) {
      this._updateDraft(nextArr, { item: null, action: "select-all" });
      return;
    }
    if (isGrouped(this._items)) {
      const groupHit = this._items.find((g) => {
        const groupEnabled = g.items.filter((i) => !i.isDisabled).map((i) => i.id).sort();
        return matchesSet(changed, groupEnabled);
      });
      if (groupHit) {
        this._updateDraft(nextArr, { item: null, action: "group-select-all" });
        return;
      }
    }
    if (matchesSet(changed, globalEnabled)) {
      this._updateDraft(nextArr, { item: null, action: "select-all" });
      return;
    }
    this._updateDraft(nextArr, { item: null, action: "toggle" });
  }
  _handleListReorder(detail) {
    var _a, _b;
    const { fromIndex, toIndex, fromGroupId, toGroupId } = detail;
    if (!this._options.crossGroupDrag && fromGroupId !== toGroupId) {
      return;
    }
    const next = applyReorder(
      this._items,
      fromIndex,
      toIndex,
      fromGroupId,
      toGroupId
    );
    if (!this._isControlledItems) {
      this._items = next;
      queueMicrotask(() => {
        if (!this.isOpen()) return;
        this._renderBody();
      });
    }
    (_b = (_a = this._options).onReorder) == null ? void 0 : _b.call(_a, {
      fromIndex,
      toIndex,
      fromGroup: fromGroupId,
      toGroup: toGroupId,
      items: next
    });
    this._dispatchEvent("hpop:reorder", {
      fromIndex,
      toIndex,
      fromGroup: fromGroupId,
      toGroup: toGroupId
    });
  }
  _handleListItemActivate(detail) {
    const flatAll = flattenItems(this._items);
    const source = detail.item.data ?? flatAll.find((i) => i.id === detail.id) ?? null;
    if (!source) return;
    const inlineCfg = resolveItemInline(source);
    if (!inlineCfg) return;
    const currentTarget = detail.event.currentTarget;
    const target = detail.event.target;
    const anchor = currentTarget instanceof HTMLElement ? currentTarget : target instanceof HTMLElement ? target : null;
    if (!anchor) return;
    this._openInlineFromItem(inlineCfg, anchor);
  }
  /**
   * Update HybridPopover's draft state. The embedded ArvoList has already
   * updated its own DOM / aria-checked attributes synchronously inside its
   * onSelectionChange flow, so we do NOT push back into it here -- doing so
   * would loop. Reset / Cancel / value() paths re-render the body instead.
   */
  _updateDraft(next, meta) {
    this._draft = next;
    if ((this._options.commitOn ?? "apply") === "change") {
      this._committed = cloneValue(next);
      this._fireChange(next, meta);
      this._dispatchEvent("hpop:change", { value: cloneValue(next) });
    }
  }
  // ---------------------------------------------------------------------------
  // Footer actions
  // ---------------------------------------------------------------------------
  _buildPopoverActions() {
    if (this._options.actions === false) return [];
    if (this._options.actions) return this._options.actions;
    return [
      // Reset renders icon-only per Figma spec (32x32 ArvoIconButton with
      // o9con-rotate-left). The Popover footer takes the icon-only branch
      // when `icon` is set and `label` is omitted; the action `id` doubles
      // as the IconButton tooltip / aria-label fallback.
      {
        id: "Reset",
        icon: "rotate-left",
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
  _handleApply() {
    var _a, _b;
    const next = cloneValue(this._draft);
    const result = (_b = (_a = this._options).onApply) == null ? void 0 : _b.call(_a, next);
    this._committed = next;
    this._fireChange(next, { item: null, action: "apply" });
    this._dispatchEvent("hpop:apply", { value: cloneValue(next) });
    if (result === false) return false;
    return void 0;
  }
  _handleCancel() {
    var _a, _b, _c;
    this._draft = defaultDraft(this._selection, this._committed);
    this._query = "";
    (_a = this._searchInstance) == null ? void 0 : _a.value("");
    this._renderBody();
    this._applyPanelClasses();
    this._updateMessageAlert();
    this._updateSearchCounter();
    (_c = (_b = this._options).onCancel) == null ? void 0 : _c.call(_b);
    this._dispatchEvent("hpop:cancel", {});
  }
  _handleReset() {
    var _a, _b, _c;
    const cleared = this._selection === "multi" ? [] : null;
    this._draft = cleared;
    this._query = "";
    if ((this._options.commitOn ?? "apply") === "change") {
      this._committed = cloneValue(this._draft);
      this._fireChange(this._draft, { item: null, action: "reset" });
    }
    (_a = this._searchInstance) == null ? void 0 : _a.value("");
    this._renderBody();
    this._applyPanelClasses();
    this._updateMessageAlert();
    this._updateSearchCounter();
    (_c = (_b = this._options).onReset) == null ? void 0 : _c.call(_b);
    this._dispatchEvent("hpop:reset", {});
  }
  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------
  _handleSearchInput(value) {
    this._query = value;
    this._renderBody();
    this._applyPanelClasses();
    this._updateMessageAlert();
    this._updateSearchCounter();
  }
  _handleSearchClear() {
    this._query = "";
    if (this._searchInstance) {
      this._searchInstance.value("");
    }
    this._renderBody();
    this._applyPanelClasses();
    this._updateMessageAlert();
    this._updateSearchCounter();
  }
  /**
   * Update the message alert (counter results message) in the sticky
   * header without touching the live ArvoSearch instance. The alert may
   * need to appear, disappear, or update its text as the query / filtered
   * count changes during typing.
   */
  _updateMessageAlert() {
    const sticky = this._stickyEl;
    if (!sticky) return;
    const searchWrap = sticky.querySelector(".arvo-hpop__search");
    if (!searchWrap) return;
    const msgText = this._resolveMessageAlertText();
    if (this._messageAlertInstance) {
      if (!msgText) {
        this._messageAlertInstance.destroy();
        this._messageAlertInstance = null;
        const msgWrap2 = searchWrap.querySelector(".arvo-hpop__search-msg");
        msgWrap2 == null ? void 0 : msgWrap2.remove();
        return;
      }
      this._messageAlertInstance.message(msgText);
      return;
    }
    if (!msgText) return;
    const searchCfg = this._options.search && typeof this._options.search === "object" ? this._options.search : {};
    const msgCfg = searchCfg.messageAlert && typeof searchCfg.messageAlert === "object" ? searchCfg.messageAlert : {};
    const msgWrap = document.createElement("div");
    msgWrap.className = "arvo-hpop__search-msg";
    const msgHost = document.createElement("div");
    msgWrap.appendChild(msgHost);
    this._messageAlertInstance = ArvoMessageAlert.initialize(msgHost, {
      type: msgCfg.type ?? "info",
      message: msgText,
      icon: msgCfg.icon ?? void 0
    });
    searchWrap.appendChild(msgWrap);
  }
  _updateSearchCounter() {
    if (!this._searchInstance) return;
    const searchCfg = this._options.search && typeof this._options.search === "object" ? this._options.search : null;
    if (!(searchCfg == null ? void 0 : searchCfg.counter)) return;
    if (!this._query) return;
    const flatAll = flattenItems(this._items);
    const filteredCount = this._getFilteredItems().__filteredCount;
    this._searchInstance.counter(filteredCount, flatAll.length);
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
      min: { width: HPOP_MIN_WIDTH, height: HPOP_MIN_HEIGHT },
      max: (rect) => ({
        width: Math.max(
          HPOP_MIN_WIDTH,
          Math.min(HPOP_MAX_WIDTH, window.innerWidth - rect.left - 16)
        ),
        height: Math.max(
          HPOP_MIN_HEIGHT,
          Math.min(
            Math.floor(window.innerHeight * 0.9),
            window.innerHeight - rect.top - 16
          )
        )
      }),
      viewportPadding: 16,
      onResize: (rect) => {
        var _a, _b, _c;
        this._resizedWidth = rect.width;
        this._resizedHeight = rect.height;
        (_a = this._panelEl) == null ? void 0 : _a.setAttribute("data-arvo-resized", "true");
        (_c = (_b = this._options).onResize) == null ? void 0 : _c.call(_b, rect);
      },
      onCommit: (rect) => {
        var _a, _b, _c, _d;
        this._resizedWidth = rect.width;
        this._resizedHeight = rect.height;
        (_a = this._panelEl) == null ? void 0 : _a.setAttribute("data-arvo-resized", "true");
        (_c = (_b = this._options).onResizeCommit) == null ? void 0 : _c.call(_b, rect);
        (_d = this._popover) == null ? void 0 : _d.reposition();
      }
    });
    this._resize.mount();
  }
  _teardownResize() {
    var _a;
    (_a = this._resize) == null ? void 0 : _a.destroy();
    this._resize = null;
  }
  // Roving tabindex is owned by ArvoList -- HybridPopover does not wire
  // createTabRoving directly. The search-input -> ArrowDown handoff into the
  // list relies on ArvoList's onKeyDown handler picking up arrow keys when
  // focus enters the list region.
  // ---------------------------------------------------------------------------
  // Inner instance teardown
  // ---------------------------------------------------------------------------
  _destroyBodyInstances() {
    var _a, _b, _c;
    (_a = this._listInstance) == null ? void 0 : _a.destroy();
    this._listInstance = null;
    (_b = this._clearSearchInstance) == null ? void 0 : _b.destroy();
    this._clearSearchInstance = null;
    (_c = this._appliesToAllAlertInstance) == null ? void 0 : _c.destroy();
    this._appliesToAllAlertInstance = null;
  }
  _destroyInnerInstances() {
    var _a, _b, _c, _d;
    (_a = this._searchInstance) == null ? void 0 : _a.destroy();
    this._searchInstance = null;
    (_b = this._bannerInstance) == null ? void 0 : _b.destroy();
    this._bannerInstance = null;
    (_c = this._messageAlertInstance) == null ? void 0 : _c.destroy();
    this._messageAlertInstance = null;
    (_d = this._conditionalInstance) == null ? void 0 : _d.destroy();
    this._conditionalInstance = null;
    this._destroyBodyInstances();
  }
  // ---------------------------------------------------------------------------
  // Inline panel stack
  // ---------------------------------------------------------------------------
  _mountInlineStack() {
    if (this._inlinePanelStack || !this._panelEl) return;
    this._inlinePanelStack = createInlinePanelStack({
      host: this._panelEl,
      containerClass: "arvo-hpop__inline-panel",
      maxDepth: 5
    });
  }
  _teardownInlineStack() {
    var _a;
    (_a = this._inlinePanelStack) == null ? void 0 : _a.destroy();
    this._inlinePanelStack = null;
  }
  _destroyInlineInstance(entryId) {
    const instance = this._inlinePanelInstances.get(entryId);
    instance == null ? void 0 : instance.destroy();
    this._inlinePanelInstances.delete(entryId);
  }
  _closeAllInlinePanels() {
    const stack = this._inlinePanelStack;
    if (!stack) return;
    for (const entry of stack.getEntries()) {
      this._destroyInlineInstance(entry.id);
    }
    stack.popAll();
  }
  _popInlinePanel(via = "default") {
    const stack = this._inlinePanelStack;
    if (!stack || stack.getDepth() === 0) return;
    const top = stack.getTop();
    if (!top) return;
    const entryId = top.id;
    stack.pop({ via: via === "back" ? "back" : "default" });
    this._destroyInlineInstance(entryId);
  }
  _openInlineFromItem(config, sourceEl) {
    var _a;
    if (((_a = config.onOpen) == null ? void 0 : _a.call(config)) === false) return;
    const stack = this._inlinePanelStack;
    if (!stack) return;
    const entryId = `hpop-inline-${++_inlineIdCounter}`;
    const hostEl = document.createElement("div");
    if (isPopoverInlineConfig(config)) {
      const hasBackButton = config.hasBackButton !== false;
      const isClosable = config.isClosable !== false;
      const popover = ArvoPopover.initialize(hostEl, {
        isInline: true,
        variant: "edge",
        title: config.title ?? "",
        hasHeader: !!(config.title || hasBackButton || isClosable),
        isClosable,
        hasBackButton,
        content: config.content,
        actions: config.actions,
        isInteractive: true,
        onBack: () => {
          var _a2;
          (_a2 = config.onBack) == null ? void 0 : _a2.call(config);
          this._popInlinePanel("back");
        },
        onClose: () => {
          var _a2;
          if (((_a2 = config.onClose) == null ? void 0 : _a2.call(config)) === false) return false;
          this._closeAllInlinePanels();
          return false;
        }
      });
      this._inlinePanelInstances.set(entryId, popover);
      const pushed2 = stack.push({
        id: entryId,
        kind: "popover",
        element: hostEl,
        openedFrom: sourceEl,
        onBack: () => {
          var _a2;
          return (_a2 = config.onBack) == null ? void 0 : _a2.call(config);
        },
        onClose: () => {
          var _a2;
          return ((_a2 = config.onClose) == null ? void 0 : _a2.call(config)) === false ? false : void 0;
        }
      });
      if (!pushed2) {
        this._destroyInlineInstance(entryId);
        return;
      }
      popover.open();
      return;
    }
    const hybridCfg = config;
    const hybrid = ArvoHybridPopover.initialize(hostEl, {
      isInline: true,
      parent: this._options.parent ?? this._id,
      title: hybridCfg.title ?? "",
      variant: hybridCfg.variant ?? "multi",
      items: hybridCfg.items ?? [],
      hasBackButton: hybridCfg.hasBackButton !== false,
      isClosable: true,
      onBack: () => {
        var _a2;
        (_a2 = hybridCfg.onBack) == null ? void 0 : _a2.call(hybridCfg);
        this._popInlinePanel("back");
      },
      onClose: () => {
        var _a2;
        if (((_a2 = hybridCfg.onClose) == null ? void 0 : _a2.call(hybridCfg)) === false) return false;
        this._closeAllInlinePanels();
        return false;
      }
    });
    this._inlinePanelInstances.set(entryId, hybrid);
    const pushed = stack.push({
      id: entryId,
      kind: "hybrid",
      element: hostEl,
      openedFrom: sourceEl,
      onBack: () => {
        var _a2;
        return (_a2 = hybridCfg.onBack) == null ? void 0 : _a2.call(hybridCfg);
      },
      onClose: () => {
        var _a2;
        return ((_a2 = hybridCfg.onClose) == null ? void 0 : _a2.call(hybridCfg)) === false ? false : void 0;
      }
    });
    if (!pushed) {
      this._destroyInlineInstance(entryId);
      return;
    }
    hybrid.open();
  }
  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------
  _fireChange(value, meta) {
    var _a, _b;
    (_b = (_a = this._options).onChange) == null ? void 0 : _b.call(_a, cloneValue(value), meta);
  }
  _dispatchEvent(name, detail) {
    var _a;
    (_a = this._trigger) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(name, { bubbles: true, cancelable: true, detail })
    );
  }
}
export {
  ArvoHybridPopover,
  HPOP_DEFAULT_WIDTH,
  HPOP_MAX_WIDTH,
  HPOP_MIN_HEIGHT,
  HPOP_MIN_WIDTH
};
//# sourceMappingURL=HybridPopover.js.map
