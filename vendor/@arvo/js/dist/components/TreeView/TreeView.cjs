"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const core = require("@arvo/core");
const IconButton = require("../IconButton/IconButton.cjs");
const Checkbox = require("../Checkbox/Checkbox.cjs");
const Badge = require("../Badge/Badge.cjs");
const EmptyState = require("../EmptyState/EmptyState.cjs");
const Loader = require("../Loader/Loader.cjs");
const ActionMenu = require("../ActionMenu/ActionMenu.cjs");
function hasChildrenShape(item) {
  return item.children !== void 0;
}
function buildVisibleRows(items, expandedSet) {
  const rows = [];
  function walk(nodes, level, ancestorIsLastFlags, parentId) {
    nodes.forEach((node, idx) => {
      const isLastChild = idx === nodes.length - 1;
      const hasChildren = hasChildrenShape(node);
      const isExpanded = hasChildren && expandedSet.has(node.id);
      rows.push({
        item: node,
        level,
        ancestorIsLastFlags,
        isLastChild,
        hasChildren,
        isExpanded,
        parentId,
        setSize: nodes.length,
        posInSet: idx + 1
      });
      if (hasChildren && isExpanded && Array.isArray(node.children) && node.children.length > 0) {
        walk(
          node.children,
          level + 1,
          [...ancestorIsLastFlags, isLastChild],
          node.id
        );
      }
    });
  }
  walk(items, 0, [], null);
  return rows;
}
function normalizeMeta(meta) {
  if (meta == null) return null;
  if (typeof meta === "string") {
    return meta.length > 0 ? { icon: null, text: meta } : null;
  }
  const icon = typeof meta.icon === "string" && meta.icon.length > 0 ? meta.icon : null;
  const text = typeof meta.text === "string" && meta.text.length > 0 ? meta.text : null;
  if (icon == null && text == null) return null;
  return { icon, text };
}
function findItemById(items, id) {
  for (const item of items) {
    if (item.id === id) return item;
    if (Array.isArray(item.children)) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}
function patchItemById(items, id, patch) {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) {
      items[i] = { ...items[i], ...patch };
      return true;
    }
    if (Array.isArray(items[i].children)) {
      if (patchItemById(items[i].children, id, patch)) {
        return true;
      }
    }
  }
  return false;
}
function isItemSelectable(item) {
  return item.isSelectable !== false;
}
function variantToModes(variant) {
  switch (variant) {
    case "expandOnly":
      return { selectionMode: "single", rowInteraction: "expand" };
    case "singleSelect":
      return { selectionMode: "single", rowInteraction: "select" };
    case "multiSelect":
      return { selectionMode: "multiple", rowInteraction: "expand" };
    case "navigation":
      return { selectionMode: "single", rowInteraction: "navigate" };
    case "navigationMultiSelect":
      return { selectionMode: "multiple", rowInteraction: "navigate" };
  }
}
function collectEligibleDescendantIds(item) {
  const ids = [];
  function walk(node) {
    if (!Array.isArray(node.children)) return;
    for (const child of node.children) {
      if (child.isDisabled) continue;
      if (isItemSelectable(child)) ids.push(child.id);
      walk(child);
    }
  }
  walk(item);
  return ids;
}
function computeMultiAriaChecked(item, isRowSelected, selectedSet) {
  if (!Array.isArray(item.children) || item.children.length === 0) {
    return isRowSelected;
  }
  const descendants = collectEligibleDescendantIds(item);
  if (descendants.length === 0) return isRowSelected;
  let selectedCount = 0;
  for (const id of descendants) {
    if (selectedSet.has(id)) selectedCount += 1;
  }
  if (selectedCount === 0) return false;
  if (selectedCount === descendants.length) return true;
  return "mixed";
}
function labelMatchesQuery(label, query) {
  if (!query) return false;
  return label.toLowerCase().includes(query.toLowerCase());
}
function buildMatchParts(label, query) {
  if (!query) return [{ text: label, isMatch: false }];
  const haystack = label.toLowerCase();
  const needle = query.toLowerCase();
  const parts = [];
  let i = 0;
  while (i < label.length) {
    const idx = haystack.indexOf(needle, i);
    if (idx === -1) {
      parts.push({ text: label.slice(i), isMatch: false });
      break;
    }
    if (idx > i) parts.push({ text: label.slice(i, idx), isMatch: false });
    parts.push({ text: label.slice(idx, idx + needle.length), isMatch: true });
    i = idx + needle.length;
  }
  return parts;
}
let _idCounter = 0;
const _ArvoTreeView = class _ArvoTreeView {
  constructor(element, options = {}) {
    this._asyncLoadingSet = /* @__PURE__ */ new Set();
    this._activeIndex = 0;
    this._reorderingId = null;
    this._liveRegionEl = null;
    this._contextMenu = null;
    this._contextTriggerEl = null;
    this._contextItemId = null;
    this._treeNav = null;
    this._innerInstancesTreeLevel = [];
    this._innerInstancesByRow = /* @__PURE__ */ new Map();
    this._bodyInstanceByRow = /* @__PURE__ */ new Map();
    this._rowMap = /* @__PURE__ */ new Map();
    this._dataMap = /* @__PURE__ */ new Map();
    this._lastVisibleRows = [];
    this._onKeyDown = (e) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      if (this._options.isDisabled || this._options.isLoading) return;
      const focusedEl = document.activeElement;
      const focusedRowEl = (focusedEl == null ? void 0 : focusedEl.closest(
        '[role="treeitem"]'
      )) ?? null;
      const isFocusOnRow = focusedEl != null && focusedEl === focusedRowEl;
      const isFocusInActions = (focusedEl == null ? void 0 : focusedEl.closest(".arvo-tree__actions")) != null;
      if (isFocusOnRow && e.key === "Tab" && !e.shiftKey) {
        const actionsEl = focusedRowEl == null ? void 0 : focusedRowEl.querySelector(
          ".arvo-tree__actions"
        );
        const firstAction = actionsEl == null ? void 0 : actionsEl.querySelector(
          "button:not([disabled])"
        );
        if (firstAction) {
          e.preventDefault();
          firstAction.focus();
          return;
        }
      }
      if (isFocusInActions) {
        if (e.key === "Escape" || e.key === "Tab" && e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          focusedRowEl == null ? void 0 : focusedRowEl.focus();
          return;
        }
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          const actionsEl = focusedRowEl == null ? void 0 : focusedRowEl.querySelector(
            ".arvo-tree__actions"
          );
          const actionButtons = actionsEl ? Array.from(
            actionsEl.querySelectorAll(
              "button:not([disabled])"
            )
          ) : [];
          const currentIdx = actionButtons.findIndex((btn) => btn === focusedEl);
          if (currentIdx !== -1) {
            e.preventDefault();
            const direction = e.key === "ArrowRight" ? 1 : -1;
            const nextIdx = (currentIdx + direction + actionButtons.length) % actionButtons.length;
            (_a = actionButtons[nextIdx]) == null ? void 0 : _a.focus();
            return;
          }
        }
        if (e.key === "Tab" && !e.shiftKey) {
          const actionsEl = focusedRowEl == null ? void 0 : focusedRowEl.querySelector(
            ".arvo-tree__actions"
          );
          const actionButtons = actionsEl ? Array.from(
            actionsEl.querySelectorAll(
              "button:not([disabled])"
            )
          ) : [];
          const currentIdx = actionButtons.findIndex((btn) => btn === focusedEl);
          if (currentIdx !== -1 && currentIdx === actionButtons.length - 1) {
            return;
          }
          if (currentIdx !== -1 && currentIdx < actionButtons.length - 1) {
            e.preventDefault();
            (_b = actionButtons[currentIdx + 1]) == null ? void 0 : _b.focus();
            return;
          }
        }
        return;
      }
      const isContextMenuKey = e.key === "ContextMenu" || e.key === "F10" && e.shiftKey && !e.ctrlKey && !e.altKey || e.key.toLowerCase() === "x" && e.shiftKey && e.ctrlKey && !e.altKey;
      if (isContextMenuKey && this._options.contextMenu && focusedRowEl) {
        const itemId = (_c = focusedRowEl.id.match(/-row-(.+)$/)) == null ? void 0 : _c[1];
        const focusItem = itemId ? findItemById(this._items, itemId) : null;
        if (focusItem && !focusItem.isDisabled) {
          e.preventDefault();
          this._openContextMenu(focusItem, focusedRowEl, "keyboard");
          return;
        }
      }
      if (e.key === "*") {
        const visible = buildVisibleRows(this._items, this._expandedSet);
        const focusRow = visible[this._activeIndex];
        if (focusRow) {
          const targetLevel = focusRow.level;
          e.preventDefault();
          let mutated = false;
          for (const r of visible) {
            if (r.level === targetLevel && r.hasChildren && !r.isExpanded && !r.item.isDisabled) {
              if (!this._expandedSet.has(r.item.id)) {
                if (!this._isControlledExpansion) {
                  this._expandedSet.add(r.item.id);
                }
                mutated = true;
              }
            }
          }
          if (mutated) {
            for (const r of visible) {
              if (r.level === targetLevel && r.hasChildren && !r.isExpanded && !r.item.isDisabled && this._expandedSet.has(r.item.id)) {
                this._renderExpansionChange(r.item, true);
              }
            }
          }
          return;
        }
      }
      if (e.key === "Enter") {
        const visible = buildVisibleRows(this._items, this._expandedSet);
        const row = visible[this._activeIndex];
        if (row && !row.item.isDisabled) {
          const mode = this._options.rowInteraction;
          if (mode === "navigate") {
            e.preventDefault();
            (_e = (_d = this._options).onNavigate) == null ? void 0 : _e.call(_d, row.item, e);
            return;
          }
          const effectiveMode = mode === "select" && !isItemSelectable(row.item) ? "expand" : mode;
          if (effectiveMode === "expand") {
            e.preventDefault();
            if (row.hasChildren) {
              this._setExpansion(row.item, !this._expandedSet.has(row.item.id));
            }
            return;
          }
        }
      }
      if (this._reorderingId != null) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const direction = e.key === "ArrowDown" ? 1 : -1;
          const loc = this._findItemLocation(this._reorderingId);
          if (loc) {
            const target = loc.index + direction;
            if (target >= 0 && target < loc.parentChildren.length) {
              const item = loc.parentChildren[loc.index];
              this._commitReorder(
                item,
                ((_f = loc.parent) == null ? void 0 : _f.id) ?? null,
                loc.index,
                ((_g = loc.parent) == null ? void 0 : _g.id) ?? null,
                target,
                loc.parentChildren.length,
                direction === 1 ? "after" : "before"
              );
            }
          }
          return;
        }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const reorderId = this._reorderingId;
          const item = findItemById(this._items, reorderId);
          if (item) this._announce(`${item.label} dropped.`);
          this._reorderingId = null;
          const rowEl = this._rowMap.get(reorderId);
          if (rowEl) {
            rowEl.classList.remove("is-grab-active");
            const dragBtn = rowEl.querySelector(
              ".arvo-tree__drag button"
            );
            dragBtn == null ? void 0 : dragBtn.setAttribute("aria-pressed", "false");
          }
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          this._cancelReorderMode();
          return;
        }
        return;
      }
      (_h = this._treeNav) == null ? void 0 : _h.handleKeyDown(e);
    };
    this._element = element;
    this._id = `arvo-tree-${++_idCounter}`;
    this._isControlledSelection = options.selectedIds !== void 0;
    this._isControlledExpansion = options.expandedIds !== void 0;
    const variant = options.variant ?? "expandOnly";
    const { selectionMode, rowInteraction } = variantToModes(variant);
    this._options = {
      items: options.items ?? [],
      variant,
      selectionMode,
      rowInteraction,
      size: options.size ?? "sm",
      appearance: options.appearance ?? "default",
      hasHierarchyLines: options.hasHierarchyLines ?? false,
      selectedIds: options.selectedIds,
      defaultSelectedIds: options.defaultSelectedIds ?? [],
      expandedIds: options.expandedIds,
      defaultExpandedIds: options.defaultExpandedIds ?? [],
      searchQuery: options.searchQuery ?? "",
      isDisabled: options.isDisabled ?? false,
      isLoading: options.isLoading ?? false,
      emptyConfig: options.emptyConfig ?? null,
      ariaLabel: options.ariaLabel ?? null,
      ariaLabelledBy: options.ariaLabelledBy ?? null,
      actions: options.actions ?? null,
      actionsVisibility: options.actionsVisibility ?? "hover",
      maxVisualLevel: options.maxVisualLevel ?? 4,
      isReorderable: options.isReorderable ?? false,
      onSelectionChange: options.onSelectionChange ?? null,
      onExpandedChange: options.onExpandedChange ?? null,
      onLoadChildren: options.onLoadChildren ?? null,
      onReorder: options.onReorder ?? null,
      onNavigate: options.onNavigate ?? null,
      canMoveItem: options.canMoveItem ?? null,
      contextMenu: options.contextMenu ?? null,
      onContextMenu: options.onContextMenu ?? null,
      isReadOnly: options.isReadOnly ?? false
    };
    this._items = this._options.items;
    this._selectedSet = new Set(
      this._isControlledSelection ? this._options.selectedIds : this._options.defaultSelectedIds
    );
    this._expandedSet = new Set(
      this._isControlledExpansion ? this._options.expandedIds : this._options.defaultExpandedIds
    );
    this._fullRebuild();
    this._bindEvents();
  }
  static initialize(element, options) {
    return new _ArvoTreeView(element, options);
  }
  destroy() {
    var _a;
    this._unbindEvents();
    (_a = this._contextMenu) == null ? void 0 : _a.destroy();
    this._contextMenu = null;
    this._contextTriggerEl = null;
    this._element.replaceChildren();
    this._element.removeAttribute("role");
    this._element.removeAttribute("aria-label");
    this._element.removeAttribute("aria-labelledby");
    this._element.removeAttribute("aria-multiselectable");
    this._element.removeAttribute("aria-disabled");
    this._element.removeAttribute("aria-busy");
    this._element.removeAttribute("id");
    this._element.classList.remove(
      "arvo-tree",
      "arvo-tree--sm",
      "arvo-tree--lg",
      "arvo-tree--expandOnly",
      "arvo-tree--singleSelect",
      "arvo-tree--multiSelect",
      "arvo-tree--navigation",
      "arvo-tree--navigationMultiSelect",
      "arvo-tree--multiple",
      "arvo-tree--strong",
      "arvo-tree--lines",
      "arvo-tree--readonly",
      "arvo-tree--actions-on-hover",
      "is-disabled",
      "loading"
    );
    this._element.removeAttribute("aria-readonly");
  }
  // -- Public methods --------------------------------------------------------
  selected(ids) {
    if (ids === void 0) return Array.from(this._selectedSet);
    if (!this._isControlledSelection) {
      this._selectedSet = new Set(ids);
      this._renderSelectionChange();
    }
  }
  expanded(ids) {
    if (ids === void 0) return Array.from(this._expandedSet);
    if (!this._isControlledExpansion) {
      const prev = this._expandedSet;
      const next = new Set(ids);
      this._expandedSet = next;
      const allChanged = [];
      for (const id of next) if (!prev.has(id)) allChanged.push({ id, willExpand: true });
      for (const id of prev) if (!next.has(id)) allChanged.push({ id, willExpand: false });
      if (allChanged.length === 0) return;
      for (const change of allChanged) {
        const item = findItemById(this._items, change.id);
        if (!item) {
          this._fullRebuild();
          return;
        }
        this._renderExpansionChange(item, change.willExpand);
      }
    }
  }
  expand(id) {
    const item = findItemById(this._items, id);
    if (item) this._setExpansion(item, true);
  }
  collapse(id) {
    const item = findItemById(this._items, id);
    if (item) this._setExpansion(item, false);
  }
  toggleExpansion(id) {
    const item = findItemById(this._items, id);
    if (item) this._setExpansion(item, !this._expandedSet.has(id));
  }
  disabled(state) {
    if (state === void 0) return this._options.isDisabled;
    this._options.isDisabled = state;
    this._renderTreeState();
  }
  setLoading(state) {
    this._options.isLoading = state;
    this._fullRebuild();
  }
  /**
   * Update the search query used for substring highlighting in row labels.
   * Mirrors the reactive React `searchQuery` prop so composing parents
   * (DropdownTree, ActionMenu, HybridPopover, etc.) can drive highlighting
   * without tearing down + rebuilding the tree on every keystroke.
   */
  setSearchQuery(query) {
    if (this._options.searchQuery === query) return;
    this._options.searchQuery = query;
    this._renderSearchHighlight();
  }
  setItems(items) {
    const prevItems = this._items;
    const focusToken = this._captureFocusContext();
    this._items = items;
    const allIds = /* @__PURE__ */ new Set();
    function walk(n) {
      allIds.add(n.id);
      if (Array.isArray(n.children)) n.children.forEach(walk);
    }
    items.forEach(walk);
    if (!this._isControlledSelection) {
      this._selectedSet = new Set(
        Array.from(this._selectedSet).filter((id) => allIds.has(id))
      );
    }
    if (!this._isControlledExpansion) {
      this._expandedSet = new Set(
        Array.from(this._expandedSet).filter((id) => allIds.has(id))
      );
    }
    this._reconcileLazyLoadSelection(prevItems);
    this._fullRebuild();
    this._restoreFocusAfterMutation(focusToken);
  }
  updateItem(id, partial) {
    const prevSnapshot = this._snapshotItems();
    const focusToken = this._captureFocusContext();
    if (patchItemById(this._items, id, partial)) {
      this._reconcileLazyLoadSelection(prevSnapshot);
      this._fullRebuild();
      this._restoreFocusAfterMutation(focusToken);
    }
  }
  /**
   * Capture a shallow snapshot of `_items` BEFORE a mutation so the A8
   * reconciliation can compare old vs new descendant sets. Used by
   * `updateItem` which mutates in place; `setItems` already has the
   * old array available.
   */
  _snapshotItems() {
    function clone(node) {
      const c = { ...node };
      if (Array.isArray(node.children)) {
        c.children = node.children.map(clone);
      }
      return c;
    }
    return this._items.map(clone);
  }
  /**
   * A8 lazy-load selection inheritance (multi-select only). When the
   * items array changes, walk the new tree and find selected parents
   * whose eligible descendant set has GROWN since the previous render.
   * Add the new eligible descendant ids to the selection. Parents
   * that were `mixed` (a user-selected subset) are left alone.
   */
  _reconcileLazyLoadSelection(prevItems) {
    var _a, _b;
    if (this._options.selectionMode !== "multiple") return;
    if (this._selectedSet.size === 0) return;
    const additions = [];
    const walk = (nodes) => {
      for (const node of nodes) {
        if (this._selectedSet.has(node.id) && Array.isArray(node.children) && node.children.length > 0) {
          const prevNode = findItemById(prevItems, node.id);
          const prevEligible = prevNode ? new Set(collectEligibleDescendantIds(prevNode)) : /* @__PURE__ */ new Set();
          const wasFullySelected = prevNode == null || Array.from(prevEligible).every((id) => this._selectedSet.has(id));
          if (!wasFullySelected) {
            walk(node.children);
            continue;
          }
          const nowEligible = collectEligibleDescendantIds(node);
          for (const id of nowEligible) {
            if (!prevEligible.has(id) && !this._selectedSet.has(id)) {
              additions.push(id);
            }
          }
        }
        if (Array.isArray(node.children)) walk(node.children);
      }
    };
    walk(this._items);
    if (additions.length === 0) return;
    if (!this._isControlledSelection) {
      additions.forEach((id) => this._selectedSet.add(id));
    }
    const next = Array.from(this._selectedSet);
    (_b = (_a = this._options).onSelectionChange) == null ? void 0 : _b.call(_a, next, {
      item: this._items[0],
      isSelected: true
    });
  }
  /**
   * Capture the focus context before a structural mutation. Returns
   * `null` when the tree does not own focus, so the restoration step
   * can be skipped without stealing focus from outside the tree.
   */
  _captureFocusContext() {
    var _a, _b;
    const treeEl = this._element;
    if (!treeEl.contains(document.activeElement)) return null;
    const focusedEl = document.activeElement;
    const focusedId = ((_b = (_a = focusedEl == null ? void 0 : focusedEl.id) == null ? void 0 : _a.match(/-row-(.+)$/)) == null ? void 0 : _b[1]) ?? null;
    if (!focusedId) return { focusedId: null, parentId: null, index: this._activeIndex };
    const visible = buildVisibleRows(this._items, this._expandedSet);
    const idx = visible.findIndex((r) => r.item.id === focusedId);
    if (idx === -1) return { focusedId, parentId: null, index: this._activeIndex };
    return {
      focusedId,
      parentId: visible[idx].parentId,
      index: idx
    };
  }
  /**
   * A12 focus restoration. After a structural mutation, if the
   * previously focused row id is no longer in the visible row set,
   * fall back via the spec's order (spec section 31):
   *   next sibling -> previous sibling -> parent -> first non-disabled
   *
   * Receives a token captured BEFORE the mutation -- `_render()` wipes
   * the DOM, so `document.activeElement` is no longer reliable by the
   * time this method runs.
   */
  _restoreFocusAfterMutation(token) {
    if (!token) return;
    const visible = buildVisibleRows(this._items, this._expandedSet);
    if (visible.length === 0) {
      this._activeIndex = 0;
      return;
    }
    if (token.focusedId) {
      const idx = visible.findIndex((r) => r.item.id === token.focusedId);
      if (idx !== -1) {
        this._activeIndex = idx;
        this._focusActiveRow();
        return;
      }
    }
    const sameParent = visible.filter((r) => r.parentId === token.parentId);
    if (sameParent.length > 0) {
      const sibling = sameParent[Math.min(token.index, sameParent.length - 1)];
      if (sibling) {
        this._activeIndex = visible.indexOf(sibling);
        this._focusActiveRow();
        return;
      }
    }
    if (token.parentId) {
      const parentIdx = visible.findIndex((r) => r.item.id === token.parentId);
      if (parentIdx !== -1) {
        this._activeIndex = parentIdx;
        this._focusActiveRow();
        return;
      }
    }
    const firstEnabled = visible.findIndex(
      (r) => !r.item.isDisabled && !this._options.isDisabled
    );
    if (firstEnabled !== -1) {
      this._activeIndex = firstEnabled;
      this._focusActiveRow();
    }
  }
  focusItem(id) {
    const visible = buildVisibleRows(this._items, this._expandedSet);
    const index = visible.findIndex((r) => r.item.id === id);
    if (index === -1) return;
    this._activeIndex = index;
    this._focusActiveRow();
  }
  // -- Render ---------------------------------------------------------------
  /**
   * Full rebuild. Called once on mount and from mutators whose change
   * is large enough that targeted updates would be more error-prone
   * than helpful (e.g. `setItems`, async-load arrivals, reorder
   * commits, tree-level loading skeleton transitions). Surgical
   * helpers (`_renderSelectionChange`, `_renderExpansionChange`,
   * `_renderSearchHighlight`, `_renderTreeState`) avoid this path for
   * the common selection / expansion / search-highlight / disabled
   * mutations so unchanged rows keep their DOM identity and their
   * mounted inner instances (ArvoBadge, ArvoCheckbox, ArvoIconButton,
   * ArvoActionMenu) are not torn down and re-created. The row-enter
   * SCSS animation uses `@starting-style` so it only runs for genuinely
   * new rows.
   */
  _fullRebuild() {
    this._destroyInnerInstances();
    this._rowMap.clear();
    this._dataMap.clear();
    const el = this._element;
    el.id = this._id;
    el.setAttribute("role", "tree");
    el.classList.add(
      "arvo-tree",
      `arvo-tree--${this._options.size}`,
      `arvo-tree--${this._options.variant}`
    );
    for (const v of [
      "expandOnly",
      "singleSelect",
      "multiSelect",
      "navigation",
      "navigationMultiSelect"
    ]) {
      el.classList.toggle(`arvo-tree--${v}`, v === this._options.variant);
    }
    el.classList.toggle(
      "arvo-tree--multiple",
      this._options.selectionMode === "multiple"
    );
    el.classList.toggle(
      "arvo-tree--strong",
      this._options.appearance === "strong"
    );
    el.classList.toggle(
      "arvo-tree--lines",
      this._options.hasHierarchyLines
    );
    el.classList.toggle(
      "arvo-tree--readonly",
      this._options.isReadOnly
    );
    if (this._options.isReadOnly) el.setAttribute("aria-readonly", "true");
    else el.removeAttribute("aria-readonly");
    el.classList.toggle("is-disabled", this._options.isDisabled);
    el.classList.toggle("loading", this._options.isLoading);
    el.classList.toggle(
      "arvo-tree--actions-on-hover",
      this._options.actionsVisibility === "hover"
    );
    if (this._options.ariaLabel) el.setAttribute("aria-label", this._options.ariaLabel);
    else el.removeAttribute("aria-label");
    if (this._options.ariaLabelledBy)
      el.setAttribute("aria-labelledby", this._options.ariaLabelledBy);
    else el.removeAttribute("aria-labelledby");
    if (this._options.selectionMode === "multiple")
      el.setAttribute("aria-multiselectable", "true");
    else el.removeAttribute("aria-multiselectable");
    if (this._options.isDisabled) el.setAttribute("aria-disabled", "true");
    else el.removeAttribute("aria-disabled");
    if (this._options.isLoading) el.setAttribute("aria-busy", "true");
    else el.removeAttribute("aria-busy");
    el.replaceChildren();
    if (this._options.isLoading) {
      this._renderSkeleton();
      return;
    }
    if (this._items.length === 0) {
      this._renderEmptyTree();
      return;
    }
    if (this._options.isReorderable) {
      const live = document.createElement("div");
      live.className = "arvo-tree__live";
      live.setAttribute("aria-live", "polite");
      live.setAttribute("aria-atomic", "true");
      el.appendChild(live);
      this._liveRegionEl = live;
    } else {
      this._liveRegionEl = null;
    }
    const group = document.createElement("div");
    group.className = "arvo-tree__group";
    group.setAttribute("role", "group");
    const visible = buildVisibleRows(this._items, this._expandedSet);
    this._lastVisibleRows = visible;
    visible.forEach((row, index) => {
      const rowEl = this._buildRowEl(row, index);
      group.appendChild(rowEl);
      const isAsync = this._asyncLoadingSet.has(row.item.id) || !!row.item.isAsyncLoading;
      const isEmptyParent = row.isExpanded && Array.isArray(row.item.children) && row.item.children.length === 0 && !isAsync;
      if (isAsync) {
        group.appendChild(this._buildBodyEl(row.item, "loader"));
      } else if (isEmptyParent) {
        group.appendChild(this._buildBodyEl(row.item, "empty"));
      }
    });
    el.appendChild(group);
    this._setupTreeNav(visible);
  }
  _renderSkeleton() {
    const skel = document.createElement("div");
    skel.className = "arvo-tree__skeleton";
    for (let i = 0; i < 5; i++) {
      const r = document.createElement("div");
      r.className = "arvo-tree__skeleton-row";
      const ico = document.createElement("span");
      ico.className = "arvo-tree__skeleton-icon";
      ico.setAttribute("aria-hidden", "true");
      const txt = document.createElement("span");
      txt.className = "arvo-tree__skeleton-text";
      txt.setAttribute("aria-hidden", "true");
      r.append(ico, txt);
      skel.appendChild(r);
    }
    this._element.appendChild(skel);
  }
  _renderEmptyTree() {
    var _a, _b, _c;
    const wrap = document.createElement("div");
    wrap.className = "arvo-tree__empty";
    this._element.appendChild(wrap);
    const empty = EmptyState.ArvoEmptyState.initialize(wrap, {
      illustration: ((_a = this._options.emptyConfig) == null ? void 0 : _a.illustration) ?? "no-data",
      title: (_b = this._options.emptyConfig) == null ? void 0 : _b.title,
      message: ((_c = this._options.emptyConfig) == null ? void 0 : _c.message) ?? "No Items Available",
      size: "sm",
      orientation: "vertical"
    });
    this._innerInstancesTreeLevel.push(empty);
  }
  // -- Enter / exit animation ----------------------------------------------
  /**
   * Whether the user has opted into reduced motion. The animation
   * helpers below short-circuit to instant insert / remove when true
   * (and in non-browser test environments where `matchMedia` is
   * unavailable, e.g. jsdom -- we conservatively skip animations there
   * so the unit tests see synchronous DOM mutations).
   */
  _prefersReducedMotion() {
    if (typeof window === "undefined" || !window.matchMedia) return true;
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return true;
    }
  }
  /**
   * Enter is fully CSS-driven via `@starting-style` in `_arvo-tree.scss`
   * -- the browser interpolates `opacity` + `transform` (compositor-only
   * properties) on first paint after a node attaches to the document.
   *
   * This method is intentionally a no-op. It is kept on the class so
   * the surgical insertion paths can stay readable ("insert + animate
   * enter") and so a future motion redesign has one symbol to swap.
   * Inserting 1000 rows therefore costs zero per-row main-thread
   * animation work -- the GPU handles every fade in parallel.
   */
  _animateEnter(_el) {
  }
  /**
   * Fade `el` out (compositor-only) then run `onComplete` for the
   * physical DOM removal + inner-instance teardown. For batch exits
   * prefer `_animateExitBatch` -- it sets all classes in one pass and
   * shares a single timer for the whole group.
   *
   * Marks the element with `data-arvo-leaving="true"` so the surgical
   * expand path can detect and instantly purge a dying row if the user
   * re-expands a branch before the previous exit completes (preventing
   * a duplicate-id collision in the DOM).
   *
   * No height measurement, no inline-style transitions, no
   * `transitionend` listener -- the SCSS class fully defines the
   * animation and a single timeout schedules the cleanup. This keeps
   * the cost O(1) per element regardless of tree size.
   */
  _animateExit(el, onComplete) {
    if (this._prefersReducedMotion()) {
      onComplete == null ? void 0 : onComplete();
      return;
    }
    el.classList.add("is-leaving");
    el.setAttribute("data-arvo-leaving", "true");
    setTimeout(() => {
      onComplete == null ? void 0 : onComplete();
    }, _ArvoTreeView._EXIT_DURATION_MS);
  }
  /**
   * Batched fade-out for a group of elements that all leave together
   * (e.g. all descendant rows of a collapsing parent + their body
   * siblings). All elements get the `is-leaving` class in a single
   * synchronous pass, the GPU runs every transition in parallel on
   * the compositor thread, and a SINGLE timer schedules all of the
   * cleanups in one frame.
   *
   * For very large groups (more than `_ANIMATION_BUDGET` elements) the
   * fade is skipped entirely and the cleanup runs synchronously --
   * 1000-row collapses become an instant snap that completes in a
   * single frame, with zero animation cost.
   */
  _animateExitBatch(elements) {
    if (elements.length === 0) return;
    if (this._prefersReducedMotion() || elements.length > _ArvoTreeView._ANIMATION_BUDGET) {
      for (const entry of elements) entry.cleanup();
      return;
    }
    for (const entry of elements) {
      entry.el.classList.add("is-leaving");
      entry.el.setAttribute("data-arvo-leaving", "true");
    }
    setTimeout(() => {
      for (const entry of elements) entry.cleanup();
    }, _ArvoTreeView._EXIT_DURATION_MS);
  }
  // -- Surgical render helpers ----------------------------------------------
  /**
   * Apply tree-level state changes (`isDisabled`, `isLoading`,
   * `isReadOnly`) to the root element without rebuilding any rows.
   * Falls back to `_fullRebuild` when `isLoading` transitions to /
   * from skeleton mode (the body content type changes).
   */
  _renderTreeState() {
    const el = this._element;
    const opts = this._options;
    el.classList.toggle("is-disabled", opts.isDisabled);
    el.classList.toggle("loading", opts.isLoading);
    el.classList.toggle("arvo-tree--readonly", opts.isReadOnly);
    if (opts.isDisabled) el.setAttribute("aria-disabled", "true");
    else el.removeAttribute("aria-disabled");
    if (opts.isLoading) el.setAttribute("aria-busy", "true");
    else el.removeAttribute("aria-busy");
    if (opts.isReadOnly) el.setAttribute("aria-readonly", "true");
    else el.removeAttribute("aria-readonly");
    for (const [id, rowEl] of this._rowMap) {
      const item = this._dataMap.get(id);
      const isRowDisabled = !!(item == null ? void 0 : item.isDisabled) || !!opts.isDisabled;
      rowEl.classList.toggle("is-disabled", isRowDisabled);
      if (isRowDisabled) rowEl.setAttribute("aria-disabled", "true");
      else rowEl.removeAttribute("aria-disabled");
    }
  }
  /**
   * Update `.selected`, `aria-selected`, `aria-checked`, and the inner
   * checkbox state (where applicable) for every rendered row to match
   * the current `_selectedSet`. Does NOT touch row DOM identity or
   * tear down any inner instances -- only attributes / classes /
   * input.checked / input.indeterminate are written. This is what
   * makes a multi-select cascade O(visible rows) of attribute writes
   * instead of O(visible rows) of full DOM recreation.
   */
  _renderSelectionChange() {
    const isSingleSelect = this._options.rowInteraction === "select";
    const isMulti = this._options.selectionMode === "multiple";
    for (const [id, rowEl] of this._rowMap) {
      const item = this._dataMap.get(id);
      if (!item) continue;
      const rowSelectable = isItemSelectable(item);
      const isRowSelected = rowSelectable && this._selectedSet.has(id);
      const isRowDisabled = !!item.isDisabled || !!this._options.isDisabled;
      rowEl.classList.toggle("selected", isRowSelected);
      if (isSingleSelect && rowSelectable && !isRowDisabled) {
        rowEl.setAttribute("aria-selected", String(isRowSelected));
      } else {
        rowEl.removeAttribute("aria-selected");
      }
      if (isMulti && rowSelectable) {
        const checked = computeMultiAriaChecked(
          item,
          isRowSelected,
          this._selectedSet
        );
        rowEl.setAttribute(
          "aria-checked",
          checked === "mixed" ? "mixed" : String(checked)
        );
        const input = rowEl.querySelector(
          '.arvo-tree__check input[type="checkbox"]'
        );
        if (input) {
          input.indeterminate = checked === "mixed";
          input.checked = checked === "mixed" ? true : checked === true;
          if (checked === "mixed") {
            input.setAttribute("data-indeterminate", "true");
          } else {
            input.removeAttribute("data-indeterminate");
          }
        }
        const cbHost = rowEl.querySelector(
          ".arvo-tree__check .arvo-cb"
        );
        if (cbHost) {
          if (checked === "mixed") {
            cbHost.setAttribute("data-indeterminate", "true");
          } else {
            cbHost.removeAttribute("data-indeterminate");
          }
        }
      } else {
        rowEl.removeAttribute("aria-checked");
      }
    }
  }
  /**
   * Update the `--search-highlight` modifier and the `__label-match`
   * span structure on every rendered row to match the current
   * `searchQuery`. Inner instances are untouched.
   */
  _renderSearchHighlight() {
    const query = this._options.searchQuery;
    for (const [id, rowEl] of this._rowMap) {
      const item = this._dataMap.get(id);
      if (!item) continue;
      const hasMatch = item.isSearchMatch !== void 0 ? item.isSearchMatch : labelMatchesQuery(item.label, query);
      rowEl.classList.toggle("arvo-tree__item--search-highlight", hasMatch);
      const lbl = rowEl.querySelector(".arvo-tree__label");
      if (lbl) {
        lbl.textContent = "";
        const parts = buildMatchParts(item.label, query);
        parts.forEach((p) => {
          if (p.isMatch) {
            const span = document.createElement("span");
            span.className = "arvo-tree__label-match";
            span.textContent = p.text;
            lbl.appendChild(span);
          } else {
            lbl.appendChild(document.createTextNode(p.text));
          }
        });
      }
    }
  }
  /**
   * Apply an expansion change to the visible row set without
   * rebuilding the entire tree. Handles every variant surgically:
   *
   *  - Expand a parent with children: build the newly-visible
   *    descendant rows and insert them as siblings right after the
   *    parent in `__group`; animate each one in.
   *  - Expand a parent whose `children === []` (empty parent):
   *    insert an `__empty` body element as a sibling right after the
   *    parent; tag the row with `--empty` and animate the body in.
   *  - Expand a parent whose `children === null` (async-load):
   *    insert an `__loader` body element as a sibling; tag the row
   *    with `--async-loading` + `aria-busy`. The body is replaced /
   *    removed by `_resolveAsyncLoad` once the children promise
   *    resolves.
   *  - Collapse any of the above: remove the body sibling (if any),
   *    remove the row classes, then animate out + remove every
   *    descendant row (and its own attached body) below the parent.
   *
   * Inner instances mounted under unaffected rows are NEVER torn
   * down -- the parent row keeps the same DOM identity in every case
   * so the previously-allocated ArvoBadge / ArvoCheckbox /
   * ArvoIconButton / ArvoActionMenu instances stay alive.
   */
  _renderExpansionChange(item, willExpand) {
    const id = item.id;
    const parentRowEl = this._rowMap.get(id);
    if (!parentRowEl) {
      this._fullRebuild();
      return;
    }
    const group = parentRowEl.parentElement;
    if (!group) {
      this._fullRebuild();
      return;
    }
    parentRowEl.setAttribute("aria-expanded", String(willExpand));
    parentRowEl.classList.toggle("arvo-tree__item--expanded", willExpand);
    const chevronBtn = parentRowEl.querySelector(
      ".arvo-tree__chevron button"
    );
    if (chevronBtn) {
      chevronBtn.setAttribute(
        "aria-label",
        willExpand ? `Collapse ${item.label}` : `Expand ${item.label}`
      );
      const tooltipEl = parentRowEl.querySelector(
        ".arvo-tree__chevron [data-arvo-tooltip]"
      );
      if (tooltipEl) {
        tooltipEl.textContent = willExpand ? `Collapse ${item.label}` : `Expand ${item.label}`;
      }
    }
    if (willExpand) {
      const isAsync = item.children === null || this._asyncLoadingSet.has(id) || !!item.isAsyncLoading;
      const isEmptyParent = !isAsync && Array.isArray(item.children) && item.children.length === 0;
      if (isAsync) {
        parentRowEl.classList.add("arvo-tree__item--async-loading");
        parentRowEl.setAttribute("aria-busy", "true");
        this._purgeDyingBody(id);
        const existingBody2 = this._findRowBody(parentRowEl, id);
        if (!existingBody2) {
          const loaderEl = this._buildBodyEl(item, "loader");
          group.insertBefore(loaderEl, parentRowEl.nextSibling);
          this._animateEnter(loaderEl);
        }
        this._lastVisibleRows = buildVisibleRows(
          this._items,
          this._expandedSet
        );
        this._setupTreeNav(this._lastVisibleRows);
        return;
      }
      if (isEmptyParent) {
        parentRowEl.classList.add("arvo-tree__item--empty");
        this._purgeDyingBody(id);
        const existingBody2 = this._findRowBody(parentRowEl, id);
        if (!existingBody2) {
          const emptyEl = this._buildBodyEl(item, "empty");
          group.insertBefore(emptyEl, parentRowEl.nextSibling);
          this._animateEnter(emptyEl);
        }
        this._lastVisibleRows = buildVisibleRows(
          this._items,
          this._expandedSet
        );
        this._setupTreeNav(this._lastVisibleRows);
        return;
      }
      const newVisible2 = buildVisibleRows(this._items, this._expandedSet);
      this._lastVisibleRows = newVisible2;
      const parentIdx2 = newVisible2.findIndex((r) => r.item.id === id);
      if (parentIdx2 === -1) {
        this._fullRebuild();
        return;
      }
      const parentLevel = newVisible2[parentIdx2].level;
      const pivot = parentRowEl.nextSibling;
      const fragment = document.createDocumentFragment();
      for (let i = parentIdx2 + 1; i < newVisible2.length; i++) {
        const r = newVisible2[i];
        if (r.level <= parentLevel) break;
        this._purgeDyingRow(r.item.id);
        fragment.appendChild(this._buildRowEl(r, i));
        const childIsAsync = this._asyncLoadingSet.has(r.item.id) || !!r.item.isAsyncLoading;
        const childIsEmpty = r.isExpanded && Array.isArray(r.item.children) && r.item.children.length === 0 && !childIsAsync;
        if (childIsAsync) {
          fragment.appendChild(this._buildBodyEl(r.item, "loader"));
        } else if (childIsEmpty) {
          fragment.appendChild(this._buildBodyEl(r.item, "empty"));
        }
      }
      if (fragment.firstChild) {
        group.insertBefore(fragment, pivot);
      }
      this._setupTreeNav(newVisible2);
      return;
    }
    parentRowEl.classList.remove("arvo-tree__item--empty");
    parentRowEl.classList.remove("arvo-tree__item--async-loading");
    parentRowEl.removeAttribute("aria-busy");
    const leaving = [];
    const existingBody = this._findRowBody(parentRowEl, id);
    if (existingBody) {
      const bodyOwnerId = id;
      leaving.push({
        el: existingBody,
        cleanup: () => {
          existingBody.remove();
          this._destroyBodyInstance(bodyOwnerId);
        }
      });
    }
    const oldVisible = this._lastVisibleRows;
    const parentIdx = oldVisible.findIndex((r) => r.item.id === id);
    if (parentIdx !== -1) {
      const parentLevel = oldVisible[parentIdx].level;
      for (let i = parentIdx + 1; i < oldVisible.length; i++) {
        const r = oldVisible[i];
        if (r.level <= parentLevel) break;
        const rowEl = this._rowMap.get(r.item.id);
        const rowItemId = r.item.id;
        const childBody = rowEl ? this._findRowBody(rowEl, rowItemId) : null;
        if (rowEl) {
          this._rowMap.delete(rowItemId);
          this._dataMap.delete(rowItemId);
          leaving.push({
            el: rowEl,
            cleanup: () => {
              rowEl.remove();
              this._destroyRowInstances(rowItemId);
            }
          });
        } else {
          this._destroyRowInstances(rowItemId);
          this._rowMap.delete(rowItemId);
          this._dataMap.delete(rowItemId);
        }
        if (childBody) {
          leaving.push({
            el: childBody,
            cleanup: () => {
              childBody.remove();
            }
          });
        }
      }
    }
    this._animateExitBatch(leaving);
    const newVisible = buildVisibleRows(this._items, this._expandedSet);
    this._lastVisibleRows = newVisible;
    this._setupTreeNav(newVisible);
  }
  /**
   * Resolve an async-load: clear the row's loading chrome and remove
   * the loader body sibling (if any). Called by `_setExpansion` from
   * the `Promise.finally` once the consumer's `onLoadChildren`
   * settles. The consumer is responsible for committing the resolved
   * children via `updateItem(id, { children: loaded })` -- once they
   * do, `_fullRebuild` (or the surgical update we may add later)
   * renders the children. This method only handles the loader
   * lifecycle so the row's other inner instances stay intact.
   */
  _resolveAsyncLoad(item) {
    const id = item.id;
    const parentRowEl = this._rowMap.get(id);
    if (!parentRowEl) return;
    parentRowEl.classList.remove("arvo-tree__item--async-loading");
    parentRowEl.removeAttribute("aria-busy");
    const loaderEl = this._findRowBody(parentRowEl, id);
    if (loaderEl && loaderEl.getAttribute("data-arvo-loader-for") === id) {
      this._animateExit(loaderEl, () => {
        loaderEl.remove();
        this._destroyBodyInstance(id);
      });
    }
    this._lastVisibleRows = buildVisibleRows(this._items, this._expandedSet);
    this._setupTreeNav(this._lastVisibleRows);
  }
  _buildRowEl(row, index) {
    const item = row.item;
    const hasResolvedChildren = item.children !== null && item.children !== void 0;
    const isAsync = hasResolvedChildren ? !!item.isAsyncLoading : this._asyncLoadingSet.has(item.id) || !!item.isAsyncLoading;
    const isEmptyParent = row.isExpanded && Array.isArray(item.children) && item.children.length === 0 && !isAsync;
    const isRowDisabled = !!item.isDisabled || !!this._options.isDisabled;
    const rowSelectable = isItemSelectable(item);
    const isRowSelected = rowSelectable && this._selectedSet.has(item.id);
    const isRowFocused = this._activeIndex === index;
    const rowEl = document.createElement("div");
    rowEl.id = `${this._id}-row-${item.id}`;
    rowEl.className = "arvo-tree__item";
    rowEl.setAttribute("role", "treeitem");
    this._rowMap.set(item.id, rowEl);
    this._dataMap.set(item.id, item);
    rowEl.tabIndex = isRowFocused ? 0 : -1;
    rowEl.setAttribute("aria-level", String(row.level + 1));
    rowEl.setAttribute("aria-setsize", String(row.setSize));
    rowEl.setAttribute("aria-posinset", String(row.posInSet));
    if (row.hasChildren) {
      rowEl.setAttribute("aria-expanded", String(row.isExpanded));
    }
    if (this._options.rowInteraction === "select" && rowSelectable && !isRowDisabled) {
      rowEl.setAttribute("aria-selected", String(isRowSelected));
    }
    if (this._options.selectionMode === "multiple" && rowSelectable) {
      const checked = computeMultiAriaChecked(item, isRowSelected, this._selectedSet);
      rowEl.setAttribute(
        "aria-checked",
        checked === "mixed" ? "mixed" : String(checked)
      );
    }
    if (isRowDisabled) rowEl.setAttribute("aria-disabled", "true");
    if (isAsync || item.isLoading) rowEl.setAttribute("aria-busy", "true");
    if (item.ariaLabel) rowEl.setAttribute("aria-label", item.ariaLabel);
    const isActive = !!item.isActive;
    const hasSearchMatch = item.isSearchMatch !== void 0 ? item.isSearchMatch : labelMatchesQuery(item.label, this._options.searchQuery);
    if (isRowSelected) rowEl.classList.add("selected");
    if (isActive) rowEl.classList.add("arvo-tree__item--active");
    if (isRowDisabled) rowEl.classList.add("is-disabled");
    if (item.isLoading) rowEl.classList.add("loading");
    if (item.isEmphasized) rowEl.classList.add("arvo-tree__item--emphasized");
    if (item.appearance === "strong") rowEl.classList.add("arvo-tree__item--strong");
    if (item.isHighlighted) rowEl.classList.add("arvo-tree__item--highlighted");
    if (hasSearchMatch) rowEl.classList.add("arvo-tree__item--search-highlight");
    if (row.isExpanded) rowEl.classList.add("arvo-tree__item--expanded");
    if (isAsync) rowEl.classList.add("arvo-tree__item--async-loading");
    if (isEmptyParent) rowEl.classList.add("arvo-tree__item--empty");
    if (this._reorderingId === item.id) rowEl.classList.add("is-grab-active");
    if (item.ariaCurrent != null) {
      rowEl.setAttribute("aria-current", String(item.ariaCurrent));
    } else if (isActive) {
      rowEl.setAttribute(
        "aria-current",
        this._options.rowInteraction === "navigate" ? "page" : "true"
      );
    }
    const visualLevel = Math.min(row.level, this._options.maxVisualLevel - 1);
    for (let i = 0; i < visualLevel; i++) {
      const c = document.createElement("span");
      c.className = "arvo-tree__connector";
      const isLastVisibleSlot = i === visualLevel - 1;
      if (isLastVisibleSlot) {
        c.classList.add(
          row.isLastChild ? "arvo-tree__connector--end" : "arvo-tree__connector--elbow"
        );
      } else if (row.ancestorIsLastFlags[i]) {
        c.classList.add("arvo-tree__connector--empty");
      }
      c.setAttribute("aria-hidden", "true");
      rowEl.appendChild(c);
    }
    if (this._options.isReorderable && item.hasDragHandle !== false && !this._options.isReadOnly) {
      const dh = document.createElement("span");
      dh.className = "arvo-tree__drag";
      dh.setAttribute("data-tree-stop", "");
      const btnEl = document.createElement("button");
      btnEl.type = "button";
      dh.appendChild(btnEl);
      const dragBtn = IconButton.ArvoIconButton.initialize(btnEl, {
        icon: "drag-handle",
        size: "xs",
        variant: "tertiary",
        tooltip: this._reorderingId === item.id ? `Drop ${item.label}` : `Reorder ${item.label}`,
        isDisabled: isRowDisabled
      });
      btnEl.setAttribute("tabindex", "-1");
      btnEl.setAttribute(
        "aria-pressed",
        String(this._reorderingId === item.id)
      );
      btnEl.addEventListener("click", (e) => {
        e.stopPropagation();
        this._handleDragHandleClick(item, e);
      });
      rowEl.appendChild(dh);
      this._pushRowInstance(item.id, dragBtn);
    }
    if (row.hasChildren) {
      const chev = document.createElement("span");
      chev.className = "arvo-tree__chevron";
      chev.setAttribute("data-tree-stop", "");
      const btnEl = document.createElement("button");
      btnEl.type = "button";
      chev.appendChild(btnEl);
      const btn = IconButton.ArvoIconButton.initialize(btnEl, {
        icon: "angle-right",
        size: "xs",
        variant: "tertiary",
        tooltip: row.isExpanded ? `Collapse ${item.label}` : `Expand ${item.label}`,
        isDisabled: isRowDisabled
      });
      btnEl.setAttribute("tabindex", "-1");
      btnEl.addEventListener("click", (e) => {
        e.stopPropagation();
        this._setExpansion(item, !this._expandedSet.has(item.id));
      });
      rowEl.appendChild(chev);
      this._pushRowInstance(item.id, btn);
    } else {
      const c = document.createElement("span");
      c.className = "arvo-tree__connector arvo-tree__connector--elbow";
      c.setAttribute("aria-hidden", "true");
      rowEl.appendChild(c);
    }
    if (this._options.selectionMode === "multiple" && rowSelectable) {
      const ck = document.createElement("span");
      ck.className = "arvo-tree__check";
      ck.setAttribute("data-tree-stop", "");
      ck.setAttribute("aria-hidden", "true");
      const ckHost = document.createElement("div");
      ck.appendChild(ckHost);
      rowEl.appendChild(ck);
      const checkedState = computeMultiAriaChecked(
        item,
        isRowSelected,
        this._selectedSet
      );
      const cb = Checkbox.ArvoCheckbox.initialize(ckHost, {
        isChecked: isRowSelected,
        isIndeterminate: checkedState === "mixed",
        isDisabled: isRowDisabled,
        label: null,
        onChange: () => this._toggleSelection(item)
      });
      this._pushRowInstance(item.id, cb);
    }
    const content = document.createElement("span");
    content.className = "arvo-tree__content";
    rowEl.appendChild(content);
    if (item.icon) {
      const ico = document.createElement("span");
      ico.className = `arvo-tree__icon o9con o9con-${item.icon}`;
      ico.setAttribute("aria-hidden", "true");
      content.appendChild(ico);
    }
    const lbl = document.createElement("span");
    lbl.className = "arvo-tree__label";
    const parts = buildMatchParts(item.label, this._options.searchQuery);
    parts.forEach((p) => {
      if (p.isMatch) {
        const span = document.createElement("span");
        span.className = "arvo-tree__label-match";
        span.textContent = p.text;
        lbl.appendChild(span);
      } else {
        lbl.appendChild(document.createTextNode(p.text));
      }
    });
    content.appendChild(lbl);
    const meta = normalizeMeta(item.meta);
    if (meta) {
      const metaWrap = document.createElement("span");
      metaWrap.className = "arvo-tree__meta";
      metaWrap.setAttribute("aria-hidden", "true");
      if (meta.icon) {
        const mi = document.createElement("span");
        mi.className = `arvo-tree__meta-icon o9con o9con-${meta.icon}`;
        metaWrap.appendChild(mi);
      }
      if (meta.text) {
        const mt = document.createElement("span");
        mt.className = "arvo-tree__meta-text";
        mt.textContent = meta.text;
        metaWrap.appendChild(mt);
      }
      content.appendChild(metaWrap);
    }
    const rowActions = this._options.isReadOnly ? null : item.actions ?? this._options.actions ?? null;
    const showsOverflow = !!this._options.contextMenu && item.hasOverflowMenu === true && !isRowDisabled && !this._options.isReadOnly;
    if ((rowActions && rowActions.length > 0 || showsOverflow) && !isRowDisabled) {
      const actionsWrap = document.createElement("span");
      actionsWrap.className = "arvo-tree__actions";
      actionsWrap.setAttribute("data-tree-stop", "");
      rowActions == null ? void 0 : rowActions.forEach((action) => {
        const aBtn = document.createElement("button");
        aBtn.type = "button";
        const ab = IconButton.ArvoIconButton.initialize(aBtn, {
          icon: action.icon,
          size: "xs",
          variant: "tertiary",
          tooltip: action.ariaLabel,
          isDisabled: action.isDisabled ?? false
        });
        aBtn.setAttribute("tabindex", "-1");
        aBtn.addEventListener("click", (e) => {
          var _a;
          e.stopPropagation();
          (_a = action.onClick) == null ? void 0 : _a.call(action, item, e);
        });
        actionsWrap.appendChild(aBtn);
        this._pushRowInstance(item.id, ab);
      });
      if (showsOverflow) {
        const ovBtn = document.createElement("button");
        ovBtn.type = "button";
        const ovInst = IconButton.ArvoIconButton.initialize(ovBtn, {
          icon: "more-vertical",
          size: "xs",
          variant: "tertiary",
          tooltip: "More actions"
        });
        ovBtn.setAttribute("tabindex", "-1");
        ovBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this._openContextMenu(item, rowEl, "overflow");
        });
        actionsWrap.appendChild(ovBtn);
        this._pushRowInstance(item.id, ovInst);
      }
      content.appendChild(actionsWrap);
    }
    if (item.badge != null) {
      const bw = document.createElement("span");
      bw.className = "arvo-tree__badge";
      bw.setAttribute("data-tree-stop", "");
      const bh = document.createElement("span");
      bw.appendChild(bh);
      rowEl.appendChild(bw);
      const bopts = typeof item.badge === "string" || typeof item.badge === "number" ? { variant: "counter", counterMode: "single", count: Number(item.badge) } : item.badge;
      const b = Badge.ArvoBadge.initialize(bh, bopts);
      this._pushRowInstance(item.id, b);
    }
    if (item.isLoading) {
      const sk = document.createElement("div");
      sk.className = "arvo-tree__skeleton-row";
      sk.setAttribute("aria-hidden", "true");
      const sIco = document.createElement("span");
      sIco.className = "arvo-tree__skeleton-icon";
      const sTxt = document.createElement("span");
      sTxt.className = "arvo-tree__skeleton-text";
      sk.append(sIco, sTxt);
      rowEl.appendChild(sk);
    }
    if (this._options.contextMenu && !isRowDisabled && !this._options.isReadOnly) {
      rowEl.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        this._openContextMenu(item, rowEl, "mouse");
      });
    }
    rowEl.addEventListener("click", (e) => {
      var _a, _b;
      if (this._options.isDisabled || isRowDisabled || this._options.isLoading) return;
      const target = e.target;
      if (target.closest("[data-tree-stop]")) return;
      this._activeIndex = index;
      const mode = this._options.rowInteraction;
      if (mode === "navigate") {
        (_b = (_a = this._options).onNavigate) == null ? void 0 : _b.call(_a, item, e);
        return;
      }
      const effectiveMode = mode === "select" && !rowSelectable ? "expand" : mode;
      if (effectiveMode === "expand") {
        if (hasChildrenShape(item)) {
          this._setExpansion(item, !this._expandedSet.has(item.id));
        }
        return;
      }
      this._toggleSelection(item);
    });
    return rowEl;
  }
  /**
   * Build the empty / loader body element that sits as a SIBLING of an
   * async-loading or empty parent row inside `__group`. Identified by a
   * `data-arvo-empty-for` / `data-arvo-loader-for` attribute pointing at
   * the row's item id so surgical helpers can locate + remove the body
   * in O(1) without touching the parent row's DOM. The body's inner
   * ArvoLoader / ArvoEmptyState instance is registered under the parent
   * row's id so it is destroyed alongside the row when the row leaves
   * the visible set.
   */
  _buildBodyEl(item, kind) {
    var _a, _b;
    this._destroyBodyInstance(item.id);
    if (kind === "loader") {
      const ld = document.createElement("div");
      ld.className = "arvo-tree__loader";
      ld.setAttribute("data-arvo-loader-for", item.id);
      ld.setAttribute("aria-hidden", "true");
      const loader = Loader.ArvoLoader.initialize(ld, {
        variant: "dot",
        size: "sm",
        orientation: "horizontal"
      });
      this._bodyInstanceByRow.set(item.id, loader);
      return ld;
    }
    const em = document.createElement("div");
    em.className = "arvo-tree__empty";
    em.setAttribute("data-arvo-empty-for", item.id);
    em.setAttribute("aria-hidden", "true");
    const empty = EmptyState.ArvoEmptyState.initialize(em, {
      illustration: ((_a = this._options.emptyConfig) == null ? void 0 : _a.illustration) ?? "no-data",
      message: ((_b = this._options.emptyConfig) == null ? void 0 : _b.message) ?? "No Items Available",
      size: "xs",
      orientation: "horizontal"
    });
    this._bodyInstanceByRow.set(item.id, empty);
    return em;
  }
  /** Destroy the body inner instance (if any) registered under `id`. */
  _destroyBodyInstance(id) {
    const inst = this._bodyInstanceByRow.get(id);
    if (!inst) return;
    try {
      inst.destroy();
    } catch {
    }
    this._bodyInstanceByRow.delete(id);
  }
  /**
   * Find the empty / loader body element currently rendered as the next
   * sibling of `rowEl` (if any). Returns `null` when the row has no
   * attached body. Used by the surgical helpers to locate the body
   * without re-walking `__group`.
   */
  _findRowBody(rowEl, rowItemId) {
    const sibling = rowEl.nextElementSibling;
    if (!sibling) return null;
    if (sibling.getAttribute("data-arvo-empty-for") === rowItemId || sibling.getAttribute("data-arvo-loader-for") === rowItemId) {
      return sibling;
    }
    return null;
  }
  /**
   * Instantly remove any leftover dying DOM element belonging to the
   * given row id. Used by the surgical expand path so a rapid
   * collapse -> expand sequence does not leave the dying copy in the
   * document (which would collide with the freshly-inserted row's id
   * and confuse `_focusActiveRow` / accessibility tools). Cancels any
   * pending exit animation by removing the node outright. The matching
   * body sibling (if any) is also cleared.
   *
   * Avoids `CSS.escape` (unavailable in some non-browser environments
   * such as the jsdom test runner) by scanning the small set of
   * currently-leaving elements with an attribute selector.
   */
  _purgeDyingRow(rowItemId) {
    const targetId = `${this._id}-row-${rowItemId}`;
    const dying = this._element.querySelectorAll(
      '[data-arvo-leaving="true"]'
    );
    for (const node of Array.from(dying)) {
      if (node.id !== targetId) continue;
      const dyingBody = node.nextElementSibling;
      if ((dyingBody == null ? void 0 : dyingBody.getAttribute("data-arvo-leaving")) === "true" && (dyingBody.getAttribute("data-arvo-empty-for") === rowItemId || dyingBody.getAttribute("data-arvo-loader-for") === rowItemId)) {
        dyingBody.remove();
      }
      node.remove();
      this._destroyRowInstances(rowItemId);
      break;
    }
  }
  /**
   * Instantly remove a leaving body sibling for the given row id (the
   * row itself is still alive). Used by the surgical expand path so
   * a rapid collapse -> re-expand of an empty / async parent doesn't
   * end up with a half-faded ghost body next to the row.
   */
  _purgeDyingBody(rowItemId) {
    const parentRowEl = this._rowMap.get(rowItemId);
    if (!parentRowEl) return;
    const body = this._findRowBody(parentRowEl, rowItemId);
    if (body && body.getAttribute("data-arvo-leaving") === "true") {
      body.remove();
      this._destroyBodyInstance(rowItemId);
    }
  }
  // -- Selection / expansion ------------------------------------------------
  _toggleSelection(item) {
    var _a, _b;
    if (this._options.isDisabled || item.isDisabled) return;
    if (!isItemSelectable(item)) return;
    const isSelected = this._selectedSet.has(item.id);
    let next;
    let nextSet;
    if (this._options.selectionMode === "single") {
      next = isSelected ? [] : [item.id];
      nextSet = new Set(next);
    } else {
      nextSet = new Set(this._selectedSet);
      const targets = [item.id, ...collectEligibleDescendantIds(item)];
      if (isSelected) {
        for (const t of targets) nextSet.delete(t);
      } else {
        for (const t of targets) nextSet.add(t);
      }
      next = Array.from(nextSet);
    }
    const cancelled = !this._dispatchEvent("tree:select", {
      ids: next,
      item,
      isSelected: !isSelected
    });
    if (cancelled) return;
    if (!this._isControlledSelection) {
      this._selectedSet = nextSet;
    }
    (_b = (_a = this._options).onSelectionChange) == null ? void 0 : _b.call(_a, next, {
      item,
      isSelected: !isSelected
    });
    this._renderSelectionChange();
  }
  _setExpansion(item, willExpand) {
    var _a, _b;
    if (this._options.isDisabled || item.isDisabled || !hasChildrenShape(item))
      return;
    if (willExpand === this._expandedSet.has(item.id)) return;
    const newSet = new Set(this._expandedSet);
    if (willExpand) newSet.add(item.id);
    else newSet.delete(item.id);
    const next = Array.from(newSet);
    const cancelled = !this._dispatchEvent("tree:expand", {
      ids: next,
      item,
      isExpanded: willExpand
    });
    if (cancelled) return;
    if (!this._isControlledExpansion) {
      this._expandedSet = newSet;
    }
    (_b = (_a = this._options).onExpandedChange) == null ? void 0 : _b.call(_a, next, { item, isExpanded: willExpand });
    const isAsyncLoad = willExpand && item.children === null && this._options.onLoadChildren && !this._asyncLoadingSet.has(item.id);
    if (isAsyncLoad) {
      const proceed = this._dispatchEvent("tree:loadchildren", { item });
      if (!proceed) {
        if (!this._isControlledExpansion) {
          this._expandedSet.delete(item.id);
        }
        return;
      }
      this._asyncLoadingSet.add(item.id);
      Promise.resolve(this._options.onLoadChildren(item)).catch(() => {
      }).finally(() => {
        this._asyncLoadingSet.delete(item.id);
        this._resolveAsyncLoad(item);
      });
      this._renderExpansionChange(item, true);
      return;
    }
    this._renderExpansionChange(item, willExpand);
  }
  // -- Keyboard navigation --------------------------------------------------
  _setupTreeNav(visible) {
    if (this._treeNav) {
      this._treeNav.destroy();
      this._treeNav = null;
    }
    if (this._options.isDisabled || this._options.isLoading) return;
    const items = visible.map((r) => {
      const id = `${this._id}-row-${r.item.id}`;
      return document.getElementById(id) ?? document.createElement("span");
    });
    if (this._activeIndex >= items.length) {
      this._activeIndex = Math.max(0, items.length - 1);
    }
    this._treeNav = core.createTreeNav({
      items,
      getRowMeta: (i) => {
        const r = visible[i];
        return {
          hasChildren: (r == null ? void 0 : r.hasChildren) ?? false,
          isExpanded: (r == null ? void 0 : r.isExpanded) ?? false,
          isDisabled: (r == null ? void 0 : r.item.isDisabled) === true || this._options.isDisabled,
          level: (r == null ? void 0 : r.level) ?? 0
        };
      },
      onNavigate: (_el, index) => {
        this._activeIndex = index;
        this._focusActiveRow();
      },
      onSelect: (_el, index) => {
        const r = visible[index];
        if (!r) return;
        if (!isItemSelectable(r.item)) return;
        if (this._options.selectionMode === "multiple" || this._options.rowInteraction === "select") {
          this._toggleSelection(r.item);
        }
      },
      onExpand: (index) => {
        const r = visible[index];
        if (r) this._setExpansion(r.item, true);
      },
      onCollapse: (index) => {
        const r = visible[index];
        if (r) this._setExpansion(r.item, false);
      },
      typeAhead: { getLabel: (i) => {
        var _a;
        return ((_a = visible[i]) == null ? void 0 : _a.item.label) ?? "";
      } }
    });
  }
  _focusActiveRow() {
    const visible = buildVisibleRows(this._items, this._expandedSet);
    const r = visible[this._activeIndex];
    if (!r) return;
    const id = `${this._id}-row-${r.item.id}`;
    const rowEl = document.getElementById(id);
    if (rowEl) {
      this._element.querySelectorAll('[role="treeitem"]').forEach((el) => {
        el.tabIndex = el === rowEl ? 0 : -1;
      });
      rowEl.focus();
      if (typeof rowEl.scrollIntoView === "function") {
        rowEl.scrollIntoView({ block: "nearest" });
      }
    }
  }
  // -- Reorder mode ---------------------------------------------------------
  _announce(msg) {
    if (this._liveRegionEl) this._liveRegionEl.textContent = msg;
  }
  /**
   * A9 -- open the configured context menu at the given row. Resolves
   * per-row items if `contextMenu` is a function. Reuses a single
   * ArvoActionMenu instance for the lifetime of the tree; destroys
   * and re-creates only when items differ from the previous open.
   */
  _openContextMenu(item, rowEl, trigger) {
    var _a, _b, _c;
    const cfg = this._options.contextMenu;
    if (!cfg || item.isDisabled || this._options.isDisabled) return;
    if (this._options.isReadOnly) return;
    const items = typeof cfg === "function" ? cfg(item) : cfg;
    if (!items || Array.isArray(items) && items.length === 0) return;
    (_b = (_a = this._options).onContextMenu) == null ? void 0 : _b.call(_a, item, trigger);
    (_c = this._contextMenu) == null ? void 0 : _c.destroy();
    this._contextTriggerEl = rowEl;
    this._contextItemId = item.id;
    this._contextMenu = ActionMenu.ArvoActionMenu.initialize(rowEl, {
      items,
      placement: "bottom-start",
      onOpenChange: (isOpen) => {
        if (isOpen) return;
        const focusTarget = this._contextTriggerEl;
        this._contextItemId = null;
        if (focusTarget) focusTarget.focus();
      }
    });
    requestAnimationFrame(() => {
      var _a2;
      (_a2 = this._contextMenu) == null ? void 0 : _a2.open();
    });
  }
  _findItemLocation(id) {
    const walk = (siblings, parent) => {
      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i].id === id) {
          return { parent, parentChildren: siblings, index: i };
        }
        if (Array.isArray(siblings[i].children)) {
          const found = walk(siblings[i].children, siblings[i]);
          if (found) return found;
        }
      }
      return null;
    };
    return walk(this._items, null);
  }
  _enterReorderMode(item) {
    if (!this._options.isReorderable || item.isDisabled || this._options.isDisabled)
      return;
    this._reorderingId = item.id;
    this._announce(
      `Picked up ${item.label}. Use Up and Down to move, Enter to drop, Escape to cancel.`
    );
    const rowEl = this._rowMap.get(item.id);
    if (rowEl) {
      rowEl.classList.add("is-grab-active");
      const dragBtn = rowEl.querySelector(
        ".arvo-tree__drag button"
      );
      dragBtn == null ? void 0 : dragBtn.setAttribute("aria-pressed", "true");
    }
  }
  _cancelReorderMode() {
    if (this._reorderingId == null) return;
    const id = this._reorderingId;
    this._reorderingId = null;
    this._announce("Move cancelled.");
    const rowEl = this._rowMap.get(id);
    if (rowEl) {
      rowEl.classList.remove("is-grab-active");
      const dragBtn = rowEl.querySelector(
        ".arvo-tree__drag button"
      );
      dragBtn == null ? void 0 : dragBtn.setAttribute("aria-pressed", "false");
    }
  }
  _commitReorder(item, fromParentId, fromIndex, toParentId, toIndex, toLen, position = "before") {
    var _a, _b;
    const ctx = {
      item,
      fromParentId,
      fromIndex,
      toParentId,
      toIndex,
      position
    };
    if (this._options.canMoveItem && this._options.canMoveItem(ctx) === false) {
      this._announce("Move not allowed.");
      return false;
    }
    const cancelled = !this._dispatchEvent("tree:reorder", ctx);
    if (cancelled) return false;
    const result = (_b = (_a = this._options).onReorder) == null ? void 0 : _b.call(_a, ctx);
    if (result === false) return false;
    this._announce(
      `Moved ${item.label} to position ${toIndex + 1} of ${toLen}.`
    );
    return true;
  }
  _handleDragHandleClick(item, ev) {
    var _a, _b, _c;
    if (this._reorderingId === item.id) {
      this._announce(`${item.label} dropped.`);
      this._reorderingId = null;
      const rowEl = this._rowMap.get(item.id);
      if (rowEl) {
        rowEl.classList.remove("is-grab-active");
        const dragBtn = rowEl.querySelector(
          ".arvo-tree__drag button"
        );
        dragBtn == null ? void 0 : dragBtn.setAttribute("aria-pressed", "false");
      }
    } else if (this._reorderingId != null) {
      const dragged = findItemById(this._items, this._reorderingId);
      const draggedLoc = this._findItemLocation(this._reorderingId);
      const targetLoc = this._findItemLocation(item.id);
      if (dragged && draggedLoc && targetLoc) {
        let position = "after";
        let toParentId = ((_a = targetLoc.parent) == null ? void 0 : _a.id) ?? null;
        let toIndex = targetLoc.index + 1;
        let toLen = targetLoc.parentChildren.length;
        const targetRow = (_b = ev == null ? void 0 : ev.currentTarget) == null ? void 0 : _b.closest('[role="treeitem"]');
        const rect = targetRow == null ? void 0 : targetRow.getBoundingClientRect();
        if (rect && ev) {
          const localY = ev.clientY - rect.top;
          const third = rect.height / 3;
          const targetItem = targetLoc.parentChildren[targetLoc.index];
          const targetIsParent = Array.isArray(targetItem.children) && targetItem.children;
          if (localY < third) {
            position = "before";
            toIndex = targetLoc.index;
          } else if (localY > rect.height - third) {
            position = "after";
            toIndex = targetLoc.index + 1;
          } else if (targetIsParent) {
            position = "inside";
            toParentId = targetItem.id;
            toIndex = targetItem.children.length;
            toLen = toIndex;
          } else {
            position = "after";
            toIndex = targetLoc.index + 1;
          }
        }
        this._commitReorder(
          dragged,
          ((_c = draggedLoc.parent) == null ? void 0 : _c.id) ?? null,
          draggedLoc.index,
          toParentId,
          toIndex,
          toLen,
          position
        );
      }
      this._reorderingId = null;
      this._fullRebuild();
    } else {
      this._enterReorderMode(item);
    }
  }
  /**
   * Programmatically move a row. Dispatches `tree:reorder`. Optional
   * `position` defaults to `'before'`.
   */
  move(id, target) {
    var _a;
    const from = this._findItemLocation(id);
    if (!from) return;
    const item = from.parentChildren[from.index];
    let toLen;
    if (target.parentId == null) {
      toLen = this._items.length;
    } else {
      const tp = findItemById(this._items, target.parentId);
      if (!tp || !Array.isArray(tp.children)) return;
      toLen = tp.children.length;
    }
    this._commitReorder(
      item,
      ((_a = from.parent) == null ? void 0 : _a.id) ?? null,
      from.index,
      target.parentId,
      target.index,
      toLen,
      target.position ?? "before"
    );
  }
  _bindEvents() {
    this._element.addEventListener("keydown", this._onKeyDown);
  }
  _unbindEvents() {
    this._element.removeEventListener("keydown", this._onKeyDown);
    if (this._treeNav) {
      this._treeNav.destroy();
      this._treeNav = null;
    }
    this._destroyInnerInstances();
  }
  /**
   * Tear down every mounted inner instance (per-row + body + tree-level).
   * Called from `_fullRebuild` and `destroy()`. Surgical updates use
   * the more targeted `_destroyRowInstances(id)` / `_destroyBodyInstance(id)`
   * so they only touch the rows / bodies that are actually leaving
   * the visible set.
   */
  _destroyInnerInstances() {
    for (const insts of this._innerInstancesByRow.values()) {
      for (const inst of insts) {
        try {
          inst.destroy();
        } catch {
        }
      }
    }
    this._innerInstancesByRow.clear();
    for (const inst of this._bodyInstanceByRow.values()) {
      try {
        inst.destroy();
      } catch {
      }
    }
    this._bodyInstanceByRow.clear();
    for (const inst of this._innerInstancesTreeLevel) {
      try {
        inst.destroy();
      } catch {
      }
    }
    this._innerInstancesTreeLevel = [];
  }
  /**
   * Destroy the inner instances mounted inside a single row (chevron,
   * drag handle, checkbox, badge, inline actions). Does NOT touch the
   * body instance for the same row -- use `_destroyBodyInstance(id)`
   * for that. This split lets `_resolveAsyncLoad` tear down the
   * loader body without disturbing the parent row's still-needed
   * inner instances.
   */
  _destroyRowInstances(id) {
    const insts = this._innerInstancesByRow.get(id);
    if (insts) {
      for (const inst of insts) {
        try {
          inst.destroy();
        } catch {
        }
      }
      this._innerInstancesByRow.delete(id);
    }
    this._destroyBodyInstance(id);
  }
  /** Register an inner instance under the row id that owns it. */
  _pushRowInstance(id, inst) {
    let arr = this._innerInstancesByRow.get(id);
    if (!arr) {
      arr = [];
      this._innerInstancesByRow.set(id, arr);
    }
    arr.push(inst);
  }
  _dispatchEvent(name, detail) {
    const ev = new CustomEvent(name, {
      bubbles: true,
      cancelable: true,
      detail
    });
    return this._element.dispatchEvent(ev);
  }
};
_ArvoTreeView._ANIMATION_BUDGET = 120;
_ArvoTreeView._EXIT_DURATION_MS = 200;
let ArvoTreeView = _ArvoTreeView;
exports.ArvoTreeView = ArvoTreeView;
//# sourceMappingURL=TreeView.cjs.map
