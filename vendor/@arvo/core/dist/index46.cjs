"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const fields = require("./index56.cjs");
function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
const normalize = normalizeDate;
function dayCompare(a, b) {
  if (a.getFullYear() !== b.getFullYear()) return a.getFullYear() - b.getFullYear();
  if (a.getMonth() !== b.getMonth()) return a.getMonth() - b.getMonth();
  return a.getDate() - b.getDate();
}
function isSameDay(a, b) {
  return dayCompare(a, b) === 0;
}
function isBeforeDay(a, b) {
  return dayCompare(a, b) < 0;
}
function isAfterDay(a, b) {
  return dayCompare(a, b) > 0;
}
function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
function isSameYear(a, b) {
  return a.getFullYear() === b.getFullYear();
}
function isSameQuarter(a, b) {
  return a.getFullYear() === b.getFullYear() && Math.floor(a.getMonth() / 3) === Math.floor(b.getMonth() / 3);
}
function isoMonday(date) {
  const isoDay = date.getDay() === 0 ? 7 : date.getDay();
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - (isoDay - 1)
  );
}
function isSameWeek(a, b) {
  return isSameDay(isoMonday(a), isoMonday(b));
}
function addDays(date, days) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
}
function addMonths(date, months) {
  const total = date.getMonth() + months;
  const targetYear = date.getFullYear() + Math.floor(total / 12);
  const targetMonth = (total % 12 + 12) % 12;
  const day = Math.min(date.getDate(), fields.daysInMonth(targetYear, targetMonth));
  return new Date(
    targetYear,
    targetMonth,
    day,
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
}
function inDateRange(date, min, max) {
  if (min && dayCompare(date, min) < 0) return false;
  if (max && dayCompare(date, max) > 0) return false;
  return true;
}
function pickAnchorDate(preferred, min, max) {
  if (preferred) return preferred;
  const today = /* @__PURE__ */ new Date();
  if (inDateRange(today, min, max)) return today;
  if (min) {
    return new Date(min.getFullYear(), min.getMonth(), min.getDate());
  }
  if (max) {
    return new Date(max.getFullYear(), max.getMonth(), max.getDate());
  }
  return today;
}
exports.addDays = addDays;
exports.addMonths = addMonths;
exports.inDateRange = inDateRange;
exports.isAfterDay = isAfterDay;
exports.isBeforeDay = isBeforeDay;
exports.isSameDay = isSameDay;
exports.isSameMonth = isSameMonth;
exports.isSameQuarter = isSameQuarter;
exports.isSameWeek = isSameWeek;
exports.isSameYear = isSameYear;
exports.normalize = normalize;
exports.normalizeDate = normalizeDate;
exports.pickAnchorDate = pickAnchorDate;
//# sourceMappingURL=index46.cjs.map
