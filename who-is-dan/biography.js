(() => {
  'use strict';
  const detail = document.querySelector('#story-detail');
  const pane = document.querySelector('.story-pane');
  const back = document.querySelector('.back-to-biography');
  const buttons = [];
  let selected = null;
  for (const story of window.DAN_STORIES) {
    const anchor = document.querySelector(`[data-story-anchor="${story.anchor}"]`) || document.querySelector('.story-anchor');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `hotspot ${story.kind || ''}`;
    button.setAttribute('aria-label', `Explore: ${story.title}`);
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-controls', 'story-detail');
    button.title = story.title;
    const image = document.createElement('img');
    image.src = story.image;
    image.alt = story.imageAlt;
    image.width = 58;
    image.height = 58;
    button.append(image);
    button.addEventListener('click', () => {
      for (const other of buttons) other.setAttribute('aria-pressed', String(other === button));
      selected = button;
      const heading = document.createElement('h2');
      heading.textContent = story.title;
      const text = document.createElement('p');
      text.textContent = story.text;
      detail.replaceChildren(heading, text);
      back.hidden = false;
      if (window.matchMedia('(max-width:900px)').matches) pane.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    buttons.push(button);
    anchor.append(button);
  }
  back.addEventListener('click', () => {
    selected?.focus({ preventScroll: true });
    selected?.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
})();
