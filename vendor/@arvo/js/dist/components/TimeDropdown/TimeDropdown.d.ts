import { TimeObject } from '../../../../core/src';
export type { TimeObject };
export interface ArvoTimeDropdownOptions {
    /** Selected time. null means no selection. */
    value?: TimeObject | null;
    /**
     * .NET / Kendo time format string. Determines 12 vs 24-hour mode via
     * shouldUse12Hour({ format, locale }). Required -- drives rendering mode.
     */
    format: string;
    /**
     * BCP-47 locale. Used as fallback 12/24-hour determination when format is
     * ambiguous, and for localized AM/PM label strings.
     */
    locale?: string;
    /** Minutes between generated time options. Default: 15. */
    interval?: number;
    /** Inclusive lower bound. Options before minTime are HIDDEN (not disabled). */
    minTime?: TimeObject | null;
    /** Inclusive upper bound. Options after maxTime are HIDDEN (not disabled). */
    maxTime?: TimeObject | null;
    /** When true, the whole component is non-interactive. */
    isDisabled?: boolean;
    /** Called when the user selects a time option. */
    onChange?: (time: TimeObject) => void;
    /** Called when Escape is pressed. */
    onDismiss?: () => void;
}
export declare class ArvoTimeDropdown {
    private _element;
    private _options;
    private _use12Hour;
    private _ampmLabels;
    private _allOptions;
    private _amOptions;
    private _pmOptions;
    private _visibleOptions;
    private _ampm;
    private _focusedKey;
    private _tabsEl;
    private _ampmGroupHostEl;
    private _ampmGroup;
    private _listEl;
    private _optionEls;
    private _arrowNav;
    private _destroyed;
    static initialize(element: HTMLElement, options: ArvoTimeDropdownOptions): ArvoTimeDropdown;
    constructor(element: HTMLElement, options: ArvoTimeDropdownOptions);
    value(): TimeObject | null;
    value(v: TimeObject): void;
    formattedValue(): string;
    disabled(): boolean;
    disabled(state: boolean): void;
    destroy(): void;
    /**
     * Full rebuild: recompute derived state from options, rebuild tabs + list DOM.
     * Used on mount and when format/locale/interval/bounds/isDisabled change.
     */
    private _rebuild;
    private _refreshVisible;
    private _renderRoot;
    private _renderTabs;
    private _updateTabsDisabledState;
    private _renderList;
    /** Surgical class/aria swap for the active item -- preserves DOM focus. */
    private _updateSelectionDOM;
    /** Update tabindex on all visible option elements to match _focusedKey. */
    private _updateFocusedTabindex;
    private _scrollFocusedIntoView;
    private _setupKeyboard;
    private _setFocusedKey;
    private _handleListClick;
    private _handleListKeyDown;
    private _switchTab;
    private _emitChange;
    private _emitDismiss;
}
export default ArvoTimeDropdown;
//# sourceMappingURL=TimeDropdown.d.ts.map