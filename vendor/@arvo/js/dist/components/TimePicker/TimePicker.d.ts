import { TimeObject } from '../../../../core/src';
import { ArvoFormLabelContextHelpConfig } from '../FormLabel/FormLabel';
export type { TimeObject } from '../../../../core/src';
/**
 * Scoped escape-hatch bag for popover surface options. TimePicker portals
 * a custom overlay (not `ArvoPopover`). Mirrors the React twin.
 *
 * A `timeProps` bag is intentionally omitted in this pass -- the inner
 * `ArvoTimeDropdown` has no parity-safe long-tail option today.
 */
export interface TimePickerPopoverProps {
    /** CSS width override on the popover surface. */
    width?: string;
    /** Pixel offset between the trigger and the popover. Default: 4. */
    offset?: number;
}
export interface ArvoTimePickerOptions {
    value?: TimeObject | Date | string | null;
    defaultValue?: TimeObject | Date | string | null;
    format?: string | null;
    locale?: string | null;
    interval?: number;
    minTime?: TimeObject | string | null;
    maxTime?: TimeObject | string | null;
    placeholder?: string | null;
    label?: string | null;
    /**
     * Optional contextual-help icon attached to the field label. When provided,
     * embeds an `ArvoContextHelp` at `size: 'sm'` (14px) absolutely positioned
     * to the right of the label. Has no effect when `label` is omitted.
     */
    contextHelp?: ArvoFormLabelContextHelpConfig | null;
    variant?: 'default';
    size?: 'sm' | 'lg';
    surface?: 'filled' | 'base';
    width?: string | null;
    isFullWidth?: boolean;
    isDisabled?: boolean;
    isReadOnly?: boolean;
    isRequired?: boolean;
    isInvalid?: boolean;
    errorMsg?: string | null;
    errorDisplay?: 'inline' | 'tooltip' | 'none';
    isLoading?: boolean;
    /** Opt-in clear button (default `false`). */
    isClearable?: boolean;
    isAutoClose?: boolean;
    isStrictParsing?: boolean;
    isSegmented?: boolean;
    anchor?: false | true | HTMLElement | string;
    placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'auto';
    /**
     * Scoped escape-hatch bag for popover surface options. Bag-only keys
     * (`width`, `offset`) flow through; flat options (`placement`) always
     * win on overlap. Z-index is owned by the overlay hub.
     */
    popoverProps?: TimePickerPopoverProps;
    onChange?: (payload: {
        value: TimeObject | null;
        formattedValue: string;
    }) => void;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    onBlur?: () => void;
}
export declare class ArvoTimePicker {
    private _element;
    private _opts;
    private _effLocale;
    private _effFormat;
    private readonly _id;
    private readonly _inputId;
    private readonly _labelId;
    private readonly _errorId;
    private readonly _popoverId;
    private _committedValue;
    private _isOpen;
    private _errorOverride;
    private _loadingOverride;
    private _hasTextSelected;
    private _preFocusValue;
    private _inputFocused;
    private _useAnchorRender;
    private _anchorEl;
    private _labelEl;
    private _fieldEl;
    private _inputEl;
    private _actionsEl;
    private _clearBtnEl;
    private _triggerBtnEl;
    private _errIcoEl;
    private _errIcoConnector;
    private _errMsgEl;
    private _popoverEl;
    private _bodyEl;
    private _timeDropdownHostEl;
    private _clearBtn;
    private _triggerBtn;
    private _errIco;
    private _inlineAlert;
    private _timeDropdown;
    private _segmentCtrl;
    private _surface;
    private _closingProgrammatically;
    private _resizeObserver;
    private _loadingObserver;
    private _boundInputKeyDown;
    private _boundInputFocus;
    private _boundInputBlur;
    private _boundInputMouseDown;
    private _boundInputPaste;
    private _boundInputChange;
    private _boundAnchorClick;
    private _boundAnchorKeyDown;
    private _destroyed;
    static initialize(element: HTMLElement, options?: ArvoTimePickerOptions): ArvoTimePicker;
    constructor(element: HTMLElement, options?: ArvoTimePickerOptions);
    private _renderDomInput;
    private _renderDomAnchor;
    private _renderActions;
    private _renderInlineError;
    private _initSegmentController;
    private _observeActions;
    private _observeParentLoading;
    private _syncLoadingState;
    private _updatePadding;
    private _applyWidth;
    private _syncRootClasses;
    private _effError;
    private _effLoading;
    private _asTime;
    private _updateInputDisplay;
    private _refreshInputFromController;
    private _handleCommit;
    private _handleTriggerClick;
    private _handleInputFocus;
    /**
     * Click-to-segment. Mirrors the DatePicker implementation; see that file
     * for the rAF rationale.
     */
    private _handleInputMouseDown;
    private _handleInputBlur;
    private _handleInputChange;
    private _handleInputKeyDown;
    private _handleInputPaste;
    private _handleAnchorClick;
    private _handleAnchorKeyDown;
    /**
     * Builds the popover DOM once (lazy). Does NOT append to the document --
     * the OverlaySurface engine mounts + unmounts via `mount.target` /
     * `mount.removeOnClose` on each open/close cycle (mirrors the React portal
     * pattern where `isMounted` gates the portal render).
     */
    private _buildPopover;
    private _createTimeDropdown;
    private _syncTimeDropdownValue;
    /**
     * Tab cycle inside the popover (mirrors React's `getOrderedPopoverElements`).
     * ArvoTimeDropdown uses roving tabindex; the single `[tabindex="0"]` element
     * is the current time item. Initial focus is set imperatively after the
     * engine positions the panel -- see open() rAF block.
     */
    private _getOrderedPopoverElements;
    /**
     * Engine-driven close callback. Fires (synchronously, before the exit
     * animation) for outside-click and Escape via the hub. Per the
     * cross-cutting overlay policy, engine-driven dismissals are
     * unconditional and silent -- no tp:close dispatch, no onClose veto.
     *
     * The `_closingProgrammatically` flag guards against the symmetric case
     * where this.close() calls surface.close() -- in that path the flag is true
     * and we return early since the programmatic path already synced state +
     * classes + focus return.
     */
    private _handleEngineClose;
    open(): void;
    close(): void;
    toggle(force?: boolean): void;
    value(): TimeObject | null;
    value(v: TimeObject | Date | string | null): void;
    formattedValue(): string;
    clear(): void;
    disabled(): boolean;
    disabled(state: boolean): void;
    setError(message: string | false): void;
    setLoading(loading: boolean): void;
    focus(): void;
    destroy(): void;
}
export default ArvoTimePicker;
//# sourceMappingURL=TimePicker.d.ts.map