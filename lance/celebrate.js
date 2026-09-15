(() => {
 const button=document.createElement('button');button.id='celebrate';button.innerHTML='<img src="/lance/assets/celebrate-up.png" alt=""><span>Celebrate</span>';button.setAttribute('aria-label','Celebrate with music and a short video');
 document.querySelector('header').insertBefore(button,document.querySelector('#features-link'));
 const view=document.createElement('section');view.id='celebration-view';view.hidden=true;view.setAttribute('aria-label','Celebration');
 view.innerHTML='<video playsinline preload="none" aria-label="Seinfeld, Ted Lasso, party celebration, and endzone celebration"></video><button class="celebration-close" aria-label="Stop celebration">Close ×</button><p class="celebration-error" hidden>Playback could not start. Please close and try again.</p>';
 document.querySelector('#canvas').append(view);const video=view.querySelector('video');
 function stop(){video.pause();video.currentTime=0;view.hidden=true;button.setAttribute('aria-pressed','false');button.querySelector('img').src='/lance/assets/celebrate-up.png';button.focus({preventScroll:true});}
 button.setAttribute('aria-pressed','false');
 button.onclick=()=>{if(!view.hidden){stop();return;}view.hidden=false;view.querySelector('.celebration-error').hidden=true;button.setAttribute('aria-pressed','true');button.querySelector('img').src='/lance/assets/celebrate-down.png';if(!video.src)video.src='/lance/assets/celebrate.mp4';video.currentTime=0;video.play().catch(()=>{view.querySelector('.celebration-error').hidden=false;});view.querySelector('button').focus({preventScroll:true});};
 video.addEventListener('ended',stop);view.querySelector('button').onclick=stop;
 document.addEventListener('keydown',e=>{if(!view.hidden&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();stop();}},true);
 document.addEventListener('storyboard:show',()=>{if(!view.hidden)stop();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&!view.hidden)stop();});
})();
