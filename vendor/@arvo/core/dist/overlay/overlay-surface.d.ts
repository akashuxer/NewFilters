import { Placement, PlacementFlip, PositionResult } from '../position';
import { MaskOptions } from '../mask';
import { TransitionType } from '../animation';
import { OverlayHub, OverlayType, OverlayRelation } from './overlay-hub';
/** ARIA wiring the engine writes onto the consumer-provided trigger. */
export interface OverlaySurfaceTriggerAria {
    /** `aria-haspopup` value. `false` omits the attribute. */
    haspopup?: 'menu' | 'listbox' | 'dialog' | 'grid' | 'tree' | true | false;
    /** `aria-controls` target id. Defaults to `surface.id` when present. */
    controls?: string;
    /** When true (default) `aria-expanded` reflects the open state. */
    expanded?: boolean;
    /**
     * Optional element to receive the trigger-ARIA attributes
     * (`aria-haspopup`, `aria-controls`, `aria-expanded`) instead of the
     * `trigger`. Use when a composed field anchors positioning + dismissal
     * to a wrapper element (e.g. a form-input field div) but a nested
     * element (e.g. an editable `<input role="combobox">`) is the canonical
     * ARIA target per the WAI-ARIA pattern. `ArvoCombobox` is the canonical
     * consumer. Falls back to `trigger` when unset.
     */
    element?: HTMLElement | null;
}
/** Focus management for the surface while open. */
export interface OverlaySurfaceFocusOptions {
    /**
     * `'trap'` activates a focus trap inside the surface (modal / interactive
     * popover / picker). `'none'` keeps DOM focus where it is -- used by
     * option-list / combobox surfaces that drive `aria-activedescendant` on
     * the trigger while focus stays on the field.
     */
    mode: 'trap' | 'none';
    initialFocus?: HTMLElement | (() => HTMLElement | null | undefined) | 'first' | 'none';
    /** Return focus to the trigger on close. Defaults to true when a trigger exists. */
    returnFocus?: boolean;
    escapeDeactivates?: boolean;
    allowOutsideClick?: boolean;
    getOrderedElements?: () => Array<HTMLElement | null | undefined>;
    /**
     * Activate the trap only AFTER the enter transition completes (slide-in
     * panels: Drawer / SidePanel). Default false (activate immediately).
     */
    activateAfterTransition?: boolean;
}
/** Positioning config. Pass `false` for non-anchored surfaces (modal/toast). */
export interface OverlaySurfacePositionOptions {
    placement?: Placement;
    gap?: number;
    margin?: number;
    width?: 'anchor' | number | string;
    boundary?: HTMLElement;
    observeContainerSelector?: string;
    /**
     * Placement-flip strategy when the requested placement does not fit.
     * Defaults to `'main-axis'` so anchored panels stay on the requested axis
     * (top<->bottom or left<->right) and rely on `maxHeight` clamping +
     * internal scroll when overflowing. Pass `'any'` for tooltip-style
     * components that intentionally cascade to adjacent (perpendicular) sides.
     */
    flip?: PlacementFlip;
    /**
     * When `true`, the surface pins its resolved placement on the first open
     * so that subsequent reposition events triggered by the FLOAT's own size
     * changes (e.g. an action menu filter shrinking its item list) cannot
     * re-resolve to a different side. Reposition events from anchor/container
     * resizes, page scroll, and window resize still re-resolve normally
     * (placement may legitimately flip when the world around the surface
     * changes).
     *
     * Default `false` (existing behavior preserved). Anchored panels with
     * dynamic content -- chiefly `ArvoActionMenu` -- opt in to avoid the
     * flip-flicker the user observes while typing in a filter: as items
     * disappear, the float shrinks, the watcher fires, and `bottom-start`
     * (which previously didn't fit before the filter) is suddenly fit again
     * so the panel jumps back to `bottom-start` mid-interaction.
     */
    lockPlacementOnFloatResize?: boolean;
    /**
     * Custom application of the resolved position to the surface. Defaults to
     * `transform: translate(x, y)` + `--arvo-overlay-max-height` +
     * `--arvo-overlay-width`. Existing components migrating onto the engine
     * pass their own to keep their bespoke CSS variable names.
     */
    apply?: (result: PositionResult, surface: HTMLElement) => void;
}
export interface OverlaySurfaceOptions {
    /** Unique hub id. Auto-generated when omitted. */
    id?: string;
    /** The floating panel element the engine manages. Required. */
    surface: HTMLElement;
    /**
     * Optional outer wrapper element that visually contains the surface and
     * creates a stacking context around it (typically a viewport-spanning
     * `position: fixed; inset: 0` host). When provided, the engine attaches
     * it to the hub so its z-index stays pinned to the surface's hub-assigned
     * value across stack changes. Required for composing overlays such as
     * `ArvoWindow` / `ArvoAlertDialog` whose `__panel` is rendered inside an
     * outer flex-centered `.arvo-{abbr}` root -- without this, the wrapper's
     * SCSS-declared fallback (`--arvo-z-popover: 1000`) traps the panel
     * inside its own stacking context and any sibling overlay above 1000
     * visually obscures the surface.
     *
     * The wrapper element is the consumer's responsibility to mount; the
     * engine only manages its z-index synchronization with the hub.
     */
    surfaceRoot?: HTMLElement;
    /** Hub overlay type (drives stacking + dismissal partitioning). */
    type: OverlayType;
    /** Hub stacking priority. */
    priority?: number;
    /**
     * Per-overlay z-index override forwarded to the hub. When set, the hub
     * uses this value INSTEAD of the computed `zIndexBase + stackIndex * 10`,
     * still clamped to `parent.z + 10` for nested overlays. Prefer
     * `overlayHub.configure({ zIndexBase })` for app-wide tuning; reach for
     * this when a specific surface must escape a higher stacking context in
     * the consumer app.
     */
    zIndex?: number;
    /** Element the surface positions against + wires ARIA + returns focus to. */
    trigger?: HTMLElement | null;
    /** Virtual anchor coordinates, when positioning against a point not an element. */
    anchorRect?: {
        x: number;
        y: number;
    } | null;
    /** Parent overlay id when this surface is a nested submenu / inline child. */
    parentId?: string;
    relation?: OverlayRelation;
    /** Override hub focus-trap ownership. Auto-set true when focus.mode === 'trap'. */
    managesOwnFocus?: boolean;
    /** Override hub backdrop ownership. Auto-set true when a mask is configured. */
    managesOwnBackdrop?: boolean;
    /**
     * Mount target. When provided, the engine appends `surface` to the target
     * on open. When omitted, the consumer owns DOM placement (the engine only
     * toggles the open class + behavior).
     */
    mount?: {
        target: HTMLElement | (() => HTMLElement | null);
        /** Remove the surface from the DOM after the exit transition. Default false. */
        removeOnClose?: boolean;
    };
    /** Position config. `false` skips positioning (modal/toast). */
    position?: OverlaySurfacePositionOptions | false;
    /** Focus management. Default `{ mode: 'none' }`. */
    focus?: OverlaySurfaceFocusOptions;
    /** Mask/backdrop. `true` uses defaults; an object customizes it. */
    mask?: boolean | MaskOptions;
    /** Lock page scroll while open (drawer/modal). */
    lockScroll?: boolean;
    /** Close on outside click (hub-driven). Default true. */
    closeOnOutside?: boolean;
    /** Enter/exit transition. `null` disables animation. */
    transition?: TransitionType | null;
    transitionDuration?: number;
    /** Visibility class toggled on the surface. Default `'open'`. */
    openClass?: string;
    /** ARIA written onto the trigger. `false` disables. */
    triggerAria?: OverlaySurfaceTriggerAria | false;
    /** Called after the surface has opened (hub registered, positioned). */
    onOpen?: () => void;
    /** Called after the surface has closed (hub unregistered). */
    onClose?: () => void;
    /** Called on every reposition with the resolved result. */
    onPosition?: (result: PositionResult) => void;
    /** Hub override (React OverlayProvider-scoped hub / tests). Defaults to the singleton. */
    hub?: OverlayHub;
}
export interface OverlaySurface {
    readonly id: string;
    /** Register + position + trap + animate the surface in. Idempotent. */
    open(): Promise<void>;
    /** Unregister + animate out + return focus. Idempotent. */
    close(): Promise<void>;
    isOpen(): boolean;
    /** Re-run positioning immediately. */
    reposition(): void;
    /** Swap the trigger element (re-wires ARIA + return-focus target). */
    setTrigger(trigger: HTMLElement | null): void;
    /**
     * Update the virtual anchor coordinates (for point-anchored surfaces such
     * as context menus). When called while open the surface is repositioned
     * immediately. Pass `null` to clear the virtual anchor.
     */
    setAnchorRect(rect: {
        x: number;
        y: number;
    } | null): void;
    /** Tear down all listeners, hub entry, mask, and restore the trigger. */
    destroy(): void;
}
/**
 * Creates an overlay surface controller around a consumer-built panel.
 *
 * The returned controller owns the surfacing lifecycle; the consumer owns
 * the panel's content and the trigger element. See the module header.
 */
export declare function createOverlaySurface(options: OverlaySurfaceOptions): OverlaySurface;
//# sourceMappingURL=overlay-surface.d.ts.map