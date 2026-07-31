import { getDateTimeConfig } from "./index41.js";
import { tokenizeFormat } from "./index42.js";
function getUserLocale(override) {
  if (override) return override;
  const configured = getDateTimeConfig().locale;
  if (configured) return configured;
  if (typeof document !== "undefined" && document.documentElement) {
    const lang = document.documentElement.lang;
    if (lang) return lang;
  }
  return "en-US";
}
const monthNameCache = /* @__PURE__ */ new Map();
const dayNameCache = /* @__PURE__ */ new Map();
const ampmCache = /* @__PURE__ */ new Map();
const hourCycleCache = /* @__PURE__ */ new Map();
const dateFormatCache = /* @__PURE__ */ new Map();
const MONTH_REF_DAY = 15;
const MONTH_REF_YEAR = 2021;
const WEEK_REF = new Date(2021, 7, 1);
function monthFormatter(locale, kind) {
  return new Intl.DateTimeFormat(locale, {
    month: kind === "full" ? "long" : "short"
  });
}
function getMonthNames(locale, kind) {
  const cacheKey = `${locale}|${kind}`;
  const cached = monthNameCache.get(cacheKey);
  if (cached) return cached;
  const fmt = monthFormatter(locale, kind);
  const names = [];
  for (let m = 0; m < 12; m += 1) {
    names.push(fmt.format(new Date(MONTH_REF_YEAR, m, MONTH_REF_DAY)));
  }
  monthNameCache.set(cacheKey, names);
  return names;
}
function getDayNames(locale, kind) {
  const cacheKey = `${locale}|${kind}`;
  const cached = dayNameCache.get(cacheKey);
  if (cached) return cached;
  const fmt = new Intl.DateTimeFormat(locale, {
    weekday: kind === "full" ? "long" : "short"
  });
  const names = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(WEEK_REF.getFullYear(), WEEK_REF.getMonth(), 1 + i);
    names.push(fmt.format(d));
  }
  dayNameCache.set(cacheKey, names);
  return names;
}
function getWeekdayHeaders(locale, weekStart, kind) {
  const names = kind === "narrow" ? narrowDayNames(locale) : kind === "min" ? min2DayNames(locale) : getDayNames(locale, kind === "full" ? "full" : "abbrev");
  const start = (weekStart % 7 + 7) % 7;
  const out = [];
  for (let i = 0; i < 7; i += 1) {
    out.push(names[(start + i) % 7]);
  }
  return out;
}
const narrowCache = /* @__PURE__ */ new Map();
function narrowDayNames(locale) {
  const cached = narrowCache.get(locale);
  if (cached) return cached;
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const names = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(WEEK_REF.getFullYear(), WEEK_REF.getMonth(), 1 + i);
    names.push(fmt.format(d));
  }
  narrowCache.set(locale, names);
  return names;
}
const min2Cache = /* @__PURE__ */ new Map();
function min2DayNames(locale) {
  const cached = min2Cache.get(locale);
  if (cached) return cached;
  const names = getDayNames(locale, "abbrev").map((n) => n.slice(0, 2));
  min2Cache.set(locale, names);
  return names;
}
function getAmPmStrings(locale) {
  const cached = ampmCache.get(locale);
  if (cached) return cached;
  const fmt = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    hour12: true
  });
  const am = dayPeriodOf(fmt, new Date(2020, 0, 1, 9, 0)) || "AM";
  const pm = dayPeriodOf(fmt, new Date(2020, 0, 1, 21, 0)) || "PM";
  const result = { am, pm };
  ampmCache.set(locale, result);
  return result;
}
function dayPeriodOf(fmt, date) {
  const part = fmt.formatToParts(date).find((p) => p.type === "dayPeriod");
  return part ? part.value : "";
}
const TWELVE_HOUR_CYCLES = /* @__PURE__ */ new Set(["h11", "h12"]);
const TWENTY_FOUR_HOUR_CYCLES = /* @__PURE__ */ new Set(["h23", "h24"]);
function localeUses12Hour(locale) {
  const cached = hourCycleCache.get(locale);
  if (cached !== void 0) return cached;
  let result;
  const resolved = new Intl.DateTimeFormat(locale, {
    hour: "numeric"
  }).resolvedOptions();
  const hourCycle = resolved.hourCycle ?? "";
  if (TWELVE_HOUR_CYCLES.has(hourCycle)) {
    result = true;
  } else if (TWENTY_FOUR_HOUR_CYCLES.has(hourCycle)) {
    result = false;
  } else {
    const parts = new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "numeric"
    }).formatToParts(new Date(2020, 0, 1, 13, 0));
    result = parts.some((p) => p.type === "dayPeriod");
  }
  hourCycleCache.set(locale, result);
  return result;
}
function shouldUse12Hour(input) {
  if (input.format) {
    const tokens = tokenizeFormat(input.format);
    let hasHour12 = false;
    let hasHour24 = false;
    let hasAmPm = false;
    for (const t of tokens) {
      if (t.kind === "hour12") hasHour12 = true;
      else if (t.kind === "hour24") hasHour24 = true;
      else if (t.kind === "ampm") hasAmPm = true;
    }
    if (hasHour12) return true;
    if (hasHour24) return false;
    if (hasAmPm) return true;
  }
  return localeUses12Hour(getUserLocale(input.locale));
}
function getLocaleDateFormat(locale) {
  const cached = dateFormatCache.get(locale);
  if (cached) return cached;
  const parts = new Intl.DateTimeFormat(locale, {
    dateStyle: "short"
  }).formatToParts(new Date(2021, 10, 22));
  let out = "";
  for (const part of parts) {
    switch (part.type) {
      case "year":
        out += "yyyy";
        break;
      case "month":
        out += "MM";
        break;
      case "day":
        out += "dd";
        break;
      case "literal":
        out += part.value;
        break;
    }
  }
  if (!out) out = "yyyy-MM-dd";
  dateFormatCache.set(locale, out);
  return out;
}
function getLocaleTimeFormat(locale, use24Hour) {
  const twelve = use24Hour === void 0 ? localeUses12Hour(locale) : !use24Hour;
  return twelve ? "hh:mm tt" : "HH:mm";
}
function getLocaleDateTimeFormat(locale, use24Hour) {
  return `${getLocaleDateFormat(locale)} ${getLocaleTimeFormat(locale, use24Hour)}`;
}
export {
  getAmPmStrings,
  getDayNames,
  getLocaleDateFormat,
  getLocaleDateTimeFormat,
  getLocaleTimeFormat,
  getMonthNames,
  getUserLocale,
  getWeekdayHeaders,
  shouldUse12Hour
};
//# sourceMappingURL=index43.js.map
