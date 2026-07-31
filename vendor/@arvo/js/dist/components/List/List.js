import { createSortableList, nextSelectionForRangeShift, aggregateSelectionState } from "@arvo/core";
import { attachTitleTruncationTooltip } from "@arvo/utils";
import { ArvoIconButton } from "../IconButton/IconButton.js";
import { ArvoCheckbox } from "../Checkbox/Checkbox.js";
import { ArvoRadio } from "../Radio/Radio.js";
import { ArvoBadge } from "../Badge/Badge.js";
import { ArvoAvatar } from "../Avatar/Avatar.js";
import { ArvoStatus } from "../Status/Status.js";
import { ArvoEmptyState } from "../EmptyState/EmptyState.js";
const LIST_MAX_ROW_ACTIONS = 4;
function normalizeGroups(items, groups) {
  if (groups && groups.length > 0) return groups.map((g) => ({ ...g }));
  return [{ id: "__default", items }];
}
function selectionToArray(selected) {
  if (Array.isArray(selected)) return [...selected];
  if (typeof selected === "string") return [selected];
  return [];
}
function arrayToSelection(arr, selectionMode) {
  if (selectionMode === "single") return arr[0] ?? null;
  if (selectionMode === "multi") return [...arr];
  return null;
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
function isBadgeFilled(appearance) {
  return appearance === "filled" ? "filled" : "primary";
}
const _ArvoList = class _ArvoList {
  constructor(element, options) {
    this._bodyEl = null;
    this._liveEl = null;
    this._saInst = null;
    this._emptyInst = null;
    this._entries = [];
    this._groupBlocks = [];
    this._selectionAnchorId = null;
    this._activeId = null;
    this._draggingId = null;
    this._sortableHandle = null;
    this._element = element;
    const variant = (options == null ? void 0 : options.variant) && _ArvoList.VARIANTS.includes(options.variant) ? options.variant : _ArvoList.DEFAULTS.variant;
    const selectionMode = (options == null ? void 0 : options.selectionMode) && _ArvoList.SELECTION_MODES.includes(options.selectionMode) ? options.selectionMode : _ArvoList.DEFAULTS.selectionMode;
    this._options = {
      ..._ArvoList.DEFAULTS,
      ...options,
      variant,
      selectionMode,
      items: (options == null ? void 0 : options.items) ? options.items.map((i) => ({ ...i })) : [],
      groups: (options == null ? void 0 : options.groups) ? options.groups.map((g) => ({ ...g, items: g.items.map((i) => ({ ...i })) })) : null,
      selectedIds: selectionToArray(options == null ? void 0 : options.selectedIds),
      excludedIds: (options == null ? void 0 : options.excludedIds) ? [...options.excludedIds] : [],
      emptyState: (options == null ? void 0 : options.emptyState) ?? null,
      searchQuery: (options == null ? void 0 : options.searchQuery) ?? null,
      width: (options == null ? void 0 : options.width) ?? null,
      ariaLabel: (options == null ? void 0 : options.ariaLabel) ?? null,
      onSelectionChange: (options == null ? void 0 : options.onSelectionChange) ?? null,
      onExclusionChange: (options == null ? void 0 : options.onExclusionChange) ?? null,
      onItemClick: (options == null ? void 0 : options.onItemClick) ?? null,
      onItemActivate: (options == null ? void 0 : options.onItemActivate) ?? null,
      onReorder: (options == null ? void 0 : options.onReorder) ?? null,
      onReorderCancel: (options == null ? void 0 : options.onReorderCancel) ?? null,
      onItemContextMenu: (options == null ? void 0 : options.onItemContextMenu) ?? null
    };
    this._boundHandleKeyDown = this._handleKeyDown.bind(this);
    this._render();
    this._bindEvents();
  }
  static initialize(element, options) {
    return new _ArvoList(element, options);
  }
  // ===========================================================================
  // Rendering
  // ===========================================================================
  _flatItems() {
    if (this._options.groups) return this._options.groups.flatMap((g) => g.items);
    return this._options.items;
  }
  _enabledIds() {
    return this._flatItems().filter((i) => !i.isDisabled).map((i) => i.id);
  }
  _resolveTabStopId() {
    const enabled = this._enabledIds();
    if (this._activeId && enabled.includes(this._activeId)) return this._activeId;
    for (const id of this._options.selectedIds) {
      if (enabled.includes(id)) return id;
    }
    return enabled[0] ?? null;
  }
  _render() {
    var _a;
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    this._destroyInstances({ preserveLiveRegion: true });
    this._entries = [];
    this._groupBlocks = [];
    (_a = this._sortableHandle) == null ? void 0 : _a.destroy();
    this._sortableHandle = null;
    const opts = this._options;
    el.classList.add(
      "arvo-list",
      `arvo-list--${opts.variant}`,
      `arvo-list--${opts.selectionMode}`
    );
    el.classList.toggle("arvo-list--reorderable", !!opts.isReorderable);
    el.classList.toggle("arvo-list--actions-always", opts.actionsVisibility === "always");
    el.classList.toggle("is-disabled", !!opts.isDisabled);
    const rootRole = opts.selectionMode === "multi" ? "listbox" : opts.selectionMode === "single" ? "radiogroup" : "list";
    el.setAttribute("role", rootRole);
    if (opts.selectionMode === "multi") el.setAttribute("aria-multiselectable", "true");
    else el.removeAttribute("aria-multiselectable");
    if (opts.isDisabled) el.setAttribute("aria-disabled", "true");
    else el.removeAttribute("aria-disabled");
    if (opts.ariaLabel) el.setAttribute("aria-label", opts.ariaLabel);
    if (opts.width) el.style.setProperty("--arvo-list-width", opts.width);
    if (opts.isLoading) {
      this._renderLoading();
      this._renderLiveRegion();
      return;
    }
    const flat = this._flatItems();
    const showEmpty = (opts.isEmpty || flat.length === 0) && !!opts.emptyState;
    if (showEmpty) {
      el.removeAttribute("role");
      el.removeAttribute("aria-multiselectable");
      this._renderEmpty();
      this._renderLiveRegion();
      return;
    }
    el.classList.remove("loading", "is-empty");
    if (opts.hasGlobalSelectAll && opts.selectionMode === "multi") {
      this._renderGlobalSelectAll();
    }
    const groups = normalizeGroups(opts.items, opts.groups);
    const tabStopId = this._resolveTabStopId();
    groups.forEach((group, idx) => {
      if (idx > 0 && opts.hasGroupDividers) {
        const divider = document.createElement("div");
        divider.className = "arvo-list__divider";
        divider.setAttribute("role", "presentation");
        divider.setAttribute("aria-hidden", "true");
        el.appendChild(divider);
      }
      const groupEl = document.createElement("div");
      groupEl.className = "arvo-list__group";
      groupEl.setAttribute("data-arvo-list-group-id", group.id);
      el.appendChild(groupEl);
      if (group.label) {
        const hdr = document.createElement("div");
        hdr.className = "arvo-list__group-hdr";
        hdr.setAttribute("role", "presentation");
        hdr.textContent = group.label;
        groupEl.appendChild(hdr);
      }
      const bodyEl = document.createElement("div");
      bodyEl.className = "arvo-list__group-body";
      groupEl.appendChild(bodyEl);
      let saInst = null;
      if (group.hasSelectAll && opts.selectionMode === "multi") {
        const saRow = document.createElement("div");
        saRow.className = "arvo-list__sa";
        saRow.setAttribute("role", "option");
        saRow.tabIndex = -1;
        if (opts.isReorderable) {
          const spacer = document.createElement("span");
          spacer.className = "arvo-list-item__drag-spacer";
          spacer.setAttribute("aria-hidden", "true");
          saRow.appendChild(spacer);
        }
        const checkSlot = document.createElement("span");
        checkSlot.className = "arvo-list-item__check";
        const cbHost = document.createElement("div");
        checkSlot.appendChild(cbHost);
        saInst = ArvoCheckbox.initialize(cbHost, {
          isChecked: false,
          isIndeterminate: false,
          isDisabled: opts.isDisabled
        });
        cbHost.setAttribute("aria-hidden", "true");
        cbHost.querySelectorAll("input").forEach((input) => input.setAttribute("tabindex", "-1"));
        const lbl = document.createElement("span");
        lbl.className = "arvo-list__sa__lbl";
        lbl.textContent = opts.globalSelectAllLabel;
        saRow.appendChild(checkSlot);
        saRow.appendChild(lbl);
        saRow.addEventListener("click", () => this._handleGroupSelectAllToggle(group.id));
        saRow.addEventListener("keydown", (e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            this._handleGroupSelectAllToggle(group.id);
          }
        });
        bodyEl.appendChild(saRow);
      }
      this._groupBlocks.push({ group, bodyEl, saInst });
      for (const item of group.items) {
        const entry = this._createItemEntry(item, item.id === tabStopId);
        bodyEl.appendChild(entry.rootEl);
        this._entries.push(entry);
      }
    });
    this._renderLiveRegion();
    this._syncSelectionAttributes();
    this._syncGroupSelectAllStates();
    this._lockActionsWidth();
    this._attachTruncationTooltips();
    this._initSortable();
  }
  _renderLoading() {
    const el = this._element;
    if (!el) return;
    el.classList.add("loading");
    el.setAttribute("aria-busy", "true");
    const skelStack = document.createElement("div");
    skelStack.className = "arvo-list__skeleton";
    skelStack.setAttribute("aria-hidden", "true");
    for (let i = 0; i < this._options.skeletonRows; i += 1) {
      const row = document.createElement("div");
      row.className = "arvo-list__skeleton-row";
      skelStack.appendChild(row);
    }
    el.appendChild(skelStack);
  }
  _renderEmpty() {
    const el = this._element;
    if (!el || !this._options.emptyState) return;
    el.classList.add("is-empty");
    el.classList.remove("loading");
    el.removeAttribute("aria-busy");
    const wrap = document.createElement("div");
    wrap.className = "arvo-list__empty";
    const host = document.createElement("div");
    wrap.appendChild(host);
    const empty = this._options.emptyState;
    this._emptyInst = ArvoEmptyState.initialize(host, {
      size: "md",
      illustration: empty.illustration ?? "no-results-found",
      title: empty.title,
      message: empty.description,
      primaryAction: empty.ctaLabel ? {
        label: empty.ctaLabel,
        variant: "outline",
        onClick: () => {
          var _a;
          return (_a = empty.onCtaClick) == null ? void 0 : _a.call(empty);
        }
      } : void 0
    });
    el.appendChild(wrap);
  }
  _renderGlobalSelectAll() {
    const el = this._element;
    if (!el) return;
    const saRow = document.createElement("div");
    saRow.className = "arvo-list__sa";
    saRow.setAttribute("role", "option");
    saRow.tabIndex = -1;
    if (this._options.isReorderable) {
      const spacer = document.createElement("span");
      spacer.className = "arvo-list-item__drag-spacer";
      spacer.setAttribute("aria-hidden", "true");
      saRow.appendChild(spacer);
    }
    const checkSlot = document.createElement("span");
    checkSlot.className = "arvo-list-item__check";
    const cbHost = document.createElement("div");
    checkSlot.appendChild(cbHost);
    this._saInst = ArvoCheckbox.initialize(cbHost, {
      isChecked: false,
      isIndeterminate: false,
      isDisabled: this._options.isDisabled
    });
    cbHost.setAttribute("aria-hidden", "true");
    cbHost.querySelectorAll("input").forEach((input) => input.setAttribute("tabindex", "-1"));
    const lbl = document.createElement("span");
    lbl.className = "arvo-list__sa__lbl";
    lbl.textContent = this._options.globalSelectAllLabel;
    saRow.appendChild(checkSlot);
    saRow.appendChild(lbl);
    saRow.addEventListener("click", () => this._handleGlobalSelectAllToggle());
    saRow.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this._handleGlobalSelectAllToggle();
      }
    });
    el.appendChild(saRow);
  }
  _createItemEntry(item, isTabStop) {
    const opts = this._options;
    const isChecked = item.isChecked ?? opts.selectedIds.includes(item.id);
    const isExcluded = item.isExcluded ?? opts.excludedIds.includes(item.id);
    const itemDisabled = opts.isDisabled || !!item.isDisabled;
    const itemLoading = item.isLoading === true;
    const itemReorderable = opts.isReorderable && (item.isReorderable ?? true) && !itemLoading && !itemDisabled;
    const itemSearchMatch = item.isSearchMatch ?? (opts.searchQuery ? item.label.toLowerCase().includes(opts.searchQuery.toLowerCase()) : false);
    const matchFragment = item.matchFragment ?? opts.searchQuery ?? null;
    const rootEl = document.createElement("div");
    const role = opts.selectionMode === "multi" ? "option" : opts.selectionMode === "single" ? "radio" : "listitem";
    rootEl.setAttribute("role", role);
    rootEl.setAttribute("data-arvo-list-item-id", item.id);
    rootEl.tabIndex = isTabStop ? 0 : -1;
    rootEl.className = [
      "arvo-list-item",
      `arvo-list-item--${opts.variant}`,
      `arvo-list-item--${opts.selectionMode}`,
      item.isSelected ? "active" : "",
      itemDisabled ? "is-disabled" : "",
      itemLoading ? "is-loading" : "",
      isExcluded && opts.selectionMode === "multi" ? "is-excluded" : ""
    ].filter(Boolean).join(" ");
    if (itemDisabled) rootEl.setAttribute("aria-disabled", "true");
    if (itemLoading) rootEl.setAttribute("aria-busy", "true");
    if (item.isSelected) rootEl.setAttribute("aria-current", "true");
    if (itemLoading) {
      const skel = document.createElement("span");
      skel.className = "arvo-list-item__skel";
      skel.setAttribute("aria-hidden", "true");
      rootEl.appendChild(skel);
      return {
        data: item,
        rootEl,
        labelEl: null,
        checkboxInst: null,
        radioInst: null,
        avatarInst: null,
        badgeInst: null,
        statusInst: null,
        actionButtons: [],
        chevButton: null,
        tooltipHandle: null
      };
    }
    if (opts.selectionMode === "multi") {
      rootEl.setAttribute("aria-selected", String(!!isChecked));
      if (item.isIndeterminate) rootEl.setAttribute("aria-checked", "mixed");
      else rootEl.setAttribute("aria-checked", String(!!isChecked));
    } else if (opts.selectionMode === "single") {
      rootEl.setAttribute("aria-checked", String(!!isChecked));
    }
    if (item.tooltip) rootEl.setAttribute("aria-label", item.tooltip);
    if (itemReorderable) {
      const drag = document.createElement("span");
      drag.className = "arvo-list-item__drag";
      drag.setAttribute("data-arvo-drag-handle", "true");
      const ico = document.createElement("span");
      ico.className = "arvo-ico o9con o9con-drag-handle";
      ico.setAttribute("aria-hidden", "true");
      drag.appendChild(ico);
      rootEl.appendChild(drag);
    } else if (opts.isReorderable) {
      const spacer = document.createElement("span");
      spacer.className = "arvo-list-item__drag-spacer";
      spacer.setAttribute("aria-hidden", "true");
      rootEl.appendChild(spacer);
    }
    let checkboxInst = null;
    let radioInst = null;
    if (opts.selectionMode === "multi") {
      const slot = document.createElement("span");
      slot.className = "arvo-list-item__check";
      const host = document.createElement("div");
      slot.appendChild(host);
      checkboxInst = ArvoCheckbox.initialize(host, {
        isChecked: !!isChecked && !item.isIndeterminate,
        isIndeterminate: !!item.isIndeterminate,
        isDisabled: itemDisabled
      });
      host.setAttribute("aria-hidden", "true");
      host.querySelectorAll("input").forEach((input) => input.setAttribute("tabindex", "-1"));
      rootEl.appendChild(slot);
    } else if (opts.selectionMode === "single") {
      const slot = document.createElement("span");
      slot.className = "arvo-list-item__check";
      const host = document.createElement("div");
      slot.appendChild(host);
      radioInst = ArvoRadio.initialize(host, {
        value: item.id,
        name: "__arvo-list-radio",
        isChecked: !!isChecked,
        isDisabled: itemDisabled
      });
      host.setAttribute("aria-hidden", "true");
      host.querySelectorAll("input").forEach((input) => input.setAttribute("tabindex", "-1"));
      rootEl.appendChild(slot);
    } else if (item.icon) {
      const ico = document.createElement("span");
      ico.className = `arvo-list-item__ico o9con o9con-${item.icon}`;
      ico.setAttribute("aria-hidden", "true");
      rootEl.appendChild(ico);
    }
    let avatarInst = null;
    if (opts.variant === "rich" && item.avatar) {
      const avtWrap = document.createElement("span");
      avtWrap.className = "arvo-list-item__avt";
      const avtHost = document.createElement("div");
      avtWrap.appendChild(avtHost);
      avatarInst = ArvoAvatar.initialize(avtHost, {
        ...item.avatarProps ?? {},
        size: "sm",
        variant: item.avatar.variant,
        name: item.avatar.name,
        src: item.avatar.src,
        icon: item.avatar.icon,
        colorMode: item.avatar.colorMode,
        semanticType: item.avatar.semanticType,
        customColor: item.avatar.customColor,
        tooltip: item.avatar.tooltip
      });
      rootEl.appendChild(avtWrap);
    }
    const txtEl = document.createElement("span");
    txtEl.className = "arvo-list-item__txt";
    const labelEl = document.createElement("span");
    labelEl.className = "arvo-list-item__lbl";
    const split = itemSearchMatch ? splitLabelForMatch(item.label, matchFragment) : null;
    if (split) {
      labelEl.appendChild(document.createTextNode(split.before));
      const matchSpan = document.createElement("span");
      matchSpan.className = "arvo-list-item__match";
      matchSpan.textContent = split.match;
      labelEl.appendChild(matchSpan);
      labelEl.appendChild(document.createTextNode(split.after));
    } else {
      labelEl.textContent = item.label;
    }
    txtEl.appendChild(labelEl);
    if (opts.variant === "rich" && item.secondaryLabel) {
      const sec = document.createElement("span");
      sec.className = "arvo-list-item__secondary";
      sec.textContent = item.secondaryLabel;
      txtEl.appendChild(sec);
    }
    rootEl.appendChild(txtEl);
    if (isExcluded && opts.selectionMode === "multi") {
      const exc = document.createElement("span");
      exc.className = "arvo-list-item__exclude";
      exc.setAttribute("aria-hidden", "true");
      const ico = document.createElement("span");
      ico.className = "o9con o9con-exclude";
      exc.appendChild(ico);
      rootEl.appendChild(exc);
    }
    let badgeInst = null;
    if (item.badge) {
      const slot = document.createElement("span");
      slot.className = "arvo-list-item__badge";
      const host = document.createElement("div");
      slot.appendChild(host);
      badgeInst = ArvoBadge.initialize(host, {
        ...item.badgeProps ?? {},
        size: "sm",
        variant: item.badge.variant ?? "label",
        appearance: isBadgeFilled(item.badge.appearance),
        semanticType: item.badge.semanticType ?? "neutral",
        message: item.badge.message,
        hasBadgeIcon: false,
        customColor: item.badge.customColor,
        colorMode: item.badge.colorMode
      });
      rootEl.appendChild(slot);
    }
    const actionButtons = [];
    let statusInst = null;
    const cappedActions = (item.actions ?? []).slice(0, LIST_MAX_ROW_ACTIONS);
    if ((item.actions ?? []).length > LIST_MAX_ROW_ACTIONS && process.env.NODE_ENV !== "production") {
      console.warn(
        `[ArvoList] More than ${LIST_MAX_ROW_ACTIONS} actions provided on item "${item.id}" (got ${(item.actions ?? []).length}). Extras are truncated.`
      );
    }
    const showActionsCluster = cappedActions.length > 0 || !!item.status;
    if (showActionsCluster) {
      const cluster = document.createElement("span");
      cluster.className = "arvo-list-item__actions";
      cluster.setAttribute("data-arvo-actions-visibility", opts.actionsVisibility);
      if (item.status) {
        const stsHost = document.createElement("span");
        cluster.appendChild(stsHost);
        statusInst = ArvoStatus.initialize(stsHost, {
          type: item.status.type,
          size: "sm",
          placement: "inline",
          icon: item.status.icon,
          tooltip: item.status.tooltip
        });
      }
      for (const action of cappedActions) {
        const btnHost = document.createElement("button");
        btnHost.type = "button";
        btnHost.tabIndex = -1;
        const inst = ArvoIconButton.initialize(btnHost, {
          ...item.iconButtonProps ?? {},
          icon: action.icon,
          variant: action.isDanger ? "danger-tertiary" : "tertiary",
          size: "sm",
          tooltip: action.tooltip,
          isDisabled: itemDisabled || !!action.isDisabled,
          onClick: (e) => {
            var _a;
            e.stopPropagation();
            e.preventDefault();
            if (itemDisabled || action.isDisabled) return;
            (_a = action.onClick) == null ? void 0 : _a.call(action, { itemId: item.id, actionId: action.id, item, event: e });
            this._dispatchEvent("list-item:action", { id: item.id, actionId: action.id });
          }
        });
        actionButtons.push(inst);
        cluster.appendChild(btnHost);
      }
      rootEl.appendChild(cluster);
    }
    let chevButton = null;
    if (item.hasInlineNav) {
      const slot = document.createElement("span");
      slot.className = "arvo-list-item__chev";
      const btnHost = document.createElement("button");
      btnHost.type = "button";
      btnHost.tabIndex = -1;
      slot.appendChild(btnHost);
      chevButton = ArvoIconButton.initialize(btnHost, {
        icon: "angle-right",
        variant: "tertiary",
        size: "sm",
        tooltip: "Navigate",
        isDisabled: itemDisabled,
        onClick: (e) => {
          var _a, _b;
          e.stopPropagation();
          if (itemDisabled) return;
          (_b = (_a = this._options).onItemActivate) == null ? void 0 : _b.call(_a, { id: item.id, item, event: e });
          this._dispatchEvent("list:item-activate", { id: item.id });
        }
      });
      rootEl.appendChild(slot);
    }
    rootEl.addEventListener("click", (e) => this._handleRowClick(item, e));
    rootEl.addEventListener("keydown", (e) => this._handleRowKeyDown(item, e));
    if (item.hasContextMenu) {
      rootEl.addEventListener("contextmenu", (e) => {
        var _a, _b;
        e.preventDefault();
        (_b = (_a = this._options).onItemContextMenu) == null ? void 0 : _b.call(_a, {
          id: item.id,
          item,
          event: e,
          anchorElement: rootEl
        });
      });
    }
    return {
      data: item,
      rootEl,
      labelEl,
      checkboxInst,
      radioInst,
      avatarInst,
      badgeInst,
      statusInst,
      actionButtons,
      chevButton,
      tooltipHandle: null
    };
  }
  _renderLiveRegion() {
    if (this._liveEl) return;
    const live = document.createElement("div");
    live.className = "arvo-list__live";
    live.setAttribute("aria-live", "polite");
    live.setAttribute("aria-atomic", "true");
    live.style.cssText = "position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
    document.body.appendChild(live);
    this._liveEl = live;
  }
  // ===========================================================================
  // Side-effects (truncation tooltips, actions-width reservation, drag)
  // ===========================================================================
  _attachTruncationTooltips() {
    for (const entry of this._entries) {
      if (!entry.labelEl || !entry.rootEl) continue;
      const content = entry.data.tooltip ?? entry.data.label;
      if (!content) continue;
      entry.tooltipHandle = attachTitleTruncationTooltip({
        triggerElement: entry.rootEl,
        element: entry.labelEl,
        content,
        placement: "top-center"
      });
    }
  }
  _lockActionsWidth() {
    if (this._options.actionsVisibility !== "hover") return;
    const root = this._element;
    if (!root) return;
    requestAnimationFrame(() => {
      const clusters = root.querySelectorAll(".arvo-list-item__actions");
      let max = 0;
      clusters.forEach((c) => {
        const w = c.offsetWidth;
        if (w > max) max = w;
      });
      root.style.setProperty("--arvo-list-item-actions-w", `${max + 8}px`);
    });
  }
  _initSortable() {
    const root = this._element;
    if (!root || !this._options.isReorderable || this._options.isLoading || this._options.isDisabled) return;
    const flat = this._flatItems();
    this._sortableHandle = createSortableList(root, {
      itemSelector: ".arvo-list-item",
      handleSelector: '[data-arvo-drag-handle="true"]',
      getGroupOf: (item) => {
        var _a;
        return ((_a = item.closest("[data-arvo-list-group-id]")) == null ? void 0 : _a.dataset.arvoListGroupId) ?? null;
      },
      allowCrossGroup: this._options.crossGroupReorder,
      onPreview: (fromIndex) => {
        var _a;
        const movedId = ((_a = flat[fromIndex]) == null ? void 0 : _a.id) ?? null;
        const isNewDrag = this._draggingId !== movedId;
        this._draggingId = movedId;
        if (isNewDrag && movedId) {
          this._dispatchEvent("list:reorder-start", { id: movedId, fromIndex });
        }
      },
      onCommit: (fromIndex, toIndex, fromGroup, toGroup) => {
        var _a, _b, _c;
        const movedId = (_a = flat[fromIndex]) == null ? void 0 : _a.id;
        const movedItem = movedId ? flat.find((i) => i.id === movedId) : null;
        this._draggingId = null;
        if (movedId && movedItem) {
          this._dispatchEvent("list:reorder", {
            id: movedId,
            fromIndex,
            toIndex,
            fromGroupId: fromGroup,
            toGroupId: toGroup
          });
          (_c = (_b = this._options).onReorder) == null ? void 0 : _c.call(_b, {
            item: movedItem,
            fromIndex,
            toIndex,
            fromGroupId: fromGroup,
            toGroupId: toGroup
          });
          this._announce(`Dropped ${movedItem.label} at position ${toIndex + 1}`);
        }
      },
      onCancel: () => {
        var _a, _b;
        const cancelledId = this._draggingId;
        const cancelledItem = cancelledId ? flat.find((i) => i.id === cancelledId) : null;
        this._draggingId = null;
        if (cancelledId && cancelledItem) {
          this._dispatchEvent("list:reorder-cancel", { id: cancelledId });
          (_b = (_a = this._options).onReorderCancel) == null ? void 0 : _b.call(_a, { id: cancelledId, item: cancelledItem });
          this._announce(`Drag cancelled, ${cancelledItem.label} returned to original position`);
        }
      }
    });
  }
  // ===========================================================================
  // Selection logic
  // ===========================================================================
  _diffSelection(prev, next) {
    const prevSet = new Set(prev);
    const nextSet = new Set(next);
    let addedId = null;
    let removedId = null;
    for (const id of next) if (!prevSet.has(id)) addedId = id;
    for (const id of prev) if (!nextSet.has(id)) removedId = id;
    return { addedId, removedId };
  }
  _emitSelectionChange(next) {
    var _a, _b;
    const prev = this._options.selectedIds;
    const { addedId, removedId } = this._diffSelection(prev, next);
    this._options.selectedIds = next;
    this._syncSelectionAttributes();
    this._syncGroupSelectAllStates();
    const flat = this._flatItems();
    const detail = {
      selectedIds: arrayToSelection(next, this._options.selectionMode),
      items: flat
    };
    this._dispatchEvent("list:select", {
      selectedIds: detail.selectedIds,
      addedId,
      removedId
    });
    (_b = (_a = this._options).onSelectionChange) == null ? void 0 : _b.call(_a, detail);
  }
  _emitExclusionChange(next) {
    var _a, _b;
    const prev = this._options.excludedIds;
    const { addedId, removedId } = this._diffSelection(prev, next);
    this._options.excludedIds = next;
    this._syncSelectionAttributes();
    const flat = this._flatItems();
    this._dispatchEvent("list:exclude", { excludedIds: next, addedId, removedId });
    (_b = (_a = this._options).onExclusionChange) == null ? void 0 : _b.call(_a, { excludedIds: next, items: flat });
  }
  _toggleSelection(targetId, opts) {
    const item = this._flatItems().find((i) => i.id === targetId);
    if (!item || item.isDisabled) return;
    const current = this._options.selectedIds;
    const mode = this._options.selectionMode;
    if ((opts == null ? void 0 : opts.rangeShift) && mode === "multi") {
      const next = nextSelectionForRangeShift({
        selectedIds: current,
        orderedIds: this._flatItems().map((i) => i.id),
        anchorId: this._selectionAnchorId,
        targetId,
        disabledIds: this._flatItems().filter((i) => i.isDisabled).map((i) => i.id)
      });
      this._emitSelectionChange(next);
      this._selectionAnchorId = targetId;
      return;
    }
    if (mode === "multi") {
      const set = new Set(current);
      if (set.has(targetId)) set.delete(targetId);
      else set.add(targetId);
      const next = [...set];
      this._emitSelectionChange(next);
      this._selectionAnchorId = targetId;
      this._announce(
        set.has(targetId) ? `${item.label}, selected` : `${item.label}, not selected`
      );
    } else if (mode === "single") {
      this._emitSelectionChange([targetId]);
      this._selectionAnchorId = targetId;
      this._announce(`${item.label}, selected`);
    }
  }
  _handleGlobalSelectAllToggle() {
    if (this._options.isDisabled || this._options.isLoading) return;
    if (this._options.selectionMode !== "multi") return;
    const enabledIds = this._enabledIds();
    const aggregate = aggregateSelectionState(this._options.selectedIds, enabledIds);
    if (aggregate === "all") {
      this._emitSelectionChange([]);
      this._announce("All items deselected");
    } else {
      this._emitSelectionChange([...enabledIds]);
      this._announce("All items selected");
    }
  }
  _handleGroupSelectAllToggle(groupId) {
    if (this._options.isDisabled || this._options.isLoading) return;
    if (this._options.selectionMode !== "multi") return;
    const group = this._groupBlocks.find((g) => g.group.id === groupId);
    if (!group) return;
    const groupEnabledIds = group.group.items.filter((i) => !i.isDisabled).map((i) => i.id);
    const aggregate = aggregateSelectionState(this._options.selectedIds, groupEnabledIds);
    const current = new Set(this._options.selectedIds);
    if (aggregate === "all") {
      groupEnabledIds.forEach((id) => current.delete(id));
    } else {
      groupEnabledIds.forEach((id) => current.add(id));
    }
    this._emitSelectionChange([...current]);
  }
  /**
   * Apply a boolean checked state to an embedded checkbox / radio by reaching
   * into the native input element. ArvoCheckbox / ArvoRadio expose `.checked()`
   * as a getter only -- their state is normally driven by user click. ArvoList
   * owns the toggle path and needs a programmatic setter, so we update the
   * underlying <input> directly.
   */
  _syncInputChecked(slotEl, isChecked, isIndeterminate) {
    const input = slotEl.querySelector("input");
    if (!input) return;
    input.checked = isChecked;
    input.indeterminate = !!isIndeterminate;
    if (isIndeterminate) input.setAttribute("data-indeterminate", "true");
    else input.removeAttribute("data-indeterminate");
  }
  _syncSelectionAttributes() {
    const mode = this._options.selectionMode;
    for (const entry of this._entries) {
      const id = entry.data.id;
      const isChecked = entry.data.isChecked ?? this._options.selectedIds.includes(id);
      const isExcluded = entry.data.isExcluded ?? this._options.excludedIds.includes(id);
      const slot = entry.rootEl.querySelector(".arvo-list-item__check");
      if (mode === "multi") {
        entry.rootEl.setAttribute("aria-selected", String(!!isChecked));
        if (entry.data.isIndeterminate) entry.rootEl.setAttribute("aria-checked", "mixed");
        else entry.rootEl.setAttribute("aria-checked", String(!!isChecked));
        if (slot) {
          this._syncInputChecked(
            slot,
            !!isChecked && !entry.data.isIndeterminate,
            !!entry.data.isIndeterminate
          );
        }
      } else if (mode === "single") {
        entry.rootEl.setAttribute("aria-checked", String(!!isChecked));
        if (slot) this._syncInputChecked(slot, !!isChecked);
      }
      entry.rootEl.classList.toggle("is-excluded", !!isExcluded && mode === "multi");
    }
  }
  _syncGroupSelectAllStates() {
    var _a;
    const enabledIds = this._enabledIds();
    const aggregateGlobal = aggregateSelectionState(
      this._options.selectedIds,
      enabledIds
    );
    if (this._saInst) {
      const ariaRow = (_a = this._element) == null ? void 0 : _a.querySelector(
        ":scope > .arvo-list__sa"
      );
      const slot = ariaRow == null ? void 0 : ariaRow.querySelector(".arvo-list-item__check");
      if (slot) {
        this._syncInputChecked(
          slot,
          aggregateGlobal === "all",
          aggregateGlobal === "some"
        );
      }
      if (ariaRow) {
        ariaRow.setAttribute(
          "aria-checked",
          aggregateGlobal === "all" ? "true" : aggregateGlobal === "some" ? "mixed" : "false"
        );
      }
    }
    for (const block of this._groupBlocks) {
      if (!block.saInst) continue;
      const groupEnabledIds = block.group.items.filter((i) => !i.isDisabled).map((i) => i.id);
      const agg = aggregateSelectionState(this._options.selectedIds, groupEnabledIds);
      const ariaRow = block.bodyEl.querySelector(".arvo-list__sa");
      const slot = ariaRow == null ? void 0 : ariaRow.querySelector(".arvo-list-item__check");
      if (slot) this._syncInputChecked(slot, agg === "all", agg === "some");
      if (ariaRow) {
        ariaRow.setAttribute(
          "aria-checked",
          agg === "all" ? "true" : agg === "some" ? "mixed" : "false"
        );
      }
    }
  }
  // ===========================================================================
  // Event handlers
  // ===========================================================================
  _bindEvents() {
    var _a;
    (_a = this._element) == null ? void 0 : _a.addEventListener("keydown", this._boundHandleKeyDown);
  }
  _unbindEvents() {
    var _a;
    (_a = this._element) == null ? void 0 : _a.removeEventListener("keydown", this._boundHandleKeyDown);
  }
  _handleRowClick(item, e) {
    var _a, _b;
    if (this._options.isDisabled || this._options.isLoading) return;
    if (item.isDisabled || item.isLoading) return;
    if (this._options.selectionMode !== "none") this._toggleSelection(item.id);
    this._dispatchEvent("list:item-click", { id: item.id });
    (_b = (_a = this._options).onItemClick) == null ? void 0 : _b.call(_a, { id: item.id, item, event: e });
  }
  _handleRowKeyDown(item, e) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (this._options.isDisabled || this._options.isLoading) return;
    if (item.isDisabled || item.isLoading) return;
    if (item.hasContextMenu && (e.key === "F10" && e.shiftKey || e.shiftKey && e.ctrlKey && e.key.toUpperCase() === "X")) {
      e.preventDefault();
      (_c = (_b = this._options).onItemContextMenu) == null ? void 0 : _c.call(_b, {
        id: item.id,
        item,
        event: e,
        anchorElement: ((_a = this._entries.find((en) => en.data.id === item.id)) == null ? void 0 : _a.rootEl) ?? null
      });
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (this._options.selectionMode !== "none") this._toggleSelection(item.id);
      this._dispatchEvent("list:item-click", { id: item.id });
      (_e = (_d = this._options).onItemClick) == null ? void 0 : _e.call(_d, { id: item.id, item, event: e });
    } else if (e.key === " " && !e.shiftKey) {
      e.preventDefault();
      if (this._options.selectionMode !== "none") this._toggleSelection(item.id);
      this._dispatchEvent("list:item-click", { id: item.id });
      (_g = (_f = this._options).onItemClick) == null ? void 0 : _g.call(_f, { id: item.id, item, event: e });
    }
  }
  _handleKeyDown(e) {
    if (this._options.isDisabled || this._options.isLoading) return;
    const enabled = this._enabledIds();
    if (enabled.length === 0) return;
    if (this._options.selectionMode === "multi" && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a" && !e.shiftKey) {
      e.preventDefault();
      this._emitSelectionChange([...enabled]);
      this._announce("All items selected");
      return;
    }
    const activeRowId = this._activeId ?? this._resolveTabStopId();
    const currentIdx = activeRowId ? enabled.indexOf(activeRowId) : -1;
    let nextIdx = null;
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
      case " ":
        if (e.shiftKey && this._options.selectionMode === "multi" && activeRowId) {
          e.preventDefault();
          this._toggleSelection(activeRowId, { rangeShift: true });
        }
        return;
      case "Escape":
        if (this._draggingId && this._sortableHandle) ;
        return;
      default:
        return;
    }
    if (nextIdx !== null) {
      const nextId = enabled[nextIdx];
      this._activeId = nextId;
      const entry = this._entries.find((en) => en.data.id === nextId);
      entry == null ? void 0 : entry.rootEl.focus();
      for (const en of this._entries) {
        const isActive = en.data.id === nextId;
        en.rootEl.tabIndex = isActive ? 0 : -1;
        en.rootEl.classList.toggle("focused", isActive);
      }
    }
  }
  _announce(msg) {
    const live = this._liveEl;
    if (!live) return;
    live.textContent = "";
    requestAnimationFrame(() => {
      if (this._liveEl) this._liveEl.textContent = msg;
    });
  }
  _dispatchEvent(name, detail) {
    if (!this._element) return;
    this._element.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
  }
  selected(ids) {
    if (arguments.length === 0) {
      return arrayToSelection(this._options.selectedIds, this._options.selectionMode);
    }
    const arr = selectionToArray(ids);
    this._emitSelectionChange(arr);
  }
  excluded(ids) {
    if (arguments.length === 0) return [...this._options.excludedIds];
    this._emitExclusionChange(ids ?? []);
  }
  setItems(items) {
    if (Array.isArray(items) && items.length > 0 && "items" in items[0]) {
      this._options.groups = items.map((g) => ({
        ...g,
        items: g.items.map((i) => ({ ...i }))
      }));
      this._options.items = [];
    } else {
      this._options.items = items.map((i) => ({ ...i }));
      this._options.groups = null;
    }
    this._options.selectedIds = this._options.selectedIds.filter(
      (id) => this._flatItems().some((i) => i.id === id)
    );
    this._render();
  }
  addItem(item, index, groupId) {
    if (this._options.groups) {
      const target = this._options.groups.find((g) => g.id === groupId) ?? this._options.groups[this._options.groups.length - 1];
      const next = [...target.items];
      if (typeof index === "number") next.splice(index, 0, { ...item });
      else next.push({ ...item });
      target.items = next;
    } else {
      const next = [...this._options.items];
      if (typeof index === "number") next.splice(index, 0, { ...item });
      else next.push({ ...item });
      this._options.items = next;
    }
    this._render();
  }
  removeItem(id) {
    if (this._options.groups) {
      for (const g of this._options.groups) {
        g.items = g.items.filter((i) => i.id !== id);
      }
    } else {
      this._options.items = this._options.items.filter((i) => i.id !== id);
    }
    this._options.selectedIds = this._options.selectedIds.filter((sid) => sid !== id);
    this._options.excludedIds = this._options.excludedIds.filter((sid) => sid !== id);
    this._render();
  }
  setLoading(loading) {
    this._options.isLoading = loading === true;
    this._render();
  }
  setReorderable(reorderable) {
    this._options.isReorderable = !!reorderable;
    this._render();
  }
  disabled(state) {
    if (arguments.length === 0) return this._options.isDisabled;
    this._options.isDisabled = !!state;
    this._render();
  }
  destroy() {
    var _a;
    this._unbindEvents();
    (_a = this._sortableHandle) == null ? void 0 : _a.destroy();
    this._sortableHandle = null;
    this._destroyInstances();
    if (this._element) {
      this._element.textContent = "";
      this._element.classList.remove(
        "arvo-list",
        "arvo-list--standard",
        "arvo-list--rich",
        "arvo-list--none",
        "arvo-list--single",
        "arvo-list--multi",
        "arvo-list--reorderable",
        "arvo-list--actions-always",
        "is-disabled",
        "loading",
        "is-empty"
      );
      this._element.removeAttribute("role");
      this._element.removeAttribute("aria-busy");
      this._element.removeAttribute("aria-disabled");
      this._element.removeAttribute("aria-multiselectable");
      this._element.removeAttribute("aria-label");
      this._element.style.removeProperty("--arvo-list-width");
      this._element.style.removeProperty("--arvo-list-item-actions-w");
    }
    this._element = null;
    this._bodyEl = null;
    if (this._liveEl) {
      this._liveEl.remove();
      this._liveEl = null;
    }
    this._saInst = null;
    this._emptyInst = null;
    this._entries = [];
    this._groupBlocks = [];
  }
  _destroyInstances(opts) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u;
    (_b = (_a = this._saInst) == null ? void 0 : _a.destroy) == null ? void 0 : _b.call(_a);
    this._saInst = null;
    (_d = (_c = this._emptyInst) == null ? void 0 : _c.destroy) == null ? void 0 : _d.call(_c);
    this._emptyInst = null;
    for (const entry of this._entries) {
      (_f = (_e = entry.checkboxInst) == null ? void 0 : _e.destroy) == null ? void 0 : _f.call(_e);
      (_h = (_g = entry.radioInst) == null ? void 0 : _g.destroy) == null ? void 0 : _h.call(_g);
      (_j = (_i = entry.avatarInst) == null ? void 0 : _i.destroy) == null ? void 0 : _j.call(_i);
      (_l = (_k = entry.badgeInst) == null ? void 0 : _k.destroy) == null ? void 0 : _l.call(_k);
      (_n = (_m = entry.statusInst) == null ? void 0 : _m.destroy) == null ? void 0 : _n.call(_m);
      (_p = (_o = entry.chevButton) == null ? void 0 : _o.destroy) == null ? void 0 : _p.call(_o);
      (_r = (_q = entry.tooltipHandle) == null ? void 0 : _q.destroy) == null ? void 0 : _r.call(_q);
      for (const btn of entry.actionButtons) (_s = btn.destroy) == null ? void 0 : _s.call(btn);
    }
    for (const block of this._groupBlocks) {
      (_u = (_t = block.saInst) == null ? void 0 : _t.destroy) == null ? void 0 : _u.call(_t);
    }
    if (!(opts == null ? void 0 : opts.preserveLiveRegion) && this._liveEl) {
      this._liveEl.remove();
      this._liveEl = null;
    }
  }
};
_ArvoList.VARIANTS = ["standard", "rich"];
_ArvoList.SELECTION_MODES = ["none", "single", "multi"];
_ArvoList.DEFAULTS = {
  variant: "standard",
  selectionMode: "none",
  items: [],
  groups: null,
  selectedIds: [],
  excludedIds: [],
  isLoading: false,
  skeletonRows: 6,
  isEmpty: false,
  emptyState: null,
  hasGroupDividers: true,
  hasGlobalSelectAll: false,
  globalSelectAllLabel: "Select all",
  isReorderable: false,
  crossGroupReorder: false,
  actionsVisibility: "hover",
  searchQuery: null,
  isDisabled: false,
  width: null,
  ariaLabel: null,
  onSelectionChange: null,
  onExclusionChange: null,
  onItemClick: null,
  onItemActivate: null,
  onReorder: null,
  onReorderCancel: null,
  onItemContextMenu: null
};
let ArvoList = _ArvoList;
export {
  ArvoList,
  LIST_MAX_ROW_ACTIONS
};
//# sourceMappingURL=List.js.map
