import { OverlayConfig, OverlayEntry, OverlayHub } from '../../../core/src';
declare global {
    interface JQuery {
        openOverlay(entry?: Partial<Omit<OverlayEntry, 'element'>>): JQuery;
        closeOverlay(): JQuery;
    }
    interface JQueryStatic {
        setupOverlays(config: Partial<OverlayConfig>): void;
        closeAllOverlays(options?: {
            except?: string[];
        }): void;
        isOverlayOpen(id: string): boolean;
    }
}
/**
 * Installs overlay methods on the provided jQuery instance.
 * Call once at application startup:
 *
 *   import $ from 'jquery';
 *   import { setupOverlayPlugin } from '@arvo/js/setup';
 *   setupOverlayPlugin($);
 *
 * An alternative hub instance can be supplied for testing.
 */
export declare function setupOverlayPlugin(jq: JQueryStatic, hub?: OverlayHub): void;
export type { OverlayConfig, OverlayEntry, OverlayHub };
//# sourceMappingURL=overlay-setup.d.ts.map