// --- Anno ---
document.getElementById('year').textContent = new Date().getFullYear();

// --- Forza apertura dall'HEADER (top) se non c'è #hash ---
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
function jumpTopOnStart(){
  if (!location.hash) {
    window.scrollTo(0,0);
    // doppio passaggio per iOS/font/immagini
    setTimeout(()=>window.scrollTo(0,0),0);
  }
}
window.addEventListener('load', jumpTopOnStart);
window.addEventListener('pageshow', () => { if (!location.hash) setTimeout(()=>window.scrollTo(0,0),0); });

// --- Tema persistente ---
const root = document.documentElement;
const saved = localStorage.getItem('isuwati-theme');
if (saved === 'light') root.classList.add('light');
function toggleTheme(){
  root.classList.toggle('light');
  localStorage.setItem('isuwati-theme', root.classList.contains('light') ? 'light' : 'dark');
}
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

// --- Drawer / Backdrop / Body lock (niente movimento laterale) ---
const burger   = document.getElementById('burger');
const drawer   = document.getElementById('drawer');
const backdrop = document.getElementById('backdrop');
const drawerLinks = drawer.querySelectorAll('a');
let scrollYBeforeLock = 0;
function lockBody(){
  scrollYBeforeLock = window.scrollY || window.pageYOffset;
  document.body.style.top = `-${scrollYBeforeLock}px`;
  document.body.classList.add('lock');
}
function unlockBody(){
  document.body.classList.remove('lock'); document.body.style.top = '';
  window.scrollTo(0, scrollYBeforeLock);
}
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

// --- Nav attiva ---
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

// --- GLightbox (niente warning aria-hidden) ---
const lightbox = GLightbox({ selector: '.glightbox', openEffect: 'zoom', closeEffect: 'zoom', loop: true });
lightbox.on('open', () => { document.activeElement?.blur?.(); });

// --- Swiper (trips) ---
new Swiper('.trips-swiper', {
  slidesPerView: 1.05, spaceBetween: 12, centeredSlides: false,
  slidesOffsetBefore: 16, slidesOffsetAfter: 16,
  pagination: { el: '.swiper-pagination', clickable: true },
  breakpoints: {
    640:  { slidesPerView: 1.3, slidesOffsetBefore: 24, slidesOffsetAfter: 24 },
    960:  { slidesPerView: 2.1, slidesOffsetBefore: 24, slidesOffsetAfter: 24 },
    1200: { slidesPerView: 2.6, slidesOffsetBefore: 24, slidesOffsetAfter: 24 }
  }
});

// --- GSAP base ---
gsap.registerPlugin(ScrollTrigger);
gsap.from('.hero-title', { y: 30, opacity: 0, duration: .8, ease: 'power2.out' });
gsap.from('.hero-sub',   { y: 24, opacity: 0, duration: .8, delay: .1, ease: 'power2.out' });
gsap.from('.hero-cta',   { y: 20, opacity: 0, duration: .8, delay: .2, ease: 'power2.out' });

// Parallax SOLO desktop/pointer fine (evita “stiramenti” su mobile)
if (matchMedia('(pointer:fine)').matches && window.innerWidth >= 980) {
  gsap.to('.hero-bg img', {
    scale: 1.08, ease: 'none',
    scrollTrigger:{ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
}

// --- Features reveal ---
gsap.utils.toArray('.feature').forEach(el=>{
  gsap.from(el,{ y:30, opacity:0, duration:.6, ease:'power2.out',
    scrollTrigger:{ trigger:el, start:'top 85%' }});
});

// --- Contatori: ogni volta che si passa sopra (su/giù) ---
function animateCount(el, target, duration = 2200) {
  const start = performance.now();
  const from = +el.textContent.replace(/\D/g,'') || 0;
  function tick(now){
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (target - from) * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
document.querySelectorAll('.hl strong').forEach(el => {
  const target = +el.dataset.count || 0;
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    end: 'bottom 15%',
    onEnter:      () => animateCount(el, target, 2200),
    onEnterBack:  () => animateCount(el, target, 2200),
    onLeave:      () => { el.textContent = '0'; },
    onLeaveBack:  () => { el.textContent = '0'; }
  });
});

// --- SHOWCASE: immagini assolute + IO ---
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

// --- Mobile bar actions ---
function jumpTo(sel){ document.querySelector(sel)?.scrollIntoView({behavior:'smooth', block:'start'}); }
document.querySelectorAll('.mb-btn[data-jump]').forEach(btn=> btn.addEventListener('click', ()=> jumpTo(btn.dataset.jump)));
document.getElementById('mb-menu').addEventListener('click', ()=> setDrawer(true));
document.getElementById('mb-theme').addEventListener('click', toggleTheme);
document.getElementById('mb-top').addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

// --- Refresh trigger al termine del load per allineare calcoli ---
window.addEventListener('load', () => { if (window.ScrollTrigger?.refresh) setTimeout(()=>ScrollTrigger.refresh(), 60); });
