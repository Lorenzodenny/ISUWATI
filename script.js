// Anno
document.getElementById('year').textContent = new Date().getFullYear();

// Tema (default dark), persist
const root = document.documentElement;
const saved = localStorage.getItem('isuwati-theme');
if (saved === 'light') root.classList.add('light');

function toggleTheme(){
  root.classList.toggle('light');
  localStorage.setItem('isuwati-theme', root.classList.contains('light') ? 'light' : 'dark');
}
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

// Burger + drawer + backdrop + esc
const burger   = document.getElementById('burger');
const drawer   = document.getElementById('drawer');
const backdrop = document.getElementById('backdrop');
const drawerLinks = drawer.querySelectorAll('a');

function setDrawer(open){
  drawer.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  drawer.setAttribute('aria-hidden', String(!open));
  backdrop.hidden = !open;
  backdrop.classList.toggle('show', open);
}
burger.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
backdrop.addEventListener('click', () => setDrawer(false));
document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') setDrawer(false); });
drawerLinks.forEach(a => a.addEventListener('click', () => setDrawer(false)));

// nav attiva su scroll
const sections = [...document.querySelectorAll('section[id]')];
const topLinks = [...document.querySelectorAll('.nav a')];
const linkById = id => topLinks.find(a => a.getAttribute('href') === `#${id}`);
const io = new IntersectionObserver(es => {
  es.forEach(e => {
    const l = linkById(e.target.id);
    if (!l) return;
    if (e.isIntersecting){
      topLinks.forEach(x => x.classList.remove('active'));
      l.classList.add('active');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => io.observe(s));

// GLightbox (blur del link attivo per evitare warning aria-hidden)
const lightbox = GLightbox({ selector: '.glightbox', openEffect: 'zoom', closeEffect: 'zoom', loop: true });
lightbox.on('open', () => {
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
});

// Swiper (trips) — niente buco a sinistra
new Swiper('.trips-swiper', {
  slidesPerView: 1.05,
  spaceBetween: 12,
  centeredSlides: false,
  slidesOffsetBefore: 16,
  slidesOffsetAfter: 16,
  pagination: { el: '.swiper-pagination', clickable: true },
  breakpoints: {
    640:  { slidesPerView: 1.3, slidesOffsetBefore: 24, slidesOffsetAfter: 24 },
    960:  { slidesPerView: 2.1, slidesOffsetBefore: 24, slidesOffsetAfter: 24 },
    1200: { slidesPerView: 2.6, slidesOffsetBefore: 24, slidesOffsetAfter: 24 }
  }
});

// GSAP: animazioni base
gsap.registerPlugin(ScrollTrigger);
gsap.from('.hero-title', { y: 30, opacity: 0, duration: .8, ease: 'power2.out' });
gsap.from('.hero-sub',   { y: 24, opacity: 0, duration: .8, delay: .1, ease: 'power2.out' });
gsap.from('.hero-cta',   { y: 20, opacity: 0, duration: .8, delay: .2, ease: 'power2.out' });
// Parallax on scroll
gsap.to('.hero-bg img', {
  scale: 1.12, ease: 'none',
  scrollTrigger:{ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
});
// Parallax al mouse (desktop)
const hero = document.querySelector('.hero');
const heroImg = document.querySelector('.hero-bg img');
if (hero && heroImg && matchMedia('(pointer:fine)').matches) {
  hero.addEventListener('mousemove', (e)=>{
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left)/r.width  - .5;
    const y = (e.clientY - r.top)/r.height - .5;
    heroImg.style.transform = `scale(1.08) translate(${x*12}px, ${y*12}px)`;
  });
  hero.addEventListener('mouseleave', ()=>{
    heroImg.style.transform = 'scale(1.06) translate(0,0)';
  });
}

// Features fade-in
gsap.utils.toArray('.feature').forEach(el=>{
  gsap.from(el,{ y:30, opacity:0, duration:.6, ease:'power2.out',
    scrollTrigger:{ trigger:el, start:'top 85%' }});
});

// Highlights counter (lento con easing)
function animateCount(el, target, duration = 3200) {
  const start = performance.now();
  function tick(now){
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    el.textContent = Math.round(target * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
document.querySelectorAll('.hl strong').forEach(el => {
  const target = +el.dataset.count || 0;
  ScrollTrigger.create({
    trigger: el, start: 'top 85%', once: true,
    onEnter: () => animateCount(el, target, 3200)
  });
});

// SHOWCASE: immagini assolute + IntersectionObserver (mobile OK)
(() => {
  const sc = document.querySelector('.showcase');
  if (!sc) return;
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

// MOBILE BAR actions
function jumpTo(sel){
  const el = document.querySelector(sel);
  if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
}
document.querySelectorAll('.mb-btn[data-jump]').forEach(btn=>{
  btn.addEventListener('click', ()=> jumpTo(btn.dataset.jump));
});
document.getElementById('mb-menu').addEventListener('click', ()=> setDrawer(true));
document.getElementById('mb-theme').addEventListener('click', toggleTheme);
document.getElementById('mb-top').addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
