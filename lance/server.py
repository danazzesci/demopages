"""Local-only site preview with cached, allowlisted publisher RSS feeds."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen
from urllib.parse import urlparse
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone
from html.parser import HTMLParser
import xml.etree.ElementTree as ET
import json, re, threading, time, argparse, hashlib
ROOT = Path(__file__).resolve().parent.parent
FEEDS = [
 ('CNBC','https://www.cnbc.com/id/100003114/device/rss/rss.html'),
 ('CNA','https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6936'),
 ('Al Jazeera','https://www.aljazeera.com/xml/rss/all.xml'),
 ('France 24','https://www.france24.com/en/rss'),
 ('BBC News','https://feeds.bbci.co.uk/news/technology/rss.xml'),
 ('BBC News','https://feeds.bbci.co.uk/news/business/rss.xml'),
 ('BBC News','https://feeds.bbci.co.uk/news/world/rss.xml'),
 ('The Guardian','https://www.theguardian.com/technology/rss'),
 ('The Guardian','https://www.theguardian.com/business/rss'),
 ('The Guardian','https://www.theguardian.com/world/rss'),
]
COMPANIES = re.compile(r'\b(nvidia|microsoft|oracle|google|alphabet|jacobs|cbre|amazon|meta|broadcom|amd|advanced micro devices|tsmc|taiwan semiconductor|micron|arista|vertiv|eaton|ge vernova|equinix|digital realty|marvell|coherent|lumentum|dell|hewlett.packard|hpe|quanta services|myr group|primoris|constellation energy|vistra)\b',re.I)
INFRA = re.compile(r'\b(data cent(?:er|re)s?|datacent(?:er|re)s?|semiconductors?|chips?|electricity|power grid|energy infrastructure|nuclear (?:power|energy|reactors?)|rare earth|critical minerals|cloud computing|digital infrastructure|transmission lines|shipping|Red Sea|supply chains|broadband|fiber.optic|fibre.optic)\b',re.I)
POLITICS = re.compile(r'\b(tariffs?|sanctions?|export controls?|trade war|geopolitic\w*|government|congress|parliament|china|taiwan|regulat\w*|policy|politic\w*)\b',re.I)
GLOBAL = re.compile(r'\b(global|international|cross.border|trade|exports?|imports?|supply chains?|sanctions?|tariffs?|investment|billion|China|Taiwan|India|Japan|Europe|US|U.S.|United States|Middle East|Red Sea)\b',re.I)
LOCAL = re.compile(r'\b(Share Energy|council|local residents|household bills|smartphone review|Pixel .*review|interest rate|inflation breakdown)\b',re.I)
class Plain(HTMLParser):
 def __init__(self):super().__init__();self.parts=[]
 def handle_data(self,data):self.parts.append(data)
def clean(value):
 p=Plain();p.feed(value or '');return re.sub(r'\s+',' ',' '.join(p.parts)).strip()
def fetch_feed(feed):
 source,url=feed
 try:
  with urlopen(Request(url,headers={'User-Agent':'LanceLocalPreview/1.0 RSS reader'}),timeout=12) as response:root=ET.fromstring(response.read(3_000_000))
  rows=[]
  for item in root.findall('.//item'):
   title=clean(item.findtext('title'));description=clean(item.findtext('description'));link=(item.findtext('link') or '').strip()
   if urlparse(link).scheme!='https':continue
   text=title+' '+description
   if LOCAL.search(title):continue
   company=bool(COMPANIES.search(text));infra=bool(INFRA.search(text))
   if not (company or infra):continue
   if any(part in link for part in ['/film/','/games/','/sport/','/culture/']) and not infra:continue
   try:date=parsedate_to_datetime(item.findtext('pubDate')).astimezone(timezone.utc)
   except (ValueError,TypeError,AttributeError):continue
   if (datetime.now(timezone.utc)-date).days>10:continue
   author=clean(item.findtext('{http://purl.org/dc/elements/1.1/}creator') or item.findtext('author'))
   # Show only a short publisher-provided excerpt; never scrape full articles.
   first=re.search(r'<p\b[^>]*>(.*?)</p>',item.findtext('description') or '',re.S|re.I)
   summary=clean(first.group(1)) if first else description
   words=summary.split();excerpt=' '.join(words[:25]);excerpt+=('…' if len(words)>25 else '')
   category='Infrastructure & geopolitics' if infra and POLITICS.search(text) else ('Company news' if company else 'Data centers & infrastructure')
   score = (3 if GLOBAL.search(title) else 0) - min(5,(datetime.now(timezone.utc)-date).total_seconds()/86400)*.6 + (4 if INFRA.search(title) else 0) + (3 if COMPANIES.search(title) else 0) + (2 if infra and POLITICS.search(text) else 0)
   rows.append(dict(relevance=score,id=hashlib.sha256(link.encode()).hexdigest()[:16],title=title,subtitle=category,excerpt=excerpt or 'Read the full report at the source.',source=source,author=author or None,published=date.isoformat(),url=link))
  return rows,None
 except Exception as exc:return [],source+': '+type(exc).__name__
CACHE={'items':[],'updated':None,'status':'loading'};LAST=0;LOCK=threading.Lock()
def refresh():
 global LAST,CACHE
 with LOCK:
  results=list(ThreadPoolExecutor(max_workers=6).map(fetch_feed,FEEDS))
  combined={item['id']:item for rows,_ in results for item in rows}
  items=sorted(combined.values(),key=lambda x:(x['relevance'],x['published']),reverse=True)
  seen=set();unique=[];source_counts={};topic_counts={}
  for item in items:
   key=re.sub(r'\W+','',item['title']).lower()
   topic='red-sea' if re.search(r'Houthi|Red Sea|Yemen',item['title'],re.I) else item['id']
   if key not in seen and source_counts.get(item['source'],0)<2 and topic_counts.get(topic,0)<2:
    unique.append(item);seen.add(key);source_counts[item['source']]=source_counts.get(item['source'],0)+1;topic_counts[topic]=topic_counts.get(topic,0)+1
  errors=[error for _,error in results if error]
  if unique:CACHE={'items':unique[:10],'updated':datetime.now(timezone.utc).isoformat(),'status':'partial' if errors else 'ok','ranking':'Relevant recent stories; readership rankings unavailable'}
  else:CACHE={**CACHE,'status':'stale' if CACHE['items'] else 'unavailable'}
  LAST=time.time()
def poll():
 while True:
  refresh();time.sleep(600)
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
 def do_GET(self):
  if urlparse(self.path).path=='/api/news':
   body=json.dumps(CACHE).encode();self.send_response(200);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
  else:super().do_GET()
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8766);parser.add_argument('--root',type=Path);args=parser.parse_args()
 if args.root:ROOT=args.root.resolve()
 threading.Thread(target=poll,daemon=True).start()
 ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
