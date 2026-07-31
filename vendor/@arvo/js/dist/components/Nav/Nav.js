import { ArvoIconButton } from "../IconButton/IconButton.js";
import { ArvoToggleButton } from "../ToggleButton/ToggleButton.js";
import { ArvoDropdownIconButton } from "../DropdownIconButton/DropdownIconButton.js";
import { ArvoAvatar } from "../Avatar/Avatar.js";
import { ArvoStatus } from "../Status/Status.js";
import { ArvoBadge } from "../Badge/Badge.js";
const NAV_ITEM_MAX_INLINE_ACTIONS = 3;
function sortItems(items) {
  const pinned = [];
  const unpinned = [];
  for (const item of items) {
    if (item.isPinned) pinned.push(item);
    else unpinned.push(item);
  }
  return [...pinned, ...unpinned];
}
function getItemOrder(items) {
  return sortItems(items).map((i) => i.id);
}
function isBadgeSuppressed(isSelected, isDisabled) {
  return isDisabled;
}
function resolveBadgeAppearance(isSelected, isDisabled) {
  if (isSelected && !isDisabled) return "filled";
  return "primary";
}
const _ArvoNav = class _ArvoNav {
  constructor(element, options) {
    this._listEl = null;
    this._indicatorEl = null;
    this._highlightEl = null;
    this._hasMeasured = false;
    this._entries = [];
    this._displayOrder = [];
    this._resizeObserver = null;
    this._element = element;
    const size = (options == null ? void 0 : options.size) && _ArvoNav.SIZES.includes(options.size) ? options.size : _ArvoNav.DEFAULTS.size;
    const seededSelectedId = (options == null ? void 0 : options.selectedId) !== void 0 ? options.selectedId ?? null : (options == null ? void 0 : options.defaultSelectedId) !== void 0 ? options.defaultSelectedId ?? null : null;
    this._options = {
      ..._ArvoNav.DEFAULTS,
      ...options,
      size,
      items: (options == null ? void 0 : options.items) ? options.items.map((i) => ({ ...i })) : [],
      selectedId: seededSelectedId,
      menuProps: (options == null ? void 0 : options.menuProps) ?? null,
      onSelect: (options == null ? void 0 : options.onSelect) ?? null,
      onPinChange: (options == null ? void 0 : options.onPinChange) ?? null,
      onAction: (options == null ? void 0 : options.onAction) ?? null
    };
    this._boundHandleKeyDown = this._handleKeyDown.bind(this);
    this._render();
    this._bindEvents();
  }
  static initialize(element, options) {
    return new _ArvoNav(element, options);
  }
  // ===========================================================================
  // Rendering
  // ===========================================================================
  /**
   * Render or re-render the nav. The wrapper classes / aria attributes
   * are always re-applied (they're cheap and reflect the current state)
   * but the inner item list uses a diff-based path: surviving items
   * keep their existing DOM nodes and inner Arvo instances, and only
   * the AFFECTED row's pin ToggleButton flips its `.active` class. This
   * is what stops every pin icon from animating whenever ANY pin
   * toggles -- mirrors the same fix applied to ArvoTabstrip.
   *
   * Focus on a surviving item row is preserved across rebuilds. If the
   * focused row was removed (e.g. removeItem) focus moves to the new
   * tab-stop row instead of being lost to <body>.
   */
  _render() {
    var _a;
    const el = this._element;
    if (!el) return;
    const activeBefore = document.activeElement;
    const focusedItemId = ((_a = activeBefore == null ? void 0 : activeBefore.closest(".arvo-nav-item")) == null ? void 0 : _a.getAttribute("data-nav-item-id")) ?? null;
    el.classList.remove("arvo-nav--sm", "arvo-nav--md", "arvo-nav--lg");
    el.classList.add("arvo-nav", `arvo-nav--${this._options.size}`);
    if (this._options.isCompact) {
      el.classList.add("arvo-nav--compact");
    } else {
      el.classList.remove("arvo-nav--compact");
    }
    if (this._options.actionsVisibility === "always") {
      el.classList.add("arvo-nav--actions-always");
    } else {
      el.classList.remove("arvo-nav--actions-always");
    }
    if (this._options.isDisabled) el.classList.add("is-disabled");
    else el.classList.remove("is-disabled");
    if (this._options.isLoading) {
      el.classList.add("loading");
      el.setAttribute("aria-busy", "true");
    } else {
      el.classList.remove("loading");
      el.removeAttribute("aria-busy");
    }
    el.setAttribute("aria-label", this._options.ariaLabel);
    if (!this._listEl) {
      this._listEl = document.createElement("ul");
      this._listEl.className = "arvo-nav__list";
      this._listEl.setAttribute("role", "list");
      el.appendChild(this._listEl);
      this._highlightEl = document.createElement("span");
      this._highlightEl.className = "arvo-nav__highlight";
      this._highlightEl.setAttribute("aria-hidden", "true");
      this._listEl.appendChild(this._highlightEl);
      this._indicatorEl = document.createElement("span");
      this._indicatorEl.className = "arvo-nav__indicator";
      this._indicatorEl.setAttribute("aria-hidden", "true");
      this._listEl.appendChild(this._indicatorEl);
      el.classList.add("arvo-nav--init");
      if (typeof ResizeObserver !== "undefined") {
        this._resizeObserver = new ResizeObserver(
          () => this._updateIndicator()
        );
        this._resizeObserver.observe(this._listEl);
      }
    }
    this._displayOrder = sortItems(this._options.items);
    const tabStopId = this._resolveTabStopId();
    const previousEntries = /* @__PURE__ */ new Map();
    for (const entry of this._entries) {
      previousEntries.set(entry.data.id, entry);
    }
    const nextEntries = [];
    const usedIds = /* @__PURE__ */ new Set();
    for (const item of this._displayOrder) {
      const existing = previousEntries.get(item.id);
      const isTabStop = item.id === tabStopId;
      if (existing) {
        this._patchItemEntry(existing, item, isTabStop);
        nextEntries.push(existing);
        usedIds.add(item.id);
      } else {
        const entry = this._createItemEntry(item, isTabStop);
        nextEntries.push(entry);
      }
    }
    for (const [id, entry] of previousEntries) {
      if (!usedIds.has(id)) {
        this._destroyItemEntry(entry);
      }
    }
    this._entries = nextEntries;
    const listEl = this._listEl;
    const oldItems = listEl.querySelectorAll(":scope > li");
    oldItems.forEach((li) => li.remove());
    if (this._highlightEl && this._highlightEl.parentNode !== listEl) {
      listEl.appendChild(this._highlightEl);
    }
    if (this._indicatorEl && this._indicatorEl.parentNode !== listEl) {
      listEl.appendChild(this._indicatorEl);
    }
    for (const entry of this._entries) {
      const li = document.createElement("li");
      li.setAttribute("role", "listitem");
      li.style.display = "contents";
      li.appendChild(entry.rootEl);
      listEl.appendChild(li);
    }
    const activeAfter = document.activeElement;
    const focusLost = !activeAfter || activeAfter === document.body || !el.contains(activeAfter);
    if (focusedItemId && focusLost) {
      const focusEntry = this._entries.find((e) => e.data.id === focusedItemId);
      if (focusEntry) {
        focusEntry.rootEl.focus({ preventScroll: true });
      } else {
        const stop = tabStopId ? this._entries.find((e) => e.data.id === tabStopId) : void 0;
        stop == null ? void 0 : stop.rootEl.focus({ preventScroll: true });
      }
    }
    this._updateIndicator();
  }
  /**
   * Update the sliding active-row indicator + highlight. Writes the
   * active row's offsetTop / offsetHeight onto the list element as CSS
   * variables; the .scss rules use these to position and size the
   * absolute __indicator and __highlight elements. When no row is
   * selected the host gets the `--no-active` modifier (the elements
   * collapse to opacity 0).
   *
   * Called after every render and from a ResizeObserver on the list so
   * row geometry changes (font load, content reflow) keep the slider
   * aligned.
   */
  _updateIndicator() {
    const el = this._element;
    const list = this._listEl;
    if (!el || !list) return;
    const activeId = this._options.selectedId;
    const activeEntry = activeId ? this._entries.find((e) => e.data.id === activeId) : void 0;
    const activeRow = (activeEntry == null ? void 0 : activeEntry.rootEl) ?? null;
    if (activeRow) {
      list.style.setProperty(
        "--arvo-nav-active-top",
        `${activeRow.offsetTop}px`
      );
      list.style.setProperty(
        "--arvo-nav-active-h",
        `${activeRow.offsetHeight}px`
      );
      el.classList.remove("arvo-nav--no-active");
    } else {
      list.style.setProperty("--arvo-nav-active-top", "0px");
      list.style.setProperty("--arvo-nav-active-h", "0px");
      el.classList.add("arvo-nav--no-active");
    }
    if (!this._hasMeasured) {
      this._hasMeasured = true;
      const reqFrame = typeof requestAnimationFrame === "function" ? requestAnimationFrame : (cb) => window.setTimeout(() => cb(0), 16);
      reqFrame(() => {
        if (!this._element) return;
        this._element.classList.remove("arvo-nav--init");
      });
    }
  }
  /**
   * Patch a surviving entry to match the new item data without
   * destroying its DOM node or inner Arvo instances. Handles:
   *   - `active` / `is-disabled` / `is-pinned` / `is-loading` class flips
   *   - pin ToggleButton selected state + tooltip (no animation replay
   *     unless the pinned state actually changed)
   *   - aria-current / aria-pressed (anchor vs button polymorphism)
   *   - roving tabindex
   *   - label text + anchor href / target / rel
   *
   * For structural changes that can't be patched (e.g. an item gained
   * an avatar slot or transitioned between `actions` shapes) we fall
   * back to a fresh `_createItemEntry` so the entry stays consistent.
   * In practice the only field that flips dynamically across rebuilds
   * is `isPinned`, so the patch path covers the hot case.
   */
  _patchItemEntry(entry, next, isTabStop) {
    var _a, _b, _c;
    const isSelected = next.id === this._options.selectedId;
    const isDisabled = this._options.isDisabled || !!next.isDisabled;
    const isLoading = (this._options.isLoading || !!next.isLoading) === true;
    const rootEl = entry.rootEl;
    rootEl.className = [
      "arvo-nav-item",
      `arvo-nav-item--${this._options.size}`,
      this._options.isCompact ? "arvo-nav-item--compact" : "",
      isSelected ? "active" : "",
      isDisabled ? "is-disabled" : "",
      isLoading ? "is-loading" : "",
      next.isPinned ? "is-pinned" : ""
    ].filter(Boolean).join(" ");
    rootEl.tabIndex = isTabStop ? 0 : -1;
    if (isDisabled) rootEl.setAttribute("aria-disabled", "true");
    else rootEl.removeAttribute("aria-disabled");
    if (isLoading) rootEl.setAttribute("aria-busy", "true");
    else rootEl.removeAttribute("aria-busy");
    const accessibleNamePatch = next.tooltip ?? next.label;
    if (this._options.isCompact) {
      rootEl.setAttribute("aria-label", accessibleNamePatch);
      rootEl.title = accessibleNamePatch;
    } else if (next.tooltip) {
      rootEl.setAttribute("aria-label", accessibleNamePatch);
      rootEl.title = next.tooltip;
    } else {
      rootEl.removeAttribute("aria-label");
      rootEl.removeAttribute("title");
    }
    const isAnchor = !!next.href;
    if (isAnchor) {
      if (isSelected) rootEl.setAttribute("aria-current", "page");
      else rootEl.removeAttribute("aria-current");
      rootEl.removeAttribute("aria-pressed");
      if (!isDisabled && !isLoading) {
        rootEl.href = next.href;
      } else {
        rootEl.removeAttribute("href");
      }
    } else {
      if (isSelected) rootEl.setAttribute("aria-pressed", "true");
      else rootEl.removeAttribute("aria-pressed");
      rootEl.removeAttribute("aria-current");
      rootEl.disabled = isDisabled || isLoading;
    }
    if (entry.pinButton) {
      entry.pinButton.selected(!!next.isPinned);
      entry.pinButton.disabled(isDisabled || isLoading);
      (_b = (_a = entry.pinButton).setTooltip) == null ? void 0 : _b.call(_a, next.isPinned ? "Unpin" : "Pin");
    }
    const lblEl = (_c = entry.lftEl) == null ? void 0 : _c.querySelector(
      ".arvo-nav-item__lbl"
    );
    if (lblEl && next.label !== entry.data.label) {
      lblEl.textContent = next.label;
    }
    entry.data = next;
  }
  /**
   * Destroy a single item entry (inner Arvo instances + DOM node).
   * Mirrors `_destroyInstances` but scoped to one entry so diff-based
   * rebuilds can tear down only the items that actually went away.
   */
  _destroyItemEntry(entry) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    (_b = (_a = entry.avatarInstance) == null ? void 0 : _a.destroy) == null ? void 0 : _b.call(_a);
    (_d = (_c = entry.statusInstance) == null ? void 0 : _c.destroy) == null ? void 0 : _d.call(_c);
    (_f = (_e = entry.badgeInstance) == null ? void 0 : _e.destroy) == null ? void 0 : _f.call(_e);
    for (const btn of entry.inlineButtons) (_g = btn.destroy) == null ? void 0 : _g.call(btn);
    (_i = (_h = entry.pinButton) == null ? void 0 : _h.destroy) == null ? void 0 : _i.call(_h);
    (_k = (_j = entry.overflowButton) == null ? void 0 : _j.destroy) == null ? void 0 : _k.call(_j);
    entry.rootEl.remove();
  }
  _createItemEntry(item, isTabStop) {
    const isSelected = item.id === this._options.selectedId;
    const isDisabled = this._options.isDisabled || !!item.isDisabled;
    const isLoading = (this._options.isLoading || !!item.isLoading) === true;
    let rootEl;
    if (item.href) {
      const a = document.createElement("a");
      if (!isDisabled && !isLoading) a.href = item.href;
      if (item.target) a.target = item.target;
      if (item.rel) a.rel = item.rel;
      if (isSelected) a.setAttribute("aria-current", "page");
      rootEl = a;
    } else {
      const b = document.createElement("button");
      b.type = "button";
      if (isDisabled || isLoading) b.disabled = true;
      if (isSelected) b.setAttribute("aria-pressed", "true");
      rootEl = b;
    }
    rootEl.className = [
      "arvo-nav-item",
      `arvo-nav-item--${this._options.size}`,
      this._options.isCompact ? "arvo-nav-item--compact" : "",
      isSelected ? "active" : "",
      isDisabled ? "is-disabled" : "",
      isLoading ? "is-loading" : "",
      item.isPinned ? "is-pinned" : ""
    ].filter(Boolean).join(" ");
    rootEl.setAttribute("data-nav-item-id", item.id);
    rootEl.setAttribute("data-arvo-nav-item-id", item.id);
    rootEl.tabIndex = isTabStop ? 0 : -1;
    if (isDisabled) rootEl.setAttribute("aria-disabled", "true");
    if (isLoading) rootEl.setAttribute("aria-busy", "true");
    const accessibleName = item.tooltip ?? item.label;
    if (this._options.isCompact) {
      rootEl.title = accessibleName;
      rootEl.setAttribute("aria-label", accessibleName);
    } else if (item.tooltip) {
      rootEl.title = item.tooltip;
      if (!item.href) rootEl.setAttribute("aria-label", accessibleName);
      else rootEl.setAttribute("aria-label", accessibleName);
    }
    rootEl.addEventListener("click", (e) => this._handleClick(item, e));
    let lftEl = null;
    let actionsEl = null;
    let avatarInstance = null;
    let statusInstance = null;
    let badgeInstance = null;
    const inlineButtons = [];
    let pinButton = null;
    let overflowButton = null;
    let skelEl = null;
    if (!isLoading) {
      lftEl = document.createElement("span");
      lftEl.className = "arvo-nav-item__lft";
      if (item.icon) {
        const ico = document.createElement("span");
        ico.className = `arvo-nav-item__ico o9con o9con-${item.icon}`;
        ico.setAttribute("aria-hidden", "true");
        lftEl.appendChild(ico);
      }
      if (item.avatar) {
        const avtWrap = document.createElement("span");
        avtWrap.className = "arvo-nav-item__avt";
        const avtHost = document.createElement("span");
        avtWrap.appendChild(avtHost);
        avatarInstance = ArvoAvatar.initialize(avtHost, {
          ...item.avatarProps ?? {},
          size: "xs",
          variant: item.avatar.variant,
          name: item.avatar.name,
          src: item.avatar.src,
          icon: item.avatar.icon,
          colorMode: item.avatar.colorMode,
          semanticType: item.avatar.semanticType,
          customColor: item.avatar.customColor,
          tooltip: item.avatar.tooltip,
          alt: item.avatar.alt
        });
        lftEl.appendChild(avtWrap);
      }
      const lblEl = document.createElement("span");
      lblEl.className = "arvo-nav-item__lbl";
      lblEl.textContent = item.label;
      if (item.tooltip) lblEl.title = item.tooltip;
      lftEl.appendChild(lblEl);
      rootEl.appendChild(lftEl);
      const consumerActions = item.actions ?? [];
      const inlineActions = consumerActions.slice(
        0,
        NAV_ITEM_MAX_INLINE_ACTIONS
      );
      const promotedActions = consumerActions.slice(
        NAV_ITEM_MAX_INLINE_ACTIONS
      );
      const promotedAsMenuItems = promotedActions.map((a) => ({
        id: a.id,
        label: a.tooltip,
        icon: a.icon,
        isDisabled: a.isDisabled
      }));
      const overflowMenuItems = [
        ...item.menuItems ?? [],
        ...promotedAsMenuItems
      ];
      const hasOverflowMenu = overflowMenuItems.length > 0;
      const showPinToggle = this._options.hasPinning && item.isPinnable !== false && !item.isDisabled;
      const showActions = inlineActions.length > 0 || hasOverflowMenu || !!item.status || !!item.badge || showPinToggle;
      const showBadge = !!item.badge && !isBadgeSuppressed(isSelected, isDisabled);
      if (showActions) {
        actionsEl = document.createElement("span");
        actionsEl.className = "arvo-nav-item__actions";
        if (item.status) {
          const stsWrap = document.createElement("span");
          stsWrap.className = "arvo-nav-item__sts";
          const stsHost = document.createElement("span");
          stsWrap.appendChild(stsHost);
          statusInstance = ArvoStatus.initialize(stsHost, {
            ...item.statusProps ?? {},
            type: item.status.type,
            placement: "inline",
            size: "sm",
            tooltip: item.status.label
          });
          actionsEl.appendChild(stsWrap);
        }
        if (showPinToggle) {
          const pinWrap = document.createElement("span");
          pinWrap.className = "arvo-nav-item__pin";
          const pinBtnEl = document.createElement("button");
          pinBtnEl.type = "button";
          pinBtnEl.tabIndex = -1;
          pinWrap.appendChild(pinBtnEl);
          pinButton = ArvoToggleButton.initialize(pinBtnEl, {
            icon: "push-pin",
            selectedIcon: "push-pinned",
            variant: "tertiary",
            size: "sm",
            tooltip: item.isPinned ? "Unpin" : "Pin",
            isDisabled: isDisabled || isLoading,
            isLoading,
            isSelected: !!item.isPinned,
            // The toggle is a child of a polymorphic <a href> root when
            // the row is an anchor. Stop the click bubble so the row's
            // selection handler doesn't run, AND preventDefault so the
            // anchor's native navigation doesn't fire either.
            onClick: (e) => {
              e.stopPropagation();
              e.preventDefault();
            },
            onSelectedChange: () => {
              if (isDisabled || isLoading || item.isDisabled || item.isPinnable === false) {
                return;
              }
              this._togglePin(item.id);
            }
          });
          actionsEl.appendChild(pinWrap);
        }
        for (const action of inlineActions) {
          const actWrap = document.createElement("span");
          actWrap.className = "arvo-nav-item__act";
          const btnEl = document.createElement("button");
          btnEl.type = "button";
          btnEl.tabIndex = -1;
          actWrap.appendChild(btnEl);
          const inst = ArvoIconButton.initialize(btnEl, {
            icon: action.icon,
            variant: "tertiary",
            size: "sm",
            tooltip: action.tooltip,
            isDisabled: isDisabled || !!action.isDisabled,
            isLoading,
            onClick: (e) => {
              var _a, _b, _c;
              e.stopPropagation();
              e.preventDefault();
              if (isDisabled || isLoading || action.isDisabled) return;
              (_a = action.onClick) == null ? void 0 : _a.call(action, e);
              this._dispatchEvent("nav-item:action", {
                actionId: action.id,
                itemId: item.id
              });
              this._dispatchEvent("nav:action", {
                actionId: action.id,
                itemId: item.id
              });
              (_c = (_b = this._options).onAction) == null ? void 0 : _c.call(_b, {
                actionId: action.id,
                itemId: item.id,
                item
              });
            }
          });
          inlineButtons.push(inst);
          actionsEl.appendChild(actWrap);
        }
        if (hasOverflowMenu) {
          const overflowWrap = document.createElement("span");
          overflowWrap.className = "arvo-nav-item__overflow";
          const ddBtnEl = document.createElement("button");
          ddBtnEl.type = "button";
          ddBtnEl.tabIndex = -1;
          overflowWrap.appendChild(ddBtnEl);
          const promotedIds = new Set(promotedActions.map((a) => a.id));
          overflowButton = ArvoDropdownIconButton.initialize(ddBtnEl, {
            ...item.menuProps ?? this._options.menuProps ?? {},
            icon: "ellipsis-v",
            variant: "tertiary",
            size: "sm",
            isCompact: true,
            tooltip: "More actions",
            items: overflowMenuItems,
            isDisabled: isDisabled || isLoading,
            isLoading,
            closeOnSelect: true,
            // Stop bubbling to the row's selection handler AND prevent
            // the anchor's native navigation -- without preventDefault
            // a polymorphic <a href> row would navigate when the user
            // clicks the overflow trigger.
            onClick: (e) => {
              e.stopPropagation();
              e.preventDefault();
            },
            onSelect: (menuItem) => {
              var _a, _b, _c;
              if (menuItem.isDisabled) return;
              if (promotedIds.has(menuItem.id)) {
                const original = (item.actions ?? []).find(
                  (a) => a.id === menuItem.id
                );
                if (original && !original.isDisabled && !isDisabled && !isLoading) {
                  (_a = original.onClick) == null ? void 0 : _a.call(original);
                  this._dispatchEvent("nav-item:action", {
                    actionId: menuItem.id,
                    itemId: item.id
                  });
                  this._dispatchEvent("nav:action", {
                    actionId: menuItem.id,
                    itemId: item.id
                  });
                  (_c = (_b = this._options).onAction) == null ? void 0 : _c.call(_b, {
                    actionId: menuItem.id,
                    itemId: item.id,
                    item
                  });
                }
              }
              return void 0;
            }
          });
          actionsEl.appendChild(overflowWrap);
        }
        if (showBadge) {
          const bdgWrap = document.createElement("span");
          bdgWrap.className = "arvo-nav-item__bdg";
          const bdgHost = document.createElement("span");
          bdgWrap.appendChild(bdgHost);
          badgeInstance = ArvoBadge.initialize(bdgHost, {
            ...item.badgeProps ?? {},
            size: "sm",
            variant: "label",
            semanticType: item.badge.semanticType ?? "positive",
            appearance: resolveBadgeAppearance(isSelected, isDisabled),
            message: item.badge.message,
            // Nav badge slot is label-only by spec; never grow an icon
            // glyph even if a consumer tries via badgeProps.
            hasBadgeIcon: false
          });
          actionsEl.appendChild(bdgWrap);
        }
        rootEl.appendChild(actionsEl);
      }
    } else {
      skelEl = document.createElement("span");
      skelEl.className = "arvo-nav-item__skel";
      skelEl.setAttribute("aria-hidden", "true");
      rootEl.appendChild(skelEl);
    }
    return {
      data: item,
      rootEl,
      lftEl,
      actionsEl,
      avatarInstance,
      statusInstance,
      badgeInstance,
      inlineButtons,
      pinButton,
      overflowButton,
      skelEl
    };
  }
  /**
   * Toggle the pinned state of the given item. Updates the model, fires
   * `nav:pin-change` + `onPinChange`, and re-renders the list so pinned
   * items rise to the top. Shared by the inline pin ToggleButton and the
   * public `pin()` setter.
   */
  _togglePin(id) {
    var _a, _b;
    const item = this._options.items.find((i) => i.id === id);
    if (!item) return;
    const next = !item.isPinned;
    item.isPinned = next;
    const updated = this._options.items.map(
      (i) => i.id === id ? { ...i, isPinned: next } : i
    );
    this._options.items = updated;
    this._render();
    this._dispatchEvent("nav:pin-change", {
      id,
      pinned: next,
      itemOrder: getItemOrder(updated)
    });
    (_b = (_a = this._options).onPinChange) == null ? void 0 : _b.call(_a, {
      id,
      pinned: next,
      itemOrder: getItemOrder(updated)
    });
  }
  // ===========================================================================
  // Events
  // ===========================================================================
  _bindEvents() {
    var _a;
    (_a = this._element) == null ? void 0 : _a.addEventListener("keydown", this._boundHandleKeyDown);
  }
  _unbindEvents() {
    var _a;
    (_a = this._element) == null ? void 0 : _a.removeEventListener("keydown", this._boundHandleKeyDown);
  }
  _handleClick(item, e) {
    var _a, _b;
    if (this._options.isDisabled || this._options.isLoading) {
      e.preventDefault();
      return;
    }
    if (item.isDisabled || item.isLoading) {
      e.preventDefault();
      return;
    }
    if (item.id !== this._options.selectedId) {
      this._options.selectedId = item.id;
      const idx = this._options.items.findIndex((i) => i.id === item.id);
      this._syncSelection();
      this._dispatchEvent("nav:select", { id: item.id, index: idx });
      this._dispatchEvent("nav-item:select", { id: item.id });
      (_b = (_a = this._options).onSelect) == null ? void 0 : _b.call(_a, { id: item.id, item, index: idx });
    }
  }
  _handleKeyDown(e) {
    var _a, _b, _c, _d;
    if (this._options.isDisabled || this._options.isLoading) return;
    const enabled = this._displayOrder.filter(
      (i) => !(this._options.isDisabled || i.isDisabled)
    );
    if (enabled.length === 0) return;
    const target = document.activeElement;
    const activeId = (target == null ? void 0 : target.getAttribute("data-nav-item-id")) ?? null;
    const currentIdx = enabled.findIndex((i) => i.id === activeId);
    let nextIdx = null;
    let isAnchor = false;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        nextIdx = currentIdx < 0 ? 0 : (currentIdx + 1) % enabled.length;
        break;
      case "ArrowUp":
        e.preventDefault();
        nextIdx = currentIdx < 0 ? enabled.length - 1 : (currentIdx - 1 + enabled.length) % enabled.length;
        break;
      case "Home":
        e.preventDefault();
        nextIdx = 0;
        break;
      case "End":
        e.preventDefault();
        nextIdx = enabled.length - 1;
        break;
      case "Enter": {
        if (currentIdx < 0) return;
        const item = enabled[currentIdx];
        isAnchor = !!item.href;
        if (!isAnchor) e.preventDefault();
        if (item.id !== this._options.selectedId) {
          this._options.selectedId = item.id;
          const idx = this._options.items.findIndex((i) => i.id === item.id);
          this._syncSelection();
          this._dispatchEvent("nav:select", { id: item.id, index: idx });
          this._dispatchEvent("nav-item:select", { id: item.id });
          (_b = (_a = this._options).onSelect) == null ? void 0 : _b.call(_a, { id: item.id, item, index: idx });
        }
        return;
      }
      case " ":
      case "Spacebar": {
        if (currentIdx < 0) return;
        const item = enabled[currentIdx];
        if (item.href) return;
        e.preventDefault();
        if (item.id !== this._options.selectedId) {
          this._options.selectedId = item.id;
          const idx = this._options.items.findIndex((i) => i.id === item.id);
          this._syncSelection();
          this._dispatchEvent("nav:select", { id: item.id, index: idx });
          this._dispatchEvent("nav-item:select", { id: item.id });
          (_d = (_c = this._options).onSelect) == null ? void 0 : _d.call(_c, { id: item.id, item, index: idx });
        }
        return;
      }
      default:
        return;
    }
    if (nextIdx !== null) {
      const nextItem = enabled[nextIdx];
      const nextEntry = this._entries.find((en) => en.data.id === nextItem.id);
      nextEntry == null ? void 0 : nextEntry.rootEl.focus();
    }
  }
  _syncSelection() {
    for (const entry of this._entries) {
      const isSelected = entry.data.id === this._options.selectedId;
      entry.rootEl.classList.toggle("active", isSelected);
      const isAnchor = !!entry.data.href;
      if (isAnchor) {
        if (isSelected) entry.rootEl.setAttribute("aria-current", "page");
        else entry.rootEl.removeAttribute("aria-current");
      } else {
        if (isSelected) entry.rootEl.setAttribute("aria-pressed", "true");
        else entry.rootEl.removeAttribute("aria-pressed");
      }
      entry.rootEl.tabIndex = isSelected ? 0 : -1;
    }
    const tabStopId = this._resolveTabStopId();
    for (const entry of this._entries) {
      const isStop = entry.data.id === tabStopId;
      if (entry.data.id !== this._options.selectedId) {
        entry.rootEl.tabIndex = isStop ? 0 : -1;
      }
    }
    this._updateIndicator();
  }
  _resolveTabStopId() {
    if (this._options.selectedId) {
      const sel = this._options.items.find(
        (i) => i.id === this._options.selectedId && !i.isDisabled
      );
      if (sel) return sel.id;
    }
    const first = this._displayOrder.find((i) => !i.isDisabled);
    return (first == null ? void 0 : first.id) ?? null;
  }
  _dispatchEvent(name, detail) {
    if (!this._element) return;
    this._element.dispatchEvent(
      new CustomEvent(name, { detail, bubbles: true })
    );
  }
  selected(id) {
    if (arguments.length === 0) return this._options.selectedId;
    if (id === null) {
      this._options.selectedId = null;
    } else {
      const item = this._options.items.find((i) => i.id === id && !i.isDisabled);
      if (!item) return;
      this._options.selectedId = item.id;
    }
    this._syncSelection();
  }
  /** Activate an item by id. Fires nav:select and onSelect. */
  select(id) {
    var _a, _b;
    const item = this._options.items.find((i) => i.id === id && !i.isDisabled);
    if (!item) return;
    if (this._options.selectedId === id) return;
    this._options.selectedId = id;
    const idx = this._options.items.findIndex((i) => i.id === id);
    this._syncSelection();
    this._dispatchEvent("nav:select", { id, index: idx });
    this._dispatchEvent("nav-item:select", { id });
    (_b = (_a = this._options).onSelect) == null ? void 0 : _b.call(_a, { id, item, index: idx });
  }
  pin(id, state) {
    var _a, _b;
    const item = this._options.items.find((i) => i.id === id);
    if (!item) {
      if (state === void 0) return false;
      return;
    }
    if (state === void 0) return !!item.isPinned;
    if (!!item.isPinned === state) return;
    item.isPinned = state;
    const updated = this._options.items.map(
      (i) => i.id === id ? { ...i, isPinned: state } : i
    );
    this._options.items = updated;
    this._render();
    this._dispatchEvent("nav:pin-change", {
      id,
      pinned: state,
      itemOrder: getItemOrder(updated)
    });
    (_b = (_a = this._options).onPinChange) == null ? void 0 : _b.call(_a, {
      id,
      pinned: state,
      itemOrder: getItemOrder(updated)
    });
  }
  setItems(items) {
    const next = items.map((i) => ({ ...i }));
    this._options.items = next;
    if (this._options.selectedId && !next.some((i) => i.id === this._options.selectedId)) {
      this._options.selectedId = null;
    }
    this._render();
  }
  addItem(item, index) {
    const next = [...this._options.items];
    if (typeof index === "number") next.splice(index, 0, { ...item });
    else next.push({ ...item });
    this._options.items = next;
    this._render();
  }
  removeItem(id) {
    const next = this._options.items.filter((i) => i.id !== id);
    if (this._options.selectedId === id) this._options.selectedId = null;
    this._options.items = next;
    this._render();
  }
  disabled(state) {
    if (arguments.length === 0) return this._options.isDisabled;
    this._options.isDisabled = !!state;
    this._render();
  }
  setLoading(loading) {
    this._options.isLoading = loading === true;
    this._render();
  }
  destroy() {
    var _a;
    this._unbindEvents();
    this._destroyInstances();
    (_a = this._resizeObserver) == null ? void 0 : _a.disconnect();
    this._resizeObserver = null;
    if (this._element) {
      this._element.textContent = "";
      this._element.classList.remove(
        "arvo-nav",
        "arvo-nav--sm",
        "arvo-nav--md",
        "arvo-nav--lg",
        "arvo-nav--compact",
        "arvo-nav--actions-always",
        "arvo-nav--init",
        "arvo-nav--no-active",
        "is-disabled",
        "loading"
      );
      this._element.removeAttribute("aria-busy");
      this._element.removeAttribute("aria-label");
    }
    this._element = null;
    this._listEl = null;
    this._indicatorEl = null;
    this._highlightEl = null;
    this._entries = [];
    this._displayOrder = [];
    this._hasMeasured = false;
  }
  _destroyInstances() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    for (const entry of this._entries) {
      (_b = (_a = entry.avatarInstance) == null ? void 0 : _a.destroy) == null ? void 0 : _b.call(_a);
      (_d = (_c = entry.statusInstance) == null ? void 0 : _c.destroy) == null ? void 0 : _d.call(_c);
      (_f = (_e = entry.badgeInstance) == null ? void 0 : _e.destroy) == null ? void 0 : _f.call(_e);
      for (const btn of entry.inlineButtons) (_g = btn.destroy) == null ? void 0 : _g.call(btn);
      (_i = (_h = entry.pinButton) == null ? void 0 : _h.destroy) == null ? void 0 : _i.call(_h);
      (_k = (_j = entry.overflowButton) == null ? void 0 : _j.destroy) == null ? void 0 : _k.call(_j);
    }
  }
};
_ArvoNav.SIZES = ["sm", "md", "lg"];
_ArvoNav.DEFAULTS = {
  size: "md",
  isCompact: false,
  items: [],
  selectedId: null,
  hasPinning: false,
  actionsVisibility: "hover",
  isDisabled: false,
  isLoading: false,
  ariaLabel: "Navigation",
  menuProps: null,
  onSelect: null,
  onPinChange: null,
  onAction: null
};
let ArvoNav = _ArvoNav;
export {
  ArvoNav,
  NAV_ITEM_MAX_INLINE_ACTIONS
};
//# sourceMappingURL=Nav.js.map
