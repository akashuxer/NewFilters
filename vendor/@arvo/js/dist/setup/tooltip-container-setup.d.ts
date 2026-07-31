/**
 * Installs `$.fn.arvoTooltipContainer` on the provided jQuery instance.
 * Called automatically by `registerArvoPlugins($)`; only invoke directly
 * if a consumer registers plugins manually (mirrors `setupOverlayPlugin`).
 *
 * ```ts
 * import $ from 'jquery';
 * import { setupTooltipContainerPlugin } from '@arvo/js/setup';
 * setupTooltipContainerPlugin($);
 *
 * $('#grid').arvoTooltipContainer({
 *   entries: [
 *     {
 *       filter: '.grid-cell',
 *       truncated: true,
 *       content: (cell) => cell.textContent ?? '',
 *     },
 *     {
 *       filter: '.grid-action-btn',
 *       placement: 'top-center',
 *       content: (btn) => btn.getAttribute('aria-label') ?? '',
 *     },
 *   ],
 * });
 * ```
 */
export declare function setupTooltipContainerPlugin($: JQueryStatic): void;
export { ArvoTooltipContainer, type ArvoTooltipContainerOptions, type ArvoTooltipContainerEntry, type ArvoTooltipContainerContent, type ArvoTooltipContainerShortcut, } from './tooltip-container';
//# sourceMappingURL=tooltip-container-setup.d.ts.map