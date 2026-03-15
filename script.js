/* ================================================================
   SCRIPT.JS — Suyash Jaiswal Portfolio
   ================================================================ */

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ================================================================
   1. PARTICLE CANVAS BACKGROUND
   ================================================================ */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles;
  let mouse = { x: null, y: null };

  const CONFIG = {
    count:        120,
    minRadius:    1,
    maxRadius:    2.8,
    speed:        0.35,
    lineDistance: 130,
    mouseRadius:  160,
    colors: ['#00e5ff', '#3b82f6', '#7c3aed', '#10b981'],
  };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeParticle() {
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      vx:    (Math.random() - 0.5) * CONFIG.speed * 2,
      vy:    (Math.random() - 0.5) * CONFIG.speed * 2,
      r:     CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius),
      color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
      alpha: 0.4 + Math.random() * 0.5,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, makeParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      /* Mouse repulsion */
      if (mouse.x !== null) {
        const dx   = p.x - mouse.x;
        const dy   = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.mouseRadius) {
          const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
          p.vx += (dx / dist) * force * 0.6;
          p.vy += (dy / dist) * force * 0.6;
        }
      }

      /* Damping */
      p.vx *= 0.98;
      p.vy *= 0.98;

      /* Speed clamp */
      const spd    = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const maxSpd = CONFIG.speed * 3;
      if (spd > maxSpd) { p.vx = (p.vx / spd) * maxSpd; p.vy = (p.vy / spd) * maxSpd; }

      p.x += p.vx;
      p.y += p.vy;

      /* Edge wrap */
      if (p.x < -10) p.x = W + 10;
      if (p.x > W+10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H+10) p.y = -10;

      /* Draw dot */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle  = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      /* Draw connecting lines */
      for (let j = i + 1; j < particles.length; j++) {
        const q    = particles[j];
        const dx   = p.x - q.x;
        const dy   = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.lineDistance) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle  = p.color;
          ctx.globalAlpha  = (1 - dist / CONFIG.lineDistance) * 0.18;
          ctx.lineWidth    = 0.7;
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('mousemove',  (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', ()  => { mouse.x = null; mouse.y = null; });
  window.addEventListener('resize', () => {
    resize();
    particles.forEach((p) => {
      if (p.x > W) p.x = Math.random() * W;
      if (p.y > H) p.y = Math.random() * H;
    });
  });

  init();
  draw();
})();

/* ================================================================
   2. CUSTOM CURSOR
   ================================================================ */
(function initCursor() {
  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  (function animateRing() {
    ringX += (mouseX - ringX) * 0.13;
    ringY += (mouseY - ringY) * 0.13;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();

  const hoverTargets = 'a, button, .btn, .tag, .social-link, .float-icon, .scroll-indicator';
  document.addEventListener('mouseover', (e) => { if (e.target.closest(hoverTargets)) ring.classList.add('hovering'); });
  document.addEventListener('mouseout',  (e) => { if (e.target.closest(hoverTargets)) ring.classList.remove('hovering'); });

  window.addEventListener('touchstart', () => {
    dot.style.display = ring.style.display = 'none';
  }, { once: true });
})();

/* ================================================================
   3. NAVBAR — scroll effect + hamburger + active link
   ================================================================ */
/* ---- NAVBAR ---- */
(function initNavbar() {
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const navLinks    = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  /* All 8 section IDs — must exactly match your HTML */
  const sectionIds = [
    'home',
    'about',
    'skills',
    'projects',
    'certificates',
    'internship',
    'education',
    'contact'
  ];
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (!navbar) return;

  /* ---- Scroll: glass effect + active link ---- */
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);

    const navH = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h')
    ) || 72;

    let current = 'home';
    sections.forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - navH - 10) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Hamburger toggle ---- */
  function toggleMenu(force) {
    const open = force !== undefined
      ? force
      : !hamburger.classList.contains('open');
    hamburger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleMenu());

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  document.addEventListener('click', (e) => {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      toggleMenu(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) toggleMenu(false);
  });

  /* ---- Smooth scroll for all anchor links ---- */
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h')
    ) || 72;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - navH,
      behavior: 'smooth'
    });
  });

})();

/* ================================================================
   4. SMOOTH SCROLLING
   ================================================================ */
(function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 72,
      behavior: 'smooth'
    });
  });
})();

/* ================================================================
   5. TYPING ANIMATION
   ================================================================ */
(function initTyping() {
  const el = $('#typingText');
  if (!el) return;

  const phrases = [
    'Aspiring Cloud Engineer',
    'Software Developer',
    'Web Developer',
    'Problem Solver',
  ];
  let phraseIndex = 0, charIndex = 0, isDeleting = false, isPaused = false;

  function type() {
    if (isPaused) return;
    const current = phrases[phraseIndex];

    if (!isDeleting) {
      el.textContent = current.slice(0, ++charIndex);
      if (charIndex === current.length) {
        isPaused = true;
        setTimeout(() => { isPaused = false; isDeleting = true; type(); }, 1800);
        return;
      }
      setTimeout(type, 70);
    } else {
      el.textContent = current.slice(0, --charIndex);
      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        isPaused = true;
        setTimeout(() => { isPaused = false; type(); }, 300);
        return;
      }
      setTimeout(type, 40);
    }
  }
  setTimeout(type, 900);
})();

/* ================================================================
   6. HERO REVEAL ANIMATIONS
   ================================================================ */
