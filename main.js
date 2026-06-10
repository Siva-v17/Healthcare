// ─── NAVBAR SCROLL BEHAVIOUR ────────────────────────────────────────────────
const navbar = document.querySelector('.navbar');
if (navbar) {
  const applyNavState = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('dark');
    } else {
      navbar.classList.remove('scrolled');
      if (navbar.dataset.dark === 'true') navbar.classList.add('dark');
    }
  };
  window.addEventListener('scroll', applyNavState, { passive: true });
  applyNavState();
}

// ─── MOBILE NAV TOGGLE ───────────────────────────────────────────────────────
const navToggle   = document.getElementById('navToggle');
const mobileNav   = document.getElementById('mobileNav');
const navClose    = document.getElementById('mobileNavClose');

function openMobileNav() {
  mobileNav.classList.add('open');
  navToggle.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  mobileNav.classList.remove('open');
  navToggle && navToggle.classList.remove('open');
  document.body.style.overflow = '';
}
if (navToggle) navToggle.addEventListener('click', openMobileNav);
if (navClose)  navClose.addEventListener('click', closeMobileNav);
if (mobileNav) mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));

// ─── GSAP SCROLL ANIMATIONS ──────────────────────────────────────────────────
function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  if (typeof TextPlugin !== 'undefined') gsap.registerPlugin(TextPlugin);

  // ── Reveal elements ──
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 0.85,
        ease: 'power3.out',
        delay: parseFloat(el.dataset.delay || 0) * 0.1,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      }
    );
  });

  // ── Stagger children ──
  gsap.utils.toArray('.stagger-parent').forEach(parent => {
    const children = parent.querySelectorAll('.stagger-child');
    if (!children.length) return;
    gsap.fromTo(children,
      { opacity: 0, y: 40, scale: 0.96 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.7, stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: parent, start: 'top 82%', once: true }
      }
    );
  });

  // ── Count-up numbers ──
  gsap.utils.toArray('.count-up').forEach(el => {
    const target = parseInt(el.dataset.target) || 0;
    const suffix = el.dataset.suffix || '';
    ScrollTrigger.create({
      trigger: el, start: 'top 82%', once: true,
      onEnter() {
        gsap.fromTo({ v: 0 }, { v: target }, {
          duration: 2, ease: 'power2.out',
          onUpdate() {
            el.textContent = Math.round(this.targets()[0].v).toLocaleString() + suffix;
          }
        });
      }
    });
  });

  // ── Char split titles ──
  gsap.utils.toArray('.split-title').forEach(el => {
    const raw = el.innerHTML;
    // Only wrap plain text nodes, preserve inner HTML tags
    el.innerHTML = raw.replace(/>([^<]+)</g, (_, text) =>
      '>' + text.split('').map(c => c === ' ' ? '<span>&nbsp;</span>' : `<span class="char">${c}</span>`).join('') + '<'
    );
    gsap.fromTo(el.querySelectorAll('.char'),
      { opacity: 0, y: 50, rotationX: -90 },
      {
        opacity: 1, y: 0, rotationX: 0,
        stagger: 0.025, duration: 0.55, ease: 'back.out(1.7)',
        scrollTrigger: { trigger: el, start: 'top 84%', once: true }
      }
    );
  });

  // ── Image zoom on scroll ──
  gsap.utils.toArray('.img-zoom').forEach(img => {
    gsap.fromTo(img, { scale: 1.15 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  // ── Magnetic buttons ──
  document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, { x: (e.clientX - r.left - r.width/2) * 0.25, y: (e.clientY - r.top - r.height/2) * 0.25, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' });
    });
  });
}

// ─── PARTICLE CANVAS ─────────────────────────────────────────────────────────
function initParticles(canvasId, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
  resize();

  const opts = {
    count:   options.count   || 60,
    color:   options.color   || '13,148,136',
    maxDist: options.maxDist || 120,
    speed:   options.speed   || 0.5,
    size:    options.size    || 2,
  };

  const pts = Array.from({ length: opts.count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * opts.speed,
    vy: (Math.random() - 0.5) * opts.speed,
    r: Math.random() * opts.size + 1,
    a: Math.random() * 0.5 + 0.15,
  }));

  let mx = -999, my = -999;
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
  });

  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
      if (d < 80) { p.x += dx/d * 2; p.y += dy/d * 2; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${opts.color},${p.a})`; ctx.fill();
    });
    for (let i = 0; i < pts.length; i++) {
      for (let j = i+1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.hypot(dx, dy);
        if (d < opts.maxDist) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${opts.color},${(1 - d/opts.maxDist) * 0.15})`;
          ctx.lineWidth = 1;
          ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  })();

  window.addEventListener('resize', resize);
}

// ─── INIT ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initScrollAnimations, 80);
});
