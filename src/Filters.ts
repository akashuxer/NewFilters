import {
  ArvoDropdownIconButton,
  ArvoTooltip,
  type HybridPopoverInlineConfig,
} from '@arvo/js';
import type { ListGroup } from '@arvo/core';
import type { MenuItemData } from '@arvo/js';
import { SmartInput } from './SmartInput';

type CombineMode = 'AND' | 'OR';

export interface FiltersOpts {
  container: HTMLElement;
}

export class Filters {
  private _opts: FiltersOpts;
  private _root: HTMLElement;
  private _headerEl: HTMLElement;
  private _menuWrapEl: HTMLElement;
  private _menuHost: HTMLButtonElement;
  private _bodyEl: HTMLElement;
  private _measureSectionEl: HTMLElement;
  private _expressionEl: HTMLElement;
  private _smartInput: SmartInput | null = null;
  private _measureInputs: SmartInput[] = [];
  private _measureLabels: string[] = [];
  private _menuInst: ArvoDropdownIconButton | null = null;
  private _menuObserver: MutationObserver | null = null;
  private _submenuTooltips: ArvoTooltip[] = [];
  private _tooltipFrame: number | null = null;
  private _menuTweakTimer: number | null = null;
  private _combineMode: CombineMode = 'AND';
  private _autoApply = true;
  private _nextPrevNav = true;
  private _showTitle = true;
  private _autoWrap = false;

  constructor(opts: FiltersOpts) {
    this._opts = opts;
    this._root = document.createElement('section');
    this._root.className = 'arvo-pg-filters';
    this._root.setAttribute('aria-label', 'Filters workspace');

    this._bodyEl = document.createElement('div');
    this._bodyEl.className = 'arvo-pg-filters__body';

    this._headerEl = document.createElement('header');
    this._headerEl.className = 'arvo-pg-filters__header';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'arvo-pg-filters__title-wrap';

    const title = document.createElement('h1');
    title.className = 'arvo-pg-filters__title';
    title.textContent = 'Filter Menu';
    titleWrap.appendChild(title);

    this._headerEl.appendChild(titleWrap);

    this._menuWrapEl = document.createElement('div');
    this._menuWrapEl.className = 'arvo-pg-filters__menu-wrap';
    this._menuHost = document.createElement('button');
    this._menuHost.type = 'button';
    this._menuHost.className = 'arvo-pg-filters__menu-host';
    this._menuWrapEl.appendChild(this._menuHost);
    this._headerEl.appendChild(this._menuWrapEl);

    this._measureSectionEl = document.createElement('section');
    this._measureSectionEl.className = 'arvo-pg-filters__measure-section';
    this._measureSectionEl.innerHTML = `
      <div class="arvo-pg-filters__measure-title">Measure Filter:</div>
      <div class="arvo-pg-filters__expression" aria-live="polite">
        <span class="arvo-pg-filters__expression-label">Expression:</span>
        <span class="arvo-pg-filters__expression-value"></span>
      </div>
      <div class="arvo-pg-filters__measure-grid" aria-label="Measure input types"></div>
    `;
    this._expressionEl = this._measureSectionEl.querySelector('.arvo-pg-filters__expression-value') as HTMLElement;
    const measureGrid = this._measureSectionEl.querySelector('.arvo-pg-filters__measure-grid') as HTMLDivElement;
    const measureLabels = [
      {
        label: 'Actual DOS (Number)',
        dataType: 'integer' as const,
        measureItems: [
          { id: 'revenue', label: 'Revenue (Number)', value: 'Revenue' },
          { id: 'target-revenue', label: 'Target Revenue (Number)', value: 'Target Revenue' },
          { id: 'forecast-revenue', label: 'Forecast Revenue (Number)', value: 'Forecast Revenue' },
          { id: 'safety-stock', label: 'Safety Stock (Number)', value: 'Safety Stock' },
        ],
      },
      {
        label: 'Order Date (DateTime)',
        dataType: 'datetime' as const,
        measureItems: [
          { id: 'shipment-date', label: 'Shipment Date', value: 'Shipment Date' },
          { id: 'requested-delivery-date', label: 'Requested Delivery Date', value: 'Requested Delivery Date' },
          { id: 'production-start-date', label: 'Production Start Date', value: 'Production Start Date' },
          { id: 'last-updated-date', label: 'Last Updated Date', value: 'Last Updated Date' },
        ],
      },
      {
        label: 'Is Delayed (Boolean)',
        dataType: 'boolean' as const,
        measureItems: [
          { id: 'is-constrained', label: 'Is Constrained', value: 'Is Constrained' },
          { id: 'is-approved', label: 'Is Approved', value: 'Is Approved' },
          { id: 'is-promotional', label: 'Is Promotional', value: 'Is Promotional' },
        ],
      },
      {
        label: 'Risk (Picklist)',
        dataType: 'picklist' as const,
        valueItems: [
          { id: 'critical-value', label: 'Critical (Red)', value: 'Critical' },
          { id: 'high-value', label: 'High (Orange)', value: 'High' },
          { id: 'medium-value', label: 'Medium (Amber)', value: 'Medium' },
          { id: 'low-value', label: 'Low (Light Green)', value: 'Low' },
          { id: 'no-risk-value', label: 'No Risk (Green)', value: 'No Risk' },
        ],
        measureItems: [
          { id: 'critical', label: 'Critical (Red)', value: 'Critical' },
          { id: 'high', label: 'High (Orange)', value: 'High' },
          { id: 'medium', label: 'Medium (Amber)', value: 'Medium' },
          { id: 'low', label: 'Low (Light Green)', value: 'Low' },
          { id: 'no-risk', label: 'No Risk (Green)', value: 'No Risk' },
        ],
      },
      {
        label: 'Customer (String)',
        dataType: 'string' as const,
        measureItems: [
          { id: 'product', label: 'Product', value: 'Product' },
          { id: 'supplier', label: 'Supplier', value: 'Supplier' },
          { id: 'planner', label: 'Planner', value: 'Planner' },
          { id: 'region', label: 'Region', value: 'Region' },
        ],
      },
    ];
    for (const item of measureLabels) {
      const host = document.createElement('div');
      host.className = 'arvo-pg-filters__measure-item';
      measureGrid.appendChild(host);
      this._measureInputs.push(new SmartInput({
        container: host,
        label: item.label,
        dataType: item.dataType,
        measureItems: item.measureItems,
        valueItems: 'valueItems' in item ? item.valueItems : undefined,
        onExpressionChange: (expression) => {
          this._updateExpression(expression);
        },
      }));
      this._measureLabels.push(item.label);
    }

    this._bodyEl.append(this._headerEl, this._measureSectionEl);
    this._root.append(this._bodyEl);
    opts.container.appendChild(this._root);

    this._mountMenu();
  }

