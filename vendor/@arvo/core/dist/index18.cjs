"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const focusTrap = require("./index5.cjs");
const backdrop = require("./index21.cjs");
const DEFAULT_CONFIG = {
  containerSelector: "body",
  positionMode: "viewport",
  zIndexBase: 1e3,
  autoCloseOnRouteChange: true,
  autoCloseOnOutsideClick: true,
  maxStack: 0
};
const MODAL_TYPES = /* @__PURE__ */ new Set([
  "modal",
  "side-panel"
]);
const DISPLACED_BY_MODAL = /* @__PURE__ */ new Set([
  "dropdown",
  "popover",
  "action-menu"
]);
function createOverlayHub() {
  let _config = { ...DEFAULT_CONFIG };
  const _stack = [];
  const _traps = /* @__PURE__ */ new Map();
  const _zIndices = /* @__PURE__ */ new Map();
  const _backdrop = backdrop.createBackdropManager();
  let _onMouseDown = null;
  let _onKeyDown = null;
  let _onPopState = null;
  function zIndexFor(stackIndex) {
    return _config.zIndexBase + stackIndex * 10;
  }
  function isDismissable(entry) {
    return (entry.config.autoCloseOnOutsideClick ?? _config.autoCloseOnOutsideClick) !== false;
  }
  function rootStackPriority(type) {
    switch (type) {
      case "tooltip":
        return 2;
      case "toast":
        return 1;
      default:
        return 0;
    }
  }
  function flattenForStacking() {
    if (_stack.length === 0) return [];
    const indexById = /* @__PURE__ */ new Map();
    for (let i = 0; i < _stack.length; i++) indexById.set(_stack[i].id, i);
    const childrenByParent = /* @__PURE__ */ new Map();
    const roots = [];
    for (const e of _stack) {
      const parent = e.parentId && indexById.has(e.parentId) ? e.parentId : void 0;
      if (parent) {
        const list = childrenByParent.get(parent);
        if (list) list.push(e);
        else childrenByParent.set(parent, [e]);
      } else {
        roots.push(e);
      }
    }
    roots.sort((a, b) => {
      const pa = rootStackPriority(a.type);
      const pb = rootStackPriority(b.type);
      if (pa !== pb) return pa - pb;
      return (indexById.get(a.id) ?? 0) - (indexById.get(b.id) ?? 0);
    });
    const out = [];
    const visited = /* @__PURE__ */ new Set();
    function emit(entry) {
      if (visited.has(entry.id)) return;
      visited.add(entry.id);
      out.push(entry);
      const kids = childrenByParent.get(entry.id);
      if (!kids || kids.length === 0) return;
      kids.sort(
        (a, b) => (indexById.get(a.id) ?? 0) - (indexById.get(b.id) ?? 0)
      );
      for (const child of kids) emit(child);
    }
    for (const root of roots) emit(root);
    if (out.length < _stack.length) {
      for (const e of _stack) if (!visited.has(e.id)) emit(e);
    }
    return out;
  }
  function refreshZIndices() {
    const ordered = flattenForStacking();
    const idToZ = /* @__PURE__ */ new Map();
    for (let i = 0; i < ordered.length; i++) {
      const entry = ordered[i];
      const computed = zIndexFor(i);
      let z = computed;
      if (typeof entry.zIndex === "number") {
        z = entry.zIndex;
        if (entry.parentId) {
          const parentZ = idToZ.get(entry.parentId);
          if (parentZ != null && z <= parentZ) {
            z = parentZ + 10;
          }
        }
      }
      idToZ.set(entry.id, z);
      _zIndices.set(entry.id, z);
      entry.element.style.zIndex = String(z);
      if (entry.wrapperElement) {
        entry.wrapperElement.style.zIndex = String(z);
      }
      if (entry.maskElement) {
        entry.maskElement.style.zIndex = String(z - 1);
      }
    }
  }
  function stackIds() {
    return _stack.map((e) => e.id);
  }
  function syncBackdrop() {
    const topModal = findTopmostModal();
    if (!topModal) {
      _backdrop.hide();
      return;
    }
    const container = hub.getContainer();
    const z = _zIndices.get(topModal.id) ?? _config.zIndexBase;
    if (!_backdrop.isVisible()) {
      _backdrop.show({
        opacity: 0.5,
        closeOnClick: isDismissable(topModal),
        animated: false,
        container
      });
    }
    const el = _backdrop.getElement();
    if (el) el.style.zIndex = String(z - 1);
  }
  function findTopmostModal() {
    for (let i = _stack.length - 1; i >= 0; i--) {
      const entry = _stack[i];
      if (MODAL_TYPES.has(entry.type) && !entry.config.managesOwnBackdrop) {
        return entry;
      }
    }
    return void 0;
  }
  function attachGlobal() {
    if (_onMouseDown) return;
    _onMouseDown = (event) => {
      var _a;
      const target = event.target;
      const toClose = [];
      for (let i = _stack.length - 1; i >= 0; i--) {
        const entry = _stack[i];
        if (entry.element.contains(target)) break;
        if ((_a = entry.triggerElement) == null ? void 0 : _a.contains(target)) break;
        if (hub.isOverlayClickInside(entry.element, target)) break;
        if (!isDismissable(entry)) break;
        toClose.push(entry.id);
      }
      for (const id of toClose) hub.close(id);
    };
    document.addEventListener("mousedown", _onMouseDown);
    _onKeyDown = (event) => {
      if (event.key !== "Escape" || _stack.length === 0) return;
      for (let i = _stack.length - 1; i >= 0; i--) {
        const entry = _stack[i];
        if (isDismissable(entry)) {
          event.preventDefault();
          hub.close(entry.id);
          return;
        }
        return;
      }
    };
    document.addEventListener("keydown", _onKeyDown);
    _onPopState = () => {
      if (_config.autoCloseOnRouteChange) {
        hub.closeAll();
      }
    };
    window.addEventListener("popstate", _onPopState);
  }
  function detachGlobal() {
    if (_onMouseDown) {
      document.removeEventListener("mousedown", _onMouseDown);
      _onMouseDown = null;
    }
    if (_onKeyDown) {
      document.removeEventListener("keydown", _onKeyDown);
      _onKeyDown = null;
    }
    if (_onPopState) {
      window.removeEventListener("popstate", _onPopState);
      _onPopState = null;
    }
  }
  function findEntryById(id) {
    return _stack.find((e) => e.id === id);
  }
  function isAncestorChainOf(potentialAncestor, descendant) {
    let current = descendant;
    const seen = /* @__PURE__ */ new Set();
    while (current && !seen.has(current.id)) {
      if (current.id === potentialAncestor.id) return true;
      seen.add(current.id);
      if (!current.parentId) return false;
      current = findEntryById(current.parentId);
    }
    return false;
  }
  function findParentOverlayByTrigger(trigger, excludeId) {
    if (!trigger) return void 0;
    let node = trigger;
    while (node) {
      for (const e of _stack) {
        if (e.id === excludeId) continue;
        if (e.element === node) return e.id;
      }
      node = node.parentElement;
    }
    return void 0;
  }
  function applyStackingRules(entry) {
    if (MODAL_TYPES.has(entry.type)) {
      const ids = _stack.filter((e) => DISPLACED_BY_MODAL.has(e.type)).map((e) => e.id);
      for (const id of ids) hub.close(id);
    }
    if (entry.type === "action-menu") {
      const ids = _stack.filter(
        (e) => e.type === "action-menu" && e.id !== entry.id && !isAncestorChainOf(e, entry)
      ).map((e) => e.id);
      for (const id of ids) hub.close(id);
    }
  }
  const hub = {
    configure(config) {
      _config = { ..._config, ...config };
    },
    getConfig() {
      return { ..._config };
    },
    open(entry) {
      var _a, _b;
      if (hub.isOpen(entry.id)) hub.close(entry.id);
      if (!entry.parentId) {
        const inferred = findParentOverlayByTrigger(
          entry.triggerElement,
          entry.id
        );
        if (inferred) entry.parentId = inferred;
      }
      applyStackingRules(entry);
      if (_config.maxStack > 0 && _stack.length >= _config.maxStack) {
        hub.close(_stack[0].id);
      }
      _stack.push(entry);
      if (_stack.length === 1) attachGlobal();
      refreshZIndices();
      if (MODAL_TYPES.has(entry.type) && !entry.config.managesOwnFocus) {
        const trap = focusTrap.createFocusTrap();
        trap.activate({
          container: entry.element,
          initialFocus: "first",
          returnFocusOnDeactivate: true,
          escapeDeactivates: false,
          allowOutsideClick: true
        });
        _traps.set(entry.id, trap);
      }
      syncBackdrop();
      (_a = _config.onOpen) == null ? void 0 : _a.call(_config, entry.id);
      (_b = _config.onStackChange) == null ? void 0 : _b.call(_config, stackIds());
    },
    close(id) {
      var _a, _b, _c;
      const idx = _stack.findIndex((e) => e.id === id);
      if (idx === -1) return;
      const entry = _stack[idx];
      _stack.splice(idx, 1);
      const trap = _traps.get(id);
      if (trap) {
        trap.deactivate();
        _traps.delete(id);
      }
      _zIndices.delete(id);
      refreshZIndices();
      if (_stack.length === 0) detachGlobal();
      syncBackdrop();
      (_a = entry.onClose) == null ? void 0 : _a.call(entry);
      (_b = _config.onClose) == null ? void 0 : _b.call(_config, id);
      (_c = _config.onStackChange) == null ? void 0 : _c.call(_config, stackIds());
    },
    closeAll(options) {
      const except = new Set((options == null ? void 0 : options.except) ?? []);
      const ids = _stack.filter((e) => !except.has(e.id)).map((e) => e.id).reverse();
      for (const id of ids) hub.close(id);
    },
    closeByType(type) {
      const ids = _stack.filter((e) => e.type === type).map((e) => e.id).reverse();
      for (const id of ids) hub.close(id);
    },
    isOpen(id) {
      return _stack.some((e) => e.id === id);
    },
    getActive() {
      return [..._stack];
    },
    getTopmost() {
      return _stack.length > 0 ? _stack[_stack.length - 1] : null;
    },
    getContainer() {
      return document.querySelector(
        _config.containerSelector
      ) ?? document.body;
    },
    getZIndex(id) {
      return _zIndices.get(id) ?? _config.zIndexBase;
    },
    attachMaskElement(id, element) {
      const entry = findEntryById(id);
      if (!entry) return;
      if (element) {
        entry.maskElement = element;
        const z = _zIndices.get(id);
        if (z != null) element.style.zIndex = String(z - 1);
      } else {
        delete entry.maskElement;
      }
    },
    attachWrapperElement(id, element) {
      const entry = findEntryById(id);
      if (!entry) return;
      if (element) {
        entry.wrapperElement = element;
        const z = _zIndices.get(id);
        if (z != null) element.style.zIndex = String(z);
      } else {
        if (entry.wrapperElement) {
          entry.wrapperElement.style.removeProperty("z-index");
        }
        delete entry.wrapperElement;
      }
    },
    isOverlayClickInside(root, target) {
      if (!root || !target) return false;
      if (root.contains(target)) return true;
      const visited = /* @__PURE__ */ new Set();
      const queue = [root];
      visited.add(root);
      while (queue.length > 0) {
        const node = queue.shift();
        for (const other of _stack) {
          if (visited.has(other.element)) continue;
          const trig = other.triggerElement;
          if (!trig) continue;
          if (!node.contains(trig)) continue;
          visited.add(other.element);
          if (other.element.contains(target)) return true;
          if (trig.contains(target)) return true;
          queue.push(other.element);
        }
      }
      return false;
    }
  };
  return hub;
}
const overlayHub = createOverlayHub();
exports.createOverlayHub = createOverlayHub;
exports.overlayHub = overlayHub;
//# sourceMappingURL=index18.cjs.map
