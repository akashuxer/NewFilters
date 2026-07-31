import { daysInMonth } from "./index56.js";
function getMonthRange(year, month) {
  return {
    start: new Date(year, month, 1),
    end: new Date(year, month, daysInMonth(year, month))
  };
}
function getYearRange(year) {
  return { start: new Date(year, 0, 1), end: new Date(year, 11, 31) };
}
function overlaps(periodStart, periodEnd, min, max) {
  if (max && periodStart > endOfDay(max)) return false;
  if (min && periodEnd < startOfDay(min)) return false;
  return true;
}
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function endOfDay(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  );
}
function monthOverlapsRange(year, month, min, max) {
  const { start, end } = getMonthRange(year, month);
  return overlaps(start, end, min, max);
}
function yearOverlapsRange(year, min, max) {
  const { start, end } = getYearRange(year);
  return overlaps(start, end, min, max);
}
export {
  getMonthRange,
  getYearRange,
  monthOverlapsRange,
  yearOverlapsRange
};
//# sourceMappingURL=index49.js.map
