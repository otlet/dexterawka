export const STATUS = Object.freeze({ active: 'Kurierzy platformowi', recruiting: 'Formularz kurierski', announced: 'Zapowiedziana', unverified: 'Do weryfikacji', inactive: 'Wycofana' });
export const EVIDENCE_SCOPE = Object.freeze({ platform_couriers: 'Zlecenia dla kurierów platformy', courier_form: 'Miasto w formularzu kurierskim', customer_catalog: 'Tylko katalog dla zamawiających', unknown: 'Model dostaw niepotwierdzony' });
// Old drafts and consumer catalogs must not imply that platform couriers can work here.
export const recordStatus = record => record.status === 'active' && record.evidenceScope !== 'platform_couriers'
  || record.status === 'recruiting' && record.evidenceScope !== 'courier_form' ? 'unverified' : record.status;
export const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L').toLocaleLowerCase('pl');
export const slug = value => normalize(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const safeUrl = value => { try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password ? u.href : ''; } catch { return ''; } };
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const text = (v, max = 1000) => typeof v === 'string' && v.length <= max;
export function validateData(data) {
  const fail = message => { throw new Error(message); };
  if (!data || data.schemaVersion !== 1 || !Array.isArray(data.cities) || !Array.isArray(data.apps)) fail('Nieprawidłowy format bazy (schemaVersion: 1).');
  if (!validDate(data.updatedAt)) fail('Nieprawidłowa data bazy.');
  if (data.apps.length < 1 || data.apps.length > 20 || data.cities.length > 10000) fail('Nieprawidłowy rozmiar bazy.');
  const ids = new Set();
  for (const a of data.apps) {
    if (!a || !text(a.id,41) || !/^[a-z][a-z0-9-]{0,40}$/.test(a.id) || ['constructor','prototype'].includes(a.id) || ids.has(a.id)) fail('Powtórzony lub nieprawidłowy identyfikator aplikacji.');
    if (!text(a.name, 50) || !a.name.trim() || !text(a.short, 5) || !/^#[0-9a-f]{6}$/i.test(a.color) || !safeUrl(a.source) || !text(a.scope, 3000)) fail('Nieprawidłowe dane aplikacji: ' + a.id);
    if (a.additionalSources && (!Array.isArray(a.additionalSources) || a.additionalSources.some(s => !safeUrl(s)))) fail('Nieprawidłowe źródła aplikacji.');
    ids.add(a.id);
  }
  const cities = new Set(), names = new Set();
  for (const c of data.cities) {
    if (!c || !text(c.id,81) || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(c.id) || cities.has(c.id)) fail('Powtórzony lub nieprawidłowy identyfikator miejscowości.');
    if (!text(c.name, 100) || !c.name.trim() || !text(c.region, 80) || !c.region.trim()) fail('Brak nazwy miejscowości lub województwa.');
    const nameKey = normalize(c.name.trim()) + '|' + normalize(c.region.trim());
    if (names.has(nameKey)) fail('Miejscowość już istnieje w tym województwie: ' + c.name);
    names.add(nameKey); cities.add(c.id);
    if (!Number.isFinite(c.lat) || !Number.isFinite(c.lon) || c.lat < 48.9 || c.lat > 55 || c.lon < 14 || c.lon > 24.3) fail('Współrzędne poza Polską: ' + c.name);
    if (!c.apps || Array.isArray(c.apps) || typeof c.apps !== 'object') fail('Nieprawidłowe aplikacje miejscowości.');
    for (const [id, r] of Object.entries(c.apps)) {
      if (!ids.has(id) || !r || !Object.hasOwn(STATUS, r.status) || !validDate(r.checkedAt) || !safeUrl(r.source) || !text(r.note ?? '', 3000) || !text(r.sourceLabel ?? '', 200) || !text(r.sourceDetail ?? '', 1000)) fail('Nieprawidłowy status, data lub źródło: ' + c.name + ' / ' + id);
      if (r.evidenceScope !== undefined && !Object.hasOwn(EVIDENCE_SCOPE, r.evidenceScope)) fail('Nieprawidłowy zakres potwierdzenia: ' + c.name + ' / ' + id);
    }
  }
  return data;
}
export function visibleRecords(city, includeRecruiting = false) {
  return Object.entries(city.apps).filter(([, r]) => recordStatus(r) === 'active' || (includeRecruiting && recordStatus(r) === 'recruiting'));
}
export function matches(city, { query = '', region = '', selected = [], mode = 'any', recruiting = false } = {}) {
  if (query && !normalize(city.name).includes(normalize(query.trim()))) return false;
  if (region && city.region !== region) return false;
  const available = visibleRecords(city, recruiting).map(([id]) => id);
  return selected.length ? (mode === 'all' ? selected.every(id => available.includes(id)) : selected.some(id => available.includes(id))) : available.length > 0;
}
export function upsertCity(data, city, updatedAt) {
  const copy = structuredClone(data);
  const index = copy.cities.findIndex(c => c.id === city.id);
  if (index < 0) copy.cities.push(structuredClone(city)); else copy.cities[index] = structuredClone(city);
  copy.updatedAt = updatedAt;
  copy.cities.sort((a, b) => a.name.localeCompare(b.name, 'pl'));
  return validateData(copy);
}
export function toCSV(data) {
  const quote = value => '"' + String(value ?? '').replace(/^[\s]*[=+@-]/, m => "'" + m).replace(/"/g, '""') + '"';
  const rows = [['miejscowość','województwo','latitude','longitude','aplikacja','status']];
  for (const c of data.cities) for (const a of data.apps) { const r = c.apps[a.id]; if (r) rows.push([c.name,c.region,c.lat,c.lon,a.name,STATUS[recordStatus(r)]]); }
  return '\uFEFF' + rows.map(row => row.map(quote).join(';')).join('\r\n');
}
