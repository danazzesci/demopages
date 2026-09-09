(() => {
  const symbols = ['NASDAQ:NVDA','NASDAQ:MSFT','NYSE:ORCL','NASDAQ:GOOGL','NYSE:J','NYSE:CBRE','NASDAQ:AMZN','NASDAQ:META','NASDAQ:AVGO','NASDAQ:AMD','NYSE:TSM','NASDAQ:MU','NYSE:ANET','NYSE:VRT','NYSE:ETN','NYSE:GEV','NASDAQ:EQIX','NYSE:DLR','NASDAQ:MRVL','NYSE:COHR','NASDAQ:LITE','NYSE:DELL','NYSE:HPE','NYSE:PWR','NASDAQ:MYRG','NYSE:PRIM','NASDAQ:CEG','NYSE:VST'];
  const strip = document.querySelector('.market-strip');
  const quotes = document.querySelector('#market-quotes');
  const status = document.querySelector('#market-status');
  const pause = document.querySelector('#market-pause');
  let start = 0, count = 0, ready = false;
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastTurn = Date.now();
  function render() {
    quotes.replaceChildren();
    quotes.style.setProperty('--quote-count', count);
    for (let i = 0; i < count; i++) {
      const symbol = symbols[(start + i) % symbols.length];
      const slot = document.createElement('div');
      slot.className = 'quote-slot';
      if (ready) {
        const widget = document.createElement('tv-single-ticker');
        widget.setAttribute('symbol', symbol);
        widget.setAttribute('theme', 'dark');
        widget.setAttribute('transparent', '');
        widget.setAttribute('hide-market-status', '');
        slot.append(widget);
      } else {
        const fallback = document.createElement('span');
        fallback.className = 'quote-fallback';
        fallback.textContent = `${symbol.split(':')[1]} —`;
        slot.append(fallback);
      }
      quotes.append(slot);
    }
  }
  function advance(direction) {
    start = (start + direction * count + symbols.length) % symbols.length;
    lastTurn = Date.now();
    render();
  }
  function updatePause() {
    pause.textContent = paused ? '▶' : 'Ⅱ';
    pause.setAttribute('aria-pressed', String(paused));
    pause.setAttribute('aria-label', paused ? 'Resume stock rotation' : 'Pause stock rotation');
  }
  pause.onclick = () => { paused = !paused; lastTurn = Date.now(); updatePause(); };
  document.querySelector('#market-prev').onclick = () => advance(-1);
  document.querySelector('#market-next').onclick = () => advance(1);
  new ResizeObserver(() => {
    const nextCount = Math.max(1, Math.min(7, Math.floor(quotes.clientWidth / 290)));
    if (nextCount !== count) { count = nextCount; render(); }
  }).observe(quotes);
  setInterval(() => {
    if (!paused && !document.hidden && !strip.matches(':hover') && !strip.contains(document.activeElement) && Date.now() - lastTurn >= 15000) advance(1);
  }, 1000);
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'https://widgets.tradingview-widget.com/w/en/tv-single-ticker.js';
  script.onerror = () => { status.textContent = 'Market data unavailable. Check your connection.'; };
  document.head.append(script);
  customElements.whenDefined('tv-single-ticker').then(() => { ready = true; status.textContent = ''; render(); });
  setTimeout(() => { if (!ready) status.textContent = 'Market data unavailable. Check your connection.'; }, 15000);
  updatePause();
})();
