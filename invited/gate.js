'use strict';
(() => {
  const expectedOrigin='https://danschaupner.com';
  const endpoint='https://mmxihcwpywptlazzpglg.supabase.co/functions/v1/invited-content';
  const publicKey='sb_publishable_HOrG9pPf6F16tt9_Q2CcTg_Ia9SB0ew';
  const gate=document.getElementById('gate');
  const form=document.getElementById('unlock');
  const field=document.getElementById('password');
  const status=document.getElementById('status');
  const submit=document.getElementById('submit');
  const view=document.getElementById('document');
  const frame=document.getElementById('briefing');
  const embedded = new URLSearchParams(location.search).get('embedded') === '1';
  document.body.classList.toggle('embedded', embedded);
  // Discard legacy invitation tokens without accepting them as authorization.
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
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
    submit.textContent='Open invitation';
    field.focus();
  }
  if(location.origin!==expectedOrigin) {
    form.hidden=true;
    const message=document.createElement('p');
    message.textContent='This briefing is available only at danschaupner.com.';
    gate.append(message);
    return;
  }

  function preparePrintLayout(doc) {
    doc.querySelector('.print-sheet')?.remove();
    const sheet=doc.createElement('article');
    sheet.className='print-sheet';
    const masthead=doc.createElement('header');
    masthead.className='print-masthead';
    masthead.textContent='DAN SCHAUPNER  /  danschaupner.com';
    sheet.append(masthead);
    const title=doc.querySelector('#headline').cloneNode(true);
    title.removeAttribute('id');
    sheet.append(title,doc.querySelector('.standfirst').cloneNode(true));
    const summary=doc.createElement('section');
    summary.className='print-summary';
    const identity=doc.createElement('div');
    identity.className='print-identity';
    identity.append(doc.querySelector('figcaption strong').cloneNode(true),doc.querySelector('figcaption span').cloneNode(true));
    summary.append(identity,doc.querySelector('.intro').cloneNode(true));
    sheet.append(summary);
    const audiences=doc.createElement('section');
    audiences.className='print-audiences';
    const prompt=doc.querySelector('.profile-prompt').cloneNode(true);
    prompt.className='print-prompt';
    sheet.append(prompt);
    doc.querySelectorAll('.audience').forEach(section=>audiences.append(section.cloneNode(true)));
    sheet.append(audiences);
    const services=doc.querySelector('.services').cloneNode(true);
    services.querySelectorAll('.service-name br').forEach(br=>br.replaceWith(' '));
    services.querySelectorAll('img').forEach(image=>image.remove());
    services.querySelectorAll('.speaking-topics-link').forEach(link=>link.remove());
    sheet.append(services);
    const footer=doc.createElement('footer');
    footer.className='print-footer';
    const closing=doc.querySelector('.page > footer p').cloneNode(true);
    const contact=doc.createElement('p');
    contact.textContent='danschaupner.com  |  info@danschaupner.com';
    footer.append(closing,contact);
    sheet.append(footer);
    doc.body.append(sheet);
  }

  frame.addEventListener('load',()=>{
    if(view.hidden || !frame.hasAttribute('srcdoc')) return;
    preparePrintLayout(frame.contentDocument);
    document.getElementById('print').disabled=false;
    const resize=()=>{
      const doc=frame.contentDocument;
      const page=doc?.querySelector('.page');
      // Measure the content, independent of the iframe's current viewport height.
      const height=page ? page.offsetTop + page.getBoundingClientRect().height : doc?.body.scrollHeight;
      frame.style.height=`${Math.ceil(Math.max(400,height||800))}px`;
    };
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
      if(!response.ok || typeof result.html!=='string') throw Error(result.error || 'Unable to open the invitation.');
      // Supabase content is isolated in a frame with no script execution.
      frame.removeAttribute('src');
      const documentHtml = new DOMParser().parseFromString(result.html, 'text/html');
      if (embedded) {
        const sheet = documentHtml.createElement('link');
        sheet.rel = 'stylesheet';
        sheet.href = 'https://danschaupner.com/invited/embedded.css?v=4';
        documentHtml.head.append(sheet);
      }
      const printStyles = documentHtml.createElement('link');
      printStyles.rel='stylesheet';
      printStyles.href='https://danschaupner.com/invited/print.css?v=1';
      documentHtml.head.append(printStyles);
      document.getElementById('print').disabled=true;
      frame.srcdoc = '<!doctype html>' + documentHtml.documentElement.outerHTML;
      gate.hidden=true;
      view.hidden=false;
      expiry=setTimeout(()=>lock('The invitation has locked. Enter the password to reopen it.'),30*60*1000);
      document.getElementById('lock').focus();
    } catch(error) {
      if(current!==generation) return;
      status.textContent=error.name==='TimeoutError'?'The invitation is taking too long. Please try again.':error.message;
      field.focus();
    } finally {
      if(current===generation){submit.disabled=false;submit.textContent='Open invitation';}
    }
  });
  document.getElementById('lock').addEventListener('click',()=>lock());
  document.getElementById('print').addEventListener('click',async()=>{
    if(view.hidden || !frame.contentDocument?.querySelector('.print-sheet')) return;
    await frame.contentDocument.fonts.ready;
    frame.contentWindow.print();
  });
  window.addEventListener('pagehide', () => lock());
  // Clear delivered content when restored from the browser's back/forward cache.
  window.addEventListener('pageshow',event=>{if(event.persisted)lock();});
})();
