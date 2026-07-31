function resolvePositionSide(placement) {
  if (placement.startsWith("top")) return "top";
  if (placement.startsWith("left")) return "left";
  if (placement.startsWith("right")) return "right";
  return "bottom";
}
function applyPositionToSurface(result, surface, options = {}) {
  const {
    round = false,
    maxHeightVar = "--arvo-overlay-max-height",
    widthVar = "--arvo-overlay-width"
  } = options;
  const x = round ? Math.round(result.x) : result.x;
  const y = round ? Math.round(result.y) : result.y;
  surface.style.translate = `${x}px ${y}px`;
  surface.setAttribute("data-arvo-side", resolvePositionSide(result.placement));
  if (result.maxHeight != null) {
    surface.style.setProperty(maxHeightVar, `${result.maxHeight}px`);
  }
  if (result.width != null) {
    surface.style.setProperty(widthVar, result.width);
  }
}
export {
  applyPositionToSurface,
  resolvePositionSide
};
//# sourceMappingURL=index17.js.map
