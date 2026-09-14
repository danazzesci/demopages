(() => {
 const launch=document.createElement('button');launch.id='page-tour';launch.textContent='danschaupner.com page tour';
 document.querySelector('header').insertBefore(launch,document.querySelector('#features-link'));
 const tour=document.createElement('dialog');tour.id='page-tour-overlay';tour.setAttribute('aria-labelledby','tour-title');
 tour.innerHTML='<div class="tour-ring" aria-hidden="true"></div><section class="tour-card"><div class="tour-top"><span id="tour-progress"></span><button class="tour-close" aria-label="Close page tour">Close ×</button></div><div aria-live="polite" aria-atomic="true"><h2 id="tour-title"></h2><p id="tour-copy"></p></div><div class="tour-actions"><button class="tour-back">Previous</button><button class="tour-next">Next →</button></div></section>';
 document.body.append(tour);
 const steps=[
  [null,'Welcome to danschaupner.com','Explore useful information for people interested in workforce transformation in AI. Here’s a quick guide to what you can find on this page.'],
  ['.market-caption','Companies worth watching','Watch interesting companies on the stock ticker, or choose See all to explore a grouped listing of companies and their market symbols.'],
  ['#canvas','The main story','By default, this palette presents a high-level overview of transformation and AI. Use Previous and Next to move through the storyboard at your own pace.'],
  ['.news-banner','Follow the headlines','The bottom strip slowly scrolls headlines about companies, data centers, infrastructure, and international developments. You can pause the strip whenever you like.'],
  ['.see-headlines','See the top headlines','Choose Click to see top headlines to display the latest headline list and article links in the main palette. Use Home to return to the opening storyboard.'],
  ['#features-link','Explore the features','Features includes articles and interactive experiences by Dan about AI and other topics. Start with Wed Not Wet, an interactive introduction to agentic AI.']
 ];
 const card=tour.querySelector('.tour-card'),ring=tour.querySelector('.tour-ring'),back=tour.querySelector('.tour-back'),next=tour.querySelector('.tour-next');let index=0;
 function position(){
  const target=steps[index][0]&&document.querySelector(steps[index][0]);const w=innerWidth,h=innerHeight,pad=14;
  ring.hidden=!target;let r;
  if(target){r=target.getBoundingClientRect();const left=Math.max(4,r.left-5),top=Math.max(4,r.top-5);Object.assign(ring.style,{left:left+'px',top:top+'px',width:Math.min(w-8,r.right+5-left)+'px',height:Math.min(h-8,r.bottom+5-top)+'px'});}
  const cw=card.offsetWidth,ch=card.offsetHeight;let top=(h-ch)/2;
  if(r){const below=h-r.bottom-pad,above=r.top-pad;top=below>=ch?r.bottom+pad:above>=ch?r.top-ch-pad:(r.top<h/2?h-ch-pad:pad);}
  Object.assign(card.style,{left:Math.max(pad,(w-cw)/2)+'px',top:Math.max(pad,Math.min(h-ch-pad,top))+'px'});
 }
 function render(){tour.querySelector('#tour-progress').textContent=`PAGE TOUR · ${index+1} OF ${steps.length}`;tour.querySelector('#tour-title').textContent=steps[index][1];tour.querySelector('#tour-copy').textContent=steps[index][2];back.disabled=index===0;next.textContent=index===steps.length-1?'Finish tour':'Next →';position();}
 launch.onclick=()=>{index=0;tour.showModal();render();next.focus();};
 back.onclick=()=>{if(index>0){index--;render();}};
 next.onclick=()=>{if(index===steps.length-1)tour.close();else{index++;render();}};
 tour.querySelector('.tour-close').onclick=()=>tour.close();
 tour.addEventListener('close',()=>launch.focus());
 tour.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();e.stopPropagation();if(e.key==='ArrowRight')next.click();else back.click();}});
 window.addEventListener('resize',()=>{if(tour.open)position();});
})();
