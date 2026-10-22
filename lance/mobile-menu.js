(() => {
  const source = document.querySelector('.banner-links');
  const header = document.querySelector('header');
  if (!source || !header) return;
  const toggle = document.createElement('button');
  toggle.className = 'mobile-menu-toggle';
  toggle.type = 'button';
  toggle.textContent = '☰ Menu';
  toggle.setAttribute('aria-haspopup', 'dialog');
  toggle.setAttribute('aria-controls', 'mobile-navigation');
  toggle.setAttribute('aria-expanded', 'false');
  header.append(toggle);
  const panel = document.createElement('dialog');
  panel.id = 'mobile-navigation';
  panel.setAttribute('aria-labelledby', 'mobile-navigation-title');
  panel.innerHTML = '<div class="mobile-menu-heading"><h2 id="mobile-navigation-title">Explore the site</h2><button type="button" class="mobile-menu-close" aria-label="Close navigation">✕</button></div><nav aria-label="Mobile site navigation"></nav>';
  const nav = panel.querySelector('nav');
  const close = () => panel.close();
  function populate() {
    nav.replaceChildren();
    const sources = [...source.querySelectorAll('a'), document.querySelector('#page-tour')].filter(Boolean);
    for (const original of sources) {
      const item = document.createElement(original.tagName === 'A' ? 'a' : 'button');
      item.textContent = original.getAttribute('aria-label') || original.textContent.trim();
      if (original.tagName === 'A') {
        item.href = original.href;
        if (original.target) { item.target = original.target; item.rel = 'noopener noreferrer'; }
      } else item.type = 'button';
      item.addEventListener('click', event => {
        close();
        if (original.tagName !== 'A' || original.getAttribute('href')?.startsWith('#')) {
          event.preventDefault();
          original.click();
        }
      });
      nav.append(item);
    }
  }
  document.body.append(panel);
  toggle.addEventListener('click', () => {
    populate();
    panel.showModal();
    toggle.setAttribute('aria-expanded', 'true');
  });
  panel.querySelector('.mobile-menu-close').addEventListener('click', close);
  panel.addEventListener('close', () => toggle.setAttribute('aria-expanded', 'false'));
  panel.addEventListener('click', event => {
    const r = panel.getBoundingClientRect();
    if (event.target === panel && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) close();
  });
  matchMedia('(max-width: 700px)').addEventListener('change', event => { if (!event.matches && panel.open) close(); });
})();
