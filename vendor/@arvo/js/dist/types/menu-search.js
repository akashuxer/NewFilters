const MENU_SEARCH_DEFAULTS = {
  placeholder: "Search",
  isClearable: true,
  searchMode: "input",
  minChars: 0
};
function normalizeSearch(prop, defaults = {}) {
  if (!prop) return null;
  const base = { ...MENU_SEARCH_DEFAULTS, ...defaults };
  if (prop === true) return base;
  return { ...base, ...prop };
}
export {
  normalizeSearch
};
//# sourceMappingURL=menu-search.js.map
