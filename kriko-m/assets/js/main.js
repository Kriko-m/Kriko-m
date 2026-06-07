/**
 * Scouts Kriko-M - Main Interactivity (Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initAnnouncements();
    initScrollReveal();
    initSlowZoom();
    initFooterCopyMail();
    initScrollRevealExtended();
    initLoadingScreen();
    initCookieBanner();
    initPaklijst();
    initKindSelector();
    initPortaalNav();
});


/* ── Ouderportaal: mobiele nav toggle ─────────────────── */
function initPortaalNav() {
    const toggle = document.getElementById('portaal-nav-toggle');
    const links = document.getElementById('portaal-nav-links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
    });
}

/* ── Ouderportaal: kind-selector (chips → panelen) ────── */
function initKindSelector() {
    const chips = document.querySelectorAll('.kind-chip');
    if (!chips.length) return;
    const panels = document.querySelectorAll('.kind-panel');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const id = chip.dataset.kind;
            chips.forEach(c => c.classList.toggle('active', c === chip));
            panels.forEach(p => p.classList.toggle('active', p.dataset.kind === id));
        });
    });
}

/* ── Footer e-mail kopiëren ──────────────────────────── */
function initFooterCopyMail() {
    document.querySelectorAll('.footer-copy-mail').forEach(btn => {
        const textEl = btn.querySelector('.footer-copy-mail-text');
        if (!textEl) return;
        btn.addEventListener('click', () => {
            const email = btn.dataset.email || textEl.textContent;
            navigator.clipboard.writeText(email).then(() => {
                const original = textEl.textContent;
                textEl.textContent = 'Gekopieerd!';
                btn.classList.add('copied');
                setTimeout(() => {
                    textEl.textContent = original;
                    btn.classList.remove('copied');
                }, 2000);
            });
        });
    });
}

/* ── WhatsApp modal ──────────────────────────────────── */
function openWaModal(url, takName) {
    const modal = document.getElementById('wa-modal');
    if (!modal) return;
    document.getElementById('wa-modal-title').textContent = 'WhatsApp — ' + takName;
    document.getElementById('wa-modal-qr').src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=6&data=' + encodeURIComponent(url);
    document.getElementById('wa-modal-link').href = url;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
function closeWaModal() {
    const modal = document.getElementById('wa-modal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeWaModal(); });

/* ── Email kopiëren (tak contact knop) ──────────────── */
function copyTakEmail(btn, email) {
    navigator.clipboard.writeText(email).then(() => {
        const span = btn.querySelector('span');
        const original = span.textContent;
        span.textContent = '✓ Gekopieerd!';
        btn.style.borderColor = 'var(--color-success)';
        btn.style.color = 'var(--color-success)';
        setTimeout(() => {
            span.textContent = original;
            btn.style.borderColor = '';
            btn.style.color = '';
        }, 2000);
    });
}

/* ── Pinch-to-zoom blokkeren ─────────────────────────── */
function initSlowZoom() {
    // Touchpad pinch-zoom stuurt wheel-events met ctrlKey=true.
    // We blokkeren enkel die — normaal scrollen blijft onaangeroerd.
    document.addEventListener('wheel', (e) => {
        if (e.ctrlKey) e.preventDefault();
    }, { passive: false });
}

/* ── Vic-stijl navigatie ─────────────────────────────── */
function initNav() {
    const mainnav    = document.getElementById('mainnav');
    const hamburger  = document.getElementById('nav-hamburger');
    const scrollBtn  = document.getElementById('scroll-top-btn');

    if (!mainnav) return;

    // Hamburger open/sluit
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const open = mainnav.classList.toggle('nav-open');
            hamburger.setAttribute('aria-expanded', String(open));
        });
    }

    // Sluit bij klik buiten nav
    document.addEventListener('click', e => {
        if (!mainnav.contains(e.target)) {
            mainnav.classList.remove('nav-open');
            if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    // Mobiel: dropdown toggle bij klik op link
    document.querySelectorAll('.has-dropdown > a').forEach(link => {
        link.addEventListener('click', e => {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                link.closest('.has-dropdown').classList.toggle('open');
            }
        });
    });

    // Scroll-naar-boven knop (op pagina's zonder hero-script)
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        window.addEventListener('scroll', () => {
            scrollBtn.classList.toggle('visible', window.scrollY > 300);
        }, { passive: true });
    }
}

/* ── Aankondigingsbanner ─────────────────────────────── */
function initAnnouncements() {
    const alertClose  = document.querySelector('.alert-close');
    const alertBanner = document.querySelector('.alert-banner');

    if (alertClose && alertBanner) {
        if (sessionStorage.getItem('kriko_alert_closed')) {
            alertBanner.style.display = 'none';
        }
        alertClose.addEventListener('click', () => {
            alertBanner.style.transition = 'opacity 0.3s ease';
            alertBanner.style.opacity = '0';
            setTimeout(() => {
                alertBanner.style.display = 'none';
                sessionStorage.setItem('kriko_alert_closed', 'true');
            }, 300);
        });
    }
}

/* ── Scroll-reveal animatie ──────────────────────────── */
function initScrollReveal() {
    const els = document.querySelectorAll('.tak-card, .calendar-item, .shop-card, .vic-tak-card');

    if (!('IntersectionObserver' in window)) {
        els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.55s cubic-bezier(0.4,0,0.2,1), transform 0.55s cubic-bezier(0.4,0,0.2,1)';
        observer.observe(el);
    });
}

/* ── Bredere scroll-reveal (.reveal / .reveal-left / .reveal-right) ── */
function initScrollRevealExtended() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!('IntersectionObserver' in window)) {
        els.forEach(el => el.classList.add('visible'));
        return;
    }
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    els.forEach(el => obs.observe(el));
}

/* ── Laadscherm ───────────────────────────────────────── */
function initLoadingScreen() {
    const screen = document.getElementById('loading-screen');
    if (!screen) return;
    const hide = () => screen.classList.add('hidden');
    if (document.readyState === 'complete') {
        hide();
    } else {
        window.addEventListener('load', hide);
        // Vangnet: nooit langer dan 2s blijven hangen.
        setTimeout(hide, 2000);
    }
}

/* ── GDPR Cookiebanner ────────────────────────────────── */
function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;
    if (localStorage.getItem('kriko_cookies')) {
        banner.classList.add('cookie-hidden');
        return;
    }
    banner.classList.add('cookie-hidden');
    setTimeout(() => banner.classList.remove('cookie-hidden'), 1400);
    banner.querySelector('.cookie-btn-accept').addEventListener('click', () => {
        localStorage.setItem('kriko_cookies', 'accepted');
        banner.classList.add('cookie-hidden');
    });
    banner.querySelector('.cookie-btn-decline').addEventListener('click', () => {
        localStorage.setItem('kriko_cookies', 'declined');
        banner.classList.add('cookie-hidden');
    });
}

/* ── Paklijst interactiviteit (per kamp/lid in het ouderportaal) ── */
function initPaklijst() {
    document.querySelectorAll('.paklijst-form').forEach(setupPaklijst);
}

function setupPaklijst(form) {
    // Unieke opslagsleutel per lijst (per kamp/lid).
    const KEY = form.dataset.key || 'kriko_paklijst_v1';
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');

    form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        if (saved[cb.id]) { cb.checked = true; cb.closest('.paklijst-item').classList.add('checked'); }
        cb.addEventListener('change', () => {
            cb.closest('.paklijst-item').classList.toggle('checked', cb.checked);
            saved[cb.id] = cb.checked;
            localStorage.setItem(KEY, JSON.stringify(saved));
        });
    });
}
