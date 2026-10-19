(() => {
 const launch=document.createElement('button');launch.id='page-tour';launch.textContent='page tour';
 document.querySelector('.banner-copy').append(launch);
 const tour=document.createElement('dialog');tour.id='page-tour-overlay';tour.setAttribute('aria-labelledby','tour-title');
 tour.innerHTML='<div class="tour-ring" aria-hidden="true"></div><svg class="tour-arrow" aria-hidden="true"><path class="tour-arrow-line"/><path class="tour-arrow-head"/></svg><section class="tour-card"><div class="tour-top"><span id="tour-progress"></span><button class="tour-close" aria-label="Close page tour">Close ×</button></div><div aria-live="polite" aria-atomic="true"><h2 id="tour-title"></h2><p id="tour-copy"></p></div><div class="tour-actions"><button class="tour-back">Previous</button><button class="tour-next">Next →</button></div></section>';
 document.body.append(tour);
 const steps=[[null, "Welcome to Dan\u2019s personal platform", "Explore perspectives from more than 25 years of helping organizations move emerging technologies from ideation to operation. This quick tour shows you where to find the message, resources, and features."], [".banner-links", "Find your way around", "Use Home to return to the new homepage, About Dan to learn about his background, Features to explore articles and exercises, and Speaking topics to see his current presentations."], ["#canvas", "Start with the homepage message", "The curved palette introduces Dan\u2019s experience and perspective. The views shared here are his own. \u201cTransformation Pros Know: AI Remaps the Work\u201d opens as a separate presentation; its Home controls bring you back here."], [".presenter-features", "Explore articles and exercises", "Features brings together interactive experiences and articles, including Wed Not Wet, an agentic AI lesson, and Transformation Pros Know: AI Remaps the Work. Choose an item to explore it."], [".market-caption", "Companies worth watching", "The stock ticker follows technology and infrastructure companies. Choose \u201cSee all\u201d for a grouped list, or use the ticker controls to pause and browse. Market quotes may be delayed."], [".news-banner", "Follow the headlines", "Browse the scrolling news strip, pause it when you need more time, or choose \u201cClick to see top headlines\u201d for a list of headlines and article links in the palette."], ["#celebrate", "Celebrate the wins", "Choose Celebrate for a short burst of music and celebration whenever you have something to celebrate, big or small. It plays sound, so set your volume first."], [".presenter-home", "Return home anytime", "The Home link in the banner returns to the homepage message. You can reopen this tour just beneath the banner navigation whenever you need it."]];
 const card=tour.querySelector('.tour-card'),ring=tour.querySelector('.tour-ring'),back=tour.querySelector('.tour-back'),next=tour.querySelector('.tour-next');let index=0;
 function position(){
  document.body.classList.toggle("tour-palette-overview",index===2&&tour.open);
  tour.classList.toggle("tour-content-step",index===2);
  const target=steps[index][0]&&document.querySelector(steps[index][0]);const w=innerWidth,h=innerHeight,pad=14,gap=48;
  ring.hidden=!target;tour.classList.toggle("tour-welcome",!target);tour.querySelector(".tour-arrow").style.display=target?"block":"none";let r;
  if(target){r=target.getBoundingClientRect();const left=Math.max(4,r.left-5),top=Math.max(4,r.top-5);Object.assign(ring.style,{left:left+'px',top:top+'px',width:Math.min(w-8,r.right+5-left)+'px',height:Math.min(h-8,r.bottom+5-top)+'px'});}
  const cw=card.offsetWidth,ch=card.offsetHeight;let top=(h-ch)/2;
  if(r){const below=h-r.bottom-gap,above=r.top-gap;top=below>=ch?r.bottom+gap:above>=ch?r.top-ch-gap:(r.top<h/2?h-ch-pad:pad);}
  Object.assign(card.style,{left:(index===2?Math.max(pad,w-cw-pad):Math.max(pad,(w-cw)/2))+'px',top:(index===2?pad:Math.max(pad,Math.min(h-ch-pad,top)))+'px'});
  if(r){
   const c=card.getBoundingClientRect(),t=ring.getBoundingClientRect();
   const cx=c.left+c.width/2,cy=c.top+c.height/2;
   const ex=Math.max(t.left+12,Math.min(t.right-12,cx));
   const ey=cy<t.top?t.top-4:cy>t.bottom?t.bottom+4:cy<(t.top+t.bottom)/2?t.bottom-4:t.top+4;
   const dx=ex-cx,dy=ey-cy;
   const ratio=1/Math.max(Math.abs(dx)/(c.width/2+5),Math.abs(dy)/(c.height/2+5));
   const sx=cx+dx*ratio,sy=cy+dy*ratio;
   const length=Math.hypot(ex-sx,ey-sy),bend=Math.min(35,length*.16);
   const mx=(sx+ex)/2+(ey-sy)/Math.max(1,length)*bend,my=(sy+ey)/2-(ex-sx)/Math.max(1,length)*bend;
   const angle=Math.atan2(ey-my,ex-mx),size=11;
   tour.querySelector('.tour-arrow-line').setAttribute('d',`M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`);
   tour.querySelector('.tour-arrow-head').setAttribute('d',`M ${ex-size*Math.cos(angle-.5)} ${ey-size*Math.sin(angle-.5)} L ${ex} ${ey} L ${ex-size*Math.cos(angle+.55)} ${ey-size*Math.sin(angle+.55)}`);
  }
 }
 function render(){tour.querySelector('#tour-progress').textContent=`PAGE TOUR · ${index+1} OF ${steps.length}`;tour.querySelector('#tour-title').textContent=steps[index][1];tour.querySelector('#tour-copy').textContent=steps[index][2];back.disabled=index===0;next.textContent=index===steps.length-1?'Finish tour':'Next →';position();}
 launch.onclick=()=>{dismissInvite();index=0;tour.showModal();render();next.focus();};
 back.onclick=()=>{if(index>0){index--;render();}};
 next.onclick=()=>{if(index===steps.length-1)tour.close();else{index++;render();}};
 tour.querySelector('.tour-close').onclick=()=>tour.close();
 tour.addEventListener('close',()=>{document.body.classList.remove('tour-palette-overview');launch.focus();});
 tour.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();e.stopPropagation();if(e.key==='ArrowRight')next.click();else back.click();}});
 let invite;
 const seenKey='dan-page-tour-invited-v1';
 function dismissInvite(){if(invite){invite.close();invite.remove();invite=null;}}
 function placeInvite(){}
 try{
  if(!localStorage.getItem(seenKey)){
   localStorage.setItem(seenKey,'1');
   invite=document.createElement('dialog');invite.className='tour-invite';invite.setAttribute('aria-labelledby','welcome-title');invite.setAttribute('aria-describedby','welcome-copy');
   invite.innerHTML='<span class="welcome-eyebrow">DAN SCHAUPNER</span><h2 id="welcome-title">Welcome. I’m glad you’re here.</h2><p id="welcome-copy">Explore emerging technology transformation, personal insights, headlines, and interactive lessons. Would you like a quick look around?</p><div class="welcome-actions"><button class="tour-invite-start">Take a quick tour</button><button class="tour-invite-close">Explore on my own</button></div><p class="welcome-note">You can always find the page tour beneath the banner navigation.</p>';
   document.body.append(invite);invite.querySelector('.tour-invite-start').onclick=()=>launch.click();invite.querySelector('.tour-invite-close').onclick=dismissInvite;
   invite.addEventListener("cancel",e=>{e.preventDefault();dismissInvite();});invite.showModal();
  }
 }catch{ /* If storage is unavailable, omit the invitation rather than repeat it. */ }
 window.addEventListener('resize',()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{if(tour.open)position();placeInvite();})));
 new ResizeObserver(()=>{if(tour.open)position();}).observe(document.querySelector('#canvas'));
})();
