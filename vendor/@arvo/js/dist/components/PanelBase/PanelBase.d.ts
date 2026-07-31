import { PanelShellInstance, PanelContent, ArvoPanelHeaderAction, ArvoPanelStickyHeaderConfig, ArvoPanelAction, ArvoPanelMenuItem, ArvoPanelPlacement, ArvoPanelDisplayMode, ArvoPanelExpandMode, ArvoPanelCloseReason, ArvoPanelRichHeaderConfigShape } from '../../../../utils/src';
import { ArvoFabButtonOptions } from '../FabButton/FabButton';
import { ArvoStatusConfig } from '../Status/Status';
import { ArvoBadgeOptions } from '../Badge/Badge';
/** Rich-header config on the JS path -- consumer-supplied content
 *  (HTMLElement or string) plus an optional single clear action. */
export type ArvoPanelRichHeaderConfig = HTMLElement | string | ArvoPanelRichHeaderConfigShape<HTMLElement | string>;
export type PanelBaseType = 'custom' | 'navigation' | 'browser' | 'filter' | 'tree';
export interface PanelBaseOptions {
    panelType: PanelBaseType;
    extraHostClasses?: string[];
    displayMode?: ArvoPanelDisplayMode;
    placement?: ArvoPanelPlacement;
    isEdge?: boolean;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onOpen?: () => boolean | void;
    onClose?: (reason: ArvoPanelCloseReason) => boolean | void;
    isModal?: boolean;
    closeOnEscape?: boolean;
    closeOnOutsideClick?: boolean;
    container?: HTMLElement | (() => HTMLElement) | null;
    defaultSize?: number | string;
    minSize?: number | string;
    maxSize?: number | string;
    isResizable?: boolean;
    onResize?: (size: number) => void;
    onResizeCommit?: (size: number) => void;
    isExpandable?: boolean;
    isExpanded?: boolean;
    defaultExpanded?: boolean;
    expandMode?: ArvoPanelExpandMode;
    onExpandChange?: (expanded: boolean) => void;
    hasHeader?: boolean;
    title?: string | null;
    icon?: string;
    status?: Omit<ArvoStatusConfig, 'placement'>;
    badge?: Omit<Partial<ArvoBadgeOptions>, 'placement'>;
    hasBackButton?: boolean;
    onBack?: () => void;
    headerActions?: ArvoPanelHeaderAction[];
    hasOverflowMenu?: boolean;
    overflowMenuItems?: ArvoPanelMenuItem[];
    isPinnable?: boolean;
    isPinned?: boolean;
    defaultPinned?: boolean;
    onPinChange?: (pinned: boolean) => void;
    isDismissible?: boolean;
    richHeader?: ArvoPanelRichHeaderConfig | false;
    stickyHeader?: ArvoPanelStickyHeaderConfig | false;
    actions?: ArvoPanelAction[] | false;
    fab?: ArvoFabButtonOptions | false;
    isDisabled?: boolean;
    isLoading?: boolean;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
    className?: string;
    /**
     * Optional element to seed the body slot with at construction time.
     * Specialized wrappers (NavPanel / FilterPanel) pass a
     * pre-built HTMLElement that hosts their inner Arvo component. The
     * ArvoPanel wrapper leaves this undefined and uses `setContent()`
     * imperatively after construction.
     */
    body?: HTMLElement | null;
}
export interface PanelBaseInstance {
    readonly hostEl: HTMLElement;
    readonly paneEl: HTMLElement;
    readonly bodyEl: HTMLElement;
    readonly shell: PanelShellInstance;
    open(): void;
    close(reason?: ArvoPanelCloseReason): void;
    toggle(): void;
    isOpen(): boolean;
    pinned(value?: boolean): boolean | void;
    expanded(value?: boolean): boolean | void;
    size(value?: number): number | void;
    setDisplayMode(mode: ArvoPanelDisplayMode): void;
    setStickyHeader(config: ArvoPanelStickyHeaderConfig | false): void;
    setHeaderActions(actions: ArvoPanelHeaderAction[]): void;
    setActions(actions: ArvoPanelAction[] | false): void;
    setTitle(title: string | null): void;
    setIcon(icon: string | null): void;
    setRichHeader(config: ArvoPanelRichHeaderConfig | false): void;
    /** Replace the entire body-slot element in-place. Detaches the previous
     *  body node, appends `next`, and updates `bodyEl` to point at the new
     *  element (if `next` is a top-level replacement). */
    replaceBody(next: HTMLElement | null): void;
    /** Consumer-friendly custom-body setter -- used by the `ArvoPanel`
     *  wrapper. Accepts an HTMLElement, an HTML string, a callback, or
     *  `null`. */
    setContent(content: PanelContent): void;
    search(query?: string): string | void;
    selectedTab(id?: string): string | null | void;
    loading(state?: boolean): boolean | void;
    disabled(state?: boolean): boolean | void;
    focus(target?: 'first' | 'title' | 'search' | 'list'): void;
    /**
     * Subscribe to sticky-search query changes. The listener is called
     * immediately with the current query and then again after every change.
     * Returns an unsubscribe function the wrapper calls from its own
     * `destroy()`.
     */
    onSearchQueryChange(listener: (query: string) => void): () => void;
    destroy(): void;
}
/**
 * Render arbitrary custom content into a container -- mirrors the
 * `ArvoPopover` content contract (element / HTML string / callback / null).
 * Exported so the ArvoPanel wrapper can reuse it when consumers pass a
 * `content` option directly.
 */
export declare function renderContentToElement(container: HTMLElement, content: PanelContent): void;
export declare function createPanelBase(element: HTMLElement, options: PanelBaseOptions): PanelBaseInstance;
//# sourceMappingURL=PanelBase.d.ts.map