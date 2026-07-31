import {
  ArvoCombobox,
  ArvoButton,
  ArvoDatePicker,
  ArvoDateRangePicker,
  ArvoFormLabel,
  ArvoPopover,
  ArvoRadioGroup,
  ArvoTextbox,
  ArvoNumberInput,
  ArvoMultiSelectV2,
  ArvoOptionListV2,
  ArvoSelect,
  ArvoTabstrip,
  type ComboboxOptionData,
  type OptionListItemData,
  type SelectOptionData,
  type TabItem,
} from '@arvo/js';

export interface SmartInputOpts {
  container: HTMLElement;
  label: string;
  dataType?: 'integer' | 'datetime' | 'picklist' | 'string' | 'boolean';
  measureItems?: ComboboxOptionData[];
  valueItems?: ComboboxOptionData[];
  placeholder?: string;
  onExpressionChange?: (expression: string) => void;
}

type OperatorOption = SelectOptionData & { value: string };
type BuilderRowValue =
  | { kind: 'text'; value: string }
  | { kind: 'number'; value: string; value2?: string }
  | { kind: 'date'; value: string; value2?: string }
  | { kind: 'multi'; value: string[] }
  | { kind: 'boolean'; value: string }
  | null;

const OPERATOR_SETS: Record<NonNullable<SmartInputOpts['dataType']>, OperatorOption[]> = {
  integer: [
    { id: 'equals', label: '=', value: '=' },
    { id: 'not-equals', label: '!=', value: '!=' },
    { id: 'greater-than', label: '>', value: '>' },
    { id: 'less-than', label: '<', value: '<' },
    { id: 'gte', label: '>=', value: '>=' },
    { id: 'lte', label: '<=', value: '<=' },
    { id: 'between', label: 'Between', value: 'Between' },
    { id: 'not-between', label: '!Between', value: '!Between' },
    { id: 'null', label: 'Null', value: 'Null' },
    { id: 'not-null', label: '!Null', value: '!Null' },
  ],
  datetime: [
    { id: 'equals', label: '=', value: '=' },
    { id: 'not-equals', label: '!=', value: '!=' },
    { id: 'greater-than', label: '>', value: '>' },
    { id: 'less-than', label: '<', value: '<' },
    { id: 'gte', label: '>=', value: '>=' },
    { id: 'lte', label: '<=', value: '<=' },
    { id: 'between', label: 'Between', value: 'Between' },
    { id: 'not-between', label: '!Between', value: '!Between' },
    { id: 'null', label: 'Null', value: 'Null' },
    { id: 'not-null', label: '!Null', value: '!Null' },
  ],
  picklist: [
    { id: 'equals', label: '=', value: '=' },
    { id: 'not-equals', label: '!=', value: '!=' },
    { id: 'starts-with', label: 'Starts With', value: 'Starts With' },
    { id: 'not-starts-with', label: 'Not Starts With', value: 'Not Starts With' },
    { id: 'ends-with', label: 'Ends With', value: 'Ends With' },
    { id: 'not-ends-with', label: 'Not Ends With', value: 'Not Ends With' },
    { id: 'contains', label: 'Contains', value: 'Contains' },
    { id: 'not-contains', label: 'Not Contains', value: 'Not Contains' },
    { id: 'null', label: 'Null', value: 'Null' },
    { id: 'not-null', label: 'Not Null', value: 'Not Null' },
  ],
  string: [
    { id: 'equals', label: '=', value: '=' },
    { id: 'not-equals', label: '!=', value: '!=' },
    { id: 'starts-with', label: 'StartsWith', value: 'StartsWith' },
    { id: 'not-starts-with', label: '!StartsWith', value: '!StartsWith' },
    { id: 'ends-with', label: 'EndsWith', value: 'EndsWith' },
    { id: 'not-ends-with', label: '!EndsWith', value: '!EndsWith' },
    { id: 'contains', label: 'Contains', value: 'Contains' },
    { id: 'not-contains', label: '!Contains', value: '!Contains' },
    { id: 'wildcard', label: 'Wildcard', value: 'Wildcard' },
    { id: 'null', label: 'Null', value: 'Null' },
    { id: 'not-null', label: '!Null', value: '!Null' },
  ],
  boolean: [
    { id: 'equals', label: '=', value: '=' },
    { id: 'not-equals', label: '!=', value: '!=' },
    { id: 'null', label: 'Null', value: 'Null' },
    { id: 'not-null', label: '!Null', value: '!Null' },
  ],
};

export class SmartInput {
  private _opts: SmartInputOpts;
  private _root: HTMLElement;
  private _labelEl: HTMLLabelElement;
  private _fieldEl: HTMLElement;
  private _inputEl: HTMLInputElement;
  private _triggerEl: HTMLButtonElement;
  private _borderEl: HTMLElement;
  private _popoverHost: HTMLDivElement;
  private _popover: ArvoPopover | null = null;
  private _tabsHost: HTMLDivElement;
  private _tabs: ReturnType<typeof ArvoTabstrip.initialize> | null = null;
  private _valuesPane: HTMLDivElement | null = null;
  private _measuresPane: HTMLDivElement | null = null;
  private _operatorHost: HTMLDivElement | null = null;
  private _valueHost: HTMLDivElement | null = null;
  private _measureHost: HTMLDivElement | null = null;
  private _operatorSelect: ArvoSelect | null = null;
  private _measuresOperatorSelect: ArvoSelect | null = null;
  private _measureCombobox: ArvoCombobox | null = null;
  private _numberInput: ArvoNumberInput | null = null;
  private _numberInput2: ArvoNumberInput | null = null;
  private _textbox: ArvoTextbox | null = null;
  private _multiSelect: ArvoMultiSelectV2 | null = null;
  private _radioGroup: ArvoRadioGroup | null = null;
  private _datePicker: ArvoDatePicker | null = null;
  private _dateRangePicker: ArvoDateRangePicker | null = null;
  private _activeTab: 'values' | 'measures' = 'values';
  private _operatorItems: OperatorOption[];
  private _measureItems: ComboboxOptionData[];
  private _valueItems: ComboboxOptionData[];
  private _selectedMeasureLabel = '';
  private _selectedComparedMeasureLabel = '';
  private _selectedOperatorLabel = '=';
  private _selectedOperator2Label = '';
  private _summaryText = '';
  private _row1Value: BuilderRowValue = null;
  private _row2Value: BuilderRowValue = null;
  private _orValues: BuilderRowValue[] = [];
  private _pendingOrValue: BuilderRowValue = null;
  private _addValueButton: HTMLButtonElement | null = null;
  private _orRowsHost: HTMLDivElement | null = null;
  private _row2El: HTMLDivElement | null = null;
  private _row2OperatorHost: HTMLDivElement | null = null;
  private _row2ValueHost: HTMLDivElement | null = null;
  private _row2OperatorSelect: ArvoSelect | null = null;
  private _suggestionList: ArvoOptionListV2 | null = null;
  private _suggestionHost: HTMLButtonElement | null = null;
  private _suggestionItems: OptionListItemData[] = [];
  private _suggestionMode: 'operator' | 'measure' | null = null;
  private _suggestionAnchorStart = 0;
  private _suggestionReplacementStart = 0;
  private _suggestionReplacementEnd = 0;
  private _rangePlaceholderActive: 'first' | 'second' | null = null;

  private _popoverWidth(): number {
    switch (this._opts.dataType) {
      case 'datetime':
        return 500;
      case 'picklist':
        return 540;
      case 'boolean':
      case 'integer':
      case 'string':
      default:
        return 420;
    }
  }

