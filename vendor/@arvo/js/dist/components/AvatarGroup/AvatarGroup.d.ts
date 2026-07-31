import { ArvoAvatarOptions, ArvoAvatarSize } from '../Avatar/Avatar';
import { ArvoPopoverOptions } from '../Popover/Popover';
export type ArvoAvatarGroupSize = ArvoAvatarSize;
/** Single item rendered by the group. Inherits the full ArvoAvatar option
 *  surface (variant, name, src, href, etc.) and adds a required `id`. */
export interface AvatarGroupItem extends Omit<ArvoAvatarOptions, 'size' | 'isLoading'> {
    id: string;
}
/** Hybrid escape-hatch bag for the underlying ArvoPopover. */
export type ArvoAvatarGroupPopoverOptions = Pick<ArvoPopoverOptions, 'width' | 'isInline' | 'closeOnOutside' | 'offset' | 'onOpen' | 'onClose'>;
export interface ArvoAvatarGroupOptions {
    avatars?: AvatarGroupItem[];
    size?: ArvoAvatarGroupSize;
    maxCount?: number;
    hasTooltip?: boolean;
    tooltipPosition?: 'top' | 'bottom';
    label?: string;
    moreIndicatorLabel?: string;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    onMoreClick?: (event: MouseEvent) => void;
    overflowPlacement?: 'top' | 'bottom';
    popoverProps?: ArvoAvatarGroupPopoverOptions | null;
    isDisabled?: boolean;
    isLoading?: boolean;
    id?: string;
}
export declare class ArvoAvatarGroup {
    /** The host element passed to initialize. Decorated in place. */
    readonly el: HTMLElement;
    private _opts;
    private _destroyed;
    private _isOpen;
    private _childAvatars;
    private _overflowWrapEl;
    private _overflowBtn;
    private _popover;
    private _popoverChildAvatars;
    private _tooltipConnector;
    private _tabRoving;
    private _onMoreClickBound;
    private _onPopoverOpenBound;
    private _onPopoverCloseBound;
    static readonly SIZES: readonly ArvoAvatarSize[];
    static initialize(element: HTMLElement | null, options?: ArvoAvatarGroupOptions): ArvoAvatarGroup;
    constructor(element: HTMLElement, options?: ArvoAvatarGroupOptions);
    private _normalize;
    private _visibleHiddenSplit;
    private _render;
    /**
     * Collect the focusable elements that participate in the roving rotation:
     * the inner element of every visible avatar (`.arvo-avt` -- a `<button>`,
     * `<a>`, or `<span>` depending on interactivity) and the overflow tile.
     * Returned in left-to-right DOM order.
     */
    private _getRovingItems;
    private _setupTabRoving;
    private _teardownTabRoving;
    private _renderOverflow;
    private _attachOverflowTooltip;
    private _detachOverflowTooltip;
    private _teardownChildren;
    private _applyRootClasses;
    private _applyRootAttributes;
    private _applyOverflowState;
    private _handleMoreClick;
    private _handlePopoverTransition;
    setAvatars(avatars: AvatarGroupItem[]): void;
    setSize(size: ArvoAvatarGroupSize): void;
    setMaxCount(count: number): void;
    setHasTooltip(enabled: boolean): void;
    setLabel(label: string): void;
    /** Dual-purpose getter/setter for the disabled state. */
    disabled(): boolean;
    disabled(state: boolean): void;
    /** Dual-purpose getter/setter for the loading state. */
    loading(): boolean;
    loading(state: boolean): void;
    /** Dual-purpose getter/setter for the overflow Popover open state. */
    open(): boolean;
    open(state: boolean): void;
    /** Tear down children + popover + listeners. Host element is preserved. */
    destroy(): void;
}
export default ArvoAvatarGroup;
//# sourceMappingURL=AvatarGroup.d.ts.map