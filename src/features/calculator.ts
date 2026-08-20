const BTN_LAYOUT: { label: string; type: 'digit' | 'op' | 'eq' | 'clear' | 'dot' | 'sign' | 'percent' }[] = [
  { label: 'C', type: 'clear' },
  { label: '\u00b1', type: 'sign' },
  { label: '%', type: 'percent' },
  { label: '\u00f7', type: 'op' },
  { label: '7', type: 'digit' },
  { label: '8', type: 'digit' },
  { label: '9', type: 'digit' },
  { label: '\u00d7', type: 'op' },
  { label: '4', type: 'digit' },
  { label: '5', type: 'digit' },
  { label: '6', type: 'digit' },
  { label: '\u2212', type: 'op' },
  { label: '1', type: 'digit' },
  { label: '2', type: 'digit' },
  { label: '3', type: 'digit' },
  { label: '+', type: 'op' },
  { label: '0', type: 'digit', },
  { label: '.', type: 'dot' },
  { label: '=', type: 'eq' },
];

export function calculatorHtml(): string {
  const buttons = BTN_LAYOUT.map((b, i) => {
    const wide = b.label === '0';
    return `<button type="button" class="calc__btn calc__btn--${b.type}${wide ? ' calc__btn--wide' : ''}" data-idx="${i}">${b.label}</button>`;
  }).join('');
  return `
    <div class="calc">
      <div class="calc__display"><span data-calc-expr class="calc__expr"></span><span data-calc-value class="calc__value">0</span></div>
      <div class="calc__grid">${buttons}</div>
    </div>
  `;
}

export function mountCalculator(root: HTMLElement) {
  const valueEl = root.querySelector<HTMLElement>('[data-calc-value]')!;
  const exprEl = root.querySelector<HTMLElement>('[data-calc-expr]')!;

  let current = '0';
  let previous: number | null = null;
  let pendingOp: string | null = null;
  let justEvaluated = false;

  function render() {
    valueEl.textContent = current;
    exprEl.textContent = previous !== null && pendingOp ? `${formatNum(previous)} ${pendingOp}` : '';
  }

  function formatNum(n: number) {
    if (!isFinite(n)) return 'Error';
    const rounded = Math.round(n * 1e10) / 1e10;
    return String(rounded);
  }

  function apply(op: string, a: number, b: number): number {
    switch (op) {
      case '+':
        return a + b;
      case '\u2212':
        return a - b;
      case '\u00d7':
        return a * b;
      case '\u00f7':
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  }

  function inputDigit(d: string) {
    if (justEvaluated) {
      current = d;
      justEvaluated = false;
    } else {
      current = current === '0' ? d : current + d;
    }
  }

  function inputDot() {
    if (justEvaluated) {
      current = '0.';
      justEvaluated = false;
      return;
    }
    if (!current.includes('.')) current += '.';
  }

  function inputOp(op: string) {
    const value = parseFloat(current);
    if (previous !== null && pendingOp && !justEvaluated) {
      previous = apply(pendingOp, previous, value);
      current = formatNum(previous);
    } else {
      previous = value;
    }
    pendingOp = op;
    justEvaluated = false;
    current = '0';
  }

  function evaluate() {
    if (pendingOp === null || previous === null) return;
    const value = parseFloat(current);
    const result = apply(pendingOp, previous, value);
    current = formatNum(result);
    previous = null;
    pendingOp = null;
    justEvaluated = true;
  }

  function clear() {
    current = '0';
    previous = null;
    pendingOp = null;
    justEvaluated = false;
  }

  function sign() {
    if (current !== '0') current = current.startsWith('-') ? current.slice(1) : `-${current}`;
  }

  function percent() {
    current = formatNum(parseFloat(current) / 100);
  }

  root.querySelectorAll<HTMLButtonElement>('.calc__btn').forEach((btn) => {
    const idx = Number(btn.dataset.idx);
    const def = BTN_LAYOUT[idx];
    btn.addEventListener('click', () => {
      switch (def.type) {
        case 'digit':
          inputDigit(def.label);
          break;
        case 'dot':
          inputDot();
          break;
        case 'op':
          inputOp(def.label);
          break;
        case 'eq':
          evaluate();
          break;
        case 'clear':
          clear();
          break;
        case 'sign':
          sign();
          break;
        case 'percent':
          percent();
          break;
      }
      render();
    });
  });

  render();
}