  constructor(opts: SmartInputOpts) {
    this._opts = opts;
    this._operatorItems = OPERATOR_SETS[opts.dataType ?? 'string'];
    this._measureItems = opts.measureItems ?? [];
    this._valueItems = opts.valueItems ?? [];
    this._root = document.createElement('div');
    this._root.className = 'arvo-pg-smart-input';

    this._labelEl = ArvoFormLabel.initialize(null, {
      text: opts.label,
    }).el as HTMLLabelElement;
    this._labelEl.classList.add('arvo-pg-smart-input__label');
    this._labelEl.classList.add('arvo-textbox__lbl');

    this._fieldEl = document.createElement('div');
    this._fieldEl.className = 'arvo-combobox__field arvo-pg-smart-input__field';
    this._fieldEl.setAttribute('role', 'combobox');
    this._fieldEl.setAttribute('aria-haspopup', 'dialog');
    this._fieldEl.setAttribute('aria-expanded', 'false');

    this._inputEl = document.createElement('input');
    this._inputEl.className = 'arvo-combobox__input arvo-pg-smart-input__input';
    this._inputEl.type = 'text';
    this._inputEl.placeholder = opts.placeholder ?? 'type / operator, @measure, \u2193 build';
    this._inputEl.setAttribute('autocomplete', 'off');
    this._inputEl.setAttribute('aria-autocomplete', 'none');

    this._triggerEl = document.createElement('button');
    this._triggerEl.type = 'button';
    this._triggerEl.className = 'arvo-pg-smart-input__trigger';
    this._triggerEl.setAttribute('aria-label', 'Open measure builder');

    const triggerIcon = document.createElement('span');
    triggerIcon.className = 'o9con o9con-angle-down arvo-pg-smart-input__trigger-ico';
    triggerIcon.setAttribute('aria-hidden', 'true');
    this._triggerEl.appendChild(triggerIcon);

    this._borderEl = document.createElement('div');
    this._borderEl.className = 'arvo-combobox__border arvo-pg-smart-input__border';

    this._fieldEl.appendChild(this._inputEl);
    this._fieldEl.appendChild(this._triggerEl);
    this._fieldEl.appendChild(this._borderEl);

    this._popoverHost = document.createElement('div');
    this._popoverHost.className = 'arvo-pg-smart-input__popover-host';

    this._tabsHost = document.createElement('div');
    this._tabsHost.className = 'arvo-pg-smart-input__tabs';
    this._popoverHost.appendChild(this._tabsHost);

    this._root.appendChild(this._labelEl);
    this._root.appendChild(this._fieldEl);
    this._root.appendChild(this._popoverHost);
    opts.container.appendChild(this._root);

    this._bind();
  }

  destroy(): void {
    this._tabs?.destroy();
    this._tabs = null;
    this._operatorSelect?.destroy();
    this._operatorSelect = null;
    this._measuresOperatorSelect?.destroy();
    this._measuresOperatorSelect = null;
    this._measureCombobox?.destroy();
    this._measureCombobox = null;
    this._row2OperatorSelect?.destroy();
    this._row2OperatorSelect = null;
    this._suggestionList?.destroy();
    this._suggestionList = null;
    this._suggestionHost = null;
    this._numberInput?.destroy();
    this._numberInput = null;
    this._numberInput2?.destroy();
    this._numberInput2 = null;
    this._textbox?.destroy();
    this._textbox = null;
    this._multiSelect?.destroy();
    this._multiSelect = null;
    this._radioGroup?.destroy();
    this._radioGroup = null;
    this._datePicker?.destroy();
    this._datePicker = null;
    this._dateRangePicker?.destroy();
    this._dateRangePicker = null;
    this._popover?.destroy();
    this._popover = null;
    this._root.remove();
  }

