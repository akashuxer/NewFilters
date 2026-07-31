"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const focusable = require("./index3.cjs");
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
      return options.root ? focusable.getFirstFocusable(options.root) : null;
    case "body":
      return options.body ? focusable.getFirstFocusable(options.body) : null;
    case "footer":
      return options.footer ? focusable.getFirstFocusable(options.footer) : null;
    case "header":
      return options.header ? focusable.getFirstFocusable(options.header) : null;
    case "custom":
      return (options.stickyHeader ? focusable.getFirstFocusable(options.stickyHeader) : null) ?? (options.body ? focusable.getFirstFocusable(options.body) : null) ?? (options.footer ? focusable.getFirstFocusable(options.footer) : null) ?? (options.header ? focusable.getFirstFocusable(options.header) : null) ?? (options.root ? focusable.getFirstFocusable(options.root) : null);
    case "auto":
    default:
      return (options.stickyHeader ? focusable.getFirstFocusable(options.stickyHeader) : null) ?? (options.body ? focusable.getFirstFocusable(options.body) : null) ?? (options.footer ? focusable.getFirstFocusable(options.footer) : null) ?? (options.header ? focusable.getFirstFocusable(options.header) : null) ?? (options.root ? focusable.getFirstFocusable(options.root) : null);
  }
}
exports.resolveOverlayInitialFocus = resolveOverlayInitialFocus;
//# sourceMappingURL=index7.cjs.map
