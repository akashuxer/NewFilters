"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const parse = require("./index45.cjs");
const KEY_FORMATS = [
  "yyyy-MM-ddTHH:mm:ss",
  "yyyy-MM-dd HH:mm:ss",
  "yyyy/MM/dd HH:mm:ss",
  "yyyy-MM-dd",
  "yyyy/MM/dd",
  "yyyy.MM.dd",
  "MM/dd/yyyy HH:mm:ss",
  "MM/dd/yyyy",
  "dd-MMM-yyyy",
  "dd/MM/yyyy",
  "dd-MM-yyyy"
];
function parseMemberKey(key) {
  if (typeof key !== "string" || key.trim() === "") return null;
  const value = key.trim();
  for (const format of KEY_FORMATS) {
    const parsed = parse.parseDateTime(value, format, "en-US");
    if (parsed) return parsed;
  }
  const native = Date.parse(value);
  if (!Number.isNaN(native)) return new Date(native);
  return null;
}
exports.parseMemberKey = parseMemberKey;
//# sourceMappingURL=index55.cjs.map
