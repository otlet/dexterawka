import { STATUS, EVIDENCE_SCOPE, recordStatus, normalize, slug, validateData, visibleRecords, matches, upsertCity, toCSV } from './delivery-map-model.mjs';

// __DELIVERY_MAP_EDITABLE__ ustawia layout: true tylko w środowisku development.
// W buildzie produkcyjnym esbuild wycina cały kod edytora, kopii roboczych i eksportów.

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const NS = 'http://www.w3.org/2000/svg';
const STORE = 'kurierpedia.delivery-map.draft.v1';
const regions = ['dolnośląskie','kujawsko-pomorskie','lubelskie','lubuskie','łódzkie','małopolskie','mazowieckie','opolskie','podkarpackie','podlaskie','pomorskie','śląskie','świętokrzyskie','warmińsko-mazurskie','wielkopolskie','zachodniopomorskie'];
const state = { query: '', region: '', selected: [], mode: 'any', recruiting: false, city: null };
let published, data, geography, filtered = [], draft = false, editingId = null, dirty = false;
let view = { x: 0, y: 0, w: 920, h: 900 }, drag = null, pendingFrame = 0;
const svg = $('#poland-map');
const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const dateLabel = value => new Intl.DateTimeFormat('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value + 'T12:00:00'));
const mercator = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * 180 / Math.PI;
const project = (lon, lat) => [(lon - 13.2) * 80, (mercator(55.1) - mercator(lat)) * 80 + 20];
const appIcons = JSON.parse($('#delivery-map-icons')?.textContent || '{}');
const logo = app => appIcons[app.id]
  ? `<img class="app-logo" src="${esc(appIcons[app.id])}" width="34" height="34" alt="" aria-hidden="true">`
  : `<span class="app-logo app-logo-fallback" style="--app-color:${app.color}" aria-hidden="true">${esc(app.short)}</span>`;
const appById = id => data.apps.find(a => a.id === id);
const activeCount = city => visibleRecords(city, false).length;
const countLabel = count => count===1?'potwierdzona aplikacja':count%10>=2&&count%10<=4&&(count%100<12||count%100>14)?'potwierdzone aplikacje':'potwierdzonych aplikacji';
// Stała kolejność wycinków. Sąsiednie kolory są sprawdzone walidatorem palety, także pod kątem daltonizmu.
const SLICE_ORDER = ['wolt','pyszne','uber-eats','stuart','glovo','bolt-food','jush'];
const markerApps = city => visibleRecords(city, state.recruiting).map(([id]) => appById(id)).filter(Boolean).sort((a, b) => SLICE_ORDER.indexOf(a.id) - SLICE_ORDER.indexOf(b.id));
const jsonString = () => JSON.stringify(data, null, 2) + '\n';
function element(name, attrs = {}, parent) {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (parent) parent.append(node);
  return node;
}
function showError(message) { $('#load-error').textContent = message; $('#load-error').hidden = false; }
function editorMessage(message, error = false) { $('#editor-message').textContent = message; $('#editor-message').classList.toggle('error', error); }
function download(content, name, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function persist(next) {
  validateData(next);
  try { localStorage.setItem(STORE, JSON.stringify(next)); }
  catch { throw new Error('Przeglądarka nie pozwala zapisać kopii roboczej. Włącz pamięć witryny i spróbuj ponownie.'); }
  data = next; draft = true;
}
function drawGeography() {
  const group = $('#map-geography'); group.replaceChildren();
  const features = [...geography.features].sort((a, b) => (a.properties.kind === 'region') - (b.properties.kind === 'region'));
  for (const feature of features) {
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    let d = '';
    for (const polygon of polygons) for (const ring of polygon) d += ring.map((p, i) => (i ? 'L' : 'M') + project(...p).map(n => n.toFixed(2)).join(',')).join('') + 'Z';
    const path = element('path', { d, class: feature.properties.kind + '-shape', 'fill-rule': 'evenodd' }, group);
    const title = element('title', {}, path); title.textContent = feature.properties.name;
  }
  const labels = $('#map-country-labels'); labels.replaceChildren();
  for (const [name, lon, lat, rotation] of [['MORZE BAŁTYCKIE',17.9,55,0],['NIEMCY',13.8,52.3,-90],['CZECHY',16,49.9,0],['SŁOWACJA',19.9,48.75,0],['UKRAINA',24.3,50.7,-90],['BIAŁORUŚ',24.4,53,-90],['LITWA',23.5,54.6,0]]) {
    const [x,y] = project(lon,lat); const text = element('text',{x,y,class:'country-label','text-anchor':'middle',transform:`rotate(${rotation} ${x} ${y})`},labels); text.textContent=name;
  }
}
// Jednostka rozmiaru kropek: piksel ekranu przeliczony na viewBox. Na wąskiej mapie kropki są nieco mniejsze, żeby się nie zlewały.
function markerUnit() {
  const box = svg.getBoundingClientRect();
  if (!box.width || !box.height) return view.w/920;
  return Math.max(view.w/box.width, view.h/box.height) * Math.max(.75, Math.min(1, box.width/480));
}
// Jedna aplikacja to pełne koło w jej kolorze, kilka aplikacji to równe wycinki po jednym na aplikację.
function drawMarkerDot(group, apps, radius) {
  if (apps.length < 2) { element('circle',{r:radius,fill:apps[0]?.color||'var(--kp-muted)',class:'marker-dot'},group);return; }
  const step = 2*Math.PI/apps.length, point = angle => `${(Math.cos(angle)*radius).toFixed(3)} ${(Math.sin(angle)*radius).toFixed(3)}`;
  apps.forEach((app,i) => {
    const start = -Math.PI/2+i*step;
    element('path',{d:`M0 0L${point(start)}A${radius} ${radius} 0 0 1 ${point(start+step)}Z`,fill:app.color,class:'marker-slice'},group);
  });
  element('circle',{r:radius,fill:'none',class:'marker-dot'},group);
}
function drawMarkers() {
  const group = $('#map-markers'), labels = $('#map-labels'); group.replaceChildren(); labels.replaceChildren();
  const scale = view.w / 920, unit = markerUnit();
  const cities = [...filtered].sort((a,b) => (a.id === state.city) - (b.id === state.city) || activeCount(a)-activeCount(b));
  for (const city of cities) {
    const [x,y] = project(city.lon,city.lat), selected = city.id === state.city;
    if (x < view.x-40*scale || x > view.x+view.w+40*scale || y < view.y-40*scale || y > view.y+view.h+40*scale) continue;
    const count = activeCount(city), hasForm = state.recruiting && Object.values(city.apps).some(r => recordStatus(r) === 'recruiting');
    const apps = markerApps(city), names = apps.map(a => a.name).join(', ');
    // Więcej aplikacji to większy punkt, więc liczbę widać także bez rozróżniania kolorów.
    const radius = (4.5 + .6 * Math.max(0, apps.length-1) + (selected ? 1.5 : 0)) * unit;
    const g = element('g',{class:'city-marker',transform:`translate(${x} ${y})`,tabindex:0,role:'button','aria-label':`${city.name}: ${count} ${countLabel(count)}${names ? `: ${names}` : ''}${hasForm ? ', formularz kurierski' : ''}`,'data-city-id':city.id},group);
    if (selected) element('circle',{r:radius+6*unit,class:'selected-halo'},g);
    // Invisible hit target enlarges small points without implying delivery radii.
    element('circle',{r:radius+4*unit,fill:'transparent'},g);
    if (hasForm) element('circle',{r:radius+2.5*unit,class:'marker-ring'},g);
    drawMarkerDot(g,apps,radius);
    const title=element('title',{},g);title.textContent=names ? `${city.name}: ${names}` : city.name;
    g.addEventListener('click', () => selectCity(city.id));
    g.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault();selectCity(city.id);svg.querySelector(`[data-city-id="${city.id}"]`)?.focus(); } });
  }
  const occupied=[];
  const candidates = [...filtered].sort((a,b) => (b.id===state.city)-(a.id===state.city) || (b.population||0)-(a.population||0));
  for (const city of candidates) {
    const selected = city.id === state.city;
    if (!selected && (city.population||0) < (scale > .7 ? 90000 : scale > .4 ? 25000 : 0)) continue;
    const [x,y]=project(city.lon,city.lat), width=city.name.length*5.9*scale, height=14*scale;
    if (x < view.x+25*scale || x > view.x+view.w-25*scale || y < view.y+40*scale || y > view.y+view.h-45*scale) continue;
    const bounds={x:x-width/2,y:y+10*scale,w:width,h:height};
    if (!selected && occupied.some(b => b.x < bounds.x+bounds.w+7*scale && b.x+b.w+7*scale > bounds.x && b.y < bounds.y+bounds.h+7*scale && b.y+b.h+7*scale > bounds.y)) continue;
    occupied.push(bounds);
    const t=element('text',{x,y:y+22*scale,'text-anchor':'middle','font-size':(selected?13:11)*scale,'stroke-width':3*scale,class:'map-label'+(selected?' selected':'')},labels);t.textContent=city.name;
  }
}
function updateView() {
  svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);
  $('#zoom-in').disabled=view.w<=170; $('#zoom-out').disabled=view.w>=920;
  drawMarkers();
}
function zoom(factor) {
  const w=Math.max(170,Math.min(920,view.w*factor)),h=w*900/920;
  view={x:view.x+(view.w-w)/2,y:view.y+(view.h-h)/2,w,h};
  if (w===920) view={x:0,y:0,w:920,h:900};
  updateView();
}
function focusCity(city) {
  const [x,y]=project(city.lon,city.lat); const w=430,h=w*900/920;
  view={x:x-w/2,y:y-h/2,w,h};updateView();
}
function renderFilters() {
  $('#app-filters').innerHTML=data.apps.map(a => {
    const count=data.cities.filter(c=>visibleRecords(c,state.recruiting).some(([id])=>id===a.id)).length;
    return `<button class="app-filter" data-app="${a.id}" aria-pressed="${state.selected.includes(a.id)}" aria-label="Filtr ${esc(a.name)}, ${count} miejscowości">${logo(a)}<span>${esc(a.name)}</span><span class="app-count">${count}</span></button>`;
  }).join('');
  $('#all-apps').setAttribute('aria-pressed',String(!state.selected.length));
  const showForms=data.cities.some(c=>Object.values(c.apps).some(r=>recordStatus(r)==='recruiting'))?'':'none';
  for(const el of [$('.recruiting-toggle'),$('.legend-forms')])el.style.display=showForms;
  $('#map-legend-apps').innerHTML=data.apps.map(a=>`<span><i style="--app-color:${a.color}"></i>${esc(a.name)}</span>`).join('');
}
function renderList() {
  $('#city-list').innerHTML=filtered.length ? filtered.map(city => `<button class="city-row" data-select-city="${city.id}" aria-pressed="${city.id===state.city}"><span><strong>${esc(city.name)}</strong><small>${esc(city.region)}</small></span><span class="mini-dots" aria-hidden="true">${visibleRecords(city,state.recruiting).map(([id,r])=>`<i class="mini-dot ${r.status}" style="--app-color:${appById(id).color}"></i>`).join('')}</span></button>`).join('') : '<p class="empty-results">Brak potwierdzonych miejscowości dla tych filtrów. Możesz osobno włączyć formularze kurierskie.</p>';
  $('#result-count').textContent=filtered.length;
  $('#results-announcement').textContent=`Znaleziono ${filtered.length} miejscowości.`;
}
function renderDetails() {
  const city=data.cities.find(c=>c.id===state.city);
  if (!city) { $('#city-details').innerHTML='<p class="eyebrow">TWOJA MIEJSCOWOŚĆ</p><h2>Brak wyników</h2><p class="city-note">Żadna miejscowość nie pasuje do tego wyboru.</p>';return; }
  const records=data.apps.filter(a=>city.apps[a.id]), missing=data.apps.filter(a=>!city.apps[a.id]);
  $('#city-details').innerHTML=`<p class="eyebrow">TWOJA MIEJSCOWOŚĆ</p><h2>${esc(city.name)}</h2><p class="city-region">${esc(city.region)}</p><div class="city-summary"><strong>${activeCount(city)}</strong><span>${countLabel(activeCount(city))}</span></div><p class="detail-label">APLIKACJE</p><div class="detail-apps">${records.map(app=>{
    const r=city.apps[app.id], status=recordStatus(r);
    return `<div class="detail-app">${logo(app)}<div><strong>${esc(app.name)}</strong><span class="status ${status}">${esc(STATUS[status])}</span></div></div>`;
  }).join('')}</div>${missing.length?`<p class="no-evidence">Niedostępne tu dla kurierów flotowych: <b>${missing.map(a=>esc(a.name)).join(', ')}</b>.</p>`:''}${__DELIVERY_MAP_EDITABLE__?'<button class="edit-selected" id="edit-selected">✎ Zaktualizuj tę miejscowość</button>':''}`;
  if (__DELIVERY_MAP_EDITABLE__) $('#edit-selected').addEventListener('click',()=>openEditor(city.id));
}
function render() {
  data.cities.sort((a,b)=>a.name.localeCompare(b.name,'pl'));
  filtered=data.cities.filter(city=>matches(city,state));
  if (!filtered.some(c=>c.id===state.city)) state.city=filtered[0]?.id??null;
  $('#total-cities').textContent=data.cities.length;$('#total-apps').textContent=data.apps.length;
  $('#data-date').textContent='Baza z '+dateLabel(data.updatedAt);
  if (__DELIVERY_MAP_EDITABLE__) {
    $('#draft-banner').hidden=!draft;
    $('#draft-message').textContent=published.revision && data.revision!==published.revision
      ? 'Ta kopia robocza pochodzi z innej wersji bazy. W edytorze możesz ją pobrać i przywrócić aktualną bazę strony. Wpisy bez potwierdzenia pracy kurierów platformowych nie są wliczane do dostępności.'
      : 'Oglądasz kopię roboczą na tym urządzeniu. Zmiany nie są opublikowane.';
  }
  $('#map-subtitle').textContent=state.selected.length ? state.selected.map(id=>appById(id)?.name).filter(Boolean).join(' + ') : 'Wybierz punkt na mapie';
  renderFilters();renderList();renderDetails();drawMarkers();
}
function selectCity(id, focus=false) {
  state.city=id;
  renderList();renderDetails();
  if (focus) focusCity(data.cities.find(c=>c.id===id)); else drawMarkers();
}
function fillEditor(id) {
  editingId=id;dirty=false;
  const city=data.cities.find(c=>c.id===id), form=$('#city-form');
  $('#edit-city').innerHTML='<option value="">+ Nowa miejscowość</option>'+data.cities.map(c=>`<option value="${c.id}">${esc(c.name)} — ${esc(c.region)}</option>`).join('');
  $('#edit-city').value=id||'';
  for (const name of ['name','region','lat','lon']) form.elements[name].value=city?.[name]??'';
  $('#edit-apps').innerHTML=data.apps.map(a=>{
    const r=city?.apps[a.id];
    return `<fieldset class="edit-app" data-edit-app="${a.id}"><legend class="sr-only">${esc(a.name)}</legend><div class="edit-app-head">${logo(a)}<b>${esc(a.name)}</b></div><div class="edit-app-fields"><label>Status<select data-field="status"><option value="">Brak wpisu</option>${Object.entries(STATUS).map(([k,v])=>`<option value="${k}" ${r&&recordStatus(r)===k?'selected':''}>${esc(v)}</option>`).join('')}</select></label><label>Data sprawdzenia<input data-field="date" type="date" value="${r?.checkedAt||today()}"></label><label>Link do źródła<input data-field="source" type="url" value="${esc(r?.source||'')}" placeholder="https://…"></label></div><label>Co potwierdza źródło<select data-field="evidenceScope">${Object.entries(EVIDENCE_SCOPE).map(([k,v])=>`<option value="${k}" ${(r?.evidenceScope||'unknown')===k?'selected':''}>${esc(v)}</option>`).join('')}</select></label><div class="edit-source-fields"><label>Opis odnośnika<input data-field="sourceLabel" maxlength="200" value="${esc(r?.sourceLabel||'')}" placeholder="np. Glovo — Ciechanów"></label><label>Gdzie w źródle jest miasto<input data-field="sourceDetail" maxlength="1000" value="${esc(r?.sourceDetail||'')}" placeholder="np. sekcja Miasta → Ciechanów"></label></div><label class="edit-app-note">Uwagi<input data-field="note" maxlength="3000" value="${esc(r?.note||'')}" placeholder="np. start usługi, zakres strefy, ograniczenia źródła"></label></fieldset>`;
  }).join('');
  editorMessage('');$('#restore-published').dataset.confirm='';$('#restore-published').textContent='Przywróć bazę strony';
}
function openEditor(id=state.city) { fillEditor(id);$('#editor-dialog').showModal(); }
function closeDialog(dialog) {
  if (__DELIVERY_MAP_EDITABLE__ && dialog.id==='editor-dialog' && dirty) { editorMessage('Masz niezapisane zmiany w formularzu. Zapisz kopię roboczą lub kliknij zamknięcie ponownie, aby je odrzucić.',true);dirty=false;return; }
  dialog.close();
}
function wireEvents() {
  const regionOptions=regions.map(r=>`<option value="${r}">${r}</option>`).join('');
  $('#region-filter').insertAdjacentHTML('beforeend',regionOptions);
  $('#city-search').addEventListener('input',event=>{state.query=event.target.value;render();});
  $('#region-filter').addEventListener('change',event=>{state.region=event.target.value;render();});
  $('#include-recruiting').addEventListener('change',event=>{state.recruiting=event.target.checked;render();});
  $('#app-filters').addEventListener('click',event=>{const button=event.target.closest('[data-app]');if(!button)return;const id=button.dataset.app;state.selected=state.selected.includes(id)?state.selected.filter(a=>a!==id):[...state.selected,id];render();});
  $('#all-apps').addEventListener('click',()=>{state.selected=[];render();});
  $$('[data-mode]').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.mode;$$('[data-mode]').forEach(c=>c.setAttribute('aria-pressed',String(c===b)));render();}));
  $('#clear-filters').addEventListener('click',()=>{Object.assign(state,{query:'',region:'',selected:[],mode:'any',recruiting:false});$('#city-search').value='';$('#region-filter').value='';$('#include-recruiting').checked=false;$$('[data-mode]').forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.mode==='any')));view={x:0,y:0,w:920,h:900};render();updateView();});
  $('#city-list').addEventListener('click',event=>{const row=event.target.closest('[data-select-city]');if(row)selectCity(row.dataset.selectCity,true);});
  $('#zoom-in').addEventListener('click',()=>zoom(.72));$('#zoom-out').addEventListener('click',()=>zoom(1/.72));$('#zoom-reset').addEventListener('click',()=>{view={x:0,y:0,w:920,h:900};updateView();});
  svg.addEventListener('pointerdown',event=>{if(event.target.closest('.city-marker'))return;const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse());drag={id:event.pointerId,x:point.x,y:point.y,view:{...view}};svg.setPointerCapture(event.pointerId);svg.classList.add('dragging');});
  svg.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse());view.x=Math.max(-180,Math.min(1100-view.w,view.x+drag.x-point.x));view.y=Math.max(-180,Math.min(1080-view.h,view.y+drag.y-point.y));if(!pendingFrame)pendingFrame=requestAnimationFrame(()=>{pendingFrame=0;updateView();});});
  const endDrag=()=>{drag=null;svg.classList.remove('dragging');};svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);svg.addEventListener('lostpointercapture',endDrag);
  window.addEventListener('resize',()=>{if(!pendingFrame)pendingFrame=requestAnimationFrame(()=>{pendingFrame=0;drawMarkers();});});
  document.addEventListener('keydown',event=>{if(event.key==='/'&&!document.querySelector('dialog[open]')&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){event.preventDefault();$('#city-search').focus();}});
  if (__DELIVERY_MAP_EDITABLE__) wireEditor(regionOptions);
}
function wireEditor(regionOptions) {
  $$('[data-close]').forEach(b=>b.addEventListener('click',()=>closeDialog(b.closest('dialog'))));
  $$('dialog').forEach(dialog=>dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);}));
  $('#city-form').elements.region.innerHTML='<option value="">Wybierz województwo</option>'+regionOptions;
  for(const id of ['editor-open','draft-editor'])$('#'+id).addEventListener('click',()=>openEditor());
  $('#export-json').addEventListener('click',()=>{if(dirty){editorMessage('Najpierw zapisz zmiany w formularzu. Eksport obejmuje zapisaną kopię roboczą.',true);return;}download(jsonString(),'delivery-map.json','application/json');editorMessage('Pobrano bazę JSON. Zastąp plik w projekcie i opublikuj stronę, aby udostępnić zmiany.');});
  $('#export-csv').addEventListener('click',()=>download(toCSV(data),'mapa-delivery.csv','text/csv;charset=utf-8'));
  $('#import-json').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try{if(file.size>8*1024*1024)throw new Error('Plik jest zbyt duży (maks. 8 MB).');const next=validateData(JSON.parse(await file.text()));
      if(dirty)throw new Error('Zapisz zmiany w formularzu przed importem.');
      if(draft)download(jsonString(),'delivery-map-przed-importem.json','application/json');
      persist(next);state.selected=state.selected.filter(id=>data.apps.some(a=>a.id===id));render();fillEditor(state.city);editorMessage('Wczytano poprawną bazę jako lokalną kopię roboczą.');
    }catch(error){editorMessage('Import odrzucony: '+error.message,true);}finally{event.target.value='';}
  });
  $('#restore-published').addEventListener('click',event=>{
    const b=event.currentTarget;if(!b.dataset.confirm){b.dataset.confirm='yes';b.textContent='Potwierdź przywrócenie';editorMessage('Drugie kliknięcie przywróci bazę strony. Zapisana kopia zostanie wcześniej pobrana jako plik. Niezapisany formularz zostanie odrzucony.',true);return;}
    try{if(draft)download(jsonString(),'delivery-map-kopia-przed-przywroceniem.json','application/json');localStorage.removeItem(STORE);data=structuredClone(published);draft=false;state.selected=state.selected.filter(id=>data.apps.some(a=>a.id===id));render();fillEditor(state.city);editorMessage('Przywrócono bazę dostarczoną ze stroną.');}catch{editorMessage('Nie udało się wyczyścić kopii w pamięci przeglądarki.',true);}
  });
  $('#city-form').addEventListener('input',event=>{if(event.target.id!=='edit-city')dirty=true;});
  $('#edit-city').addEventListener('change',event=>{if(dirty){event.target.value=editingId||'';editorMessage('Zapisz bieżący formularz przed zmianą miejscowości.',true);return;}fillEditor(event.target.value||null);});
  $('#new-city').addEventListener('click',()=>{if(dirty){editorMessage('Zapisz bieżący formularz przed dodaniem nowej miejscowości.',true);return;}fillEditor(null);$('#city-form').elements.name.focus();});
  $('#city-form').addEventListener('submit',event=>{
    event.preventDefault();const form=event.currentTarget;
    try{
      const previous=data.cities.find(c=>c.id===editingId),name=form.elements.name.value.trim(),region=form.elements.region.value;
      const city={...(previous||{}),id:editingId||'manual-'+slug(name)+'-'+slug(region),name,region,lat:Number(form.elements.lat.value),lon:Number(form.elements.lon.value),apps:{}};
      for(const fieldset of $$('[data-edit-app]')) {
        const field=key=>fieldset.querySelector(`[data-field="${key}"]`).value.trim();
        if(!field('status'))continue;
        const record={status:field('status'),evidenceScope:field('evidenceScope'),checkedAt:field('date'),source:field('source'),note:field('note'),sourceLabel:field('sourceLabel')||'Źródło redakcji',sourceDetail:field('sourceDetail')};
        if(recordStatus(record)!==record.status)throw new Error(appById(fieldset.dataset.editApp).name+': wybierz źródło potwierdzające kurierów platformowych lub formularz, albo ustaw status „Do weryfikacji”.');
        city.apps[fieldset.dataset.editApp]=record;
      }
      persist(upsertCity(data,city,today()));state.city=city.id;dirty=false;render();fillEditor(city.id);editorMessage('Zapisano lokalną kopię. Pobierz JSON, aby przenieść zmiany do projektu.');
    }catch(error){editorMessage(error.message,true);}
  });
  window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
}
async function init() {
  try {
    const embedded=$('#delivery-map-bundle');
    if(embedded){const bundle=JSON.parse(embedded.textContent);published=bundle.data;geography=bundle.geography;}
    else{const base=document.body.dataset.base;
      const responses=await Promise.all([fetch(base+'delivery-map.json'),fetch(base+'poland-map.geojson')]);
      if(responses.some(r=>!r.ok))throw new Error('Nie udało się pobrać bazy lub konturów mapy.');
      [published,geography]=await Promise.all(responses.map(r=>r.json()));}
    validateData(published);data=structuredClone(published);
    if (__DELIVERY_MAP_EDITABLE__) { try{const saved=localStorage.getItem(STORE);if(saved){data=validateData(JSON.parse(saved));draft=true;}}catch{showError('Zapisana kopia robocza jest niedostępna lub niepoprawna. Wyświetlam bazę strony; nie usunięto starej kopii.');} }
    state.city=data.cities.find(c=>c.name==='Warszawa')?.id||data.cities[0]?.id;
    wireEvents();drawGeography();render();updateView();
    document.body.dataset.ready='true';
  }catch(error){showError('Nie można wczytać mapy. '+error.message+' Odśwież stronę lub sprawdź połączenie.');$('#data-date').textContent='Baza niedostępna';}
}
init();
