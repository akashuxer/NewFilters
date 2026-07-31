export interface ArrowNavOptions {
    items: HTMLElement[];
    orientation: 'horizontal' | 'vertical';
    wrap: boolean;
    onNavigate: (item: HTMLElement, index: number) => void;
    onSelect?: (item: HTMLElement, index: number) => void;
    onEscape?: () => void;
    skipDisabled?: (index: number) => boolean;
    typeAhead?: {
        getLabel: (index: number) => string;
        debounceMs?: number;
    };
}
export interface ArrowNav {
    handleKeyDown: (event: KeyboardEvent) => void;
    destroy: () => void;
    setItems: (items: HTMLElement[]) => void;
    /**
     * Imperatively set the current focused index. Useful for syncing the state
     * machine when focus moves outside of arrow-key navigation (e.g., a row's
     * onFocus handler in React, or a programmatic focus call).
     */
    setIndex: (index: number) => void;
}
export declare function createArrowNav(options: ArrowNavOptions): ArrowNav;
//# sourceMappingURL=arrow-nav.d.ts.map