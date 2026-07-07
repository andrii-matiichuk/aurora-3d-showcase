/* =====================================================================
   3D SCENE — follows ui-ux-pro-max/data/stacks/threejs.csv rules:
   single renderer · pixelRatio cap 2 · alpha canvas · ACES tone mapping
   · Clock delta once/frame · InstancedMesh · Points particles · fog
   · drag-to-orbit (spherical) · reduced-motion reactive · ResizeObserver
   Requires THREE (and optionally gsap) to be loaded first.
   ===================================================================== */
(function () {
  const canvas = document.getElementById('scene');
  if (!window.THREE) { console.warn('Three.js not loaded'); return; }

  // reduced-motion — reactive (rule: Accessibility/prefers-reduced-motion)
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  let noMotion = mq.matches;
  mq.addEventListener('change', (e) => { noMotion = e.matches; });

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0F0F23, 0.035);

  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 9);
  camera.lookAt(0, 0, 0);

  // Device-adaptive quality: lighter on touch devices (phones/tablets), small
  // screens, and low-memory hardware — smoother on Android, iOS and tablets.
  const touchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
                      (navigator.maxTouchPoints || 0) > 1;
  const light = touchDevice ||
                Math.min(window.innerWidth, window.innerHeight) < 768 ||
                (navigator.deviceMemory && navigator.deviceMemory <= 4);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !light, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, light ? 1.5 : 2));   // cap DPR
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setClearColor(0x000000, 0);                            // CSS provides bg
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Lights: ambient fill + directional key + accent points (rule: Ambient+Directional min)
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(5, 8, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0xFBBF24, 0.9, 40);            // gold accent rim
  rim.position.set(-6, -3, 4);
  scene.add(rim);
  const fill = new THREE.PointLight(0x8B5CF6, 1.1, 40);           // purple fill
  fill.position.set(6, 2, -2);
  scene.add(fill);

  // ---- Hero crystal: icosahedron, PBR material ----
  const heroGeo = new THREE.IcosahedronGeometry(2.1, 0);
  const heroMat = new THREE.MeshStandardMaterial({
    color: 0x8B5CF6, metalness: 0.65, roughness: 0.25, flatShading: true
  });
  const hero = new THREE.Mesh(heroGeo, heroMat);
  scene.add(hero);

  // wireframe overlay (shares geometry) for a "spatial" edge look
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(heroGeo),
    new THREE.LineBasicMaterial({ color: 0xA78BFA, transparent: true, opacity: 0.35 })
  );
  scene.add(wire);

  // ---- Orbiting shards: ONE InstancedMesh (rule: InstancedMesh 50+) ----
  const SHARDS = light ? 36 : 60;
  const shardGeo = new THREE.OctahedronGeometry(0.16, 0);
  const shardMat = new THREE.MeshStandardMaterial({ color: 0xFBBF24, metalness: 0.4, roughness: 0.4 });
  const shards = new THREE.InstancedMesh(shardGeo, shardMat, SHARDS);
  const dummy = new THREE.Object3D();
  const shardData = [];
  for (let i = 0; i < SHARDS; i++) {
    const r = 3.2 + Math.random() * 2.8;
    const a = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 5;
    shardData.push({ r, a, y, speed: 0.15 + Math.random() * 0.35, spin: Math.random() * Math.PI });
    dummy.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    dummy.updateMatrix();
    shards.setMatrixAt(i, dummy.matrix);
  }
  shards.instanceMatrix.needsUpdate = true;
  scene.add(shards);

  // ---- Particle field: Points + BufferGeometry (rule: Points not Meshes) ----
  const P = light ? 1400 : 2500;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(P * 3);
  for (let i = 0; i < P * 3; i++) pPos[i] = (Math.random() - 0.5) * 34;
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 0.045, color: 0xA78BFA, transparent: true, opacity: 0.7, depthWrite: false
  }));
  scene.add(particles);

  // ---- Drag-to-orbit (rule: Custom Drag Orbit Fallback — spherical coords) ----
  let R = camera.position.length();     // orbit radius (also tweened in intro)
  let theta = 0;                        // azimuth  (horizontal drag)
  let phi   = Math.PI / 2;              // polar    (vertical drag), start at equator
  let dragging = false;
  let prev = { x: 0, y: 0 };
  let vTheta = 0, vPhi = 0;             // release velocity → inertia
  const IDLE_SPIN = 0.05;              // gentle auto-rotate when idle

  function applyCamera() {
    phi = Math.max(0.2, Math.min(Math.PI - 0.2, phi));   // clamp so it never flips
    camera.position.set(
      R * Math.sin(phi) * Math.sin(theta),
      R * Math.cos(phi),
      R * Math.sin(phi) * Math.cos(theta)
    );
    camera.lookAt(0, 0, 0);
  }

  function dragStart(x, y) { dragging = true; prev.x = x; prev.y = y; vTheta = 0; vPhi = 0; document.body.classList.add('dragging'); }
  function dragMove(x, y) {
    if (!dragging) return;
    const dx = (x - prev.x) * 0.006;
    const dy = (y - prev.y) * 0.006;
    theta -= dx; phi -= dy;             // rotate BOTH axes (spherical) — key rule
    vTheta = -dx; vPhi = -dy;           // remember last delta for inertia
    prev.x = x; prev.y = y;
  }
  function dragEnd() { dragging = false; document.body.classList.remove('dragging'); }

  // Orbit only when the press lands on the background/scene — never on text or
  // controls, so users can still select and copy any copy on the page.
  const NO_DRAG = 'a, button, input, textarea, select, label, .lang,' +
    ' p, h1, h2, h3, h4, span, li, .tag, .lbl, .num, .badge, .brand, footer, .touchzone';
  window.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;                  // touch scrolls; mouse/pen orbit
    if (e.button !== undefined && e.button !== 0) return;   // primary button only
    if (e.target.closest(NO_DRAG)) return;                  // let selection happen on text
    dragStart(e.clientX, e.clientY);
  });
  window.addEventListener('pointermove', (e) => dragMove(e.clientX, e.clientY));
  window.addEventListener('pointerup', dragEnd);
  window.addEventListener('pointercancel', dragEnd);

  // ---- Resize: ResizeObserver on canvas (rule: canvas dims, not window) ----
  let lastW = 0, lastH = 0;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    // Ignore tiny height changes from the mobile URL bar showing/hiding —
    // resizing the WebGL buffer on every scroll frame causes iOS jank.
    if (w === lastW && Math.abs(h - lastH) < 120) return;
    lastW = w; lastH = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize);
  resize();

  // ---- Render loop: setAnimationLoop + Clock.getDelta ONCE (rule) ----
  const clock = new THREE.Clock();
  function animate() {
    const dt = clock.getDelta();              // called ONCE per frame
    const t = clock.getElapsedTime();

    if (!noMotion) {
      hero.rotation.y += dt * 0.35;
      hero.rotation.x += dt * 0.12;
      wire.rotation.copy(hero.rotation);
      particles.rotation.y += dt * 0.02;

      for (let i = 0; i < SHARDS; i++) {
        const s = shardData[i];
        s.a += dt * s.speed;
        dummy.position.set(Math.cos(s.a) * s.r, s.y + Math.sin(t * 0.5 + i) * 0.15, Math.sin(s.a) * s.r);
        dummy.rotation.set(t * s.speed, t * s.speed + s.spin, 0);
        dummy.updateMatrix();
        shards.setMatrixAt(i, dummy.matrix);
      }
      shards.instanceMatrix.needsUpdate = true;
    }

    // camera: drag orbit, with inertia + gentle idle auto-rotate
    if (!dragging) {
      theta += vTheta;                 // coast on release velocity
      phi   += vPhi;
      vTheta *= 0.93;                  // friction
      vPhi   *= 0.93;
      if (!noMotion) theta += IDLE_SPIN * dt;   // slow self-rotation when idle
    }
    applyCamera();

    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(animate);

  // Pause when tab hidden (rule: Pause on tab hidden)
  document.addEventListener('visibilitychange', () => {
    renderer.setAnimationLoop(document.hidden ? null : animate);
  });

  // Intro: camera pulls in (tween R, since orbit sets position each frame)
  if (!noMotion && window.gsap) {
    const baseR = R;                 // resting radius (9)
    const intro = { r: baseR + 8 };  // start further out
    R = intro.r;
    gsap.to(intro, { r: baseR, duration: 1.6, ease: 'power3.out', onUpdate: () => { R = intro.r; } });
    gsap.from([hero.scale], { x: 0.2, y: 0.2, z: 0.2, duration: 1.4, ease: 'back.out(1.4)' });
  }
})();
