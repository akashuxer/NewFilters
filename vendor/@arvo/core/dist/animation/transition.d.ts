export type TransitionType = 'fade' | 'scale' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right';
export interface TransitionOptions {
    element: HTMLElement;
    type: TransitionType;
    duration?: number;
    easing?: string;
    onComplete?: () => void;
}
export declare function enter(options: TransitionOptions): Promise<void>;
export declare function exit(options: TransitionOptions): Promise<void>;
//# sourceMappingURL=transition.d.ts.map