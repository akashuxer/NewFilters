"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const DEFAULT_LOCALE = "en-US";
function groupThousands(abs) {
  return Math.trunc(abs).toLocaleString(DEFAULT_LOCALE);
}
function compact(value) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
function formatBadgeCount(value, options = {}) {
  const { autoFormat = false, overflowCount, localeAware = false, isRatioPart = false } = options;
  const safe = Number.isFinite(value) ? value : 0;
  if (!isRatioPart && typeof overflowCount === "number" && Number.isFinite(overflowCount) && safe > overflowCount) {
    return `${overflowCount}+`;
  }
  if (!autoFormat) {
    return String(Math.trunc(safe));
  }
  const sign = safe < 0 ? "-" : "";
  const abs = Math.abs(Math.trunc(safe));
  if (abs >= 1e6) {
    if (abs % 1e5 === 0) return `${sign}${compact(abs / 1e6)}M`;
    return `${sign}${groupThousands(abs)}`;
  }
  if (abs >= 1e3) {
    if (abs % 100 === 0) return `${sign}${compact(abs / 1e3)}K`;
    return `${sign}${groupThousands(abs)}`;
  }
  return `${sign}${abs}`;
}
exports.formatBadgeCount = formatBadgeCount;
//# sourceMappingURL=index27.cjs.map
