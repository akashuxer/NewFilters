import { getFirstFocusable } from "./index3.js";
function resolveExplicitTarget(target) {
  if (!target) return void 0;
  if (typeof HTMLElement !== "undefined" && target instanceof HTMLElement) return target;
  if (typeof target === "function") return target() ?? null;
  return void 0;
}
function resolveOverlayInitialFocus(options) {
  const explicit = resolveExplicitTarget(options.initialFocus);
  if (explicit !== void 0) return explicit;
  switch (options.initialFocus) {
    case "none":
      return null;
    case "first":
      return options.root ? getFirstFocusable(options.root) : null;
    case "body":
      return options.body ? getFirstFocusable(options.body) : null;
    case "footer":
      return options.footer ? getFirstFocusable(options.footer) : null;
    case "header":
      return options.header ? getFirstFocusable(options.header) : null;
    case "custom":
      return (options.stickyHeader ? getFirstFocusable(options.stickyHeader) : null) ?? (options.body ? getFirstFocusable(options.body) : null) ?? (options.footer ? getFirstFocusable(options.footer) : null) ?? (options.header ? getFirstFocusable(options.header) : null) ?? (options.root ? getFirstFocusable(options.root) : null);
    case "auto":
    default:
      return (options.stickyHeader ? getFirstFocusable(options.stickyHeader) : null) ?? (options.body ? getFirstFocusable(options.body) : null) ?? (options.footer ? getFirstFocusable(options.footer) : null) ?? (options.header ? getFirstFocusable(options.header) : null) ?? (options.root ? getFirstFocusable(options.root) : null);
  }
}
export {
  resolveOverlayInitialFocus
};
//# sourceMappingURL=index7.js.map
