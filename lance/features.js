(() => {
 const content=document.querySelector('#content');
 const features=document.createElement('section');features.id='features-view';features.hidden=true;
 features.innerHTML='<h1 tabindex="-1">Features</h1><article class="feature-entry"><a href="#wed-not-wet">Wed Not Wet — An Agentic AI Lesson</a><p>A wedding threatened by rain becomes a practical lesson in agentic AI: an orchestrator coordinates specialist agents, gathers evidence, tests possible plans, and adapts until the wedding’s objectives are met.</p><p>See why a clear objective, sound evidence, and human approval matter when AI moves from producing answers to coordinating action. Includes the complete storyboard, assessment, and simulation.</p></article>';
 const lesson=document.createElement('section');lesson.id='lesson-view';lesson.hidden=true;content.append(features,lesson);
 function open(kind){
  document.dispatchEvent(new Event('storyboard:show'));
  document.querySelectorAll('.board').forEach(e=>e.hidden=true);
  document.body.classList.add('article-mode','features-mode');document.querySelector('#article-home').hidden=false;content.scrollTop=0;
  if(kind==='lesson'){
   document.body.classList.add('lesson-mode');lesson.hidden=false;
   const frame=document.createElement('iframe');frame.title='Wed Not Wet — complete interactive lesson';frame.src='/wed_not_wet/?embedded=1';
   frame.onload=()=>{
    const doc=frame.contentDocument;
    const style=doc.createElement('style');style.textContent='.app{grid-template-rows:56px minmax(0,1fr) 58px} .stage{padding:12px} .card{padding:20px;max-height:100%} header{padding:0 14px} h2{font-size:clamp(26px,4vw,42px)} .hero-art{min-height:160px}';doc.head.append(style);
    doc.querySelectorAll('.home-link').forEach(a=>a.onclick=e=>{e.preventDefault();document.querySelector('header a').click();});
   };lesson.replaceChildren(frame);
  }else{features.hidden=false;features.querySelector('h1').focus({preventScroll:true});}
  history.replaceState(null,'',kind==='lesson'?'#wed-not-wet':'#features');
 }
 document.querySelector('#features-link').onclick=e=>{e.preventDefault();open('features');};
 features.querySelector('a').onclick=e=>{e.preventDefault();open('lesson');};
 document.addEventListener('storyboard:show',()=>{features.hidden=true;lesson.hidden=true;lesson.replaceChildren();document.body.classList.remove('features-mode','lesson-mode');});
 window.addEventListener('hashchange',()=>{if(location.hash==='#features')open('features');if(location.hash==='#wed-not-wet')open('lesson');});
 if(location.hash==='#features')open('features');if(location.hash==='#wed-not-wet')open('lesson');
})();
