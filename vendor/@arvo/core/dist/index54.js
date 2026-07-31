import { daysInMonth } from "./index56.js";
function getSegmentBounds(kind, context) {
  switch (kind) {
    case "year":
      return { min: 1, max: 9999 };
    case "month":
      return { min: 1, max: 12 };
    case "day": {
      const year = (context == null ? void 0 : context.year) ?? 2e3;
      const month = context == null ? void 0 : context.month;
      const max = month === void 0 ? 31 : daysInMonth(year, month);
      return { min: 1, max };
    }
    case "hour24":
      return { min: 0, max: 23 };
    case "hour12":
      return { min: 1, max: 12 };
    case "minute":
    case "second":
      return { min: 0, max: 59 };
    case "fraction":
      return { min: 0, max: 999 };
    default:
      return null;
  }
}
export {
  getSegmentBounds
};
//# sourceMappingURL=index54.js.map
