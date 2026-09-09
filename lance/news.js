(() => {
 const track = document.querySelector('#news-track');
 const banner = document.querySelector('.news-banner');
 const pause = document.querySelector('#news-pause');
 const home = document.querySelector('#article-home');
 const view = document.createElement('section');
 view.id = 'article-view'; view.hidden = true; view.setAttribute('aria-labelledby','article-title');
 document.querySelector('#content').append(view);
 let items = [], index = 0, active = false, animation, dataState = 'ok';
 let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
 function element(tag, cls, text) { const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e; }
 function fitArticle() {
  if (!active) return;
  const title=view.querySelector('h1');
  if (document.body.classList.contains('mobile-layout')) { title.style.fontSize=''; return; }
  let size=40;
  title.style.fontSize=size+'px';
  while(view.scrollHeight>view.clientHeight && size>30){size--;title.style.fontSize=size+'px';}
 }
 function openArticle(i) {
  if(!items.length)return;
  active=true;index=(i+items.length)%items.length;
  const article=items[index];
  document.body.classList.add('article-mode');
  document.querySelectorAll('.board').forEach(e=>e.hidden=true);
  view.hidden=false;home.hidden=false;view.replaceChildren();
  const title=element('h1','',article.title);title.id='article-title';title.tabIndex=-1;
  const subtitle=element('p','article-subtitle',article.subtitle);
  const byline=element('div','article-attribution');
  const time=new Date(article.published);
  byline.append(element('span','',article.source),element('span','',Number.isNaN(time.getTime())?'Publication time unavailable':time.toUTCString()),element('span','',article.author?`By ${article.author}`:'Author not supplied'));
  const excerpt=element('p','article-excerpt',article.excerpt);
  const link=element('a','article-read-more','Read more…');link.href=article.url;link.target='_blank';link.rel='noopener noreferrer';
  const context=element('p','article-context',`Publisher excerpt · ${dataState==='stale'?'Previously fetched stories · ':''}Recent relevant stories, not a most-read ranking.`);
  view.append(title,subtitle,byline,excerpt,link,context);
  document.querySelector('#back').disabled=false;
  document.querySelector('#back').setAttribute('aria-label','Previous article');
  document.querySelector('#next').setAttribute('aria-label','Next article');
  document.querySelector('#next span:last-child').textContent='Next';
  document.querySelector('#count').textContent=`ARTICLE ${index+1} / ${items.length}`;
  document.querySelector('#content').scrollTop=0;
  history.replaceState(null,'',`#article-${article.id}`);
  fitArticle();title.focus({preventScroll:true});
 }
 window.LanceNews={get active(){return active;},step(direction){openArticle(index+direction);}};
 document.addEventListener('storyboard:show',()=>{
  active=false;view.hidden=true;home.hidden=true;document.body.classList.remove('article-mode');
  document.querySelector('#back').setAttribute('aria-label','Previous stage');
 });
 home.onclick=()=>document.querySelector('header a').click();
 document.addEventListener('keydown',e=>{
  if(!active||document.querySelector('dialog').open||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('button,a,input,textarea,select'))return;
  if(['ArrowRight','ArrowDown','PageDown','ArrowLeft','ArrowUp','PageUp','Home'].includes(e.key)){
   e.preventDefault();e.stopImmediatePropagation();
   if(e.key==='Home')home.click();else openArticle(index+(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)?-1:1));
  }
 },true);
 function playState(){
  const hold=paused||document.hidden||banner.matches(':hover')||banner.contains(document.activeElement);
  if(animation)hold?animation.pause():animation.play();
  pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Resume headline scrolling':'Pause headline scrolling');
 }
 function buildTicker(){
  animation?.cancel();track.replaceChildren();
  if(!items.length){track.append(element('span','news-message','No matching headlines available. News will retry automatically.'));return;}
  const run=element('div','news-run');
  items.forEach((article,i)=>{
   const button=element('button','news-item');button.setAttribute('aria-label',`${article.title} — ${article.source}`);
   button.append(element('span','headline-text',article.title),element('span','headline-source',article.source));button.onclick=()=>openArticle(i);run.append(button);
  });
  track.append(run);
  const copy=run.cloneNode(true);copy.setAttribute('aria-hidden','true');copy.querySelectorAll('button').forEach((button,i)=>{button.tabIndex=-1;button.onclick=()=>openArticle(i);});track.append(copy);
  requestAnimationFrame(()=>{const width=run.getBoundingClientRect().width;animation=track.animate([{transform:'translateX(0)'},{transform:`translateX(-${width}px)`}],{duration:width/25*1000,iterations:Infinity,easing:'linear'});playState();});
 }
 pause.onclick=()=>{paused=!paused;playState();};
 ['mouseenter','mouseleave','focusin','focusout'].forEach(name=>banner.addEventListener(name,()=>setTimeout(playState,0)));
 document.addEventListener('visibilitychange',playState);
 async function load(){
  try{
   const response=await fetch(['localhost','127.0.0.1'].includes(location.hostname)?'/api/news':'/lance/news.json',{cache:'no-store'});if(!response.ok)throw Error('feed');
   const data=await response.json();if(!Array.isArray(data.items))throw Error('shape');
   dataState=data.status;
   const valid=data.items.filter(a=>a.title&&a.excerpt&&/^https:\/\//.test(a.url)).slice(0,10);
   if(valid.length&&!active){items=valid;buildTicker();const id=location.hash.replace('#article-','');const found=items.findIndex(a=>a.id===id);if(found>=0)openArticle(found);}
   else if(!items.length){track.replaceChildren(element('span','news-message',data.status==='loading'?'Loading company and infrastructure news…':'No matching headlines available. Retrying automatically.'));}
   if(data.status==='loading')setTimeout(load,4000);
  }catch{if(!items.length)track.replaceChildren(element('span','news-message','Headlines temporarily unavailable. Please try again shortly.'));}
 }
 window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#article-')){const found=items.findIndex(a=>`#article-${a.id}`===location.hash);if(found>=0)openArticle(found);}});
 new ResizeObserver(fitArticle).observe(view);
 load();setInterval(load,600000);playState();
})();
