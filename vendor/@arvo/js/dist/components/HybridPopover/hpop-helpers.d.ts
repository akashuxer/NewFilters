import { ArvoPopoverActionConfig } from '../Popover/Popover';
import { ArvoListEmptyState, ArvoListGroup, ArvoListItemData } from '../List/List';
import { HybridPopoverEmptyConfig, HybridPopoverGroup, HybridPopoverInlineConfig, HybridPopoverItem } from './HybridPopover';
export interface PopoverInlineConfig {
    title?: string;
    content: HTMLElement;
    actions?: ArvoPopoverActionConfig[];
    isClosable?: boolean;
    hasBackButton?: boolean;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    onBack?: () => void;
}
export declare function warnHasInlineDeprecated(): void;
export declare function resolveItemInline(item: HybridPopoverItem): HybridPopoverInlineConfig | PopoverInlineConfig | null;
export declare function isPopoverInlineConfig(cfg: HybridPopoverInlineConfig | PopoverInlineConfig): cfg is PopoverInlineConfig;
/**
 * Convert HybridPopoverEmptyConfig into the ArvoListEmptyState shape consumed
 * by the embedded ArvoList. Mirrors the React counterpart `mapListEmptyState`.
 */
export declare function mapListEmptyState(kind: 'no-data' | 'no-results', config?: HybridPopoverEmptyConfig, onClear?: () => void): ArvoListEmptyState;
export declare function isGroupedItems(items: HybridPopoverItem[] | HybridPopoverGroup[]): items is HybridPopoverGroup[];
/**
 * Map a single HybridPopoverItem onto the ArvoListItemData shape consumed
 * by the embedded ArvoList. `groupDraggable` plus the per-item
 * `isDraggable` flag determine whether the row exposes a drag handle
 * (`undefined`, which lets the list-level default kick in) or a
 * column-aligning spacer (`isReorderable: false`). The original
 * HybridPopoverItem is retained on `data` so callers can recover the
 * source row in selection / activation handlers.
 */
export declare function toListItem(item: HybridPopoverItem, groupDraggable: boolean): ArvoListItemData;
/**
 * Normalize a HybridPopover items / defaultItems payload into the
 * ArvoList input shape. Returns either { items } (flat) or { groups }
 * (grouped) so the consumer can spread into ArvoList directly.
 */
export declare function toListPayload(items: HybridPopoverItem[] | HybridPopoverGroup[], enableReorder: boolean): {
    items?: ArvoListItemData[];
    groups?: ArvoListGroup[];
};
//# sourceMappingURL=hpop-helpers.d.ts.map