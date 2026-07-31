"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const config = require("./index41.cjs");
const weekNumber = require("./index47.cjs");
function getMonthMatrix(year, month, options) {
  const weekStart = (options == null ? void 0 : options.weekStart) ?? config.getDateTimeConfig().weekStart ?? 0;
  const showWeeks = (options == null ? void 0 : options.showWeeks) ?? false;
  const firstWeekday = new Date(year, month, 1).getDay();
  const lead = (firstWeekday - weekStart + 7) % 7;
  const weeks = [];
  for (let row = 0; row < 6; row += 1) {
    const days = [];
    let thursday = null;
    for (let col = 0; col < 7; col += 1) {
      const date = new Date(year, month, 1 - lead + row * 7 + col);
      days.push({ date, inMonth: date.getMonth() === month });
      if (date.getDay() === 4) thursday = date;
    }
    weeks.push({
      weekNumber: showWeeks && thursday ? weekNumber.getWeekNumber(thursday) : null,
      days
    });
  }
  return { weeks, weekStart };
}
exports.getMonthMatrix = getMonthMatrix;
//# sourceMappingURL=index48.cjs.map
