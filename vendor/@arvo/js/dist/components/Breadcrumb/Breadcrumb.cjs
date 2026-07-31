"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const ActionMenu = require("../ActionMenu/ActionMenu.cjs");
function hasItemMenu(item) {
  return Array.isArray(item.menuItems) && item.menuItems.length > 0;
}
function resolveItemType(item, index, total, hasExplicitCurrent) {
  if (item.type) return item.type;
  if (index === total - 1 && !hasExplicitCurrent) return "current";
  if (index === 0 && !item.label && !hasItemMenu(item)) return "home";
  return "link";
}
const DEFAULT_HOME_ICON = "home";
function buildTrail(items, maxVisibleItems, hasOverflow) {
  const total = items.length;
  if (total === 0) return [];
  const hasExplicitCurrent = items.some((it) => it.type === "current");
  const allEntries = items.map((item, index) => ({
    kind: "item",
    item,
    index,
    itemType: resolveItemType(item, index, total, hasExplicitCurrent)
  }));
  if (!hasOverflow || maxVisibleItems < 3 || total <= maxVisibleItems) {
    return allEntries;
  }
  const trailingCount = maxVisibleItems - 2;
  const head = allEntries[0];
  const tail = allEntries.slice(total - trailingCount);
  const collapsedSlice = allEntries.slice(1, total - trailingCount);
  if (collapsedSlice.length === 0) return allEntries;
  const overflow = {
    kind: "overflow",
    collapsed: collapsedSlice.map(({ item, index }) => ({
      item,
      index,
      label: item.label || `Item ${index + 1}`
    }))
  };
  return [head, overflow, ...tail];
}
const _ArvoBreadcrumb = class _ArvoBreadcrumb {
  constructor(element, options) {
    this._listEl = null;
    this._skeletonEl = null;
    this._overflowMenu = null;
    this._itemMenus = [];
    this._element = element;
    this._originalContent = element.innerHTML;
    this._options = {
      ..._ArvoBreadcrumb.DEFAULTS,
      ...options,
      menuProps: (options == null ? void 0 : options.menuProps) ?? null,
      onNavigate: (options == null ? void 0 : options.onNavigate) ?? null,
      onOverflowOpen: (options == null ? void 0 : options.onOverflowOpen) ?? null,
      onOverflowClose: (options == null ? void 0 : options.onOverflowClose) ?? null,
      onItemMenuOpen: (options == null ? void 0 : options.onItemMenuOpen) ?? null,
      onItemMenuClose: (options == null ? void 0 : options.onItemMenuClose) ?? null
    };
    this._boundHandleClick = this._handleClick.bind(this);
    this._render();
  }
  static initialize(element, options) {
    return new _ArvoBreadcrumb(element, options);
  }
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    this._applyRootClasses();
    el.setAttribute("aria-label", this._options.ariaLabel);
    if (this._options.isLoading) {
      el.setAttribute("aria-busy", "true");
      this._buildSkeleton();
      return;
    }
    el.removeAttribute("aria-busy");
    this._listEl = document.createElement("ol");
    this._listEl.className = "arvo-bc__list";
    el.appendChild(this._listEl);
    this._buildItems();
    this._listEl.addEventListener("click", this._boundHandleClick);
  }
  _applyRootClasses() {
    const el = this._element;
    if (!el) return;
    el.classList.add("arvo-bc", `arvo-bc--${this._options.size}`);
    el.classList.toggle("is-disabled", this._options.isDisabled);
    el.classList.toggle("loading", this._options.isLoading);
  }
  _buildSkeleton() {
    const el = this._element;
    if (!el) return;
    const skl = document.createElement("div");
    skl.className = "arvo-bc__skl";
    skl.setAttribute("aria-hidden", "true");
    const icon = document.createElement("div");
    icon.className = "arvo-bc__skl__icon";
    const sep = document.createElement("span");
    sep.className = "arvo-bc__skl__sep";
    sep.textContent = "/";
    const bar = document.createElement("div");
    bar.className = "arvo-bc__skl__bar";
    skl.appendChild(icon);
    skl.appendChild(sep);
    skl.appendChild(bar);
    el.appendChild(skl);
    this._skeletonEl = skl;
  }
  _buildItems() {
    const list = this._listEl;
    if (!list) return;
    list.textContent = "";
    this._destroyMenus();
    const trail = buildTrail(
      this._options.items,
      this._options.maxVisibleItems,
      this._options.hasOverflow
    );
    trail.forEach((entry) => {
      const li = document.createElement("li");
      li.className = "arvo-bc__item";
      if (entry.kind === "overflow") {
        li.appendChild(this._buildOverflowTrigger(entry.collapsed));
      } else if (entry.itemType !== "home" && hasItemMenu(entry.item)) {
        li.appendChild(this._buildItemMenuTrigger(entry));
      } else {
        li.appendChild(this._buildTrailItem(entry));
      }
      list.appendChild(li);
    });
  }
  _buildTrailItem(entry) {
    const { item, index, itemType } = entry;
    const isHome = itemType === "home";
    const isCurrent = itemType === "current";
    const effectiveIcon = isHome ? item.icon ?? DEFAULT_HOME_ICON : item.icon;
    const showIcon = !!effectiveIcon;
    const showLabel = !isHome && !!item.label;
    if (isCurrent) {
      const span = document.createElement("span");
      span.className = "arvo-bc__lbl";
      span.setAttribute("aria-current", "page");
      span.title = item.label;
      if (showIcon) {
        span.appendChild(this._buildIcon(effectiveIcon));
      }
      span.appendChild(document.createTextNode(item.label));
      return span;
    }
    const a = document.createElement("a");
    a.className = isHome ? "arvo-bc__lnk arvo-bc__lnk--home" : "arvo-bc__lnk";
    a.dataset.index = String(index);
    if (item.href && !this._options.isDisabled) {
      a.setAttribute("href", item.href);
    }
    if (this._options.isDisabled) {
      a.setAttribute("aria-disabled", "true");
      a.setAttribute("tabindex", "0");
    }
    if (isHome) {
      a.setAttribute("aria-label", item.label || "Home");
    } else {
      a.title = item.label;
    }
    if (showIcon) {
      a.appendChild(this._buildIcon(effectiveIcon));
      if (isHome) {
        a.appendChild(this._buildIcon(`${effectiveIcon}-filled`, true));
      }
    }
    if (showLabel) {
      a.appendChild(document.createTextNode(item.label));
    }
    return a;
  }
  _buildIcon(icon, isFilledSibling = false) {
    const ico = document.createElement("span");
    const cls = isFilledSibling ? "arvo-bc__ico--filled" : "arvo-bc__ico";
    ico.className = `${cls} o9con o9con-${icon}`;
    ico.setAttribute("aria-hidden", "true");
    return ico;
  }
  _buildItemMenuTrigger(entry) {
    var _a;
    const { item, index, itemType } = entry;
    const isCurrent = itemType === "current";
    const showIcon = !!item.icon;
    const blocked = this._options.isDisabled || this._options.isLoading;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = isCurrent ? "arvo-bc__lbl arvo-bc__lbl--dd" : "arvo-bc__lnk arvo-bc__lnk--dd";
    btn.title = item.label;
    btn.dataset.index = String(index);
    if (isCurrent) btn.setAttribute("aria-current", "page");
    if (blocked) btn.disabled = true;
    const inner = document.createElement("span");
    inner.className = "arvo-bc__lnk-inner";
    if (showIcon) inner.appendChild(this._buildIcon(item.icon));
    if (item.label) inner.appendChild(document.createTextNode(item.label));
    btn.appendChild(inner);
    const chev = document.createElement("i");
    chev.className = "arvo-bc__chev o9con o9con-angle-down";
    chev.setAttribute("aria-hidden", "true");
    btn.appendChild(chev);
    const menu = new ActionMenu.ArvoActionMenu(btn, {
      ...this._options.menuProps ?? {},
      placement: ((_a = this._options.menuProps) == null ? void 0 : _a.placement) ?? "bottom-start",
      items: item.menuItems,
      isDisabled: blocked,
      onOpenChange: (open) => {
        var _a2, _b, _c, _d;
        if (open) (_b = (_a2 = this._options).onItemMenuOpen) == null ? void 0 : _b.call(_a2, { index });
        else (_d = (_c = this._options).onItemMenuClose) == null ? void 0 : _d.call(_c, { index });
      }
    });
    this._itemMenus.push({ index, menu, chevron: chev });
    return btn;
  }
  _buildOverflowTrigger(collapsed) {
    var _a;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "arvo-bc__overflow";
    btn.setAttribute("aria-label", this._options.overflowAriaLabel);
    if (this._options.isDisabled || this._options.isLoading) {
      btn.disabled = true;
    }
    const ico = document.createElement("span");
    ico.className = "o9con o9con-ellipsis-h";
    ico.setAttribute("aria-hidden", "true");
    btn.appendChild(ico);
    const menuItems = collapsed.map((c) => ({
      id: String(c.index),
      label: c.label,
      icon: c.item.icon
    }));
    this._overflowMenu = new ActionMenu.ArvoActionMenu(btn, {
      ...this._options.menuProps ?? {},
      placement: ((_a = this._options.menuProps) == null ? void 0 : _a.placement) ?? "bottom-start",
      items: menuItems,
      isDisabled: this._options.isDisabled || this._options.isLoading,
      onSelect: (menuItem) => this._handleOverflowSelect(menuItem),
      onOpenChange: (open) => {
        var _a2, _b, _c, _d;
        if (open) (_b = (_a2 = this._options).onOverflowOpen) == null ? void 0 : _b.call(_a2);
        else (_d = (_c = this._options).onOverflowClose) == null ? void 0 : _d.call(_c);
      }
    });
    return btn;
  }
  _destroyMenus() {
    if (this._overflowMenu) {
      this._overflowMenu.destroy();
      this._overflowMenu = null;
    }
    if (this._itemMenus.length) {
      this._itemMenus.forEach((rec) => rec.menu.destroy());
      this._itemMenus = [];
    }
  }
  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  _handleClick(event) {
    var _a;
    if (this._options.isDisabled || this._options.isLoading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const target = (_a = event.target) == null ? void 0 : _a.closest(
      ".arvo-bc__lnk"
    );
    if (!target || target.classList.contains("arvo-bc__lnk--dd")) return;
    const index = Number(target.dataset.index);
    const item = this._options.items[index];
    if (!item) return;
    this._dispatchEvent("bc:navigate", {
      href: item.href ?? "",
      index,
      label: item.label
    });
    if (this._options.onNavigate && item.href) {
      this._options.onNavigate({
        href: item.href,
        index,
        label: item.label
      });
    }
  }
  _handleOverflowSelect(menuItem) {
    if (this._options.isDisabled || this._options.isLoading) return;
    const index = Number(menuItem.id);
    const collapsed = this._options.items[index];
    if (!collapsed) return;
    this._dispatchEvent("bc:navigate", {
      href: collapsed.href ?? "",
      index,
      label: collapsed.label
    });
    if (this._options.onNavigate && collapsed.href) {
      this._options.onNavigate({
        href: collapsed.href,
        index,
        label: collapsed.label
      });
    }
  }
  _dispatchEvent(name, detail) {
    var _a;
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        cancelable: true,
        detail
      })
    );
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  setItems(items) {
    this._options.items = items;
    this._rebuildTrail();
  }
  /**
   * Set the breadcrumb size at runtime. Updates the size modifier class and
   * re-evaluates skeleton geometry while loading.
   */
  setSize(size) {
    if (this._options.size === size) return;
    const el = this._element;
    if (!el) return;
    el.classList.remove(`arvo-bc--${this._options.size}`);
    this._options.size = size;
    el.classList.add(`arvo-bc--${size}`);
  }
  disabled(state) {
    var _a;
    if (state === void 0) {
      return this._options.isDisabled;
    }
    if (this._options.isDisabled === state) return;
    this._options.isDisabled = state;
    (_a = this._element) == null ? void 0 : _a.classList.toggle("is-disabled", state);
    this._rebuildTrail();
  }
  setLoading(isLoading) {
    if (this._options.isLoading === isLoading) return;
    this._options.isLoading = isLoading;
    this._render();
  }
  destroy() {
    var _a;
    const el = this._element;
    if (!el) return;
    (_a = this._listEl) == null ? void 0 : _a.removeEventListener("click", this._boundHandleClick);
    this._destroyMenus();
    el.classList.remove(
      "arvo-bc",
      "arvo-bc--sm",
      "arvo-bc--lg",
      "is-disabled",
      "loading"
    );
    el.removeAttribute("aria-label");
    el.removeAttribute("aria-busy");
    el.innerHTML = this._originalContent;
    this._element = null;
    this._listEl = null;
    this._skeletonEl = null;
  }
  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------
  /**
   * Re-renders the trail (loaded state only). Cleans up any existing
   * overflow / per-item menu instances and rebuilds the list.
   */
  _rebuildTrail() {
    if (this._options.isLoading) return;
    if (!this._listEl) {
      this._render();
      return;
    }
    this._buildItems();
  }
};
_ArvoBreadcrumb.DEFAULTS = {
  items: [],
  size: "sm",
  hasOverflow: true,
  maxVisibleItems: 4,
  isDisabled: false,
  isLoading: false,
  ariaLabel: "Breadcrumb",
  overflowAriaLabel: "Options",
  menuProps: null,
  onNavigate: null,
  onOverflowOpen: null,
  onOverflowClose: null,
  onItemMenuOpen: null,
  onItemMenuClose: null
};
let ArvoBreadcrumb = _ArvoBreadcrumb;
exports.ArvoBreadcrumb = ArvoBreadcrumb;
//# sourceMappingURL=Breadcrumb.cjs.map