(function initHeroReveal() {
  const children = $$('.hero-left > *');
  children.forEach((el, i) => { el.style.transitionDelay = `${i * 0.1 + 0.2}s`; });

  const obs = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.1 }
  );

  children.forEach((el) => obs.observe(el));
  const right = $('.hero-right');
  if (right) obs.observe(right);

  /* Scroll indicator */
  const scrollInd = $('#scrollIndicator');
  if (scrollInd) {
    setTimeout(() => scrollInd.classList.add('visible'), 1800);
    window.addEventListener('scroll', () => {
      scrollInd.style.opacity       = window.scrollY > 80 ? '0' : '';
      scrollInd.style.pointerEvents = window.scrollY > 80 ? 'none' : '';
    }, { passive: true });
    scrollInd.addEventListener('click', () => {
      document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
})();

/* ================================================================
   7. MOUSE PARALLAX TILT on profile card
   ================================================================ */
(function initParallax() {
  const card  = $('.profile-card');
  const icons = $$('.float-icon');
  if (!card || !icons.length) return;
  if (window.matchMedia('(hover: none)').matches) return;

  document.addEventListener('mousemove', (e) => {
    const dx = (e.clientX - window.innerWidth  / 2) / (window.innerWidth  / 2);
    const dy = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    card.style.transform = `perspective(800px) rotateY(${dx*5}deg) rotateX(${-dy*4}deg)`;
    icons.forEach((icon, i) => {
      const d = 0.4 + (i % 3) * 0.25;
      icon.style.transform = `translate(${dx*12*d}px, ${dy*10*d}px)`;
    });
  });

  document.addEventListener('mouseleave', () => {
    card.style.transform = '';
    icons.forEach((icon) => icon.style.transform = '');
  });
})();

/* ================================================================
   8. SECTION FADE-IN (placeholder sections)
   ================================================================ */
(function initSectionObserver() {
  const sections = $$('.placeholder-section .placeholder-content');
  sections.forEach((s) => {
    s.style.cssText = 'opacity:0; transform:translateY(30px); transition:opacity 0.7s ease, transform 0.7s ease;';
  });
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.opacity   = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  sections.forEach((s) => obs.observe(s));
})();




/* ================================================================
   ABOUT SECTION SCRIPTS
   ================================================================ */

/* ================================================================
   ABOUT SECTION SCRIPTS
   ================================================================ */

/* ----------------------------------------------------------------
   1. LOAD GITHUB AVATAR as profile photo
   ---------------------------------------------------------------- */
(function loadProfileImage() {
  const img      = document.getElementById('profileImg');
  const fallback = document.getElementById('profileFallback');
  if (!img) return;

  const GITHUB_USERNAME = '2004Suyash';
  img.src = `https://avatars.githubusercontent.com/${GITHUB_USERNAME}`;

  img.onload = () => {
    img.style.display = 'block';
    if (fallback) fallback.style.display = 'none';
  };
  img.onerror = () => {
    img.style.display = 'none';
    if (fallback) fallback.style.display = 'grid';
  };
})();

/* ----------------------------------------------------------------
   2. ABOUT RIGHT — scroll reveal
   ---------------------------------------------------------------- */
(function initAboutReveal() {
  const right = document.querySelector('.about-right');
  const left  = document.querySelector('.about-left');
  if (!right) return;

  /* Left side starts hidden */
  if (left) {
    left.style.opacity    = '0';
    left.style.transform  = 'translateX(-30px)';
    left.style.transition =
      'opacity 0.8s cubic-bezier(0.33,1,0.68,1), transform 0.8s cubic-bezier(0.33,1,0.68,1)';
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (left) {
          left.style.opacity   = '1';
          left.style.transform = 'translateX(0)';
        }
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  obs.observe(right);
})();

/* ----------------------------------------------------------------
   3. INFO CARDS — staggered scroll reveal
   ---------------------------------------------------------------- */
(function initCardReveal() {
  const cards = document.querySelectorAll('.info-card[data-reveal]');
  if (!cards.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const i = [...cards].indexOf(entry.target);
        entry.target.style.transition =
          `opacity 0.65s cubic-bezier(0.33,1,0.68,1) ${i * 0.1}s,
           transform 0.65s cubic-bezier(0.33,1,0.68,1) ${i * 0.1}s`;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  cards.forEach((c) => obs.observe(c));
})();

/* ----------------------------------------------------------------
   4. PLATFORM ICONS — magnetic hover
   ---------------------------------------------------------------- */
(function initPlatformMagnetic() {
  const links = document.querySelectorAll('.platform-link');
  if (!links.length) return;
  if (window.matchMedia('(hover: none)').matches) return;

  links.forEach((link) => {
    link.addEventListener('mousemove', (e) => {
      const r  = link.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
      const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
      link.style.transform = `translate(${dx * 7}px, ${dy * 7 - 5}px)`;
    });
    link.addEventListener('mouseleave', () => {
      link.style.transform = '';
    });
  });
})();

/* ----------------------------------------------------------------
   5. BADGES — staggered wave entrance
   ---------------------------------------------------------------- */
(function initBadgeAnimation() {
  const badges = document.querySelectorAll('.about-badge');
  if (!badges.length) return;

  badges.forEach((b, i) => {
    b.style.opacity   = '0';
    b.style.transform = 'translateY(14px)';
    b.style.transition =
      `opacity 0.5s ease ${0.3 + i * 0.13}s,
       transform 0.5s ease ${0.3 + i * 0.13}s`;
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        badges.forEach((b) => {
          b.style.opacity   = '1';
          b.style.transform = 'translateY(0)';
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const wrap = document.querySelector('.about-badges');
  if (wrap) obs.observe(wrap);
})();

/* ----------------------------------------------------------------
   6. LASER LINE — pause rotation on hover for cool effect
   ---------------------------------------------------------------- */
(function initLaserInteraction() {
  const wrapper = document.querySelector('.profile-wrapper');
  const rings   = document.querySelectorAll('.neon-ring');
  if (!wrapper) return;

  wrapper.addEventListener('mouseenter', () => {
    rings.forEach((r) => r.style.animationPlayState = 'paused');
  });
  wrapper.addEventListener('mouseleave', () => {
    rings.forEach((r) => r.style.animationPlayState = 'running');
  });
})();





/* ================================================================
   SKILLS SECTION SCRIPTS
   ================================================================ */

/* ----------------------------------------------------------------
   1. CATEGORY FILTER TABS
   ---------------------------------------------------------------- */
(function initSkillsTabs() {
  const tabs       = document.querySelectorAll('.skills-tab');
  const categories = document.querySelectorAll('.skill-category');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      /* Update active tab */
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const selected = tab.dataset.cat;

      categories.forEach((cat) => {
        if (selected === 'all' || cat.dataset.cat === selected) {
          cat.classList.remove('hidden');
          /* Re-trigger reveal for newly shown cards */
          cat.querySelectorAll('[data-reveal]').forEach((card) => {
            card.classList.remove('visible');
            setTimeout(() => card.classList.add('visible'), 80);
          });
        } else {
          cat.classList.add('hidden');
        }
      });
    });
  });
})();

/* ----------------------------------------------------------------
   2. SCROLL REVEAL for skill cards & soft cards
   ---------------------------------------------------------------- */
(function initSkillReveal() {
  const cards = document.querySelectorAll(
    '.skill-card[data-reveal], .soft-card[data-reveal]'
  );
  if (!cards.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        /* Stagger by position in parent grid */
        const siblings = [...entry.target.parentElement.children];
        const i        = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${i * 0.07}s`;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  cards.forEach((c) => obs.observe(c));
})();

/* ----------------------------------------------------------------
   3. SKILL ICON — subtle floating on hover
   ---------------------------------------------------------------- */
(function initIconFloat() {
  const iconWraps = document.querySelectorAll('.skill-icon-wrap');
  if (!iconWraps.length) return;
  if (window.matchMedia('(hover: none)').matches) return;

  iconWraps.forEach((wrap) => {
    let raf;

    wrap.addEventListener('mouseenter', () => {
      let t = 0;
      function float() {
        t += 0.08;
        const y = Math.sin(t) * 3;
        wrap.style.transform = `translateY(${y}px) scale(1.1) rotate(-4deg)`;
        raf = requestAnimationFrame(float);
      }
      float();
    });

    wrap.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      wrap.style.transform = '';
    });
  });
})();

/* ----------------------------------------------------------------
   4. CARD TILT — 3D perspective tilt on mouse move
   ---------------------------------------------------------------- */
(function initCardTilt() {
  const cards = document.querySelectorAll('.skill-card, .soft-card');
  if (!cards.length) return;
  if (window.matchMedia('(hover: none)').matches) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);

      card.style.transform =
        `translateY(-6px) scale(1.01)
         perspective(600px)
         rotateX(${-dy * 5}deg)
         rotateY(${dx * 5}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ----------------------------------------------------------------
   5. CATEGORY LABEL — animate in on scroll
   ---------------------------------------------------------------- */
(function initCategoryLabelReveal() {
  const labels = document.querySelectorAll('.category-label');
  if (!labels.length) return;

  labels.forEach((label) => {
    label.style.opacity   = '0';
    label.style.transform = 'translateX(-20px)';
    label.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateX(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  labels.forEach((l) => obs.observe(l));
})();






/* ================================================================
   PROJECTS SECTION SCRIPTS
   ================================================================ */

/* ----------------------------------------------------------------
   1. SCROLL REVEAL — staggered per card
   ---------------------------------------------------------------- */
(function initProjectReveal() {
  const cards = document.querySelectorAll('.project-card[data-reveal]');
  if (!cards.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const all   = [...document.querySelectorAll('.project-card[data-reveal]')];
      const i     = all.indexOf(entry.target);
      const col   = i % 2;
      const row   = Math.floor(i / 2);
      const delay = row * 0.12 + col * 0.08;

      entry.target.style.transition =
        `opacity 0.7s cubic-bezier(0.33,1,0.68,1) ${delay}s,
         transform 0.7s cubic-bezier(0.33,1,0.68,1) ${delay}s`;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  cards.forEach((c) => obs.observe(c));
})();

/* ----------------------------------------------------------------
   2. 3D TILT on mouse move
   ---------------------------------------------------------------- */
(function initProjectTilt() {
  const cards = document.querySelectorAll('.project-card');
  if (!cards.length || window.matchMedia('(hover:none)').matches) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
      const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
      card.style.transform =
        `translateY(-8px) scale(1.015)
         perspective(900px)
         rotateX(${-dy * 3.5}deg)
         rotateY(${dx  * 3.5}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ----------------------------------------------------------------
   3. GLITCH INTENSITY — ramp up on repeated hover
   ---------------------------------------------------------------- */
(function initGlitchRamp() {
  const visuals = document.querySelectorAll('.project-visual');
  if (!visuals.length) return;

  visuals.forEach((vis) => {
    let hoverCount = 0;

    vis.addEventListener('mouseenter', () => {
      hoverCount = Math.min(hoverCount + 1, 3);
      /* Make glitch layers more opaque with each re-hover */
      const r = vis.querySelector('.glitch-r');
      const c = vis.querySelector('.glitch-c');
      if (r) r.style.opacity = String(0.4 + hoverCount * 0.15);
      if (c) c.style.opacity = String(0.35 + hoverCount * 0.12);
    });

    vis.addEventListener('mouseleave', () => {
      const r = vis.querySelector('.glitch-r');
      const c = vis.querySelector('.glitch-c');
      if (r) r.style.opacity = '0';
      if (c) c.style.opacity = '0';
    });
  });
})();

/* ----------------------------------------------------------------
   4. RANDOM GLITCH BURST — fires spontaneously on visible cards
   ---------------------------------------------------------------- */
(function initRandomGlitch() {
  const visuals = document.querySelectorAll('.project-visual');
  if (!visuals.length) return;

  function burstGlitch(vis) {
    const r = vis.querySelector('.glitch-r');
    const c = vis.querySelector('.glitch-c');
    if (!r || !c) return;

    /* Temporarily force glitch for 300ms */
    r.style.opacity   = '0.5';
    c.style.opacity   = '0.4';
    r.style.animation = 'glitchShiftR 0.3s steps(1) 1';
    c.style.animation = 'glitchShiftC 0.3s steps(1) 1 0.05s';

    setTimeout(() => {
      /* Only reset if card is not being hovered */
      if (!vis.closest('.project-card:hover')) {
        r.style.opacity   = '0';
        c.style.opacity   = '0';
        r.style.animation = 'none';
        c.style.animation = 'none';
      }
    }, 320);
  }

  /* Pick a random visible card every 4–8 seconds */
  setInterval(() => {
    const visible = [...visuals].filter((v) =>
      v.closest('.project-card')?.classList.contains('visible')
    );
    if (!visible.length) return;
    const pick = visible[Math.floor(Math.random() * visible.length)];
    /* Don't burst one that's being hovered */
    if (!pick.closest('.project-card:hover')) burstGlitch(pick);
  }, 4000 + Math.random() * 3000);
})();

/* ----------------------------------------------------------------
   5. ILLUSTRATION PARALLAX on mouse move inside visual
   ---------------------------------------------------------------- */
(function initIlluParallax() {
  const cards = document.querySelectorAll('.project-card');
  if (!cards.length || window.matchMedia('(hover:none)').matches) return;

  cards.forEach((card) => {
    const illu = card.querySelector('.pv-illustration');
    if (!illu) return;

    card.addEventListener('mousemove', (e) => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
      const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
      /* Override float animation with parallax */
      illu.style.transform = `translate(${dx * 7}px, ${dy * 5}px)`;
    });

    card.addEventListener('mouseleave', () => {
      illu.style.transform = '';
    });
  });
})();

/* ----------------------------------------------------------------
   6. TAG POP — staggered fade on card reveal
   ---------------------------------------------------------------- */
(function initTagPop() {
  document.querySelectorAll('.project-card').forEach((card) => {
    const tags = card.querySelectorAll('.ptag');
    tags.forEach((tag, i) => {
      tag.style.opacity   = '0';
      tag.style.transform = 'translateY(8px)';
      tag.style.transition =
        `opacity 0.4s ease ${0.35 + i * 0.07}s,
         transform 0.4s ease ${0.35 + i * 0.07}s`;
    });

    new MutationObserver((_, obs) => {
      if (card.classList.contains('visible')) {
        tags.forEach((t) => {
          t.style.opacity   = '1';
          t.style.transform = 'translateY(0)';
        });
        obs.disconnect();
      }
    }).observe(card, { attributes: true, attributeFilter: ['class'] });
  });
})();

/* ----------------------------------------------------------------
   7. BUTTON RIPPLE on click
   ---------------------------------------------------------------- */
(function initBtnRipple() {
  if (!document.getElementById('ripple-style')) {
    const s = document.createElement('style');
    s.id = 'ripple-style';
    s.textContent =
      `@keyframes rippleAnim { to { transform:scale(2.5); opacity:0; } }`;
    document.head.appendChild(s);
  }

  document.querySelectorAll('.proj-btn:not(.proj-disabled)').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const r      = btn.getBoundingClientRect();
      const size   = Math.max(r.width, r.height);
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute; pointer-events:none;
        width:${size}px; height:${size}px;
        left:${e.clientX - r.left - size/2}px;
        top:${e.clientY  - r.top  - size/2}px;
        background:rgba(0,229,255,0.18); border-radius:50%;
        transform:scale(0);
        animation:rippleAnim 0.5s ease-out forwards;
      `;
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });
})();






/* ================================================================
   CERTIFICATES SECTION SCRIPTS
   ================================================================ */

/* ----------------------------------------------------------------
   1. SCROLL REVEAL — staggered per card
   ---------------------------------------------------------------- */
(function initCertReveal() {
  const cards = document.querySelectorAll('.cert-card[data-reveal]');
  if (!cards.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const all   = [...cards];
      const i     = all.indexOf(entry.target);
      const col   = i % 2;
      const row   = Math.floor(i / 2);
      const delay = row * 0.1 + col * 0.08;

      entry.target.style.transition =
        `opacity 0.7s cubic-bezier(0.33,1,0.68,1) ${delay}s,
         transform 0.7s cubic-bezier(0.33,1,0.68,1) ${delay}s`;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  cards.forEach((c) => obs.observe(c));
})();

/* ----------------------------------------------------------------
   2. CERTIFICATE MODAL — open / close / iframe load
   ---------------------------------------------------------------- */
(function initCertModal() {
  const overlay  = document.getElementById('certModalOverlay');
  const modal    = document.getElementById('certModal');
  const closeBtn = document.getElementById('certModalClose');
  const frame    = document.getElementById('certModalFrame');
  const title    = document.getElementById('certModalTitle');
  const loader   = document.getElementById('certModalLoader');
  const openLink = document.getElementById('certModalOpenLink');

  if (!overlay || !modal) return;

  /* ---- Open modal ---- */
  function openModal(certUrl, certTitle) {
    /* Set title */
    title.textContent = certTitle;

    /* Set open-in-new-tab link */
    openLink.href = certUrl.replace('/preview', '/view');

    /* Show loader, hide frame */
    loader.style.display  = 'flex';
    frame.classList.remove('loaded');
    frame.src = '';

    /* Open overlay */
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    /* Load iframe after short delay (smoother UX) */
    setTimeout(() => {
      frame.src = certUrl;
    }, 200);

    /* Hide loader when iframe loads */
    frame.onload = () => {
      loader.style.display = 'none';
      frame.classList.add('loaded');
    };
  }

  /* ---- Close modal ---- */
  function closeModal() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    /* Clear src after transition */
    setTimeout(() => {
      frame.src = '';
      frame.classList.remove('loaded');
    }, 400);
  }

  /* ---- Attach open listeners to all view buttons ---- */
  document.querySelectorAll('.cert-view-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url      = btn.dataset.certUrl;
      const certTitle = btn.dataset.certTitle;
      if (url) openModal(url, certTitle);
    });
  });

  /* ---- Close on button click ---- */
  closeBtn.addEventListener('click', closeModal);

  /* ---- Close on overlay click (outside modal) ---- */
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  /* ---- Close on Escape key ---- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeModal();
    }
  });
})();

/* ----------------------------------------------------------------
   3. CARD 3D TILT on mouse move
   ---------------------------------------------------------------- */
(function initCertTilt() {
  const cards = document.querySelectorAll('.cert-card');
  if (!cards.length || window.matchMedia('(hover:none)').matches) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
      const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
      card.style.transform =
        `translateY(-8px) scale(1.01)
         perspective(800px)
         rotateX(${-dy * 4}deg)
         rotateY(${dx  * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ----------------------------------------------------------------
   4. CERT VIEW BUTTON — ripple effect on click
   ---------------------------------------------------------------- */
(function initCertBtnRipple() {
  document.querySelectorAll('.cert-view-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const r      = btn.getBoundingClientRect();
      const size   = Math.max(r.width, r.height);
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute; pointer-events:none; border-radius:50%;
        width:${size}px; height:${size}px;
        left:${e.clientX - r.left - size/2}px;
        top:${e.clientY  - r.top  - size/2}px;
        background:rgba(0,229,255,0.18);
        transform:scale(0);
        animation:certRipple 0.5s ease-out forwards;
      `;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });

  if (!document.getElementById('cert-ripple-style')) {
    const s = document.createElement('style');
    s.id = 'cert-ripple-style';
    s.textContent =
      `@keyframes certRipple { to { transform:scale(2.5); opacity:0; } }`;
    document.head.appendChild(s);
  }
})();

/* ----------------------------------------------------------------
   5. ICON AREA — subtle jitter on card hover
   ---------------------------------------------------------------- */
(function initIconJitter() {
  const cards = document.querySelectorAll('.cert-card');
  if (!cards.length || window.matchMedia('(hover:none)').matches) return;

  cards.forEach((card) => {
    const visual = card.querySelector('.cert-visual');
    if (!visual) return;

    card.addEventListener('mouseenter', () => {
      visual.style.animationPlayState = 'paused';
      visual.style.transition = 'transform 0.3s ease';
      visual.style.transform  = 'translateY(-6px) scale(1.04)';
    });
    card.addEventListener('mouseleave', () => {
      visual.style.transform = '';
      setTimeout(() => {
        visual.style.animationPlayState = 'running';
      }, 300);
    });
  });
})();






/* ================================================================
   TRAINING & EXPERIENCE SECTION SCRIPTS
   ================================================================ */

/* ----------------------------------------------------------------
   1. TIMELINE PROGRESS BAR — fills as section scrolls into view
   ---------------------------------------------------------------- */
(function initTimelineProgress() {
  const tracks = document.querySelectorAll('.tl-progress');
  if (!tracks.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.height = '100%';
        }, 200);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  tracks.forEach((t) => obs.observe(t));
})();

/* ----------------------------------------------------------------
   2. EXPERIENCE CARDS — scroll reveal with slide-in from right
   ---------------------------------------------------------------- */
(function initExpReveal() {
  const items = document.querySelectorAll('.tl-item[data-reveal]');
  if (!items.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const card = entry.target.querySelector('.exp-card');
      if (!card) return;

      setTimeout(() => {
        card.style.transition =
          'opacity 0.7s cubic-bezier(0.33,1,0.68,1), transform 0.7s cubic-bezier(0.33,1,0.68,1)';
        card.classList.add('visible');
      }, 150);

      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  items.forEach((item) => obs.observe(item));
})();

/* ----------------------------------------------------------------
   3. COLUMN LABELS — slide in on scroll
   ---------------------------------------------------------------- */
(function initColLabelReveal() {
  const labels = document.querySelectorAll('.exp-col-label');
  if (!labels.length) return;

  labels.forEach((label, i) => {
    label.style.opacity   = '0';
    label.style.transform = 'translateY(-16px)';
    label.style.transition =
      `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`;
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  labels.forEach((l) => obs.observe(l));
})();

/* ----------------------------------------------------------------
   4. EXPERIENCE MODAL — open / close / iframe
   ---------------------------------------------------------------- */
(function initExpModal() {
  const overlay  = document.getElementById('expModalOverlay');
  const closeBtn = document.getElementById('expModalClose');
  const frame    = document.getElementById('expModalFrame');
  const title    = document.getElementById('expModalTitle');
  const loader   = document.getElementById('expModalLoader');
  const openLink = document.getElementById('expModalOpenLink');

  if (!overlay) return;

  /* Open */
  function openModal(url, certTitle) {
    title.textContent  = certTitle;
    openLink.href      = url.replace('/preview', '/view');
    loader.style.display = 'flex';
    frame.classList.remove('loaded');
    frame.src = '';

    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    setTimeout(() => { frame.src = url; }, 200);

    frame.onload = () => {
      loader.style.display = 'none';
      frame.classList.add('loaded');
    };
  }

  /* Close */
  function closeModal() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      frame.src = '';
      frame.classList.remove('loaded');
    }, 400);
  }

  /* Bind buttons */
  document.querySelectorAll('.exp-cert-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url   = btn.dataset.certUrl;
      const cTitle = btn.dataset.certTitle;
      if (url) openModal(url, cTitle);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open'))
      closeModal();
  });
})();

/* ----------------------------------------------------------------
   5. CARD 3D TILT on mouse move
   ---------------------------------------------------------------- */
(function initExpTilt() {
  const cards = document.querySelectorAll('.exp-card');
  if (!cards.length || window.matchMedia('(hover:none)').matches) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
      const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
      card.style.transform =
        `translateY(-6px) scale(1.005)
         perspective(800px)
         rotateX(${-dy * 3}deg)
         rotateY(${dx  * 3}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ----------------------------------------------------------------
   6. TECH TAGS — stagger pop on card visible
   ---------------------------------------------------------------- */
(function initExpTagPop() {
  document.querySelectorAll('.exp-card').forEach((card) => {
    const tags = card.querySelectorAll('.exp-tech-tag, .ers-tag');
    tags.forEach((tag, i) => {
      tag.style.opacity   = '0';
      tag.style.transform = 'translateY(8px)';
      tag.style.transition =
        `opacity 0.4s ease ${0.4 + i * 0.08}s,
         transform 0.4s ease ${0.4 + i * 0.08}s`;
    });

    new MutationObserver((_, obs) => {
      if (card.classList.contains('visible')) {
        tags.forEach((t) => {
          t.style.opacity   = '1';
          t.style.transform = 'translateY(0)';
        });
        obs.disconnect();
      }
    }).observe(card, { attributes: true, attributeFilter: ['class'] });
  });
})();

/* ----------------------------------------------------------------
   7. CERT BUTTON RIPPLE
   ---------------------------------------------------------------- */
(function initExpBtnRipple() {
  if (!document.getElementById('exp-ripple-style')) {
    const s = document.createElement('style');
    s.id = 'exp-ripple-style';
    s.textContent =
      `@keyframes expRipple { to { transform:scale(2.5); opacity:0; } }`;
    document.head.appendChild(s);
  }

  document.querySelectorAll('.exp-cert-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const r    = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const rip  = document.createElement('span');
      rip.style.cssText = `
        position:absolute; pointer-events:none; border-radius:50%;
        width:${size}px; height:${size}px;
        left:${e.clientX - r.left - size/2}px;
        top:${e.clientY  - r.top  - size/2}px;
        background:rgba(0,229,255,0.15); transform:scale(0);
        animation:expRipple 0.5s ease-out forwards;
      `;
      btn.appendChild(rip);
      setTimeout(() => rip.remove(), 500);
    });
  });
})();





/* ================================================================
   EDUCATION SECTION SCRIPTS
   ================================================================ */
/* ================================================================
   EDUCATION — GLASSMORPHISM 3D SCRIPTS
   ================================================================ */

/* ----------------------------------------------------------------
   1. SCROLL REVEAL — left slides from left, right from right
   ---------------------------------------------------------------- */
(function initEduReveal() {
  const targets = [
    document.querySelector('.edu-left[data-reveal]'),
    document.querySelector('.edu-secondary[data-reveal]'),
    document.querySelector('.edu-snapshot[data-reveal]'),
  ].filter(Boolean);

  if (!targets.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach((t) => obs.observe(t));
})();

/* ----------------------------------------------------------------
   2. CGPA BAR + COUNTER animation
   ---------------------------------------------------------------- */
(function initCgpaAnim() {
  const fill  = document.getElementById('eduCgpaFill');
  const numEl = document.getElementById('eduCgpaNum');
  if (!fill || !numEl) return;

  const CGPA   = 7.0;
  const TARGET = parseFloat(fill.dataset.cgpa) || 70;
  let done     = false;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !done) {
        done = true;

        /* Fill bar */
        setTimeout(() => {
          fill.style.width = TARGET + '%';
        }, 350);

        /* Count up */
        const duration = 1600;
        const start    = performance.now();
        function count(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased    = 1 - Math.pow(1 - progress, 3);
          numEl.textContent = (eased * CGPA).toFixed(1);
          if (progress < 1) requestAnimationFrame(count);
          else numEl.textContent = CGPA.toFixed(1);
        }
        setTimeout(() => requestAnimationFrame(count), 350);

        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  obs.observe(fill);
})();

/* ----------------------------------------------------------------
   3. SNAPSHOT ITEMS — staggered slide from right
   ---------------------------------------------------------------- */
(function initSnapReveal() {
  const items = document.querySelectorAll('.egc-snap-item[data-snap]');
  if (!items.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const all = [...items];
        const i   = all.indexOf(entry.target);
        entry.target.style.transition =
          `opacity 0.5s ease ${i * 0.08}s,
           transform 0.5s cubic-bezier(0.33,1,0.68,1) ${i * 0.08}s`;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach((item) => obs.observe(item));
})();

/* ----------------------------------------------------------------
   4. COURSE TAGS — staggered wave
   ---------------------------------------------------------------- */
(function initCourseWave() {
  const tags = document.querySelectorAll('.ehc-course');
  if (!tags.length) return;

  tags.forEach((tag, i) => {
    tag.style.opacity   = '0';
    tag.style.transform = 'translateY(10px)';
    tag.style.transition =
      `opacity 0.4s ease ${0.5 + i * 0.07}s,
       transform 0.4s ease ${0.5 + i * 0.07}s`;
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        tags.forEach((t) => {
          t.style.opacity   = '1';
          t.style.transform = 'translateY(0)';
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const wrap = document.querySelector('.ehc-courses-wrap');
  if (wrap) obs.observe(wrap);
})();

/* ----------------------------------------------------------------
   5. DEGREE PILLS — bounce pop
   ---------------------------------------------------------------- */
(function initPillPop() {
  const pills = document.querySelectorAll('.ehc-degree-pill');
  if (!pills.length) return;

  pills.forEach((pill, i) => {
    pill.style.opacity   = '0';
    pill.style.transform = 'scale(0.85) translateY(10px)';
    pill.style.transition =
      `opacity 0.4s ease ${0.35 + i * 0.08}s,
       transform 0.45s cubic-bezier(0.34,1.56,0.64,1) ${0.35 + i * 0.08}s`;
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        pills.forEach((p) => {
          p.style.opacity   = '1';
          p.style.transform = 'scale(1) translateY(0)';
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const row = document.querySelector('.ehc-degree-row');
  if (row) obs.observe(row);
})();

/* ----------------------------------------------------------------
   6. HERO CARD — 3D mouse tilt
   ---------------------------------------------------------------- */
(function initHeroTilt() {
  const card = document.querySelector('.edu-hero-card');
  if (!card || window.matchMedia('(hover:none)').matches) return;

  card.addEventListener('mousemove', (e) => {
    const r  = card.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
    const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
    card.style.transform =
      `translateY(-6px) scale(1.005)
       perspective(1000px)
       rotateX(${-dy * 3}deg)
       rotateY(${dx  * 3}deg)`;

    /* Move glass layers for parallax depth */
    const layers = card.querySelectorAll('.ehc-glass-layer');
    layers.forEach((layer, i) => {
      const depth = (i + 1) * 0.4;
      layer.style.transform =
        `translate(${dx * 8 * depth}px, ${dy * 6 * depth}px)`;
    });
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.querySelectorAll('.ehc-glass-layer').forEach((l) => {
      l.style.transform = '';
    });
  });
})();

/* ----------------------------------------------------------------
   7. GLASS CARDS — subtle tilt
   ---------------------------------------------------------------- */
(function initGlassCardTilt() {
  const cards = document.querySelectorAll('.edu-glass-card');
  if (!cards.length || window.matchMedia('(hover:none)').matches) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
      const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
      card.style.transform =
        `translateY(-5px) scale(1.005)
         perspective(800px)
         rotateX(${-dy * 2.5}deg)
         rotateY(${dx  * 2.5}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ----------------------------------------------------------------
   8. FOCUS TAGS — pop on scroll
   ---------------------------------------------------------------- */
(function initFocusTagPop() {
  const tags = document.querySelectorAll('.ehc-focus-tag');
  if (!tags.length) return;

  tags.forEach((tag, i) => {
    tag.style.opacity   = '0';
    tag.style.transform = 'scale(0.9) translateY(8px)';
    tag.style.transition =
      `opacity 0.4s ease ${0.2 + i * 0.07}s,
       transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${0.2 + i * 0.07}s`;
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        tags.forEach((t) => {
          t.style.opacity   = '1';
          t.style.transform = 'scale(1) translateY(0)';
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const row = document.querySelector('.ehc-focus-row');
  if (row) obs.observe(row);
})();





/* ================================================================
   CONTACT SECTION SCRIPTS
   ================================================================ */

/* ----------------------------------------------------------------
   1. SCROLL REVEAL
   ---------------------------------------------------------------- */
(function initContactReveal() {
  const targets = document.querySelectorAll(
    '.contact-left[data-reveal], .contact-right[data-reveal]'
  );
  if (!targets.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach((t) => obs.observe(t));
})();

/* ----------------------------------------------------------------
   2. CONTACT CARDS — staggered reveal
   ---------------------------------------------------------------- */
(function initCardReveal() {
  const cards = document.querySelectorAll('.contact-card');
  if (!cards.length) return;

  cards.forEach((card, i) => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition =
      `opacity 0.5s ease ${0.2 + i * 0.07}s,
       transform 0.5s ease ${0.2 + i * 0.07}s`;
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        cards.forEach((c) => {
          c.style.opacity   = '1';
          c.style.transform = 'translateY(0)';
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const grid = document.querySelector('.contact-cards');
  if (grid) obs.observe(grid);
})();

/* ----------------------------------------------------------------
   3. FIND ME ONLINE — staggered pop
   ---------------------------------------------------------------- */
(function initFoIconReveal() {
  const icons = document.querySelectorAll('.fo-icon');
  if (!icons.length) return;

  icons.forEach((icon, i) => {
    icon.style.opacity   = '0';
    icon.style.transform = 'scale(0.8) translateY(12px)';
    icon.style.transition =
      `opacity 0.4s ease ${0.1 + i * 0.1}s,
       transform 0.45s cubic-bezier(0.34,1.56,0.64,1) ${0.1 + i * 0.1}s`;
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        icons.forEach((ic) => {
          ic.style.opacity   = '1';
          ic.style.transform = 'scale(1) translateY(0)';
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const wrap = document.querySelector('.fo-icons');
  if (wrap) obs.observe(wrap);
})();

/* ----------------------------------------------------------------
   4. FORM VALIDATION + SUBMISSION
   ---------------------------------------------------------------- */
(function initContactForm() {
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const success   = document.getElementById('cfSuccess');
  const resetBtn  = document.getElementById('cfsReset');

  if (!form) return;

  /* Validation rules */
  const fields = {
    inputName:    { el: null, errEl: null, validate: (v) => v.trim().length >= 2 },
    inputEmail:   { el: null, errEl: null, validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    inputSubject: { el: null, errEl: null, validate: (v) => v.trim().length >= 3 },
    inputMessage: { el: null, errEl: null, validate: (v) => v.trim().length >= 10 },
  };

  /* Bind elements */
  Object.keys(fields).forEach((id) => {
    fields[id].el    = document.getElementById(id);
    fields[id].errEl = document.getElementById(
      'error' + id.replace('input', '')
    );
  });

  /* Clear error on input */
  Object.keys(fields).forEach((id) => {
    const { el } = fields[id];
    if (!el) return;
    el.addEventListener('input', () => {
      const fieldWrap = el.closest('.cf-field');
      if (fieldWrap) fieldWrap.classList.remove('has-error');
    });
  });

  /* Validate single field */
  function validateField(id) {
    const { el, validate } = fields[id];
    if (!el) return true;
    const fieldWrap = el.closest('.cf-field');
    const isValid   = validate(el.value);
    if (!isValid) {
      fieldWrap.classList.add('has-error');
    } else {
      fieldWrap.classList.remove('has-error');
    }
    return isValid;
  }

  /* Submit handler */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    /* Validate all */
    let allValid = true;
    Object.keys(fields).forEach((id) => {
      if (!validateField(id)) allValid = false;
    });

    if (!allValid) {
      /* Shake form on error */
      form.style.animation = 'formShake 0.4s ease';
      setTimeout(() => form.style.animation = '', 400);
      return;
    }

    /* Show loading state */
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    /* Simulate sending (no backend) */
    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      /* Hide form, show success */
      form.style.display  = 'none';
      success.classList.add('show');
    }, 1800);
  });

  /* Reset form */
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.style.display = '';
      success.classList.remove('show');

      /* Clear all errors */
      Object.keys(fields).forEach((id) => {
        const { el } = fields[id];
        if (el) {
          const fw = el.closest('.cf-field');
          if (fw) fw.classList.remove('has-error');
        }
      });
    });
  }

  /* Inject shake keyframe once */
  if (!document.getElementById('form-shake-style')) {
    const s = document.createElement('style');
    s.id = 'form-shake-style';
    s.textContent = `
      @keyframes formShake {
        0%,100% { transform: translateX(0); }
        20%     { transform: translateX(-8px); }
        40%     { transform: translateX(8px); }
        60%     { transform: translateX(-5px); }
        80%     { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(s);
  }
})();

/* ----------------------------------------------------------------
   5. FORM CARD — 3D tilt on mouse move
   ---------------------------------------------------------------- */
(function initFormTilt() {
  const card = document.querySelector('.contact-form-card');
  if (!card || window.matchMedia('(hover:none)').matches) return;

  card.addEventListener('mousemove', (e) => {
    const r  = card.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
    const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
    card.style.transform =
      `perspective(900px)
       rotateX(${-dy * 2}deg)
       rotateY(${dx  * 2}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
})();

/* ----------------------------------------------------------------
   6. INPUT FOCUS GLOW — highlight active field
   ---------------------------------------------------------------- */
(function initInputGlow() {
  document.querySelectorAll('.cf-input').forEach((input) => {
    input.addEventListener('focus', () => {
      const wrap = input.closest('.cf-input-wrap');
      if (wrap) wrap.style.filter = 'drop-shadow(0 0 8px rgba(0,229,255,0.15))';
    });
    input.addEventListener('blur', () => {
      const wrap = input.closest('.cf-input-wrap');
      if (wrap) wrap.style.filter = '';
    });
  });
})();





/* ================================================================
   FOOTER SCRIPTS
   ================================================================ */

/* ----------------------------------------------------------------
   1. FOOTER COLUMNS — staggered scroll reveal
   ---------------------------------------------------------------- */
(function initFooterReveal() {
  const cols = document.querySelectorAll('[data-footer-reveal]');
  if (!cols.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cols.forEach((col) => obs.observe(col));
})();

/* ----------------------------------------------------------------
   2. BACK TO TOP — show/hide on scroll + smooth scroll
   ---------------------------------------------------------------- */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  /* Show button after scrolling 400px */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  /* Smooth scroll to top */
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ----------------------------------------------------------------
   3. FOOTER NAV LINKS — smooth scroll with offset
   ---------------------------------------------------------------- */
(function initFooterScroll() {
  const links = document.querySelectorAll(
    '.footer-nav-link, .fbb-link'
  );
  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-h')
      ) || 72;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navH,
        behavior: 'smooth'
      });
    });
  });
})();

/* ----------------------------------------------------------------
   4. FOOTER TOP BORDER — pause animation on hover
   ---------------------------------------------------------------- */
(function initBorderPause() {
  const border = document.querySelector('.ftb-line');
  const footer = document.querySelector('.footer');
  if (!border || !footer) return;

  footer.addEventListener('mouseenter', () => {
    border.style.animationPlayState = 'paused';
  });
  footer.addEventListener('mouseleave', () => {
    border.style.animationPlayState = 'running';
  });
})();

/* ----------------------------------------------------------------
   5. SOCIAL ITEMS — magnetic hover effect
   ---------------------------------------------------------------- */
(function initSocialMagnetic() {
  const items = document.querySelectorAll('.fc-social-item');
  if (!items.length || window.matchMedia('(hover:none)').matches) return;

  items.forEach((item) => {
    item.addEventListener('mousemove', (e) => {
      const r  = item.getBoundingClientRect();
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      item.style.transform = `translateX(5px) translateY(${dy * 3}px)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });
})();

/* ----------------------------------------------------------------
   6. BRAND LOGO — wiggle on click (easter egg)
   ---------------------------------------------------------------- */
(function initLogoWiggle() {
  const badge = document.querySelector('.fb-logo-badge');
  if (!badge) return;

  if (!document.getElementById('wiggle-style')) {
    const s = document.createElement('style');
    s.id = 'wiggle-style';
    s.textContent = `
      @keyframes wiggle {
        0%,100% { transform: rotate(-5deg) scale(1.05); }
        25%      { transform: rotate(6deg)  scale(1.08); }
        50%      { transform: rotate(-4deg) scale(1.06); }
        75%      { transform: rotate(5deg)  scale(1.07); }
      }
    `;
    document.head.appendChild(s);
  }

  badge.addEventListener('click', () => {
    badge.style.animation = 'wiggle 0.5s ease';
    setTimeout(() => badge.style.animation = '', 500);
  });
})();

/* ----------------------------------------------------------------
   7. STACK PILLS — hover float
   ---------------------------------------------------------------- */
(function initPillFloat() {
  const pills = document.querySelectorAll('.fb-stack-pill');
  if (!pills.length || window.matchMedia('(hover:none)').matches) return;

  pills.forEach((pill) => {
    pill.addEventListener('mouseenter', () => {
      pill.style.transform = 'translateY(-3px)';
    });
    pill.addEventListener('mouseleave', () => {
      pill.style.transform = '';
    });
  });
})();

/* ----------------------------------------------------------------
   8. FOOTER YEAR — auto-update copyright year
   ---------------------------------------------------------------- */
(function updateCopyrightYear() {
  const copy = document.querySelector('.fbb-copy');
  if (!copy) return;
  const year = new Date().getFullYear();
  copy.innerHTML = copy.innerHTML.replace('2025', year);
})();  