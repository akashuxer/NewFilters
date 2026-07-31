import { createArrowNav } from "./index8.js";
function createTreeNav(options) {
  let _items = options.items;
  let _currentIndex = findFirstEnabledIndex(_items, options.getRowMeta);
  const inner = createArrowNav({
    items: _items,
    orientation: "vertical",
    // Trees do not wrap (per WAI-ARIA APG): Up at first item is a no-op,
    // Down at last item is a no-op.
    wrap: false,
    onNavigate(el, index) {
      _currentIndex = index;
      options.onNavigate(el, index);
    },
    onSelect: options.onSelect ? (el, index) => {
      var _a;
      _currentIndex = index;
      (_a = options.onSelect) == null ? void 0 : _a.call(options, el, index);
    } : void 0,
    onEscape: options.onEscape,
    skipDisabled: (index) => options.getRowMeta(index).isDisabled,
    typeAhead: options.typeAhead
  });
  function syncCurrentIndexFromFocus() {
    const focused = document.activeElement;
    if (!focused) return;
    const idx = _items.indexOf(focused);
    if (idx !== -1) _currentIndex = idx;
  }
  function findParentIndex(fromIndex) {
    if (fromIndex <= 0) return -1;
    const childMeta = options.getRowMeta(fromIndex);
    const targetLevel = childMeta.level - 1;
    if (targetLevel < 0) return -1;
    for (let i = fromIndex - 1; i >= 0; i--) {
      if (options.getRowMeta(i).level === targetLevel) return i;
    }
    return -1;
  }
  function moveFocusTo(index) {
    if (index < 0 || index >= _items.length) return;
    if (options.getRowMeta(index).isDisabled) return;
    _currentIndex = index;
    options.onNavigate(_items[index], index);
  }
  function handleRightArrow(event) {
    syncCurrentIndexFromFocus();
    if (_currentIndex < 0 || _currentIndex >= _items.length) return false;
    const meta = options.getRowMeta(_currentIndex);
    if (meta.isDisabled) return false;
    if (meta.hasChildren && !meta.isExpanded) {
      event.preventDefault();
      options.onExpand(_currentIndex);
      return true;
    }
    if (meta.hasChildren && meta.isExpanded) {
      event.preventDefault();
      const next = _currentIndex + 1;
      if (next < _items.length && options.getRowMeta(next).level === meta.level + 1) {
        moveFocusTo(next);
      }
      return true;
    }
    event.preventDefault();
    return true;
  }
  function handleLeftArrow(event) {
    syncCurrentIndexFromFocus();
    if (_currentIndex < 0 || _currentIndex >= _items.length) return false;
    const meta = options.getRowMeta(_currentIndex);
    if (meta.isDisabled) return false;
    if (meta.hasChildren && meta.isExpanded) {
      event.preventDefault();
      options.onCollapse(_currentIndex);
      return true;
    }
    const parentIndex = findParentIndex(_currentIndex);
    if (parentIndex !== -1) {
      event.preventDefault();
      moveFocusTo(parentIndex);
      return true;
    }
    event.preventDefault();
    return true;
  }
  function handleKeyDown(event) {
    if (_items.length === 0) return;
    if (event.key === "ArrowRight") {
      handleRightArrow(event);
      return;
    }
    if (event.key === "ArrowLeft") {
      handleLeftArrow(event);
      return;
    }
    inner.handleKeyDown(event);
  }
  return {
    handleKeyDown,
    setItems(items) {
      _items = items;
      inner.setItems(items);
      if (_currentIndex >= items.length) {
        _currentIndex = Math.max(0, items.length - 1);
      }
    },
    setIndex(index) {
      if (index >= 0 && index < _items.length) {
        _currentIndex = index;
        inner.setIndex(index);
      }
    },
    destroy() {
      inner.destroy();
      _items = [];
    }
  };
}
function findFirstEnabledIndex(items, getRowMeta) {
  for (let i = 0; i < items.length; i++) {
    if (!getRowMeta(i).isDisabled) return i;
  }
  return items.length > 0 ? 0 : -1;
}
export {
  createTreeNav
};
//# sourceMappingURL=index11.js.map
