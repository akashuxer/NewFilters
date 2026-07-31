import { TooltipManagerConfig } from '../../../core/src';
/**
 * Configures global tooltip behavior for the application.
 * Call once at startup alongside `setupOverlayPlugin`.
 *
 * ```ts
 * import { setupTooltips } from '@arvo/js';
 * setupTooltips({ hoverDelay: 500, gap: 4 });
 * ```
 */
export declare function setupTooltips(config: Partial<TooltipManagerConfig>): void;
//# sourceMappingURL=tooltip-setup.d.ts.map