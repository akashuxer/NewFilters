"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function isForwardKey(key, orientation) {
  if ((orientation === "horizontal" || orientation === "both") && key === "ArrowRight")
    return true;
  if ((orientation === "vertical" || orientation === "both") && key === "ArrowDown")
    return true;
  return false;
}
function isBackwardKey(key, orientation) {
  if ((orientation === "horizontal" || orientation === "both") && key === "ArrowLeft")
    return true;
  if ((orientation === "vertical" || orientation === "both") && key === "ArrowUp")
    return true;
  return false;
}
function createTabRoving() {
  let _active = false;
  let _options = null;
  let _activeIndex = -1;
  function handleKeyDown(event) {
    if (!_active || !_options) return;
    const { items, orientation, wrap } = _options;
    if (items.length === 0) return;
    let nextIndex = _activeIndex;
    if (isForwardKey(event.key, orientation)) {
      event.preventDefault();
      nextIndex = _activeIndex + 1;
      if (nextIndex >= items.length) {
        nextIndex = wrap ? 0 : items.length - 1;
      }
    } else if (isBackwardKey(event.key, orientation)) {
      event.preventDefault();
      nextIndex = _activeIndex - 1;
      if (nextIndex < 0) {
        nextIndex = wrap ? items.length - 1 : 0;
      }
    } else if (event.key === "Home") {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      nextIndex = items.length - 1;
    } else {
      return;
    }
    if (nextIndex !== _activeIndex) {
      roving.setActiveItem(nextIndex);
    }
  }
  const roving = {
    activate(options) {
      if (_active) {
        roving.deactivate();
      }
      _options = options;
      _active = true;
      options.container.addEventListener("keydown", handleKeyDown);
      for (let i = 0; i < options.items.length; i++) {
        options.items[i].setAttribute("tabindex", i === 0 ? "0" : "-1");
      }
      _activeIndex = 0;
    },
    deactivate() {
      if (!_active || !_options) return;
      _options.container.removeEventListener("keydown", handleKeyDown);
      _active = false;
      _options = null;
      _activeIndex = -1;
    },
    setActiveItem(index) {
      var _a;
      if (!_active || !_options) return;
      if (index < 0 || index >= _options.items.length) return;
      if (_activeIndex >= 0 && _activeIndex < _options.items.length) {
        _options.items[_activeIndex].setAttribute("tabindex", "-1");
      }
      _activeIndex = index;
      _options.items[_activeIndex].setAttribute("tabindex", "0");
      _options.items[_activeIndex].focus();
      (_a = _options.onActivate) == null ? void 0 : _a.call(_options, _options.items[_activeIndex], _activeIndex);
    },
    getActiveItem() {
      if (!_active || !_options || _activeIndex < 0) return null;
      return _options.items[_activeIndex] ?? null;
    },
    getActiveIndex() {
      return _activeIndex;
    }
  };
  return roving;
}
exports.createTabRoving = createTabRoving;
//# sourceMappingURL=index6.cjs.map
