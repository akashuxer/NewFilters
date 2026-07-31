import { ListItemBase, ListGroup } from '../../../core/src';
import { TitleTruncationHandle } from '../../../utils/src';
import { ArvoCheckbox } from '../components/Checkbox/Checkbox';
export interface OptionRowItem extends ListItemBase {
    value: unknown;
}
export type OptionRowVariant = 'standard' | 'rich';
export type OptionRowSelectionMode = 'single' | 'multiple';
export declare function isGroupedOptions<T extends ListItemBase>(items: T[] | ListGroup<T>[]): items is ListGroup<T>[];
export declare function flattenOptions<T extends ListItemBase>(items: T[] | ListGroup<T>[]): T[];
export interface OptionRowConfig<T extends OptionRowItem> {
    /** BEM block, e.g. `arvo-listbox` or `arvo-opt-list`. */
    block: string;
    /** Returns the DOM id for the option at the given flat index. */
    optionId: (flatIndex: number) => string;
    isSelected: (value: unknown) => boolean;
    highlightedIndex: number;
    /** Visual layout variant. Defaults to `'standard'`. */
    variant?: OptionRowVariant;
    /** Selection mode. Drives the leading checkbox slot. Defaults to `'single'`. */
    selectionMode?: OptionRowSelectionMode;
    /** Emit a `data-index` attribute (click delegation). Default true. */
    emitDataIndex?: boolean;
    /** Custom label rendering into the label span. Default sets textContent. */
    renderLabel?: (item: T, lblEl: HTMLElement) => void;
    /**
     * Callback invoked for every ArvoCheckbox instance created while building
     * multi-select rows. Callers should track instances and `destroy()` them
     * on rebuild + on component teardown.
     */
    onCheckbox?: (cb: ArvoCheckbox) => void;
    /**
     * Callback invoked for every truncation-tooltip handle created while
     * building rows (one per row that has a non-empty label). Callers
     * should track the handles and `destroy()` them on rebuild + on
     * component teardown so the internal ResizeObservers don't leak to
     * detached label nodes.
     */
    onTruncationHandle?: (handle: TitleTruncationHandle) => void;
}
export declare function createOptionRow<T extends OptionRowItem>(item: T, flatIndex: number, cfg: OptionRowConfig<T>): HTMLDivElement;
export interface OptionListBodyConfig<T extends OptionRowItem> extends OptionRowConfig<T> {
    /** The (already filtered) items to render. */
    filteredItems: T[] | ListGroup<T>[];
    /** Group header id prefix, e.g. `${id}-grp`. */
    groupIdPrefix: string;
    hasGroupDividers?: boolean;
}
/**
 * Builds the flat-or-grouped option rows into `listEl` and returns the flat
 * array of option elements (for arrow-nav wiring). The caller owns the
 * `role="listbox"` container, the search field, and empty/loading states.
 */
export declare function renderOptionListBody<T extends OptionRowItem>(listEl: HTMLElement, cfg: OptionListBodyConfig<T>): HTMLElement[];
//# sourceMappingURL=option-list-render.d.ts.map