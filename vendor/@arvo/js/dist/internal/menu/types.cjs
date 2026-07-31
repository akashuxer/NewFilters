"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function isContextMenuGrouped(items) {
  var _a;
  return items.length > 0 && typeof items[0] === "object" && Array.isArray((_a = items[0]) == null ? void 0 : _a.items);
}
function flattenContextMenuItems(items) {
  if (isContextMenuGrouped(items)) {
    return items.flatMap((g) => g.items);
  }
  return items;
}
function isContextMenuFocusable(item) {
  if (item.kind === "separator") return false;
  return !item.isDisabled;
}
function isContextMenuSelected(item) {
  if (item.kind === "separator") return false;
  if (item.kind === "checkbox" || item.kind === "radio") return !!item.checked;
  return !!item.isSelected;
}
exports.flattenContextMenuItems = flattenContextMenuItems;
exports.isContextMenuFocusable = isContextMenuFocusable;
exports.isContextMenuGrouped = isContextMenuGrouped;
exports.isContextMenuSelected = isContextMenuSelected;
//# sourceMappingURL=types.cjs.map
