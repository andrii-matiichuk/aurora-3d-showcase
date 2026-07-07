/* =====================================================================
   i18n — English is the global default; Ukrainian and Polish are available.
   Add a new language by dropping another entry into STRINGS + LOCALES and
   a matching <button data-lang="xx"> in the switcher.
   Text is authored in the HTML (English) so the page works without JS.
   Exposes window.Aurora = { apply, numberLocale, lang }.
   ===================================================================== */
window.Aurora = (function () {
  const STRINGS = {
    en: {
      'nav.features': 'Features',
      'nav.how': 'How it works',
      'nav.start': 'Get started',
      'hero.title1': 'Design that',
      'hero.title2': 'lives in space',
      'hero.subtitle': 'AURORA is a spatial engine that blends WebGL graphics, physics-based motion and a strict design system. Motion conveys meaning — it never just decorates.',
      'hero.ctaPrimary': 'Try it free →',
      'hero.ctaGhost': 'Explore features',
      'stat.fps': 'frames per second',
      'stat.particles': 'particles in the field',
      'stat.rules': 'UX rules applied',
      'feat.head': 'Built on principles, not decoration',
      'feat.sub': 'Every animation runs 150–400 ms, uses only transform/opacity, and respects prefers-reduced-motion.',
      'card1.h': 'Real-time WebGL engine',
      'card1.p': 'One WebGLRenderer per page, pixel ratio capped at ×2, InstancedMesh for repeated objects and delta-time via THREE.Clock — a steady 60 fps even on mid-range devices.',
      'card2.h': 'Physics-based motion',
      'card2.p': 'GSAP spring curves and scrub timelines instead of linear transitions.',
      'card3.h': 'Smooth orbit control',
      'card3.p': 'Click and drag to rotate the scene in spherical coordinates, with release inertia.',
      'card4.h': 'Accessible by default',
      'card4.p': 'Text contrast ≥4.5:1, an aria-label on the canvas, and full prefers-reduced-motion support with a reactive listener for OS setting changes.',
      'card5.h': 'Design system in tokens',
      'card5.p': 'Semantic CSS variables, an 8px spacing scale, the Space Grotesk × DM Sans pairing and a Web3 palette — all from ui-ux-pro-max.',
      'ctaBand.h': 'Ready to move space?',
      'ctaBand.p': 'This demo is built on ui-ux-pro-max recommendations — from palette choice to motion rules. Open the source and see how it works.',
      'ctaBand.primary': 'Create a project →',
      'ctaBand.ghost': 'Back to features',
      'footer.left': '© AURORA — a 3D + motion demo',
      'canvas.aria': 'Interactive 3D scene: a rotating crystal in a particle field. Click and drag to orbit the scene.'
    },
    uk: {
      'nav.features': 'Можливості',
      'nav.how': 'Як це працює',
      'nav.start': 'Почати',
      'hero.title1': 'Дизайн, що',
      'hero.title2': 'живе у просторі',
      'hero.subtitle': 'AURORA — просторовий рушій, що поєднує WebGL-графіку, фізичні анімації та строгу дизайн-систему. Рух передає сенс, а не прикрашає.',
      'hero.ctaPrimary': 'Спробувати безкоштовно →',
      'hero.ctaGhost': 'Дивитись можливості',
      'stat.fps': 'кадрів/с на сцені',
      'stat.particles': 'частинок у полі',
      'stat.rules': 'UX-правил ураховано',
      'feat.head': 'Побудовано на принципах, а не на прикрасах',
      'feat.sub': 'Кожна анімація триває 150–400 мс, працює лише через transform/opacity і поважає prefers-reduced-motion.',
      'card1.h': 'WebGL-рушій реального часу',
      'card1.p': 'Один WebGLRenderer на всю сторінку, pixel ratio з обмеженням ×2, InstancedMesh для повторюваних об’єктів і delta-time через THREE.Clock — стабільні 60 fps навіть на середніх пристроях.',
      'card2.h': 'Фізичні анімації',
      'card2.p': 'Spring-криві та scrub-таймлайни GSAP замість лінійних переходів.',
      'card3.h': 'Плавне обертання',
      'card3.p': 'Затисни й тягни, щоб обертати сцену у сферичних координатах, з інерцією після відпускання.',
      'card4.h': 'Доступність за замовчуванням',
      'card4.p': 'Контраст тексту ≥4.5:1, aria-label на canvas і повна підтримка prefers-reduced-motion з реактивним слухачем зміни налаштувань ОС.',
      'card5.h': 'Дизайн-система в токенах',
      'card5.p': 'Семантичні CSS-змінні, шкала відступів 8px, пара шрифтів Space Grotesk × DM Sans і палітра Web3 — усе з ui-ux-pro-max.',
      'ctaBand.h': 'Готові рухати простір?',
      'ctaBand.p': 'Це демо зібране за рекомендаціями скіла ui-ux-pro-max — від вибору палітри до правил анімації. Відкрийте вихідний код і подивіться, як воно влаштоване.',
      'ctaBand.primary': 'Створити проєкт →',
      'ctaBand.ghost': 'Назад до можливостей',
      'footer.left': '© AURORA — демо у стилі 3D + анімації',
      'canvas.aria': 'Інтерактивна 3D-сцена: обертовий кристал у полі частинок. Затисніть і перетягніть, щоб обертати сцену.'
    },
    pl: {
      'nav.features': 'Funkcje',
      'nav.how': 'Jak to działa',
      'nav.start': 'Zacznij',
      'hero.title1': 'Projekt, który',
      'hero.title2': 'żyje w przestrzeni',
      'hero.subtitle': 'AURORA to przestrzenny silnik łączący grafikę WebGL, ruch oparty na fizyce i rygorystyczny system projektowy. Ruch niesie znaczenie — nigdy nie jest tylko dekoracją.',
      'hero.ctaPrimary': 'Wypróbuj za darmo →',
      'hero.ctaGhost': 'Zobacz funkcje',
      'stat.fps': 'klatek na sekundę',
      'stat.particles': 'cząstek w polu',
      'stat.rules': 'zastosowanych reguł UX',
      'feat.head': 'Zbudowane na zasadach, nie na dekoracji',
      'feat.sub': 'Każda animacja trwa 150–400 ms, używa tylko transform/opacity i respektuje prefers-reduced-motion.',
      'card1.h': 'Silnik WebGL w czasie rzeczywistym',
      'card1.p': 'Jeden WebGLRenderer na stronę, pixel ratio ograniczony do ×2, InstancedMesh dla powtarzalnych obiektów i delta-time przez THREE.Clock — stabilne 60 fps nawet na urządzeniach średniej klasy.',
      'card2.h': 'Ruch oparty na fizyce',
      'card2.p': 'Krzywe sprężynowe i osie czasu ze scrubem GSAP zamiast liniowych przejść.',
      'card3.h': 'Płynne sterowanie orbitą',
      'card3.p': 'Kliknij i przeciągnij, aby obracać scenę we współrzędnych sferycznych, z bezwładnością po puszczeniu.',
      'card4.h': 'Dostępne domyślnie',
      'card4.p': 'Kontrast tekstu ≥4.5:1, aria-label na kanwie i pełne wsparcie prefers-reduced-motion z reaktywnym nasłuchiwaniem zmian ustawień systemu.',
      'card5.h': 'System projektowy w tokenach',
      'card5.p': 'Semantyczne zmienne CSS, skala odstępów 8px, para czcionek Space Grotesk × DM Sans i paleta Web3 — wszystko z ui-ux-pro-max.',
      'ctaBand.h': 'Gotowy, by poruszyć przestrzeń?',
      'ctaBand.p': 'To demo powstało na podstawie rekomendacji ui-ux-pro-max — od wyboru palety po reguły ruchu. Otwórz kod źródłowy i zobacz, jak działa.',
      'ctaBand.primary': 'Utwórz projekt →',
      'ctaBand.ghost': 'Powrót do funkcji',
      'footer.left': '© AURORA — demo 3D + ruchu',
      'canvas.aria': 'Interaktywna scena 3D: obracający się kryształ w polu cząstek. Kliknij i przeciągnij, aby obracać scenę.'
    }
  };
  const LOCALES = { en: 'en-US', uk: 'uk-UA', pl: 'pl-PL' };
  const STORE_KEY = 'aurora-lang';
  let lang = 'en';

  const t = (key) => (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || '';
  const numberLocale = () => LOCALES[lang] || 'en-US';

  function apply(next) {
    lang = STRINGS[next] ? next : 'en';
    document.documentElement.lang = lang;
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}

    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });

    const canvas = document.getElementById('scene');
    if (canvas) canvas.setAttribute('aria-label', t('canvas.aria'));

    // reformat any stat that already finished counting
    document.querySelectorAll('[data-count]').forEach((el) => {
      if (el.dataset.done === '1') el.textContent = Number(el.dataset.count).toLocaleString(numberLocale());
    });

    document.querySelectorAll('[data-lang]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
  }

  function init() {
    let saved = null;
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) {}
    const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
    apply(saved || (STRINGS[browser] ? browser : 'en'));
    document.querySelectorAll('[data-lang]').forEach((b) => {
      b.addEventListener('click', () => apply(b.dataset.lang));
    });
  }

  init();
  return { apply, numberLocale, get lang() { return lang; } };
})();
