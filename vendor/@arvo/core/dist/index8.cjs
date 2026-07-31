"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const TYPE_AHEAD_DEFAULT_MS = 300;
function isPrintableChar(key) {
  return key.length === 1 && key !== " ";
}
function createArrowNav(options) {
  let _items = options.items;
  let _currentIndex = 0;
  let _destroyed = false;
  let _typeBuffer = "";
  let _typeTimer;
  function isForwardKey(key) {
    if (options.orientation === "vertical") return key === "ArrowDown";
    return key === "ArrowRight";
  }
  function isBackwardKey(key) {
    if (options.orientation === "vertical") return key === "ArrowUp";
    return key === "ArrowLeft";
  }
  function isDisabled(index) {
    return options.skipDisabled ? options.skipDisabled(index) : false;
  }
  function findNextEnabled(start, delta) {
    const len = _items.length;
    let idx = start;
    for (let i = 0; i < len; i++) {
      if (!isDisabled(idx)) return idx;
      const next = idx + delta;
      if (next >= len) {
        idx = options.wrap ? 0 : len - 1;
        if (!options.wrap) return -1;
      } else if (next < 0) {
        idx = options.wrap ? len - 1 : 0;
        if (!options.wrap) return -1;
      } else {
        idx = next;
      }
    }
    return -1;
  }
  function navigateTo(index) {
    if (index >= 0 && index !== _currentIndex) {
      _currentIndex = index;
      options.onNavigate(_items[_currentIndex], _currentIndex);
    }
  }
  function handleTypeAhead(key) {
    if (!options.typeAhead) return;
    const { getLabel, debounceMs = TYPE_AHEAD_DEFAULT_MS } = options.typeAhead;
    _typeBuffer += key.toLowerCase();
    if (_typeTimer !== void 0) clearTimeout(_typeTimer);
    _typeTimer = setTimeout(() => {
      _typeBuffer = "";
    }, debounceMs);
    const len = _items.length;
    for (let i = 1; i <= len; i++) {
      const idx = options.wrap || _currentIndex + i < len ? (_currentIndex + i) % len : _currentIndex + i;
      if (idx >= len) break;
      if (isDisabled(idx)) continue;
      if (getLabel(idx).toLowerCase().startsWith(_typeBuffer)) {
        navigateTo(idx);
        return;
      }
    }
    if (!isDisabled(_currentIndex) && getLabel(_currentIndex).toLowerCase().startsWith(_typeBuffer)) {
      return;
    }
  }
  function syncCurrentIndex() {
    const focused = document.activeElement;
    if (!focused) return;
    const idx = _items.indexOf(focused);
    if (idx !== -1) _currentIndex = idx;
  }
  function handleKeyDown(event) {
    if (_destroyed || _items.length === 0) return;
    syncCurrentIndex();
    if (isForwardKey(event.key)) {
      event.preventDefault();
      let next = _currentIndex + 1;
      if (next >= _items.length) {
        next = options.wrap ? 0 : _items.length - 1;
      }
      if (next !== _currentIndex) {
        next = findNextEnabled(next, 1);
        navigateTo(next);
      }
      return;
    }
    if (isBackwardKey(event.key)) {
      event.preventDefault();
      let next = _currentIndex - 1;
      if (next < 0) {
        next = options.wrap ? _items.length - 1 : 0;
      }
      if (next !== _currentIndex) {
        next = findNextEnabled(next, -1);
        navigateTo(next);
      }
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      const target = findNextEnabled(0, 1);
      navigateTo(target);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      const target = findNextEnabled(_items.length - 1, -1);
      navigateTo(target);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      if (options.onSelect) {
        event.preventDefault();
        options.onSelect(_items[_currentIndex], _currentIndex);
      }
      return;
    }
    if (event.key === "Escape") {
      if (options.onEscape) {
        event.preventDefault();
        options.onEscape();
      }
      return;
    }
    if (options.typeAhead && isPrintableChar(event.key)) {
      event.preventDefault();
      handleTypeAhead(event.key);
    }
  }
  return {
    handleKeyDown,
    destroy() {
      _destroyed = true;
      _items = [];
      if (_typeTimer !== void 0) {
        clearTimeout(_typeTimer);
        _typeTimer = void 0;
      }
    },
    setItems(items) {
      _items = items;
      if (_currentIndex >= _items.length) {
        _currentIndex = Math.max(0, _items.length - 1);
      }
    },
    setIndex(index) {
      if (index >= 0 && index < _items.length) {
        _currentIndex = index;
      }
    }
  };
}
exports.createArrowNav = createArrowNav;
//# sourceMappingURL=index8.cjs.map
