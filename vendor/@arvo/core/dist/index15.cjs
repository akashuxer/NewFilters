"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const AUTO_ORDER = [
  "bottom-start",
  "bottom-center",
  "top-start",
  "top-center",
  "right-start",
  "right-center",
  "left-start",
  "left-center",
  "bottom-end",
  "top-end",
  "right-end",
  "left-end"
];
const OPPOSITE = {
  "bottom-start": "top-start",
  "bottom-center": "top-center",
  "bottom-end": "top-end",
  "top-start": "bottom-start",
  "top-center": "bottom-center",
  "top-end": "bottom-end",
  "right-start": "left-start",
  "right-center": "left-center",
  "right-end": "left-end",
  "left-start": "right-start",
  "left-center": "right-center",
  "left-end": "right-end"
};
const ADJACENT = {
  "bottom-start": ["right-start", "left-start"],
  "bottom-center": ["right-center", "left-center"],
  "bottom-end": ["right-end", "left-end"],
  "top-start": ["right-start", "left-start"],
  "top-center": ["right-center", "left-center"],
  "top-end": ["right-end", "left-end"],
  "right-start": ["bottom-start", "top-start"],
  "right-center": ["bottom-center", "top-center"],
  "right-end": ["bottom-end", "top-end"],
  "left-start": ["bottom-start", "top-start"],
  "left-center": ["bottom-center", "top-center"],
  "left-end": ["bottom-end", "top-end"]
};
const MIN_PANEL_HEIGHT = 50;
function isVirtualAnchor(anchor) {
  return typeof anchor.getBoundingClientRect !== "function";
}
function getAnchorRect(anchor) {
  if (isVirtualAnchor(anchor)) {
    return { x: anchor.x, y: anchor.y, width: 0, height: 0 };
  }
  const r = anchor.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
}
function getBoundaryRect(boundary) {
  if (boundary) {
    const r = boundary.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  }
  return { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
}
function getSide(p) {
  return p.split("-")[0];
}
function getAlign(p) {
  return p.split("-")[1];
}
function primarySpaceMap(a, b, margin, gap) {
  return {
    bottom: Math.max(0, b.y + b.height - margin - (a.y + a.height) - gap),
    top: Math.max(0, a.y - b.y - margin - gap),
    right: Math.max(0, b.x + b.width - margin - (a.x + a.width) - gap),
    left: Math.max(0, a.x - b.x - margin - gap)
  };
}
function alignmentVerticalRoom(p, a, b, margin) {
  const side = getSide(p);
  if (side === "top" || side === "bottom") {
    return Math.max(0, b.height - 2 * margin);
  }
  const align = getAlign(p);
  if (align === "start") {
    return Math.max(0, b.y + b.height - margin - a.y);
  }
  if (align === "end") {
    return Math.max(0, a.y + a.height - b.y - margin);
  }
  const center = a.y + a.height / 2;
  const above = Math.max(0, center - b.y - margin);
  const below = Math.max(0, b.y + b.height - margin - center);
  return Math.max(0, 2 * Math.min(above, below));
}
function alignmentHorizontalRoom(p, a, b, margin) {
  const side = getSide(p);
  if (side === "left" || side === "right") {
    return Math.max(0, b.width - 2 * margin);
  }
  const align = getAlign(p);
  if (align === "start") {
    return Math.max(0, b.x + b.width - margin - a.x);
  }
  if (align === "end") {
    return Math.max(0, a.x + a.width - b.x - margin);
  }
  const center = a.x + a.width / 2;
  const left = Math.max(0, center - b.x - margin);
  const right = Math.max(0, b.x + b.width - margin - center);
  return Math.max(0, 2 * Math.min(left, right));
}
function rawPosition(a, fw, fh, p, gap) {
  switch (p) {
    case "bottom-start":
      return { x: a.x, y: a.y + a.height + gap };
    case "bottom-center":
      return { x: a.x + a.width / 2 - fw / 2, y: a.y + a.height + gap };
    case "bottom-end":
      return { x: a.x + a.width - fw, y: a.y + a.height + gap };
    case "top-start":
      return { x: a.x, y: a.y - fh - gap };
    case "top-center":
      return { x: a.x + a.width / 2 - fw / 2, y: a.y - fh - gap };
    case "top-end":
      return { x: a.x + a.width - fw, y: a.y - fh - gap };
    case "right-start":
      return { x: a.x + a.width + gap, y: a.y };
    case "right-center":
      return { x: a.x + a.width + gap, y: a.y + a.height / 2 - fh / 2 };
    case "right-end":
      return { x: a.x + a.width + gap, y: a.y + a.height - fh };
    case "left-start":
      return { x: a.x - fw - gap, y: a.y };
    case "left-center":
      return { x: a.x - fw - gap, y: a.y + a.height / 2 - fh / 2 };
    case "left-end":
      return { x: a.x - fw - gap, y: a.y + a.height - fh };
  }
}
function fitsNatural(p, a, b, margin, gap, fw, fh, prim) {
  const side = getSide(p);
  if (side === "top" || side === "bottom") {
    if (fh > prim[side]) return false;
    return fw <= alignmentHorizontalRoom(p, a, b, margin);
  }
  if (fw > prim[side]) return false;
  return fh <= alignmentVerticalRoom(p, a, b, margin);
}
function fallbackScore(p, a, b, margin, prim) {
  const side = getSide(p);
  if (side === "top" || side === "bottom") return prim[side];
  return alignmentVerticalRoom(p, a, b, margin);
}
function alignmentAlternatives(p) {
  const side = getSide(p);
  if (side === "top" || side === "bottom") return [];
  const align = getAlign(p);
  if (align === "start") return [`${side}-end`, `${side}-center`];
  if (align === "end") return [`${side}-start`, `${side}-center`];
  return [`${side}-start`, `${side}-end`];
}
function selectBestByScore(candidates, preferred, a, b, margin, prim) {
  let best = preferred;
  let bestScore = fallbackScore(preferred, a, b, margin, prim);
  for (const c of candidates) {
    const s = fallbackScore(c, a, b, margin, prim);
    if (s > bestScore + 1) {
      best = c;
      bestScore = s;
    }
  }
  return best;
}
function resolvePlacement(requested, a, b, margin, gap, fw, fh, flip) {
  const prim = primarySpaceMap(a, b, margin, gap);
  const fits = (p) => fitsNatural(p, a, b, margin, gap, fw, fh, prim);
  if (requested === "auto") {
    for (const c of AUTO_ORDER) {
      if (fits(c)) return c;
    }
    return selectBestByScore(AUTO_ORDER, AUTO_ORDER[0], a, b, margin, prim);
  }
  if (fits(requested)) return requested;
  for (const alt of alignmentAlternatives(requested)) {
    if (fits(alt)) return alt;
  }
  if (fits(OPPOSITE[requested])) return OPPOSITE[requested];
  if (flip === "any") {
    for (const adj of ADJACENT[requested]) {
      if (fits(adj)) return adj;
    }
  }
  const candidates = flip === "any" ? [
    OPPOSITE[requested],
    ...ADJACENT[requested],
    ...alignmentAlternatives(requested)
  ] : [OPPOSITE[requested], ...alignmentAlternatives(requested)];
  return selectBestByScore(candidates, requested, a, b, margin, prim);
}
function computeMaxHeight(p, a, b, margin, gap) {
  const side = getSide(p);
  if (side === "bottom") {
    return Math.max(MIN_PANEL_HEIGHT, b.y + b.height - margin - (a.y + a.height) - gap);
  }
  if (side === "top") {
    return Math.max(MIN_PANEL_HEIGHT, a.y - b.y - margin - gap);
  }
  return Math.max(MIN_PANEL_HEIGHT, alignmentVerticalRoom(p, a, b, margin));
}
function resolveWidth(width, anchorWidth) {
  if (width == null) return null;
  if (width === "anchor") return `${anchorWidth}px`;
  if (typeof width === "number") return `${width}px`;
  return width;
}
function computePosition(anchor, float, options = {}) {
  const {
    placement: requested = "bottom-start",
    // 4px is the design-system standard separation between an anchored
    // overlay (popover, dropdown, menu, picker, option-list) and its
    // trigger. Submenus opt out by passing `gap: 0` since they sit
    // flush against their parent menu item; context menus also pass 0
    // (anchored at the pointer location).
    gap = 4,
    margin = 8,
    boundary: boundaryEl,
    width: widthOpt,
    flip = "main-axis"
  } = options;
  const aRect = getAnchorRect(anchor);
  const fw = float.offsetWidth || float.getBoundingClientRect().width;
  const fh = float.offsetHeight || float.getBoundingClientRect().height;
  const boundary = getBoundaryRect(boundaryEl);
  const placement = resolvePlacement(
    requested,
    aRect,
    boundary,
    margin,
    gap,
    fw,
    fh,
    flip
  );
  const maxHeight = computeMaxHeight(placement, aRect, boundary, margin, gap);
  const side = getSide(placement);
  const positioningFh = side === "top" ? Math.min(fh, maxHeight) : fh;
  const pos = rawPosition(aRect, fw, positioningFh, placement, gap);
  pos.x = Math.max(
    boundary.x + margin,
    Math.min(pos.x, boundary.x + boundary.width - fw - margin)
  );
  if (side === "left" || side === "right") {
    const clampedFh = Math.min(fh, maxHeight);
    pos.y = Math.max(
      boundary.y + margin,
      Math.min(pos.y, boundary.y + boundary.height - clampedFh - margin)
    );
  }
  if (side === "top" || side === "bottom") {
    const clampedFh = Math.min(fh, maxHeight);
    pos.y = Math.max(
      boundary.y + margin,
      Math.min(pos.y, boundary.y + boundary.height - clampedFh - margin)
    );
  }
  const width = resolveWidth(widthOpt, aRect.width);
  pos.x += window.scrollX;
  pos.y += window.scrollY;
  return { x: pos.x, y: pos.y, placement, maxHeight, width };
}
exports.computePosition = computePosition;
//# sourceMappingURL=index15.cjs.map
