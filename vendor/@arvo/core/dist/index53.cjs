"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const tokenize = require("./index42.cjs");
const locale = require("./index43.cjs");
const format = require("./index44.cjs");
const parse = require("./index45.cjs");
const fields = require("./index56.cjs");
const index = require("./index50.cjs");
const bounds = require("./index54.cjs");
const NUMERIC_KINDS = /* @__PURE__ */ new Set([
  "year",
  "month",
  "day",
  "hour24",
  "hour12",
  "minute",
  "second",
  "fraction"
]);
const EDITABLE_KINDS = /* @__PURE__ */ new Set([
  ...NUMERIC_KINDS,
  "monthName",
  "ampm"
]);
const OPTIONAL_KINDS = /* @__PURE__ */ new Set([
  "second",
  "fraction",
  "ampm"
]);
function pad(value, length) {
  return String(value).padStart(length, "0");
}
function fractionText(ms, length) {
  const base = pad(ms, 3);
  return length <= 3 ? base.slice(0, length) : base + "0".repeat(length - 3);
}
function sameTime(a, b) {
  if (a === null || b === null) return a === b;
  return a.getTime() === b.getTime();
}
function createSegmentController(options) {
  let opts = { ...options };
  let tokens = [];
  let segDefs = [];
  let states = [];
  let value = opts.value ?? null;
  let focused = false;
  let activeIndex = 0;
  let preFocusValue = null;
  const listeners = {
    change: /* @__PURE__ */ new Set(),
    commit: /* @__PURE__ */ new Set(),
    segment: /* @__PURE__ */ new Set()
  };
  const locale$1 = () => locale.getUserLocale(opts.locale);
  const commitMode = () => opts.commit ?? "blur";
  const pasteAllowed = () => opts.allowPaste !== false;
  function isNumeric(kind) {
    return NUMERIC_KINDS.has(kind);
  }
  function isRequired(kind) {
    return EDITABLE_KINDS.has(kind) && !OPTIONAL_KINDS.has(kind);
  }
  function segWidth(def) {
    if (def.kind === "year") return def.length >= 4 ? 4 : 2;
    if (def.kind === "fraction") return def.length;
    return 2;
  }
  function rebuild() {
    tokens = tokenize.tokenizeFormat(opts.format);
    segDefs = [];
    tokens.forEach((token, tokenIndex) => {
      if (EDITABLE_KINDS.has(token.kind)) {
        segDefs.push({
          tokenIndex,
          kind: token.kind,
          length: token.length ?? token.raw.length
        });
      }
    });
    states = segDefs.map(() => ({ value: null, buffer: "", filled: false, fresh: false }));
    if (activeIndex >= segDefs.length) activeIndex = Math.max(0, segDefs.length - 1);
    populateFromValue(value);
  }
  function valueFromDate(kind, date) {
    switch (kind) {
      case "year":
        return date.getFullYear();
      case "month":
        return date.getMonth() + 1;
      case "monthName":
        return date.getMonth();
      case "day":
        return date.getDate();
      case "hour24":
        return date.getHours();
      case "hour12":
        return (date.getHours() + 11) % 12 + 1;
      case "minute":
        return date.getMinutes();
      case "second":
        return date.getSeconds();
      case "fraction":
        return date.getMilliseconds();
      case "ampm":
        return date.getHours() < 12 ? "am" : "pm";
      /* c8 ignore next 2 -- only editable kinds populate segments */
      default:
        return 0;
    }
  }
  function populateFromValue(date) {
    segDefs.forEach((def, i) => {
      const st = states[i];
      if (date === null) {
        st.value = null;
        st.buffer = "";
        st.filled = false;
        st.fresh = false;
      } else {
        st.value = valueFromDate(def.kind, date);
        st.buffer = "";
        st.filled = true;
        st.fresh = false;
      }
    });
  }
  function context() {
    let year;
    let month;
    segDefs.forEach((def, i) => {
      const st = states[i];
      if (!st.filled || st.value === null) return;
      if (def.kind === "year") {
        const v = st.value;
        year = def.length <= 2 && v < 100 ? fields.applyYearPivot(v) : v;
      } else if (def.kind === "month") {
        month = st.value - 1;
      } else if (def.kind === "monthName") {
        month = st.value;
      }
    });
    if (year === void 0) {
      year = value ? value.getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
    }
    if (month === void 0 && value) month = value.getMonth();
    const ctx = { year };
    if (month !== void 0) ctx.month = month;
    return ctx;
  }
  function collectFields() {
    const fields$1 = {};
    let hour12;
    let period;
    let complete = true;
    segDefs.forEach((def, i) => {
      const st = states[i];
      if (st.value === null || !st.filled) {
        if (isRequired(def.kind)) complete = false;
        return;
      }
      switch (def.kind) {
        case "year": {
          const v = st.value;
          fields$1.year = def.length <= 2 && v < 100 ? fields.applyYearPivot(v) : v;
          break;
        }
        case "month":
          fields$1.month = st.value - 1;
          break;
        case "monthName":
          fields$1.month = st.value;
          break;
        case "day":
          fields$1.day = st.value;
          break;
        case "hour24":
          fields$1.hour = st.value;
          break;
        case "hour12":
          hour12 = st.value;
          break;
        case "minute":
          fields$1.minute = st.value;
          break;
        case "second":
          fields$1.second = st.value;
          break;
        case "fraction":
          fields$1.millisecond = Number((String(st.value) + "000").slice(0, 3));
          break;
        case "ampm":
          period = st.value;
          break;
      }
    });
    if (hour12 !== void 0) {
      fields$1.hour = hour12 % 12 + (period === "pm" ? 12 : 0);
    }
    return { fields: fields$1, complete };
  }
  function computeDate() {
    const { fields: fields$1, complete } = collectFields();
    if (!complete) return null;
    return fields.buildDateFromFields(fields$1);
  }
  function renderEditable(def, st) {
    if (st.value === null) return tokens[def.tokenIndex].raw;
    if (!st.filled) return st.buffer;
    const len = def.length;
    switch (def.kind) {
      case "year":
        return len >= 4 ? pad(st.value, 4) : pad(st.value % 100, 2);
      case "month":
        return len >= 2 ? pad(st.value, 2) : String(st.value);
      case "monthName":
        return locale.getMonthNames(locale$1(), len >= 4 ? "full" : "abbrev")[st.value];
      case "day":
        return len >= 2 ? pad(st.value, 2) : String(st.value);
      case "hour24":
      case "hour12":
      case "minute":
      case "second":
        return len >= 2 ? pad(st.value, 2) : String(st.value);
      case "fraction":
        return fractionText(st.value, len);
      case "ampm": {
        const { am, pm } = locale.getAmPmStrings(locale$1());
        return st.value === "am" ? am : pm;
      }
      /* c8 ignore next 2 -- segDefs only hold editable kinds handled above */
      default:
        return String(st.value);
    }
  }
  function render() {
    const ctx = context();
    const provisional = computeDate();
    const descriptors = [];
    let display = "";
    let segIdx = 0;
    for (const token of tokens) {
      if (EDITABLE_KINDS.has(token.kind)) {
        const def = segDefs[segIdx];
        const st = states[segIdx];
        const text = renderEditable(def, st);
        const start = display.length;
        display += text;
        descriptors.push({
          kind: token.kind,
          index: segIdx,
          raw: text,
          value: st.value,
          bounds: bounds.getSegmentBounds(token.kind, ctx),
          startOffset: start,
          endOffset: display.length,
          isPlaceholder: st.value === null
        });
        segIdx += 1;
      } else if (token.kind === "dayName") {
        const len = token.length ?? token.raw.length;
        display += provisional ? locale.getDayNames(locale$1(), len >= 4 ? "full" : "abbrev")[provisional.getDay()] : token.raw;
      } else if (token.kind === "timezone") {
        display += provisional ? format.formatDate(provisional, token.raw, opts.locale) : token.raw;
      } else {
        display += token.text ?? token.raw;
      }
    }
    return { display, descriptors };
  }
  function displayBlurred() {
    if (value === null) {
      return render().display;
    }
    if (opts.memberIndex) {
      const member = index.findMemberForDate(opts.memberIndex, value);
      if (member) return member.displayName;
    }
    return format.formatDate(value, opts.format, opts.locale);
  }
  function emit(event, payload) {
    listeners[event].forEach((listener) => listener(payload));
  }
  function commitFromEdit(snap) {
    const date = computeDate();
    if (date === null) return;
    let committed;
    if (snap && opts.memberIndex) {
      const member = index.findMemberForDate(opts.memberIndex, date);
      if (!member) return;
      committed = new Date(member.keyDate.getTime());
    } else {
      committed = date;
    }
    if (!sameTime(committed, value)) {
      value = committed;
      emit("change", getValue());
      emit("commit", { date: value });
    }
  }
  function setFocused(target) {
    if (target === focused) return;
    if (target) {
      preFocusValue = value ? new Date(value.getTime()) : null;
      focused = true;
      populateFromValue(value);
      activeIndex = segDefs.length > 0 ? 0 : 0;
      if (segDefs.length > 0) states[0].fresh = true;
    } else {
      focused = false;
      commitFromEdit(true);
      populateFromValue(value);
    }
  }
  function handleEscape() {
    value = preFocusValue ? new Date(preFocusValue.getTime()) : null;
    focused = false;
    populateFromValue(value);
  }
  function clearActive() {
    if (activeIndex < 0 || activeIndex >= states.length) return;
    const st = states[activeIndex];
    st.value = null;
    st.buffer = "";
    st.filled = false;
    st.fresh = true;
    emit("change", getValue());
    if (commitMode() === "live") commitFromEdit(false);
  }
  function adjust(delta) {
    if (activeIndex < 0 || activeIndex >= segDefs.length) return;
    const def = segDefs[activeIndex];
    const st = states[activeIndex];
    if (def.kind === "ampm") {
      st.value = st.value === "pm" ? "am" : "pm";
      st.filled = true;
      st.fresh = false;
    } else if (def.kind === "monthName") {
      const cur = st.value ?? (delta > 0 ? -1 : 0);
      st.value = ((cur + delta) % 12 + 12) % 12;
      st.filled = true;
      st.fresh = false;
    } else {
      const bounds$1 = bounds.getSegmentBounds(def.kind, context());
      if (!bounds$1) return;
      const range = bounds$1.max - bounds$1.min + 1;
      const step = def.kind === "minute" && opts.minuteInterval && opts.minuteInterval > 1 ? Math.max(1, Math.floor(opts.minuteInterval)) * (delta > 0 ? 1 : -1) : delta;
      let base = st.value ?? (step > 0 ? bounds$1.min - step : bounds$1.max - step);
      if (def.kind === "minute" && opts.minuteInterval && opts.minuteInterval > 1) {
        const ival = Math.max(1, Math.floor(opts.minuteInterval));
        base = Math.floor(base / ival) * ival;
      }
      const next = bounds$1.min + ((base - bounds$1.min + step) % range + range) % range;
      st.value = next;
      st.buffer = String(next);
      st.filled = true;
      st.fresh = false;
    }
    emit("change", getValue());
    if (commitMode() === "live") commitFromEdit(false);
  }
  function getValue() {
    const { descriptors } = render();
    return { date: computeDate(), segments: descriptors };
  }
  function getFormattedDisplay(focusedArg) {
    if (focusedArg !== focused) setFocused(focusedArg);
    return focused ? render().display : displayBlurred();
  }
  function getFocusedSegment() {
    if (!focused || activeIndex < 0) return null;
    return render().descriptors[activeIndex] ?? null;
  }
  function setValue(date, setOpts) {
    value = date ? new Date(date.getTime()) : null;
    populateFromValue(value);
    if (!(setOpts == null ? void 0 : setOpts.silent)) emit("change", getValue());
  }
  function setOptions(partial) {
    const formatChanged = partial.format !== void 0 && partial.format !== opts.format;
    opts = { ...opts, ...partial };
    if (partial.value !== void 0) value = partial.value ?? null;
    if (formatChanged) {
      rebuild();
    } else {
      populateFromValue(value);
    }
  }
  function focusSegment(index2) {
    if (!focused) setFocused(true);
    if (index2 < 0 || index2 >= segDefs.length) return;
    activeIndex = index2;
    states[index2].fresh = true;
    emit("segment", getFocusedSegment());
  }
  function findSegmentForOffset(offset) {
    if (segDefs.length === 0) return null;
    const { descriptors } = render();
    if (descriptors.length === 0) return null;
    const first = descriptors[0];
    const last = descriptors[descriptors.length - 1];
    if (offset <= first.startOffset) return first.index;
    if (offset >= last.endOffset) return last.index;
    for (const seg of descriptors) {
      if (offset >= seg.startOffset && offset <= seg.endOffset) {
        return seg.index;
      }
    }
    for (let i = 0; i < descriptors.length - 1; i += 1) {
      const a = descriptors[i];
      const b = descriptors[i + 1];
      if (offset > a.endOffset && offset < b.startOffset) {
        const mid = (a.endOffset + b.startOffset) / 2;
        return offset < mid ? a.index : b.index;
      }
    }
    return null;
  }
  function moveSegment(direction) {
    if (segDefs.length === 0) return;
    let next = activeIndex;
    if (direction === "first") next = 0;
    else if (direction === "last") next = segDefs.length - 1;
    else if (direction === "prev") next = Math.max(0, activeIndex - 1);
    else next = Math.min(segDefs.length - 1, activeIndex + 1);
    activeIndex = next;
    states[next].fresh = true;
    emit("segment", getFocusedSegment());
  }
  function handleKey(event) {
    const live = commitMode() === "live";
    switch (event.key) {
      case "ArrowLeft":
        moveSegment("prev");
        return { consumed: true };
      case "ArrowRight":
        moveSegment("next");
        return { consumed: true };
      case "Home":
        moveSegment("first");
        return { consumed: true };
      case "End":
        moveSegment("last");
        return { consumed: true };
      case "ArrowUp":
        adjust(1);
        return { consumed: true, commit: live ? "live" : null };
      case "ArrowDown":
        adjust(-1);
        return { consumed: true, commit: live ? "live" : null };
      case "Tab":
        return { consumed: false };
      case "Enter":
        commitFromEdit(true);
        if (focused) populateFromValue(value);
        return { consumed: true, commit: live ? "live" : null };
      case "Escape":
        handleEscape();
        return { consumed: true };
      case "Backspace":
      case "Delete":
        clearActive();
        return { consumed: true };
      default:
        return { consumed: false };
    }
  }
  function handleDigit(digit) {
    if (!focused || activeIndex < 0 || activeIndex >= segDefs.length) {
      return { consumed: false, advance: false };
    }
    const def = segDefs[activeIndex];
    if (!isNumeric(def.kind)) return { consumed: false, advance: false };
    if (!/^[0-9]$/.test(digit)) return { consumed: false, advance: false };
    const st = states[activeIndex];
    const width = segWidth(def);
    let buffer = st.fresh ? digit : st.buffer + digit;
    if (buffer.length > width) buffer = digit;
    let val = Number(buffer);
    const bounds$1 = bounds.getSegmentBounds(def.kind, context());
    if (bounds$1 && val > bounds$1.max) {
      buffer = digit;
      val = Number(buffer);
    }
    st.buffer = buffer;
    st.value = val;
    st.fresh = false;
    let advance = false;
    if (buffer.length >= width) {
      advance = true;
    } else if (bounds$1 && val * 10 > bounds$1.max) {
      advance = true;
    }
    st.filled = advance || buffer.length >= width;
    emit("change", getValue());
    if (commitMode() === "live") commitFromEdit(false);
    if (advance) moveSegment("next");
    return { consumed: true, advance };
  }
  function handleLetter(letter) {
    if (!focused || activeIndex < 0 || activeIndex >= segDefs.length) {
      return { consumed: false, advance: false };
    }
    const def = segDefs[activeIndex];
    const st = states[activeIndex];
    if (def.kind === "ampm") {
      const lower = letter.toLowerCase();
      if (lower !== "a" && lower !== "p") return { consumed: false, advance: false };
      st.value = lower === "a" ? "am" : "pm";
      st.filled = true;
      st.fresh = false;
      emit("change", getValue());
      if (commitMode() === "live") commitFromEdit(false);
      moveSegment("next");
      return { consumed: true, advance: true };
    }
    if (def.kind === "monthName") {
      const buffer = (st.fresh ? "" : st.buffer) + letter.toLowerCase();
      const names = locale.getMonthNames(locale$1(), def.length >= 4 ? "full" : "abbrev");
      const matchIndex = names.findIndex(
        (name) => name.toLowerCase().startsWith(buffer)
      );
      if (matchIndex === -1) return { consumed: true, advance: false };
      st.buffer = buffer;
      st.value = matchIndex;
      st.filled = true;
      st.fresh = false;
      emit("change", getValue());
      if (commitMode() === "live") commitFromEdit(false);
      return { consumed: true, advance: false };
    }
    return { consumed: false, advance: false };
  }
  function tryParseSingleSegment(text, def) {
    const trimmed = text.trim();
    if (!trimmed) return null;
    if (def.kind === "ampm") {
      const { am, pm } = locale.getAmPmStrings(locale$1());
      const upper = trimmed.toUpperCase();
      if (upper === am.toUpperCase()) return "am";
      if (upper === pm.toUpperCase()) return "pm";
      if (upper === "AM" || upper === "A") return "am";
      if (upper === "PM" || upper === "P") return "pm";
      return null;
    }
    if (def.kind === "monthName") {
      const full = locale.getMonthNames(locale$1(), "full");
      const abbrev = locale.getMonthNames(locale$1(), "abbrev");
      const norm = trimmed.toLowerCase();
      let idx = full.findIndex((m) => m.toLowerCase() === norm);
      if (idx === -1) idx = abbrev.findIndex((m) => m.toLowerCase() === norm);
      if (idx === -1) {
        const matches = full.map((m, i) => ({ name: m.toLowerCase(), i })).filter(({ name }) => name.startsWith(norm));
        if (matches.length === 1) idx = matches[0].i;
      }
      return idx === -1 ? null : idx;
    }
    if (!isNumeric(def.kind)) return null;
    if (!/^\d+$/.test(trimmed)) return null;
    const num = Number(trimmed);
    if (!Number.isFinite(num)) return null;
    if (def.kind === "year") {
      const yearLen = def.length >= 4 ? 4 : 2;
      if (trimmed.length > 4) return null;
      if (yearLen === 2 && trimmed.length > 2) return null;
      return num;
    }
    const bounds$1 = bounds.getSegmentBounds(def.kind, context());
    if (!bounds$1) return null;
    if (num < bounds$1.min || num > bounds$1.max) return null;
    return num;
  }
  function handlePaste(text) {
    if (!pasteAllowed()) return { consumed: false, commit: false };
    const parsed = parse.parseDateTime(text, opts.format, opts.locale);
    if (parsed) {
      populateFromValue(parsed);
      let committed = false;
      if (commitMode() === "live") {
        const before = value;
        commitFromEdit(true);
        committed = !sameTime(before, value);
      }
      emit("change", getValue());
      return { consumed: true, commit: committed };
    }
    if (activeIndex >= 0 && activeIndex < segDefs.length) {
      const def = segDefs[activeIndex];
      const next = tryParseSingleSegment(text, def);
      if (next !== null) {
        const st = states[activeIndex];
        st.value = next;
        st.buffer = typeof next === "number" ? String(next) : "";
        st.filled = true;
        st.fresh = false;
        let committed = false;
        if (commitMode() === "live") {
          const before = value;
          commitFromEdit(false);
          committed = !sameTime(before, value);
        }
        emit("change", getValue());
        return { consumed: true, commit: committed };
      }
    }
    return { consumed: false, commit: false };
  }
  function on(event, listener) {
    listeners[event].add(listener);
    return () => {
      listeners[event].delete(listener);
    };
  }
  function destroy() {
    listeners.change.clear();
    listeners.commit.clear();
    listeners.segment.clear();
  }
  rebuild();
  return {
    getValue,
    getFormattedDisplay,
    getFocusedSegment,
    setValue,
    setOptions,
    focusSegment,
    moveSegment,
    findSegmentForOffset,
    handleKey,
    handleDigit,
    handleLetter,
    handlePaste,
    on,
    destroy
  };
}
exports.createSegmentController = createSegmentController;
//# sourceMappingURL=index53.cjs.map
