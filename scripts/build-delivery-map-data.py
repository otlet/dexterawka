"""Build a reviewed candidate from retained operator HTML and GeoNames.

Inputs: retained sources, initial research, source audit and courier-model audit.
Both reviewed audits are required so historical collection errors cannot return.
--initial creates the first static snapshot, refusing to overwrite it.
Later runs output a candidate for review, never replacing manual edits.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin
import argparse, collections, json, re, unicodedata, zipfile

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'reports/delivery-map-sources'
DATE = '2026-10-21'
REGIONS = dict(zip(['72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87'],
 ['dolnośląskie','kujawsko-pomorskie','łódzkie','lubelskie','lubuskie','małopolskie','mazowieckie','opolskie','podkarpackie','podlaskie','pomorskie','śląskie','świętokrzyskie','warmińsko-mazurskie','wielkopolskie','zachodniopomorskie']))

def norm(s):
    return re.sub(r'[^a-z0-9]+', '-', ''.join(c for c in unicodedata.normalize('NFKD', s.lower().replace('ł','l')) if not unicodedata.combining(c))).strip('-')

class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.current=None
    def handle_starttag(self, tag, attrs):
        if tag == 'a': self.current=[dict(attrs).get('href',''), '']
    def handle_data(self, data):
        if self.current is not None: self.current[1] += data
    def handle_endtag(self, tag):
        if tag == 'a' and self.current is not None:
            self.links.append(self.current); self.current=None

def links(name):
    parser=Links(); parser.feed((CACHE / (name+'.html')).read_text('utf8'))
    return parser.links

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--initial',action='store_true'); args=parser.parse_args()
    with zipfile.ZipFile(CACHE/'PL.zip') as z:
        places=[r.split('\t') for r in z.read('PL.txt').decode('utf8').splitlines()]
    index=collections.defaultdict(list)
    for r in places:
        if r[6]!='P' or r[7] in ('PPLX','PPLH','PPLQ'): continue
        for name in set([r[1],r[2]]+r[3].split(',')):
            if name: index[norm(name)].append(r)
    cities={}; excluded=[]; unresolved=[]
    aliases={'konstancin-jeziorna':'Konstancin-Jeziorna','wieliczka-malopolskie-pl':'Wieliczka','czeladz-slaskie-pl':'Czeladź','rybnik-slaskie-pl':'Rybnik','dobra-szczecinska':'Dobra','sitkowka-nowiny':'Nowiny'}
    canonical={'Warsaw':'Warszawa','Stargard Szczeciński':'Stargard'}
    def add(name,app,source,status='active',region=None,note='',source_label=''):
        specific_id='3100364' if norm(name)=='dobra-szczecinska' else None
        name=unicodedata.normalize('NFC', name.strip()); name=aliases.get(norm(name),name)
        candidates=index.get(norm(name),[])
        if region: candidates=[r for r in candidates if norm(REGIONS.get(r[10],''))==norm(region)]
        if specific_id: candidates=[r for r in candidates if r[0]==specific_id]
        candidates=sorted({r[0]:r for r in candidates}.values(), key=lambda r:(int(r[14]),r[7] in ('PPLC','PPLA','PPLA2')),reverse=True)
        if not candidates: unresolved.append({'app':app,'name':name,'region':region}); return
        row=candidates[0]
        if len(candidates)>1 and int(row[14])==int(candidates[1][14]):
            unresolved.append({'app':app,'name':name,'reason':'ambiguous geocoding'}); return
        city_id='pl-'+row[0]
        city=cities.setdefault(city_id,dict(id=city_id,name=canonical.get(row[1],row[1]),region=REGIONS[row[10]],lat=float(row[4]),lon=float(row[5]),geonamesId=row[0],population=int(row[14]),apps={}))
        city['apps'][app]=dict(status=status,source=source,checkedAt=DATE,note=note,sourceLabel=source_label)
    for href,name in links('glovo'):
        if not re.fullmatch(r'/pl/pl/[^/]+/?',href) or name=='Glovo Prime': continue
        if name in ['FakePoland','Krakow okolice','Okolice Łodzi','Prawobrzeże','Dziekanowice']:
            excluded.append(dict(app='glovo',name=name,source=urljoin('https://glovoapp.com',href),reason='Wpis techniczny, obszar zbiorczy, dzielnica lub niejednoznaczna miejscowość.')); continue
        add(name,'glovo',urljoin('https://glovoapp.com',href),source_label='Katalog miast Glovo')
    for href,name in links('uber-eats'):
        if '/pl/city/' not in href: continue
        if 'gmina' in norm(name) or norm(name)=='sitkowka-nowiny':
            excluded.append(dict(app='uber-eats',name=name,source=urljoin('https://www.ubereats.com',href),reason='Gmina: nie przenosimy zasięgu na wszystkie miejscowości.')); continue
        normalized=norm(href)
        region=next((v for v in sorted(REGIONS.values(),key=len,reverse=True) if normalized.endswith(norm(v))),None)
        add(name,'uber-eats',urljoin('https://www.ubereats.com',href),region=region,source_label='Katalog miejscowości Uber Eats')
    for href,name in links('wolt'):
        if not href.startswith('/pl/pol/'): continue
        if name=='Aglomeracja Śląska':
            for city in ['Katowice','Chorzów']:
                add(city,'wolt','https://explore.wolt.com/en/pol/couriers/learning-center',note='Miasto wymienione w Aglomeracji Śląskiej w FAQ dla kurierów.',source_label='FAQ Wolt dla kurierów')
        elif name=='Szczecin-Prawobrzeże':
            excluded.append(dict(app='wolt',name=name,reason='Dzielnica; Szczecin jest już osobnym punktem.'))
        else: add(name,'wolt',urljoin('https://wolt.com',href),source_label='Katalog miast Wolt')
    research=json.loads((ROOT/'data/delivery-map-research.json').read_text('utf8'))
    short_notes={'bolt-food':'Miasto wymienione na oficjalnej stronie dla kurierów Bolt Food.', 'stuart':'Miasto lub miejscowość wymieniona w oficjalnych strefach Stuart.', 'pyszne':'Miasto w formularzu kurierskim Pyszne.pl. Nie gwarantuje otwartego naboru; nie jest to lista restauracji z własną dostawą.'}
    for app in research['apps']:
        for city in app['cities']:
            region='pomorskie' if city=='Kowale' else ('mazowieckie' if city=='Józefów' else None)
            add(city,app['id'],app.get('citySources',{}).get(city,app['source']),status=app['status'],region=region,note=short_notes[app['id']],source_label='Oficjalna strona operatora')
    if unresolved:
        (CACHE/'unresolved.json').write_text(json.dumps(unresolved,ensure_ascii=False,indent=2),'utf8')
        raise SystemExit('Unresolved places: '+json.dumps(unresolved,ensure_ascii=False))
    audit=json.loads((ROOT/'data/delivery-map-source-audit.json').read_text('utf8'))
    expected={(c['id'],app) for c in cities.values() for app in c['apps']}
    reviewed={(r['cityId'],r['app']) for r in audit['records']}
    if expected != reviewed or len(reviewed) != len(audit['records']):
        raise SystemExit('Retained source records differ from the reviewed audit. Review the changes before generating a candidate.')
    for r in audit['records']:
        city=cities[r['cityId']]; original=city['apps'][r['app']]
        if original['source'] != r['previous']['source']:
            raise SystemExit('Retained source changed after review: '+city['name']+' / '+r['app'])
        city['name']=r['city']
        city['apps'][r['app']]={k:r[k] for k in ['status','source','checkedAt','note','sourceLabel','sourceDetail']}
    courier_audit=json.loads((ROOT/'data/delivery-map-courier-audit.json').read_text('utf8'))
    courier_keys={(r['cityId'],r['app']) for r in courier_audit['records']}
    if not expected.issubset(courier_keys) or len(courier_keys) != len(courier_audit['records']):
        raise SystemExit('Courier-model audit has missing or duplicate records.')
    for city in courier_audit.get('addedCities',[]):
        if city['id'] in cities: raise SystemExit('New city already exists: '+city['id'])
        cities[city['id']]={**city,'apps':{}}
    for r in courier_audit['records']:
        city=cities[r['cityId']]
        previous=city['apps'].get(r['app'])
        if previous is None:
            if r['previous'] is not None: raise SystemExit('Missing reviewed baseline record: '+city['name'])
        elif r['previous'] is None or previous['source'] != r['previous']['source']:
            raise SystemExit('Source audit changed after courier-model review: '+city['name']+' / '+r['app'])
        city['apps'][r['app']]={k:r[k] for k in ['status','evidenceScope','source','checkedAt','note','sourceLabel','sourceDetail']}
    audit=courier_audit
    apps=audit['apps']
    dataset=dict(schemaVersion=1,updatedAt=audit['checkedAt'],revision=audit['revision'],title='Kurierpedia — mapa delivery',apps=apps,
        methodology=audit['methodology'],
        geography=dict(coordinates='https://www.geonames.org/',coordinatesLicense='CC BY 4.0',boundaries='https://www.naturalearthdata.com/',boundariesLicense='Public domain'),
        cities=sorted(cities.values(),key=lambda c:norm(c['name'])))
    target=ROOT/('static/data/delivery-map.json' if args.initial else 'reports/delivery-map-candidate.json')
    if args.initial and target.exists(): raise SystemExit('Initial snapshot exists. Use candidate output and review differences.')
    target.parent.mkdir(parents=True,exist_ok=True);target.write_text(json.dumps(dataset,ensure_ascii=False,indent=2)+'\n','utf8')
    (ROOT/'data/delivery-map-exclusions.json').write_text(json.dumps(dict(checkedAt=DATE,entries=excluded),ensure_ascii=False,indent=2)+'\n','utf8')
    # Sutherland-Hodgman clip, sufficient for this decorative basemap. No GIS runtime dependency.
    def ring_clip(points):
        for axis,bound,greater in [(0,12.5,True),(0,25.5,False),(1,48,True),(1,56,False)]:
            if not points: return []
            output=[];previous=points[-1]
            inside=lambda p: p[axis]>=bound if greater else p[axis]<=bound
            for current in points:
                if inside(current)!=inside(previous):
                    t=(bound-previous[axis])/(current[axis]-previous[axis])
                    output.append([previous[0]+t*(current[0]-previous[0]),previous[1]+t*(current[1]-previous[1])])
                if inside(current): output.append(current)
                previous=current
            points=output
        if points and points[0]!=points[-1]: points.append(points[0])
        return [[round(x,4),round(y,4)] for x,y in points]
    def compact(feature,kind):
        p=feature['properties'];g=feature['geometry'];polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
        clipped=[]
        for poly in polys:
            rings=[ring_clip(ring) for ring in poly];rings=[r for r in rings if len(r)>=4]
            if rings: clipped.append(rings)
        return dict(type='Feature',properties=dict(name=p.get('name_pl') or p.get('ADMIN') or p.get('name'),kind=kind),geometry=dict(type='MultiPolygon',coordinates=clipped))
    regions=json.loads((CACHE/'regions.geojson').read_text('utf8'))['features'];countries=json.loads((CACHE/'countries.geojson').read_text('utf8'))['features']
    fs=[compact(f,'region') for f in regions if f['properties'].get('admin')=='Poland']
    fs += [compact(f,'neighbor') for f in countries if f['properties'].get('ADMIN') in ['Germany','Czechia','Slovakia','Ukraine','Belarus','Lithuania','Russia']]
    (ROOT/'static/data/poland-map.geojson').write_text(json.dumps(dict(type='FeatureCollection',features=fs),ensure_ascii=False,separators=(',',':')),'utf8')
    print(json.dumps(dict(cities=len(cities),records={a['id']:sum(a['id'] in c['apps'] for c in cities.values()) for a in apps},excluded=len(excluded),output=str(target)),ensure_ascii=False))

if __name__=='__main__': main()
