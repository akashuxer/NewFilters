import { TooltipPlacement, TooltipManager } from '../../../../core/src';
export interface ArvoTooltipOptions {
    /** Text content displayed in the tooltip */
    content: string;
    /** Preferred placement relative to the trigger element */
    placement?: TooltipPlacement;
    /** Keyboard shortcut hint displayed alongside the content */
    shortcut?: string;
}
/**
 * Vanilla JS tooltip component. Attaches tooltip behavior (hover/focus,
 * ARIA, positioning) to any DOM element.
 *
 * ```ts
 * const tip = ArvoTooltip.initialize(triggerEl, { content: 'Save' });
 * tip.destroy();
 * ```
 */
export declare class ArvoTooltip {
    private _connector;
    private _element;
    static readonly DEFAULTS: Partial<ArvoTooltipOptions>;
    constructor(element: HTMLElement, options: ArvoTooltipOptions, manager?: TooltipManager);
    static initialize(element: HTMLElement, options: ArvoTooltipOptions, manager?: TooltipManager): ArvoTooltip;
    update(options: Partial<ArvoTooltipOptions>): void;
    destroy(): void;
    get element(): HTMLElement;
}
//# sourceMappingURL=Tooltip.d.ts.map