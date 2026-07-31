"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let _cachedOS = null;
function getOperatingSystem() {
  var _a, _b;
  if (_cachedOS) return _cachedOS;
  if (typeof navigator === "undefined") return "other";
  const nav = navigator;
  const uaPlatform = ((_b = (_a = nav.userAgentData) == null ? void 0 : _a.platform) == null ? void 0 : _b.toLowerCase()) ?? "";
  const legacyPlatform = (nav.platform ?? "").toLowerCase();
  const ua = (nav.userAgent ?? "").toLowerCase();
  const haystack = `${uaPlatform} ${legacyPlatform} ${ua}`;
  let os;
  if (/mac|iphone|ipad|ipod|darwin/.test(haystack)) {
    os = "mac";
  } else if (/win/.test(haystack)) {
    os = "windows";
  } else if (/linux|cros|android/.test(haystack)) {
    os = "linux";
  } else {
    os = "other";
  }
  _cachedOS = os;
  return os;
}
function isMacOS() {
  return getOperatingSystem() === "mac";
}
function isModKey(event) {
  return isMacOS() ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
}
function parseShortcut(shortcut) {
  const parts = shortcut.split("+").map((p) => p.trim().toLowerCase()).filter((p) => p.length > 0);
  const key = parts.pop() ?? "";
  const set = new Set(parts);
  const isMac = isMacOS();
  const hasModAlias = set.has("mod") || set.has("ctrl") || set.has("control") || set.has("cmd") || set.has("command");
  return {
    key,
    ctrl: hasModAlias && !isMac,
    alt: set.has("alt") || set.has("option"),
    shift: set.has("shift"),
    meta: hasModAlias && isMac || set.has("meta")
  };
}
function matchesShortcut(event, parsed) {
  return event.key.toLowerCase() === parsed.key && event.ctrlKey === parsed.ctrl && event.altKey === parsed.alt && event.shiftKey === parsed.shift && event.metaKey === parsed.meta;
}
const MAC_MODIFIER_MAP = {
  mod: "⌘",
  ctrl: "⌘",
  control: "⌘",
  cmd: "⌘",
  command: "⌘",
  meta: "⌘",
  alt: "⌥",
  option: "⌥",
  shift: "⇧"
};
const NON_MAC_MODIFIER_MAP = {
  mod: "Ctrl",
  ctrl: "Ctrl",
  control: "Ctrl",
  cmd: "Ctrl",
  command: "Ctrl",
  meta: "Meta",
  alt: "Alt",
  option: "Alt",
  shift: "Shift"
};
const KEY_DISPLAY_MAP = {
  arrowleft: "←",
  arrowright: "→",
  arrowup: "↑",
  arrowdown: "↓",
  left: "←",
  right: "→",
  up: "↑",
  down: "↓",
  enter: "Enter",
  return: "Enter",
  esc: "Esc",
  escape: "Esc",
  space: "Space",
  tab: "Tab",
  backspace: "Backspace",
  del: "Del",
  delete: "Del",
  home: "Home",
  end: "End",
  pageup: "PgUp",
  pagedown: "PgDn"
};
function formatShortcutDisplay(shortcut) {
  if (!shortcut) return "";
  const trimmed = shortcut.trim();
  if (trimmed.length === 0) return "";
  const parts = trimmed.split("+").map((p) => p.trim()).filter((p) => p.length > 0);
  if (parts.length === 0) return "";
  const key = parts.pop();
  const isMac = isMacOS();
  const modifierMap = isMac ? MAC_MODIFIER_MAP : NON_MAC_MODIFIER_MAP;
  const orderedModifiers = isMac ? sortMacModifiers(parts.map((p) => p.toLowerCase())) : parts.map((p) => p.toLowerCase());
  const displayedModifiers = orderedModifiers.map((mod) => modifierMap[mod] ?? capitalize(mod));
  const displayedKey = formatKeyDisplay(key);
  return [...displayedModifiers, displayedKey].filter(Boolean).join(" ");
}
function formatKeyDisplay(rawKey) {
  const lower = rawKey.toLowerCase();
  const mapped = KEY_DISPLAY_MAP[lower];
  if (mapped) return mapped;
  if (rawKey.length === 1) return rawKey.toUpperCase();
  return rawKey;
}
function sortMacModifiers(modifiers) {
  const rank = {
    alt: 1,
    option: 1,
    shift: 2,
    control: 3,
    ctrl: 3,
    cmd: 3,
    command: 3,
    meta: 3,
    mod: 3
  };
  return [...modifiers].sort((a, b) => (rank[a] ?? 99) - (rank[b] ?? 99));
}
function capitalize(word) {
  if (word.length === 0) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}
function __resetOperatingSystemCacheForTests() {
  _cachedOS = null;
}
exports.__resetOperatingSystemCacheForTests = __resetOperatingSystemCacheForTests;
exports.formatShortcutDisplay = formatShortcutDisplay;
exports.getOperatingSystem = getOperatingSystem;
exports.isMacOS = isMacOS;
exports.isModKey = isModKey;
exports.matchesShortcut = matchesShortcut;
exports.parseShortcut = parseShortcut;
//# sourceMappingURL=index12.cjs.map
