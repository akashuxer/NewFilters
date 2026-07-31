const DEFAULT_MAX_CHARS = 2;
const HONORIFICS = /^(?:mr|mrs|ms|dr|prof|sir|madam|shri|smt|mx)\.?$/i;
const SUFFIXES = /^(?:jr|sr|ii|iii|iv|phd|md|esq)\.?$/i;
const PARTICLES = /* @__PURE__ */ new Set([
  "van",
  "von",
  "de",
  "da",
  "der",
  "di",
  "la",
  "of",
  "the",
  "and"
]);
const NAME_SEPARATOR = /\s+[|/&+]\s+/g;
const EMAIL_SEPARATOR = /[._-]+/g;
const PARENS = /\([^)]*\)/g;
const SQUARE_BRACKETS = /\[[^\]]*\]/g;
const EMOJI = new RegExp("\\p{Extended_Pictographic}", "gu");
const LETTER = new RegExp("\\p{Letter}", "u");
const LATIN_LETTER = new RegExp("\\p{Script=Latin}", "u");
function resolveInitials(options = {}) {
  const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS;
  if (options.name) {
    const fromName = parseInitialsFromName(options.name, maxChars);
    if (fromName) return fromName;
  }
  if (options.email) {
    const fromEmail = parseInitialsFromEmail(options.email, maxChars);
    if (fromEmail) return fromEmail;
  }
  return "";
}
function parseInitialsFromName(name, maxChars = DEFAULT_MAX_CHARS) {
  if (!name) return "";
  let s = name;
  s = s.replace(EMOJI, " ");
  s = s.replace(PARENS, " ");
  s = s.replace(SQUARE_BRACKETS, " ");
  s = s.replace(NAME_SEPARATOR, " ");
  s = s.replace(/\s+/g, " ").trim();
  if (!s) return "";
  let tokens = s.split(" ");
  while (tokens.length > 1 && HONORIFICS.test(tokens[0])) tokens.shift();
  while (tokens.length > 1 && SUFFIXES.test(tokens[tokens.length - 1])) tokens.pop();
  if (tokens.length > 2) {
    tokens = tokens.filter((token, i) => {
      if (i === 0 || i === tokens.length - 1) return true;
      return !PARTICLES.has(token.toLowerCase());
    });
  }
  tokens = tokens.filter(isValidWordToken);
  if (tokens.length === 0) return "";
  const firstChar = firstCodepoint(tokens[0]);
  if (firstChar && LETTER.test(firstChar) && !LATIN_LETTER.test(firstChar)) {
    return firstChar;
  }
  let initials;
  if (tokens.length === 1) {
    initials = firstLetter(tokens[0]);
  } else {
    initials = firstLetter(tokens[0]) + firstLetter(tokens[tokens.length - 1]);
  }
  return initials.toUpperCase().slice(0, Math.max(1, maxChars));
}
function parseInitialsFromEmail(emailOrLocal, maxChars = DEFAULT_MAX_CHARS) {
  if (!emailOrLocal) return "";
  const atIndex = emailOrLocal.indexOf("@");
  const local = atIndex === -1 ? emailOrLocal : emailOrLocal.slice(0, atIndex);
  let s = local;
  s = s.replace(EMOJI, " ");
  s = s.replace(EMAIL_SEPARATOR, " ");
  s = s.replace(/\s+/g, " ").trim();
  if (!s) return "";
  const tokens = s.split(" ").filter(isValidWordToken);
  if (tokens.length === 0) return "";
  const firstChar = firstCodepoint(tokens[0]);
  if (firstChar && LETTER.test(firstChar) && !LATIN_LETTER.test(firstChar)) {
    return firstChar;
  }
  let initials;
  if (tokens.length === 1) {
    initials = firstLetter(tokens[0]);
  } else {
    initials = firstLetter(tokens[0]) + firstLetter(tokens[tokens.length - 1]);
  }
  return initials.toUpperCase().slice(0, Math.max(1, maxChars));
}
function isValidWordToken(token) {
  const first = firstCodepoint(token);
  return first !== "" && LETTER.test(first);
}
function firstCodepoint(s) {
  if (!s) return "";
  for (const ch of s) return ch;
  return "";
}
function firstLetter(token) {
  for (const ch of token) {
    if (LETTER.test(ch)) return ch;
  }
  return "";
}
export {
  parseInitialsFromEmail,
  parseInitialsFromName,
  resolveInitials
};
//# sourceMappingURL=index28.js.map
