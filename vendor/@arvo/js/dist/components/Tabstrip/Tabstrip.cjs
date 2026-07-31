"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const core = require("@arvo/core");
const utils = require("@arvo/utils");
const IconButton = require("../IconButton/IconButton.cjs");
const ToggleButton = require("../ToggleButton/ToggleButton.cjs");
const DropdownIconButton = require("../DropdownIconButton/DropdownIconButton.cjs");
const Button = require("../Button/Button.cjs");
const Badge = require("../Badge/Badge.cjs");
const Status = require("../Status/Status.cjs");
const MessageAlert = require("../MessageAlert/MessageAlert.cjs");
const ActionMenu = require("../ActionMenu/ActionMenu.cjs");
function sortTabs(tabs) {
  const pinned = tabs.filter((t) => t.pinned);
  const unpinned = tabs.filter((t) => !t.pinned);
  const byOrder = (a, b) => {
    const aO = a.order ?? Infinity;
    const bO = b.order ?? Infinity;
    if (aO !== Infinity || bO !== Infinity) return aO - bO;
    return 0;
  };
  pinned.sort(byOrder);
  unpinned.sort(byOrder);
  return [...pinned, ...unpinned];
}
function getTabOrder(tabs) {
  return sortTabs(tabs).map((t) => t.id);
}
function composeAriaLabel(tab, isSelected) {
  var _a, _b;
  if (tab.ariaLabel) return tab.ariaLabel;
  const parts = [`${tab.label} tab`];
  if (isSelected) parts.push("selected");
  if ((_a = tab.badge) == null ? void 0 : _a.label) parts.push(tab.badge.label.toLowerCase());
  if (tab.alert) {
    parts.push(tab.alert.label ?? "contains validation issues");
  }
  if ((_b = tab.status) == null ? void 0 : _b.label) {
    parts.push(`status: ${tab.status.label.toLowerCase()}`);
  }
  if (tab.pinned) parts.push("pinned");
  return parts.join(", ");
}
const TAB_MENU_ID = {
  PIN: "__tabstrip:pin",
  UNPIN: "__tabstrip:unpin",
  CLOSE: "__tabstrip:close",
  CLOSE_OTHERS: "__tabstrip:close-others",
  CLOSE_RIGHT: "__tabstrip:close-right",
  MOVE_LEFT: "__tabstrip:move-left",
  MOVE_RIGHT: "__tabstrip:move-right",
  MOVE_START: "__tabstrip:move-start",
  MOVE_END: "__tabstrip:move-end"
};
function buildDefaultMenuItems(tab, flags, globalClosable) {
  const items = [];
  const tabClosable = tab.isClosable ?? globalClosable;
  if (flags.isPinnable && flags.isHorizontal && !tab.isDisabled) {
    items.push({
      id: tab.pinned ? TAB_MENU_ID.UNPIN : TAB_MENU_ID.PIN,
      label: tab.pinned ? "Unpin tab" : "Pin tab",
      shortcut: "Ctrl+P"
    });
  }
  if (tabClosable && flags.isHorizontal && !tab.pinned && !tab.isDisabled) {
    items.push({
      id: TAB_MENU_ID.CLOSE,
      label: "Close tab",
      shortcut: "Del"
    });
    items.push({ id: TAB_MENU_ID.CLOSE_OTHERS, label: "Close other tabs" });
    items.push({
      id: TAB_MENU_ID.CLOSE_RIGHT,
      label: "Close tabs to the right"
    });
  }
  if (flags.isReorderable && flags.isHorizontal && !tab.isDisabled) {
    items.push({
      id: TAB_MENU_ID.MOVE_LEFT,
      label: "Move left",
      shortcut: "Ctrl+ArrowLeft"
    });
    items.push({
      id: TAB_MENU_ID.MOVE_RIGHT,
      label: "Move right",
      shortcut: "Ctrl+ArrowRight"
    });
    items.push({
      id: TAB_MENU_ID.MOVE_START,
      label: "Move to start",
      shortcut: "Ctrl+Home"
    });
    items.push({
      id: TAB_MENU_ID.MOVE_END,
      label: "Move to end",
      shortcut: "Ctrl+End"
    });
  }
  return items;
}
function composeTabMenu(tab, flags, globalClosable) {
  const consumer = tab.menuItems ?? [];
  const defaults = buildDefaultMenuItems(tab, flags, globalClosable);
  if (consumer.length === 0 && defaults.length === 0) return null;
  if (consumer.length === 0) return defaults;
  if (defaults.length === 0) return consumer;
  return [
    { id: "__tabstrip:group-consumer", items: consumer },
    { id: "__tabstrip:group-defaults", items: defaults }
  ];
}
function flattenMenuPayload(payload) {
  if (!payload || payload.length === 0) return [];
  if ("items" in payload[0]) {
    return payload.flatMap((g) => g.items);
  }
  return payload;
}
function payloadIsGrouped(payload) {
  return Array.isArray(payload) && payload.length > 0 && "items" in payload[0];
}
const _ArvoTabstrip = class _ArvoTabstrip {
  constructor(element, options) {
    this._listEl = null;
    this._indicatorEl = null;
    this._rightClusterEl = null;
    this._overflowWrapperEl = null;
    this._overflowTriggerInstance = null;
    this._overflowMenuInstance = null;
    this._overflowBtnEl = null;
    this._addBtnWrapperEl = null;
    this._addBtnInstance = null;
    this._addBtnIsCompact = false;
    this._dividerEl = null;
    this._tabs = [];
    this._displayOrder = [];
    this._hiddenTabIds = /* @__PURE__ */ new Set();
    this._overflowMgr = null;
    this._sortable = null;
    this._indicatorResizeObserver = null;
    this._element = element;
    const variant = (options == null ? void 0 : options.variant) && _ArvoTabstrip.VARIANTS.includes(options.variant) ? options.variant : _ArvoTabstrip.DEFAULTS.variant;
    const size = (options == null ? void 0 : options.size) && _ArvoTabstrip.SIZES.includes(options.size) ? options.size : _ArvoTabstrip.DEFAULTS.size;
    const seededSelectedId = (options == null ? void 0 : options.selectedId) !== void 0 ? options.selectedId ?? null : (options == null ? void 0 : options.defaultSelectedId) !== void 0 ? options.defaultSelectedId ?? null : null;
    this._options = {
      ..._ArvoTabstrip.DEFAULTS,
      ...options,
      variant,
      size,
      tabs: (options == null ? void 0 : options.tabs) ? [...options.tabs] : [],
      selectedId: seededSelectedId,
      maxTabs: options == null ? void 0 : options.maxTabs,
      menuProps: (options == null ? void 0 : options.menuProps) ?? null,
      overflowMenuProps: (options == null ? void 0 : options.overflowMenuProps) ?? null,
      onSelect: (options == null ? void 0 : options.onSelect) ?? null,
      onClose: (options == null ? void 0 : options.onClose) ?? null,
      onPin: (options == null ? void 0 : options.onPin) ?? null,
      onTabAdd: (options == null ? void 0 : options.onTabAdd) ?? null,
      onTabReorder: (options == null ? void 0 : options.onTabReorder) ?? null,
      onOverflowOpen: (options == null ? void 0 : options.onOverflowOpen) ?? null
    };
    this._boundHandleKeyDown = this._handleKeyDown.bind(this);
    this._boundHandleClick = this._handleClick.bind(this);
    this._boundHandleContextMenu = this._handleContextMenu.bind(this);
    this._render();
    this._bindEvents();
    this._setupOverflowDetection();
    this._setupSortable();
    this._setupIndicatorObserver();
    if (!this._options.selectedId && this._options.tabs.length > 0) {
      const first = this._options.tabs.find((t) => !t.isDisabled);
      if (first) {
        this._options.selectedId = first.id;
        this._syncSelection();
      }
    }
  }
  static initialize(element, options) {
    return new _ArvoTabstrip(element, options);
  }
  _computeDisplayOrder() {
    return sortTabs(this._options.tabs);
  }
  // -- Rendering -----------------------------------------------------------
  _render() {
    var _a;
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    this._tabs = [];
    this._displayOrder = this._computeDisplayOrder();
    const {
      variant,
      size,
      orientation,
      isFullWidth,
      isDisabled,
      isLoading,
      hasOverflow,
      hasAddButton,
      hasTabstripBorder
    } = this._options;
    const isHorizontal = orientation === "horizontal";
    el.classList.add(
      "arvo-tabs",
      `arvo-tabs--${variant}`,
      `arvo-tabs--${size}`,
      `arvo-tabs--${orientation}`
    );
    if (isFullWidth) el.classList.add("arvo-tabs--full-width");
    if (isHorizontal && hasOverflow) el.classList.add("arvo-tabs--overflow");
    if (isDisabled) el.classList.add("is-disabled");
    if (isLoading) {
      el.classList.add("loading");
      el.setAttribute("aria-busy", "true");
    }
    this._listEl = document.createElement("div");
    this._listEl.className = "arvo-tabs__list";
    this._listEl.setAttribute("role", "tablist");
    this._listEl.setAttribute("aria-orientation", orientation);
    this._listEl.setAttribute("aria-label", "Tabs");
    for (const tab of this._displayOrder) {
      const entry = this._createTabEntry(tab);
      this._tabs.push(entry);
      this._listEl.appendChild(entry.el);
    }
    this._indicatorEl = document.createElement("span");
    this._indicatorEl.className = "arvo-tabs__indicator";
    this._indicatorEl.setAttribute("aria-hidden", "true");
    this._indicatorEl.dataset.indicatorState = "hidden";
    this._listEl.appendChild(this._indicatorEl);
    el.appendChild(this._listEl);
    const needsRightCluster = isHorizontal && (hasOverflow || hasAddButton);
    if (needsRightCluster) {
      this._rightClusterEl = document.createElement("div");
      this._rightClusterEl.className = "arvo-tabs__right";
      el.appendChild(this._rightClusterEl);
    }
    if (isHorizontal && hasOverflow && this._rightClusterEl) {
      this._overflowWrapperEl = document.createElement("div");
      this._overflowWrapperEl.className = "arvo-tabs__overflow-btn";
      this._overflowBtnEl = document.createElement("button");
      this._overflowWrapperEl.appendChild(this._overflowBtnEl);
      this._overflowTriggerInstance = IconButton.ArvoIconButton.initialize(
        this._overflowBtnEl,
        {
          icon: "ellipsis-v",
          // Tertiary -- the overflow trigger is a strip utility, not a
          // primary call-to-action.
          variant: "tertiary",
          size: this._iconBtnSize(),
          tooltip: "More tabs",
          isDisabled,
          isLoading
        }
      );
      this._overflowMenuInstance = ActionMenu.ArvoActionMenu.initialize(
        this._overflowBtnEl,
        {
          ...this._options.overflowMenuProps ?? void 0,
          items: [],
          placement: "bottom-end",
          closeOnSelect: true,
          actionsVisibility: ((_a = this._options.overflowMenuProps) == null ? void 0 : _a.actionsVisibility) ?? "always",
          isDisabled: isDisabled || isLoading,
          onSelect: (item) => {
            var _a2, _b, _c;
            if (item.isDisabled) return;
            const idx = this._options.tabs.findIndex((t) => t.id === item.id);
            this._options.selectedId = item.id;
            this._syncSelection();
            (_a2 = this._overflowMgr) == null ? void 0 : _a2.refresh();
            this._dispatchEvent("tabs:select", { id: item.id, index: idx });
            (_c = (_b = this._options).onSelect) == null ? void 0 : _c.call(_b, { id: item.id, index: idx });
          },
          onOpenChange: (isOpen) => {
            var _a2, _b;
            if (isOpen) {
              this._dispatchEvent("tabs:overflow-open", {});
              (_b = (_a2 = this._options).onOverflowOpen) == null ? void 0 : _b.call(_a2);
            }
          }
        }
      );
      this._overflowWrapperEl.style.display = "none";
      this._rightClusterEl.appendChild(this._overflowWrapperEl);
    }
    if (isHorizontal && hasAddButton && this._rightClusterEl) {
      this._addBtnWrapperEl = document.createElement("div");
      this._addBtnWrapperEl.className = "arvo-tabs__add-btn";
      this._rightClusterEl.appendChild(this._addBtnWrapperEl);
      this._mountAddButton(false);
    }
    if (isHorizontal && hasTabstripBorder && this._listEl) {
      this._dividerEl = document.createElement("span");
      this._dividerEl.className = "arvo-tabs__divider";
      this._dividerEl.setAttribute("aria-hidden", "true");
      this._listEl.insertBefore(this._dividerEl, this._listEl.firstChild);
    }
    this._syncSelection();
  }
  _createTabEntry(tab) {
    const el = document.createElement("div");
    el.setAttribute("role", "tab");
    el.setAttribute("data-tab-id", tab.id);
    el.setAttribute("aria-selected", "false");
    el.tabIndex = -1;
    if (tab.panelId) el.setAttribute("aria-controls", tab.panelId);
    if (tab.tooltip) el.title = tab.tooltip;
    const isSelected = tab.id === this._options.selectedId;
    el.setAttribute("aria-label", composeAriaLabel(tab, isSelected));
    const { orientation, isLoading, isDisabled: stripDisabled } = this._options;
    const isHorizontal = orientation === "horizontal";
    const isTabDisabled = tab.isDisabled || stripDisabled;
    if (isTabDisabled) el.setAttribute("aria-disabled", "true");
    el.className = [
      "arvo-tabs__tab",
      isTabDisabled ? "is-disabled" : "",
      tab.pinned ? "is-pinned" : ""
    ].filter(Boolean).join(" ");
    const leftEl = document.createElement("span");
    leftEl.className = "arvo-tabs__tab-lft";
    let icoEl = null;
    if (tab.icon) {
      icoEl = document.createElement("span");
      icoEl.className = `arvo-tabs__tab-ico o9con o9con-${tab.icon}`;
      icoEl.setAttribute("aria-hidden", "true");
      leftEl.appendChild(icoEl);
    }
    const lblEl = document.createElement("span");
    lblEl.className = "arvo-tabs__tab-lbl";
    lblEl.setAttribute("data-label", tab.label);
    const lblTextEl = document.createElement("span");
    lblTextEl.className = "arvo-tabs__tab-lbl-text";
    lblTextEl.textContent = tab.label;
    lblEl.appendChild(lblTextEl);
    leftEl.appendChild(lblEl);
    let alertEl = null;
    let alertInstance = null;
    if (tab.alert) {
      alertEl = document.createElement("span");
      alertEl.className = "arvo-tabs__tab-alert";
      const alertInnerEl = document.createElement("span");
      alertEl.appendChild(alertInnerEl);
      alertInstance = MessageAlert.ArvoMessageAlert.initialize(alertInnerEl, {
        isInline: true,
        type: tab.alert.type ?? "negative",
        message: tab.alert.label
      });
      leftEl.appendChild(alertEl);
    }
    let badgeEl = null;
    let badgeInstance = null;
    if (tab.badge) {
      badgeEl = document.createElement("span");
      badgeEl.className = "arvo-tabs__tab-badge";
      const badgeInnerEl = document.createElement("span");
      badgeEl.appendChild(badgeInnerEl);
      badgeInstance = Badge.ArvoBadge.initialize(badgeInnerEl, {
        size: "sm",
        semanticType: tab.badge.semanticType ?? "positive",
        message: tab.badge.label,
        hasBadgeIcon: false,
        tooltip: tab.badge.tooltip ?? null
      });
      leftEl.appendChild(badgeEl);
    }
    let statusEl = null;
    let statusInstance = null;
    if (tab.status) {
      statusEl = document.createElement("span");
      statusEl.className = "arvo-tabs__tab-status";
      const statusInnerEl = document.createElement("span");
      statusEl.appendChild(statusInnerEl);
      statusInstance = Status.ArvoStatus.initialize(statusInnerEl, {
        size: "sm",
        type: tab.status.type ?? "available",
        placement: "inline",
        tooltip: tab.status.tooltip ?? tab.status.label
      });
      leftEl.appendChild(statusEl);
    }
    el.appendChild(leftEl);
    const flags = {
      isPinnable: this._options.isPinnable,
      isClosable: this._options.isClosable,
      isReorderable: this._options.isReorderable,
      isHorizontal
    };
    const composedMenu = composeTabMenu(
      tab,
      flags,
      this._options.isClosable
    );
    const composedIsGrouped = payloadIsGrouped(composedMenu);
    const composedFlatItems = flattenMenuPayload(composedMenu);
    const hasVisibleMenu = Array.isArray(tab.menuItems) && tab.menuItems.length > 0;
    const tabPinnable = isHorizontal && this._options.isPinnable;
    const tabClosable = isHorizontal && !tab.pinned && (tab.isClosable ?? this._options.isClosable);
    const hasActions = hasVisibleMenu || tabPinnable || tabClosable;
    let actionsEl = null;
    let menuBtn = null;
    let menuBtnEl = null;
    let pinBtn = null;
    let closeBtn = null;
    let hiddenMenu = null;
    let hiddenMenuAnchorEl = null;
    if (hasActions) {
      actionsEl = document.createElement("span");
      actionsEl.className = "arvo-tabs__tab-actions";
      if (hasVisibleMenu) {
        const menuWrapEl = document.createElement("span");
        menuWrapEl.className = "arvo-tabs__tab-menu";
        menuBtnEl = document.createElement("button");
        menuBtnEl.tabIndex = -1;
        menuWrapEl.appendChild(menuBtnEl);
        menuBtn = DropdownIconButton.ArvoDropdownIconButton.initialize(menuBtnEl, {
          ...this._options.menuProps ?? {},
          icon: "ellipsis-v",
          variant: "tertiary",
          size: "sm",
          isCompact: true,
          tooltip: "Tab actions",
          items: composedIsGrouped ? composedMenu : composedFlatItems,
          hasGroupDividers: composedIsGrouped,
          closeOnSelect: true,
          isDisabled: isTabDisabled,
          isLoading,
          onSelect: (item) => this._handleTabMenuSelect(tab, item)
        });
        actionsEl.appendChild(menuWrapEl);
      }
      if (tabPinnable) {
        const pinWrapEl = document.createElement("span");
        pinWrapEl.className = "arvo-tabs__tab-pin";
        const pinBtnEl = document.createElement("button");
        pinBtnEl.tabIndex = -1;
        pinWrapEl.appendChild(pinBtnEl);
        pinBtn = ToggleButton.ArvoToggleButton.initialize(pinBtnEl, {
          icon: "push-pin",
          selectedIcon: "push-pinned",
          variant: "tertiary",
          size: "sm",
          tooltip: tab.pinned ? "Unpin tab" : "Pin tab",
          isDisabled: isTabDisabled,
          isLoading,
          isSelected: !!tab.pinned,
          status: tab.pinActionStatus ?? null,
          onClick: (e) => {
            e.stopPropagation();
          },
          onSelectedChange: () => {
            if (tab.isDisabled || this._options.isDisabled || this._options.isLoading) {
              return;
            }
            this._togglePin(tab);
          }
        });
        actionsEl.appendChild(pinWrapEl);
      }
      if (tabClosable) {
        const closeWrapEl = document.createElement("span");
        closeWrapEl.className = "arvo-tabs__tab-close";
        const closeBtnEl = document.createElement("button");
        closeBtnEl.tabIndex = -1;
        closeWrapEl.appendChild(closeBtnEl);
        closeBtn = IconButton.ArvoIconButton.initialize(closeBtnEl, {
          icon: "close",
          variant: "tertiary",
          size: "sm",
          tooltip: "Close tab",
          isDisabled: isTabDisabled,
          isLoading,
          status: tab.closeActionStatus ?? null,
          onClick: (e) => {
            e.stopPropagation();
            if (tab.isDisabled || this._options.isDisabled || this._options.isLoading) {
              return;
            }
            this._closeTab(tab.id);
          }
        });
        actionsEl.appendChild(closeWrapEl);
      }
      el.appendChild(actionsEl);
    }
    if (!hasVisibleMenu && composedMenu !== null) {
      hiddenMenuAnchorEl = document.createElement("button");
      hiddenMenuAnchorEl.type = "button";
      hiddenMenuAnchorEl.tabIndex = -1;
      hiddenMenuAnchorEl.setAttribute("aria-hidden", "true");
      hiddenMenuAnchorEl.className = "arvo-tabs__tab-menu-anchor";
      Object.assign(hiddenMenuAnchorEl.style, {
        position: "absolute",
        right: "0",
        bottom: "0",
        width: "1px",
        height: "1px",
        opacity: "0",
        pointerEvents: "none"
      });
      el.appendChild(hiddenMenuAnchorEl);
      hiddenMenu = ActionMenu.ArvoActionMenu.initialize(hiddenMenuAnchorEl, {
        items: composedIsGrouped ? composedMenu : composedFlatItems,
        hasGroupDividers: composedIsGrouped,
        placement: "bottom-end",
        closeOnSelect: true,
        isDisabled: isTabDisabled || isLoading,
        onSelect: (item) => this._handleTabMenuSelect(tab, item)
      });
    }
    let skelEl = null;
    if (isLoading) {
      skelEl = document.createElement("span");
      skelEl.className = "arvo-tabs__skel";
      skelEl.setAttribute("aria-hidden", "true");
      el.appendChild(skelEl);
    }
    const truncationHandle = utils.attachTitleTruncationTooltip({
      element: lblTextEl,
      triggerElement: el,
      content: tab.label,
      placement: "bottom-center"
    });
    return {
      item: tab,
      el,
      leftEl,
      lblEl,
      lblTextEl,
      icoEl,
      actionsEl,
      menuBtn,
      menuBtnEl,
      pinBtn,
      closeBtn,
      hiddenMenu,
      hiddenMenuAnchorEl,
      skelEl,
      badgeEl,
      badgeInstance,
      statusEl,
      statusInstance,
      alertEl,
      alertInstance,
      truncationHandle
    };
  }
  // -- Per-tab action helpers --------------------------------------------
  /**
   * Toggle the tab's pinned state and emit the matching event / callback.
   * Shared by the inline ToggleButton, the Ctrl+P shortcut, the Pin /
   * Unpin entry in the per-tab action menu, and the row-level pin
   * action inside the strip-level overflow menu.
   *
   * Accepts either a TabItem reference or its id so callers that hold
   * stale references (e.g. menu-item closures that captured an old
   * `tabs` array) can pass an id and we always operate on the live
   * `_options.tabs` entry.
   */
  _togglePin(target) {
    var _a, _b;
    const id = typeof target === "string" ? target : target.id;
    const tab = this._options.tabs.find((t) => t.id === id);
    if (!tab) return;
    if (!this._options.isPinnable || tab.isDisabled || this._options.isDisabled || this._options.isLoading) {
      return;
    }
    const newPinned = !tab.pinned;
    tab.pinned = newPinned;
    const updated = this._options.tabs.map(
      (t) => t.id === id ? { ...t, pinned: newPinned } : t
    );
    this._options.tabs = updated;
    const tabOrder = getTabOrder(updated);
    this._rebuildDisplay();
    this._dispatchEvent("tabs:pin", { id, pinned: newPinned, tabOrder });
    (_b = (_a = this._options).onPin) == null ? void 0 : _b.call(_a, { id, pinned: newPinned, tabOrder });
  }
  /**
   * Close a tab. Dispatches the cancelable `tabs:close` CustomEvent and
   * invokes the `onClose` callback; both can suppress the internal
   * removal (event via `preventDefault()`, callback via `return false`).
   * When the close is NOT cancelled the Tabstrip removes the tab from
   * its own `tabs` array, falling back to the next enabled tab per
   * `closeBehavior` if the closed tab was selected.
   */
  _closeTab(id) {
    var _a, _b, _c;
    if (this._options.isDisabled || this._options.isLoading) return;
    const idx = this._options.tabs.findIndex((t) => t.id === id);
    if (idx < 0) return;
    const evt = new CustomEvent("tabs:close", {
      bubbles: true,
      cancelable: true,
      detail: { id, index: idx }
    });
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(evt);
    const cbResult = (_c = (_b = this._options).onClose) == null ? void 0 : _c.call(_b, { id, index: idx });
    if (evt.defaultPrevented || cbResult === false) return;
    this.removeTab(id);
  }
  /**
   * Move a tab one slot, to the start, or to the end of its OWN group
   * (pinned / unpinned). Shared by the menu actions and the
   * Ctrl+Home / Ctrl+End shortcuts. The single-slot left/right path is
   * intentionally also routed through here so the menu and shortcuts
   * stay in lockstep (the in-flight drag-reorder one-slot shortcut is
   * still handled by `createSortableList` directly when a drag is
   * active).
   */
  _moveTabBy(tab, action) {
    var _a, _b;
    if (!this._options.isReorderable || this._options.isDisabled || this._options.isLoading) {
      return;
    }
    const group = tab.pinned ? "pinned" : "unpinned";
    const display = this._displayOrder;
    const groupTabs = display.filter(
      (t) => (t.pinned ? "pinned" : "unpinned") === group
    );
    const idxInGroup = groupTabs.findIndex((t) => t.id === tab.id);
    if (idxInGroup < 0) return;
    let targetIdx = idxInGroup;
    if (action === "start") targetIdx = 0;
    else if (action === "end") targetIdx = groupTabs.length - 1;
    else if (action === "left") targetIdx = Math.max(0, idxInGroup - 1);
    else if (action === "right")
      targetIdx = Math.min(groupTabs.length - 1, idxInGroup + 1);
    if (targetIdx === idxInGroup) return;
    const newGroup = [...groupTabs];
    const [moved] = newGroup.splice(idxInGroup, 1);
    newGroup.splice(targetIdx, 0, moved);
    const newDisplay = group === "pinned" ? [...newGroup, ...display.filter((t) => !t.pinned)] : [...display.filter((t) => t.pinned), ...newGroup];
    const orderById = new Map(newDisplay.map((t, i) => [t.id, i]));
    const reordered = [...this._options.tabs].sort((a, b) => {
      const ai = orderById.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const bi = orderById.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return ai - bi;
    });
    this._options.tabs = reordered;
    this._rebuildDisplay();
    this._dispatchEvent("tabs:reorder", { tabs: reordered });
    (_b = (_a = this._options).onTabReorder) == null ? void 0 : _b.call(_a, reordered);
  }
  /**
   * Centralized dispatcher for the per-tab action menu. Consumer-supplied
   * items keep their own onClick / onSelect (already invoked by the menu
   * surface) -- we act only on the internal `__tabstrip:*` sentinels.
   */
  _handleTabMenuSelect(tab, item) {
    switch (item.id) {
      case TAB_MENU_ID.PIN:
      case TAB_MENU_ID.UNPIN:
        this._togglePin(tab);
        return;
      case TAB_MENU_ID.CLOSE:
        this._closeTab(tab.id);
        return;
      case TAB_MENU_ID.CLOSE_OTHERS: {
        const otherIds = this._options.tabs.filter((t) => t.id !== tab.id && !t.pinned && !t.isDisabled).map((t) => t.id);
        for (const id of otherIds) this._closeTab(id);
        return;
      }
      case TAB_MENU_ID.CLOSE_RIGHT: {
        const startIdx = this._displayOrder.findIndex((t) => t.id === tab.id);
        if (startIdx < 0) return;
        const rightIds = this._displayOrder.slice(startIdx + 1).filter((t) => !t.pinned && !t.isDisabled).map((t) => t.id);
        for (const id of rightIds) this._closeTab(id);
        return;
      }
      case TAB_MENU_ID.MOVE_LEFT:
        this._moveTabBy(tab, "left");
        return;
      case TAB_MENU_ID.MOVE_RIGHT:
        this._moveTabBy(tab, "right");
        return;
      case TAB_MENU_ID.MOVE_START:
        this._moveTabBy(tab, "start");
        return;
      case TAB_MENU_ID.MOVE_END:
        this._moveTabBy(tab, "end");
        return;
      default:
        return;
    }
  }
  /**
   * Open the tab's per-tab context menu. Prefers the visible dropdown
   * trigger (so the menu opens anchored to the visible affordance);
   * falls back to the hidden ArvoActionMenu mounted on tabs that only
   * have default actions.
   */
  _openTabContextMenu(id) {
    var _a;
    const entry = this._tabs.find((t) => t.item.id === id);
    if (!entry) return;
    if (entry.menuBtnEl) {
      entry.menuBtnEl.click();
      return;
    }
    (_a = entry.hiddenMenu) == null ? void 0 : _a.open();
  }
  _iconBtnSize() {
    return this._options.size === "sm" ? "sm" : "md";
  }
  /**
   * Mount the Add-New affordance into `_addBtnWrapperEl`. When
   * `compact=true` it is an icon-only ArvoIconButton (used while
   * tabs are overflowing); otherwise it is the expanded labeled
   * ArvoButton. We tear down + recreate the inner instance whenever
   * the shape flips, but skip the rebuild when nothing changed so we
   * don't churn DOM on every overflow recalc.
   */
  _mountAddButton(compact) {
    var _a;
    if (!this._addBtnWrapperEl) return;
    if (this._addBtnInstance && this._addBtnIsCompact === compact) {
      this._refreshAddButtonState();
      return;
    }
    (_a = this._addBtnInstance) == null ? void 0 : _a.destroy();
    this._addBtnInstance = null;
    this._addBtnWrapperEl.textContent = "";
    this._addBtnIsCompact = compact;
    const addBtnEl = document.createElement("button");
    this._addBtnWrapperEl.appendChild(addBtnEl);
    const {
      isDisabled,
      isAddDisabled,
      maxTabs,
      tabs,
      addButtonLabel,
      isLoading,
      size
    } = this._options;
    const addDisabled = isDisabled || isAddDisabled || typeof maxTabs === "number" && tabs.length >= maxTabs;
    if (compact) {
      this._addBtnInstance = IconButton.ArvoIconButton.initialize(addBtnEl, {
        icon: "plus",
        // Tertiary matches the overflow trigger's strip-utility weight
        // (the expanded form uses the outline ArvoButton).
        variant: "tertiary",
        size: this._iconBtnSize(),
        tooltip: addButtonLabel,
        isDisabled: addDisabled,
        isLoading,
        onClick: () => {
          var _a2, _b;
          this._dispatchEvent("tabs:add", {});
          (_b = (_a2 = this._options).onTabAdd) == null ? void 0 : _b.call(_a2);
        }
      });
    } else {
      this._addBtnInstance = Button.ArvoButton.initialize(addBtnEl, {
        variant: "outline",
        icon: "plus",
        size: size === "sm" ? "sm" : "md",
        label: addButtonLabel,
        isDisabled: addDisabled,
        isLoading,
        onClick: () => {
          var _a2, _b;
          this._dispatchEvent("tabs:add", {});
          (_b = (_a2 = this._options).onTabAdd) == null ? void 0 : _b.call(_a2);
        }
      });
    }
  }
  /** Sync the Add-New button's disabled state without rebuilding it. */
  _refreshAddButtonState() {
    if (!this._addBtnInstance) return;
    const { isDisabled, isAddDisabled, maxTabs, tabs } = this._options;
    const addDisabled = isDisabled || isAddDisabled || typeof maxTabs === "number" && tabs.length >= maxTabs;
    this._addBtnInstance.disabled(addDisabled);
  }
  _destroyTabEntry(entry) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    (_a = entry.menuBtn) == null ? void 0 : _a.destroy();
    (_b = entry.pinBtn) == null ? void 0 : _b.destroy();
    (_c = entry.closeBtn) == null ? void 0 : _c.destroy();
    (_d = entry.hiddenMenu) == null ? void 0 : _d.destroy();
    (_e = entry.badgeInstance) == null ? void 0 : _e.destroy();
    (_f = entry.statusInstance) == null ? void 0 : _f.destroy();
    (_g = entry.alertInstance) == null ? void 0 : _g.destroy();
    (_h = entry.truncationHandle) == null ? void 0 : _h.destroy();
    entry.el.remove();
  }
  /**
   * Diff-rebuild the tab list. Tabs that survive across a rebuild
   * (pin/unpin, reorder, removeTab) keep their existing DOM nodes and
   * inner Arvo component instances -- we only:
   *  - rebuild entries that need new inner affordances (close button
   *    appearing/disappearing on (un)pin, menu items changing)
   *  - destroy entries for tabs that were removed from `_options.tabs`
   *  - move surviving entries to their new position in `_listEl`
   *
   * This is the key fix for the "all pin icons animate on every pin"
   * regression -- the old full-rebuild path tore down every entry and
   * recreated the ArvoToggleButton with `.active` already applied,
   * which kicked off the `arvo-toggle-grow` animation on every pinned
   * tab. With diff-based preservation only the AFFECTED toggle gets
   * its `.active` class flipped, so only its own animation runs.
   *
   * Focus is also preserved across rebuilds: if the user was focused
   * on a tab when the rebuild started, that tab keeps focus afterward
   * (or, if it was removed, focus follows the auto-selected next tab).
   */
  _rebuildDisplay() {
    var _a, _b, _c;
    if (!this._listEl) return;
    const activeEl = document.activeElement;
    const focusedTabId = ((_a = activeEl == null ? void 0 : activeEl.closest(".arvo-tabs__tab")) == null ? void 0 : _a.getAttribute("data-tab-id")) ?? null;
    this._teardownSortable();
    const previousEntries = /* @__PURE__ */ new Map();
    for (const entry of this._tabs) {
      previousEntries.set(entry.item.id, entry);
    }
    this._displayOrder = this._computeDisplayOrder();
    const nextEntries = [];
    const usedIds = /* @__PURE__ */ new Set();
    for (const tab of this._displayOrder) {
      const existing = previousEntries.get(tab.id);
      if (existing && this._canPatchEntry(existing, tab)) {
        this._patchTabEntry(existing, tab);
        nextEntries.push(existing);
        usedIds.add(tab.id);
      } else {
        if (existing) {
          this._destroyTabEntry(existing);
          usedIds.add(tab.id);
        }
        const entry = this._createTabEntry(tab);
        nextEntries.push(entry);
      }
    }
    for (const [id, entry] of previousEntries) {
      if (!usedIds.has(id) && !nextEntries.includes(entry)) {
        this._destroyTabEntry(entry);
      }
    }
    this._tabs = nextEntries;
    (_b = this._indicatorEl) == null ? void 0 : _b.remove();
    for (const entry of this._tabs) {
      this._listEl.appendChild(entry.el);
    }
    if (this._indicatorEl) {
      this._listEl.appendChild(this._indicatorEl);
    }
    this._syncSelection();
    if (this._options.hasOverflow && this._options.orientation === "horizontal") {
      this._checkOverflow();
    }
    this._setupSortable();
    this._setupIndicatorObserver();
    const activeAfter = document.activeElement;
    const focusLost = !activeAfter || activeAfter === document.body || !((_c = this._element) == null ? void 0 : _c.contains(activeAfter));
    if (focusedTabId && focusLost) {
      const focusEntry = this._tabs.find((t) => t.item.id === focusedTabId);
      if (focusEntry) {
        focusEntry.el.focus({ preventScroll: true });
      } else if (this._options.selectedId) {
        const selEntry = this._tabs.find(
          (t) => t.item.id === this._options.selectedId
        );
        selEntry == null ? void 0 : selEntry.el.focus({ preventScroll: true });
      }
    }
  }
  /**
   * Decide whether an existing TabEntry can be patched in place to match
   * the new tab data, or whether its affordances have changed
   * structurally (close button appearing on unpin, hidden context menu
   * appearing because default actions changed, etc.) in which case we
   * fall back to a full destroy + recreate of that single entry.
   *
   * We intentionally KEEP the entry across pin toggles even though
   * `is-pinned` and the close-button slot may change -- those are
   * handled by `_patchTabEntry` so the pin ToggleButton instance (and
   * therefore the focus + animation state) is preserved.
   */
  _canPatchEntry(entry, next) {
    const isHorizontal = this._options.orientation === "horizontal";
    if (!isHorizontal) return true;
    const prev = entry.item;
    const prevHasVisibleMenu = Array.isArray(prev.menuItems) && prev.menuItems.length > 0;
    const nextHasVisibleMenu = Array.isArray(next.menuItems) && next.menuItems.length > 0;
    if (prevHasVisibleMenu !== nextHasVisibleMenu) return false;
    return true;
  }
  /**
   * Patch the surviving entry to match the new tab data without
   * destroying the DOM node or its inner Arvo instances. Handles:
   *   - `is-pinned` / `is-disabled` class toggles
   *   - ToggleButton pin selected state (drives the icon swap)
   *   - close button add / remove on (un)pin transition
   *   - per-tab menu items refresh (Pin <-> Unpin entry, etc.)
   *   - inline slot data (icon / label / badge / status / alert)
   *   - aria-label recomposition
   */
  _patchTabEntry(entry, next) {
    var _a, _b, _c;
    const stripDisabled = this._options.isDisabled;
    const isHorizontal = this._options.orientation === "horizontal";
    const isTabDisabled = next.isDisabled || stripDisabled;
    entry.el.classList.toggle("is-pinned", !!next.pinned);
    entry.el.classList.toggle("is-disabled", isTabDisabled);
    if (isTabDisabled) entry.el.setAttribute("aria-disabled", "true");
    else entry.el.removeAttribute("aria-disabled");
    if (entry.pinBtn) {
      entry.pinBtn.selected(!!next.pinned);
      entry.pinBtn.disabled(isTabDisabled);
      const nextTip = next.pinned ? "Unpin tab" : "Pin tab";
      (_b = (_a = entry.pinBtn).setTooltip) == null ? void 0 : _b.call(_a, nextTip);
    }
    const tabClosable = isHorizontal && !next.pinned && (next.isClosable ?? this._options.isClosable);
    const hasClose = !!entry.closeBtn;
    if (tabClosable && !hasClose) {
      this._mountCloseButton(entry, next);
    } else if (!tabClosable && hasClose) {
      this._unmountCloseButton(entry);
    } else if (entry.closeBtn) {
      entry.closeBtn.disabled(isTabDisabled);
    }
    const flags = {
      isPinnable: this._options.isPinnable,
      isClosable: this._options.isClosable,
      isReorderable: this._options.isReorderable,
      isHorizontal
    };
    const composed = composeTabMenu(next, flags, this._options.isClosable);
    const composedFlat = flattenMenuPayload(composed);
    const composedIsGrouped = payloadIsGrouped(composed);
    if (entry.menuBtn) {
      entry.menuBtn.updateItems(
        composedIsGrouped ? composed : composedFlat
      );
      entry.menuBtn.disabled(isTabDisabled);
    }
    if (entry.hiddenMenu) {
      entry.hiddenMenu.updateItems(
        composedIsGrouped ? composed : composedFlat
      );
      entry.hiddenMenu.disabled(isTabDisabled || this._options.isLoading);
    }
    if (next.label !== entry.item.label) {
      entry.lblTextEl.textContent = next.label;
      entry.lblEl.setAttribute("data-label", next.label);
      (_c = entry.truncationHandle) == null ? void 0 : _c.update(next.label);
    }
    if (next.tooltip !== entry.item.tooltip) {
      if (next.tooltip) entry.el.title = next.tooltip;
      else entry.el.removeAttribute("title");
    }
    if (entry.icoEl && next.icon) {
      if (next.icon !== entry.item.icon) {
        if (entry.item.icon) {
          entry.icoEl.classList.remove(`o9con-${entry.item.icon}`);
        }
        entry.icoEl.classList.add(`o9con-${next.icon}`);
      }
    }
    const isSelected = next.id === this._options.selectedId;
    entry.el.setAttribute("aria-label", composeAriaLabel(next, isSelected));
    entry.item = next;
  }
  /**
   * Mount a fresh close button into an existing entry's actions cluster.
   * Used by `_patchTabEntry` when a tab transitions from pinned to
   * unpinned (the close button slot reappears).
   */
  _mountCloseButton(entry, tab) {
    if (entry.closeBtn) return;
    if (!entry.actionsEl) {
      entry.actionsEl = document.createElement("span");
      entry.actionsEl.className = "arvo-tabs__tab-actions";
      entry.el.appendChild(entry.actionsEl);
    }
    const closeWrapEl = document.createElement("span");
    closeWrapEl.className = "arvo-tabs__tab-close";
    const closeBtnEl = document.createElement("button");
    closeBtnEl.tabIndex = -1;
    closeWrapEl.appendChild(closeBtnEl);
    const isTabDisabled = !!tab.isDisabled || this._options.isDisabled;
    entry.closeBtn = IconButton.ArvoIconButton.initialize(closeBtnEl, {
      icon: "close",
      variant: "tertiary",
      size: "sm",
      tooltip: "Close tab",
      isDisabled: isTabDisabled,
      isLoading: this._options.isLoading,
      status: tab.closeActionStatus ?? null,
      onClick: (e) => {
        e.stopPropagation();
        if (tab.isDisabled || this._options.isDisabled || this._options.isLoading) {
          return;
        }
        this._closeTab(tab.id);
      }
    });
    entry.actionsEl.appendChild(closeWrapEl);
  }
  /**
   * Destroy and detach the close button from an existing entry. Used by
   * `_patchTabEntry` when a tab transitions from unpinned to pinned.
   */
  _unmountCloseButton(entry) {
    var _a;
    if (!entry.closeBtn) return;
    const wrap = (_a = entry.actionsEl) == null ? void 0 : _a.querySelector(".arvo-tabs__tab-close");
    entry.closeBtn.destroy();
    entry.closeBtn = null;
    wrap == null ? void 0 : wrap.remove();
  }
  // -- Overflow detection (shared @arvo/core utility) ---------------------
  _setupOverflowDetection() {
    var _a, _b;
    if (!this._options.hasOverflow || this._options.orientation !== "horizontal") return;
    if (!this._listEl) return;
    (_a = this._overflowMgr) == null ? void 0 : _a.destroy();
    this._overflowMgr = core.createOverflowManager({
      container: this._listEl,
      boundary: ((_b = this._element) == null ? void 0 : _b.parentElement) ?? this._listEl,
      getItems: () => {
        const out = [];
        for (const entry of this._tabs) {
          out.push({ id: entry.item.id, el: entry.el });
        }
        return out;
      },
      getTriggerWidth: () => {
        var _a2, _b2;
        return ((_a2 = this._rightClusterEl) == null ? void 0 : _a2.offsetWidth) ?? ((_b2 = this._overflowBtnEl) == null ? void 0 : _b2.offsetWidth) ?? 0;
      },
      isPinned: (id) => {
        const tab = this._options.tabs.find((t) => t.id === id);
        return !!(tab == null ? void 0 : tab.pinned);
      },
      getPromotedId: () => this._options.selectedId ?? null,
      onChange: (hidden) => {
        var _a2;
        this._hiddenTabIds = hidden;
        const overflowActive = hidden.size > 0;
        (_a2 = this._element) == null ? void 0 : _a2.classList.toggle("has-overflow", overflowActive);
        if (this._overflowWrapperEl) {
          this._overflowWrapperEl.style.display = overflowActive ? "" : "none";
        }
        this._updateOverflowMenu();
        if (this._options.hasAddButton && this._addBtnWrapperEl) {
          this._mountAddButton(overflowActive);
        }
        this._updateIndicator();
      }
    });
  }
  _checkOverflow() {
    var _a;
    (_a = this._overflowMgr) == null ? void 0 : _a.refresh();
  }
  // -- Drag-and-drop reorder (shared @arvo/core sortable, axis: 'x') -------
  _setupSortable() {
    this._teardownSortable();
    if (!this._listEl) return;
    if (!this._options.isReorderable || this._options.orientation !== "horizontal" || this._options.isDisabled || this._options.isLoading) {
      return;
    }
    this._sortable = core.createSortableList(this._listEl, {
      itemSelector: ".arvo-tabs__tab",
      handleSelector: null,
      axis: "x",
      // A click on a tab MUST NOT start a drag -- the pointer has to
      // travel at least 4px along the strip's axis first.
      dragThreshold: 4,
      // Looser displacement -- siblings shift aside as soon as the
      // source has overlapped ~25% of a neighbor.
      overlapThreshold: 0.25,
      // Cross-axis lock to the strip: vertical page scroll during a
      // horizontal drag no longer drifts the clone off the strip.
      lockCrossAxisToContainer: true,
      getGroupOf: (el) => {
        const id = el.getAttribute("data-tab-id");
        const tab = id ? this._options.tabs.find((t) => t.id === id) : null;
        return (tab == null ? void 0 : tab.pinned) ? "pinned" : "unpinned";
      },
      allowCrossGroup: false,
      // Clamp the lifted clone to the source's group bounds so an
      // unpinned tab can never visually overlap the pinned region nor
      // the right-edge cluster (overflow / add-button), and a pinned
      // tab can never cross into the unpinned region.
      getDragBounds: (el) => {
        const id = el.getAttribute("data-tab-id");
        if (!id || !this._listEl) return null;
        const tab = this._options.tabs.find((t) => t.id === id);
        const group = (tab == null ? void 0 : tab.pinned) ? "pinned" : "unpinned";
        const groupEls = [];
        for (const entry of this._tabs) {
          const entryGroup = entry.item.pinned ? "pinned" : "unpinned";
          if (entryGroup === group) groupEls.push(entry.el);
        }
        if (groupEls.length === 0) return null;
        const first = groupEls[0].getBoundingClientRect();
        const last = groupEls[groupEls.length - 1].getBoundingClientRect();
        return { min: first.left, max: last.right };
      },
      onCommit: (from, to) => {
        var _a, _b;
        const display = this._displayOrder;
        if (from < 0 || from >= display.length || to < 0 || to >= display.length || from === to) {
          return;
        }
        const moved = display[from];
        const target = display[to];
        if (!moved || !target) return;
        const next = this._options.tabs.filter((t) => t.id !== moved.id);
        const targetIdx = next.findIndex((t) => t.id === target.id);
        if (targetIdx < 0) {
          next.push(moved);
        } else {
          const insertIdx = to > from ? targetIdx + 1 : targetIdx;
          next.splice(insertIdx, 0, moved);
        }
        this._options.tabs = next;
        this._dispatchEvent("tabs:reorder", { tabs: next });
        (_b = (_a = this._options).onTabReorder) == null ? void 0 : _b.call(_a, next);
        this._rebuildDisplay();
      }
    });
  }
  _teardownSortable() {
    var _a;
    (_a = this._sortable) == null ? void 0 : _a.destroy();
    this._sortable = null;
  }
  // -- Animated active-tab indicator --------------------------------------
  _setupIndicatorObserver() {
    var _a;
    (_a = this._indicatorResizeObserver) == null ? void 0 : _a.disconnect();
    if (typeof ResizeObserver === "undefined") return;
    if (!this._listEl) return;
    this._indicatorResizeObserver = new ResizeObserver(() => {
      this._updateIndicator();
    });
    this._indicatorResizeObserver.observe(this._listEl);
    const activeEntry = this._tabs.find(
      (entry) => entry.item.id === this._options.selectedId
    );
    if (activeEntry) {
      this._indicatorResizeObserver.observe(activeEntry.el);
    }
  }
  _updateIndicator() {
    const indicator = this._indicatorEl;
    const list = this._listEl;
    if (!indicator || !list) return;
    const activeEntry = this._tabs.find(
      (entry) => entry.item.id === this._options.selectedId
    );
    const activeDisabled = !!(activeEntry == null ? void 0 : activeEntry.item.isDisabled) || this._options.isDisabled || this._options.isLoading;
    const activeHidden = activeEntry ? this._hiddenTabIds.has(activeEntry.item.id) : false;
    const show = !!activeEntry && !activeDisabled && !activeHidden;
    if (!show || !activeEntry) {
      indicator.dataset.indicatorState = "hidden";
      return;
    }
    const tabRect = activeEntry.el.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    const isHorizontal = this._options.orientation === "horizontal";
    if (isHorizontal) {
      const x = tabRect.left - listRect.left + list.scrollLeft;
      const w = tabRect.width;
      list.style.setProperty("--arvo-tabs-indicator-x", `${x}px`);
      list.style.setProperty("--arvo-tabs-indicator-w", `${w}px`);
    } else {
      const y = tabRect.top - listRect.top + list.scrollTop;
      const h = tabRect.height;
      list.style.setProperty("--arvo-tabs-indicator-y", `${y}px`);
      list.style.setProperty("--arvo-tabs-indicator-h", `${h}px`);
    }
    if (indicator.dataset.indicatorState !== "visible") {
      const previousTransition = indicator.style.transition;
      indicator.style.transition = "none";
      void indicator.offsetWidth;
      indicator.dataset.indicatorState = "visible";
      indicator.style.transition = previousTransition;
    }
  }
  _updateOverflowMenu() {
    if (!this._overflowMenuInstance) return;
    const items = this._displayOrder.filter((t) => this._hiddenTabIds.has(t.id)).map((tab) => {
      const tabId = tab.id;
      const actions = [];
      if (this._options.isPinnable) {
        actions.push({
          id: `pin-${tabId}`,
          icon: tab.pinned ? "push-pinned" : "push-pin",
          ariaLabel: tab.pinned ? "Unpin tab" : "Pin tab",
          isDisabled: tab.isDisabled || this._options.isDisabled,
          // Route through the shared helper so the side-effects
          // (model update + diff rebuild + event dispatch) stay in
          // lockstep with the inline pin ToggleButton and Ctrl+P.
          onClick: () => {
            this._togglePin(tabId);
            return false;
          }
        });
      }
      if (!tab.pinned && (tab.isClosable ?? this._options.isClosable)) {
        actions.push({
          id: `close-${tabId}`,
          icon: "close",
          ariaLabel: "Close tab",
          isDisabled: tab.isDisabled || this._options.isDisabled,
          // Route through the shared close helper so the tab is
          // actually removed from the model rather than just
          // dispatching the event.
          onClick: () => {
            this._closeTab(tabId);
            return false;
          }
        });
      }
      return {
        id: tabId,
        label: tab.label,
        icon: tab.icon,
        isDisabled: tab.isDisabled,
        active: tabId === this._options.selectedId,
        actions: actions.length > 0 ? actions : void 0
      };
    });
    this._overflowMenuInstance.updateItems(items);
    if (items.length === 0) {
      this._overflowMenuInstance.close();
    }
  }
  // -- Events --------------------------------------------------------------
  _bindEvents() {
    var _a, _b, _c;
    (_a = this._listEl) == null ? void 0 : _a.addEventListener("keydown", this._boundHandleKeyDown);
    (_b = this._listEl) == null ? void 0 : _b.addEventListener("click", this._boundHandleClick);
    (_c = this._listEl) == null ? void 0 : _c.addEventListener("contextmenu", this._boundHandleContextMenu);
  }
  _handleClick(e) {
    var _a, _b, _c;
    if (this._options.isDisabled || this._options.isLoading) return;
    const target = e.target.closest(".arvo-tabs__tab");
    if (!target) return;
    const tabId = target.getAttribute("data-tab-id");
    if (!tabId) return;
    const entry = this._tabs.find((t) => t.item.id === tabId);
    if (!entry || entry.item.isDisabled) return;
    if (tabId === this._options.selectedId) return;
    const idx = this._options.tabs.findIndex((t) => t.id === tabId);
    this._options.selectedId = tabId;
    this._syncSelection();
    (_a = this._overflowMgr) == null ? void 0 : _a.refresh();
    this._dispatchEvent("tabs:select", { id: tabId, index: idx });
    (_c = (_b = this._options).onSelect) == null ? void 0 : _c.call(_b, { id: tabId, index: idx });
  }
  _handleKeyDown(e) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (this._options.isDisabled || this._options.isLoading) return;
    const isHorizontal = this._options.orientation === "horizontal";
    const enabled = this._tabs.filter(
      (t) => !t.item.isDisabled && !this._hiddenTabIds.has(t.item.id)
    );
    if (enabled.length === 0) return;
    const activeEl = document.activeElement;
    const currentId = ((_a = activeEl == null ? void 0 : activeEl.closest(".arvo-tabs__tab")) == null ? void 0 : _a.getAttribute("data-tab-id")) ?? null;
    const currentIdx = enabled.findIndex((t) => t.item.id === currentId);
    if (currentIdx < 0) return;
    const currentTab = enabled[currentIdx].item;
    if (e.key === "F10" && e.shiftKey) {
      e.preventDefault();
      this._openTabContextMenu(currentTab.id);
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "\\" || e.code === "Backslash")) {
      e.preventDefault();
      this._openTabContextMenu(currentTab.id);
      return;
    }
    if (core.isModKey(e) && !e.shiftKey && !e.altKey && (e.key === "p" || e.key === "P")) {
      if (this._options.isPinnable && isHorizontal && !currentTab.isDisabled) {
        e.preventDefault();
        this._togglePin(currentTab);
      }
      return;
    }
    if (core.isModKey(e) && (e.key === "Home" || e.key === "End")) {
      if (this._options.isReorderable && isHorizontal && !currentTab.isDisabled) {
        e.preventDefault();
        this._moveTabBy(currentTab, e.key === "Home" ? "start" : "end");
      }
      return;
    }
    let nextIdx = null;
    switch (e.key) {
      case "ArrowRight":
        if (!isHorizontal) return;
        e.preventDefault();
        nextIdx = (currentIdx + 1) % enabled.length;
        break;
      case "ArrowLeft":
        if (!isHorizontal) return;
        e.preventDefault();
        nextIdx = (currentIdx - 1 + enabled.length) % enabled.length;
        break;
      case "ArrowDown":
        if (isHorizontal) return;
        e.preventDefault();
        nextIdx = (currentIdx + 1) % enabled.length;
        break;
      case "ArrowUp":
        if (isHorizontal) return;
        e.preventDefault();
        nextIdx = (currentIdx - 1 + enabled.length) % enabled.length;
        break;
      case "Home":
        e.preventDefault();
        nextIdx = 0;
        break;
      case "End":
        e.preventDefault();
        nextIdx = enabled.length - 1;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (currentTab.id !== this._options.selectedId) {
          const id = currentTab.id;
          const tabsIdx = this._options.tabs.findIndex((t) => t.id === id);
          this._options.selectedId = id;
          this._syncSelection();
          (_b = this._overflowMgr) == null ? void 0 : _b.refresh();
          this._dispatchEvent("tabs:select", { id, index: tabsIdx });
          (_d = (_c = this._options).onSelect) == null ? void 0 : _d.call(_c, { id, index: tabsIdx });
        }
        return;
      case "Delete":
      case "Backspace": {
        if (currentTab.pinned) return;
        const tabClosable = currentTab.isClosable ?? this._options.isClosable;
        if (tabClosable) {
          e.preventDefault();
          this._closeTab(currentTab.id);
        }
        return;
      }
      default:
        return;
    }
    if (nextIdx !== null) {
      if (this._options.activationMode === "automatic") {
        const target = enabled[nextIdx];
        const tabsIdx = this._options.tabs.findIndex(
          (t) => t.id === target.item.id
        );
        this._options.selectedId = target.item.id;
        this._syncSelection();
        (_e = this._overflowMgr) == null ? void 0 : _e.refresh();
        this._dispatchEvent("tabs:select", { id: target.item.id, index: tabsIdx });
        (_g = (_f = this._options).onSelect) == null ? void 0 : _g.call(_f, { id: target.item.id, index: tabsIdx });
      }
      enabled[nextIdx].el.focus();
    }
  }
  /**
   * Right-click on a tab opens the SAME per-tab action menu as the
   * visible ellipsis dropdown / Shift+F10. We only call
   * `preventDefault()` when the tab has at least one composed action
   * so we don't suppress the native browser menu where it would be
   * useful (no actions = no replacement to show).
   */
  _handleContextMenu(e) {
    var _a;
    if (this._options.isDisabled || this._options.isLoading) return;
    const target = (_a = e.target) == null ? void 0 : _a.closest(
      ".arvo-tabs__tab"
    );
    if (!target) return;
    const tabId = target.getAttribute("data-tab-id");
    if (!tabId) return;
    const entry = this._tabs.find((t) => t.item.id === tabId);
    if (!entry) return;
    if (entry.item.isDisabled) return;
    if (!entry.menuBtnEl && !entry.hiddenMenu) return;
    e.preventDefault();
    this._openTabContextMenu(tabId);
  }
  _syncSelection() {
    for (const entry of this._tabs) {
      const isSelected = entry.item.id === this._options.selectedId;
      entry.el.classList.toggle("active", isSelected);
      entry.el.setAttribute("aria-selected", String(isSelected));
      entry.el.tabIndex = isSelected ? 0 : -1;
      entry.el.setAttribute(
        "aria-label",
        composeAriaLabel(entry.item, isSelected)
      );
    }
    this._updateIndicator();
  }
  _dispatchEvent(name, detail) {
    var _a;
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(name, { bubbles: true, cancelable: true, detail })
    );
  }
  // -- Public API ---------------------------------------------------------
  select(id) {
    var _a, _b, _c;
    const entry = this._tabs.find((t) => t.item.id === id);
    if (!entry || entry.item.isDisabled) return;
    if (id === this._options.selectedId) return;
    const idx = this._options.tabs.findIndex((t) => t.id === id);
    this._options.selectedId = id;
    this._syncSelection();
    (_a = this._overflowMgr) == null ? void 0 : _a.refresh();
    this._dispatchEvent("tabs:select", { id, index: idx });
    (_c = (_b = this._options).onSelect) == null ? void 0 : _c.call(_b, { id, index: idx });
  }
  selectedId() {
    return this._options.selectedId;
  }
  addTab(tab, index) {
    const insertIdx = index !== void 0 ? Math.min(index, this._options.tabs.length) : this._options.tabs.length;
    this._options.tabs.splice(insertIdx, 0, tab);
    this._rebuildDisplay();
    this._refreshAddButtonState();
  }
  removeTab(id) {
    var _a, _b, _c;
    const tabIdx = this._options.tabs.findIndex((t) => t.id === id);
    if (tabIdx < 0) return;
    const wasSelected = id === this._options.selectedId;
    const activeEl = document.activeElement;
    const focusedTabId = ((_a = activeEl == null ? void 0 : activeEl.closest(".arvo-tabs__tab")) == null ? void 0 : _a.getAttribute("data-tab-id")) ?? null;
    const focusWasOnClosedTab = focusedTabId === id;
    const entry = this._tabs.find((t) => t.item.id === id);
    if (entry) {
      this._destroyTabEntry(entry);
      this._tabs = this._tabs.filter((t) => t.item.id !== id);
    }
    this._options.tabs.splice(tabIdx, 1);
    let autoSelectedId = null;
    if (wasSelected) {
      const enabledTabs = this._options.tabs.filter((t) => !t.isDisabled);
      if (enabledTabs.length === 0) {
        this._options.selectedId = null;
      } else {
        let nextTab;
        if (this._options.closeBehavior === "select-next") {
          nextTab = enabledTabs.find((t) => this._options.tabs.indexOf(t) >= tabIdx);
          if (!nextTab) nextTab = enabledTabs[enabledTabs.length - 1];
        } else {
          const before = enabledTabs.filter((t) => this._options.tabs.indexOf(t) < tabIdx);
          nextTab = before.length > 0 ? before[before.length - 1] : enabledTabs[0];
        }
        if (nextTab) {
          this._options.selectedId = nextTab.id;
          autoSelectedId = nextTab.id;
        }
      }
    }
    this._rebuildDisplay();
    this._refreshAddButtonState();
    if (autoSelectedId !== null) {
      const newIdx = this._options.tabs.findIndex((t) => t.id === autoSelectedId);
      this._dispatchEvent("tabs:select", { id: autoSelectedId, index: newIdx });
      (_c = (_b = this._options).onSelect) == null ? void 0 : _c.call(_b, { id: autoSelectedId, index: newIdx });
    }
    if (wasSelected && this._options.selectedId) {
      const focusEntry = this._tabs.find(
        (t) => t.item.id === this._options.selectedId
      );
      focusEntry == null ? void 0 : focusEntry.el.focus({ preventScroll: true });
    } else if (focusWasOnClosedTab) {
      const enabledEntries = this._tabs.filter(
        (e) => !e.item.isDisabled && !this._hiddenTabIds.has(e.item.id)
      );
      if (enabledEntries.length > 0) {
        let target;
        if (this._options.closeBehavior === "select-next") {
          target = enabledEntries.find(
            (e) => this._options.tabs.indexOf(e.item) >= tabIdx
          ) ?? enabledEntries[enabledEntries.length - 1];
        } else {
          const before = enabledEntries.filter(
            (e) => this._options.tabs.indexOf(e.item) < tabIdx
          );
          target = before.length > 0 ? before[before.length - 1] : enabledEntries[0];
        }
        target == null ? void 0 : target.el.focus({ preventScroll: true });
      }
    }
  }
  disabled(state) {
    var _a, _b, _c, _d, _e, _f;
    if (state === void 0) return this._options.isDisabled;
    if (!this._element) return;
    this._options.isDisabled = state;
    this._element.classList.toggle("is-disabled", state);
    for (const entry of this._tabs) {
      if (state) {
        entry.el.classList.add("is-disabled");
        entry.el.setAttribute("aria-disabled", "true");
      } else if (!entry.item.isDisabled) {
        entry.el.classList.remove("is-disabled");
        entry.el.removeAttribute("aria-disabled");
      }
      const tabDisabled = state || !!entry.item.isDisabled;
      (_a = entry.menuBtn) == null ? void 0 : _a.disabled(tabDisabled);
      (_b = entry.pinBtn) == null ? void 0 : _b.disabled(tabDisabled);
      (_c = entry.closeBtn) == null ? void 0 : _c.disabled(tabDisabled);
      (_d = entry.hiddenMenu) == null ? void 0 : _d.disabled(tabDisabled);
    }
    (_e = this._overflowTriggerInstance) == null ? void 0 : _e.disabled(state);
    (_f = this._overflowMenuInstance) == null ? void 0 : _f.disabled(state);
    this._refreshAddButtonState();
    this._updateIndicator();
    this._teardownSortable();
    this._setupSortable();
  }
  setLoading(isLoading) {
    var _a, _b, _c, _d, _e, _f;
    if (!this._element) return;
    this._options.isLoading = isLoading;
    this._element.classList.toggle("loading", isLoading);
    if (isLoading) {
      this._element.setAttribute("aria-busy", "true");
    } else {
      this._element.removeAttribute("aria-busy");
    }
    for (const entry of this._tabs) {
      (_a = entry.menuBtn) == null ? void 0 : _a.setLoading(isLoading);
      (_b = entry.pinBtn) == null ? void 0 : _b.setLoading(isLoading);
      (_c = entry.closeBtn) == null ? void 0 : _c.setLoading(isLoading);
      (_d = entry.hiddenMenu) == null ? void 0 : _d.setLoading(isLoading);
      if (isLoading && !entry.skelEl) {
        entry.skelEl = document.createElement("span");
        entry.skelEl.className = "arvo-tabs__skel";
        entry.skelEl.setAttribute("aria-hidden", "true");
        entry.el.appendChild(entry.skelEl);
      } else if (!isLoading && entry.skelEl) {
        entry.skelEl.remove();
        entry.skelEl = null;
      }
    }
    (_e = this._overflowTriggerInstance) == null ? void 0 : _e.setLoading(isLoading);
    (_f = this._overflowMenuInstance) == null ? void 0 : _f.setLoading(isLoading);
    if (this._addBtnInstance) {
      this._addBtnInstance.setLoading(isLoading);
    }
    this._refreshAddButtonState();
    this._updateIndicator();
    this._teardownSortable();
    this._setupSortable();
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
    (_a = this._listEl) == null ? void 0 : _a.removeEventListener("keydown", this._boundHandleKeyDown);
    (_b = this._listEl) == null ? void 0 : _b.removeEventListener("click", this._boundHandleClick);
    (_c = this._listEl) == null ? void 0 : _c.removeEventListener(
      "contextmenu",
      this._boundHandleContextMenu
    );
    this._teardownSortable();
    (_d = this._indicatorResizeObserver) == null ? void 0 : _d.disconnect();
    this._indicatorResizeObserver = null;
    (_e = this._overflowMgr) == null ? void 0 : _e.destroy();
    this._overflowMgr = null;
    for (const entry of this._tabs) {
      (_f = entry.menuBtn) == null ? void 0 : _f.destroy();
      (_g = entry.pinBtn) == null ? void 0 : _g.destroy();
      (_h = entry.closeBtn) == null ? void 0 : _h.destroy();
      (_i = entry.hiddenMenu) == null ? void 0 : _i.destroy();
      (_j = entry.badgeInstance) == null ? void 0 : _j.destroy();
      (_k = entry.statusInstance) == null ? void 0 : _k.destroy();
      (_l = entry.alertInstance) == null ? void 0 : _l.destroy();
      (_m = entry.truncationHandle) == null ? void 0 : _m.destroy();
    }
    (_n = this._overflowMenuInstance) == null ? void 0 : _n.destroy();
    this._overflowMenuInstance = null;
    (_o = this._overflowTriggerInstance) == null ? void 0 : _o.destroy();
    this._overflowTriggerInstance = null;
    (_p = this._addBtnInstance) == null ? void 0 : _p.destroy();
    this._addBtnInstance = null;
    if (this._element) {
      this._element.textContent = "";
      this._element.removeAttribute("aria-busy");
      this._element.className = "";
    }
    this._tabs = [];
    this._element = null;
    this._listEl = null;
    this._indicatorEl = null;
    this._rightClusterEl = null;
    this._overflowWrapperEl = null;
    this._overflowBtnEl = null;
    this._addBtnWrapperEl = null;
    this._dividerEl = null;
  }
};
_ArvoTabstrip.VARIANTS = ["primary", "secondary"];
_ArvoTabstrip.SIZES = ["sm", "lg"];
_ArvoTabstrip.DEFAULTS = {
  variant: "primary",
  size: "lg",
  orientation: "horizontal",
  tabs: [],
  selectedId: null,
  activationMode: "automatic",
  isFullWidth: false,
  isClosable: false,
  isPinnable: false,
  isReorderable: false,
  // Off by default per the latest UX guidance -- consumers opt in
  // explicitly when the surrounding layout doesn't already supply a
  // visual seam between the tab row and its content panel.
  hasTabstripBorder: false,
  hasOverflow: true,
  hasAddButton: false,
  addButtonLabel: "Add New",
  isAddDisabled: false,
  maxTabs: void 0,
  closeBehavior: "select-nearest",
  isDisabled: false,
  isLoading: false,
  menuProps: null,
  overflowMenuProps: null,
  onSelect: null,
  onClose: null,
  onPin: null,
  onTabAdd: null,
  onTabReorder: null,
  onOverflowOpen: null
};
let ArvoTabstrip = _ArvoTabstrip;
exports.ArvoTabstrip = ArvoTabstrip;
//# sourceMappingURL=Tabstrip.cjs.map
