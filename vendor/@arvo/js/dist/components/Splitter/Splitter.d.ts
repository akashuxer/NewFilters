export type ArvoSplitterOrientation = 'vertical' | 'horizontal';
export type ArvoSplitterResizeReason = 'pointer' | 'keyboard' | 'reset' | 'programmatic';
export interface ArvoSplitterOptions {
    orientation?: ArvoSplitterOrientation;
    /**
     * Enables drag/keyboard interaction. When `false`, the splitter is a
     * static visual separator with no indicator, no events, and not focusable.
     * Defaults to `true`.
     */
    isResizable?: boolean;
    /**
     * Primary container the splitter resizes. Accepts an HTMLElement or a CSS
     * selector string. When set, the splitter automatically applies the
     * current size to the target via inline style (`width` for vertical,
     * `height` for horizontal), auto-detects the `inverse` direction by
     * inspecting the target's DOM position relative to the splitter, and
     * (when `ariaControls` is omitted) auto-derives `aria-controls` from
     * `target.id`. When omitted, the splitter is purely callback-driven --
     * the consumer applies the size to their own region in response to the
     * `onResize` callback / `spl:resize` event.
     */
    target?: HTMLElement | string | null;
    /**
     * Pointer-direction inversion. When `true`, dragging the rail in the
     * positive axis direction DECREASES the reported value. Defaults to auto-
     * detection when `target` is set (target after splitter => `true`), and
     * to `false` when `target` is omitted. Keyboard and `value()` setters are
     * direction-agnostic.
     */
    inverse?: boolean;
    /** Initial size in pixels. */
    value?: number;
    /**
     * Uncontrolled initial size in pixels AND the snap-to value used by
     * double-click reset / `reset()`. When omitted but `target` is set, the
     * splitter measures the target's natural size and uses that as the reset
     * target. When omitted with no target, falls back to `minSize`.
     */
    defaultValue?: number;
    /** Lower clamping bound in pixels. Defaults to 0. */
    minSize?: number;
    /** Upper clamping bound in pixels. Defaults to unbounded. */
    maxSize?: number;
    /** Arrow-key step in pixels. */
    step?: number;
    /** PageUp / PageDown step in pixels. */
    pageStep?: number;
    isDisabled?: boolean;
    /** Accessible name. Required when isResizable=true. */
    ariaLabel?: string;
    /** Optional id of the resized region. */
    ariaControls?: string;
    onResizeStart?: (detail: {
        value: number;
        reason: ArvoSplitterResizeReason;
    }) => void;
    onResize?: (detail: {
        value: number;
        reason: ArvoSplitterResizeReason;
    }) => void;
    onResizeEnd?: (detail: {
        value: number;
        reason: ArvoSplitterResizeReason;
    }) => void;
    onChange?: (detail: {
        value: number;
    }) => void;
    onReset?: (detail: {
        value: number;
    }) => void;
}
type RequiredOptions = Required<Omit<ArvoSplitterOptions, 'onResizeStart' | 'onResize' | 'onResizeEnd' | 'onChange' | 'onReset' | 'value' | 'ariaLabel' | 'ariaControls' | 'target' | 'inverse' | 'defaultValue' | 'maxSize'>> & {
    value: number | null;
    defaultValue: number | null;
    inverse: boolean | null;
    ariaLabel: string | null;
    ariaControls: string | null;
    target: HTMLElement | string | null;
    maxSize: number | null;
    onResizeStart: ((detail: {
        value: number;
        reason: ArvoSplitterResizeReason;
    }) => void) | null;
    onResize: ((detail: {
        value: number;
        reason: ArvoSplitterResizeReason;
    }) => void) | null;
    onResizeEnd: ((detail: {
        value: number;
        reason: ArvoSplitterResizeReason;
    }) => void) | null;
    onChange: ((detail: {
        value: number;
    }) => void) | null;
    onReset: ((detail: {
        value: number;
    }) => void) | null;
};
export declare class ArvoSplitter {
    private _element;
    private _options;
    private _handleEl;
    private _currentValue;
    private _resetTarget;
    private _resolvedTargetEl;
    private _effectiveInverse;
    private _isDragging;
    private _boundHandlePointerDown;
    private _boundHandleKeyDown;
    private _boundHandleDoubleClick;
    private _boundHandlePointerMove;
    private _boundHandlePointerUp;
    private _dragStartCoord;
    private _dragStartValue;
    static readonly ORIENTATIONS: readonly ["vertical", "horizontal"];
    static readonly DEFAULTS: RequiredOptions;
    static initialize(element: HTMLElement, options?: ArvoSplitterOptions): ArvoSplitter;
    constructor(element: HTMLElement, options?: ArvoSplitterOptions);
    private _render;
    private _bindEvents;
    private _applyTargetSize;
    private _handlePointerDown;
    private _handlePointerMove;
    private _handlePointerUp;
    private _handleKeyDown;
    private _handleDoubleClick;
    private _doReset;
    private _setValue;
    private _fireStart;
    private _fireResize;
    private _fireEnd;
    private _dispatchEvent;
    value(next?: number): number;
    disabled(state?: boolean): boolean;
    focus(): void;
    reset(): number;
    setTarget(target: HTMLElement | string | null): void;
    setMinSize(min: number): void;
    setMaxSize(max: number | null): void;
    destroy(): void;
}
export {};
//# sourceMappingURL=Splitter.d.ts.map