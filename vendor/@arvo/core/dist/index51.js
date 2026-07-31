import { parseMemberKey } from "./index55.js";
const DAY_MS = 864e5;
function frequencyFromDates(dates) {
  if (dates.length < 2) return "week";
  const tally = {
    day: 0,
    week: 0,
    month: 0,
    quarter: 0,
    year: 0
  };
  for (let i = 1; i < dates.length; i += 1) {
    const delta = Math.round(
      (dates[i].getTime() - dates[i - 1].getTime()) / DAY_MS
    );
    if (delta === 1) tally.day += 1;
    else if (delta >= 6 && delta <= 8) tally.week += 1;
    else if (delta >= 28 && delta <= 31) tally.month += 1;
    else if (delta >= 89 && delta <= 92) tally.quarter += 1;
    else if (delta >= 360 && delta <= 366) tally.year += 1;
  }
  let best = "week";
  let bestCount = 0;
  Object.keys(tally).forEach((freq) => {
    if (tally[freq] > bestCount) {
      bestCount = tally[freq];
      best = freq;
    }
  });
  return bestCount === 0 ? "week" : best;
}
function detectFrequency(members) {
  const dates = [];
  for (const member of members) {
    const date = parseMemberKey(member.key);
    if (date) dates.push(date);
  }
  dates.sort((a, b) => a.getTime() - b.getTime());
  return frequencyFromDates(dates);
}
function getFrequencyViewConfig(frequency) {
  switch (frequency) {
    case "day":
    case "week":
      return { navigationUnit: "month", membersPerView: null };
    case "month":
      return { navigationUnit: "year", membersPerView: 12 };
    case "quarter":
      return { navigationUnit: "year", membersPerView: 4 };
    case "year":
    default:
      return { navigationUnit: "decade", membersPerView: 10 };
  }
}
function getAdjacentMember(index, member, direction) {
  const pos = index.members.findIndex((m) => m.key === member.key);
  if (pos === -1) return null;
  const target = direction === "prev" ? pos - 1 : pos + 1;
  return index.members[target] ?? null;
}
export {
  detectFrequency,
  frequencyFromDates,
  getAdjacentMember,
  getFrequencyViewConfig
};
//# sourceMappingURL=index51.js.map
