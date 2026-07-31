"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const tokenize = require("./index42.cjs");
const locale = require("./index43.cjs");
const fields = require("./index56.cjs");
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
function monthLookup(locale$1) {
  const map = /* @__PURE__ */ new Map();
  for (const kind of ["full", "abbrev"]) {
    locale.getMonthNames(locale$1, kind).forEach((name, index) => {
      map.set(normalizeName(name), index);
    });
  }
  return map;
}
function ampmLookup(locale$1) {
  const { am, pm } = locale.getAmPmStrings(locale$1);
  const map = /* @__PURE__ */ new Map();
  map.set(normalizeName(am), "am");
  map.set(normalizeName(pm), "pm");
  map.set("am", "am");
  map.set("pm", "pm");
  return map;
}
function fragmentFor(token, locale$1, slots) {
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
        ...locale.getMonthNames(locale$1, "full"),
        ...locale.getMonthNames(locale$1, "abbrev")
      ]);
      return `(${alt})`;
    }
    case "ampm": {
      slots.push({ kind: "ampm", length: len });
      const { am, pm } = locale.getAmPmStrings(locale$1);
      const alt = buildAlternation([am, pm, "AM", "PM"]);
      return `(${alt})`;
    }
    case "timezone":
      slots.push({ kind: "timezone", length: len });
      return "([+-]\\d{2}:?\\d{0,2})";
    case "dayName": {
      const alt = buildAlternation([
        ...locale.getDayNames(locale$1, "full"),
        ...locale.getDayNames(locale$1, "abbrev")
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
function compileFormat(format, locale2) {
  const tokens = tokenize.tokenizeFormat(format);
  const slots = [];
  let source = "^\\s*";
  for (const token of tokens) {
    source += fragmentFor(token, locale2, slots);
  }
  source += "\\s*$";
  return { regex: new RegExp(source, "i"), slots };
}
function extract(match, slots, locale2) {
  const fields$1 = { hasTime: false };
  const months = monthLookup(locale2);
  const periods = ampmLookup(locale2);
  slots.forEach((slot, i) => {
    const raw = match[i + 1];
    if (raw === void 0) return;
    switch (slot.kind) {
      case "year": {
        let year = Number(raw);
        if (slot.length <= 2 && year < 100) year = fields.applyYearPivot(year);
        fields$1.year = year;
        break;
      }
      case "month":
        fields$1.month = Number(raw) - 1;
        break;
      case "monthName": {
        const idx = months.get(normalizeName(raw));
        if (idx === void 0) return;
        fields$1.month = idx;
        break;
      }
      case "day":
        fields$1.day = Number(raw);
        break;
      case "hour24":
        fields$1.hour = Number(raw);
        fields$1.hasTime = true;
        break;
      case "hour12":
        fields$1.hour12 = Number(raw);
        fields$1.hasTime = true;
        break;
      case "minute":
        fields$1.minute = Number(raw);
        fields$1.hasTime = true;
        break;
      case "second":
        fields$1.second = Number(raw);
        fields$1.hasTime = true;
        break;
      case "fraction":
        fields$1.millisecond = Number((raw + "000").slice(0, 3));
        fields$1.hasTime = true;
        break;
      case "ampm": {
        const period = periods.get(normalizeName(raw));
        if (period) fields$1.ampm = period;
        break;
      }
      case "timezone":
        fields$1.timezone = raw;
        break;
    }
  });
  if (fields$1.hour12 !== void 0) {
    let h = fields$1.hour12 % 12;
    if (fields$1.ampm === "pm") h += 12;
    fields$1.hour = h;
  }
  return fields$1;
}
function parseCore(value, format, locale2) {
  const { regex, slots } = compileFormat(format, locale2);
  const match = regex.exec(value.trim());
  if (!match) return null;
  const fields$1 = extract(match, slots, locale2);
  return fields.buildDateFromFields(fields$1);
}
function parseDate(value, format, locale$1) {
  if (typeof value !== "string" || value.trim() === "") return null;
  return parseCore(value, format, locale.getUserLocale(locale$1));
}
function parseDateTime(value, format, locale$1) {
  if (typeof value !== "string" || value.trim() === "") return null;
  return parseCore(value, format, locale.getUserLocale(locale$1));
}
function parseTime(value, format) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const locale$1 = locale.getUserLocale();
  const { regex, slots } = compileFormat(format, locale$1);
  const match = regex.exec(value.trim());
  if (!match) return null;
  const fields2 = extract(match, slots, locale$1);
  if (!fields2.hasTime) return null;
  const hours = fields2.hour ?? 0;
  const minutes = fields2.minute ?? 0;
  const seconds = fields2.second;
  const ms = fields2.millisecond;
  if (hours < 0 || hours > 23) return null;
  if (minutes < 0 || minutes > 59) return null;
  if (seconds !== void 0 && (seconds < 0 || seconds > 59)) return null;
  const result = { hours, minutes };
  if (seconds !== void 0) result.seconds = seconds;
  if (ms !== void 0) result.milliseconds = ms;
  if (fields2.timezone !== void 0) result.timezone = fields2.timezone;
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
  const tokens = tokenize.tokenizeFormat(format);
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
exports.parseDate = parseDate;
exports.parseDateTime = parseDateTime;
exports.parseTime = parseTime;
exports.splitDateTimeFormat = splitDateTimeFormat;
//# sourceMappingURL=index45.cjs.map
