import { tokenizeFormat } from "./index42.js";
import { getUserLocale, getDayNames, getAmPmStrings, getMonthNames } from "./index43.js";
import { buildDateFromFields, applyYearPivot } from "./index56.js";
function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function normalizeName(value) {
  return value.trim().toLowerCase().replace(/\.$/, "");
}
function buildAlternation(names) {
  const unique = [...new Set(names)].filter(Boolean);
  unique.sort((a, b) => b.length - a.length);
  return unique.map(escapeRegExp).join("|");
}
function monthLookup(locale) {
  const map = /* @__PURE__ */ new Map();
  for (const kind of ["full", "abbrev"]) {
    getMonthNames(locale, kind).forEach((name, index) => {
      map.set(normalizeName(name), index);
    });
  }
  return map;
}
function ampmLookup(locale) {
  const { am, pm } = getAmPmStrings(locale);
  const map = /* @__PURE__ */ new Map();
  map.set(normalizeName(am), "am");
  map.set(normalizeName(pm), "pm");
  map.set("am", "am");
  map.set("pm", "pm");
  return map;
}
function fragmentFor(token, locale, slots) {
  const len = token.length ?? token.raw.length;
  switch (token.kind) {
    case "year":
      slots.push({ kind: "year", length: len });
      return len >= 4 ? "(\\d{1,4})" : "(\\d{1,2})";
    case "month":
    case "day":
    case "hour24":
    case "hour12":
    case "minute":
    case "second":
      slots.push({ kind: token.kind, length: len });
      return "(\\d{1,2})";
    case "fraction":
      slots.push({ kind: "fraction", length: len });
      return "(\\d{1,7})";
    case "monthName": {
      slots.push({ kind: "monthName", length: len });
      const alt = buildAlternation([
        ...getMonthNames(locale, "full"),
        ...getMonthNames(locale, "abbrev")
      ]);
      return `(${alt})`;
    }
    case "ampm": {
      slots.push({ kind: "ampm", length: len });
      const { am, pm } = getAmPmStrings(locale);
      const alt = buildAlternation([am, pm, "AM", "PM"]);
      return `(${alt})`;
    }
    case "timezone":
      slots.push({ kind: "timezone", length: len });
      return "([+-]\\d{2}:?\\d{0,2})";
    case "dayName": {
      const alt = buildAlternation([
        ...getDayNames(locale, "full"),
        ...getDayNames(locale, "abbrev")
      ]);
      return `(?:${alt})`;
    }
    case "literal":
    default: {
      const escaped = escapeRegExp(token.raw);
      return escaped.replace(/\s+/g, "\\s*");
    }
  }
}
function compileFormat(format, locale) {
  const tokens = tokenizeFormat(format);
  const slots = [];
  let source = "^\\s*";
  for (const token of tokens) {
    source += fragmentFor(token, locale, slots);
  }
  source += "\\s*$";
  return { regex: new RegExp(source, "i"), slots };
}
function extract(match, slots, locale) {
  const fields = { hasTime: false };
  const months = monthLookup(locale);
  const periods = ampmLookup(locale);
  slots.forEach((slot, i) => {
    const raw = match[i + 1];
    if (raw === void 0) return;
    switch (slot.kind) {
      case "year": {
        let year = Number(raw);
        if (slot.length <= 2 && year < 100) year = applyYearPivot(year);
        fields.year = year;
        break;
      }
      case "month":
        fields.month = Number(raw) - 1;
        break;
      case "monthName": {
        const idx = months.get(normalizeName(raw));
        if (idx === void 0) return;
        fields.month = idx;
        break;
      }
      case "day":
        fields.day = Number(raw);
        break;
      case "hour24":
        fields.hour = Number(raw);
        fields.hasTime = true;
        break;
      case "hour12":
        fields.hour12 = Number(raw);
        fields.hasTime = true;
        break;
      case "minute":
        fields.minute = Number(raw);
        fields.hasTime = true;
        break;
      case "second":
        fields.second = Number(raw);
        fields.hasTime = true;
        break;
      case "fraction":
        fields.millisecond = Number((raw + "000").slice(0, 3));
        fields.hasTime = true;
        break;
      case "ampm": {
        const period = periods.get(normalizeName(raw));
        if (period) fields.ampm = period;
        break;
      }
      case "timezone":
        fields.timezone = raw;
        break;
    }
  });
  if (fields.hour12 !== void 0) {
    let h = fields.hour12 % 12;
    if (fields.ampm === "pm") h += 12;
    fields.hour = h;
  }
  return fields;
}
function parseCore(value, format, locale) {
  const { regex, slots } = compileFormat(format, locale);
  const match = regex.exec(value.trim());
  if (!match) return null;
  const fields = extract(match, slots, locale);
  return buildDateFromFields(fields);
}
function parseDate(value, format, locale) {
  if (typeof value !== "string" || value.trim() === "") return null;
  return parseCore(value, format, getUserLocale(locale));
}
function parseDateTime(value, format, locale) {
  if (typeof value !== "string" || value.trim() === "") return null;
  return parseCore(value, format, getUserLocale(locale));
}
function parseTime(value, format) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const locale = getUserLocale();
  const { regex, slots } = compileFormat(format, locale);
  const match = regex.exec(value.trim());
  if (!match) return null;
  const fields = extract(match, slots, locale);
  if (!fields.hasTime) return null;
  const hours = fields.hour ?? 0;
  const minutes = fields.minute ?? 0;
  const seconds = fields.second;
  const ms = fields.millisecond;
  if (hours < 0 || hours > 23) return null;
  if (minutes < 0 || minutes > 59) return null;
  if (seconds !== void 0 && (seconds < 0 || seconds > 59)) return null;
  const result = { hours, minutes };
  if (seconds !== void 0) result.seconds = seconds;
  if (ms !== void 0) result.milliseconds = ms;
  if (fields.timezone !== void 0) result.timezone = fields.timezone;
  return result;
}
const TIME_KINDS = /* @__PURE__ */ new Set([
  "hour24",
  "hour12",
  "minute",
  "second",
  "fraction",
  "ampm",
  "timezone"
]);
const DATE_KINDS = /* @__PURE__ */ new Set([
  "year",
  "month",
  "monthName",
  "day",
  "dayName"
]);
function splitDateTimeFormat(format) {
  const tokens = tokenizeFormat(format);
  let lastDate = -1;
  let firstTime = -1;
  tokens.forEach((token, i) => {
    if (DATE_KINDS.has(token.kind)) lastDate = i;
    if (firstTime === -1 && TIME_KINDS.has(token.kind)) firstTime = i;
  });
  if (firstTime === -1) {
    return { datePart: format, timePart: "", separator: "" };
  }
  if (lastDate === -1) {
    return { datePart: "", timePart: format, separator: "" };
  }
  const raw = (from, to) => tokens.slice(from, to).map((t) => t.raw).join("");
  const datePart = raw(0, lastDate + 1);
  const separator = raw(lastDate + 1, firstTime);
  const timePart = raw(firstTime, tokens.length);
  return { datePart, timePart, separator };
}
export {
  parseDate,
  parseDateTime,
  parseTime,
  splitDateTimeFormat
};
//# sourceMappingURL=index45.js.map
