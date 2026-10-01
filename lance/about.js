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
  let contentHeight = 1000;
  function fitPage() {
    if (panel.hidden || !slot.clientWidth || !slot.clientHeight) return;
    const scale = Math.min(slot.clientWidth / 1440, slot.clientHeight / contentHeight);
    frame.style.height = `${contentHeight}px`;
    frame.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
  frame.addEventListener('load', () => {
    const doc = frame.contentDocument;
    if (!doc?.body) return;
    const style = doc.createElement('style');
    style.textContent = 'html,body{min-height:0!important;height:auto!important;overflow:hidden!important}body{padding:12px!important}.page{margin:0 auto!important}';
    doc.head.append(style);
    const measure = () => {
      contentHeight = Math.ceil(doc.body.getBoundingClientRect().height);
      fitPage();
      frame.style.visibility = 'visible';
    };
    new ResizeObserver(measure).observe(doc.body);
    doc.fonts.ready.then(measure);
    for (const image of doc.images) if (!image.complete) image.addEventListener('load', measure, { once: true });
    measure();
  });
  new ResizeObserver(fitPage).observe(slot);
  function open() {
    if (!frame.getAttribute('src')) frame.src = '/about/';
    panel.hidden = false;
    fitPage();
    close.focus({ preventScroll: true });
  }
  function hide() { panel.hidden = true; }
  close.addEventListener('click', () => {
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
    if (location.hash === '#about') open(); else hide();
  });
  document.addEventListener('storyboard:show', hide);
  if (location.hash === '#about') open();
})();
