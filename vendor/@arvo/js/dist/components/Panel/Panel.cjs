"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const PanelBase = require("../PanelBase/PanelBase.cjs");
class ArvoPanel {
  constructor(element, options = {}) {
    this._content = null;
    this._base = PanelBase.createPanelBase(element, {
      ...options,
      panelType: "custom"
    });
    if (options.content != null) {
      this._content = options.content;
      this._base.setContent(options.content);
    }
  }
  static initialize(element, options = {}) {
    return new ArvoPanel(element, options);
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
  expanded(value) {
    if (value === void 0) return this._base.expanded();
    this._base.expanded(value);
  }
  size(value) {
    if (value === void 0) return this._base.size();
    this._base.size(value);
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
  setContent(content) {
    this._content = content;
    this._base.setContent(content);
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
  }
  focus(target) {
    this._base.focus(target);
  }
  destroy() {
    this._base.destroy();
  }
}
exports.ArvoPanel = ArvoPanel;
//# sourceMappingURL=Panel.cjs.map
