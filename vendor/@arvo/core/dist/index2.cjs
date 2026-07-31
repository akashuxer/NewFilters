"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const _emitted = /* @__PURE__ */ new Set();
function isProduction() {
  try {
    return typeof process !== "undefined" && typeof process.env !== "undefined" && process.env.NODE_ENV === "production";
  } catch {
    return false;
  }
}
function warnDeprecated(options) {
  if (isProduction()) return;
  const key = options.key ?? options.component;
  if (_emitted.has(key)) return;
  _emitted.add(key);
  const parts = [];
  parts.push(`[Arvo] ${options.component} is deprecated and will be removed in the next major release.`);
  parts.push(`Use ${options.successor} instead.`);
  if (options.reason) {
    parts.push(options.reason);
  }
  if (options.migrationUrl) {
    parts.push(`See ${options.migrationUrl}.`);
  }
  console.warn(parts.join(" "));
}
exports.warnDeprecated = warnDeprecated;
//# sourceMappingURL=index2.cjs.map
