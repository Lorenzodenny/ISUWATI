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

// Burger + drawer
const burger = document.getElementById('burger');
const drawer = document.getElementById('drawer');
const drawerLinks = drawer.querySelectorAll('a');

const toggleDrawer = (open) => {
  drawer.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  drawer.setAttribute('aria-hidden', String(!open));
};
burger.addEventListener('click', () => toggleDrawer(!drawer.classList.contains('open')));
drawerLinks.forEach(a => a.addEventListener('click', () => toggleDrawer(false)));

// Nav attiva su scroll
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

// GLightbox
GLightbox({ selector: '.glightbox', openEffect: 'zoom', closeEffect: 'zoom', loop: true });

// Swiper
new Swiper('.trips-swiper', {
  slidesPerView: 1.1, spaceBetween: 12, centeredSlides: true,
  pagination: { el: '.swiper-pagination', clickable: true },
  breakpoints: { 640:{slidesPerView:1.3}, 960:{slidesPerView:2.2}, 1200:{slidesPerView:2.8} }
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

// Highlights counter (più lento + easing)
function animateCount(el, target, duration = 3200) {
  const start = performance.now();
  const from = 0;
  function tick(now){
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    el.textContent = Math.round(from + (target - from) * eased);
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

// Showcase: cambia sfondo mentre i pannelli sticky entrano
const showcase = document.querySelector('.showcase');
if (showcase) {
  const panes = document.querySelectorAll('.showcase .pane');
  if (panes[0]) showcase.style.backgroundImage = `url(${panes[0].dataset.img})`;
  const so = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        showcase.style.backgroundImage = `url(${e.target.dataset.img})`;
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0.01 });
  panes.forEach(p => so.observe(p));
}

// MOBILE BAR actions
function jumpTo(sel){
  const el = document.querySelector(sel);
  if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
}
document.querySelectorAll('.mb-btn[data-jump]').forEach(btn=>{
  btn.addEventListener('click', ()=> jumpTo(btn.dataset.jump));
});
document.getElementById('mb-menu').addEventListener('click', ()=> toggleDrawer(true));
document.getElementById('mb-theme').addEventListener('click', toggleTheme);
document.getElementById('mb-top').addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
