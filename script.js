/* =============================================
   SCRIPT.JS — Jestin G Johnson Portfolio
   Premium Minimal Edition — Award Level
   ============================================= */

// ─── INIT LUCIDE ICONS ───────────────────────────────────────────
if (typeof lucide !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => lucide.createIcons());
}

// ─── SIGNATURE LOADER ────────────────────────────────────────────
(function runSignatureLoader() {
    const loader  = document.getElementById('pageLoader');
    const sigText = document.getElementById('sigText');

    if (!loader) return;

    document.body.style.overflow = 'hidden';

    const exitLoader = () => {
        loader.classList.add('sig-exit');
        document.body.style.overflow = '';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 900);
    };

    // Wait for fonts, then measure path length for perfect animation
    document.addEventListener('DOMContentLoaded', () => {
        // Trigger exit after signature animation + subtitle delay
        setTimeout(exitLoader, 3100);
    });
})();


// ─── SCROLL TO TOP ON RELOAD ──────────────────────────────────
window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});


// ─── HAMBURGER MENU ───────────────────────────────────────────
function togglemenu() {
    const menu = document.querySelector('.menu-links');
    const icon = document.querySelector('.hamburger-icon');

    const isOpen = menu.classList.toggle('open');
    icon.classList.toggle('open');

    if (isOpen) {
        document.addEventListener('click', closeMenuOutside);
    } else {
        document.removeEventListener('click', closeMenuOutside);
    }
}

function closeMenuOutside(e) {
    const menu = document.querySelector('.menu-links');
    const icon = document.querySelector('.hamburger-icon');

    if (!menu.contains(e.target) && !icon.contains(e.target)) {
        menu.classList.remove('open');
        icon.classList.remove('open');
        document.removeEventListener('click', closeMenuOutside);
    }
}


// ─── SCROLL REVEAL ─────────────────────────────────────────────
// Only animate sections that start BELOW the initial viewport.
// Sections already in view (#profile, #stats) are never hidden.
function setupScrollReveal() {
    const allSections = document.querySelectorAll('section');
    // Never hide these — they are always above the fold
    const neverHide = new Set(['profile', 'stats']);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target); // animate once
            }
        });
    }, {
        threshold: 0.08,   // trigger when 8% of section is visible
        rootMargin: '0px 0px -40px 0px'
    });

    allSections.forEach(sec => {
        if (neverHide.has(sec.id)) return; // skip always-visible sections
        sec.classList.add('animate-section'); // mark for animation
        observer.observe(sec);
    });
}

// Run after the intro finishes sliding away (2.6s) so sections are
// observed correctly, not blocked by the intro overlay's z-index.
setTimeout(setupScrollReveal, 600);


// ─── ACTIVE NAV LINK (SCROLLSPY) ──────────────────────────────
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active-nav');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active-nav');
        }
    });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });


// ─── WORK PORTFOLIO FILTER ────────────────────────────────────
(function setupFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const workItems = document.querySelectorAll('.work-item');

    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            workItems.forEach(item => {
                if (filter === 'all' || item.dataset.cat === filter) {
                    item.classList.remove('hidden');
                    // Trigger re-entrance animation
                    item.style.animation = 'none';
                    void item.offsetWidth; // reflow
                    item.style.animation = '';
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
})();


// ─── STATS COUNTER ANIMATION ──────────────────────────────────
function animateCounters() {
    const statNums = document.querySelectorAll('.stat-number');

    statNums.forEach(el => {
        if (el.dataset.counted) return;

        const raw = el.textContent.trim();
        const plus = raw.includes('+');
        const num = parseInt(raw.replace('+', ''), 10);

        if (isNaN(num)) return;

        el.dataset.counted = 'true';

        let start = 0;
        const duration = 1500;
        const step = Math.ceil(num / (duration / 30));
        const suffix = plus ? '+' : '';

        const timer = setInterval(() => {
            start += step;
            if (start >= num) {
                start = num;
                clearInterval(timer);
            }
            el.textContent = start + suffix;
        }, 30);
    });
}

// Trigger counter when stats section is visible
const statsSection = document.querySelector('#stats');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.disconnect();
            }
        });
    }, { threshold: 0.3 });

    statsObserver.observe(statsSection);
}


