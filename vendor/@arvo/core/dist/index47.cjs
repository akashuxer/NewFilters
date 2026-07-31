"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function isLeapYear(year) {
  return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}
function dayOfYear(date) {
  const monthLengths = [
    31,
    isLeapYear(date.getFullYear()) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ];
  let doy = date.getDate();
  for (let m = 0; m < date.getMonth(); m += 1) doy += monthLengths[m];
  return doy;
}
function getWeekNumber(date) {
  const isoDay = date.getDay() === 0 ? 7 : date.getDay();
  const thursday = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + (4 - isoDay)
  );
  return Math.floor((dayOfYear(thursday) - 1) / 7) + 1;
}
function formatWeekNumber(n) {
  return `W${String(n).padStart(2, "0")}`;
}
exports.formatWeekNumber = formatWeekNumber;
exports.getWeekNumber = getWeekNumber;
//# sourceMappingURL=index47.cjs.map