  private _updateExpression(expression: string): void {
    const expressions = this._measureInputs
      .map((input, index) => {
        const value = input.expression();
        if (!value) return '';
        const label = this._measureLabels[index] ?? '';
        return label && !value.startsWith(label) ? `${label} ${value}` : value;
      })
      .filter(Boolean);
    this._expressionEl.textContent = expressions
      .map((value) => /\s(?:AND|OR)\s/i.test(value) || /,\s*/.test(value) ? `(${value})` : value)
      .join(` ${this._combineMode} `);
  }

  destroy(): void {
    this._menuObserver?.disconnect();
    this._menuObserver = null;
    if (this._tooltipFrame != null) {
      cancelAnimationFrame(this._tooltipFrame);
      this._tooltipFrame = null;
    }
    if (this._menuTweakTimer != null) {
      clearTimeout(this._menuTweakTimer);
      this._menuTweakTimer = null;
    }
    this._destroySubmenuTooltips();
    this._menuInst?.destroy();
    this._menuInst = null;
    this._smartInput?.destroy();
    this._smartInput = null;
    for (const input of this._measureInputs) input.destroy();
    this._measureInputs = [];
    this._measureLabels = [];
    this._root.remove();
  }

  private _mountMenu(): void {
    this._menuInst?.destroy();
    this._menuInst = ArvoDropdownIconButton.initialize(this._menuHost, {
      icon: 'ellipsis-v',
      tooltip: 'Filter options',
      variant: 'tertiary',
      size: 'md',
      isCompact: true,
      placement: 'bottom-end',
      hasGroupDividers: true,
      closeOnSelect: true,
      menuProps: {
        submenuTrigger: 'hover',
      },
      items: this._buildMenuItems(),
      onSelect: (item, index) => this._handleSelect(item, index),
    });
    this._bindMenuTweaks();
  }

