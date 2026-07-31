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
export {
  configureDateTime,
  getDateTimeConfig,
  resetDateTimeConfig
};
//# sourceMappingURL=index41.js.map
