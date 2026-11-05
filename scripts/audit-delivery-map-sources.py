"""Read-only operator-source audit. Never rewrites the published map database.

Fetches the three public city directories, then checks every corresponding
record against its named directory link and the destination's city identity.
Retains dated responses and a report for editorial review, not auto-approval.
A matching consumer city page never establishes the platform courier model.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, unquote
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import collections, gzip, hashlib, json, re, sys, unicodedata
import requests

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'reports/delivery-map-audit/catalogs'
DIRECTORIES = {
    'glovo': 'https://glovoapp.com/pl/pl/map/cities',
    'uber-eats': 'https://www.ubereats.com/pl/location',
    'wolt': 'https://wolt.com/pl/pol',
}

def norm(value):
    value = unicodedata.normalize('NFKD', unquote(value).lower().replace('ł', 'l'))
    return re.sub(r'[^a-z0-9]+', '-', ''.join(c for c in value if not unicodedata.combining(c))).strip('-')

def urlkey(value):
    u = urlsplit(value)
    return u.netloc.lower() + unquote(u.path).rstrip('/')

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip = 0
        self.a = None
        self.heading = None
        self.in_title = False
        self.title = ''
        self.headings = []
        self.links = []
        self.parts = []
        self.canonical = ''
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'style'): self.skip += 1
        if tag == 'link' and attrs.get('rel') == 'canonical': self.canonical = attrs.get('href', '')
        if self.skip: return
        if tag == 'a': self.a = [attrs.get('href', ''), '']
        if tag == 'title': self.in_title = True
        if re.fullmatch('h[1-6]', tag): self.heading = [tag, '']
    def handle_endtag(self, tag):
        if tag in ('script', 'style') and self.skip: self.skip -= 1
        if self.skip: return
        if tag == 'a' and self.a is not None:
            self.links.append(self.a); self.a = None
        if tag == 'title': self.in_title = False
        if self.heading is not None and tag == self.heading[0]:
            self.headings.append(self.heading); self.heading = None
    def handle_data(self, text):
        if self.skip: return
        text = re.sub(r'\s+', ' ', text).strip()
        if not text: return
        self.parts.append(text)
        if self.in_title: self.title += text
        if self.heading is not None: self.heading[1] += text
        if self.a is not None: self.a[1] += text

def fetch(url):
    key = hashlib.sha256(url.encode()).hexdigest()[:20]
    result_path = OUT / (key + '.json')
    if result_path.exists():
        cached = json.loads(result_path.read_text('utf-8'))
        if cached['fetchedAt'][:10] == datetime.now(timezone.utc).date().isoformat():
            return cached
    result = {'url': url, 'fetchedAt': datetime.now(timezone.utc).isoformat()}
    try:
        r = requests.get(url, timeout=(12, 35), headers={'Accept-Language': 'pl-PL,pl;q=0.9'})
        result.update(status=r.status_code, finalUrl=r.url, bytes=len(r.content))
        r.encoding = r.apparent_encoding if not r.encoding or r.encoding == 'ISO-8859-1' else r.encoding
        page = Page(); page.feed(r.text)
        result.update(title=page.title, canonical=page.canonical, headings=page.headings,
                      links=page.links, text='\n'.join(page.parts))
        with gzip.open(OUT / (key + '.html.gz'), 'wb') as f: f.write(r.content)
    except requests.RequestException as e:
        result.update(status=0, error=str(e))
    result_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), 'utf-8')
    return result

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    OUT.mkdir(parents=True, exist_ok=True)
    data = json.loads((ROOT/'static/data/delivery-map.json').read_text('utf-8'))
    catalogs = {}
    for app, url in DIRECTORIES.items():
        catalogs[app] = fetch(url)
        print(json.dumps({'directory': app, 'status': catalogs[app]['status'], 'links': len(catalogs[app].get('links', []))}), flush=True)
    rows = [(c, app, r) for c in data['cities'] for app, r in c['apps'].items() if app in DIRECTORIES]
    urls = sorted(set(r['source'] for c, app, r in rows))
    pages = {}
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(fetch, url): url for url in urls}
        for future in as_completed(futures):
            pages[futures[future]] = future.result()
            if len(pages) % 25 == 0 or len(pages) == len(urls):
                print(json.dumps({'checkedUrls': len(pages), 'total': len(urls), 'http': dict(collections.Counter(p['status'] for p in pages.values()))}), flush=True)
    audit = []
    for city, app, r in rows:
        p = pages[r['source']]
        directory = catalogs[app]
        found = [name for href, name in directory.get('links', []) if urlkey(urljoin(directory['url'], href)) == urlkey(r['source'])]
        identity = p.get('title','') + ' ' + ' '.join(text for tag,text in p.get('headings',[]) if tag == 'h1')
        name_match = norm(city['name']) in norm(identity)
        # Names may be inflected (e.g. Krakowie); directory association is kept
        # separately and flagged for human review instead of guessed by a stem.
        record = dict(cityId=city['id'], city=city['name'], region=city['region'], app=app,
                      source=r['source'], directory=DIRECTORIES[app], directoryNames=sorted(set(found)),
                      httpStatus=p['status'], finalUrl=p.get('finalUrl'), title=p.get('title'),
                      h1=[text for tag,text in p.get('headings',[]) if tag=='h1'],
                      literalHeadingMatch=name_match, fetchedAt=p['fetchedAt'],
                      result='candidate-confirmed' if found and name_match and p['status']==200 else 'review')
        audit.append(record)
    report={'checkedAt':datetime.now(timezone.utc).isoformat(), 'method':'Directory link plus direct destination title/h1; manual review required for exceptions and operational claims.', 'records':audit}
    (ROOT/'data/delivery-map-catalog-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n','utf-8')
    print(json.dumps({'records':len(audit),'results':dict(collections.Counter(r['result'] for r in audit)),'review':[r for r in audit if r['result']=='review']},ensure_ascii=False), flush=True)

if __name__ == '__main__': main()
