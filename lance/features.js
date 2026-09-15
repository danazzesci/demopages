(() => {
 const content=document.querySelector('#content');
 const features=document.createElement('section');features.id='features-view';features.hidden=true;
 features.innerHTML='<h1 tabindex="-1">Features</h1><article class="feature-entry"><a href="#wed-not-wet">Wed Not Wet — An Agentic AI Lesson</a><p>A wedding threatened by rain becomes a practical lesson in agentic AI: an orchestrator coordinates specialist agents, gathers evidence, tests possible plans, and adapts until the wedding’s objectives are met.</p><p>See why a clear objective, sound evidence, and human approval matter when AI moves from producing answers to coordinating action. Includes the complete storyboard, assessment, and simulation.</p></article><article class="feature-entry celebration-feature"><a href="#celebrate">Celebrate — Break glass in case of celebration</a><p>Sometimes you need a quick way to celebrate something you’ve accomplished, no matter how big or small.</p><p class="celebration-warning"><strong>Warning: this makes noise.</strong> Turn the volume down if you’re not sure—or turn it all the way up for maximum effect.</p></article>';
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
    function fitCards(){
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
   const fitFrame=()=>{const scale=Math.min(lesson.clientWidth/1280,lesson.clientHeight/810);frame.style.transform=`translate(-50%,-50%) scale(${scale})`;};
   new ResizeObserver(fitFrame).observe(lesson);fitFrame();
  }else{features.hidden=false;features.querySelector('h1').focus({preventScroll:true});}
  history.replaceState(null,'',kind==='lesson'?'#wed-not-wet':'#features');
 }
 document.querySelector('#features-link').onclick=e=>{e.preventDefault();open('features');};
 features.querySelector('.celebration-feature a').onclick=e=>{e.preventDefault();document.querySelector('#celebrate').click();};
 features.querySelector('a').onclick=e=>{e.preventDefault();open('lesson');};
 document.addEventListener('storyboard:show',()=>{features.hidden=true;lesson.hidden=true;lesson.replaceChildren();document.body.classList.remove('features-mode','lesson-mode');});
 window.addEventListener('hashchange',()=>{if(location.hash==='#features')open('features');if(location.hash==='#wed-not-wet')open('lesson');});
 if(location.hash==='#features')open('features');if(location.hash==='#wed-not-wet')open('lesson');
})();
