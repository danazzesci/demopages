(() => {
  const root = document.documentElement;
  const sections = [...document.querySelectorAll('.section')];

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    const progress = scrollable > 0 ? scrollY / scrollable : 0;
    root.style.setProperty('--progress', Math.max(0, Math.min(1, progress)).toFixed(4));
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, {threshold:.18});

  sections.forEach(section => observer.observe(section));
  updateProgress();
  addEventListener('scroll', updateProgress, {passive:true});
  addEventListener('resize', updateProgress);
})();
