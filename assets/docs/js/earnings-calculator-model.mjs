// Percentage deductions reproduce the simplified model of the reference
// calculator. They are estimates, not a complete payroll or annual PIT engine.
export const PLATFORMS = Object.freeze([
  { id: 'glovo', label: 'Glovo', feeCents: 492 },
  { id: 'uber-eats', label: 'Uber Eats', feeCents: 0 },
  { id: 'wolt', label: 'Wolt', feeCents: 0 },
  { id: 'pyszne', label: 'Pyszne.pl', feeCents: 0 },
  { id: 'bolt-food', label: 'Bolt Food', feeCents: 0 },
  { id: 'stuart', label: 'Stuart', feeCents: 0 },
]);

const STATUSES = Object.freeze([
  { id: 'employed', label: 'Osoba pracująca w innej firmie', standard: 1872, stuart: 1872 },
  { id: 'young-employed', label: 'Praca w innej firmie, poniżej 26 lat', standard: 900, stuart: 900 },
  { id: 'student', label: 'Student / uczeń poniżej 26 lat', standard: 0, stuart: 0 },
  { id: 'unemployed-ppk', label: 'Bez innej pracy, z PPK', standard: 2982, stuart: 4861 },
  { id: 'unemployed-no-ppk', label: 'Bez innej pracy, po rezygnacji z PPK', standard: 2782, stuart: 4511 },
  { id: 'young-unemployed-ppk', label: 'Bez innej pracy, poniżej 26 lat, z PPK', standard: 2125, stuart: 4004 },
  { id: 'young-unemployed-no-ppk', label: 'Bez innej pracy, poniżej 26 lat, bez PPK', standard: 1925, stuart: null },
  { id: 'b2b-ryczalt', label: 'B2B - Ryczałt', standard: 850, stuart: 850, b2b: true },
  { id: 'b2b-skala', label: 'B2B - Skala podatkowa', standard: 1200, stuart: 1200, b2b: true },
]);

export function getStatuses(platformId) {
  if (!PLATFORMS.some(platform => platform.id === platformId)) {
    throw new RangeError('Nieznana platforma.');
  }
  const rateKey = platformId === 'stuart' ? 'stuart' : 'standard';
  return STATUSES.filter(status => status[rateKey] !== null).map(status => ({
    id: status.id,
    label: status.label,
    rateBps: status[rateKey],
    b2b: Boolean(status.b2b),
  }));
}

export const MAX_CENTS = 99999999999;

// Accept Polish and dot decimal separators; keep all calculations in grosze.
export function parseMoney(value, { optional = false } = {}) {
  const normalized = String(value).replace(/[\s\u00a0\u202f]/g, '');
  if (!normalized) return optional ? 0 : null;
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(normalized)) return NaN;
  const [whole, fraction = ''] = normalized.replace(',', '.').split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents <= MAX_CENTS ? cents : NaN;
}

export function calculateEarnings({ platformId, statusId, incomeCents, cashCents = 0 }) {
  const platform = PLATFORMS.find(item => item.id === platformId);
  const status = getStatuses(platformId).find(item => item.id === statusId);
  if (!status) throw new RangeError('Nieznany status dla tej platformy.');
  for (const value of [incomeCents, cashCents]) {
    if (!Number.isSafeInteger(value) || value < 0 || value > MAX_CENTS) {
      throw new RangeError('Kwota musi być nieujemna i podana w groszach.');
    }
  }
  const taxCents = Math.round(incomeCents * status.rateBps / 10000);
  const appFeeCents = incomeCents > 0 ? platform.feeCents : 0;
  const profitCents = incomeCents - taxCents - appFeeCents;
  const transferCents = profitCents - cashCents;
  return { incomeCents, taxCents, appFeeCents, cashCents, transferCents, profitCents, ...status };
}
