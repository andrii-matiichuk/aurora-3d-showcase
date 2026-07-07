/* =====================================================================
   TOUCH FX — mobile-only interactive canvas at the end of the page.
   A grid of dots reacts to touch/pointer: they scatter away from the
   finger, brighten toward the accent colour, and each tap emits a ripple.
   Pure Canvas 2D (no libraries) so it runs even on the slow-network path.
   Respects prefers-reduced-motion and pauses when off-screen or hidden.
   ===================================================================== */
(function () {
  const canvas = document.getElementById('touch-fx');
  if (!canvas) return;

  const isTouch = () => document.documentElement.classList.contains('is-touch');
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const hint = document.querySelector('.touch-hint');

  let dots = [], ripples = [];
  let W = 0, H = 0;
  const touch = { x: 0, y: 0, active: false };
  let raf = null, onScreen = false;

  function build() {
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    if (W === 0 || H === 0) return;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = [];
    const gap = 34;
    for (let y = gap / 2; y < H; y += gap) {
      for (let x = gap / 2; x < W; x += gap) {
        dots.push({ x0: x, y0: y, x: x, y: y, vx: 0, vy: 0 });
      }
    }
  }

  function point(e) {
    const rect = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    if (!p) return;
    touch.x = p.clientX - rect.left;
    touch.y = p.clientY - rect.top;
  }

  function drawStatic() {
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      ctx.beginPath();
      ctx.arc(d.x0, d.y0, 1.6, 0, 6.2832);
      ctx.fillStyle = 'rgba(167,139,250,0.30)';
      ctx.fill();
    }
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    ctx.clearRect(0, 0, W, H);
    const R = 92;
    for (const d of dots) {
      if (touch.active) {
        const dx = d.x - touch.x, dy = d.y - touch.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < R) {
          const f = (R - dist) / R * 4.2;         // push away from finger
          d.vx += dx / dist * f;
          d.vy += dy / dist * f;
        }
      }
      d.vx += (d.x0 - d.x) * 0.08;                // spring back to base
      d.vy += (d.y0 - d.y) * 0.08;
      d.vx *= 0.85; d.vy *= 0.85;
      d.x += d.vx; d.y += d.vy;

      const disp = Math.hypot(d.x - d.x0, d.y - d.y0);
      const near = touch.active
        ? Math.max(0, 1 - Math.hypot(d.x - touch.x, d.y - touch.y) / 150)
        : 0;
      const rad = 1.4 + Math.min(disp * 0.12, 2.4) + near * 1.8;
      // lerp purple (139,92,246) -> gold (251,191,36) by proximity
      const r = Math.round(139 + (251 - 139) * near);
      const g = Math.round(92 + (191 - 92) * near);
      const b = Math.round(246 + (36 - 246) * near);
      ctx.beginPath();
      ctx.arc(d.x, d.y, rad, 0, 6.2832);
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (0.25 + near * 0.6) + ')';
      ctx.fill();
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r += 5; rp.a -= 0.018;
      if (rp.a <= 0) { ripples.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, 6.2832);
      ctx.strokeStyle = 'rgba(251,191,36,' + rp.a + ')';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function start() {
    if (raf || !isTouch() || W === 0) return;
    if (mqReduce.matches) { drawStatic(); return; }
    frame();
  }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  // ---- Input ----
  function down(e) {
    point(e); touch.active = true;
    ripples.push({ x: touch.x, y: touch.y, r: 0, a: 0.85 });
    if (ripples.length > 6) ripples.shift();
    if (hint) hint.style.opacity = '0';
  }
  function move(e) { point(e); touch.active = true; }
  function up() { touch.active = false; }

  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);

  // ---- Lifecycle: build on demand, pause when off-screen / hidden / desktop ----
  function refresh() {
    if (!isTouch()) { stop(); return; }
    build();
    if (mqReduce.matches) { drawStatic(); return; }
    if (onScreen) start();
  }

  if (window.IntersectionObserver) {
    new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
      if (onScreen) refresh(); else stop();
    }, { threshold: 0.05 }).observe(canvas);
  } else {
    onScreen = true; refresh();
  }

  window.addEventListener('resize', refresh);
  window.addEventListener('orientationchange', refresh);
  mqReduce.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (onScreen) start();
  });

  refresh();
})();
