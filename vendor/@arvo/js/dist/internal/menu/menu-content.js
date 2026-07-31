import { createArrowNav } from "@arvo/core";
import { formatShortcutDisplay, attachTitleTruncationTooltip } from "@arvo/utils";
import { flattenContextMenuItems, isContextMenuGrouped, isContextMenuFocusable, isContextMenuSelected } from "./types.js";
const DEFAULT_SUBMENU_HOVER_DELAY = 200;
function createMenuContent(options) {
  const {
    submenuHoverDelayMs = DEFAULT_SUBMENU_HOVER_DELAY,
    hasGroupDividers = true,
    onSelect,
    onRequestClose,
    createSubmenuController
  } = options;
  let currentItems = options.items;
  let currentContext = options.context;
  const surfaceId = options.surfaceId;
  const parentSurfaceId = options.parentSurfaceId;
  const scrollEl = document.createElement("div");
  scrollEl.className = "arvo-context-menu__scroll";
  const rows = /* @__PURE__ */ new Map();
  let flat = [];
  let activeIndex = 0;
  let openSubmenuId = null;
  let hoverTimer = null;
  let arrow = null;
  const truncationHandles = [];
  function clearHoverTimer() {
    if (hoverTimer !== null) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
  }
  function resolveStatus(status) {
    if (!status) return { modifier: null, inlineColor: null };
    if (typeof status === "string") {
      return { modifier: `arvo-menu-item--status-${status}`, inlineColor: null };
    }
    return { modifier: null, inlineColor: status.color };
  }
  function buildRow(item, index) {
    var _a;
    const rowId = `${surfaceId}-row-${index}`;
    if (item.kind === "separator") {
      const el2 = document.createElement("div");
      el2.id = rowId;
      el2.className = "arvo-menu-item__divider";
      el2.setAttribute("role", "separator");
      el2.dataset.index = String(index);
      el2.style.pointerEvents = "none";
      return el2;
    }
    const hasSubmenu = "submenu" in item && !!((_a = item.submenu) == null ? void 0 : _a.length);
    const useAnchor = !!item.href && !hasSubmenu;
    const isExternal = useAnchor && item.target === "_blank";
    const el = useAnchor ? document.createElement("a") : document.createElement("div");
    el.id = rowId;
    el.dataset.index = String(index);
    el.setAttribute("tabindex", "-1");
    const status = resolveStatus(item.status);
    const isSelected = isContextMenuSelected(item);
    const classes = ["arvo-menu-item"];
    if (item.secondaryLabel) classes.push("arvo-menu-item--multi-line");
    if ("destructive" in item && item.destructive) {
      classes.push("arvo-menu-item--destructive");
    }
    if (status.modifier) classes.push(status.modifier);
    if (item.isDisabled) classes.push("is-disabled");
    if (isSelected) classes.push("active");
    el.className = classes.join(" ");
    if (status.inlineColor) {
      el.style.setProperty("--arvo-menu-item-status-color", status.inlineColor);
    }
    if (item.kind === "checkbox") el.setAttribute("role", "menuitemcheckbox");
    else if (item.kind === "radio") el.setAttribute("role", "menuitemradio");
    else el.setAttribute("role", "menuitem");
    if (item.isDisabled) el.setAttribute("aria-disabled", "true");
    if (item.kind === "checkbox" || item.kind === "radio") {
      el.setAttribute("aria-checked", item.checked ? "true" : "false");
    }
    if (hasSubmenu) {
      el.setAttribute("aria-haspopup", "menu");
      el.setAttribute("aria-expanded", "false");
    }
    if (useAnchor) {
      const anchor = el;
      anchor.href = item.href;
      anchor.target = item.target ?? "_self";
      if (item.target === "_blank") {
        anchor.rel = "noopener noreferrer";
      }
    }
    if (isExternal) {
      el.setAttribute("aria-label", `${item.label}, opens in a new window`);
    }
    if (item.avatar) {
      const avatar = document.createElement("img");
      avatar.className = "arvo-menu-item__avatar";
      avatar.src = item.avatar;
      avatar.alt = "";
      avatar.setAttribute("aria-hidden", "true");
      el.appendChild(avatar);
    }
    if (item.icon) {
      const ico = document.createElement("span");
      ico.className = `arvo-menu-item__ico o9con o9con-${item.icon}`;
      ico.setAttribute("aria-hidden", "true");
      el.appendChild(ico);
    }
    const txt = document.createElement("span");
    txt.className = "arvo-menu-item__txt";
    const lbl = document.createElement("span");
    lbl.className = "arvo-menu-item__lbl";
    lbl.textContent = item.label;
    txt.appendChild(lbl);
    if (item.secondaryLabel) {
      const secondary = document.createElement("span");
      secondary.className = "arvo-menu-item__secondary";
      secondary.textContent = item.secondaryLabel;
      txt.appendChild(secondary);
    }
    el.appendChild(txt);
    const trailingParts = [];
    if (item.status) {
      const statusEl = document.createElement("span");
      statusEl.className = "arvo-menu-item__status";
      statusEl.setAttribute("aria-hidden", "true");
      trailingParts.push(statusEl);
    }
    if (item.value) {
      const meta = document.createElement("span");
      meta.className = "arvo-menu-item__meta";
      meta.textContent = item.value;
      trailingParts.push(meta);
    }
    if (item.shortcut) {
      const shortcut = document.createElement("span");
      shortcut.className = "arvo-menu-item__shortcut";
      shortcut.textContent = formatShortcutDisplay(item.shortcut);
      trailingParts.push(shortcut);
    }
    if (hasSubmenu) {
      const submenuIcon = document.createElement("span");
      submenuIcon.className = "arvo-menu-item__submenu o9con o9con-angle-right";
      submenuIcon.setAttribute("aria-hidden", "true");
      trailingParts.push(submenuIcon);
    }
    if (isExternal) {
      const externalIcon = document.createElement("span");
      externalIcon.className = "arvo-menu-item__external o9con o9con-external-link";
      externalIcon.setAttribute("aria-hidden", "true");
      trailingParts.push(externalIcon);
    }
    if (trailingParts.length > 0) {
      const trailing = document.createElement("span");
      trailing.className = "arvo-menu-item__trailing";
      for (const part of trailingParts) trailing.appendChild(part);
      el.appendChild(trailing);
    }
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      invokeItem(item, index);
    });
    el.addEventListener("pointerenter", () => {
      if (item.isDisabled) return;
      setActive(index);
      if (hasSubmenu) {
        clearHoverTimer();
        if (submenuHoverDelayMs <= 0) {
          openSubmenuFor(item, el);
        } else {
          hoverTimer = setTimeout(() => openSubmenuFor(item, el), submenuHoverDelayMs);
        }
      } else if (openSubmenuId) {
        clearHoverTimer();
        hoverTimer = setTimeout(() => closeSubmenuChain(), submenuHoverDelayMs);
      }
    });
    const labelEl = el.querySelector(".arvo-menu-item__lbl");
    if (labelEl && item.label) {
      const handle = attachTitleTruncationTooltip({
        triggerElement: el,
        element: labelEl,
        content: item.label,
        placement: "top-center"
      });
      truncationHandles.push(handle);
    }
    return el;
  }
  function openSubmenuFor(item, parentRowEl) {
    if (item.kind === "separator" || !("submenu" in item) || !item.submenu) return;
    if (openSubmenuId === item.id) return;
    closeSubmenuChain();
    const row = rows.get(item.id);
    if (!row) return;
    let controller = row.submenu;
    if (!controller) {
      controller = createSubmenuController({
        parentItem: item,
        parentRowEl,
        parentSurfaceId,
        context: currentContext,
        onSelect: (info) => onSelect(info),
        onClose: () => {
          if (openSubmenuId === item.id) {
            openSubmenuId = null;
            parentRowEl.setAttribute("aria-expanded", "false");
            parentRowEl.focus({ preventScroll: true });
          }
        }
      });
      row.submenu = controller;
    }
    openSubmenuId = item.id;
    parentRowEl.setAttribute("aria-expanded", "true");
    controller.open();
  }
  function closeSubmenuChain() {
    if (!openSubmenuId) return;
    const row = rows.get(openSubmenuId);
    if (row == null ? void 0 : row.submenu) row.submenu.close();
    if (row == null ? void 0 : row.el) row.el.setAttribute("aria-expanded", "false");
    openSubmenuId = null;
  }
  function setActive(index) {
    var _a;
    if (index < 0 || index >= flat.length) return;
    const item = flat[index];
    if (!item || !isContextMenuFocusable(item)) return;
    activeIndex = index;
    arrow == null ? void 0 : arrow.setIndex(index);
    (_a = rows.get(item.id)) == null ? void 0 : _a.el.focus({ preventScroll: true });
  }
  function invokeItem(item, index) {
    var _a, _b, _c, _d;
    if (item.kind === "separator" || item.isDisabled) return;
    if ("submenu" in item && ((_a = item.submenu) == null ? void 0 : _a.length)) {
      const row = rows.get(item.id);
      if (row) openSubmenuFor(item, row.el);
      return;
    }
    if (item.kind === "checkbox") {
      (_b = item.onChange) == null ? void 0 : _b.call(item, !item.checked, currentContext);
      onSelect({ item, index, context: currentContext, closeOnSelect: false });
      return;
    }
    if (item.kind === "radio") {
      if (!item.checked) (_c = item.onChange) == null ? void 0 : _c.call(item, currentContext);
      onSelect({ item, index, context: currentContext, closeOnSelect: false });
      return;
    }
    const ret = (_d = item.onSelect) == null ? void 0 : _d.call(
      item,
      currentContext
    );
    onSelect({
      item,
      index,
      context: currentContext,
      closeOnSelect: ret !== false
    });
  }
  function handleKeyDown(e) {
    var _a;
    if (e.key === "ArrowRight") {
      const item = flat[activeIndex];
      if (item && item.kind !== "separator" && "submenu" in item && ((_a = item.submenu) == null ? void 0 : _a.length)) {
        e.preventDefault();
        e.stopPropagation();
        const row = rows.get(item.id);
        if (row) openSubmenuFor(item, row.el);
        return;
      }
    }
    if (e.key === "ArrowLeft" && openSubmenuId) {
      e.preventDefault();
      e.stopPropagation();
      closeSubmenuChain();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      if (openSubmenuId) {
        closeSubmenuChain();
        return;
      }
      onRequestClose();
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      const item = flat[activeIndex];
      if (item) {
        e.preventDefault();
        invokeItem(item, activeIndex);
      }
      return;
    }
    arrow == null ? void 0 : arrow.handleKeyDown(e);
  }
  function teardownArrow() {
    arrow == null ? void 0 : arrow.destroy();
    arrow = null;
  }
  function rebuild() {
    var _a;
    clearHoverTimer();
    closeSubmenuChain();
    for (const r of rows.values()) (_a = r.submenu) == null ? void 0 : _a.destroy();
    rows.clear();
    teardownArrow();
    truncationHandles.forEach((h) => h.destroy());
    truncationHandles.length = 0;
    scrollEl.innerHTML = "";
    flat = flattenContextMenuItems(currentItems);
    let idx = 0;
    const appendItem = (item) => {
      const el = buildRow(item, idx);
      rows.set(item.id, { item, el });
      scrollEl.appendChild(el);
      idx++;
    };
    if (isContextMenuGrouped(currentItems)) {
      const groups = currentItems;
      groups.forEach((group, gi) => {
        if (gi > 0 && hasGroupDividers) {
          const div = document.createElement("div");
          div.className = "arvo-context-menu__divider";
          div.setAttribute("role", "separator");
          scrollEl.appendChild(div);
        }
        if (group.label) {
          const hdr = document.createElement("div");
          hdr.className = "arvo-context-menu__hdr";
          hdr.textContent = group.label;
          scrollEl.appendChild(hdr);
        }
        const wrap = document.createElement("div");
        wrap.setAttribute("role", "group");
        if (group.label) wrap.setAttribute("aria-label", group.label);
        scrollEl.appendChild(wrap);
        for (const item of group.items) {
          const el = buildRow(item, idx);
          rows.set(item.id, { item, el });
          wrap.appendChild(el);
          idx++;
        }
      });
    } else {
      for (const item of currentItems) {
        appendItem(item);
      }
    }
    const focusableEls = flat.map((it) => {
      var _a2;
      return (_a2 = rows.get(it.id)) == null ? void 0 : _a2.el;
    }).filter((el) => !!el);
    arrow = createArrowNav({
      items: focusableEls,
      orientation: "vertical",
      wrap: true,
      onNavigate: (_el, index) => {
        var _a2;
        const item = flat[index];
        if (!item) return;
        activeIndex = index;
        (_a2 = rows.get(item.id)) == null ? void 0 : _a2.el.focus({ preventScroll: true });
      },
      skipDisabled: (i) => {
        const it = flat[i];
        return !it || !isContextMenuFocusable(it);
      },
      typeAhead: {
        getLabel: (i) => {
          const it = flat[i];
          return it && it.kind !== "separator" ? it.label : "";
        }
      }
    });
    activeIndex = flat.findIndex((it) => isContextMenuFocusable(it));
    if (activeIndex < 0) activeIndex = 0;
    arrow.setIndex(activeIndex);
  }
  function focus() {
    var _a;
    const item = flat[activeIndex];
    if (!item) return;
    (_a = rows.get(item.id)) == null ? void 0 : _a.el.focus({ preventScroll: true });
  }
  function update(next) {
    let needRebuild = false;
    if (next.items !== void 0 && next.items !== currentItems) {
      currentItems = next.items;
      needRebuild = true;
    }
    if (next.context !== void 0) {
      currentContext = next.context;
    }
    if (needRebuild) rebuild();
  }
  function destroy() {
    var _a;
    clearHoverTimer();
    closeSubmenuChain();
    for (const r of rows.values()) (_a = r.submenu) == null ? void 0 : _a.destroy();
    rows.clear();
    teardownArrow();
    truncationHandles.forEach((h) => h.destroy());
    truncationHandles.length = 0;
    scrollEl.removeEventListener("keydown", handleKeyDown);
    scrollEl.remove();
  }
  scrollEl.addEventListener("keydown", handleKeyDown);
  rebuild();
  return {
    element: scrollEl,
    focus,
    update,
    hasOpenSubmenu: () => openSubmenuId !== null,
    destroy
  };
}
export {
  createMenuContent
};
//# sourceMappingURL=menu-content.js.map
