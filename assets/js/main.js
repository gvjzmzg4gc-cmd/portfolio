// ==========================================================================
// Arthur Willemenot — Portfolio
// Shared behaviour: i18n, mobile nav, carousels
// ==========================================================================

const LANG_PATH = 'assets/data/lang.json';

async function loadLangData() {
  const res = await fetch(LANG_PATH);
  return res.json();
}

function applyLang(data, lang) {
  document.querySelectorAll('[data-key]').forEach((el) => {
    const key = el.getAttribute('data-key');
    if (data[lang] && data[lang][key] !== undefined) {
      el.innerHTML = data[lang][key];
    }
  });
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function initLangSwitcher() {
  loadLangData().then((data) => {
    const saved = localStorage.getItem('preferredLang')
      || (navigator.language && navigator.language.startsWith('fr') ? 'fr' : 'en');
    applyLang(data, saved);

    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        localStorage.setItem('preferredLang', lang);
        applyLang(data, lang);
      });
    });
  }).catch((err) => console.error('lang.json load failed', err));
}

function initMobileNav() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const scrim = document.querySelector('.nav-scrim');
  if (!toggle || !nav) return;

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    scrim && scrim.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  const open = () => {
    toggle.setAttribute('aria-expanded', 'true');
    nav.classList.add('is-open');
    scrim && scrim.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('is-open');
    isOpen ? close() : open();
  });

  scrim && scrim.addEventListener('click', close);
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
}

function initCarousels() {
  document.querySelectorAll('.carousel').forEach((carousel) => {
    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const prev = carousel.querySelector('.prev');
    const next = carousel.querySelector('.next');
    const dotsWrap = carousel.querySelector('.carousel-dots');
    if (!track || slides.length === 0) return;

    let dots = [];
    if (dotsWrap) {
      dots = Array.from(slides).map((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Slide ${i + 1}`);
        b.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(b);
        return b;
      });
    }

    function activeIndex() {
      const w = track.clientWidth;
      return Math.round(track.scrollLeft / w);
    }

    function updateDots() {
      const idx = activeIndex();
      dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    }

    function goTo(i) {
      const w = track.clientWidth;
      track.scrollTo({ left: w * i, behavior: 'smooth' });
    }

    function move(dir) {
      const w = track.clientWidth;
      const maxScroll = w * (slides.length - 1);
      if (dir === 1 && track.scrollLeft >= maxScroll - 10) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (dir === -1 && track.scrollLeft <= 10) {
        track.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: dir * w, behavior: 'smooth' });
      }
    }

    prev && prev.addEventListener('click', () => move(-1));
    next && next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', () => {
      window.requestAnimationFrame(updateDots);
    }, { passive: true });

    updateDots();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLangSwitcher();
  initMobileNav();
  initCarousels();
});
