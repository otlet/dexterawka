import { calculateEarnings, getStatuses, parseMoney } from './earnings-calculator-model.mjs';

const root = document.querySelector('[data-earnings-calculator]');
if (root) {
  const form = root.querySelector('form');
  const platform = form.elements.platform;
  const status = form.elements.status;
  const income = form.elements.income;
  const cash = form.elements.cash;
  const currency = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' });
  const percent = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 });
  const money = cents => currency.format(cents / 100);
  const field = name => root.querySelector(`[data-result="${name}"]`);
  const write = (name, value) => { field(name).textContent = value; };
  const deduction = cents => cents > 0 ? `−${money(cents)}` : money(0);

  function updateStatuses() {
    const previous = status.value;
    const options = getStatuses(platform.value).map(item => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = `${item.label} (${percent.format(item.rateBps / 100)}%)`;
      return option;
    });
    status.replaceChildren(...options);
    status.value = options.some(option => option.value === previous) ? previous : 'employed';
  }

  function readAmount(input, optional) {
    const amount = parseMoney(input.value, { optional });
    const invalid = Number.isNaN(amount);
    const message = invalid ? 'Wpisz nieujemną kwotę do 999 999 999,99 zł, z maksymalnie dwoma miejscami po przecinku.' : '';
    input.setAttribute('aria-invalid', String(invalid));
    input.setCustomValidity(message);
    root.querySelector(`#${input.id}-error`).textContent = message;
    return amount;
  }

  function render() {
    const selected = getStatuses(platform.value).find(item => item.id === status.value);
    const rate = `${percent.format(selected.rateBps / 100)}%`;
    const b2b = selected.b2b;
    root.querySelector('[data-b2b-note]').hidden = !b2b;
    root.querySelector('[data-scale-note]').hidden = selected.id !== 'b2b-skala';
    root.querySelector('[data-glovo-hint]').hidden = platform.value !== 'glovo';
    root.querySelector('[data-glovo-row]').hidden = platform.value !== 'glovo';
    root.querySelector('[data-stuart-note]').hidden = platform.value !== 'stuart' || b2b;
    write('tax-label', b2b ? `Podatek dochodowy do zapłaty (${rate})` : `Podatek i składki / PPK (${rate})`);
    write('transfer-label', b2b ? 'Po odłożeniu podatku i rozliczeniu gotówki' : 'Przelew na konto');
    write('profit-label', b2b ? 'Zarobek po podatku i opłatach' : 'Zarobek po potrąceniach');
    write('rate', rate);

    const incomeCents = readAmount(income, false);
    const cashCents = readAmount(cash, true);
    const ready = incomeCents !== null && Number.isFinite(incomeCents) && Number.isFinite(cashCents);
    root.querySelector('[data-empty-note]').hidden = ready;
    root.querySelector('[data-equations]').hidden = !ready;
    root.querySelector('[data-negative-note]').hidden = true;
    for (const name of ['income', 'tax', 'app-fee', 'cash', 'transfer', 'profit']) write(name, '—');
    if (!ready) return;

    const result = calculateEarnings({ platformId: platform.value, statusId: status.value, incomeCents, cashCents });
    write('income', money(result.incomeCents));
    write('tax', deduction(result.taxCents));
    write('app-fee', deduction(result.appFeeCents));
    write('cash', deduction(result.cashCents));
    write('transfer', money(result.transferCents));
    write('profit', money(result.profitCents));
    write('tax-equation', `${money(result.incomeCents)} × ${rate} = ${money(result.taxCents)}`);
    write('profit-equation', `${money(result.incomeCents)} − ${money(result.taxCents)} − ${money(result.appFeeCents)} = ${money(result.profitCents)}`);
    write('transfer-equation', `${money(result.profitCents)} − ${money(result.cashCents)} = ${money(result.transferCents)}`);
    root.querySelector('[data-negative-note]').hidden = result.transferCents >= 0;
  }

  platform.addEventListener('change', () => { updateStatuses(); render(); });
  status.addEventListener('change', render);
  income.addEventListener('input', render);
  cash.addEventListener('input', render);
  form.addEventListener('submit', event => { event.preventDefault(); render(); });
  updateStatuses();
  render();
}
