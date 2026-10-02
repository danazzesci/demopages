(() => {
  'use strict';
  const canvas = document.querySelector('#canvas');
  const trigger = document.querySelector('.presenter-about');
  const photo = document.querySelector('.presenter-photo');
  const invitation = document.querySelector('.presenter-invitation text');
  if (!canvas || !trigger || !photo || !invitation) return;
  // Measure the actual script lettering, including the part outside its SVG box.
  photo.append(trigger);
  function positionLink() {
    const banner = photo.getBoundingClientRect();
    const script = invitation.getBoundingClientRect();
    const space = Math.max(0, banner.bottom - script.bottom);
    trigger.style.left = `${script.left + script.width / 2 - banner.left}px`;
    trigger.style.top = `${script.bottom - banner.top + space / 2}px`;
    trigger.style.fontSize = `${Math.max(8, Math.min(20, space * .62))}px`;
  }
  new ResizeObserver(positionLink).observe(photo);
  document.fonts.ready.then(positionLink);
  window.addEventListener('resize', positionLink);
  positionLink();
  const panel = document.createElement('section');
  panel.className = 'about-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'About Dan Schaupner');
  const header = document.createElement('div');
  header.className = 'about-panel-header';
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Close about';
  header.append(close);
  const slot = document.createElement('div');
  slot.className = 'about-frame-slot';
  const frame = document.createElement('iframe');
  frame.title = 'About Dan Schaupner';
  frame.referrerPolicy = 'no-referrer';
  slot.append(frame);
  panel.append(header, slot);
  canvas.append(panel);
  frame.addEventListener('load', () => {
    const doc = frame.contentDocument;
    if (!doc?.body) return;
    doc.addEventListener('click', event => {
      const link = event.target.closest('a[href="/#speaking-topics"],a[href="/#who-is-dan"],a[href="/speaking-topics/"]');
      if (!link) return;
      event.preventDefault();
      location.hash = link.getAttribute('href') === '/speaking-topics/' ? '#speaking-topics' : link.getAttribute('href').slice(1);
    });
    if (!frame.getAttribute('src').startsWith('/invited/')) {
      frame.style.visibility = 'visible';
      return;
    }
    const stylesheet = doc.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/invited/embedded.css?v=3';
    stylesheet.addEventListener('load', () => { frame.style.visibility = 'visible'; });
    doc.head.append(stylesheet);
  });
  let opening = 0;
  async function open(kind = 'about') {
    const attempt = ++opening;
    if (kind === 'about' && (!window.DanAboutAccess || !await window.DanAboutAccess.request())) {
      if (attempt === opening) { hide(); history.replaceState(null, '', '#1'); trigger.focus({ preventScroll: true }); }
      return;
    }
    if (attempt !== opening) return;
    const isTopics = kind === 'topics';
    const isBiography = kind === 'biography';
    const source = isTopics ? '/speaking-topics/?embedded=1' : isBiography ? '/who-is-dan/?embedded=1' : '/invited/';
    if (frame.getAttribute('src') !== source) {
      frame.style.visibility = 'hidden';
      frame.src = source;
    }
    frame.title = isTopics ? 'Current Speaking Topics' : isBiography ? 'Who is Dan Schaupner?' : 'About Dan Schaupner';
    panel.setAttribute('aria-label', frame.title);
    close.textContent = (isTopics || isBiography) ? 'Back to About' : 'Close about';
    panel.hidden = false;
    document.body.classList.add('about-open');
    close.focus({ preventScroll: true });
  }
  function hide() { panel.hidden = true; document.body.classList.remove('about-open'); }
  close.addEventListener('click', () => {
    if (['#speaking-topics', '#who-is-dan'].includes(location.hash)) { location.hash = '#about'; return; }
    hide();
    if (typeof show === 'function') show(0, false);
    history.replaceState(null, '', '#1');
    trigger.focus({ preventScroll: true });
  });
  trigger.addEventListener('click', event => {
    event.preventDefault();
    history.replaceState(null, '', '#about');
    open();
  });
  window.addEventListener('hashchange', () => {
    if (location.hash === '#about') open();
    else if (location.hash === '#speaking-topics') open('topics');
    else if (location.hash === '#who-is-dan') open('biography');
    else hide();
  });
  document.addEventListener('storyboard:show', hide);
  if (location.hash === '#about') open();
  else if (location.hash === '#speaking-topics') open('topics');
    else if (location.hash === '#who-is-dan') open('biography');
})();
