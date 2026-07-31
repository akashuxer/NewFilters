"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const DEFAULT_CONFIG = {
  weekStart: 0,
  timezone: "local"
};
let current = { ...DEFAULT_CONFIG };
function configureDateTime(config) {
  if (config.timezone !== void 0 && config.timezone !== "local" && config.timezone !== "utc") {
    throw new RangeError("Unsupported timezone");
  }
  current = { ...current, ...config };
}
function getDateTimeConfig() {
  return { ...current };
}
function resetDateTimeConfig() {
  current = { ...DEFAULT_CONFIG };
}
exports.configureDateTime = configureDateTime;
exports.getDateTimeConfig = getDateTimeConfig;
exports.resetDateTimeConfig = resetDateTimeConfig;
//# sourceMappingURL=index41.cjs.map
