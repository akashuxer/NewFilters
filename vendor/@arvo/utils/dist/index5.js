import { filterItems } from "@arvo/core";
const VALID_ACTION_TYPES = /* @__PURE__ */ new Set(["btn", "dropdown", "split", "switch", "checkbox"]);
function validateHeaderAction(action) {
  if (VALID_ACTION_TYPES.has(action.type)) return true;
  if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    console.warn(
      `[panel-shell] Unknown header-action type "${action.type}"${action.id ? ` (id: "${action.id}")` : ""}. Allowed types: ${[...VALID_ACTION_TYPES].join(", ")}. This entry will be skipped.`
    );
  }
  return false;
}
function runItemFilter(items, query, opts) {
  if (!query) return items;
  if (opts == null ? void 0 : opts.getItemSearchText) {
    const q = query.toLowerCase();
    return items.filter((item) => opts.getItemSearchText(item).toLowerCase().includes(q));
  }
  const filterOpts = {
    query,
    keys: (opts == null ? void 0 : opts.keys) ?? ["label"]
  };
  return filterItems(items, filterOpts);
}
function formatMatchCountMessage(count, template) {
  const tmpl = template ?? "{count} matching results";
  return tmpl.replace("{count}", String(count));
}
export {
  formatMatchCountMessage,
  runItemFilter,
  validateHeaderAction
};
//# sourceMappingURL=index5.js.map
