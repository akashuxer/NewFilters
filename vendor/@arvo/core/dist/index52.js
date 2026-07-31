import { getUserLocale } from "./index43.js";
import { getMembersInRange } from "./index50.js";
function resolveCurrentMember(index) {
  if (index.currentIndex === null) return null;
  return index.members[index.currentIndex] ?? null;
}
function rollingRangeToMembers(index, range) {
  const current = resolveCurrentMember(index);
  if (!current || index.currentIndex === null) {
    return { start: null, end: null, included: [] };
  }
  const base = index.currentIndex;
  const count = index.count;
  const startPos = base + range.startOffset;
  const endPos = base + range.endOffset;
  const start = startPos >= 0 && startPos < count ? index.members[startPos] : null;
  const end = endPos >= 0 && endPos < count ? index.members[endPos] : null;
  const lo = Math.max(0, startPos);
  const hi = Math.min(count - 1, endPos);
  const included = startPos <= endPos && lo <= hi ? index.members.slice(lo, hi + 1) : [];
  return { start, end, included };
}
function validateRollingRange(index, range) {
  if (range.startOffset > range.endOffset) {
    return { ok: false, code: "start_gt_end" };
  }
  if (index.currentIndex === null || !index.members[index.currentIndex]) {
    return { ok: false, code: "no_current_member" };
  }
  const base = index.currentIndex;
  if (base + range.startOffset < 0) return { ok: false, code: "start_below_min" };
  if (base + range.endOffset > index.count - 1) {
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
function includedMessage(count, frequency, frequencyLabel, locale) {
  const resolved = getUserLocale(locale);
  const number = new Intl.NumberFormat(resolved).format(count);
  return `Range includes ${number} ${pluralLabel(frequency, count, frequencyLabel)}`;
}
function rangeIncludedCount(index, start, end) {
  return getMembersInRange(index, start, end).length;
}
function rangeIncludedMessage(index, start, end, frequencyLabel, locale) {
  return includedMessage(
    rangeIncludedCount(index, start, end),
    index.frequency,
    frequencyLabel,
    locale
  );
}
function rollingIncludedCount(index, range) {
  return rollingRangeToMembers(index, range).included.length;
}
function formatRollingAnchor(n) {
  if (n === 0) return "Current";
  if (n > 0) return `Current +${n}`;
  return `Current − ${Math.abs(n)}`;
}
function rollingIncludedMessage(index, range, frequencyLabel, locale) {
  const resolved = getUserLocale(locale);
  const fmt = new Intl.NumberFormat(resolved);
  const count = fmt.format(rollingIncludedCount(index, range));
  const total = fmt.format(index.count);
  const startAnchor = formatRollingAnchor(range.startOffset);
  const endAnchor = formatRollingAnchor(range.endOffset);
  return `${count} of ${total} members included (${startAnchor} to ${endAnchor})`;
}
export {
  formatRollingRange,
  formatRollingValue,
  rangeIncludedCount,
  rangeIncludedMessage,
  resolveCurrentMember,
  rollingIncludedCount,
  rollingIncludedMessage,
  rollingRangeToMembers,
  validateRollingRange
};
//# sourceMappingURL=index52.js.map
