import { attachTitleTruncationTooltip } from "@arvo/utils";
import { ArvoCheckbox } from "../components/Checkbox/Checkbox.js";
function isGroupedOptions(items) {
  return items.length > 0 && "items" in items[0];
}
function flattenOptions(items) {
  if (isGroupedOptions(items)) {
    const result = [];
    for (const group of items) {
      for (const item of group.items) result.push(item);
    }
    return result;
  }
  return items;
}
function createOptionRow(item, flatIndex, cfg) {
  var _a;
  const { block } = cfg;
  const variant = cfg.variant ?? "standard";
  const selectionMode = cfg.selectionMode ?? "single";
  const isMultiple = selectionMode === "multiple";
  const isRich = variant === "rich";
  const el = document.createElement("div");
  const selected = cfg.isSelected(item.value);
  const highlighted = flatIndex === cfg.highlightedIndex;
  el.className = [
    `${block}__opt`,
    item.isDisabled && "is-disabled",
    highlighted && "highlighted",
    selected && !isMultiple && "active"
  ].filter(Boolean).join(" ");
  el.setAttribute("role", "option");
  el.setAttribute("id", cfg.optionId(flatIndex));
  el.setAttribute("aria-selected", String(selected));
  if (cfg.emitDataIndex !== false) {
    el.setAttribute("data-index", String(flatIndex));
  }
  if (item.isDisabled) {
    el.setAttribute("aria-disabled", "true");
  }
  if (isMultiple) {
    const checkSlot = document.createElement("span");
    checkSlot.className = `${block}__opt__check`;
    checkSlot.setAttribute("aria-hidden", "true");
    const ctrlEl = document.createElement("span");
    checkSlot.appendChild(ctrlEl);
    const cb = ArvoCheckbox.initialize(ctrlEl, {
      size: "sm",
      isChecked: selected,
      isDisabled: item.isDisabled === true
    });
    (_a = cfg.onCheckbox) == null ? void 0 : _a.call(cfg, cb);
    el.appendChild(checkSlot);
  }
  const showAvatar = isRich && !!item.avatar;
  const showIcon = !!item.icon && !showAvatar;
  const showSecondary = isRich && !!item.secondaryLabel;
  if (showAvatar) {
    const av = document.createElement("img");
    av.className = `${block}__opt__avatar`;
    av.src = item.avatar;
    av.setAttribute("alt", "");
    av.setAttribute("aria-hidden", "true");
    el.appendChild(av);
  } else if (showIcon) {
    const ico = document.createElement("span");
    ico.className = `${block}__opt__ico o9con o9con-${item.icon}`;
    ico.setAttribute("aria-hidden", "true");
    el.appendChild(ico);
  }
  const writeLabel = (lblEl2) => {
    if (cfg.renderLabel) {
      cfg.renderLabel(item, lblEl2);
    } else {
      lblEl2.textContent = item.label;
    }
  };
  let lblEl = null;
  if (isRich) {
    const txt = document.createElement("span");
    txt.className = `${block}__opt__txt`;
    const lbl = document.createElement("span");
    lbl.className = `${block}__opt__lbl`;
    writeLabel(lbl);
    txt.appendChild(lbl);
    lblEl = lbl;
    if (showSecondary) {
      const sec = document.createElement("span");
      sec.className = `${block}__opt__secondary`;
      sec.textContent = item.secondaryLabel ?? "";
      txt.appendChild(sec);
    }
    el.appendChild(txt);
  } else {
    const lbl = document.createElement("span");
    lbl.className = `${block}__opt__lbl`;
    writeLabel(lbl);
    el.appendChild(lbl);
    lblEl = lbl;
  }
  if (lblEl && item.label && cfg.onTruncationHandle) {
    const handle = attachTitleTruncationTooltip({
      triggerElement: el,
      element: lblEl,
      content: item.label,
      placement: "top-center"
    });
    cfg.onTruncationHandle(handle);
  }
  return el;
}
function renderOptionListBody(listEl, cfg) {
  const { block, filteredItems, groupIdPrefix, hasGroupDividers = true } = cfg;
  const optionEls = [];
  if (isGroupedOptions(filteredItems)) {
    let flatIdx = 0;
    filteredItems.forEach((group, groupIdx) => {
      if (groupIdx > 0 && hasGroupDividers) {
        const divider = document.createElement("hr");
        divider.className = `${block}__divider`;
        divider.setAttribute("role", "separator");
        listEl.appendChild(divider);
      }
      const groupEl = document.createElement("div");
      groupEl.className = `${block}__grp`;
      groupEl.setAttribute("role", "group");
      if (group.label) {
        const grpHdrId = `${groupIdPrefix}-${groupIdx}`;
        groupEl.setAttribute("aria-labelledby", grpHdrId);
        const header = document.createElement("div");
        header.id = grpHdrId;
        header.className = `${block}__grp-hdr`;
        header.textContent = group.label;
        groupEl.appendChild(header);
      }
      for (const item of group.items) {
        const optEl = createOptionRow(item, flatIdx, cfg);
        groupEl.appendChild(optEl);
        optionEls.push(optEl);
        flatIdx++;
      }
      listEl.appendChild(groupEl);
    });
  } else {
    filteredItems.forEach((item, idx) => {
      const optEl = createOptionRow(item, idx, cfg);
      listEl.appendChild(optEl);
      optionEls.push(optEl);
    });
  }
  return optionEls;
}
export {
  createOptionRow,
  flattenOptions,
  isGroupedOptions,
  renderOptionListBody
};
//# sourceMappingURL=option-list-render.js.map
