(() => {
 const content=document.querySelector('#content');
 const features=document.createElement('section');features.id='features-view';features.hidden=true;
 features.innerHTML='<h1 tabindex="-1">Features</h1><p class="features-scroll-hint">Newest first · Scroll down for more and previously published content ↓</p><article class="feature-entry exercises-directory-feature"><a href="/exercises/">Exercises &amp; Examples — Explore the Interactive Collection (October 17, 2026)</a><p>A single starting point for the interactive lessons, cybersecurity exercises, and AI examples published on this site.</p><p>Explore Wed Not Wet, Hands-On 1: Policy to Risk, the AI-focused Fieldwork HVAC example, Firewall and Network Segmentation, and the guided SIEM investigation with Hannah.</p></article><article class="feature-entry siem-feature"><a href="/exercises/the-second-peak/">Identify and Report Suspected Unauthorized Activity — A Guided SIEM Exercise (October 17, 2026)</a><p>Investigate unexpected sign-in activity in a fictional manufacturer&#8217;s international payment gateway using a simulated security information and event management (SIEM) tool.</p><p>Hannah, an independent Virtual CISO, guides you through comparing normal activity, inspecting logs, checking for possible data extraction, pinning evidence, connecting observations to MITRE ATT&amp;CK, and preparing an escalation brief. Designed for cybersecurity beginners; no installation or account required.</p></article><article class="feature-entry fieldwork-feature"><a href="/proofofconcept/">Fieldwork — A Repair Job Aid (October 4, 2026)</a><p>A proof of concept for a job aid that goes beyond coaching someone through a fix: it provides real-time feedback on the state of the repair by bringing sensor evidence and the service delivery representative’s responses into the same workflow.</p><p>Explore an interactive furnace service call, add findings, follow the changing repair state, and record an operational check. This demonstration uses simulated equipment data and AI recommendations; it has no live sensor connection.</p></article><article class="feature-entry celebration-feature"><a href="#celebrate">Celebrate — Break glass in case of celebration (September 15, 2026)</a><p>Sometimes you need a quick way to celebrate something you’ve accomplished, no matter how big or small.</p><p class="celebration-warning"><strong>Warning: this makes noise.</strong> Turn the volume down if you’re not sure—or turn it all the way up for maximum effect.</p></article><article class="feature-entry"><a href="#wed-not-wet">Wed Not Wet — An Agentic AI Lesson (September 14, 2026)</a><p>A wedding threatened by rain becomes a practical lesson in agentic AI: an orchestrator coordinates specialist agents, gathers evidence, tests possible plans, and adapts until the wedding’s objectives are met.</p><p>See why a clear objective, sound evidence, and human approval matter when AI moves from producing answers to coordinating action. Includes the complete storyboard, assessment, and simulation.</p></article>';
 const exercises=document.createElement('section');exercises.id='exercises-view';exercises.hidden=true;
 exercises.innerHTML=`<p class="exercise-eyebrow">INTERACTIVE LEARNING COLLECTION</p><h1 tabindex="-1">Exercises &amp; Examples</h1><p class="exercise-directory-intro">Explore the lessons, cybersecurity exercises, and AI examples published on this site. Choose an activity below; each opens in its intended layout.</p><ol class="exercise-directory-list">
 <li><span class="exercise-category">Agentic AI · interactive lesson</span><h2><a href="/wed-not-wet/">Wed Not Wet — An Agentic AI Lesson</a></h2><p>A wedding threatened by rain illustrates how an orchestrator coordinates specialist agents, gathers evidence, compares plans, and adapts toward a shared objective. Includes the lesson, storyboard, assessment, and simulation.</p></li>
 <li><span class="exercise-category">Cybersecurity foundations · first class exercise</span><h2><a href="/exercises/module1.html">Hands-On 1: Policy to Risk</a></h2><p>Turn policy into protection—and prove it works. Translate an approved access policy into a narrowly scoped firewall rule, test the authorized connection, challenge an unauthorized port, and connect the results to assets, risk, and control evidence.</p></li>
 <li><span class="exercise-category">AI and decision support · HVAC as the example</span><h2><a href="/proofofconcept/">Fieldwork — AI Beyond the Chatbot</a></h2><p>The main subject is how AI-informed tools can organize context, findings, intended operation, and checks to support decisions through a changing workflow. An HVAC service call provides the concrete example; this is broader than an HVAC training tool.</p><p class="exercise-scope-note">An interactive proof of concept with scripted equipment states and predefined checks, not a live AI or sensor connection.</p></li>
 <li><span class="exercise-category">Cybersecurity · network controls</span><h2><a href="/exercises/firewall-network-segmentation/">Firewall and Network Segmentation</a></h2><p>Explore how network connections create paths and firewall rules control what can cross them. Change connections and policies, then observe the effects across a segmented network.</p></li>
 <li><span class="exercise-category">Cybersecurity investigation · guided simulated SIEM</span><h2><a href="/exercises/the-second-peak/">Identify and Report Suspected Unauthorized Activity</a></h2><p>Hannah, an independent Virtual CISO, guides you through unexpected sign-in activity in an international payment gateway. Compare the baseline, investigate authentication and possible data movement, pin records, relate observations to MITRE ATT&amp;CK, and prepare an evidence-based escalation brief.</p><p class="exercise-scope-note">The Second Peak · beginner-friendly · about 60–90 minutes · no installation or account required.</p></li>
 </ol><p class="exercise-directory-return"><a href="/#features">Back to Features →</a></p>`;
 // Dates are the first publication and latest page update in the repository history,
 // not the date an existing lesson was later announced in Features.
 const catalogue=[
  {id:'second-peak',href:'/exercises/the-second-peak/',title:'Identify and Report Suspected Unauthorized Activity',published:'2026-10-17',updated:'2026-10-18'},
  {id:'ai-fieldwork',href:'/proofofconcept/',title:'Fieldwork — AI Beyond the Chatbot',published:'2026-10-04',updated:'2026-10-12'},
  {id:'firewall-segmentation',href:'/exercises/firewall-network-segmentation/',title:'Firewall and Network Segmentation',published:'2026-10-03',updated:'2026-10-11'},
  {id:'policy-to-risk',href:'/exercises/module1.html',title:'Hands-On 1: Policy to Risk',published:'2026-08-20',updated:'2026-10-11'},
  {id:'wed-not-wet',href:'/wed-not-wet/',title:'Wed Not Wet — An Agentic AI Lesson',published:'2026-07-18',updated:'2026-10-11'}
 ].sort((a,b)=>b.published.localeCompare(a.published));
 const dateLabel=value=>new Intl.DateTimeFormat('en-US',{timeZone:'UTC',month:'short',day:'numeric',year:'numeric'}).format(new Date(value+'T12:00:00Z'));
 const home=document.createElement('a');home.href='/';home.textContent='← Home';home.className='exercise-directory-return';home.addEventListener('click',event=>{event.preventDefault();document.querySelector('.presenter-home').click();});exercises.prepend(home);
 const list=exercises.querySelector('.exercise-directory-list');
 const entries=new Map([...list.children].map(li=>[li.querySelector('h2 a').getAttribute('href'),li]));
 const layout=document.createElement('div');layout.className='exercise-layout';list.before(layout);layout.append(list);
 const index=document.createElement('aside');index.className='exercise-index';index.setAttribute('aria-label','Lesson navigation');
 index.innerHTML='<h2>Choose a lesson</h2><p>Select a title to read its description. The current lesson is highlighted as you scroll.</p><nav class="exercise-index-links" aria-label="Lessons, newest first"></nav><label class="exercise-mobile-select">Jump to lesson<select aria-label="Choose a lesson"></select></label>';
 const menu=index.querySelector('nav'),select=index.querySelector('select');
 catalogue.forEach(item=>{
  const li=entries.get(item.href);li.id='exercise-'+item.id;li.dataset.lesson=item.id;li.dataset.published=item.published;li.querySelector('h2').tabIndex=-1;
  const dates=document.createElement('p');dates.className='exercise-dates';dates.innerHTML=`Published <time datetime="${item.published}">${dateLabel(item.published)}</time> <span aria-hidden="true">|</span> Updated <time datetime="${item.updated}">${dateLabel(item.updated)}</time>`;li.querySelector('h2').after(dates);list.append(li);
  const button=document.createElement('button');button.type='button';button.dataset.lesson=item.id;button.setAttribute('aria-controls',li.id);
  const title=document.createElement('span');title.textContent=item.title;button.append(title);menu.append(button);
  const option=document.createElement('option');option.value=item.id;option.textContent=item.title;select.append(option);
 });
 layout.append(index);
 const order=document.createElement('p');order.className='exercise-sort-note';order.textContent='Newest first · Publication and update dates shown for each activity.';exercises.querySelector('.exercise-directory-intro').after(order);
 const dateNote=document.createElement('p');dateNote.className='exercise-date-note';dateNote.textContent='Dates reflect first publication and the latest page update recorded in this site’s source history.';exercises.querySelector('.exercise-directory-return').before(dateNote);
 const reading=document.createElement('div');reading.className='exercise-reading';layout.prepend(reading);[exercises.querySelector('.exercise-eyebrow'),exercises.querySelector('h1'),exercises.querySelector('.exercise-directory-intro'),order,list].forEach(node=>reading.append(node));
 function markLesson(id){menu.querySelectorAll('button').forEach(button=>{if(button.dataset.lesson===id)button.setAttribute('aria-current','location');else button.removeAttribute('aria-current')});select.value=id;}
 function selectLesson(id){const target=list.querySelector('[data-lesson="'+id+'"]');if(!target)return;const box=content.getBoundingClientRect(),scale=box.height/content.clientHeight||1;content.scrollTo({top:content.scrollTop+(target.getBoundingClientRect().top-box.top)/scale-(document.body.classList.contains('mobile-layout')?index.offsetHeight+18:10),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});target.querySelector('h2').focus({preventScroll:true});markLesson(id);}
 menu.addEventListener('click',event=>{const button=event.target.closest('button[data-lesson]');if(button)selectLesson(button.dataset.lesson)});select.onchange=()=>selectLesson(select.value);
 let scrollFrame;
 function trackLesson(){scrollFrame=null;if(exercises.hidden)return;const box=content.getBoundingClientRect(),line=document.body.classList.contains('mobile-layout')?Math.max(box.top+box.height*.28,index.getBoundingClientRect().bottom+32):box.top+box.height*.28;let current=catalogue[0].id;for(const li of list.children){if(li.getBoundingClientRect().top<=line)current=li.dataset.lesson;}if(content.scrollHeight-content.clientHeight-content.scrollTop<3)current=catalogue.at(-1).id;markLesson(current);}
 content.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(trackLesson)},{passive:true});window.addEventListener('resize',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(trackLesson)});markLesson(catalogue[0].id);
 const lesson=document.createElement('section');lesson.id='lesson-view';lesson.hidden=true;content.append(features,lesson,exercises);
 function open(kind){
  document.dispatchEvent(new Event('storyboard:show'));
  document.querySelectorAll('.board').forEach(e=>e.hidden=true);
  document.body.classList.add('article-mode','features-mode');document.querySelector('#article-home').hidden=false;content.scrollTop=0;
  if(kind==='lesson'){
   document.body.classList.add('lesson-mode');lesson.hidden=false;
   const frame=document.createElement('iframe');frame.title='Wed Not Wet — complete interactive lesson';frame.src='/wed_not_wet/?embedded=1';
   frame.onload=()=>{
    const doc=frame.contentDocument;
    const style=doc.createElement('style');style.textContent=`
     html,body{overflow:hidden!important} .app{height:100%;grid-template-rows:56px minmax(0,1fr) 58px}
     main{min-height:0;overflow:hidden} .stage{padding:12px;display:flex;align-items:center;justify-content:center;overflow:hidden}
     .card{width:100%;height:auto;max-height:none;padding:22px;overflow:visible;flex-shrink:0;transform-origin:center center}
     header{padding:0 18px} h2{font-size:38px} .lead{font-size:20px;line-height:1.4}
     .hero-art{min-height:180px} .question-title{font-size:52px} .story-panel{min-height:260px}
     .card:has(.mission-control){margin:0;}
     .card:has(.mission-control) .interactive-title{white-space:normal;font-size:32px;margin:6px 0;}
     .card:has(.mission-control)>.lead{margin:8px 0 16px;}
     .mission-control{grid-template-columns:minmax(0,2.3fr) minmax(0,1fr);gap:18px;align-items:stretch;}
     .control-panel{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:14px;padding:18px;min-width:0;}
     .control-header{grid-column:1/-1;margin:0;}
     .metric-grid{grid-template-columns:1fr;gap:8px;margin:0;}
     .metric{padding:10px;min-width:0;}
     .metric strong{font-size:17px;line-height:1.2;overflow-wrap:anywhere;}
     .metric span{margin-bottom:4px;}
     .activity-log{margin:0;gap:8px;align-content:start;}
     .log-row{padding:10px;font-size:15px;line-height:1.3;}
     .mission-actions{grid-column:1/-1;margin:0;}
     .mission-summary{padding:18px;min-width:0;}
     .mission-summary h3{font-size:24px;line-height:1.2;}
     .mission-summary .lead{font-size:17px!important;line-height:1.4;}
     .mission-summary .pill-row{margin-top:12px;gap:7px;}
     .mission-summary .pill{font-size:12px;padding:7px 9px;}
     .agent-trace{flex-wrap:wrap} .activity-log{max-height:none;overflow:visible}
    `;doc.head.append(style);
    const mobileStyle=doc.createElement('style');
    mobileStyle.textContent=`
     @media(min-width:0px){
      .app{height:100%!important;min-height:0!important;grid-template-rows:auto minmax(0,1fr) auto!important}
      header{padding:8px 12px!important;min-height:50px}
      .stage{padding:10px!important;align-items:stretch!important;overflow:hidden!important}
      .card{height:100%!important;max-height:100%!important;overflow-y:auto!important;overflow-x:hidden!important;transform:none!important;padding:18px!important;overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y}
      h2{font-size:30px!important}.lead{font-size:17px!important}.question-title{font-size:44px!important}
      .mission-control,.control-panel{display:grid!important;grid-template-columns:minmax(0,1fr)!important}
      .mission-summary{padding:16px!important}.mission-summary .lead{font-size:17px!important}
      .hero-art{min-height:220px!important}.story-panel{min-height:260px!important}
      footer{padding:8px 12px!important;min-height:56px}.controls{flex-wrap:wrap}
     }
    `;doc.head.append(mobileStyle);
    function fitCards(){
     mobileStyle.media=document.body.classList.contains('mobile-layout')?'all':'not all';
     if(document.body.classList.contains('mobile-layout')){doc.querySelectorAll('.card').forEach(card=>card.style.transform='none');return;}
     doc.querySelectorAll('.stage').forEach(stage=>{
      const card=stage.querySelector('.card');if(!card)return;
      card.style.transform='none';
      const scale=Math.min(1,(stage.clientHeight-24)/card.scrollHeight,(stage.clientWidth-24)/card.scrollWidth);
      card.style.transform=`scale(${Math.max(.1,scale)})`;
     });
    }
    fitCards();doc.fonts.ready.then(fitCards);doc.addEventListener('quiz-layout',()=>requestAnimationFrame(fitCards));
    const observer=new MutationObserver(()=>requestAnimationFrame(fitCards));
    observer.observe(doc.querySelector('main'),{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
    frame.contentWindow.addEventListener('resize',fitCards);
    doc.querySelectorAll('.home-link').forEach(a=>a.onclick=e=>{e.preventDefault();document.querySelector('header a').click();});
   };lesson.replaceChildren(frame);
   const fitFrame=()=>{if(document.body.classList.contains('mobile-layout')){frame.style.transform='none';frame.contentWindow?.dispatchEvent(new Event('resize'));return;}const scale=Math.min(lesson.clientWidth/1280,lesson.clientHeight/810);frame.style.transform=`translate(-50%,-50%) scale(${scale})`;};
   new ResizeObserver(fitFrame).observe(lesson);fitFrame();
  }else if(kind==='exercises'){exercises.hidden=false;markLesson(catalogue[0].id);exercises.querySelector('h1').focus({preventScroll:true});}else{features.hidden=false;features.querySelector('h1').focus({preventScroll:true});}
  history.replaceState(null,'',kind==='lesson'?'#wed-not-wet':kind==='exercises'?'#exercises':'#features');
 }
 document.querySelector('#features-link').onclick=e=>{e.preventDefault();open('features');};
 features.querySelector('.celebration-feature a').onclick=e=>{e.preventDefault();document.querySelector('#celebrate').click();};
 features.querySelector('a[href="#wed-not-wet"]').onclick=e=>{e.preventDefault();open('lesson');};
 document.addEventListener('storyboard:show',()=>{features.hidden=true;exercises.hidden=true;lesson.hidden=true;lesson.replaceChildren();document.body.classList.remove('features-mode','lesson-mode');});
 window.addEventListener('hashchange',()=>{if(location.hash==='#exercises')open('exercises');if(location.hash==='#features')open('features');if(location.hash==='#wed-not-wet')open('lesson');});
 if(location.hash==='#exercises')open('exercises');if(location.hash==='#features')open('features');if(location.hash==='#wed-not-wet')open('lesson');
})();
