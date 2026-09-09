const slides = [...document.querySelectorAll('.slide')];
const canvas = document.querySelector('#canvas');
const main = document.querySelector('main');
const back = document.querySelector('#back');
const next = document.querySelector('#next');
const dots = document.querySelector('#dots');
const dialog = document.querySelector('#detail-dialog');
let current = 0;
slides.forEach((slide, i) => {
  const button = document.createElement('button');
  button.setAttribute('aria-label', `Board ${i + 1}: ${slide.dataset.label}`);
  button.title = slide.dataset.label;
  button.onclick = () => show(i);
  dots.append(button);
});
function show(index, focus = true, writeHash = true) {
  document.dispatchEvent(new Event("storyboard:show"));
  current = Math.max(0, Math.min(slides.length - 1, Number.isFinite(index) ? index : 0));
  slides.forEach((slide, i) => { slide.hidden = i !== current; });
  document.querySelector('#content').scrollTop = 0;
  back.disabled = current === 0;
  const last = current === slides.length - 1;
  next.querySelector('span:last-child').textContent = last ? 'Front page' : 'Next';
  next.setAttribute('aria-label', last ? 'Return to front page' : 'Next stage');
  document.querySelector('#count').textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  [...dots.children].forEach((button, i) => button.setAttribute('aria-current', String(i === current)));
  if (writeHash) history.replaceState(null, '', `#${current + 1}`);
  fitHeadline();
  if (focus) slides[current].querySelector('h1').focus({ preventScroll: true });
}
back.onclick = () => window.LanceNews?.active ? window.LanceNews.step(-1) : show(current - 1);
next.onclick = () => window.LanceNews?.active ? window.LanceNews.step(1) : show((current + 1) % slides.length);
document.querySelector('header a').onclick = event => { event.preventDefault(); show(0); };
document.addEventListener('keydown', event => {
  if (dialog.open || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('button,a,input,textarea,select,[contenteditable]')) return;
  if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key)) { event.preventDefault(); show((current + 1) % slides.length); }
  if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); show(current - 1); }
  if (event.key === 'Home') { event.preventDefault(); show(0); }
  if (event.key === 'End') { event.preventDefault(); show(slides.length - 1); }
});
const mobileQuery = window.matchMedia('(max-width: 700px)');
const mobileDevice = navigator.userAgentData?.mobile === true || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let forceMobile = false;
function fitHeadline() {
  for (const [index, maximum] of [[0, 48], [5, 43]]) {
    const headline = slides[index].querySelector('h1');
    headline.style.fontSize = '';
    if (document.body.classList.contains('mobile-layout') || slides[index].hidden) continue;
    let size = maximum;
    headline.style.fontSize = `${size}px`;
    while (headline.scrollWidth > headline.clientWidth && size > 30) {
      size -= 0.5;
      headline.style.fontSize = `${size}px`;
    }
  }
}
function resize() {
  const mobile = mobileDevice || mobileQuery.matches || forceMobile;
  document.body.classList.toggle('mobile-layout', mobile);
  canvas.style.transform = mobile ? 'none' : `scale(${Math.min(main.clientWidth / 1440, main.clientHeight / 810)})`;
  const toggle = document.querySelector('#view-toggle');
  toggle.hidden = mobileDevice || mobileQuery.matches;
  toggle.textContent = forceMobile ? 'Desktop view' : 'Mobile view';
  toggle.setAttribute('aria-pressed', String(forceMobile));
  fitHeadline();
}
document.querySelector('#view-toggle').onclick = () => { forceMobile = !forceMobile; resize(); };
mobileQuery.addEventListener('change', resize);
document.fonts.ready.then(resize);
new ResizeObserver(resize).observe(main);
document.querySelector('#details').onclick = () => dialog.showModal();
window.addEventListener('hashchange', () => { if (!location.hash.startsWith('#article-')) show(Number(location.hash.slice(1)) - 1, true, false); });
show(Number(location.hash.slice(1)) - 1, false, !location.hash.startsWith('#article-'));
resize();
