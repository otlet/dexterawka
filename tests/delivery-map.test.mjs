import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateData, matches, visibleRecords, upsertCity, safeUrl, toCSV, recordStatus } from '../assets/docs/js/delivery-map-model.mjs';
const data = JSON.parse(fs.readFileSync(new URL('../static/data/delivery-map.json',import.meta.url),'utf8'));
const city = name => data.cities.find(c=>c.name===name);
const audit = JSON.parse(fs.readFileSync(new URL('../data/delivery-map-courier-audit.json',import.meta.url),'utf8'));
const sourceAudit = JSON.parse(fs.readFileSync(new URL('../data/delivery-map-source-audit.json',import.meta.url),'utf8'));
test('published records have unique identities, valid coordinates, dated public evidence',()=>{
  assert.equal(validateData(data),data); assert.equal(data.apps.length,7);
  assert.equal(data.cities.length,193); assert.ok(data.cities.every(c=>Object.keys(c.apps).length));
  assert.ok(data.cities.every(c=>c.name!=='FakePoland'&&!c.name.includes('okolice')));
});
test('recruitment is not silently counted as confirmed service',()=>{
  const example={apps:{pyszne:{status:'recruiting',evidenceScope:'courier_form'}}};
  assert.ok(!visibleRecords(example,false).some(([id])=>id==='pyszne'));
  assert.ok(visibleRecords(example,true).some(([id])=>id==='pyszne'));
  assert.equal(matches(example,{selected:['pyszne'],recruiting:false}),false);
  assert.equal(matches(example,{selected:['pyszne'],recruiting:true}),true);
});
test('the map matches the fleet table exactly',()=>{
  const fleet=JSON.parse(fs.readFileSync(new URL('../data/delivery-map-fleet-table-audit.json',import.meta.url),'utf8'));
  const plus=fleet.records.filter(r=>r.change!=='revert').map(r=>r.city+' / '+r.app).sort();
  const onMap=data.cities.flatMap(c=>Object.keys(c.apps).map(a=>c.name+' / '+a)).sort();
  assert.equal(plus.length,472);
  assert.deepEqual(onMap,plus);
  const table='https://kurierpedia.pl/mapa-delivery/';
  for(const c of data.cities) for(const r of Object.values(c.apps)) {
    assert.equal(recordStatus(r),'active',c.name);
    assert.equal(r.source,table,c.name);
    for(const key of ['note','sourceLabel','sourceDetail']) assert.ok(!(key in r),c.name+' / '+key);
  }
  for(const a of data.apps) { assert.equal(a.source,table,a.id); assert.deepEqual(a.additionalSources,[],a.id); assert.equal(a.scope,'',a.id); }
  assert.ok(!data.cities.some(c=>c.name.includes('/')));
});
test('editor controls exist only inside the development-only blocks of the layout',()=>{
  const layout=fs.readFileSync(new URL('../layouts/docs/delivery-map.html',import.meta.url),'utf8');
  assert.match(layout,/\$editable := eq hugo\.Environment "development"/);
  const publicMarkup=layout.replace(/\{\{ if \$editable \}\}[\s\S]*?\{\{ end \}\}/g,'');
  for(const id of ['editor-open','draft-banner','editor-dialog','export-csv','export-json','import-json','restore-published'])assert.ok(layout.includes(`id="${id}"`),id);
  for(const text of ['editor-open','draft-editor','editor-dialog','export-csv','export-json','import-json','restore-published','Edytuj','data/delivery-map.json'])assert.ok(!publicMarkup.includes(text),text);
});
test('Polish search, region and AND / OR filters compose',()=>{
  assert.ok(matches(city('Łódź'),{query:'lodz'}));
  assert.ok(!matches(city('Łódź'),{region:'mazowieckie'}));
  const example={apps:{glovo:{status:'active',evidenceScope:'platform_couriers'}}};
  assert.ok(matches(example,{selected:['glovo','stuart'],mode:'any'}));
  assert.ok(!matches(example,{selected:['glovo','stuart'],mode:'all'}));
  assert.ok(matches(city('Warszawa'),{selected:['glovo','wolt','stuart'],mode:'all'}));
});
test('same-name settlements are located in the sourced area',()=>{
  assert.ok(city('Kowale').lat>54.3 && city('Kowale').lon>18.5);
  assert.ok(city('Józefów').lat>52.1 && city('Józefów').lon>21.2);
  assert.ok(!city('Nowiny'),'old municipality Sitkówka-Nowiny must not geocode to another village');
  assert.ok(city('Sochaczew').apps.stuart);
});
test('import rejects executable URLs, duplicate cities, missing IDs and malformed dates',()=>{
  for (const mutate of [
    d=>{d.cities[0].apps[Object.keys(d.cities[0].apps)[0]].source='javascript:alert(1)';},
    d=>{d.cities.push(structuredClone(d.cities[0]));},
    d=>{d.cities.push({...structuredClone(d.cities[0]),id:'another-id'});},
    d=>{delete d.cities[0].id;},
    d=>{d.updatedAt='2026-02-30';},
    d=>{d.cities[0].lat=90;},
    d=>{d.cities[0].apps[Object.keys(d.cities[0].apps)[0]].evidenceScope='all-restaurants-deliver';},
    d=>{d.cities[0].apps.unknown={status:'active',checkedAt:'2026-10-21',source:'https://example.org'};}
  ]) {const copy=structuredClone(data);mutate(copy);assert.throws(()=>validateData(copy));}
  assert.equal(safeUrl('data:text/html,evil'),'');assert.equal(safeUrl('https://user:password@example.org'),'');
});
test('editing is isolated, round-trips as JSON, preserves evidence on other cities',()=>{
  const warsaw=structuredClone(city('Warszawa'));warsaw.apps.wolt.note='Aktualizacja testowa';
  warsaw.apps.wolt.sourceDetail='Nagłówek: Warszawa';
  const copy=upsertCity(data,warsaw,'2026-10-21');
  assert.notEqual(city('Warszawa').apps.wolt.note,warsaw.apps.wolt.note);
  assert.equal(copy.cities.length,data.cities.length);
  assert.deepEqual(validateData(JSON.parse(JSON.stringify(copy))),copy);
  assert.deepEqual(copy.cities.find(c=>c.name==='Łódź'),city('Łódź'));
});
test('unverified evidence is excluded from service counts and app filters',()=>{
  const example={apps:{'bolt-food':{status:'unverified'},glovo:{status:'active',evidenceScope:'platform_couriers'}}};
  assert.deepEqual(visibleRecords(example,false).map(([id])=>id),['glovo']);
  assert.equal(matches(example,{selected:['bolt-food']}),false);
  assert.equal(matches(example,{selected:['glovo','bolt-food'],mode:'all'}),false);
  assert.equal(matches({apps:{'uber-eats':{status:'unverified'}}}),false);
});

