export type ArvoLoaderVariant = 'dot' | 'circular' | 'square';
export type ArvoLoaderSize = 'sm' | 'md' | 'lg';
export type ArvoLoaderOrientation = 'horizontal' | 'vertical';
export type ArvoLoaderTone = 'theme' | 'inverse' | 'subtle';
export interface ArvoLoaderOptions {
    variant?: ArvoLoaderVariant;
    size?: ArvoLoaderSize;
    orientation?: ArvoLoaderOrientation;
    tone?: ArvoLoaderTone;
    /**
     * Visible loading text + accessible name. Pass `null` (or an empty
     * string) to hide the visible label; the loader still announces via
     * `aria-label` so AT users continue to receive the status.
     */
    message?: string | null;
}
export declare const ARVO_LOADER_DEFAULT_MESSAGE = "Loading";
export declare const ARVO_LOADER_VARIANTS: readonly ArvoLoaderVariant[];
export declare const ARVO_LOADER_SIZES: readonly ArvoLoaderSize[];
export declare const ARVO_LOADER_ORIENTATIONS: readonly ArvoLoaderOrientation[];
export declare const ARVO_LOADER_TONES: readonly ArvoLoaderTone[];
export declare class ArvoLoader {
    /** The host element passed to initialize. Decorated in place. */
    readonly el: HTMLElement;
    private _opts;
    private _shapeEl;
    private _msgEl;
    private _destroyed;
    static readonly VARIANTS: readonly ArvoLoaderVariant[];
    static readonly SIZES: readonly ArvoLoaderSize[];
    static readonly ORIENTATIONS: readonly ArvoLoaderOrientation[];
    static readonly TONES: readonly ArvoLoaderTone[];
    static readonly DEFAULT_MESSAGE = "Loading";
    /** Factory matching the rest of the @arvo/js components. */
    static initialize(element: HTMLElement | null, options?: ArvoLoaderOptions): ArvoLoader;
    constructor(element: HTMLElement, options?: ArvoLoaderOptions);
    private _render;
    /** Rebuild the inner shape DOM for the current variant. */
    private _renderShape;
    private _applyClasses;
    private _applyMessage;
    setVariant(variant: ArvoLoaderVariant): void;
    setSize(size: ArvoLoaderSize): void;
    setOrientation(orientation: ArvoLoaderOrientation): void;
    setTone(tone: ArvoLoaderTone): void;
    setMessage(message: string | null): void;
    /** Read-only accessors mirroring the React props (for tests / introspection). */
    variant(): ArvoLoaderVariant;
    size(): ArvoLoaderSize;
    orientation(): ArvoLoaderOrientation;
    tone(): ArvoLoaderTone;
    message(): string | null;
    /** Tear down inner DOM + decorations. The host element is preserved. */
    destroy(): void;
}
//# sourceMappingURL=Loader.d.ts.map