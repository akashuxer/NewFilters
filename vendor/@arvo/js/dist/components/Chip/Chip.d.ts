import { ArvoStatusConfig } from '../Status/Status';
export type ArvoChipVariant = 'general' | 'filter' | 'input';
export type ArvoChipSize = 'sm' | 'md' | 'lg';
export type ArvoChipAppearance = 'primary' | 'outline' | 'utility';
export type ArvoChipColorMode = 'default' | 'semantic' | 'custom';
export type ArvoChipSemanticType = 'none' | 'negative' | 'positive' | 'info' | 'warning' | 'block';
export type ArvoChipCustomColor = 'purple' | 'pink' | 'glacier' | 'amber' | 'greenish' | 'bluish';
/** DOM-friendly bag injected by a reorderable ArvoChipList onto the drag handle. */
export type ArvoChipDragHandleProps = Record<string, string | number | ((event: Event) => void)>;
export interface ArvoChipOptions {
    variant?: ArvoChipVariant;
    size?: ArvoChipSize;
    appearance?: ArvoChipAppearance;
    colorMode?: ArvoChipColorMode;
    semanticType?: ArvoChipSemanticType;
    customColor?: ArvoChipCustomColor;
    label?: string;
    title?: string | null;
    icon?: string | null;
    /** Avatar slot: an <img> src string or a ready-made element. Ignored in semantic color mode. */
    avatar?: string | HTMLElement | null;
    status?: ArvoStatusConfig | null;
    counter?: number | null;
    isSelected?: boolean;
    defaultSelected?: boolean;
    isDisabled?: boolean;
    isReadOnly?: boolean;
    isInvalid?: boolean;
    isWarning?: boolean;
    isExcluded?: boolean;
    isLoading?: boolean;
    maxWidth?: string | null;
    onSelectedChange?: (selected: boolean) => void;
    onPress?: () => void;
    onDismiss?: () => void;
    dismissLabel?: string | null;
    /**
     * Render the `__grip` drag handle as part of the chip surface, independent
     * of any `dragHandleProps` injection. Use when the chip participates in an
     * externally-owned dnd surface that does not inject a bag. The rendered
     * handle is a static drag-cursor ArvoIconButton with no dnd wiring; the
     * consumer is responsible for the actual drag pipeline. When
     * `dragHandleProps` is ALSO provided, the bag wins. Honored in every color
     * mode. Suppressed when `isDisabled` / `isReadOnly` / `isLoading`.
     */
    hasDrag?: boolean;
    dragHandleProps?: ArvoChipDragHandleProps | null;
}
export declare class ArvoChip {
    readonly el: HTMLElement;
    private _opts;
    private _gripBtnEl;
    private _gripInstance;
    private _icoEl;
    private _avatarEl;
    private _titleEl;
    private _lblEl;
    private _counterSpan;
    private _counterInstance;
    private _alertEl;
    private _alertInstance;
    private _excludeEl;
    private _statusEl;
    private _statusInstance;
    private _dismissSpan;
    private _dismissBtnEl;
    private _dismissInstance;
    private _dismissOnClick;
    private _boundClick;
    private _boundKeydown;
    private _destroyed;
    private _isRemoving;
    static initialize(element: HTMLElement, options?: ArvoChipOptions): ArvoChip;
    constructor(element: HTMLElement, options?: ArvoChipOptions);
    private get _isFilter();
    private get _isDismissibleInput();
    /**
     * Input chips with onDismiss are themselves the focusable surface (single-
     * focus chip model -- Delete/Backspace remove). They count as interactive
     * for role/tabindex/click-routing purposes even though the click on the
     * chip body is a no-op (only the inner __dismiss span fires onDismiss).
     */
    private get _isInteractive();
    private get _isSemantic();
    private get _showInvalid();
    private get _showWarning();
    private get _showExcluded();
    /**
     * Grip is rendered when EITHER ChipList injects dragHandleProps OR the
     * standalone chip sets hasDrag=true, in every color mode -- including
     * semantic, so reorderable semantic chip lists keep their handles.
     * Disabled / read-only / loading chips suppress the grip.
     */
    private get _showGrip();
    private get _showAvatar();
    private get _showStatus();
    private get _effectiveAppearance();
    private get _showDismiss();
    private _resolveColorClass;
    private _render;
    private _buildRootClasses;
    private _applyRootAttributes;
    private _toggleAttr;
    private _renderContent;
    private _applyDragHandleProps;
    private _bindEvents;
    private _handleClick;
    private _handleKeydown;
    /**
     * Drive the chip remove leave animation. Adds `.is-removing` to the chip
     * root, waits for the max-width transition to finish (or the safety
     * timeout fires), then calls `onDismiss` and emits `chip:dismiss`.
     *
     * In environments without CSS transitions (jsdom, prefers-reduced-motion)
     * the safety timeout (500ms past the longest leg of
     * `$arvo-motion-chip-remove`) ensures the consumer still receives the
     * dismissal callback.
     */
    private _beginRemove;
    private _emit;
    setLabel(text: string): void;
    setTitle(text: string | null): void;
    setIcon(iconName: string | null): void;
    setVariant(variant: ArvoChipVariant): void;
    setSize(size: ArvoChipSize): void;
    setAppearance(appearance: ArvoChipAppearance): void;
    setColorMode(mode: ArvoChipColorMode): void;
    setSemanticType(type: ArvoChipSemanticType): void;
    setCustomColor(color: ArvoChipCustomColor): void;
    private _applyColorClass;
    setCounter(value: number | null): void;
    setStatus(config: ArvoStatusConfig | false): void;
    setMaxWidth(value: string | null): void;
    selected(state?: boolean): boolean | void;
    disabled(state?: boolean): boolean | void;
    readOnly(state?: boolean): boolean | void;
    invalid(state?: boolean): boolean | void;
    warning(state?: boolean): boolean | void;
    excluded(state?: boolean): boolean | void;
    setLoading(loading: boolean): void;
    focus(): void;
    private _refreshDismiss;
    private _rebuild;
    private _teardownInner;
    private _unbindEvents;
    destroy(): void;
}
//# sourceMappingURL=Chip.d.ts.map