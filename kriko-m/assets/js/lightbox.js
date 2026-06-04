(function () {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <button class="lightbox-close" aria-label="Sluiten">&times;</button>
        <button class="lightbox-arrow prev" aria-label="Vorige">&#8249;</button>
        <img class="lightbox-img" src="" alt="">
        <button class="lightbox-arrow next" aria-label="Volgende">&#8250;</button>
        <span class="lightbox-counter"></span>
    `;
    document.body.appendChild(overlay);

    const img     = overlay.querySelector('.lightbox-img');
    const counter = overlay.querySelector('.lightbox-counter');
    let items = [], current = 0;

    function open(index) {
        current = (index + items.length) % items.length;
        img.src = items[current].href;
        img.alt = items[current].getAttribute('aria-label') || '';
        counter.textContent = (current + 1) + ' / ' + items.length;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        overlay.classList.remove('active');
        img.src = '';
        document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
        const link = e.target.closest('[data-lightbox]');
        if (!link) return;
        e.preventDefault();
        const group = link.dataset.lightbox;
        items = Array.from(document.querySelectorAll('[data-lightbox="' + group + '"]'));
        open(items.indexOf(link));
    });

    overlay.querySelector('.lightbox-close').addEventListener('click', close);
    overlay.querySelector('.prev').addEventListener('click', function (e) { e.stopPropagation(); open(current - 1); });
    overlay.querySelector('.next').addEventListener('click', function (e) { e.stopPropagation(); open(current + 1); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    document.addEventListener('keydown', function (e) {
        if (!overlay.classList.contains('active')) return;
        if (e.key === 'ArrowLeft')  open(current - 1);
        if (e.key === 'ArrowRight') open(current + 1);
        if (e.key === 'Escape')     close();
    });
})();
