import { getDateTimeConfig } from "./index41.js";
import { tokenizeFormat } from "./index42.js";
import { getUserLocale, getAmPmStrings, getDayNames, getMonthNames } from "./index43.js";
function pad(value, length) {
  return String(value).padStart(length, "0");
}
function formatFraction(milliseconds, length) {
  const base = pad(milliseconds, 3);
  if (length <= 3) return base.slice(0, length);
  return base + "0".repeat(length - 3);
}
function formatOffset(totalMinutes, withColon) {
  const sign = totalMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(totalMinutes);
  const hh = pad(Math.floor(abs / 60), 2);
  if (!withColon) return `${sign}${hh}`;
  return `${sign}${hh}:${pad(abs % 60, 2)}`;
}
function parseOffsetMinutes(tz) {
  const trimmed = tz.trim();
  if (trimmed === "Z" || trimmed === "z") return 0;
  const match = /^([+-])(\d{2}):?(\d{2})?$/.exec(trimmed);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = match[3] ? Number(match[3]) : 0;
  return sign * (hours * 60 + minutes);
}
function accessorsFor(date) {
  const utc = getDateTimeConfig().timezone === "utc";
  if (utc) {
    return {
      year: () => date.getUTCFullYear(),
      month: () => date.getUTCMonth(),
      day: () => date.getUTCDate(),
      weekday: () => date.getUTCDay(),
      hours: () => date.getUTCHours(),
      minutes: () => date.getUTCMinutes(),
      seconds: () => date.getUTCSeconds(),
      ms: () => date.getUTCMilliseconds(),
      offsetMinutes: () => 0
    };
  }
  return {
    year: () => date.getFullYear(),
    month: () => date.getMonth(),
    day: () => date.getDate(),
    weekday: () => date.getDay(),
    hours: () => date.getHours(),
    minutes: () => date.getMinutes(),
    seconds: () => date.getSeconds(),
    ms: () => date.getMilliseconds(),
    offsetMinutes: () => -date.getTimezoneOffset()
  };
}
function renderToken(token, acc, locale, tzString) {
  const len = token.length ?? token.raw.length;
  switch (token.kind) {
    case "year":
      return len >= 4 ? pad(acc.year(), 4) : pad(acc.year() % 100, 2);
    case "month":
      return len >= 2 ? pad(acc.month() + 1, 2) : String(acc.month() + 1);
    case "monthName":
      return getMonthNames(locale, len >= 4 ? "full" : "abbrev")[acc.month()];
    case "day":
      return len >= 2 ? pad(acc.day(), 2) : String(acc.day());
    case "dayName":
      return getDayNames(locale, len >= 4 ? "full" : "abbrev")[acc.weekday()];
    case "hour24":
      return len >= 2 ? pad(acc.hours(), 2) : String(acc.hours());
    case "hour12": {
      const h12 = (acc.hours() + 11) % 12 + 1;
      return len >= 2 ? pad(h12, 2) : String(h12);
    }
    case "minute":
      return len >= 2 ? pad(acc.minutes(), 2) : String(acc.minutes());
    case "second":
      return len >= 2 ? pad(acc.seconds(), 2) : String(acc.seconds());
    case "fraction":
      return formatFraction(acc.ms(), len);
    case "ampm": {
      const { am, pm } = getAmPmStrings(locale);
      return acc.hours() < 12 ? am : pm;
    }
    case "timezone": {
      const minutes = tzString !== void 0 ? parseOffsetMinutes(tzString) : acc.offsetMinutes();
      return formatOffset(minutes, len >= 3);
    }
    case "literal":
    default:
      return token.raw;
  }
}
function walk(date, format, locale, tzString) {
  const acc = accessorsFor(date);
  const tokens = tokenizeFormat(format);
  let out = "";
  for (const token of tokens) {
    out += renderToken(token, acc, locale, tzString);
  }
  return out;
}
function assertValid(date) {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError("Invalid Date passed to formatter");
  }
}
function formatDate(date, format, locale) {
  assertValid(date);
  return walk(date, format, getUserLocale(locale));
}
function formatDateTime(date, format, locale) {
  assertValid(date);
  return walk(date, format, getUserLocale(locale));
}
function formatTime(time, format) {
  const utc = getDateTimeConfig().timezone === "utc";
  const h = time.hours;
  const mi = time.minutes;
  const s = time.seconds ?? 0;
  const ms = time.milliseconds ?? 0;
  const date = utc ? new Date(Date.UTC(2e3, 0, 1, h, mi, s, ms)) : new Date(2e3, 0, 1, h, mi, s, ms);
  return walk(date, format, getUserLocale(), time.timezone);
}
export {
  formatDate,
  formatDateTime,
  formatTime
};
//# sourceMappingURL=index44.js.map
