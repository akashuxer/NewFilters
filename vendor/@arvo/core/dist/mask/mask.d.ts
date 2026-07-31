import { MaskOptions, MaskInstance } from './types';
/**
 * Factory that creates a mask/backdrop overlay element with show/hide
 * transitions and scoped (container-relative) mode.
 *
 * The mask always renders with `background: var(--arvo-color-s-overlay-static)`
 * and `backdrop-filter: blur(4px)` -- the color and filter are not
 * configurable per-instance.
 *
 * The element is published as `.arvo-overlay__mask` and becomes visible via
 * the `--visible` modifier on a delay so the browser paints the transparent
 * state first (enables the CSS transition). On hide, the modifier is
 * removed and the element is detached after the transition window.
 *
 * Both Alert Dialog and Drawer instantiate one mask per overlay and tie its
 * visibility to the host's open state. The component layer never paints
 * its own scrim.
 */
export declare function createMask(options?: MaskOptions): MaskInstance;
//# sourceMappingURL=mask.d.ts.map