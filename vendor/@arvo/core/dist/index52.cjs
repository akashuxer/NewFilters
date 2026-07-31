"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const locale = require("./index43.cjs");
const index = require("./index50.cjs");
function resolveCurrentMember(index2) {
  if (index2.currentIndex === null) return null;
  return index2.members[index2.currentIndex] ?? null;
}
function rollingRangeToMembers(index2, range) {
  const current = resolveCurrentMember(index2);
  if (!current || index2.currentIndex === null) {
    return { start: null, end: null, included: [] };
  }
  const base = index2.currentIndex;
  const count = index2.count;
  const startPos = base + range.startOffset;
  const endPos = base + range.endOffset;
  const start = startPos >= 0 && startPos < count ? index2.members[startPos] : null;
  const end = endPos >= 0 && endPos < count ? index2.members[endPos] : null;
  const lo = Math.max(0, startPos);
  const hi = Math.min(count - 1, endPos);
  const included = startPos <= endPos && lo <= hi ? index2.members.slice(lo, hi + 1) : [];
  return { start, end, included };
}
function validateRollingRange(index2, range) {
  if (range.startOffset > range.endOffset) {
    return { ok: false, code: "start_gt_end" };
  }
  if (index2.currentIndex === null || !index2.members[index2.currentIndex]) {
    return { ok: false, code: "no_current_member" };
  }
  const base = index2.currentIndex;
  if (base + range.startOffset < 0) return { ok: false, code: "start_below_min" };
  if (base + range.endOffset > index2.count - 1) {
    return { ok: false, code: "end_above_max" };
  }
  return { ok: true };
}
function formatRollingValue(value, prefix) {
  const signed = value > 0 ? `+${value}` : `${value}`;
  return `${prefix} ${signed}`;
}
function formatRollingRange(range) {
  return `${formatRollingValue(range.startOffset, range.prefix)} - ${formatRollingValue(
    range.endOffset,
    range.prefix
  )}`;
}
const FREQ_PLURAL = {
  day: "days",
  week: "weeks",
  month: "months",
  quarter: "quarters",
  year: "years"
};
function singularize(label) {
  return label.endsWith("s") ? label.slice(0, -1) : label;
}
function pluralLabel(frequency, count, frequencyLabel) {
  const plural = frequencyLabel ?? FREQ_PLURAL[frequency];
  return count === 1 ? singularize(plural) : plural;
}
function includedMessage(count, frequency, frequencyLabel, locale$1) {
  const resolved = locale.getUserLocale(locale$1);
  const number = new Intl.NumberFormat(resolved).format(count);
  return `Range includes ${number} ${pluralLabel(frequency, count, frequencyLabel)}`;
}
function rangeIncludedCount(index$1, start, end) {
  return index.getMembersInRange(index$1, start, end).length;
}
function rangeIncludedMessage(index2, start, end, frequencyLabel, locale2) {
  return includedMessage(
    rangeIncludedCount(index2, start, end),
    index2.frequency,
    frequencyLabel,
    locale2
  );
}
function rollingIncludedCount(index2, range) {
  return rollingRangeToMembers(index2, range).included.length;
}
function formatRollingAnchor(n) {
  if (n === 0) return "Current";
  if (n > 0) return `Current +${n}`;
  return `Current − ${Math.abs(n)}`;
}
function rollingIncludedMessage(index2, range, frequencyLabel, locale$1) {
  const resolved = locale.getUserLocale(locale$1);
  const fmt = new Intl.NumberFormat(resolved);
  const count = fmt.format(rollingIncludedCount(index2, range));
  const total = fmt.format(index2.count);
  const startAnchor = formatRollingAnchor(range.startOffset);
  const endAnchor = formatRollingAnchor(range.endOffset);
  return `${count} of ${total} members included (${startAnchor} to ${endAnchor})`;
}
exports.formatRollingRange = formatRollingRange;
exports.formatRollingValue = formatRollingValue;
exports.rangeIncludedCount = rangeIncludedCount;
exports.rangeIncludedMessage = rangeIncludedMessage;
exports.resolveCurrentMember = resolveCurrentMember;
exports.rollingIncludedCount = rollingIncludedCount;
exports.rollingIncludedMessage = rollingIncludedMessage;
exports.rollingRangeToMembers = rollingRangeToMembers;
exports.validateRollingRange = validateRollingRange;
//# sourceMappingURL=index52.cjs.map
