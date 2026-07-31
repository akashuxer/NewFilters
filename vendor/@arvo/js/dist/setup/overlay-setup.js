import { overlayHub } from "@arvo/core";
const overlayIds = /* @__PURE__ */ new WeakMap();
let _idCounter = 0;
function generateId() {
  return `arvo-overlay-${++_idCounter}`;
}
function setupOverlayPlugin(jq, hub = overlayHub) {
  jq.setupOverlays = function(config) {
    hub.configure(config);
  };
  jq.closeAllOverlays = function(options) {
    hub.closeAll(options);
  };
  jq.isOverlayOpen = function(id) {
    return hub.isOpen(id);
  };
  jq.fn.openOverlay = function(entry = {}) {
    this.each(function() {
      const el = this;
      const id = entry.id ?? generateId();
      const prev = overlayIds.get(el);
      if (prev) hub.close(prev);
      hub.open({
        id,
        type: entry.type ?? "dropdown",
        element: el,
        triggerElement: entry.triggerElement,
        priority: entry.priority ?? 0,
        config: entry.config ?? {},
        onClose: entry.onClose
      });
      overlayIds.set(el, id);
    });
    return this;
  };
  jq.fn.closeOverlay = function() {
    this.each(function() {
      const id = overlayIds.get(this);
      if (id) {
        hub.close(id);
        overlayIds.delete(this);
      }
    });
    return this;
  };
}
export {
  setupOverlayPlugin
};
//# sourceMappingURL=overlay-setup.js.map