// ─── NAV ACTIVE STYLE IN CSS (inject via JS) ─────────────────
const navStyle = document.createElement('style');
navStyle.textContent = `
    .nav-links a.active-nav {
        color: var(--accent-light) !important;
    }
    .nav-links a.active-nav::after {
        width: 100% !important;
    }
    .work-item {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .work-item.hidden {
        display: none;
    }
`;
document.head.appendChild(navStyle);


// ─── LIGHTBOX / PROJECT PREVIEW ──────────────────────────────
(function initLightbox() {
    const overlay  = document.getElementById('lbOverlay');
    const closeBtn = document.getElementById('lbClose');
    const lbImg    = document.getElementById('lbImg');
    const lbTag    = document.getElementById('lbTag');
    const lbTitle  = document.getElementById('lbTitle');
    const lbDesc   = document.getElementById('lbDesc');
    const lbLink   = document.getElementById('lbLink');
    const lbCard   = document.getElementById('lbCard');

    if (!overlay) return;

    // ── Open lightbox ──────────────────────────
    function openLightbox(imgSrc, tag, title, desc, href) {
        lbImg.src    = imgSrc;
        lbImg.alt    = title;
        lbTag.textContent   = tag;
        lbTitle.textContent = title;
        lbDesc.textContent  = desc;
        lbLink.href  = href && href !== '#' ? href : null;
        lbLink.style.display = (href && href !== '#') ? 'inline-flex' : 'none';

        overlay.classList.add('lb-active');
        document.body.style.overflow = 'hidden';
    }

    // ── Close lightbox ─────────────────────────
    function closeLightbox() {
        overlay.classList.remove('lb-active');
        document.body.style.overflow = '';
        // Clear src after transition to avoid flash
        setTimeout(() => { lbImg.src = ''; }, 400);
    }

    // ── Wire up each work card ─────────────────
    document.querySelectorAll('.work-item').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();          // stop link navigation

            const workDiv = this.querySelector('.work');
            const img     = this.querySelector('.work img');
            const tagEl   = this.querySelector('.layer-tag');
            const titleEl = this.querySelector('.layer h3');
            const descEl  = this.querySelector('.layer p');

            const imgSrc = img    ? img.src            : '';
            const tag    = tagEl  ? tagEl.textContent   : '';
            const title  = titleEl? titleEl.textContent : '';
            const desc   = descEl ? descEl.textContent.trim() : '';
            const href   = this.getAttribute('href') || '#';

            openLightbox(imgSrc, tag, title, desc, href);
        });
    });

    // ── Close on backdrop click ────────────────
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeLightbox();
    });

    // ── Close button ───────────────────────────
    closeBtn.addEventListener('click', closeLightbox);

    // ── Escape key ────────────────────────────
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLightbox();
    });
})();

// ─── NAVBAR BLUR ON SCROLL ───────────────────────────────────────
(function initNavScroll() {
    const nav = document.getElementById('desktop-nav');
    if (!nav) return;

    const handleScroll = () => {
        if (window.scrollY > 20) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
})();

// ─── SCROLL REVEAL ───────────────────────────────────────────────
(function initScrollReveal() {
    const targets = document.querySelectorAll([
        '.section-title',
        '.about-label',
        '.about-card',
        '.about-bio p',
        '.process-step',
        '.contact-card',
        '.stat-box',
        '.work-item',
        '.experience-card',
        '.skill-category-block',
        '.marquee-strip',
        '.hero-content',
        '.hero-visual',
        '.process-subtitle',
        '.contact-subtitle',
    ].join(','));

    targets.forEach((el, i) => {
        el.classList.add('reveal-up');
        // Stagger sibling items
        if (el.parentElement) {
            const siblings = el.parentElement.querySelectorAll(':scope > .reveal-up');
            const siblingIdx = Array.from(siblings).indexOf(el);
            if (siblingIdx > 0) {
                el.style.setProperty('--reveal-delay', `${siblingIdx * 0.08}s`);
            }
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    targets.forEach(el => observer.observe(el));
})();

// ─── MAGNETIC BUTTONS ────────────────────────────────────────────
(function initMagneticButtons() {
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px) translateY(-1px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
})();
