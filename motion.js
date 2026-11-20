// One motion layer for the page. Reduced motion, or no IntersectionObserver, leaves the complete still page.
// [data-reveal] and [data-split] play their entrance once when they come into view.
// [data-scrub="open|ink"] set --open or --ink from 0 to 1 as their top climbs the screen, and stay at 1 once reached.
// [data-scrub="drift"] sets --drift from 0 to 1 while the element crosses the screen, in both directions.
// Scroll position is read in a scroll listener, so Safari, which has no CSS scroll timelines, gets the same motion.
(() => {
  const root = document.documentElement;
  // The inline script in each page's head turns the layer on and splits headlines before first paint.
  if (!root.classList.contains('motion')) return;
  window.gsMotion = true;
  document.querySelectorAll('[data-split]').forEach(el => window.gsSplit && gsSplit(el));

  const reveal = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px', threshold: 0 });
  document.querySelectorAll('[data-reveal], [data-split]').forEach(el => reveal.observe(el));

  const latched = [...document.querySelectorAll('[data-scrub="open"], [data-scrub="ink"]')];
  const drifting = new Set();
  const seen = new IntersectionObserver(entries => entries.forEach(e => {
    e.isIntersecting ? drifting.add(e.target) : drifting.delete(e.target);
    queue();
  }), { rootMargin: '15% 0px' });
  document.querySelectorAll('[data-scrub="drift"]').forEach(el => seen.observe(el));

  const clamp = v => Math.min(1, Math.max(0, v));
  let queued = false;
  const update = () => {
    queued = false;
    const vh = innerHeight;
    for (const el of latched) {
      if (el._done) continue;
      const top = el.getBoundingClientRect().top;
      const start = parseFloat(el.dataset.start || '0.95');
      const end = parseFloat(el.dataset.end || '0.4');
      const p = clamp((start * vh - top) / ((start - end) * vh));
      if (p > (el._p || 0)) { el._p = p; el.style.setProperty('--' + el.dataset.scrub, p.toFixed(4)); }
      if (p >= 1) el._done = true;
    }
    for (const el of drifting) {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--drift', clamp((vh - r.top) / (vh + r.height)).toFixed(4));
    }
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  latched.forEach(el => el.style.setProperty('--' + el.dataset.scrub, '0'));

  // A jump link, find in page or a fast flick can carry the screen past an entrance before it plays.
  // When scrolling settles, everything above the bottom of the screen is shown and every stance is inked.
  let settle;
  const catchUp = () => {
    const vh = innerHeight;
    document.querySelectorAll('[data-reveal]:not(.in), [data-split]:not(.in)').forEach(el => {
      if (el.getBoundingClientRect().top < vh) { el.classList.add('in'); reveal.unobserve(el); }
    });
    for (const el of latched) {
      if (!el._done && el.getBoundingClientRect().top < vh * 0.5) { el._done = true; el.style.setProperty('--' + el.dataset.scrub, '1'); }
    }
  };
  addEventListener('scroll', () => { clearTimeout(settle); settle = setTimeout(catchUp, 180); }, { passive: true });
  addEventListener('hashchange', () => setTimeout(catchUp, 600));
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  update();
})();