  private _bind(): void {
    this._inputEl.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (this._suggestionList?.isOpen() && this._suggestionHost) {
          this._suggestionHost.focus({ preventScroll: true });
          this._suggestionHost.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
          return;
        }
        this.open();
      }
      if (event.key === 'ArrowRight' && this._rangePlaceholderActive === 'first') {
        event.preventDefault();
        this._selectRangePlaceholder('second');
        return;
      }
      if (event.key === 'ArrowLeft' && this._rangePlaceholderActive === 'second') {
        event.preventDefault();
        this._selectRangePlaceholder('first');
        return;
      }
      if (event.key === 'ArrowLeft' && this._rangePlaceholderActive === 'first') {
        this._rangePlaceholderActive = null;
        this._inputEl.setSelectionRange(this._inputEl.selectionStart ?? 0, this._inputEl.selectionStart ?? 0);
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        this._normalizeInputOnCommit();
      }
      if (event.key === 'Escape') {
        if (this._suggestionList?.isOpen()) {
          event.preventDefault();
          this._removeTemporaryTrigger();
          this._closeSuggestions(false);
          return;
        }
        this._closeSuggestions();
        this.close();
      }
    });
    this._inputEl.addEventListener('input', () => {
      const cursor = this._inputEl.selectionStart ?? this._inputEl.value.length;
      const normalizedSlashes = this._inputEl.value.replace(/\/{2,}/g, '/');
      if (normalizedSlashes !== this._inputEl.value) {
        this._inputEl.value = normalizedSlashes;
        this._inputEl.setSelectionRange(Math.max(0, cursor - 1), Math.max(0, cursor - 1));
      }
      if (this._rangePlaceholderActive === 'second') this._rangePlaceholderActive = null;
      this._syncSuggestions();
      if (!this._inputEl.value.includes('/') && !this._inputEl.value.includes('@')) {
        this._opts.onExpressionChange?.(this._inputEl.value.trim());
      }
    });
    this._inputEl.addEventListener('blur', () => this._normalizeInputOnCommit());

    this._triggerEl.addEventListener('pointerdown', (event) => {
      event.preventDefault();
    });
    this._triggerEl.addEventListener('click', () => this.open());
    this._fieldEl.addEventListener('mousedown', (event) => {
      const target = event.target as HTMLElement | null;
      if (!target || target === this._inputEl || target.tagName === 'INPUT') return;
      event.preventDefault();
    });
    this._fieldEl.addEventListener('click', (event) => {
      if (event.target === this._triggerEl) return;
      this._inputEl.focus({ preventScroll: true });
    });
  }

  open(): void {
    this._closeSuggestions();
    if (!this._popover) {
      this._popover = this._createPopover();
    }
    this._popover.open();
    this._fieldEl.setAttribute('aria-expanded', 'true');
  }

  close(): void {
    this._closeSuggestions();
    this._popover?.close();
    this._fieldEl.setAttribute('aria-expanded', 'false');
  }

  toggle(): void {
    if (this._popover?.isOpen()) this.close();
    else this.open();
  }

  expression(): string {
    return this._inputEl.value === this._inputEl.placeholder ? '' : this._inputEl.value.trim();
  }

  private _createPopover(): ArvoPopover {
    const body = document.createElement('div');
    body.className = 'arvo-pg-smart-input__panel';

    const content = document.createElement('div');
    content.className = 'arvo-pg-smart-input__panel-body';

    const tabs = this._buildTabs();

    this._valuesPane = document.createElement('div');
    this._valuesPane.className = 'arvo-pg-smart-input__pane';
    this._valuesPane.dataset['tab'] = 'values';
    this._valuesPane.innerHTML = `
      <div class="arvo-pg-smart-input__grid">
        <div>
          <div class="arvo-pg-smart-input__subhead">Operator</div>
          <div class="arvo-pg-smart-input__operator-host"></div>
        </div>
        <div>
          <div class="arvo-pg-smart-input__subhead">Value</div>
          <div class="arvo-pg-smart-input__value-host"></div>
        </div>
      </div>
    `;
    this._operatorHost = this._valuesPane.querySelector('.arvo-pg-smart-input__operator-host') as HTMLDivElement;
    this._valueHost = this._valuesPane.querySelector('.arvo-pg-smart-input__value-host') as HTMLDivElement;
    this._operatorSelect?.destroy();
    this._operatorSelect = ArvoSelect.initialize(this._operatorHost, {
      items: this._operatorItems,
      value: this._selectedOperatorLabel,
      placeholder: this._operatorItems[0]?.label ?? '=',
      size: 'lg',
      surface: 'filled',
      width: '100%',
      placement: 'bottom-start',
      closeOnSelect: true,
      onChange: (item) => {
        const label = String(item.value ?? item.label);
        this._selectedOperatorLabel = label;
        this._syncValueControl(label);
        this._syncSecondRow(label);
        this._updateSummary();
      },
    });
    this._syncValueControl(this._selectedOperatorLabel);
    this._syncSecondRow(this._selectedOperatorLabel);

    this._measuresPane = document.createElement('div');
    this._measuresPane.className = 'arvo-pg-smart-input__pane';
    this._measuresPane.dataset['tab'] = 'measures';
    this._measuresPane.hidden = true;
    this._measuresPane.innerHTML = `
      <div class="arvo-pg-smart-input__grid">
        <div>
          <div class="arvo-pg-smart-input__subhead">Operator</div>
          <div class="arvo-pg-smart-input__operator-host arvo-pg-smart-input__operator-host--measures"></div>
        </div>
        <div>
          <div class="arvo-pg-smart-input__subhead">Measures</div>
          <div class="arvo-pg-smart-input__value-host arvo-pg-smart-input__value-host--measures"></div>
        </div>
      </div>
    `;

    content.appendChild(this._valuesPane);
    content.appendChild(this._measuresPane);
    body.appendChild(content);

    const measuresOperatorHost = this._measuresPane.querySelector('.arvo-pg-smart-input__operator-host--measures') as HTMLDivElement;
    const measuresValueHost = this._measuresPane.querySelector('.arvo-pg-smart-input__value-host--measures') as HTMLDivElement;
    this._measuresOperatorSelect = ArvoSelect.initialize(measuresOperatorHost, {
      items: this._operatorItems,
      value: this._selectedOperatorLabel,
      placeholder: this._operatorItems[0]?.label ?? '=',
      size: 'lg',
      surface: 'filled',
      width: '100%',
      placement: 'bottom-start',
      closeOnSelect: true,
      onChange: (item) => {
        this._selectedOperatorLabel = String(item.value ?? item.label);
        this._updateSummary();
      },
    });
    this._measureHost = measuresValueHost;
    this._measureCombobox?.destroy();
    this._measureCombobox = ArvoCombobox.initialize(measuresValueHost, {
      items: this._measureItems,
      value: (this._measureItems.find((item) => item.label === this._selectedComparedMeasureLabel)?.value
        ?? this._selectedComparedMeasureLabel) || undefined,
      placeholder: 'Select measure',
      size: 'lg',
      surface: 'filled',
      width: '100%',
      placement: 'bottom-start',
      closeOnSelect: true,
      onChange: (item) => {
        this._selectedComparedMeasureLabel = item.label;
        this._updateSummary();
      },
    });

    return ArvoPopover.initialize(this._triggerEl, {
      placement: 'bottom-end',
      width: this._popoverWidth(),
      hasArrow: true,
      hasHeader: false,
      stickyHeader: tabs,
      hasFooter: true,
      content: body,
      actions: [
        { id: 'clear', label: 'Clear', variant: 'secondary', action: () => { this._inputEl.value = ''; this._summaryText = ''; this._selectedMeasureLabel = ''; this._selectedComparedMeasureLabel = ''; this._selectedOperatorLabel = '='; this._selectedOperator2Label = ''; this._row1Value = null; this._row2Value = null; this._orValues = []; this._activeTab = 'values'; this._syncTabs(); this._syncValueControl('='); this._syncSecondRow('='); return false; } },
        { id: 'reset', label: 'Reset', variant: 'secondary', action: () => { this._inputEl.value = ''; this._selectedMeasureLabel = ''; this._selectedComparedMeasureLabel = ''; this._selectedOperatorLabel = '='; this._selectedOperator2Label = ''; this._row1Value = null; this._row2Value = null; this._orValues = []; this._activeTab = 'values'; this._syncTabs(); this._syncValueControl('='); this._syncSecondRow('='); this._updateSummary(); return false; } },
        { id: 'save', label: 'Save', variant: 'primary', action: () => { this._commitToInput(); this.close(); return false; } },
      ],
      onOpen: () => {
        this._restoreTabFromInput();
        this._syncTabs();
        this._syncValueControl(this._selectedOperatorLabel);
        this._syncSecondRow(this._selectedOperatorLabel);
        const restoredOrValues = [...this._orValues];
        if (restoredOrValues.length && this._addValueButton) {
          this._orValues = [];
          restoredOrValues.forEach((value) => {
            this._pendingOrValue = value;
            this._addValueButton?.click();
            this._orValues[this._orValues.length - 1] = value;
            if (value && (value.kind === 'text' || value.kind === 'number' || value.kind === 'date')) {
              const row = this._orRowsHost?.lastElementChild;
              requestAnimationFrame(() => {
                const input = row?.querySelector('input') as HTMLInputElement | null;
                if (input) {
                  input.value = value.value;
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                  input.dispatchEvent(new Event('change', { bubbles: true }));
                }
              });
            }
          });
        }
        this._operatorSelect?.value(this._selectedOperatorLabel);
        this._measuresOperatorSelect?.value(this._selectedOperatorLabel);
        this._measureCombobox?.value(
          (this._measureItems.find((item) => item.label === this._selectedComparedMeasureLabel)?.value
            ?? this._selectedComparedMeasureLabel) || null,
        );
      },
      onClose: () => {
        this._fieldEl.setAttribute('aria-expanded', 'false');
      },
    });
  }

  private _buildTabs(): HTMLElement {
    const tabsEl = document.createElement('div');
    tabsEl.className = 'arvo-pg-smart-input__tabstrip';
    const tabs: TabItem[] = [
      { id: 'values', label: 'Values' },
      { id: 'measures', label: 'Measures' },
    ];
    this._tabs = ArvoTabstrip.initialize(tabsEl, {
      tabs,
      size: 'lg',
      selectedId: this._activeTab,
      onSelect: (item) => {
        this._activeTab = item.id as 'values' | 'measures';
        this._syncTabs();
      },
    });
    return tabsEl;
  }

  private _syncTabs(): void {
    if (!this._valuesPane || !this._measuresPane) return;
    const showValues = this._activeTab === 'values';
    this._valuesPane.hidden = !showValues;
    this._measuresPane.hidden = showValues;
  }

  private _syncSuggestions(): void {
    const value = this._inputEl.value;
    const cursor = this._inputEl.selectionStart ?? value.length;
    const beforeCursor = value.slice(0, cursor);
    const atStart = beforeCursor.lastIndexOf('@');
    const slashStart = beforeCursor.lastIndexOf('/');
    if (this._opts.dataType === 'datetime' && /\d{1,2}\/\d{1,2}(?:\/\d{0,4})?$/.test(beforeCursor)) {
      this._closeSuggestions();
      return;
    }
    const atContext = atStart >= 0 && !/\s/.test(beforeCursor.slice(atStart + 1));
    const slashContext = slashStart >= 0 && !/\s/.test(beforeCursor.slice(slashStart + 1));
    if (!atContext && !slashContext) {
      this._closeSuggestions();
      return;
    }
    const mode: 'operator' | 'measure' = atContext && atStart > slashStart ? 'measure' : 'operator';
    const start = mode === 'measure' ? atStart : slashStart;
    let replacementStart = start;
    let hasValueBefore = false;
    if (mode === 'operator') {
      const beforeTrigger = beforeCursor.slice(0, start);
      const terminalOperator = beforeTrigger.match(/(?:^|\s)(>=|<=|!=|!Between|!Null|>|<|=)\s*$/);
      const hasAndContext = /\s(?:AND|and|And|&)\s*$/.test(beforeTrigger);
      hasValueBefore = /\S/.test(beforeTrigger.replace(/(?:^|\s)(>=|<=|!=|!Between|!Null|>|<|=)\s*$/, '').trim());
      if (terminalOperator) replacementStart = beforeTrigger.lastIndexOf(terminalOperator[1]);
      else if (hasValueBefore && !hasAndContext) {
        this._closeSuggestions();
        return;
      }
    }
    const query = beforeCursor.slice(start + 1);
    const source = mode === 'measure' ? this._measureItems : this._operatorItems;
    let filteredSource = source;
    let contextualEmpty = false;
    if (mode === 'operator') {
      const priorOperators = [...beforeCursor.matchAll(/(>=|<=|!=|!Between|!Null|StartsWith|!StartsWith|EndsWith|!EndsWith|Contains|!Contains|Wildcard|Between|Null|=|>|<)/g)]
        .map((match) => match[1]);
      const firstOperator = priorOperators[0];
      const afterAnd = /\s(?:AND|and|And|&)\s*$/.test(beforeCursor.slice(0, start));
      const rangeOperators: Record<string, string[]> = {
        '>': ['<', '<='],
        '<': ['>', '>='],
        '>=': ['<', '<='],
        '<=': ['>', '>='],
      };
      if (firstOperator && (afterAnd || replacementStart < start)) {
        const allowed = rangeOperators[firstOperator] ?? [];
        filteredSource = allowed.length
          ? this._operatorItems.filter((item) => allowed.includes(String(item.value)))
          : [];
      } else if (afterAnd) {
        filteredSource = this._operatorItems.filter((item) => !priorOperators.includes(String(item.value)));
      } else if (hasValueBefore) {
        contextualEmpty = true;
      }
    }
    const items: OptionListItemData[] = (contextualEmpty
      ? [{ id: 'no-operator', label: 'No operator allowed here. Use AND to add another condition.', value: '', isDisabled: true }]
      : filteredSource.filter((item) => String(item.label).toLowerCase().includes(query.toLowerCase())))
      .map((item) => ({ id: item.id, label: item.label, value: item.value ?? item.label }));
    if (!items.length && !contextualEmpty) {
      this._closeSuggestions();
      return;
    }
    this._popover?.close();
    this._suggestionAnchorStart = start;
    this._suggestionReplacementStart = replacementStart;
    this._suggestionReplacementEnd = cursor;
    this._suggestionMode = mode;
    if (!this._suggestionHost) {
      this._suggestionHost = document.createElement('button');
      this._suggestionHost.type = 'button';
      this._suggestionHost.className = 'arvo-pg-smart-input__suggestion-anchor';
      this._suggestionHost.setAttribute('aria-label', 'Suggestions');
      this._root.appendChild(this._suggestionHost);
    }
    this._suggestionList?.destroy();
    this._suggestionList = ArvoOptionListV2.initialize(this._suggestionHost, {
      items,
      width: this._fieldEl.getBoundingClientRect().width || 320,
      closeOnSelect: true,
      onChange: (detail) => {
        const selected = detail.option;
        if (!selected) return;
        const current = this._inputEl.value;
        const replacement = String(selected.value ?? selected.label);
        if (this._suggestionMode === 'operator' && (replacement === 'Between' || replacement === '!Between')) {
          const functionText = replacement === '!Between' ? 'Not Between(a,b)' : 'Between(a,b)';
          this._inputEl.value = `${current.slice(0, this._suggestionReplacementStart)}${functionText}${current.slice(this._suggestionReplacementEnd)}`
            .replace(/\/\s*$/, '');
          const firstStart = this._suggestionReplacementStart + functionText.indexOf('a');
          this._inputEl.setSelectionRange(firstStart, firstStart + 1);
          this._rangePlaceholderActive = 'first';
          this._closeSuggestions(false);
          this._inputEl.focus({ preventScroll: true });
          return;
        }
        this._inputEl.value = `${current.slice(0, this._suggestionReplacementStart)}${replacement}${current.slice(this._suggestionReplacementEnd)}`;
        if (this._suggestionMode === 'operator') this._inputEl.value = this._inputEl.value.replace(/\/\s*$/, '');
        const nextCursor = this._suggestionReplacementStart + replacement.length;
        this._inputEl.setSelectionRange(nextCursor, nextCursor);
        this._closeSuggestions(false);
        this._inputEl.focus({ preventScroll: true });
      },
    });
    this._suggestionList.open();
  }

  private _removeTemporaryTrigger(): void {
    if (!this._suggestionMode) return;
    const current = this._inputEl.value;
    this._inputEl.value = `${current.slice(0, this._suggestionReplacementStart)}${current.slice(this._suggestionReplacementEnd)}`;
    this._inputEl.setSelectionRange(this._suggestionReplacementStart, this._suggestionReplacementStart);
    this._opts.onExpressionChange?.(this._inputEl.value.trim());
  }

  private _closeSuggestions(clean = true): void {
    if (clean && this._suggestionList?.isOpen()) this._removeTemporaryTrigger();
    this._suggestionList?.destroy();
    this._suggestionList = null;
    this._suggestionMode = null;
    this._suggestionHost?.remove();
    this._suggestionHost = null;
  }

  private _selectRangePlaceholder(which: 'first' | 'second'): void {
    const value = this._inputEl.value;
    const functionStart = value.indexOf('Between(');
    const start = functionStart < 0 ? -1 : functionStart + 'Between('.length + (which === 'first' ? 0 : 2);
    if (start < 0) return;
    this._rangePlaceholderActive = which;
    this._inputEl.setSelectionRange(start, start + 1);
    this._inputEl.focus({ preventScroll: true });
  }

  private _normalizeInputOnCommit(): void {
    const current = this._inputEl.value.trim();
    if (!current || current === this._inputEl.placeholder) return;
    this._inputEl.value = this._normalizeExpression(current);
    this._opts.onExpressionChange?.(this._inputEl.value);
  }

  private _normalizeExpression(expression: string): string {
    let normalized = expression
      .replace(/([><=!])\1+/g, '$1')
      .replace(/\s*&\s*/g, ' AND ')
      .replace(/\s+and\s+/gi, ' AND ')
      .replace(/\s+or\s+/gi, ' OR ')
      .trim();

    if (!/[><=!]|\b(?:AND|OR|Between|Null|Contains|StartsWith|EndsWith|Wildcard)\b/i.test(normalized) &&
      normalized.includes(',') && this._opts.dataType !== 'datetime' && this._opts.dataType !== 'boolean') {
      return `= ${normalized.split(',').map((value) => value.trim()).filter(Boolean).join(', ')}`;
    }

    for (const item of this._measureItems) {
      const label = String(item.label ?? '');
      if (!label) continue;
      normalized = normalized.replace(new RegExp(`(^|\\s)${this._escapeRegExp(label)}(?=\\s|$)`, 'i'), `$1${label}`);
    }

    // Equality comma shorthand may repeat the operator between values. Treat
    // every form as one list so `= 24, 32, = 40, 50` commits canonically.
    const mixedEquality = normalized.match(/^(=|!=)\s+(.+)$/);
    if (mixedEquality && mixedEquality[2].includes(',') &&
      this._opts.dataType !== 'datetime' && this._opts.dataType !== 'boolean') {
      const values = mixedEquality[2]
        .split(',')
        .map((value) => value.replace(/^\s*(?:=|!=)\s*/, '').trim())
        .filter(Boolean);
      return `${mixedEquality[1]} ${values.join(', ')}`;
    }

    const clauses = normalized.split(/\s+(?:AND|OR)\s+/i);
    const connectors = normalized.match(/\s+(AND|OR)\s+/gi) ?? [];
    const normalizedClauses = clauses.map((clause) => this._normalizeClause(clause));
    if (normalizedClauses.length === 1) {
      const equality = normalizedClauses[0].match(/^(=|!=)\s+(.+)$/);
      if (equality && equality[2].includes(',')) {
        const values = equality[2]
          .split(',')
          .map((value) => value.replace(/^(=|!=)\s*/, '').trim())
          .filter(Boolean);
        return `${equality[1]} ${values.join(', ')}`;
      }
    }
    if (connectors.some((connector) => connector.trim().toUpperCase() === 'OR')) {
      const equalityParts = normalizedClauses.map((clause) => clause.match(/^(=|!=)\s+(.+)$/));
      if (equalityParts.every(Boolean) && new Set(equalityParts.map((match) => match?.[1])).size === 1) {
        const operator = equalityParts[0]?.[1] ?? '=';
        const values = equalityParts
          .flatMap((match) => (match?.[2] ?? '').split(',').map((value) => value.trim()))
          .map((value) => value.replace(/^(=|!=)\s*/, '').trim())
          .filter(Boolean);
        return `${operator} ${values.join(', ')}`;
      }
    }
    const hasOr = connectors.some((connector) => connector.trim().toUpperCase() === 'OR');
    return clauses
      .slice(0, hasOr ? clauses.length : 2)
      .map((clause) => this._normalizeClause(clause))
      .filter(Boolean)
      .reduce((result, clause, index) => index === 0 ? clause : `${result} ${(connectors[index - 1] ?? ' AND ').trim().toUpperCase()} ${clause}`, '');
  }

  private _normalizeClause(clause: string): string {
    clause = clause.replace(/([><=!])\1+/g, '$1');
    const tokens = clause.match(/"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|[^"']+/g) ?? [];
    return tokens
      .map((token) => {
        if (token.startsWith('"') || token.startsWith("'")) return token;
        return token
          .replace(/\s*(>=|<=|!=|!Between|!Null|StartsWith|!Starts With|EndsWith|!Ends With|Contains|Not Contains|Wildcard|Between|Null|=|>|<)\s*/i, (_match, operator: string) => `${this._canonicalOperator(operator)} `)
          .replace(/\s+$/, '');
      })
      .join(' ')
      .trim();
  }

  private _canonicalOperator(operator: string): string {
    const match = this._operatorItems.find((item) => String(item.label).toLowerCase() === operator.toLowerCase());
    return String(match?.label ?? operator);
  }

  private _escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private _restoreTabFromInput(): void {
    const text = this._inputEl.value || '';
    this._restoreStateFromInput(text);
    if (text.includes('@') || this._selectedComparedMeasureLabel ||
      (this._selectedMeasureLabel && text.includes(this._selectedMeasureLabel))) {
      this._activeTab = 'measures';
    } else {
      this._activeTab = 'values';
    }
  }

  private _restoreStateFromInput(text: string): void {
    const trimmed = text.trim();
    this._selectedMeasureLabel = '';
    this._selectedComparedMeasureLabel = '';
    this._selectedOperatorLabel = '=';
    this._selectedOperator2Label = '';
    this._row1Value = null;
    this._row2Value = null;
    this._orValues = [];
    if (!trimmed || trimmed === this._inputEl.placeholder) return;

    const sourceLabel = this._opts.label;
    const measure = trimmed.startsWith(sourceLabel)
      ? sourceLabel
      : [...this._measureItems]
      .map((item) => item.label)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)
      .find((label) => trimmed.startsWith(label));

    this._selectedMeasureLabel = measure ?? '';

    let rest = measure ? trimmed.slice(measure.length).trim() : trimmed;
    const operatorPattern = /(>=|<=|!=|!Between|!Null|StartsWith|!StartsWith|EndsWith|!EndsWith|Contains|!Contains|Wildcard|Between|Null|=|>|<)/;
    const firstMatch = rest.match(operatorPattern);
    if (!firstMatch || firstMatch.index == null) return;

    const firstOp = firstMatch[1];
    this._selectedOperatorLabel = firstOp;
    rest = rest.slice(firstMatch.index + firstOp.length).trim();

    const compared = this._measureItems.find((item) => {
      const label = String(item.label).toLowerCase();
      const value = rest.toLowerCase();
      return label === value || value.startsWith(`${label} (`) || label.startsWith(`${value} (`);
    });
    if (compared) {
      this._selectedComparedMeasureLabel = String(compared.label);
      this._selectedMeasureLabel = measure ?? '';
      return;
    }

    // Restore comma equality shorthand as the builder's OR rows.
    if ((firstOp === '=' || firstOp === '!=') && rest.includes(',')) {
      const values = rest.split(',').map((value) => value.replace(/^\s*(?:=|!=)\s*/, '').trim()).filter(Boolean);
      this._row1Value = this._parseRowValue(values.shift() ?? '');
      this._orValues = values.map((value) => this._parseRowValue(value));
      this._row2Value = null;
      this._selectedOperator2Label = '';
      return;
    }

    const secondMatch = rest.match(operatorPattern);
    if (!secondMatch || secondMatch.index == null) {
      this._row1Value = this._parseRowValue(rest);
      this._row2Value = null;
      return;
    }

    const firstValue = rest.slice(0, secondMatch.index).trim();
    const secondOp = secondMatch[1];
    const secondValue = rest.slice(secondMatch.index + secondOp.length).trim();

    this._row1Value = this._parseRowValue(firstValue);
    this._selectedOperator2Label = secondOp;
    this._row2Value = this._parseRowValue(secondValue);
  }

  private _parseRowValue(value: string): BuilderRowValue {
    const normalized = value.trim().replace(/\s+AND\s*$/i, '').trim();
    if (!normalized) return null;
    if (this._opts.dataType === 'integer' || this._opts.dataType === 'datetime') {
      const range = normalized.split(/\s+to\s+|\s+and\s+/i);
      return this._opts.dataType === 'integer'
        ? { kind: 'number', value: range[0] ?? '', value2: range[1] }
        : { kind: 'date', value: range[0] ?? '', value2: range[1] };
    }
    if (this._opts.dataType === 'picklist') return { kind: 'multi', value: normalized.split(/\s*,\s*/) };
    if (this._opts.dataType === 'boolean') return { kind: 'boolean', value: normalized.toLowerCase() === 'false' ? 'false' : 'true' };
    return { kind: 'text', value: normalized };
  }

  private _setRow1Value(next: BuilderRowValue): void {
    this._row1Value = next;
    this._updateSummary();
  }

  private _setRow2Value(next: BuilderRowValue): void {
    this._row2Value = next;
    this._updateSummary();
  }

  private _hasRowValue(row: BuilderRowValue): boolean {
    if (!row) return false;
    if (row.kind === 'multi') return row.value.length > 0;
    if (row.kind === 'number' || row.kind === 'date') {
      return Boolean(row.value?.trim()) || Boolean(row.value2?.trim());
    }
    return Boolean(row.value?.trim());
  }

  private _formatRowValue(row: BuilderRowValue): string {
    if (!row) return '';
    if (row.kind === 'multi') return row.value.join(', ');
    if (row.kind === 'number' || row.kind === 'date') {
      if (row.value && row.value2) return `${row.value} AND ${row.value2}`;
      return row.value || row.value2 || '';
    }
    return row.value;
  }

  private _commitToInput(): void {
    const parts: string[] = [];
    const measureMode = this._activeTab === 'measures' && this._selectedComparedMeasureLabel;
    if (measureMode) {
      parts.push(this._selectedOperatorLabel, this._selectedComparedMeasureLabel);
    } else if (this._selectedMeasureLabel) {
      parts.push(this._selectedMeasureLabel);
    }
    if (!measureMode && this._hasRowValue(this._row1Value)) {
      if (this._selectedOperatorLabel) parts.push(this._selectedOperatorLabel);
      const row1 = this._formatRowValue(this._row1Value);
      if (row1) parts.push(row1);
    }
    if (!measureMode && this._hasRowValue(this._row2Value)) {
      if (this._selectedOperator2Label) parts.push('AND', this._selectedOperator2Label);
      const row2 = this._formatRowValue(this._row2Value);
      if (row2) parts.push(row2);
    }
    for (const value of measureMode ? [] : this._orValues) {
      if (this._hasRowValue(value)) parts.push('OR', this._selectedOperatorLabel, this._formatRowValue(value));
    }
    this._summaryText = this._normalizeExpression(parts.join(' ').trim());
    this._inputEl.value = this._summaryText;
    this._opts.onExpressionChange?.(this._summaryText);
  }

  private _syncValueControl(operatorLabel: string): void {
    if (!this._valueHost) return;
    const isNullOp = operatorLabel === 'Null' || operatorLabel === '!Null';
    const isBetween = operatorLabel === 'Between' || operatorLabel === '!Between';
    this._datePicker?.destroy();
    this._dateRangePicker?.destroy();
    this._numberInput?.destroy();
    this._numberInput2?.destroy();
    this._textbox?.destroy();
    this._multiSelect?.destroy();
    this._radioGroup?.destroy();
    this._datePicker = null;
    this._dateRangePicker = null;
    this._numberInput = null;
    this._numberInput2 = null;
    this._textbox = null;
    this._multiSelect = null;
    this._radioGroup = null;
    this._valueHost.textContent = '';
    if (operatorLabel !== '=' && operatorLabel !== '!=') this._orValues = [];
    this._addValueButton?.remove();
    this._orRowsHost?.remove();
    this._valuesPane?.classList.remove('arvo-pg-smart-input__pane--or-active');
    this._addValueButton = null;
    this._orRowsHost = null;
    this._renderAddValueAction(operatorLabel);

    if (this._opts.dataType === 'integer') {
      if (isBetween) {
        const wrap = document.createElement('div');
        wrap.className = 'arvo-pg-smart-input__dual';
        wrap.style.display = 'grid';
        wrap.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
        wrap.style.gap = '12px';
        const first = document.createElement('div');
        const second = document.createElement('div');
        wrap.append(first, second);
        this._valueHost.appendChild(wrap);
        this._numberInput = ArvoNumberInput.initialize(first as HTMLDivElement, {
          placeholder: isNullOp ? '' : 'from',
          width: '100%',
          surface: 'filled',
          size: 'lg',
          isDisabled: isNullOp,
          value: this._row1Value?.kind === 'number' ? Number(this._row1Value.value || null) : null,
          onChange: (payload) => {
            const prev = this._row1Value?.kind === 'number' ? this._row1Value : null;
            this._setRow1Value({
              kind: 'number',
              value: payload.value == null ? '' : String(payload.value),
              value2: prev?.value2,
            });
          },
        });
        this._numberInput2 = ArvoNumberInput.initialize(second as HTMLDivElement, {
          placeholder: isNullOp ? '' : 'to',
          width: '100%',
          surface: 'filled',
          size: 'lg',
          isDisabled: isNullOp,
          value: this._row1Value?.kind === 'number' ? Number(this._row1Value.value2 || null) : null,
          onChange: (payload) => {
            const prev = this._row1Value?.kind === 'number' ? this._row1Value : null;
            this._setRow1Value({
              kind: 'number',
              value: prev?.value ?? '',
              value2: payload.value == null ? '' : String(payload.value),
            });
          },
        });
      } else {
        const host = document.createElement('div');
        this._valueHost.appendChild(host);
        this._numberInput = ArvoNumberInput.initialize(host as HTMLDivElement, {
          placeholder: isNullOp ? '' : 'Enter value',
          width: '100%',
          surface: 'filled',
          size: 'lg',
          isDisabled: isNullOp,
          value: this._row1Value?.kind === 'number' ? Number(this._row1Value.value || null) : null,
          onChange: (payload) => {
            this._setRow1Value({
              kind: 'number',
              value: payload.value == null ? '' : String(payload.value),
            });
          },
        });
      }
      return;
    }

    if (this._opts.dataType === 'datetime') {
      const host = document.createElement('div');
      this._valueHost.appendChild(host);
      if (isBetween) {
        this._dateRangePicker = ArvoDateRangePicker.initialize(host, {
          startValue: this._row1Value?.kind === 'date' ? this._row1Value.value || null : null,
          endValue: this._row1Value?.kind === 'date' ? this._row1Value.value2 || null : null,
          placeholder: isNullOp ? '' : 'dd-MM-yyyy',
          size: 'lg',
          surface: 'filled',
          width: '100%',
          placement: 'bottom-start',
          isAutoClose: true,
          isDisabled: isNullOp,
          onChange: (payload) => {
            this._setRow1Value({
              kind: 'date',
              value: payload.formatted.start ?? '',
              value2: payload.formatted.end ?? '',
            });
          },
        });
      } else {
        this._datePicker = ArvoDatePicker.initialize(host as HTMLDivElement, {
          value: this._row1Value?.kind === 'date' ? this._row1Value.value || null : null,
          placeholder: isNullOp ? '' : 'MM/dd/yyyy',
          size: 'lg',
          surface: 'filled',
          width: '100%',
          placement: 'bottom-start',
          isAutoClose: true,
          isDisabled: isNullOp,
          onChange: (payload) => {
            this._setRow1Value({
              kind: 'date',
              value: payload.formattedValue ?? '',
            });
          },
        });
      }
      return;
    }

    if (this._opts.dataType === 'picklist') {
      const host = document.createElement('div');
      this._valueHost.appendChild(host);
      this._multiSelect = ArvoMultiSelectV2.initialize(host, {
        items: this._valueItems,
        value: this._row1Value?.kind === 'multi' ? this._row1Value.value : undefined,
        placeholder: isNullOp ? '' : 'Select values',
        width: '100%',
        isFullWidth: true,
        isDisabled: isNullOp,
        onChange: (value) => {
          this._setRow1Value({
            kind: 'multi',
            value: value.map((item) => String(item)),
          });
        },
      });
      return;
    }

    if (this._opts.dataType === 'boolean') {
      const host = document.createElement('div');
      this._valueHost.appendChild(host);
      this._radioGroup = ArvoRadioGroup.initialize(host, {
        name: `${this._opts.label.replace(/\W+/g, '-').toLowerCase()}-bool`,
        label: null,
        orientation: 'horizontal',
        labelPosition: 'top',
        size: 'lg',
        items: [
          { value: 'true', label: 'True', isChecked: true },
          { value: 'false', label: 'False' },
        ],
        isDisabled: isNullOp,
        value: 'true',
        onChange: (detail) => {
          this._setRow1Value({
            kind: 'boolean',
            value: detail.value,
          });
        },
      });
      return;
    }

    const host = document.createElement('div');
    this._valueHost.appendChild(host);
    this._textbox = ArvoTextbox.initialize(host as HTMLDivElement, {
      placeholder: isNullOp ? '' : 'Enter value',
      width: '100%',
      surface: 'filled',
      size: 'lg',
      isDisabled: isNullOp,
      value: this._row1Value?.kind === 'text' ? this._row1Value.value : '',
      onChange: (event) => {
        const target = event.target as HTMLInputElement | null;
        this._setRow1Value({
          kind: 'text',
          value: target?.value ?? '',
        });
      },
    });
  }

  private _renderAddValueAction(operatorLabel: string): void {
    if (!this._valueHost || !['integer', 'datetime'].includes(this._opts.dataType ?? '') ||
      (operatorLabel !== '=' && operatorLabel !== '!=')) return;
    this._addValueButton = document.createElement('button');
    this._addValueButton.className = 'arvo-pg-smart-input__add-value';
    ArvoButton.initialize(this._addValueButton, {
      type: 'button',
      label: 'Add Value',
      icon: 'plus',
      variant: 'inline',
      size: 'md',
      onClick: () => {
      this._valuesPane?.classList.add('arvo-pg-smart-input__pane--or-active');
      if (!this._orRowsHost) {
        this._orRowsHost = document.createElement('div');
        this._orRowsHost.className = 'arvo-pg-smart-input__or-rows';
        this._valueHost?.parentElement?.parentElement?.appendChild(this._orRowsHost);
      }
      const row = document.createElement('div');
      row.className = 'arvo-pg-smart-input__or-row';
      const separator = document.createElement('span');
      separator.className = 'arvo-pg-smart-input__or-separator';
      separator.textContent = 'OR';
      const operatorHost = document.createElement('div');
      operatorHost.className = 'arvo-pg-smart-input__or-operator-host';
      const valueHost = document.createElement('div');
      valueHost.className = 'arvo-pg-smart-input__or-value-host';
      row.append(separator, operatorHost, valueHost);
      this._orRowsHost.appendChild(row);
      this._orRowsHost.after(this._addValueButton as HTMLButtonElement);
      const index = this._orValues.length;
      const initialValue = this._pendingOrValue;
      this._pendingOrValue = null;
      this._orValues.push(null);
      ArvoSelect.initialize(operatorHost, {
        items: this._operatorItems.filter((item) => item.value === operatorLabel),
        value: operatorLabel,
        isReadOnly: true,
        size: 'lg',
        surface: 'filled',
        width: '100%',
        closeOnSelect: true,
        onChange: (item) => {
          this._orValues[index] = this._orValues[index] ?? { kind: 'text', value: '' };
          if (item?.value) this._selectedOperatorLabel = String(item.value);
          this._updateSummary();
        },
      });
      if (this._opts.dataType === 'integer') {
        ArvoNumberInput.initialize(valueHost, {
          placeholder: 'Enter value', width: '100%', surface: 'filled', size: 'lg',
          value: initialValue?.kind === 'number' && initialValue.value ? Number(initialValue.value) : null,
          onChange: (payload) => {
            this._orValues[index] = { kind: 'number', value: payload.value == null ? '' : String(payload.value) };
            this._updateSummary();
          },
        });
      } else if (this._opts.dataType === 'datetime') {
        ArvoDatePicker.initialize(valueHost, {
          placeholder: 'MM/dd/yyyy', width: '100%', surface: 'filled', size: 'lg',
          value: initialValue?.kind === 'date' && initialValue.value ? initialValue.value : null,
          onChange: (payload) => {
            this._orValues[index] = { kind: 'date', value: payload.formattedValue ?? '' };
            this._updateSummary();
          },
        });
      } else if (this._opts.dataType === 'picklist') {
        ArvoMultiSelectV2.initialize(valueHost, {
          items: this._valueItems,
          placeholder: 'Select values',
          width: '100%',
          isFullWidth: true,
          onChange: (values) => {
            this._orValues[index] = { kind: 'multi', value: values.map((value) => String(value)) };
            this._updateSummary();
          },
        });
      } else if (this._opts.dataType === 'boolean') {
        ArvoRadioGroup.initialize(valueHost, {
          name: `${this._opts.label.replace(/\W+/g, '-').toLowerCase()}-or-bool-${index}`,
          label: null,
          orientation: 'horizontal',
          size: 'lg',
          items: [{ value: 'true', label: 'True', isChecked: true }, { value: 'false', label: 'False' }],
          value: 'true',
          onChange: (detail) => {
            this._orValues[index] = { kind: 'boolean', value: String(detail.value) };
            this._updateSummary();
          },
        });
      } else {
        ArvoTextbox.initialize(valueHost, {
          placeholder: 'Enter value', width: '100%', surface: 'filled', size: 'lg',
          value: initialValue?.kind === 'text' ? initialValue.value : '',
          onChange: (event) => {
            const target = event.target as HTMLInputElement | null;
            this._orValues[index] = { kind: 'text', value: target?.value ?? '' };
            this._updateSummary();
          },
        });
      }
      requestAnimationFrame(() => valueHost.querySelector('input')?.focus());
      row.scrollIntoView({ block: 'nearest' });
      },
    });
    this._valueHost.parentElement?.parentElement?.appendChild(this._addValueButton);
  }

  private _syncSecondRow(firstOperator: string): void {
    if (!this._valuesPane || !this._operatorHost || !this._valueHost) return;
    const needsRow2 = ['>', '<', '>=', '<='].includes(firstOperator);
    const complementMap: Record<string, { label: string; items: OperatorOption[] }> = {
      '>': { label: '<', items: this._operatorItems.filter((item) => ['<', '<='].includes(String(item.value))) },
      '<': { label: '>', items: this._operatorItems.filter((item) => ['>', '>='].includes(String(item.value))) },
      '>=': { label: '<=', items: this._operatorItems.filter((item) => ['<', '<='].includes(String(item.value))) },
      '<=': { label: '>=', items: this._operatorItems.filter((item) => ['>', '>='].includes(String(item.value))) },
    };
    const config = complementMap[firstOperator];
    if (!needsRow2 || !config) {
      this._selectedOperator2Label = '';
      this._row2Value = null;
      if (this._row2El) this._row2El.hidden = true;
      return;
    }

    if (!this._row2El) {
      this._row2El = document.createElement('div');
      this._row2El.className = 'arvo-pg-smart-input__row2';
      this._row2El.innerHTML = `
        <div class="arvo-pg-smart-input__grid">
          <div>
            <div class="arvo-pg-smart-input__operator-host arvo-pg-smart-input__operator-host--row2"></div>
          </div>
          <div>
            <div class="arvo-pg-smart-input__value-host arvo-pg-smart-input__value-host--row2"></div>
          </div>
        </div>
      `;
      this._valuesPane.appendChild(this._row2El);
      this._row2OperatorHost = this._row2El.querySelector('.arvo-pg-smart-input__operator-host--row2') as HTMLDivElement;
      this._row2ValueHost = this._row2El.querySelector('.arvo-pg-smart-input__value-host--row2') as HTMLDivElement;
    }
    this._row2El.hidden = false;
    this._row2OperatorSelect?.destroy();
    this._row2OperatorSelect = ArvoSelect.initialize(this._row2OperatorHost as HTMLDivElement, {
      items: config.items,
      placeholder: config.label,
      size: 'lg',
      surface: 'filled',
      width: '100%',
      placement: 'bottom-start',
      closeOnSelect: true,
      onChange: (item) => {
        this._selectedOperator2Label = String(item.value ?? item.label);
        this._renderRow2Value(config.label);
        this._updateSummary();
      },
    });
    this._selectedOperator2Label = config.label;
    this._renderRow2Value(config.label);
  }

  private _renderRow2Value(operatorLabel: string): void {
    if (!this._row2ValueHost) return;
    const isNullOp = operatorLabel === 'Null' || operatorLabel === '!Null';
    const isBetween = operatorLabel === 'Between' || operatorLabel === '!Between';
    this._row2ValueHost.textContent = '';

    if (this._opts.dataType === 'integer') {
      if (isBetween) {
        const wrap = document.createElement('div');
        wrap.className = 'arvo-pg-smart-input__dual';
        wrap.style.display = 'grid';
        wrap.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
        wrap.style.gap = '12px';
        const first = document.createElement('div');
        const second = document.createElement('div');
        wrap.append(first, second);
        this._row2ValueHost.appendChild(wrap);
        ArvoNumberInput.initialize(first as HTMLDivElement, {
          placeholder: isNullOp ? '' : 'from',
          width: '100%',
          surface: 'filled',
          size: 'lg',
          isDisabled: isNullOp,
          value: this._row2Value?.kind === 'number' ? Number(this._row2Value.value || null) : null,
          onChange: (payload) => {
            const prev = this._row2Value?.kind === 'number' ? this._row2Value : null;
            this._setRow2Value({
              kind: 'number',
              value: payload.value == null ? '' : String(payload.value),
              value2: prev?.value2,
            });
          },
        });
        ArvoNumberInput.initialize(second as HTMLDivElement, {
          placeholder: isNullOp ? '' : 'to',
          width: '100%',
          surface: 'filled',
          size: 'lg',
          isDisabled: isNullOp,
          value: this._row2Value?.kind === 'number' ? Number(this._row2Value.value2 || null) : null,
          onChange: (payload) => {
            const prev = this._row2Value?.kind === 'number' ? this._row2Value : null;
            this._setRow2Value({
              kind: 'number',
              value: prev?.value ?? '',
              value2: payload.value == null ? '' : String(payload.value),
            });
          },
        });
      } else {
        const host = document.createElement('div');
        this._row2ValueHost.appendChild(host);
        ArvoNumberInput.initialize(host as HTMLDivElement, {
          placeholder: isNullOp ? '' : 'Enter value',
          width: '100%',
          surface: 'filled',
          size: 'lg',
          isDisabled: isNullOp,
          value: this._row2Value?.kind === 'number' ? Number(this._row2Value.value || null) : null,
          onChange: (payload) => {
            this._setRow2Value({
              kind: 'number',
              value: payload.value == null ? '' : String(payload.value),
            });
          },
        });
      }
      return;
    }

    if (this._opts.dataType === 'datetime') {
      const host = document.createElement('div');
      this._row2ValueHost.appendChild(host);
      if (isBetween) {
        ArvoDateRangePicker.initialize(host, {
          startValue: this._row2Value?.kind === 'date' ? this._row2Value.value || null : null,
          endValue: this._row2Value?.kind === 'date' ? this._row2Value.value2 || null : null,
          placeholder: isNullOp ? '' : 'dd-MM-yyyy',
          size: 'lg',
          surface: 'filled',
          width: '100%',
          placement: 'bottom-start',
          isAutoClose: true,
          isDisabled: isNullOp,
          onChange: (payload) => {
            this._setRow2Value({
              kind: 'date',
              value: payload.formatted.start ?? '',
              value2: payload.formatted.end ?? '',
            });
          },
        });
      } else {
        ArvoDatePicker.initialize(host as HTMLDivElement, {
          value: this._row2Value?.kind === 'date' ? this._row2Value.value || null : null,
          placeholder: isNullOp ? '' : 'MM/dd/yyyy',
          size: 'lg',
          surface: 'filled',
          width: '100%',
          placement: 'bottom-start',
          isAutoClose: true,
          isDisabled: isNullOp,
          onChange: (payload) => {
            this._setRow2Value({
              kind: 'date',
              value: payload.formattedValue ?? '',
            });
          },
        });
      }
      return;
    }

    if (this._opts.dataType === 'picklist') {
      const host = document.createElement('div');
      this._row2ValueHost.appendChild(host);
      ArvoMultiSelectV2.initialize(host, {
        items: this._valueItems,
        value: this._row2Value?.kind === 'multi' ? this._row2Value.value : undefined,
        placeholder: isNullOp ? '' : 'Select values',
        width: '100%',
        isFullWidth: true,
        isDisabled: isNullOp,
        onChange: (value) => {
          this._setRow2Value({
            kind: 'multi',
            value: value.map((item) => String(item)),
          });
        },
      });
      return;
    }

    if (this._opts.dataType === 'boolean') {
      const host = document.createElement('div');
      this._row2ValueHost.appendChild(host);
      ArvoRadioGroup.initialize(host, {
        name: `${this._opts.label.replace(/\W+/g, '-').toLowerCase()}-bool-row2`,
        label: null,
        orientation: 'horizontal',
        labelPosition: 'top',
        size: 'lg',
        items: [
          { value: 'true', label: 'True', isChecked: true },
          { value: 'false', label: 'False' },
        ],
        isDisabled: isNullOp,
        value: 'true',
        onChange: (detail) => {
          this._setRow2Value({
            kind: 'boolean',
            value: detail.value,
          });
        },
      });
      return;
    }

    const host = document.createElement('div');
    this._row2ValueHost.appendChild(host);
    ArvoTextbox.initialize(host as HTMLDivElement, {
      placeholder: isNullOp ? '' : 'Enter value',
      width: '100%',
      surface: 'filled',
      size: 'lg',
      isDisabled: isNullOp,
      value: this._row2Value?.kind === 'text' ? this._row2Value.value : '',
      onChange: (event) => {
        const target = event.target as HTMLInputElement | null;
        this._setRow2Value({
          kind: 'text',
          value: target?.value ?? '',
        });
      },
    });
  }

  private _updateSummary(): void {
    const parts: string[] = [];
    const measureMode = this._activeTab === 'measures' && this._selectedComparedMeasureLabel;
    if (measureMode) {
      parts.push(this._selectedOperatorLabel, this._selectedComparedMeasureLabel);
    } else if (this._selectedMeasureLabel) {
      parts.push(this._selectedMeasureLabel);
    }
    if (!measureMode && this._hasRowValue(this._row1Value)) {
      parts.push(this._selectedOperatorLabel);
      const row1 = this._formatRowValue(this._row1Value);
      if (row1) parts.push(row1);
    }
    if (!measureMode && this._hasRowValue(this._row2Value)) {
      parts.push('AND', this._selectedOperator2Label);
      const row2 = this._formatRowValue(this._row2Value);
      if (row2) parts.push(row2);
    }
    for (const value of measureMode ? [] : this._orValues) {
      if (this._hasRowValue(value)) parts.push('OR', this._selectedOperatorLabel, this._formatRowValue(value));
    }
    this._summaryText = parts.join(' ').trim();
  }
}
