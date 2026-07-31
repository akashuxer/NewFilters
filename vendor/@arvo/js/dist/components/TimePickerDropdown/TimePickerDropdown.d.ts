import { TimeObject } from '../../../../core/src';
export type { TimeObject } from '../../../../core/src';
/**
 * Scoped escape-hatch bag for popover surface options. Bag-only keys
 * (`width`, `offset`, `zIndex`) flow through; flat options (`placement`)
 * always win on overlap.
 *
 * `zIndex` is a per-overlay override -- the overlay hub honors it via
 * `OverlaySurfaceOptions.zIndex` while still clamping to `parent.z + 10`
 * for any nested overlays. Prefer `overlayHub.configure({ zIndexBase })`
 * for app-wide tuning; use this when a specific surface must escape a
 * higher stacking context in the consumer app.
 */
export interface TimePickerDropdownPopoverProps {
    width?: string;
    offset?: number;
    zIndex?: number;
}
export interface ArvoTimePickerDropdownOptions {
    value?: TimeObject | Date | string | null;
    defaultValue?: TimeObject | Date | string | null;
    format?: string | null;
    locale?: string | null;
    interval?: number;
    minTime?: TimeObject | string | null;
    maxTime?: TimeObject | string | null;
    /** Initial open state (uncontrolled mode). */
    defaultOpen?: boolean;
    isDisabled?: boolean;
    /** Close the dropdown when an option is selected. Default true. */
    isAutoClose?: boolean;
    placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'auto';
    /** Accessible name for the dialog panel. Defaults to 'Choose a time'. */
    ariaLabel?: string;
    popoverProps?: TimePickerDropdownPopoverProps;
    onChange?: (payload: {
        value: TimeObject | null;
        formattedValue: string;
    }) => void;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    onOpenChange?: (open: boolean) => void;
}
interface RequiredOptions {
    value: TimeObject | Date | string | null | undefined;
    defaultValue: TimeObject | Date | string | null;
    format: string | null;
    locale: string | null;
    interval: number;
    minTime: TimeObject | string | null;
    maxTime: TimeObject | string | null;
    defaultOpen: boolean;
    isDisabled: boolean;
    isAutoClose: boolean;
    placement: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'auto';
    ariaLabel: string;
    popoverProps: TimePickerDropdownPopoverProps | null;
    onChange: ArvoTimePickerDropdownOptions['onChange'] | null;
    onOpen: ArvoTimePickerDropdownOptions['onOpen'] | null;
    onClose: ArvoTimePickerDropdownOptions['onClose'] | null;
    onOpenChange: ArvoTimePickerDropdownOptions['onOpenChange'] | null;
}
export declare class ArvoTimePickerDropdown {
    private _trigger;
    private _opts;
    private _id;
    private _popoverEl;
    private _bodyEl;
    private _timeDropdownHostEl;
    private _timeDropdown;
    private _surface;
    private _committedValue;
    private _isOpen;
    private _destroyed;
    private _closingProgrammatically;
    private _effLocale;
    private _effFormat;
    static readonly PLACEMENTS: readonly ["top-start", "top-end", "bottom-start", "bottom-end", "auto"];
    static readonly DEFAULTS: RequiredOptions;
    static initialize(trigger: HTMLElement, options?: ArvoTimePickerDropdownOptions): ArvoTimePickerDropdown;
    constructor(trigger: HTMLElement, options?: ArvoTimePickerDropdownOptions);
    private _handleTriggerClick;
    private _handleTriggerKeyDown;
    private _bindTrigger;
    private _unbindTrigger;
    private _asTime;
    private _buildPopover;
    private _createTimeDropdown;
    private _syncTimeDropdownValue;
    private _handleCommit;
    private _dispatch;
    /**
     * Engine-driven close callback. Fires for outside-click and Escape via the
     * hub. The cross-cutting overlay policy makes engine-driven dismissals
     * unconditional and silent -- no tp-drop:close event, no onClose veto.
     */
    private _handleEngineClose;
    open(): void;
    close(): void;
    toggle(force?: boolean): void;
    isOpen(): boolean;
    value(): TimeObject | null;
    value(v: TimeObject | Date | string | null): void;
    formattedValue(): string;
    disabled(): boolean;
    disabled(state: boolean): void;
    /**
     * Focus the active time option (only meaningful when open). No-op when
     * closed -- the consumer's trigger is the visible focus target while the
     * dropdown is hidden.
     */
    focus(): void;
    destroy(): void;
}
//# sourceMappingURL=TimePickerDropdown.d.ts.map