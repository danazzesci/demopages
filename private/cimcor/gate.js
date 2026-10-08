'use strict';
(() => {
  const expectedOrigin='https://danschaupner.com';
  const endpoint='https://mmxihcwpywptlazzpglg.supabase.co/functions/v1/cimcor-briefing';
  const publicKey='sb_publishable_HOrG9pPf6F16tt9_Q2CcTg_Ia9SB0ew';
  const gate=document.getElementById('gate');
  const form=document.getElementById('unlock');
  const field=document.getElementById('password');
  const status=document.getElementById('status');
  const submit=document.getElementById('submit');
  const view=document.getElementById('document');
  const frame=document.getElementById('briefing');
  let expiry=null,observer=null,generation=0;
  function lock(message='') {
    generation++;
    clearTimeout(expiry);
    observer?.disconnect();
    observer=null;
    frame.removeAttribute('srcdoc');
    frame.src='about:blank';
    view.hidden=true;
    gate.hidden=false;
    field.value='';
    status.textContent=message;
    submit.disabled=false;
    submit.textContent='View briefing';
    field.focus();
  }
  if(location.origin!==expectedOrigin) {
    form.hidden=true;
    const message=document.createElement('p');
    message.textContent='This briefing is available only at danschaupner.com.';
    gate.append(message);
    return;
  }
  frame.addEventListener('load',()=>{
    if(view.hidden || !frame.hasAttribute('srcdoc')) return;
    const resize=()=>{frame.style.height=`${Math.max(400,frame.contentDocument?.documentElement.scrollHeight||800)}px`;};
    resize();
    observer?.disconnect();
    observer=new ResizeObserver(resize);
    observer.observe(frame.contentDocument.body);
  });
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const current=++generation;
    submit.disabled=true;
    submit.textContent='Opening…';
    status.textContent='';
    // Credentials are sent once over HTTPS; never stored in browser storage.
    const body=JSON.stringify({password:field.value});
    field.value='';
    try {
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',apikey:publicKey},
        body,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(20000)});
      const result=await response.json();
      if(current!==generation) return;
      if(!response.ok || typeof result.html!=='string') throw Error(result.error || 'Unable to open the briefing.');
      // Supabase content is isolated in a frame with no script execution.
      frame.removeAttribute('src');
      frame.srcdoc=result.html;
      gate.hidden=true;
      view.hidden=false;
      expiry=setTimeout(()=>lock('The briefing has locked. Enter the password to reopen it.'),30*60*1000);
      document.getElementById('lock').focus();
    } catch(error) {
      if(current!==generation) return;
      status.textContent=error.name==='TimeoutError'?'The briefing is taking too long. Please try again.':error.message;
      field.focus();
    } finally {
      if(current===generation){submit.disabled=false;submit.textContent='View briefing';}
    }
  });
  document.getElementById('lock').addEventListener('click',()=>lock());
  document.getElementById('print').addEventListener('click',()=>frame.contentWindow?.print());
  // Clear delivered content when restored from the browser's back/forward cache.
  window.addEventListener('pageshow',event=>{if(event.persisted)lock();});
})();
