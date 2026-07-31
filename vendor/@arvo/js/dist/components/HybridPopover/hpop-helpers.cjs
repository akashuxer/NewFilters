"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let _hasInlineWarned = false;
function warnHasInlineDeprecated() {
  if (_hasInlineWarned) return;
  _hasInlineWarned = true;
  console.warn(
    "HybridPopover: item.hasInline is deprecated; use item.inline instead."
  );
}
function resolveItemInline(item) {
  if (item.inline) return item.inline;
  if (!item.hasInline) return null;
  warnHasInlineDeprecated();
  if (item.hasInline === true) return {};
  if (Array.isArray(item.hasInline)) return { items: item.hasInline };
  return item.hasInline;
}
function isPopoverInlineConfig(cfg) {
  return "content" in cfg && cfg.content != null;
}
const EMPTY_DEFAULTS = {
  noDataTitle: "No data available",
  noDataMessage: "There are no values to display.",
  noResultsTitle: "No results found",
  noResultsMessage: "Adjust your filter search query.",
  noResultsClearLabel: "Clear Search",
  appliesToAllMessage: "This filter currently applies to all values."
};
function mapListEmptyState(kind, config, onClear) {
  const cfg = { ...EMPTY_DEFAULTS, ...config };
  const isNoResults = kind === "no-results";
  return {
    // Figma spec 7.13 caps the illustration at 124px (`--arvo-illus-124`);
    // ArvoList renders ArvoEmptyState at size='md' which honors that cap.
    illustration: isNoResults ? "no-results" : "no-data",
    title: isNoResults ? cfg.noResultsTitle : cfg.noDataTitle,
    description: isNoResults ? cfg.noResultsMessage : cfg.noDataMessage,
    ctaLabel: isNoResults && onClear ? cfg.noResultsClearLabel : void 0,
    onCtaClick: isNoResults && onClear ? onClear : void 0
  };
}
function isGroupedItems(items) {
  return items.length > 0 && "items" in items[0];
}
function toListItem(item, groupDraggable) {
  const inlineCfg = resolveItemInline(item);
  const draggable = groupDraggable && item.isDraggable !== false;
  return {
    id: item.id,
    label: item.label,
    icon: item.icon,
    isDisabled: item.isDisabled,
    isExcluded: item.isExcluded,
    isIndeterminate: item.isIndeterminate,
    isReorderable: draggable ? void 0 : false,
    hasInlineNav: inlineCfg !== null,
    data: item
  };
}
function toListPayload(items, enableReorder) {
  if (items.length === 0) return { items: [] };
  if (isGroupedItems(items)) {
    return {
      groups: items.map((g) => ({
        id: g.id,
        label: g.label,
        hasSelectAll: g.hasSelectAll,
        items: g.items.map(
          (it) => toListItem(it, enableReorder && g.isDraggable !== false)
        )
      }))
    };
  }
  return {
    items: items.map(
      (it) => toListItem(it, enableReorder)
    )
  };
}
exports.isGroupedItems = isGroupedItems;
exports.isPopoverInlineConfig = isPopoverInlineConfig;
exports.mapListEmptyState = mapListEmptyState;
exports.resolveItemInline = resolveItemInline;
exports.toListItem = toListItem;
exports.toListPayload = toListPayload;
exports.warnHasInlineDeprecated = warnHasInlineDeprecated;
//# sourceMappingURL=hpop-helpers.cjs.map
