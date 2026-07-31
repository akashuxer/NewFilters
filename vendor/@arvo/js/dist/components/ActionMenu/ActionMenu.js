import { createOverlaySurface, filterGroups, filterItems, createInlinePanelStack, createArrowNav } from "@arvo/core";
import { ArvoIconButton } from "../IconButton/IconButton.js";
import { ArvoDropdownIconButton } from "../DropdownIconButton/DropdownIconButton.js";
import { ArvoPopover } from "../Popover/Popover.js";
import { ArvoHybridPopover } from "../HybridPopover/HybridPopover.js";
import { ArvoSearch } from "../Search/Search.js";
import { ArvoSwitch } from "../Switch/Switch.js";
import { ArvoEmptyState } from "../EmptyState/EmptyState.js";
import { normalizeSearch } from "../../types/menu-search.js";
import { formatShortcutDisplay, attachTitleTruncationTooltip } from "@arvo/utils";
let _idCounter = 0;
let _inlineIdCounter = 0;
const FILTER_KEYS = ["label", "secondaryLabel"];
const SKELETON_ROW_COUNT = 5;
const INLINE_HOVER_DELAY_MS = 200;
function isGrouped(items) {
  return items.length > 0 && "items" in items[0];
}
function flattenItems(items) {
  if (isGrouped(items)) {
    const result = [];
    for (const group of items) {
      for (const item of group.items) result.push(item);
    }
    return result;
  }
  return items;
}
function splitLabelForMatch(label, fragment) {
  if (!fragment) return null;
  const idx = label.toLowerCase().indexOf(fragment.toLowerCase());
  if (idx < 0) return null;
  return {
    before: label.slice(0, idx),
    match: label.slice(idx, idx + fragment.length),
    after: label.slice(idx + fragment.length)
  };
}
function resolveStatus(status) {
  if (!status) return { modifier: null, inlineColor: null };
  if (typeof status === "string") {
    return { modifier: `arvo-menu-item--status-${status}`, inlineColor: null };
  }
  return { modifier: null, inlineColor: status.color };
}
const _ArvoActionMenu = class _ArvoActionMenu {
  constructor(element, options, submenuContext) {
    this._panelEl = null;
    this._scrollEl = null;
    this._searchEl = null;
    this._searchInstance = null;
    this._searchCfg = null;
    this._isOpen = false;
    this._isDisabled = false;
    this._isLoading = false;
    this._activeIndex = -1;
    this._query = "";
    this._arrowNav = null;
    this._surface = null;
    this._closeReason = null;
    this._flatItems = [];
    this._itemEls = [];
    this._truncationHandles = [];
    this._submenus = /* @__PURE__ */ new Map();
    this._trailingActionInstances = [];
    this._overflowInstances = [];
    this._switchInstances = /* @__PURE__ */ new Map();
    this._emptyStateInstance = null;
    this._inlinePanelStack = null;
    this._inlinePanelInstances = /* @__PURE__ */ new Map();
    this._submenuTimer = null;
    this._inlinePanelTimer = null;
    this._isSubmenu = false;
    this._parentMenu = null;
    this._parentOverlayId = null;
    this._element = element;
    this._panelId = `arvo-action-menu-${++_idCounter}`;
    if (submenuContext) {
      this._isSubmenu = true;
      this._parentMenu = submenuContext.parent;
      this._parentOverlayId = submenuContext.parentOverlayId;
      this._overlayRelation = submenuContext.relation;
    }
    this._options = {
      ..._ArvoActionMenu.DEFAULTS,
      ...options,
      items: options.items ?? [],
      maxHeight: options.maxHeight ?? null,
      defaultOpen: options.defaultOpen ?? false,
      isOpen: options.isOpen ?? null,
      onOpen: options.onOpen ?? null,
      onClose: options.onClose ?? null,
      onSelect: options.onSelect ?? null,
      onOpenChange: options.onOpenChange ?? null,
      emptyConfig: options.emptyConfig ?? null
    };
    this._searchCfg = normalizeSearch(
      this._options.search
    );
    this._isDisabled = this._options.isDisabled;
    this._isLoading = this._options.isLoading;
    this._boundHandleTriggerClick = this._handleTriggerClick.bind(this);
    this._boundHandleKeyDown = this._handleKeyDown.bind(this);
    this._buildPanel();
    this._buildSurface();
    this._bindTriggerEvents();
    if (this._isDisabled) {
      element.setAttribute("aria-disabled", "true");
    }
    const seedOpen = this._options.isOpen ?? this._options.defaultOpen;
    if (seedOpen) {
      this.open();
    }
  }
  static initialize(element, options) {
    return new _ArvoActionMenu(element, options);
  }
  /** @internal Factory for nested submenu instances. */
  static _createSubmenu(element, options, parent) {
    return new _ArvoActionMenu(element, options, {
      parent,
      parentOverlayId: parent._panelId,
      relation: "submenu"
    });
  }
  // ---------------------------------------------------------------------------
  // Engine wiring
  // ---------------------------------------------------------------------------
  _buildSurface() {
    if (!this._panelEl || !this._element) return;
    this._surface = createOverlaySurface({
      id: this._panelId,
      surface: this._panelEl,
      type: "action-menu",
      priority: 15,
      trigger: this._element,
      parentId: this._parentOverlayId ?? void 0,
      relation: this._overlayRelation,
      position: {
        // Top-level menus sit 4px off the trigger (the design-system
        // standard separation between anchored overlays and their
        // trigger); submenus sit flush so the parent item highlight
        // connects to the submenu chrome.
        placement: this._options.placement,
        gap: this._isSubmenu ? 0 : 4,
        // Filtering and dynamic item updates resize the panel; without the
        // lock, the watcher's `'float-size'` callback could re-resolve to a
        // different side once the smaller content suddenly fits the
        // originally-rejected placement, flipping the panel mid-keystroke.
        // Anchor / scroll / window-resize events still re-resolve normally
        // so the world-around-the-menu case is unaffected.
        lockPlacementOnFloatResize: true
      },
      focus: {
        mode: "trap",
        initialFocus: "none",
        getOrderedElements: () => this._collectFocusableElements()
      },
      transition: "fade",
      transitionDuration: 150,
      triggerAria: { haspopup: "menu" },
      onOpen: () => this._handleSurfaceOpened(),
      onClose: () => this._handleSurfaceClosed()
    });
  }
  /**
   * Returns the focus trap's ordered tab-cycle. While an inline-panel-stack
   * layer is open, the engine's trap should cycle within the top inline
   * layer's focusable elements only -- otherwise it cycles within the panel
   * shell (search input, items, trailing actions).
   */
  _collectFocusableElements() {
    const selector = 'a[href]:not([tabindex="-1"]), button:not([tabindex="-1"]), input:not([tabindex="-1"]), select:not([tabindex="-1"]), textarea:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';
    if (this._inlinePanelStack && this._inlinePanelStack.getDepth() > 0) {
      const top = this._inlinePanelStack.getTop();
      if (top == null ? void 0 : top.element) {
        return Array.from(
          top.element.querySelectorAll(selector)
        );
      }
    }
    if (!this._panelEl) return [];
    return Array.from(
      this._panelEl.querySelectorAll(selector)
    );
  }
  _handleSurfaceOpened() {
    var _a;
    this._renderItems();
    this._setupArrowNav();
    this._focusInitial();
    (_a = this._panelEl) == null ? void 0 : _a.addEventListener("keydown", this._boundHandleKeyDown);
  }
  _handleSurfaceClosed() {
    var _a, _b, _c, _d, _e;
    this._closeReason;
    this._closeReason = null;
    if (this._submenuTimer) {
      clearTimeout(this._submenuTimer);
      this._submenuTimer = null;
    }
    if (this._inlinePanelTimer) {
      clearTimeout(this._inlinePanelTimer);
      this._inlinePanelTimer = null;
    }
    this._closeAllInlinePanels();
    this._closeSubmenus();
    this._query = "";
    (_a = this._searchInstance) == null ? void 0 : _a.clear();
    this._activeIndex = -1;
    (_b = this._panelEl) == null ? void 0 : _b.removeEventListener("keydown", this._boundHandleKeyDown);
    (_c = this._arrowNav) == null ? void 0 : _c.destroy();
    this._arrowNav = null;
    this._isOpen = false;
    (_e = (_d = this._options).onOpenChange) == null ? void 0 : _e.call(_d, false);
  }
  // ---------------------------------------------------------------------------
  // Panel Build
  // ---------------------------------------------------------------------------
  _buildPanel() {
    this._panelEl = document.createElement("div");
    this._panelEl.id = this._panelId;
    this._panelEl.className = this._buildPanelClasses();
    this._panelEl.setAttribute("role", "menu");
    if (this._isLoading) {
      this._panelEl.setAttribute("aria-busy", "true");
    }
    if (this._options.maxHeight) {
      this._panelEl.style.setProperty("--arvo-overlay-max-height", this._options.maxHeight);
      this._panelEl.style.maxHeight = this._options.maxHeight;
    }
    if (this._searchCfg) {
      this._searchEl = this._buildSearch();
      this._panelEl.appendChild(this._searchEl);
    }
    this._scrollEl = document.createElement("div");
    this._scrollEl.className = "arvo-action-menu__scroll";
    this._panelEl.appendChild(this._scrollEl);
    this._renderItems();
    document.body.appendChild(this._panelEl);
  }
  _buildPanelClasses() {
    return [
      "arvo-action-menu",
      this._options.isLoading && "loading"
    ].filter(Boolean).join(" ");
  }
  _buildSearch() {
    const cfg = this._searchCfg;
    const wrapper = document.createElement("div");
    const classes = ["arvo-action-menu__search"];
    if (cfg.className) classes.push(cfg.className);
    wrapper.className = classes.join(" ");
    const searchRoot = document.createElement("div");
    wrapper.appendChild(searchRoot);
    this._searchInstance = ArvoSearch.initialize(searchRoot, {
      variant: "filter",
      placeholder: cfg.placeholder,
      searchMode: cfg.searchMode,
      minChars: cfg.minChars,
      isClearable: cfg.isClearable,
      shortcut: cfg.shortcut ?? null,
      errorMsg: cfg.errorMsg,
      errorDisplay: "tooltip",
      isDisabled: this._isDisabled,
      "aria-label": "Filter menu items",
      onSearch: (value) => {
        this._handleFilterSearch(value);
      },
      onClear: () => {
        this._handleFilterClear();
      }
    });
    wrapper.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "Home") {
        e.preventDefault();
        e.stopPropagation();
        this._focusListFromSearch("first");
      } else if (e.key === "ArrowUp" || e.key === "End") {
        e.preventDefault();
        e.stopPropagation();
        this._focusListFromSearch("last");
      } else if (e.key === "Enter") {
        if (this._activeIndex >= 0 && this._activeIndex < this._flatItems.length) {
          const item = this._flatItems[this._activeIndex];
          if (item && !item.isDisabled) {
            e.preventDefault();
            e.stopPropagation();
            this._handleItemActivation(this._activeIndex);
          }
        }
      } else if (e.key === "Escape") {
        e.stopPropagation();
        if (this._query) {
          this._handleFilterClear();
        } else {
          this.close();
        }
      }
    });
    return wrapper;
  }
  // ---------------------------------------------------------------------------
  // Item Rendering
  // ---------------------------------------------------------------------------
  _renderItems() {
    if (!this._scrollEl) return;
    this._scrollEl.textContent = "";
    this._destroyTrailingActions();
    this._destroySwitchInstances();
    this._destroyEmptyState();
    this._truncationHandles.forEach((h) => h.destroy());
    this._truncationHandles = [];
    this._itemEls = [];
    this._flatItems = [];
    if (this._isLoading) {
      this._renderLoadingSkeleton();
      this._updateSearchVisibility();
      return;
    }
    const items = this._getFilteredItems();
    if (isGrouped(items)) {
      items.forEach((group, groupIndex) => {
        if (groupIndex > 0 && this._options.hasGroupDividers) {
          const divider = document.createElement("hr");
          divider.className = "arvo-action-menu__divider";
          divider.setAttribute("role", "separator");
          this._scrollEl.appendChild(divider);
        }
        if (group.label) {
          const header = document.createElement("div");
          header.className = "arvo-action-menu__hdr";
          header.setAttribute("role", "presentation");
          header.textContent = group.label;
          this._scrollEl.appendChild(header);
        }
        group.items.forEach((item) => this._renderItem(item));
      });
    } else {
      items.forEach((item) => this._renderItem(item));
    }
    if (this._flatItems.length === 0) {
      this._renderEmptyState();
    }
    this._updateSearchVisibility();
  }
  // Toggles the search wrapper between visible and `display: none` based on
  // whether there is anything to filter. When `items` is truly empty AND no
  // query is active (noData state), the search bar disappears -- but stays
  // visible during noResults (items empty with an active query) so the user
  // can clear or refine the filter.
  _updateSearchVisibility() {
    if (!this._searchEl) return;
    const totalItems = flattenItems(this._options.items).length;
    const hide = !this._isLoading && totalItems === 0 && !this._query;
    this._searchEl.style.display = hide ? "none" : "";
  }
  _renderLoadingSkeleton() {
    if (!this._scrollEl) return;
    for (let i = 0; i < SKELETON_ROW_COUNT; i++) {
      const row = document.createElement("div");
      row.className = "arvo-action-menu__skeleton";
      row.setAttribute("aria-hidden", "true");
      const icon = document.createElement("div");
      icon.className = "arvo-action-menu__skeleton-icon";
      row.appendChild(icon);
      const text = document.createElement("div");
      text.className = "arvo-action-menu__skeleton-text";
      row.appendChild(text);
      this._scrollEl.appendChild(row);
    }
  }
  _renderEmptyState() {
    if (!this._scrollEl) return;
    const wrapper = document.createElement("div");
    wrapper.className = "arvo-action-menu__empty";
    const cfg = this._options.emptyConfig ?? {};
    const isFiltered = !!this._query;
    const emptyOpts = {
      size: "sm",
      orientation: "vertical",
      illustration: cfg.illustration ?? (isFiltered ? "no-results" : "no-data"),
      title: cfg.title ?? (isFiltered ? "No results found" : "No data"),
      message: cfg.message ?? (isFiltered ? "Adjust your filter search query." : "There is nothing to show yet."),
      secondaryAction: cfg.secondaryAction ?? (isFiltered ? {
        label: "Clear search",
        onClick: () => this._handleFilterClear(),
        variant: "outline"
      } : void 0)
    };
    this._emptyStateInstance = ArvoEmptyState.create(emptyOpts);
    wrapper.appendChild(this._emptyStateInstance.el);
    this._scrollEl.appendChild(wrapper);
  }
  _renderItem(item) {
    var _a, _b;
    const idx = this._flatItems.length;
    this._flatItems.push(item);
    const hasSecondary = !!item.secondaryLabel;
    const useAnchor = !!item.href && !item.inlinePopover && !item.inlineHybridPopover && !item.submenu;
    const isExternal = !!item.href && item.target === "_blank";
    if (process.env.NODE_ENV !== "production") {
      const hasInline = !!(item.inlinePopover || item.inlineHybridPopover);
      if (item.submenu && hasInline) {
        console.warn(
          `[ArvoActionMenu] Item "${item.id}" has both submenu and an inline panel; the inline panel will be ignored.`
        );
      }
      if (item.href && hasInline) {
        console.warn(
          `[ArvoActionMenu] Item "${item.id}" has both href and an inline panel; the inline panel will be ignored.`
        );
      }
    }
    const el = useAnchor ? document.createElement("a") : document.createElement("div");
    el.className = this._buildItemClasses(item);
    el.setAttribute("role", "menuitem");
    el.setAttribute("tabindex", "-1");
    el.setAttribute("data-index", String(idx));
    if (useAnchor) {
      const anchor = el;
      anchor.href = item.href;
      anchor.target = item.target ?? "_self";
      if (isExternal) {
        anchor.rel = "noopener noreferrer";
        anchor.setAttribute(
          "aria-label",
          `${item.label}, opens in a new window`
        );
      }
    }
    const status = resolveStatus(item.status);
    if (status.inlineColor) {
      el.style.setProperty("--arvo-menu-item-status-color", status.inlineColor);
    }
    if (item.isDisabled) {
      el.classList.add("is-disabled");
      el.setAttribute("aria-disabled", "true");
    }
    if (item.submenu) {
      el.setAttribute("aria-haspopup", "menu");
      el.setAttribute("aria-expanded", "false");
    }
    if (item.icon) {
      const ico = document.createElement("span");
      ico.className = `arvo-menu-item__ico o9con o9con-${item.icon}`;
      ico.setAttribute("aria-hidden", "true");
      el.appendChild(ico);
    }
    if (item.avatar) {
      const avatar = document.createElement("img");
      avatar.className = "arvo-menu-item__avatar";
      avatar.src = item.avatar;
      avatar.alt = "";
      avatar.setAttribute("aria-hidden", "true");
      el.appendChild(avatar);
    }
    const txt = document.createElement("span");
    txt.className = "arvo-menu-item__txt";
    const lbl = document.createElement("span");
    lbl.className = "arvo-menu-item__lbl";
    const matchSplit = this._query ? splitLabelForMatch(item.label, this._query) : null;
    if (matchSplit) {
      lbl.appendChild(document.createTextNode(matchSplit.before));
      const matchEl = document.createElement("span");
      matchEl.className = "arvo-menu-item__match";
      matchEl.textContent = matchSplit.match;
      lbl.appendChild(matchEl);
      lbl.appendChild(document.createTextNode(matchSplit.after));
    } else {
      lbl.textContent = item.label;
    }
    txt.appendChild(lbl);
    if (hasSecondary) {
      const secondary = document.createElement("span");
      secondary.className = "arvo-menu-item__secondary";
      secondary.textContent = item.secondaryLabel;
      txt.appendChild(secondary);
    }
    el.appendChild(txt);
    const hasTrailing = !!item.status || !!item.value || !!item.shortcut || !!item.submenu || !!((_a = item.actions) == null ? void 0 : _a.length) || !!item.switch || isExternal;
    if (hasTrailing) {
      const trailing = document.createElement("span");
      trailing.className = "arvo-menu-item__trailing";
      if (item.status) {
        const statusEl = document.createElement("span");
        statusEl.className = "arvo-menu-item__status";
        statusEl.setAttribute("aria-hidden", "true");
        trailing.appendChild(statusEl);
      }
      if (item.value) {
        const meta = document.createElement("span");
        meta.className = "arvo-menu-item__meta";
        meta.textContent = item.value;
        trailing.appendChild(meta);
      }
      if (item.shortcut) {
        const shortcut = document.createElement("span");
        shortcut.className = "arvo-menu-item__shortcut";
        shortcut.textContent = formatShortcutDisplay(item.shortcut);
        trailing.appendChild(shortcut);
      }
      if (item.switch) {
        const switchWrap = document.createElement("span");
        switchWrap.className = "arvo-menu-item__switch";
        const switchHost = document.createElement("span");
        switchWrap.appendChild(switchHost);
        const switchInst = ArvoSwitch.initialize(switchHost, {
          label: null,
          isChecked: item.switch.checked,
          isDisabled: item.isDisabled || this._isLoading,
          onChange: ({ isChecked }) => {
            var _a2, _b2;
            item.switch.checked = isChecked;
            (_b2 = (_a2 = item.switch).onChange) == null ? void 0 : _b2.call(_a2, isChecked, item);
          }
        });
        if (item.switch.ariaLabel) {
          switchHost.setAttribute("aria-label", item.switch.ariaLabel);
        }
        const switchInput = switchHost.querySelector(
          "input.arvo-sw__input"
        );
        if (switchInput) switchInput.tabIndex = -1;
        switchWrap.addEventListener("click", (e) => e.stopPropagation());
        this._switchInstances.set(item.id, switchInst);
        trailing.appendChild(switchWrap);
      }
      if ((_b = item.actions) == null ? void 0 : _b.length) {
        const cap = Math.max(1, this._options.actionsMaxVisible);
        const visible = item.actions.slice(0, cap);
        const overflow = item.actions.slice(cap);
        const actionsEl = document.createElement("span");
        actionsEl.className = "arvo-menu-item__actions";
        for (const action of visible) {
          const btnEl = document.createElement("button");
          btnEl.tabIndex = -1;
          const inst = ArvoIconButton.initialize(btnEl, {
            variant: "tertiary",
            size: "sm",
            icon: action.icon,
            tooltip: action.ariaLabel ?? action.id,
            isDisabled: item.isDisabled || action.isDisabled,
            onClick: (e) => {
              var _a2;
              e.stopPropagation();
              if (action.inlinePopover) {
                this._openInlinePopover(action.inlinePopover, btnEl);
              } else if (action.inlineHybridPopover) {
                this._openInlineHybridPopover(action.inlineHybridPopover, btnEl);
              } else {
                (_a2 = action.onClick) == null ? void 0 : _a2.call(action, item, e);
              }
            }
          });
          btnEl.setAttribute("data-action-id", action.id);
          this._trailingActionInstances.push(inst);
          actionsEl.appendChild(btnEl);
        }
        trailing.appendChild(actionsEl);
        if (overflow.length > 0) {
          const overflowWrap = document.createElement("span");
          overflowWrap.className = "arvo-menu-item__overflow";
          overflowWrap.addEventListener("click", (e) => e.stopPropagation());
          const overflowHost = document.createElement("button");
          overflowHost.tabIndex = -1;
          overflowWrap.appendChild(overflowHost);
          const overflowItems = overflow.map((action) => ({
            id: action.id,
            label: action.ariaLabel ?? action.id,
            icon: action.icon,
            isDisabled: item.isDisabled || action.isDisabled
          }));
          const overflowInst = ArvoDropdownIconButton.initialize(overflowHost, {
            icon: "ellipsis-v",
            tooltip: "More actions",
            variant: "tertiary",
            size: "sm",
            isCompact: true,
            isDisabled: item.isDisabled || this._isLoading,
            items: overflowItems,
            onSelect: (menuItem) => {
              var _a2;
              const action = overflow.find((a) => a.id === menuItem.id);
              if (!action) return;
              const synthetic = new Event("click");
              if (action.inlinePopover) {
                this._openInlinePopover(action.inlinePopover, overflowHost);
              } else if (action.inlineHybridPopover) {
                this._openInlineHybridPopover(action.inlineHybridPopover, overflowHost);
              } else {
                (_a2 = action.onClick) == null ? void 0 : _a2.call(action, item, synthetic);
              }
            }
          });
          this._overflowInstances.push(overflowInst);
          trailing.appendChild(overflowWrap);
        }
      }
      if (item.submenu) {
        const submenuIcon = document.createElement("span");
        submenuIcon.className = "arvo-menu-item__submenu o9con o9con-angle-right";
        submenuIcon.setAttribute("aria-hidden", "true");
        trailing.appendChild(submenuIcon);
      }
      if (isExternal) {
        const externalIcon = document.createElement("span");
        externalIcon.className = "arvo-menu-item__external o9con o9con-external-link";
        externalIcon.setAttribute("aria-hidden", "true");
        trailing.appendChild(externalIcon);
      }
      el.appendChild(trailing);
    }
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      this._handleItemActivation(idx);
    });
    el.addEventListener("pointerenter", () => {
      if (!item.isDisabled) {
        this._setActiveIndex(idx);
      }
      if (this._submenuTimer) {
        clearTimeout(this._submenuTimer);
        this._submenuTimer = null;
      }
      if (this._options.submenuTrigger === "hover" && item.submenu && !item.isDisabled) {
        this._submenuTimer = setTimeout(() => {
          this._closeSubmenus();
          this._openSubmenu(idx);
        }, INLINE_HOVER_DELAY_MS);
      } else if (this._options.submenuTrigger === "hover") {
        this._closeSubmenus();
      }
    });
    el.addEventListener("pointerleave", () => {
      if (this._submenuTimer) {
        clearTimeout(this._submenuTimer);
        this._submenuTimer = null;
      }
    });
    this._itemEls.push(el);
    this._scrollEl.appendChild(el);
    const labelEl = el.querySelector(".arvo-menu-item__lbl");
    if (labelEl && item.label) {
      const handle = attachTitleTruncationTooltip({
        triggerElement: el,
        element: labelEl,
        content: item.label,
        placement: "top-center"
      });
      this._truncationHandles.push(handle);
    }
  }
  _buildItemClasses(item) {
    var _a;
    const hasSecondary = !!item.secondaryLabel;
    const status = resolveStatus(item.status);
    return [
      "arvo-menu-item",
      hasSecondary && "arvo-menu-item--multi-line",
      item.destructive && "arvo-menu-item--destructive",
      status.modifier,
      this._options.actionsVisibility === "hover" && ((_a = item.actions) == null ? void 0 : _a.length) && "arvo-menu-item--actions-on-hover",
      item.active && "active"
    ].filter(Boolean).join(" ");
  }
  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------
  _getFilteredItems() {
    if (!this._query) return this._options.items;
    const items = this._options.items;
    const filterOpts = { query: this._query, keys: [...FILTER_KEYS] };
    if (isGrouped(items)) {
      return filterGroups(items, filterOpts);
    }
    return filterItems(items, filterOpts);
  }
  _handleFilterSearch(value) {
    var _a, _b, _c, _d;
    this._query = value;
    this._renderItems();
    this._activeIndex = -1;
    if (this._flatItems.length > 0) {
      this._setupArrowNav();
      this._setActiveIndex(0, { suppressFocus: true });
    } else {
      (_a = this._arrowNav) == null ? void 0 : _a.destroy();
      this._arrowNav = null;
    }
    if (this._searchCfg && this._query) {
      (_c = (_b = this._searchCfg).onFilter) == null ? void 0 : _c.call(_b, this._query, this._flatItems.length);
    }
    this._updateSearchCounter();
    (_d = this._surface) == null ? void 0 : _d.reposition();
  }
  _handleFilterClear() {
    var _a, _b, _c;
    this._query = "";
    this._renderItems();
    this._activeIndex = -1;
    if (this._flatItems.length > 0) {
      this._setupArrowNav();
      this._setActiveIndex(0, { suppressFocus: true });
    }
    (_b = (_a = this._searchCfg) == null ? void 0 : _a.onClear) == null ? void 0 : _b.call(_a);
    this._updateSearchCounter();
    (_c = this._surface) == null ? void 0 : _c.reposition();
  }
  _updateSearchCounter() {
    var _a;
    if (!((_a = this._searchCfg) == null ? void 0 : _a.counter) || !this._searchInstance) return;
    if (this._query) {
      const total = flattenItems(this._options.items).length;
      this._searchInstance.counter(this._flatItems.length, total);
    } else {
      this._searchInstance.counter();
    }
  }
  // ---------------------------------------------------------------------------
  // Trigger Events
  // ---------------------------------------------------------------------------
  _bindTriggerEvents() {
    var _a;
    (_a = this._element) == null ? void 0 : _a.addEventListener("click", this._boundHandleTriggerClick);
  }
  _handleTriggerClick() {
    if (this._isDisabled) return;
    this.toggle();
  }
  // ---------------------------------------------------------------------------
  // Keyboard
  // ---------------------------------------------------------------------------
  _handleKeyDown(e) {
    var _a;
    if (this._inlinePanelStack && this._inlinePanelStack.getDepth() > 0) {
      return;
    }
    if (this._isSubmenu && (e.key === "ArrowLeft" || e.key === "Escape")) {
      e.preventDefault();
      e.stopPropagation();
      this.close();
      return;
    }
    if (e.key === "Tab") {
      return;
    }
    if (this._isSearchFocused()) {
      return;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      this._handleHorizontalNav(e);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      const focused = document.activeElement;
      if (focused && focused.closest(
        ".arvo-menu-item__actions, .arvo-menu-item__overflow"
      )) {
        return;
      }
    }
    (_a = this._arrowNav) == null ? void 0 : _a.handleKeyDown(e);
  }
  _handleHorizontalNav(event) {
    const item = this._flatItems[this._activeIndex];
    if (!item) return;
    if (event.key === "ArrowRight" && item.submenu) {
      this._openSubmenu(this._activeIndex);
      event.preventDefault();
      return;
    }
    const buttons = this._getActiveRowActionButtons();
    if (buttons.length === 0) return;
    const activeEl = document.activeElement;
    const focusedActionIndex = activeEl instanceof HTMLButtonElement ? buttons.indexOf(activeEl) : -1;
    if (event.key === "ArrowRight") {
      if (focusedActionIndex === -1) {
        buttons[0].focus({ preventScroll: true });
        event.preventDefault();
      } else if (focusedActionIndex < buttons.length - 1) {
        buttons[focusedActionIndex + 1].focus({ preventScroll: true });
        event.preventDefault();
      }
      return;
    }
    if (event.key === "ArrowLeft") {
      if (focusedActionIndex === 0) {
        const itemEl = this._itemEls[this._activeIndex];
        itemEl == null ? void 0 : itemEl.focus({ preventScroll: true });
        event.preventDefault();
      } else if (focusedActionIndex > 0) {
        buttons[focusedActionIndex - 1].focus({ preventScroll: true });
        event.preventDefault();
      }
    }
  }
  // Returns the ordered list of focusable trailing-action buttons (visible
  // cluster + overflow dropdown trigger) for the currently active row.
  // ArrowRight / ArrowLeft cycle through this list. The buttons themselves
  // carry tabindex=-1 so the Tab cycle skips them but `.focus()` still works.
  _getActiveRowActionButtons() {
    const itemEl = this._itemEls[this._activeIndex];
    if (!itemEl) return [];
    return Array.from(
      itemEl.querySelectorAll(
        ".arvo-menu-item__actions button, .arvo-menu-item__overflow button"
      )
    );
  }
  // ---------------------------------------------------------------------------
  // Active Index
  // ---------------------------------------------------------------------------
  _setActiveIndex(index, options) {
    const prev = this._activeIndex;
    this._activeIndex = index;
    if (prev >= 0 && prev < this._itemEls.length && prev !== index) {
      this._itemEls[prev].setAttribute("tabindex", "-1");
    }
    if (index >= 0 && index < this._itemEls.length) {
      const el = this._itemEls[index];
      el.setAttribute("tabindex", "0");
      if ((options == null ? void 0 : options.forceFocus) || !(options == null ? void 0 : options.suppressFocus) && !this._isSearchFocused()) {
        el.focus({ preventScroll: true });
      }
      this._scrollIntoView(el);
    }
  }
  // Moves DOM focus from the search input into the option list. `edge`
  // selects the first or last enabled item.
  _focusListFromSearch(edge) {
    if (this._flatItems.length === 0) return;
    let target = -1;
    if (edge === "first") {
      target = this._flatItems.findIndex((item) => !item.isDisabled);
    } else {
      for (let i = this._flatItems.length - 1; i >= 0; i--) {
        if (!this._flatItems[i].isDisabled) {
          target = i;
          break;
        }
      }
    }
    if (target >= 0) this._setActiveIndex(target, { forceFocus: true });
  }
  _isSearchFocused() {
    var _a;
    if (!this._searchInstance) return false;
    const ae = typeof document !== "undefined" ? document.activeElement : null;
    if (!ae) return false;
    const wrap = (_a = this._panelEl) == null ? void 0 : _a.querySelector(".arvo-action-menu__search");
    return !!wrap && wrap.contains(ae);
  }
  _scrollIntoView(el) {
    if (!this._scrollEl) return;
    const containerRect = this._scrollEl.getBoundingClientRect();
    const itemRect = el.getBoundingClientRect();
    if (itemRect.bottom > containerRect.bottom) {
      this._scrollEl.scrollTop += itemRect.bottom - containerRect.bottom;
    } else if (itemRect.top < containerRect.top) {
      this._scrollEl.scrollTop -= containerRect.top - itemRect.top;
    }
  }
  // ---------------------------------------------------------------------------
  // Item Activation
  // ---------------------------------------------------------------------------
  _handleItemActivation(index) {
    var _a, _b, _c, _d;
    const item = this._flatItems[index];
    if (!item || item.isDisabled) return;
    const itemEl = this._itemEls[index];
    if (item.submenu) {
      this._openSubmenu(index);
      return;
    }
    if (item.inlineHybridPopover) {
      this._openInlineHybridPopover(item.inlineHybridPopover, itemEl);
      return;
    }
    if (item.inlinePopover) {
      this._openInlinePopover(item.inlinePopover, itemEl);
      return;
    }
    if (item.switch) {
      (_a = this._switchInstances.get(item.id)) == null ? void 0 : _a.toggle();
      return;
    }
    const event = new CustomEvent("action-menu:select", {
      bubbles: true,
      cancelable: true,
      detail: { item, index }
    });
    const dispatched = ((_b = this._element) == null ? void 0 : _b.dispatchEvent(event)) ?? true;
    const callbackResult = (_d = (_c = this._options).onSelect) == null ? void 0 : _d.call(_c, item, index);
    if (this._options.closeOnSelect && callbackResult !== false && dispatched) {
      this.close();
    }
  }
  // ---------------------------------------------------------------------------
  // Submenus
  // ---------------------------------------------------------------------------
  _openSubmenu(parentIndex) {
    const item = this._flatItems[parentIndex];
    if (!(item == null ? void 0 : item.submenu)) return;
    const parentEl = this._itemEls[parentIndex];
    parentEl.setAttribute("aria-expanded", "true");
    const submenu = _ArvoActionMenu._createSubmenu(parentEl, {
      items: item.submenu,
      placement: "right-start",
      submenuTrigger: this._options.submenuTrigger,
      closeOnSelect: this._options.closeOnSelect,
      onClose: () => {
        parentEl.setAttribute("aria-expanded", "false");
        parentEl.focus({ preventScroll: true });
      },
      onSelect: (selectedItem, selectedIndex) => {
        var _a, _b;
        const result = (_b = (_a = this._options).onSelect) == null ? void 0 : _b.call(_a, selectedItem, selectedIndex);
        if (this._options.closeOnSelect && result !== false) {
          this.close();
        }
        return false;
      }
    }, this);
    this._submenus.set(item.id, submenu);
    submenu.open();
  }
  _closeSubmenus() {
    for (const [, submenu] of this._submenus) {
      submenu.destroy();
    }
    this._submenus.clear();
  }
  _closeAll() {
    if (this._parentMenu) {
      this._parentMenu._closeAll();
    } else {
      this.close();
    }
  }
  // ---------------------------------------------------------------------------
  // Inline Panel Stack
  // ---------------------------------------------------------------------------
  _getOrCreateInlineStack() {
    if (!this._inlinePanelStack) {
      this._inlinePanelStack = createInlinePanelStack({
        host: this._panelEl,
        containerClass: "arvo-action-menu__inline-panel"
      });
    }
    return this._inlinePanelStack;
  }
  _destroyInlineInstance(entryId) {
    const instance = this._inlinePanelInstances.get(entryId);
    instance == null ? void 0 : instance.destroy();
    this._inlinePanelInstances.delete(entryId);
  }
  _closeAllInlinePanels() {
    if (!this._inlinePanelStack) return;
    for (const entry of this._inlinePanelStack.getEntries()) {
      this._destroyInlineInstance(entry.id);
    }
    this._inlinePanelStack.popAll();
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
  _openInlinePopover(config, sourceEl) {
    var _a;
    if (((_a = config.onOpen) == null ? void 0 : _a.call(config)) === false) return;
    const stack = this._getOrCreateInlineStack();
    const entryId = `inline-pop-${++_inlineIdCounter}`;
    const hostEl = document.createElement("div");
    const hasBackButton = config.hasBackButton !== false;
    const isClosable = config.isClosable !== false;
    if (config.height != null) {
      hostEl.style.setProperty(
        "--arvo-popover-height",
        typeof config.height === "number" ? `${config.height}px` : config.height
      );
    }
    const popover = ArvoPopover.initialize(hostEl, {
      isInline: true,
      variant: "edge",
      title: config.title ?? "",
      hasHeader: !!(config.title || hasBackButton || isClosable),
      isClosable,
      hasBackButton,
      width: config.width,
      content: config.content,
      actions: config.actions,
      isInteractive: true,
      onBack: () => {
        var _a2;
        (_a2 = config.onBack) == null ? void 0 : _a2.call(config);
        this._popInlinePanel("back");
      },
      // Closing the inline popover via the header X button, a footer
      // action, or its own outside-click handler should pop just THIS
      // inline layer back to the menu list -- not destroy the entire menu
      // tree. Outside clicks that land truly outside the action menu are
      // handled by the overlay hub, which closes both the popover overlay
      // entry AND the parent action menu in the same gesture.
      onClose: () => {
        var _a2;
        if (((_a2 = config.onClose) == null ? void 0 : _a2.call(config)) === false) return false;
        this._popInlinePanel("default");
        return false;
      }
    });
    stack.push({
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
    this._inlinePanelInstances.set(entryId, popover);
    popover.open();
  }
  _openInlineHybridPopover(config, sourceEl) {
    var _a;
    if (((_a = config.onOpen) == null ? void 0 : _a.call(config)) === false) return;
    const stack = this._getOrCreateInlineStack();
    const entryId = `inline-hybrid-${++_inlineIdCounter}`;
    const hostEl = document.createElement("div");
    const hybrid = ArvoHybridPopover.initialize(hostEl, {
      isInline: true,
      parent: this._panelId,
      title: config.title ?? "",
      variant: config.variant ?? "multi",
      items: config.items ?? [],
      hasBackButton: config.hasBackButton !== false,
      isClosable: true,
      width: config.width,
      height: config.height,
      onBack: () => {
        var _a2;
        (_a2 = config.onBack) == null ? void 0 : _a2.call(config);
        this._popInlinePanel("back");
      },
      // See _openInlinePopover above. Header X / footer action / panel
      // outside-click pop just this layer; the overlay hub still closes
      // the menu tree on a true-outside gesture.
      onClose: () => {
        var _a2;
        if (((_a2 = config.onClose) == null ? void 0 : _a2.call(config)) === false) return false;
        this._popInlinePanel("default");
        return false;
      }
    });
    stack.push({
      id: entryId,
      kind: "hybrid",
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
    this._inlinePanelInstances.set(entryId, hybrid);
    hybrid.open();
  }
  // ---------------------------------------------------------------------------
  // Arrow Nav Setup
  // ---------------------------------------------------------------------------
  _setupArrowNav() {
    var _a;
    (_a = this._arrowNav) == null ? void 0 : _a.destroy();
    this._arrowNav = createArrowNav({
      items: this._itemEls,
      orientation: "vertical",
      wrap: true,
      skipDisabled: (i) => {
        var _a2;
        return ((_a2 = this._flatItems[i]) == null ? void 0 : _a2.isDisabled) === true;
      },
      typeAhead: this._searchCfg ? void 0 : { getLabel: (i) => {
        var _a2;
        return ((_a2 = this._flatItems[i]) == null ? void 0 : _a2.label) ?? "";
      } },
      onNavigate: (_el, index) => this._setActiveIndex(index),
      onSelect: (_el, index) => this._handleItemActivation(index),
      onEscape: () => this.close()
    });
  }
  // ---------------------------------------------------------------------------
  // Focus Management
  // ---------------------------------------------------------------------------
  _focusInitial() {
    if (this._searchCfg && this._searchEl) {
      const input = this._searchEl.querySelector("input");
      input == null ? void 0 : input.focus({ preventScroll: true });
      const firstEnabled = this._flatItems.findIndex((item) => !item.isDisabled);
      if (firstEnabled >= 0) {
        this._setActiveIndex(firstEnabled, { suppressFocus: true });
      }
    } else if (this._flatItems.length > 0) {
      const firstEnabled = this._flatItems.findIndex((item) => !item.isDisabled);
      if (firstEnabled >= 0) {
        this._setActiveIndex(firstEnabled);
      }
    }
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  open() {
    var _a, _b, _c, _d, _e, _f;
    if (this._isOpen || this._isDisabled) return;
    if (((_b = (_a = this._options).onOpen) == null ? void 0 : _b.call(_a)) === false) return;
    const event = new CustomEvent("action-menu:open", {
      bubbles: true,
      cancelable: true
    });
    if (!((_c = this._element) == null ? void 0 : _c.dispatchEvent(event))) return;
    this._isOpen = true;
    this._closeReason = null;
    (_e = (_d = this._options).onOpenChange) == null ? void 0 : _e.call(_d, true);
    void ((_f = this._surface) == null ? void 0 : _f.open());
  }
  close() {
    var _a, _b, _c, _d;
    if (!this._isOpen) return;
    if (((_b = (_a = this._options).onClose) == null ? void 0 : _b.call(_a)) === false) return;
    const event = new CustomEvent("action-menu:close", {
      bubbles: true,
      cancelable: true
    });
    if (!((_c = this._element) == null ? void 0 : _c.dispatchEvent(event))) return;
    this._closeReason = "programmatic";
    void ((_d = this._surface) == null ? void 0 : _d.close());
  }
  isOpen() {
    return this._isOpen;
  }
  toggle(force) {
    const shouldOpen = force !== void 0 ? force : !this._isOpen;
    if (shouldOpen) this.open();
    else this.close();
  }
  updateItems(items) {
    var _a;
    this._options.items = items;
    this._query = "";
    (_a = this._searchInstance) == null ? void 0 : _a.clear();
    if (this._isOpen) {
      this._renderItems();
      this._setupArrowNav();
      if (this._flatItems.length > 0) {
        this._setActiveIndex(0);
      } else {
        this._activeIndex = -1;
      }
    }
  }
  setLoading(isLoading) {
    var _a;
    this._isLoading = isLoading;
    this._options.isLoading = isLoading;
    if (!this._panelEl) return;
    this._panelEl.classList.toggle("loading", isLoading);
    if (isLoading) {
      this._panelEl.setAttribute("aria-busy", "true");
    } else {
      this._panelEl.removeAttribute("aria-busy");
    }
    if (this._isOpen) {
      this._renderItems();
      if (!isLoading && this._flatItems.length > 0) {
        this._setupArrowNav();
        const firstEnabled = this._flatItems.findIndex((item) => !item.isDisabled);
        if (firstEnabled >= 0) {
          this._setActiveIndex(firstEnabled);
        }
      } else {
        (_a = this._arrowNav) == null ? void 0 : _a.destroy();
        this._arrowNav = null;
        this._activeIndex = -1;
      }
    }
  }
  disabled(state) {
    var _a, _b;
    if (state === void 0) {
      return this._isDisabled;
    }
    this._isDisabled = state;
    this._options.isDisabled = state;
    if (state) {
      (_a = this._element) == null ? void 0 : _a.setAttribute("aria-disabled", "true");
      if (this._isOpen) this.close();
    } else {
      (_b = this._element) == null ? void 0 : _b.removeAttribute("aria-disabled");
    }
  }
  destroy() {
    var _a, _b, _c, _d, _e;
    if (this._submenuTimer) {
      clearTimeout(this._submenuTimer);
      this._submenuTimer = null;
    }
    if (this._isOpen) {
      this._isOpen = false;
      this._closeAllInlinePanels();
      this._closeSubmenus();
      (_a = this._arrowNav) == null ? void 0 : _a.destroy();
      this._arrowNav = null;
      (_b = this._panelEl) == null ? void 0 : _b.removeEventListener("keydown", this._boundHandleKeyDown);
    }
    (_c = this._surface) == null ? void 0 : _c.destroy();
    this._surface = null;
    const el = this._element;
    if (el) {
      el.removeEventListener("click", this._boundHandleTriggerClick);
      el.removeAttribute("aria-disabled");
    }
    this._destroyTrailingActions();
    this._destroySwitchInstances();
    this._destroyEmptyState();
    if (this._inlinePanelTimer) {
      clearTimeout(this._inlinePanelTimer);
      this._inlinePanelTimer = null;
    }
    (_d = this._inlinePanelStack) == null ? void 0 : _d.destroy();
    this._inlinePanelStack = null;
    this._inlinePanelInstances.clear();
    (_e = this._searchInstance) == null ? void 0 : _e.destroy();
    this._searchInstance = null;
    if (this._panelEl) {
      this._panelEl.remove();
    }
    this._truncationHandles.forEach((h) => h.destroy());
    this._truncationHandles = [];
    this._element = null;
    this._panelEl = null;
    this._scrollEl = null;
    this._searchEl = null;
    this._flatItems = [];
    this._itemEls = [];
  }
  // ---------------------------------------------------------------------------
  // Internal Cleanup
  // ---------------------------------------------------------------------------
  _destroyTrailingActions() {
    for (const inst of this._trailingActionInstances) {
      inst.destroy();
    }
    this._trailingActionInstances = [];
    for (const inst of this._overflowInstances) {
      inst.destroy();
    }
    this._overflowInstances = [];
  }
  _destroySwitchInstances() {
    for (const inst of this._switchInstances.values()) {
      inst.destroy();
    }
    this._switchInstances.clear();
  }
  _destroyEmptyState() {
    var _a;
    (_a = this._emptyStateInstance) == null ? void 0 : _a.destroy();
    this._emptyStateInstance = null;
  }
  _dispatchEvent(eventName, detail = {}) {
    var _a;
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(eventName, { bubbles: true, cancelable: true, detail })
    );
  }
};
_ArvoActionMenu.DEFAULTS = {
  items: [],
  isLoading: false,
  search: void 0,
  placement: "bottom-start",
  maxHeight: null,
  hasGroupDividers: true,
  actionsVisibility: "always",
  actionsMaxVisible: 4,
  submenuTrigger: "hover",
  closeOnSelect: true,
  isDisabled: false,
  defaultOpen: false,
  isOpen: null,
  emptyConfig: null,
  onOpen: null,
  onClose: null,
  onSelect: null,
  onOpenChange: null
};
let ArvoActionMenu = _ArvoActionMenu;
export {
  ArvoActionMenu
};
//# sourceMappingURL=ActionMenu.js.map
