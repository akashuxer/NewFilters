"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const utils = require("@arvo/utils");
const PanelBase = require("../PanelBase/PanelBase.cjs");
const Nav = require("../Nav/Nav.cjs");
const _ArvoNavPanel = class _ArvoNavPanel {
  constructor(element, options) {
    this._currentQuery = "";
    this._searchKeys = ["label"];
    this._getItemSearchText = void 0;
    this._unsubscribeSearch = null;
    this._destroyed = false;
    this._items = options.items ?? [];
    this._isCompact = !!options.isCompact;
    this._size = options.size ?? "md";
    this._navHostEl = document.createElement("div");
    this._navHostEl.className = "arvo-pnl__nav-host";
    const navOptions = {
      ...options.navProps ?? {},
      size: this._size,
      isCompact: this._isCompact,
      items: this._items,
      selectedId: options.activeId ?? options.defaultActiveId ?? null,
      onSelect: (detail) => {
        var _a;
        (_a = options.onActivate) == null ? void 0 : _a.call(options, { id: detail.id, item: detail.item });
        this._base.paneEl.dispatchEvent(
          new CustomEvent("pnl:nav-activate", {
            bubbles: true,
            detail: { id: detail.id }
          })
        );
      }
    };
    this._nav = Nav.ArvoNav.initialize(this._navHostEl, navOptions);
    const extraHostClasses = [`arvo-pnl--size-${this._size}`];
    if (this._isCompact) extraHostClasses.push("arvo-pnl--compact");
    const compactWidth = this._isCompact ? _ArvoNavPanel.COMPACT_WIDTHS[this._size] : void 0;
    const sizeOverrides = compactWidth ? {
      defaultSize: compactWidth,
      minSize: compactWidth,
      maxSize: compactWidth
    } : {};
    this._base = PanelBase.createPanelBase(element, {
      ...options,
      ...sizeOverrides,
      body: this._navHostEl,
      panelType: "navigation",
      extraHostClasses
    });
    const searchCfg = options.stickyHeader && typeof options.stickyHeader === "object" ? options.stickyHeader.search : void 0;
    if (searchCfg && typeof searchCfg === "object" && searchCfg.searchKeys) {
      this._searchKeys = searchCfg.searchKeys;
    }
    this._getItemSearchText = searchCfg && typeof searchCfg === "object" ? searchCfg.getItemSearchText : void 0;
    this._unsubscribeSearch = this._base.onSearchQueryChange((query) => {
      this._currentQuery = query;
      this._applyFilter();
    });
  }
  static initialize(element, options) {
    return new _ArvoNavPanel(element, options);
  }
  _applyFilter() {
    const filtered = this._currentQuery.length > 0 ? utils.runItemFilter(
      this._items,
      this._currentQuery,
      {
        keys: this._searchKeys,
        getItemSearchText: this._getItemSearchText
      }
    ) : this._items;
    this._nav.setItems(filtered);
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
    if (config && typeof config === "object" && config.search) {
      const s = config.search;
      if (typeof s === "object") {
        this._searchKeys = s.searchKeys ?? ["label"];
        this._getItemSearchText = s.getItemSearchText;
      } else {
        this._searchKeys = ["label"];
        this._getItemSearchText = void 0;
      }
    }
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
    this._applyFilter();
  }
  setActiveId(id) {
    this._nav.selected(id);
  }
  setCompact(compact) {
    if (this._isCompact === compact) return;
    this._isCompact = compact;
    const host = this._base.hostEl;
    if (compact) host.classList.add("arvo-pnl--compact");
    else host.classList.remove("arvo-pnl--compact");
    this._applyCompactSizeOverride();
    this._nav._options.isCompact = compact;
    this._nav._render();
  }
  setSize(size) {
    if (this._size === size) return;
    const host = this._base.hostEl;
    host.classList.remove(`arvo-pnl--size-${this._size}`);
    host.classList.add(`arvo-pnl--size-${size}`);
    this._size = size;
    this._applyCompactSizeOverride();
    this._nav._options.size = size;
    this._nav._render();
  }
  /**
   * Sync the inline `--arvo-pnl-size` / `--arvo-pnl-min-size` /
   * `--arvo-pnl-max-size` variables on the host to the current
   * compact-vs-expanded state. When compact, all three are pinned to
   * the icon-rail width for the active `size`; when expanded, the
   * inline overrides are removed so PanelBase's own defaults win.
   */
  _applyCompactSizeOverride() {
    const host = this._base.hostEl;
    if (this._isCompact) {
      const w = `${_ArvoNavPanel.COMPACT_WIDTHS[this._size]}px`;
      host.style.setProperty("--arvo-pnl-size", w);
      host.style.setProperty("--arvo-pnl-min-size", w);
      host.style.setProperty("--arvo-pnl-max-size", w);
    } else {
      host.style.removeProperty("--arvo-pnl-size");
      host.style.removeProperty("--arvo-pnl-min-size");
      host.style.removeProperty("--arvo-pnl-max-size");
    }
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
    if (state === void 0) return this._base.disabled();
    this._base.disabled(state);
    this._nav.disabled(state);
  }
  focus(target) {
    this._base.focus(target);
  }
  destroy() {
    var _a;
    if (this._destroyed) return;
    this._destroyed = true;
    (_a = this._unsubscribeSearch) == null ? void 0 : _a.call(this);
    this._unsubscribeSearch = null;
    this._nav.destroy();
    this._base.destroy();
  }
};
_ArvoNavPanel.COMPACT_WIDTHS = {
  sm: 32,
  md: 40,
  lg: 48
};
let ArvoNavPanel = _ArvoNavPanel;
exports.ArvoNavPanel = ArvoNavPanel;
//# sourceMappingURL=NavPanel.cjs.map
