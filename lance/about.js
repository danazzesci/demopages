(() => {
  'use strict';
  const main = document.querySelector('main');
  const trigger = document.querySelector('.presenter-about');
  if (!main || !trigger) return;
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
  const frame = document.createElement('iframe');
  frame.title = 'About Dan Schaupner';
  frame.referrerPolicy = 'no-referrer';
  panel.append(header, frame);
  main.append(panel);
  function open() {
    if (!frame.getAttribute('src')) frame.src = '/about/';
    panel.hidden = false;
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
