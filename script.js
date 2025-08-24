// ===== Start dall'hero in alto =====
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
function startAtHero() {
  if (!location.hash || location.hash === '#') {
    history.replaceState(null, '', '#home');
  }
  const home = document.getElementById('home');
  if (home) {
    home.scrollIntoView({ behavior: 'auto', block: 'start' });
    setTimeout(() => home.scrollIntoView({ behavior: 'auto', block: 'start' }), 0);
    setTimeout(() => window.scrollTo(0,0), 250);
  }
}
window.addEventListener('load', startAtHero);
window.addEventListener('pageshow', startAtHero);

// ===== Tema persistente =====
const root = document.documentElement;
const saved = localStorage.getItem('isuwati-theme');
if (saved === 'light') root.classList.add('light');
function toggleTheme(){
  root.classList.toggle('light');
  localStorage.setItem('isuwati-theme', root.classList.contains('light') ? 'light' : 'dark');
}
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

// ===== Drawer + backdrop + body-lock =====
const burger = document.getElementById('burger');
const drawer = document.getElementById('drawer');
const backdrop = document.getElementById('backdrop');
const drawerLinks = drawer.querySelectorAll('a');
let scrollYBeforeLock = 0;
function lockBody(){ scrollYBeforeLock = window.scrollY || window.pageYOffset; document.body.style.top = `-${scrollYBeforeLock}px`; document.body.classList.add('lock'); }
function unlockBody(){ document.body.classList.remove('lock'); document.body.style.top = ''; window.scrollTo(0, scrollYBeforeLock); }
function setDrawer(open){
  drawer.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  drawer.setAttribute('aria-hidden', String(!open));
  backdrop.hidden = !open; backdrop.classList.toggle('show', open);
  if (open) lockBody(); else unlockBody();
}
burger.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
backdrop.addEventListener('click', () => setDrawer(false));
document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') setDrawer(false); });
drawerLinks.forEach(a => a.addEventListener('click', () => setDrawer(false)));

// ===== Nav attiva su scroll =====
const sections = [...document.querySelectorAll('section[id]')];
const topLinks = [...document.querySelectorAll('.nav a')];
const linkById = id => topLinks.find(a => a.getAttribute('href') === `#${id}`);
const sectionIO = new IntersectionObserver(es => {
  es.forEach(e => {
    const l = linkById(e.target.id); if (!l) return;
    if (e.isIntersecting){ topLinks.forEach(x => x.classList.remove('active')); l.classList.add('active'); }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => sectionIO.observe(s));

// ===== Lightbox =====
const lightbox = GLightbox({ selector: '.glightbox', openEffect: 'zoom', closeEffect: 'zoom', loop: true });
lightbox.on('open', () => { document.activeElement?.blur?.(); });

// ===== Swiper =====
new Swiper('.trips-swiper', {
  slidesPerView: 1.05, spaceBetween: 12,
  slidesOffsetBefore: 16, slidesOffsetAfter: 16,
  pagination: { el: '.swiper-pagination', clickable: true },
  breakpoints: {
    640:  { slidesPerView: 1.3, slidesOffsetBefore: 24, slidesOffsetAfter: 24 },
    960:  { slidesPerView: 2.1, slidesOffsetBefore: 24, slidesOffsetAfter: 24 },
    1200: { slidesPerView: 2.6, slidesOffsetBefore: 24, slidesOffsetAfter: 24 }
  }
});

// ===== GSAP entrance =====
gsap.registerPlugin(ScrollTrigger);
gsap.from('.hero-title', { y: 30, opacity: 0, duration: .8, ease: 'power2.out' });
gsap.from('.hero-sub',   { y: 24, opacity: 0, duration: .8, delay: .1, ease: 'power2.out' });
gsap.from('.hero-cta',   { y: 20, opacity: 0, duration: .8, delay: .2, ease: 'power2.out' });

// ===== Features reveal =====
gsap.utils.toArray('.feature').forEach(el=>{
  gsap.from(el,{ y:30, opacity:0, duration:.6, ease:'power2.out',
    scrollTrigger:{ trigger:el, start:'top 85%' }});
});

// ===== Contatori: retrigger su viewport + hover/tap =====
(function counters(){
  const items = document.querySelectorAll('.hl strong');

  function animateCount(el, to){
    if (el._animating) return;
    el._animating = true;
    const start = performance.now();
    const from  = 0;
    const duration = 1400;

    function tick(t){
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el._animating = false;
    }
    el.textContent = '0';
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const el = entry.target;
      const target = +el.dataset.count || 0;
      if (entry.isIntersecting){
        animateCount(el, target);
      } else {
        el.textContent = '0';
        el._animating = false;
      }
    });
  }, { threshold: 0.35, rootMargin: '0px 0px -45% 0px' });

  items.forEach(i=>{
    io.observe(i);
    ['mouseenter','touchstart','focus'].forEach(ev=>{
      i.parentElement.addEventListener(ev, ()=> animateCount(i, +i.dataset.count || 0), {passive:true});
    });
  });
})();

// ===== Showcase (cross-fade) =====
(() => {
  const sc = document.querySelector('.showcase'); if (!sc) return;
  const imgs  = Array.from(sc.querySelectorAll('.show-img'));
  const panes = Array.from(sc.querySelectorAll('.pane'));
  const setActive = (i) => {
    imgs.forEach((im,idx)=> im.classList.toggle('active', idx===i));
    panes.forEach((p, idx)=> p.classList.toggle('active', idx===i));
  };
  setActive(0);
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio > 0.55) {
        const idx = panes.indexOf(e.target);
        if (idx >= 0) setActive(idx);
      }
    });
  }, { threshold: [0.55, 0.6], rootMargin: '-10% 0px -10% 0px' });
  panes.forEach(p => io.observe(p));
})();

// ===== Bottom bar actions =====
function goTop(){
  const doScroll = () => {
    const target = document.getElementById('home');
    if (target?.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(()=>window.scrollTo(0,0), 450);
  };
  if (drawer.classList.contains('open')) { setDrawer(false); setTimeout(doScroll, 320); }
  else doScroll();
}
document.querySelectorAll('.mb-btn[data-jump]').forEach(btn=>{
  btn.addEventListener('click', ()=> document.querySelector(btn.dataset.jump)?.scrollIntoView({behavior:'smooth', block:'start'}));
});
document.getElementById('mb-menu').addEventListener('click', ()=> setDrawer(true));
document.getElementById('mb-theme').addEventListener('click', toggleTheme);
['click','touchend'].forEach(ev => document.getElementById('mb-top').addEventListener(ev, (e)=>{ e.preventDefault(); goTop(); }, { passive:false }));

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== HERO: imposta aspect-ratio dinamico = naturalWidth/naturalHeight =====
(function setHeroAspect(){
  const img = document.getElementById('heroImg');
  const frame = img?.closest('.hero-frame');
  if (!img || !frame) return;

  function apply(){
    // se già carica, naturalWidth/Height sono disponibili
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (w && h) {
      frame.style.setProperty('--hero-ar', `${w} / ${h}`);
    }
  }

  if (img.complete) apply();
  else img.addEventListener('load', apply, { once:true });

  // Se l'immagine dovesse cambiare via src in futuro
  const obs = new MutationObserver(apply);
  obs.observe(img, { attributes:true, attributeFilter:['src'] });
})();