test('consumer delivery listings and legacy drafts cannot count as platform courier work',()=>{
  for(const evidenceScope of ['customer_catalog','courier_form','unknown',undefined]) {
    const record={status:'active',evidenceScope,source:'https://www.ubereats.com/pl/city/warszawa-mazowieckie'};
    const example={apps:{'uber-eats':record}};
    assert.equal(recordStatus(record),'unverified');
    assert.equal(matches(example,{selected:['uber-eats']}),false);
    assert.equal(visibleRecords(example).length,0);
  }
  const form={apps:{glovo:{status:'recruiting',evidenceScope:'courier_form'}}};
  assert.equal(matches(form),false);
  assert.equal(matches(form,{selected:['glovo'],recruiting:false}),false);
  assert.equal(matches(form,{selected:['glovo'],recruiting:true}),true);
  for(const c of data.cities) for(const r of Object.values(c.apps)) {
    assert.equal(recordStatus(r),r.status,c.name);
    if(r.status==='active')assert.equal(r.evidenceScope,'platform_couriers',c.name);
    if(r.status==='recruiting')assert.equal(r.evidenceScope,'courier_form',c.name);
  }
});
test('reviewed snapshot has city-specific evidence and excludes unresolved sources',()=>{
  const cities=[...new Set(sourceAudit.records.map(r=>r.cityId))].map(id=>({name:sourceAudit.records.find(r=>r.cityId===id).city,apps:Object.fromEntries(sourceAudit.records.filter(r=>r.cityId===id).map(r=>[r.app,r]))}));
  const reviewedCity=name=>cities.find(c=>c.name===name);
  for(const c of cities) {
    const r=c.apps['bolt-food'];
    if(r && c.name!=='Poznań')assert.notEqual(new URL(r.source).pathname,'/pl-pl/food/courier/earn/poland/poznan/',c.name);
  }
  assert.equal(reviewedCity('Ciechanów').apps['bolt-food'].status,'unverified');
  assert.match(reviewedCity('Ciechanów').apps['bolt-food'].source,/\/ciechanow\//);
  for(const [name,path] of [['Gdańsk','trojmiasto'],['Kiełczów','kielczow-okolice-wroclawia'],['Piastów','okolice-warszawy']]) {
    assert.equal(new URL(reviewedCity(name).apps.glovo.source).pathname,'/pl/pl/'+path);
  }
  assert.equal(reviewedCity('Skarszewy').apps['uber-eats'].status,'unverified');
  assert.ok(cities.every(c=>Object.values(c.apps).every(r=>r.sourceLabel&&r.sourceDetail)));
  // Keep this historical audit test independent of later editorial updates.
  assert.ok(audit.records.every(r=>r.evidenceScope));
});
test('CSV lists city and app rows without sources, quotes values and neutralizes formulas',()=>{
  const copy=structuredClone(data);copy.cities[0].name=' =HYPERLINK("test")';
  copy.cities[1].name='linia 1\n"linia 2";';
  const csv=toCSV(copy);assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes("' =HYPERLINK"));assert.ok(csv.includes('""linia 2""'));
  assert.ok(csv.includes('Kurierzy platformowi'));
  assert.ok(!csv.includes('http'));assert.ok(!csv.includes('źródło'));
});
