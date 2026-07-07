/* =====================================================================
   DOM ANIMATIONS — GSAP ScrollTrigger reveal + magnetic buttons + tilt
   Rules: 150-400ms · ease-out enter · stagger 30-80ms · reduced-motion
   Numbers formatted per active locale (window.Aurora.numberLocale()).
   Falls back to IntersectionObserver / static numbers if GSAP is absent.
   ===================================================================== */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const locale = () => (window.Aurora ? window.Aurora.numberLocale() : 'en-US');

  const reveals = document.querySelectorAll('.reveal');
  if (reduce) {
    reveals.forEach((el) => el.classList.add('in'));
  } else if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.hero .reveal').forEach((el, i) => {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.6, delay: 0.15 + i * 0.07, ease: 'power2.out',
        onStart: () => el.classList.add('in') });
    });
    gsap.utils.toArray('.reveal:not(.hero .reveal)').forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => el.classList.add('in') });
    });
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    reveals.forEach((el) => io.observe(el));
  }

  // Count-up stats (locale-aware, re-formatted on language switch)
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const done = () => { el.textContent = target.toLocaleString(locale()); el.dataset.done = '1'; };
    if (reduce || !window.gsap) { done(); return; }
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => gsap.to(obj, { v: target, duration: 1.4, ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString(locale()); },
        onComplete: () => { el.dataset.done = '1'; } })
    });
  });

  if (reduce) return;

  // Magnetic buttons (rule: Complex hover — clamp pull, 1-2 focal elements)
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'elastic.out(1,0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'elastic.out(1,0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.35);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });

  // Card spotlight follow (updates CSS vars only — cheap)
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();
