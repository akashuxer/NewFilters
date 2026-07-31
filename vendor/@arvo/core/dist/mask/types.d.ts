export interface MaskOptions {
    /**
     * Append the mask inside this element instead of `document.body`. When set,
     * the `--scoped` modifier is added so the SCSS can position absolutely
     * within the container instead of fixed.
     */
    container?: HTMLElement | string;
    /** When true and `onOutside` is provided, fire `onOutside` on pointerdown. */
    closeOnClick?: boolean;
    /** Optional z-index override. */
    zIndex?: number;
    /** Pointer-down handler invoked when `closeOnClick` is true. */
    onOutside?: (event: PointerEvent) => void;
    /** Whether the mask animates show/hide (default true). */
    animated?: boolean;
    /** When true (default) sets `aria-hidden="true"` on the mask element. */
    ariaHidden?: boolean;
    /** Additional class appended to the mask element for theming hooks. */
    className?: string;
}
export interface MaskInstance {
    show: () => void;
    hide: () => void;
    destroy: () => void;
    element: HTMLElement;
}
//# sourceMappingURL=types.d.ts.map