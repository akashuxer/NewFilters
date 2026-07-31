import { daysInMonth } from "./index56.js";
import { parseMemberKey } from "./index55.js";
import { frequencyFromDates } from "./index51.js";
function dayCompare(a, b) {
  if (a.getFullYear() !== b.getFullYear()) return a.getFullYear() - b.getFullYear();
  if (a.getMonth() !== b.getMonth()) return a.getMonth() - b.getMonth();
  return a.getDate() - b.getDate();
}
function compareDateTime(a, b) {
  return a.getTime() - b.getTime();
}
function computeEndDate(keyDate, frequency) {
  const y = keyDate.getFullYear();
  const m = keyDate.getMonth();
  const d = keyDate.getDate();
  switch (frequency) {
    case "day":
      return new Date(y, m, d);
    case "week":
      return new Date(y, m, d + 6);
    case "month":
      return new Date(y, m, daysInMonth(y, m));
    case "quarter": {
      const endMonth = Math.floor(m / 3) * 3 + 2;
      return new Date(y, endMonth, daysInMonth(y, endMonth));
    }
    case "year":
    default:
      return new Date(y, 11, 31);
  }
}
function buildMemberIndex(members, options) {
  const currentIndex = (options == null ? void 0 : options.currentMemberIndex) ?? null;
  const parsed = [];
  members.forEach((item, i) => {
    const keyDate = parseMemberKey(item.key);
    if (keyDate) parsed.push({ item, keyDate, original: i });
  });
  if (parsed.length === 0) {
    return {
      members: [],
      byKey: {},
      byIndex: {},
      count: 0,
      frequency: (options == null ? void 0 : options.frequency) ?? "day",
      minDate: /* @__PURE__ */ new Date(NaN),
      maxDate: /* @__PURE__ */ new Date(NaN),
      currentIndex
    };
  }
  parsed.sort((a, b) => compareDateTime(a.keyDate, b.keyDate));
  const frequency = (options == null ? void 0 : options.frequency) ?? frequencyFromDates(parsed.map((p) => p.keyDate));
  const normalized = parsed.map((p) => ({
    ...p.item,
    index: p.item.index ?? p.original,
    keyDate: p.keyDate,
    endDate: computeEndDate(p.keyDate, frequency)
  }));
  const byKey = {};
  const byIndex = {};
  for (const member of normalized) {
    byKey[member.key] = member;
    byIndex[member.index] = member;
  }
  return {
    members: normalized,
    byKey,
    byIndex,
    count: normalized.length,
    frequency,
    minDate: normalized[0].keyDate,
    maxDate: normalized[normalized.length - 1].endDate,
    currentIndex
  };
}
function findMemberForDate(index, date) {
  const { members } = index;
  let lo = 0;
  let hi = members.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (dayCompare(members[mid].keyDate, date) <= 0) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (found === -1) return null;
  const candidate = members[found];
  return dayCompare(date, candidate.endDate) <= 0 ? candidate : null;
}
const findMemberByDate = findMemberForDate;
function findMemberByIndex(index, i) {
  return index.byIndex[i] ?? null;
}
function getMembersForYear(index, year) {
  return index.members.filter((m) => m.keyDate.getFullYear() === year);
}
function getMembersForMonth(index, year, month) {
  return index.members.filter(
    (m) => m.keyDate.getFullYear() === year && m.keyDate.getMonth() === month
  );
}
function getMembersForDecade(index, decadeStart) {
  return index.members.filter((m) => {
    const y = m.keyDate.getFullYear();
    return y >= decadeStart && y <= decadeStart + 9;
  });
}
function getMembersInRange(index, start, end) {
  return index.members.filter(
    (m) => dayCompare(m.keyDate, start) >= 0 && dayCompare(m.keyDate, end) <= 0
  );
}
const listMembersBetween = getMembersInRange;
function getMemberRange(start, end) {
  return { start: start.keyDate, end: end.endDate };
}
function isMemberInRange(member, min, max) {
  if (min && dayCompare(member.endDate, min) < 0) return false;
  if (max && dayCompare(member.keyDate, max) > 0) return false;
  return true;
}
export {
  buildMemberIndex,
  findMemberByDate,
  findMemberByIndex,
  findMemberForDate,
  getMemberRange,
  getMembersForDecade,
  getMembersForMonth,
  getMembersForYear,
  getMembersInRange,
  isMemberInRange,
  listMembersBetween,
  parseMemberKey
};
//# sourceMappingURL=index50.js.map