  private _buildMenuItems(): ListGroup<MenuItemData>[] {
    return [
      {
        id: 'filter-actions',
        items: [
          {
            id: 'manage-filters',
            label: 'Manage filters',
            shortcut: 'Shift+M',
            inlineHybridPopover: this._buildManagePopover(),
          },
          {
            id: 'combine-measure-filters',
            label: 'Combine measure filters',
            value: this._combineMode,
            submenu: [
              {
                id: 'combine-and',
                label: 'All conditions (AND)',
                active: this._combineMode === 'AND',
              },
              {
                id: 'combine-or',
                label: 'All conditions (OR)',
                active: this._combineMode === 'OR',
              },
            ],
          },
        ],
      },
      {
        id: 'filter-toggles',
        items: [
          {
            id: 'auto-apply',
            label: 'Auto apply',
            shortcut: 'Shift+A',
            switch: {
              checked: this._autoApply,
              onChange: (checked) => { this._autoApply = checked; },
            },
          },
          {
            id: 'next-prev-nav',
            label: 'Next/previous navigation',
            shortcut: 'Shift+N',
            switch: {
              checked: this._nextPrevNav,
              onChange: (checked) => { this._nextPrevNav = checked; },
            },
          },
          {
            id: 'show-title',
            label: 'Show title',
            shortcut: 'Shift+D',
            switch: {
              checked: this._showTitle,
              onChange: (checked) => { this._showTitle = checked; },
            },
          },
          {
            id: 'auto-wrap',
            label: 'Auto wrap',
            shortcut: 'Shift+W',
            switch: {
              checked: this._autoWrap,
              onChange: (checked) => { this._autoWrap = checked; },
            },
          },
        ],
      },
    ];
  }

  private _handleSelect(item: MenuItemData): false | void {
    if (item.id === 'combine-and' || item.id === 'combine-or') {
      this._combineMode = item.id === 'combine-and' ? 'AND' : 'OR';
      this._updateExpression('');
      this._mountMenu();
      return;
    }
    return false;
  }

  private _buildManagePopover(): HybridPopoverInlineConfig {
    return {
      title: 'Filter Menu',
      variant: 'multi' as const,
      items: [],
      hasBackButton: false,
    };
  }

  private _bindMenuTweaks(): void {
    this._menuObserver?.disconnect();
    this._menuObserver = new MutationObserver((mutations) => {
      const shouldReapply = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some((node) =>
          node instanceof HTMLElement &&
          (node.classList.contains('arvo-action-menu') ||
            node.querySelector?.('.arvo-action-menu')),
        ),
      );
      if (shouldReapply) {
        this._queueMenuTweaks();
      }
    });
    this._menuObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
    this._queueMenuTweaks();
  }

  private _queueMenuTweaks(): void {
    if (this._tooltipFrame != null) cancelAnimationFrame(this._tooltipFrame);
    if (this._menuTweakTimer != null) clearTimeout(this._menuTweakTimer);
    this._tooltipFrame = requestAnimationFrame(() => {
      this._tooltipFrame = null;
      this._applyMenuTweaks();
      this._menuTweakTimer = window.setTimeout(() => {
        this._menuTweakTimer = null;
        this._applyMenuTweaks();
      }, 80);
    });
  }

  private _applyMenuTweaks(): void {
    const menus = Array.from(document.querySelectorAll<HTMLElement>('.arvo-action-menu'));
    this._destroySubmenuTooltips();

    const submenu = menus.find((menu) =>
      menu.querySelector('.arvo-menu-item__lbl')?.textContent?.includes('All conditions (AND)'),
    );
    const manageRow = menus
      .flatMap((menu) => Array.from(menu.querySelectorAll<HTMLElement>('.arvo-menu-item')))
      .find((row) => row.querySelector('.arvo-menu-item__lbl')?.textContent?.trim() === 'Manage filters');
    if (manageRow) {
      const trailing = manageRow.querySelector<HTMLElement>('.arvo-menu-item__trailing');
      if (trailing && !trailing.querySelector('.o9con-angle-right')) {
        const icon = document.createElement('span');
        icon.className = 'arvo-menu-item__submenu o9con o9con-angle-right';
        icon.setAttribute('aria-hidden', 'true');
        icon.style.pointerEvents = 'none';
        trailing.appendChild(icon);
      }
    }

    if (!submenu) return;

    const rows = Array.from(submenu.querySelectorAll<HTMLElement>('.arvo-menu-item'));
    for (const row of rows) {
      const id = row.getAttribute('data-index');
      const tooltip =
        id === '0'
          ? 'Controls how multiple measure filter conditions are combined. Choose AND to require all conditions.'
          : id === '1'
            ? 'Controls how multiple measure filter conditions are combined. Choose OR to require at least one condition.'
            : '';
      if (!tooltip) continue;
      this._submenuTooltips.push(ArvoTooltip.initialize(row, { content: tooltip, placement: 'right-center' }));
    }
  }

  private _destroySubmenuTooltips(): void {
    for (const tip of this._submenuTooltips) tip.destroy();
    this._submenuTooltips = [];
  }
}
