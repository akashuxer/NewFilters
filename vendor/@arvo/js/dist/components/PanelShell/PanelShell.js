import { createTabRoving } from "@arvo/core";
import { validateHeaderAction, formatMatchCountMessage, clampFooterActions, attachOverlayFooterFit, runItemFilter } from "@arvo/utils";
import { ArvoIconButton } from "../IconButton/IconButton.js";
import { ArvoDropdownIconButton } from "../DropdownIconButton/DropdownIconButton.js";
import { ArvoSplitIconButton } from "../SplitIconButton/SplitIconButton.js";
import { ArvoSwitch } from "../Switch/Switch.js";
import { ArvoCheckbox } from "../Checkbox/Checkbox.js";
import { ArvoTabstrip } from "../Tabstrip/Tabstrip.js";
import { ArvoSearch } from "../Search/Search.js";
import { ArvoAdvanceSearch } from "../AdvanceSearch/AdvanceSearch.js";
import { ArvoButton } from "../Button/Button.js";
import { ArvoBannerAlert } from "../BannerAlert/BannerAlert.js";
import { ArvoMessageAlert } from "../MessageAlert/MessageAlert.js";
function el(tag, className, parent) {
  const node = document.createElement(tag);
  node.className = className;
  if (parent) parent.appendChild(node);
  return node;
}
function renderPanelContent(container, content) {
  container.textContent = "";
  if (content == null) return;
  if (typeof content === "string") {
    container.innerHTML = content;
  } else if (typeof content === "function") {
    content(container);
  } else if (content instanceof Node) {
    container.appendChild(content);
  }
}
function warnActionCap(total) {
  if (process.env.NODE_ENV !== "production" && total > 4) {
    console.warn(
      `[panel-shell] Total header actions (${total}) exceeds cap of 4. Computed across headerActions + isPinnable + isClosable.`
    );
  }
}
function renderDefaultItem(item, row, block) {
  const secondary = item.secondaryLabel ?? item.description;
  const hasAvatar = !!item.avatarUrl;
  const hasIcon = !hasAvatar && !!item.icon;
  if (hasAvatar) {
    const img = document.createElement("img");
    img.className = `${block}__item__avatar`;
    img.src = item.avatarUrl;
    img.alt = "";
    row.appendChild(img);
  } else if (hasIcon) {
    const ico = document.createElement("i");
    ico.className = `o9con-${item.icon} ${block}__item__ico`;
    ico.setAttribute("aria-hidden", "true");
    row.appendChild(ico);
  }
  const txt = document.createElement("div");
  txt.className = `${block}__item__txt`;
  row.appendChild(txt);
  const lbl = document.createElement("span");
  lbl.className = `${block}__item__lbl`;
  lbl.textContent = item.label;
  txt.appendChild(lbl);
  if (secondary) {
    const sec = document.createElement("span");
    sec.className = `${block}__item__secondary`;
    sec.textContent = secondary;
    txt.appendChild(sec);
  }
}
function createPanelShell(config) {
  const { parentBlock: block, parent, options } = config;
  let _items = options.items ?? [];
  let _query = "";
  let _selectedTabId = options.selectedTabId ?? null;
  let _isLoading = false;
  let _isDisabled = false;
  let _headerActions = options.headerActions ?? [];
  let _stickyConfig = options.stickyHeader ?? false;
  let _actions = options.actions ?? false;
  let _content = options.content ?? null;
  let _pinSlot = options.pinSlot ?? null;
  let _title = options.title ?? null;
  let _tabRoving = null;
  let _destroyed = false;
  const _headerActionInstances = [];
  const _footerActionInstances = [];
  let _backInstance = null;
  let _closeInstance = null;
  let _searchInstance = null;
  let _tabstripInstance = null;
  let _clearSearchInstance = null;
  let _bannerInstance = null;
  let _infoInstance = null;
  const getItemId = options.getItemId ?? ((item) => item.id);
  const hdrEl = options.hasHeader !== false ? el("div", `${block}__hdr`, parent) : null;
  let hdrLftEl = null;
  let backEl = null;
  let titleLeadingHostEl = null;
  let titleTrailingHostEl = null;
  let _titleLeading = options.titleLeading ?? null;
  let _titleTrailing = options.titleTrailing ?? null;
  let titleEl = null;
  let hdrActionsEl = null;
  let closeEl = null;
  if (hdrEl) {
    hdrLftEl = el("div", `${block}__hdr-lft`, hdrEl);
    if (options.hasBackButton) {
      backEl = document.createElement("button");
      backEl.className = `${block}__back`;
      hdrLftEl.appendChild(backEl);
      _backInstance = new ArvoIconButton(backEl, {
        size: "sm",
        variant: "tertiary",
        icon: "arrow-left",
        tooltip: "Back",
        onClick: () => {
          var _a;
          if (_isDisabled) return;
          (_a = options.onBack) == null ? void 0 : _a.call(options);
          parent.dispatchEvent(new CustomEvent("back", { bubbles: true }));
        }
      });
    }
    titleLeadingHostEl = el("span", `${block}__title-leading`, hdrLftEl);
    if (_titleLeading) titleLeadingHostEl.appendChild(_titleLeading);
    titleEl = el("span", `${block}__title`, hdrLftEl);
    const titleId = `${block}-title-${Math.random().toString(36).slice(2, 9)}`;
    titleEl.id = titleId;
    if (_title) {
      titleEl.textContent = _title;
      parent.setAttribute("aria-labelledby", titleId);
    }
    titleTrailingHostEl = el("span", `${block}__title-trailing`, hdrLftEl);
    if (_titleTrailing) titleTrailingHostEl.appendChild(_titleTrailing);
    hdrActionsEl = el("div", `${block}__hdr-actions`, hdrEl);
    renderHeaderActions();
    if (options.isClosable) {
      closeEl = document.createElement("button");
      closeEl.className = `${block}__close`;
      hdrActionsEl.appendChild(closeEl);
      _closeInstance = new ArvoIconButton(closeEl, {
        size: "sm",
        variant: "tertiary",
        icon: "close",
        tooltip: "Close",
        onClick: () => {
          var _a;
          if (_isDisabled) return;
          (_a = options.onClose) == null ? void 0 : _a.call(options);
          parent.dispatchEvent(new CustomEvent("close", { bubbles: true }));
        }
      });
    }
  }
  const pinnableCount = options.isPinnableCount ?? 0;
  const closableCount = options.isClosableCount ?? (options.isClosable ? 1 : 0);
  warnActionCap(_headerActions.filter((a) => validateHeaderAction(a)).length + pinnableCount + closableCount);
  let stickyEl = null;
  let bannerEl = null;
  let tabsEl = null;
  let stickySlotEl = null;
  let searchEl = null;
  let infoEl = null;
  let infoInnerEl = null;
  if (_stickyConfig) {
    stickyEl = el("div", `${block}__sticky`, parent);
    buildStickyContent();
  }
  const bodyEl = el("div", `${block}__body`, parent);
  let listEl = null;
  let emptyEl = null;
  let contentEl = null;
  function ensureItemsInfrastructure() {
    if (listEl) return;
    listEl = el("div", `${block}__list`, bodyEl);
    listEl.setAttribute("role", options.itemsRole ?? "list");
    listEl.setAttribute("tabindex", "-1");
    emptyEl = el("div", `${block}__empty`, bodyEl);
    emptyEl.style.display = "none";
    buildEmptyContent();
  }
  function ensureContentInfrastructure() {
    if (contentEl) return;
    contentEl = el("div", `${block}__content`, bodyEl);
  }
  function renderContentSlot() {
    ensureContentInfrastructure();
    renderPanelContent(contentEl, _content);
  }
  if (options.items !== void 0) {
    ensureItemsInfrastructure();
    renderItems();
    setupTabRoving();
  } else if (_content != null) {
    renderContentSlot();
  }
  const skeletonEl = el("div", `${block}__skeleton`, bodyEl);
  skeletonEl.style.display = "none";
  const _SKEL_WIDTHS = ["wide", "medium", "narrow", "wide", "medium"];
  for (const w of _SKEL_WIDTHS) {
    el("div", `${block}__skeleton__row ${block}__skeleton__row--${w}`, skeletonEl);
  }
  let footerEl = null;
  let footerActionsEl = null;
  let _footerFit = null;
  function destroyFooterFit() {
    _footerFit == null ? void 0 : _footerFit.destroy();
    _footerFit = null;
  }
  function attachFooterFit() {
    destroyFooterFit();
    if (!footerActionsEl) return;
    _footerFit = attachOverlayFooterFit(footerActionsEl, { gap: 8 });
  }
  if (_actions && _actions.length > 0) {
    footerEl = el("div", `${block}__footer`, parent);
    footerActionsEl = el("div", `${block}__footer-actions`, footerEl);
    renderFooterActions();
    attachFooterFit();
  }
  function destroyHeaderActions() {
    var _a;
    for (const entry of _headerActionInstances) {
      try {
        (_a = entry.instance) == null ? void 0 : _a.destroy();
      } catch {
      }
      entry.wrapper.remove();
    }
    _headerActionInstances.length = 0;
  }
  function renderHeaderActions() {
    if (!hdrActionsEl) return;
    destroyHeaderActions();
    for (const action of _headerActions) {
      if (!validateHeaderAction(action)) continue;
      const wrapper = document.createElement("div");
      wrapper.className = `${block}__action`;
      wrapper.setAttribute("data-action-id", action.id);
      wrapper.setAttribute("data-action-type", action.type);
      if (closeEl) {
        hdrActionsEl.insertBefore(wrapper, _pinSlot ?? closeEl);
      } else if (_pinSlot) {
        hdrActionsEl.insertBefore(wrapper, _pinSlot);
      } else {
        hdrActionsEl.appendChild(wrapper);
      }
      const instance2 = renderHeaderActionInstance(action, wrapper);
      _headerActionInstances.push({ id: action.id, type: action.type, wrapper, instance: instance2 });
    }
    insertPinSlot();
  }
  function renderHeaderActionInstance(action, wrapper) {
    switch (action.type) {
      case "btn": {
        const btn = document.createElement("button");
        wrapper.appendChild(btn);
        const tt = action.tooltip ?? action.label ?? action.id;
        return new ArvoIconButton(btn, {
          size: "sm",
          variant: "tertiary",
          icon: action.icon,
          tooltip: tt,
          isDisabled: action.isDisabled,
          isLoading: action.isLoading,
          isSelected: action.isSelected,
          onClick: (e) => {
            var _a;
            if (_isDisabled || action.isDisabled) return;
            (_a = action.onClick) == null ? void 0 : _a.call(action, e);
          }
        });
      }
      case "dropdown": {
        const btn = document.createElement("button");
        wrapper.appendChild(btn);
        const tt = action.tooltip ?? action.label ?? action.id;
        return new ArvoDropdownIconButton(btn, {
          size: "sm",
          variant: "tertiary",
          icon: action.icon,
          tooltip: tt,
          // ArvoDropdownIconButtonOptions['items'] is structurally compatible
          // with the framework-agnostic ArvoPanelMenuItem[] shape.
          items: action.items,
          placement: action.placement ?? "bottom-end",
          isDisabled: action.isDisabled,
          isLoading: action.isLoading,
          onSelect: (item) => {
            var _a;
            if (_isDisabled || action.isDisabled) return;
            (_a = action.onSelect) == null ? void 0 : _a.call(action, item.id);
          }
        });
      }
      case "split": {
        const btn = document.createElement("button");
        wrapper.appendChild(btn);
        const tt = action.tooltip ?? action.label ?? action.id;
        return new ArvoSplitIconButton(btn, {
          size: "sm",
          variant: "tertiary",
          icon: action.icon,
          tooltip: tt,
          triggerLabel: action.triggerLabel,
          items: action.items,
          placement: action.placement ?? "bottom-end",
          isDisabled: action.isDisabled,
          isActionDisabled: action.isActionDisabled,
          isTriggerDisabled: action.isTriggerDisabled,
          isLoading: action.isLoading,
          onAction: (e) => {
            var _a;
            if (_isDisabled || action.isDisabled) return;
            (_a = action.onClick) == null ? void 0 : _a.call(action, e);
          },
          onSelect: (item) => {
            var _a;
            if (_isDisabled || action.isDisabled) return;
            (_a = action.onSelect) == null ? void 0 : _a.call(action, item.id);
          }
        });
      }
      case "switch": {
        const sw = document.createElement("div");
        wrapper.appendChild(sw);
        if (action.label) wrapper.setAttribute("aria-label", action.label);
        return new ArvoSwitch(sw, {
          isChecked: action.isChecked ?? action.defaultChecked ?? false,
          isDisabled: action.isDisabled,
          isReadOnly: action.isReadOnly,
          isLoading: action.isLoading,
          onChange: (detail) => {
            var _a;
            if (_isDisabled || action.isDisabled) return;
            (_a = action.onChange) == null ? void 0 : _a.call(action, detail.isChecked);
          }
        });
      }
      case "checkbox": {
        const cb = document.createElement("div");
        wrapper.appendChild(cb);
        if (action.label) wrapper.setAttribute("aria-label", action.label);
        return new ArvoCheckbox(cb, {
          size: "sm",
          isChecked: action.isChecked ?? action.defaultChecked ?? false,
          isIndeterminate: action.isIndeterminate,
          isDisabled: action.isDisabled,
          isReadOnly: action.isReadOnly,
          isLoading: action.isLoading,
          onChange: (detail) => {
            var _a;
            if (_isDisabled || action.isDisabled) return;
            (_a = action.onChange) == null ? void 0 : _a.call(action, detail.isChecked);
          }
        });
      }
    }
    return null;
  }
  function insertPinSlot() {
    if (!_pinSlot || !hdrActionsEl) return;
    if (closeEl) {
      hdrActionsEl.insertBefore(_pinSlot, closeEl);
    } else {
      hdrActionsEl.appendChild(_pinSlot);
    }
  }
  function buildStickyContent() {
    var _a;
    if (!stickyEl || !_stickyConfig) return;
    try {
      _tabstripInstance == null ? void 0 : _tabstripInstance.destroy();
    } catch {
    }
    try {
      _searchInstance == null ? void 0 : _searchInstance.destroy();
    } catch {
    }
    try {
      _bannerInstance == null ? void 0 : _bannerInstance.destroy();
    } catch {
    }
    try {
      _infoInstance == null ? void 0 : _infoInstance.destroy();
    } catch {
    }
    _tabstripInstance = null;
    _searchInstance = null;
    _bannerInstance = null;
    _infoInstance = null;
    stickyEl.innerHTML = "";
    bannerEl = null;
    tabsEl = null;
    stickySlotEl = null;
    searchEl = null;
    infoEl = null;
    infoInnerEl = null;
    parent.classList.remove(
      `${block}--with-banner`,
      `${block}--with-tabs`,
      `${block}--with-search`,
      `${block}--with-info`
    );
    if (_stickyConfig.banner) {
      const bannerCfg = _stickyConfig.banner;
      bannerEl = el("div", `${block}__banner`, stickyEl);
      const bannerHostEl = document.createElement("div");
      bannerEl.appendChild(bannerHostEl);
      _bannerInstance = ArvoBannerAlert.initialize(bannerHostEl, {
        type: bannerCfg.type,
        title: bannerCfg.title ?? null,
        message: bannerCfg.message,
        isCompact: bannerCfg.isCompact,
        isDismissible: bannerCfg.isDismissible ?? false,
        button: bannerCfg.button ?? null,
        link: bannerCfg.link ?? null,
        onDismiss: bannerCfg.onDismiss
      });
      parent.classList.add(`${block}--with-banner`);
    }
    if (_stickyConfig.tabs && _stickyConfig.tabs.length > 0) {
      tabsEl = document.createElement("div");
      tabsEl.className = `${block}__tabs`;
      stickyEl.appendChild(tabsEl);
      const tabsCfg = _stickyConfig.tabs;
      const initialId = _selectedTabId ?? ((_a = tabsCfg.find((t) => !t.isDisabled)) == null ? void 0 : _a.id) ?? null;
      _selectedTabId = initialId;
      _tabstripInstance = new ArvoTabstrip(tabsEl, {
        variant: "primary",
        size: "sm",
        isFullWidth: true,
        tabs: tabsCfg,
        selectedId: initialId,
        onSelect: (detail) => {
          var _a2;
          _selectedTabId = detail.id;
          parent.dispatchEvent(
            new CustomEvent("tab-select", { bubbles: true, detail: { id: detail.id } })
          );
          (_a2 = options.onTabSelect) == null ? void 0 : _a2.call(options, detail.id);
        }
      });
      parent.classList.add(`${block}--with-tabs`);
    }
    if (_stickyConfig.slot) {
      stickySlotEl = el("div", `${block}__sticky-slot`, stickyEl);
      stickySlotEl.appendChild(_stickyConfig.slot);
    }
    if (_stickyConfig.search) {
      const searchCfg = typeof _stickyConfig.search === "object" ? _stickyConfig.search : {};
      const searchContainerEl = document.createElement("div");
      searchContainerEl.className = `${block}__search`;
      stickyEl.appendChild(searchContainerEl);
      searchEl = searchContainerEl;
      const searchHostEl = document.createElement("div");
      searchContainerEl.appendChild(searchHostEl);
      const handleSearchChange = (value) => {
        var _a2;
        _query = value;
        renderItems();
        updateInfoText();
        const matched = _items.length > 0 ? getFilteredItems().length : null;
        parent.dispatchEvent(
          new CustomEvent("search", {
            bubbles: true,
            detail: { value, matchedCount: matched }
          })
        );
        (_a2 = options.onSearchChange) == null ? void 0 : _a2.call(options, value, matched);
      };
      const handleSearchClear = () => {
        var _a2;
        _query = "";
        renderItems();
        updateInfoText();
        parent.dispatchEvent(
          new CustomEvent("search", {
            bubbles: true,
            detail: { value: "", matchedCount: _items.length || null }
          })
        );
        (_a2 = options.onSearchChange) == null ? void 0 : _a2.call(options, "", _items.length || null);
      };
      if (searchCfg.variant === "advance-search") {
        const bag = searchCfg.advanceSearchProps ?? void 0;
        _searchInstance = new ArvoAdvanceSearch(searchHostEl, {
          ...bag ?? {},
          variant: (bag == null ? void 0 : bag.variant) ?? "filterBy",
          value: _query,
          placeholder: searchCfg.placeholder ?? "Search",
          shortcut: searchCfg.shortcut ?? null,
          isFullWidth: true,
          onChange: handleSearchChange,
          onClear: handleSearchClear
        });
      } else {
        _searchInstance = new ArvoSearch(searchHostEl, {
          variant: "filter",
          value: _query,
          placeholder: searchCfg.placeholder ?? "Search",
          shortcut: searchCfg.shortcut ?? null,
          isFullWidth: true,
          counter: searchCfg.showCounter ? computeCounter() : null,
          onChange: handleSearchChange,
          onClear: handleSearchClear
        });
      }
      searchHostEl.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowDown" || !listEl) return;
        const firstItem = listEl.querySelector(`.${block}__item`);
        if (firstItem) {
          e.preventDefault();
          firstItem.focus();
          _tabRoving == null ? void 0 : _tabRoving.setActiveItem(0);
        }
      });
      parent.classList.add(`${block}--with-search`);
    }
    if (_stickyConfig.info) {
      infoEl = el("div", `${block}__info`, stickyEl);
      const { type, message } = resolveInfoConfig();
      _infoInstance = ArvoMessageAlert.initialize(document.createElement("div"), {
        type,
        message
      });
      infoInnerEl = _infoInstance.el;
      infoEl.appendChild(infoInnerEl);
      parent.classList.add(`${block}--with-info`);
      updateInfoText();
    }
  }
  function computeCounter() {
    if (_items.length === 0) return null;
    return { current: getFilteredItems().length, total: _items.length };
  }
  function getFilteredItems() {
    if (!_items.length) return [];
    if (!_query) return _items;
    return runItemFilter(_items, _query, {
      keys: options.filterKeys,
      getItemSearchText: options.getItemSearchText
    });
  }
  function renderItems() {
    if (!listEl) return;
    listEl.innerHTML = "";
    const filtered = getFilteredItems();
    if (_items.length === 0) {
      showEmpty("no-data");
      return;
    }
    if (filtered.length === 0 && _query) {
      showEmpty("no-results");
      return;
    }
    hideEmpty();
    for (const item of filtered) {
      const def = item;
      const classes = [`${block}__item`];
      if (def.isActive) classes.push("active");
      if (def.isDisabled) classes.push("is-disabled");
      const row = el("div", classes.join(" "), listEl);
      row.setAttribute("data-item-id", getItemId(item));
      row.setAttribute("tabindex", "-1");
      row.setAttribute("role", "option");
      if (def.isDisabled) row.setAttribute("aria-disabled", "true");
      if (options.renderItem) {
        options.renderItem(item, row);
      } else {
        renderDefaultItem(def, row, block);
      }
      row.addEventListener("click", () => {
        var _a;
        if (_isDisabled || def.isDisabled) return;
        parent.dispatchEvent(
          new CustomEvent("item-activate", {
            bubbles: true,
            detail: { id: getItemId(item), item }
          })
        );
        (_a = options.onItemActivate) == null ? void 0 : _a.call(options, getItemId(item), item);
      });
      row.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !_isDisabled && !def.isDisabled) {
          e.preventDefault();
          row.click();
        }
        if (e.key === "ArrowUp") {
          const items = listEl.querySelectorAll(`.${block}__item`);
          const idx = Array.from(items).indexOf(row);
          if (idx === 0 && _searchInstance) {
            e.preventDefault();
            _searchInstance.focus();
          }
        }
      });
    }
    setupTabRoving();
  }
  function setupTabRoving() {
    if (!listEl) return;
    _tabRoving == null ? void 0 : _tabRoving.deactivate();
    const items = Array.from(listEl.querySelectorAll(`.${block}__item`));
    if (items.length === 0) return;
    _tabRoving = createTabRoving();
    _tabRoving.activate({
      container: listEl,
      items,
      orientation: "vertical",
      wrap: true
    });
  }
  function showEmpty(state) {
    if (!emptyEl) return;
    emptyEl.style.display = "";
    if (listEl) listEl.style.display = "none";
    parent.classList.remove("no-data", "no-results");
    parent.classList.add(state);
    syncClearSearchVisibility(state);
  }
  function hideEmpty() {
    if (!emptyEl) return;
    emptyEl.style.display = "none";
    if (listEl) listEl.style.display = "";
    parent.classList.remove("no-data", "no-results");
    syncClearSearchVisibility(null);
  }
  function buildEmptyContent() {
    if (!emptyEl) return;
    emptyEl.innerHTML = "";
    const illusEl = el("div", `${block}__empty-illus`, emptyEl);
    illusEl.setAttribute("aria-hidden", "true");
    el("div", `${block}__empty-title`, emptyEl);
    el("div", `${block}__empty-msg`, emptyEl);
    const actionContainer = el("div", `${block}__empty-action`, emptyEl);
    actionContainer.style.display = "none";
    const clearBtnEl = document.createElement("button");
    actionContainer.appendChild(clearBtnEl);
    _clearSearchInstance = new ArvoButton(clearBtnEl, {
      size: "sm",
      variant: "outline",
      label: "Clear search",
      onClick: () => {
        if (_searchInstance) {
          _searchInstance.value("");
          _searchInstance.focus();
        }
        _query = "";
        renderItems();
        updateInfoText();
      }
    });
  }
  function syncClearSearchVisibility(state) {
    if (!emptyEl) return;
    const titleNode = emptyEl.querySelector(`.${block}__empty-title`);
    const msgNode = emptyEl.querySelector(`.${block}__empty-msg`);
    const actionNode = emptyEl.querySelector(`.${block}__empty-action`);
    if (state === "no-data") {
      if (titleNode) titleNode.textContent = "No data";
      if (msgNode) msgNode.textContent = "There are no items to display.";
      if (actionNode) actionNode.style.display = "none";
    } else if (state === "no-results") {
      if (titleNode) titleNode.textContent = "No results found";
      if (msgNode) msgNode.textContent = "Try adjusting your search terms.";
      if (actionNode) actionNode.style.display = "";
    } else {
      if (titleNode) titleNode.textContent = "";
      if (msgNode) msgNode.textContent = "";
      if (actionNode) actionNode.style.display = "none";
    }
  }
  function resolveInfoConfig() {
    const infoCfg = _stickyConfig && _stickyConfig.info ? _stickyConfig.info : null;
    if (!infoCfg) return { type: "info", message: "" };
    const type = infoCfg.type ?? "info";
    let message = "";
    if (infoCfg.showMatchCount && _items.length > 0) {
      const filtered = getFilteredItems();
      message = formatMatchCountMessage(filtered.length, infoCfg.matchCountTemplate);
    } else if (infoCfg.message) {
      message = infoCfg.message;
    }
    return { type, message };
  }
  function updateInfoText() {
    if (!infoEl || !_stickyConfig || !_stickyConfig.info) return;
    const { type, message } = resolveInfoConfig();
    const gatedHidden = _stickyConfig.info.showWhen === "filtered" && !_query;
    infoEl.style.display = gatedHidden || !message ? "none" : "";
    if (_infoInstance) {
      _infoInstance.type(type);
      _infoInstance.message(message);
    }
  }
  function destroyFooterActions() {
    var _a;
    for (const entry of _footerActionInstances) {
      try {
        (_a = entry.instance) == null ? void 0 : _a.destroy();
      } catch {
      }
      entry.wrapper.remove();
    }
    _footerActionInstances.length = 0;
  }
  function renderFooterActions() {
    if (!footerActionsEl || !_actions) return;
    destroyFooterActions();
    const footerActions = clampFooterActions(_actions, {
      componentName: `panel-shell (${block})`
    });
    for (const action of footerActions) {
      const btnEl = document.createElement("button");
      btnEl.setAttribute("data-action-id", action.id);
      if (action.isIconOnly) btnEl.setAttribute("data-icon-only", "true");
      footerActionsEl.appendChild(btnEl);
      const inst = new ArvoButton(btnEl, {
        size: action.size ?? "md",
        variant: action.variant ?? "secondary",
        label: action.label,
        icon: action.icon,
        isDisabled: action.isDisabled,
        isLoading: action.isLoading,
        onClick: (e) => {
          var _a;
          if (_isDisabled || action.isDisabled) return;
          (_a = action.onClick) == null ? void 0 : _a.call(action, e);
        }
      });
      _footerActionInstances.push({ id: action.id, wrapper: btnEl, instance: inst });
    }
  }
  const instance = {
    hdrEl,
    bodyEl,
    listEl,
    searchEl,
    stickyEl,
    footerEl,
    setItems(items) {
      _items = items;
      ensureItemsInfrastructure();
      renderItems();
      updateInfoText();
    },
    setContent(content) {
      _content = content;
      if (content == null) {
        if (contentEl) renderPanelContent(contentEl, null);
        return;
      }
      renderContentSlot();
    },
    setInfo(config2) {
      if (!_stickyConfig) return;
      _stickyConfig = { ..._stickyConfig, info: config2 };
      if (!config2) {
        if (infoEl) infoEl.style.display = "none";
        return;
      }
      if (!infoEl) {
        buildStickyContent();
        return;
      }
      updateInfoText();
    },
    setStickyHeader(cfg) {
      _stickyConfig = cfg;
      if (!cfg) {
        try {
          _tabstripInstance == null ? void 0 : _tabstripInstance.destroy();
        } catch {
        }
        try {
          _searchInstance == null ? void 0 : _searchInstance.destroy();
        } catch {
        }
        try {
          _bannerInstance == null ? void 0 : _bannerInstance.destroy();
        } catch {
        }
        try {
          _infoInstance == null ? void 0 : _infoInstance.destroy();
        } catch {
        }
        _tabstripInstance = null;
        _searchInstance = null;
        _bannerInstance = null;
        _infoInstance = null;
        if (stickyEl) {
          stickyEl.remove();
          stickyEl = null;
        }
        infoEl = null;
        infoInnerEl = null;
        parent.classList.remove(
          `${block}--with-banner`,
          `${block}--with-tabs`,
          `${block}--with-search`,
          `${block}--with-info`
        );
        return;
      }
      if (!stickyEl) {
        stickyEl = document.createElement("div");
        stickyEl.className = `${block}__sticky`;
        if (bodyEl) {
          parent.insertBefore(stickyEl, bodyEl);
        } else {
          parent.appendChild(stickyEl);
        }
      }
      buildStickyContent();
    },
    setHeaderActions(actions) {
      _headerActions = actions;
      renderHeaderActions();
      const validCount = actions.filter((a) => validateHeaderAction(a)).length;
      warnActionCap(validCount + pinnableCount + closableCount);
    },
    setActions(actions) {
      _actions = actions;
      if (!actions || actions.length === 0) {
        destroyFooterActions();
        destroyFooterFit();
        if (footerEl) {
          footerEl.remove();
          footerEl = null;
          footerActionsEl = null;
        }
        return;
      }
      if (!footerEl) {
        footerEl = el("div", `${block}__footer`, parent);
        footerActionsEl = el("div", `${block}__footer-actions`, footerEl);
      }
      renderFooterActions();
      attachFooterFit();
    },
    updateAction(id, patch) {
      const hdrIdx = _headerActions.findIndex((a) => a.id === id);
      if (hdrIdx >= 0) {
        _headerActions[hdrIdx] = { ..._headerActions[hdrIdx], ...patch };
        renderHeaderActions();
        return;
      }
      if (_actions) {
        const ftrIdx = _actions.findIndex((a) => a.id === id);
        if (ftrIdx >= 0) {
          _actions[ftrIdx] = { ..._actions[ftrIdx], ...patch };
          renderFooterActions();
          _footerFit == null ? void 0 : _footerFit.measure();
        }
      }
    },
    search(query) {
      if (query === void 0) return _query;
      _query = query;
      _searchInstance == null ? void 0 : _searchInstance.value(query);
      renderItems();
      updateInfoText();
    },
    selectedTab(id) {
      if (id === void 0) return _selectedTabId;
      _selectedTabId = id;
      _tabstripInstance == null ? void 0 : _tabstripInstance.select(id);
      parent.dispatchEvent(
        new CustomEvent("tab-select", {
          bubbles: true,
          detail: { id: _selectedTabId }
        })
      );
    },
    setTitle(title) {
      _title = title;
      if (titleEl) {
        titleEl.textContent = title ?? "";
      }
    },
    loading(state) {
      if (state === void 0) return _isLoading;
      _isLoading = state;
      parent.classList.toggle("loading", state);
      parent.setAttribute("aria-busy", String(state));
      if (skeletonEl) {
        skeletonEl.style.display = state ? "" : "none";
      }
      if (listEl) {
        listEl.style.display = state ? "none" : "";
      }
      if (emptyEl) {
        emptyEl.style.display = state ? "none" : "";
      }
      if (contentEl) {
        contentEl.style.display = state ? "none" : "";
      }
    },
    disabled(state) {
      if (state === void 0) return _isDisabled;
      _isDisabled = state;
      parent.classList.toggle("is-disabled", state);
      if (state) {
        parent.setAttribute("aria-disabled", "true");
      } else {
        parent.removeAttribute("aria-disabled");
      }
    },
    focus(target) {
      const effectiveTarget = target ?? "first";
      if (effectiveTarget === "search" && _searchInstance) {
        _searchInstance.focus();
        return;
      }
      if (effectiveTarget === "title" && titleEl) {
        titleEl.setAttribute("tabindex", "-1");
        titleEl.focus();
        return;
      }
      if (effectiveTarget === "list" && listEl) {
        const firstItem = listEl.querySelector(`.${block}__item`);
        if (firstItem) {
          firstItem.focus();
          _tabRoving == null ? void 0 : _tabRoving.setActiveItem(0);
        }
        return;
      }
      if (_searchInstance) {
        _searchInstance.focus();
        return;
      }
      if (bodyEl) {
        const focusable = bodyEl.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable) {
          focusable.focus();
          return;
        }
      }
      if (titleEl) {
        titleEl.setAttribute("tabindex", "-1");
        titleEl.focus();
      }
    },
    setPinSlot(slotEl) {
      if (_pinSlot && _pinSlot.parentNode) {
        _pinSlot.remove();
      }
      _pinSlot = slotEl;
      insertPinSlot();
    },
    setTitleLeading(leadingEl) {
      if (_titleLeading && _titleLeading.parentNode) {
        _titleLeading.remove();
      }
      _titleLeading = leadingEl;
      if (titleLeadingHostEl && _titleLeading) {
        titleLeadingHostEl.appendChild(_titleLeading);
      }
    },
    setTitleTrailing(trailingEl) {
      if (_titleTrailing && _titleTrailing.parentNode) {
        _titleTrailing.remove();
      }
      _titleTrailing = trailingEl;
      if (titleTrailingHostEl && _titleTrailing) {
        titleTrailingHostEl.appendChild(_titleTrailing);
      }
    },
    getElement() {
      return parent;
    },
    destroy() {
      if (_destroyed) return;
      _destroyed = true;
      _tabRoving == null ? void 0 : _tabRoving.deactivate();
      _tabRoving = null;
      try {
        _infoInstance == null ? void 0 : _infoInstance.destroy();
      } catch {
      }
      try {
        _backInstance == null ? void 0 : _backInstance.destroy();
      } catch {
      }
      try {
        _closeInstance == null ? void 0 : _closeInstance.destroy();
      } catch {
      }
      try {
        _searchInstance == null ? void 0 : _searchInstance.destroy();
      } catch {
      }
      try {
        _tabstripInstance == null ? void 0 : _tabstripInstance.destroy();
      } catch {
      }
      try {
        _clearSearchInstance == null ? void 0 : _clearSearchInstance.destroy();
      } catch {
      }
      try {
        _bannerInstance == null ? void 0 : _bannerInstance.destroy();
      } catch {
      }
      _infoInstance = null;
      _backInstance = null;
      _closeInstance = null;
      _searchInstance = null;
      _tabstripInstance = null;
      _clearSearchInstance = null;
      _bannerInstance = null;
      infoInnerEl = null;
      destroyHeaderActions();
      destroyFooterActions();
      destroyFooterFit();
      parent.innerHTML = "";
    }
  };
  return instance;
}
export {
  createPanelShell
};
//# sourceMappingURL=PanelShell.js.map
