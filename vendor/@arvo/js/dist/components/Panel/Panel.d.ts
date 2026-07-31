import { PanelContent, ArvoPanelHeaderAction, ArvoPanelStickyHeaderConfig, ArvoPanelAction, ArvoPanelMenuItem, ArvoPanelSearchConfig, ArvoPanelSearchVariant, ArvoPanelPlacement, ArvoPanelDisplayMode, ArvoPanelExpandMode, ArvoPanelCloseReason } from '../../../../utils/src';
import { ArvoPanelRichHeaderConfig as PanelBaseRichHeaderConfig } from '../PanelBase/PanelBase';
import { ArvoNavOptions, ArvoNavItemData } from '../Nav/Nav';
import { ArvoListOptions, ArvoListItemData, ArvoListGroup } from '../List/List';
import { ArvoAccordionOptions } from '../Accordion/Accordion';
import { ArvoTreeViewOptions, ArvoTreeItem } from '../TreeView/TreeView';
import { ArvoFabButtonOptions } from '../FabButton/FabButton';
import { ArvoStatusConfig } from '../Status/Status';
import { ArvoBadgeOptions } from '../Badge/Badge';
export type { PanelContent, ArvoPanelHeaderAction, ArvoPanelStickyHeaderConfig, ArvoPanelAction, ArvoPanelSearchConfig, ArvoPanelSearchVariant, ArvoPanelPlacement, ArvoPanelDisplayMode, ArvoPanelExpandMode, ArvoPanelCloseReason, };
/** Public rich-header config on the JS path. Bare `HTMLElement | string`
 *  shorthand plus the full shape `{ content, hasClear?, onClear? }`. */
export type ArvoPanelRichHeaderConfig = PanelBaseRichHeaderConfig;
export type { ArvoPanelRichHeaderConfigShape, } from '../../../../utils/src';
export interface ArvoPanelOptions {
    displayMode?: ArvoPanelDisplayMode;
    /** Full 4-way placement. The specialized panels narrow this to
     *  `'left' | 'right'`. */
    placement?: ArvoPanelPlacement;
    /** When true, removes the body's inline (left/right) padding so custom
     *  content runs flush to the inline pane edges. */
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
    /** Custom body content. HTMLElement, HTML string, callback, or null. */
    content?: PanelContent;
}
export type { ArvoNavOptions, ArvoNavItemData, ArvoListOptions, ArvoListItemData, ArvoListGroup, ArvoAccordionOptions, ArvoTreeViewOptions, ArvoTreeItem, };
export declare class ArvoPanel {
    private _base;
    private _content;
    static initialize(element: HTMLElement, options?: ArvoPanelOptions): ArvoPanel;
    constructor(element: HTMLElement, options?: ArvoPanelOptions);
    open(): void;
    close(reason?: ArvoPanelCloseReason): void;
    toggle(): void;
    isOpen(): boolean;
    pinned(): boolean;
    pinned(value: boolean): void;
    expanded(): boolean;
    expanded(value: boolean): void;
    size(): number;
    size(value: number): void;
    setDisplayMode(mode: ArvoPanelDisplayMode): void;
    setStickyHeader(config: ArvoPanelStickyHeaderConfig | false): void;
    setHeaderActions(actions: ArvoPanelHeaderAction[]): void;
    setActions(actions: ArvoPanelAction[] | false): void;
    setTitle(title: string | null): void;
    setIcon(icon: string | null): void;
    setContent(content: PanelContent): void;
    search(): string;
    search(query: string): void;
    selectedTab(): string | null;
    selectedTab(id: string): void;
    loading(): boolean;
    loading(state: boolean): void;
    disabled(): boolean;
    disabled(state: boolean): void;
    focus(target?: 'first' | 'title' | 'search' | 'list'): void;
    destroy(): void;
}
export default ArvoPanel;
//# sourceMappingURL=Panel.d.ts.map