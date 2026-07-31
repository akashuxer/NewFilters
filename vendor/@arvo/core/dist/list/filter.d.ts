import { ListItemBase, ListGroup, ListFilterOptions } from './types';
/** Normalize a search query: optionally lowercase and strip diacritics. */
export declare function normalizeQuery(query: string, options?: {
    caseSensitive?: boolean;
    accentSensitive?: boolean;
}): string;
/** Filter a flat list of items by substring match on configured keys. */
export declare function filterItems<T extends ListItemBase>(items: T[], options: ListFilterOptions): T[];
/**
 * Filter grouped items. Each group's items are filtered independently.
 * Groups with zero matching items are excluded from the result.
 * Group `label` is structural and is not searched.
 */
export declare function filterGroups<T extends ListItemBase>(groups: ListGroup<T>[], options: ListFilterOptions): ListGroup<T>[];
//# sourceMappingURL=filter.d.ts.map