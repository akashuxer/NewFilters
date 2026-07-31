"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const config = require("./index41.cjs");
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function applyYearPivot(twoDigitYear) {
  return twoDigitYear < 50 ? 2e3 + twoDigitYear : 1900 + twoDigitYear;
}
function buildDateFromFields(fields) {
  const now = /* @__PURE__ */ new Date();
  const isTimeOnly = fields.year === void 0 && fields.month === void 0 && fields.day === void 0;
  const year = fields.year ?? now.getFullYear();
  const month = fields.month ?? (isTimeOnly ? now.getMonth() : 0);
  const day = fields.day ?? (isTimeOnly ? now.getDate() : 1);
  const hour = fields.hour ?? 0;
  const minute = fields.minute ?? 0;
  const second = fields.second ?? 0;
  const ms = fields.millisecond ?? 0;
  const utc = config.getDateTimeConfig().timezone === "utc";
  let date;
  if (utc) {
    date = new Date(Date.UTC(year, month, day, hour, minute, second, ms));
    if (year >= 0 && year < 100) date.setUTCFullYear(year);
  } else {
    date = new Date(year, month, day, hour, minute, second, ms);
    if (year >= 0 && year < 100) date.setFullYear(year);
  }
  if (Number.isNaN(date.getTime())) return null;
  const ry = utc ? date.getUTCFullYear() : date.getFullYear();
  const rmo = utc ? date.getUTCMonth() : date.getMonth();
  const rd = utc ? date.getUTCDate() : date.getDate();
  const rh = utc ? date.getUTCHours() : date.getHours();
  const rmi = utc ? date.getUTCMinutes() : date.getMinutes();
  if (ry !== year || rmo !== month || rd !== day) return null;
  if (fields.hour !== void 0 && rh !== hour && !hourGapAllowed(rh, hour))
    return null;
  if (fields.minute !== void 0 && rmi !== minute) return null;
  return date;
}
function hourGapAllowed(realized, requested) {
  return realized - requested === 1;
}
exports.applyYearPivot = applyYearPivot;
exports.buildDateFromFields = buildDateFromFields;
exports.daysInMonth = daysInMonth;
//# sourceMappingURL=index56.cjs.map
