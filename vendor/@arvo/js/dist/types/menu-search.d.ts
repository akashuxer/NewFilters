export interface MenuSearchConfig {
    placeholder?: string;
    errorMsg?: string;
    minChars?: number;
    searchMode?: 'input' | 'submit';
    isClearable?: boolean;
    counter?: boolean;
    shortcut?: string;
    className?: string;
    onFilter?: (query: string, matchCount: number) => void;
    onClear?: () => void;
}
export type MenuSearchProp = boolean | MenuSearchConfig;
export declare function normalizeSearch(prop: MenuSearchProp | undefined, defaults?: Partial<MenuSearchConfig>): MenuSearchConfig | null;
//# sourceMappingURL=menu-search.d.ts.map