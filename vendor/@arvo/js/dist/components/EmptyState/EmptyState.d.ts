export type EmptyStateIllustration = 'no-results' | 'no-data' | string;
export type EmptyStateSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type EmptyStateOrientation = 'vertical' | 'horizontal';
export declare const KNOWN_ILLUSTRATIONS: Record<'no-results' | 'no-data', string>;
export interface EmptyStateButtonAction {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'danger';
    icon?: string;
    isDisabled?: boolean;
}
export interface EmptyStateLinkAction {
    label: string;
    href: string;
    onClick?: (event: Event) => void;
    icon?: string;
    isExternal?: boolean;
}
export interface ArvoEmptyStateOptions {
    size?: EmptyStateSize;
    orientation?: EmptyStateOrientation;
    illustration?: EmptyStateIllustration;
    title?: string;
    message?: string;
    primaryAction?: EmptyStateButtonAction;
    secondaryAction?: EmptyStateButtonAction;
    link?: EmptyStateLinkAction;
    id?: string;
    className?: string;
    isAnimated?: boolean;
}
export declare class ArvoEmptyState {
    readonly el: HTMLDivElement;
    private _primaryBtn;
    private _secondaryBtn;
    private _link;
    private _destroyed;
    static create(options?: ArvoEmptyStateOptions): ArvoEmptyState;
    static initialize(element: HTMLElement | null, options?: ArvoEmptyStateOptions): ArvoEmptyState;
    constructor(element: HTMLElement | null, options?: ArvoEmptyStateOptions);
    private _render;
    /** Re-render the figure with new options. Inner Arvo* instances are
     * recreated to keep the implementation simple; consumers update infrequently. */
    update(options: ArvoEmptyStateOptions): void;
    private _teardownInner;
    destroy(): void;
}
//# sourceMappingURL=EmptyState.d.ts.map