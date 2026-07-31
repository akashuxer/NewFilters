"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const ACCENT_RE = /[\u0300-\u036f]/g;
function normalizeQuery(query, options) {
  let result = query;
  if (!(options == null ? void 0 : options.caseSensitive)) result = result.toLowerCase();
  if (!(options == null ? void 0 : options.accentSensitive)) result = result.normalize("NFD").replace(ACCENT_RE, "");
  return result;
}
function filterItems(items, options) {
  const { query, keys = ["label"], caseSensitive, accentSensitive } = options;
  if (!query) return items;
  const normalizedQuery = normalizeQuery(query, { caseSensitive, accentSensitive });
  return items.filter(
    (item) => keys.some((key) => {
      const value = item[key];
      if (value == null) return false;
      return normalizeQuery(value, { caseSensitive, accentSensitive }).includes(normalizedQuery);
    })
  );
}
function filterGroups(groups, options) {
  if (!options.query) return groups;
  const result = [];
  for (const group of groups) {
    const filtered = filterItems(group.items, options);
    if (filtered.length > 0) {
      result.push({ ...group, items: filtered });
    }
  }
  return result;
}
exports.filterGroups = filterGroups;
exports.filterItems = filterItems;
exports.normalizeQuery = normalizeQuery;
//# sourceMappingURL=index24.cjs.map
