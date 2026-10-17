"""Generate /exercises/ from the current homepage shell, retaining palette layout."""
from pathlib import Path
import argparse,html,re
parser=argparse.ArgumentParser();parser.add_argument('--site-root',type=Path,default=Path(__file__).resolve().parent.parent);args=parser.parse_args()
root=args.site_root
source=(root/'index.html').read_text()
title='Exercises & Examples — Dan Schaupner'
description='Interactive lessons, cybersecurity exercises, and AI examples: Wed Not Wet, Policy to Risk, AI-informed HVAC decisions, network segmentation, and a guided SIEM investigation.'
url='https://danschaupner.com/exercises/'
def replace(pattern,value):
    global source
    source,count=re.subn(pattern,lambda _:value,source,count=1)
    if count!=1:raise ValueError('Missing homepage metadata: '+pattern)
replace(r'<title>.*?</title>','<title>'+html.escape(title)+'</title>')
for key,value in [('description',description),('twitter:title',title),('twitter:description',description)]:
    replace(r'<meta name="'+re.escape(key)+r'" content="[^"]*">','<meta name="'+key+'" content="'+html.escape(value,quote=True)+'">')
for key,value in [('og:title',title),('og:description',description),('og:url',url)]:
    replace(r'<meta property="'+re.escape(key)+r'" content="[^"]*">','<meta property="'+key+'" content="'+html.escape(value,quote=True)+'">')
replace(r'<link rel="canonical" href="[^"]*">','<link rel="canonical" href="'+url+'">')
source=source.replace('</head>','<script>history.replaceState(null,"",location.pathname+location.search+"#exercises");</script>\n</head>',1)
assert source.count('property="og:image"')==1
assert 'https://danschaupner.com/assets/images/previews/home-sharp-v4.png' in source
out=root/'exercises/index.html';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(source)
print('Generated',out)
