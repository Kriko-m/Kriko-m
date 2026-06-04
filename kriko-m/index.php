<?php
/**
 * Homepage - Index View
 * Scouts Kriko-M Web Platform
 */

$page_title = "Welkom";
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/db.php';

// Fetch dynamic calendar activities from flat-file database
$calendar_events = read_db('calendar');
?>

<!-- 1. Hero (Vic-stijl, volledig scherm) -->
<section class="hero">
    <img src="assets/images/hero-nieuw.png" alt="Scouts Kriko-M" class="hero-img">
    <div class="hero-overlay">
        <div class="hero-text">
            <span class="hero-title">Kriko-M</span>
            <span class="hero-sub">Scouts &amp; Gidsen</span>
            <button class="hero-cta" id="hero-cta">
                Leer meer <i class="fa-solid fa-chevron-down"></i>
            </button>
        </div>
    </div>
</section>

<hr class="section-divider">

<!-- 2. Welkom & Introductie Section -->
<section class="section container" id="welkom">
    <div class="welcome-grid">
        <div>
            <h3 style="font-size: 2rem; margin-bottom: 16px; color: var(--color-primary-dark);">Al meer dan 80 jaar scouting in Sint-Niklaas</h3>
            <p style="margin-bottom: 16px; font-size: 1.05rem; color: var(--color-text-dark);">
                Scouts Kriko-M staat voor actie, vriendschap en zelfstandigheid. Elke zondagochtend van <strong>9:45 tot 12:30</strong> openen wij ons lokaal op het VP-plein voor een namiddag vol bosspelen, sjorringen, sportieve uitdagingen en gezelligheid.
            </p>
            <p style="color: var(--color-text-muted);">
                Onze leiding is een enthousiaste en ervaren groep vrijwilligers die elke week de leukste en veiligste activiteiten bedenken voor onze leden. Ontdek snel in welke tak jouw kind past en kom gerust eens gratis proberen!
            </p>
            <div style="margin-top: 24px; display: flex; gap: 16px;">
                <a href="inschrijven.php" class="btn btn-secondary">Hoe werkt het?</a>
                <a href="verhuur.php" class="btn btn-outline">Ons lokaal</a>
            </div>
        </div>
        <div style="position: relative;">
            <!-- Beautiful visual collage frame using CSS variables -->
            <div style="width: 100%; height: 350px; background-color: var(--color-primary-light); border-radius: var(--border-radius-lg); overflow: hidden; box-shadow: var(--shadow-lg); border: 4px solid var(--color-bg-white); transform: rotate(-2deg); background: linear-gradient(rgba(102,12,25,0.2), rgba(102,12,25,0.2)), url('assets/images/hero-bg.jpg') center/cover;">
                <!-- Fallback background graphic if image is missing -->
                <div style="display: flex; height: 100%; align-items: center; justify-content: center; color: var(--color-bg-white); flex-direction: column; padding: 24px; text-align: center;">
                </div>
            </div>
        </div>
    </div>
</section>

<hr class="section-divider">

<!-- 3. Takken Overzicht (Vic-stijl portretkaarten) -->
<section class="vic-takken-section">
    <div class="page-header" style="padding: 32px 40px 28px;">
        <h2 class="page-header-title">Onze Takken</h2>
    </div>
    <div class="vic-takken-grid">
        <a href="takken.php?tak=kapoenen" class="vic-tak-card tak-kapoenen" style="background-image: url('assets/images/tak_kapoenen.jpg')">
            <span class="vic-tak-name">Kapoenen</span>
            <span class="vic-tak-age">6 – 8 jaar</span>
        </a>
        <a href="takken.php?tak=welpen" class="vic-tak-card tak-welpen" style="background-image: url('assets/images/tak_welpen.jpg')">
            <span class="vic-tak-name">Welpen</span>
            <span class="vic-tak-age">8 – 11 jaar</span>
        </a>
        <a href="takken.php?tak=jonggivers" class="vic-tak-card tak-jonggivers" style="background-image: url('assets/images/tak_jonggivers.jpg')">
            <span class="vic-tak-name">Jonggivers</span>
            <span class="vic-tak-age">11 – 14 jaar</span>
        </a>
        <a href="takken.php?tak=givers" class="vic-tak-card tak-givers" style="background-image: url('assets/images/tak_givers.jpg')">
            <span class="vic-tak-name">Givers</span>
            <span class="vic-tak-age">14 – 17 jaar</span>
        </a>
    </div>
</section>

<hr class="section-divider">

<!-- 4. Kalender & Nieuws Section -->
<section class="section container">
    <div class="home-grid">
        <!-- Calendar Events Grid (Dynamic) -->
        <div class="calendar-card">
            <h3 style="font-size: 1.75rem; border-bottom: 2px solid var(--color-bg-linen); padding-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                <svg style="width: 24px; height: 24px; fill: none; stroke: var(--color-secondary);" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Aankomende Activiteiten
            </h3>
            
            <div class="calendar-list">
                <?php if (empty($calendar_events)): ?>
                    <p style="color: var(--color-text-muted);">Er zijn momenteel geen geplande groepsactiviteiten.</p>
                <?php else: ?>
                    <?php foreach ($calendar_events as $event): 
                        // Format the date dynamically
                        $timestamp = strtotime($event['date']);
                        $day = date('d', $timestamp);
                        
                        // Dutch month abbreviations
                        $months_nl = [
                            '01' => 'Jan', '02' => 'Feb', '03' => 'Mrt', '04' => 'Apr',
                            '05' => 'Mei', '06' => 'Jun', '07' => 'Jul', '08' => 'Aug',
                            '09' => 'Sep', '10' => 'Okt', '11' => 'Nov', '12' => 'Dec'
                        ];
                        $month_num = date('m', $timestamp);
                        $month = isset($months_nl[$month_num]) ? $months_nl[$month_num] : date('M', $timestamp);
                    ?>
                        <div class="calendar-item">
                            <div class="calendar-date-block">
                                <span class="calendar-day"><?php echo $day; ?></span>
                                <span class="calendar-month"><?php echo $month; ?></span>
                            </div>
                            <div class="calendar-details">
                                <div class="calendar-time">
                                    <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span><?php echo htmlspecialchars($event['time']); ?> &bull; <?php echo htmlspecialchars($event['location']); ?></span>
                                </div>
                                <h4><?php echo htmlspecialchars($event['title']); ?></h4>
                                <p class="calendar-desc"><?php echo htmlspecialchars($event['description']); ?></p>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>

            <a href="evenementen.php" class="calendar-view-all">Bekijk alle activiteiten &rarr;</a>
        </div>

        <!-- Info Side Banners -->
        <div style="display: flex; flex-direction: column; gap: 30px;">
            <div class="info-banner">
                <h3>Kriko Echo planning</h3>
                <p>Elke maand brengt onze leiding de "Kriko Echo" uit: het complete programmaboekje met alle activiteiten en informatie per tak. Zorg dat je op de hoogte bent!</p>
                <a href="echos.php" class="btn btn-primary" style="align-self: flex-start; font-weight: 700;">Download de Echo &raquo;</a>
            </div>
            
            <div style="background-color: var(--color-bg-white); border-radius: var(--border-radius-lg); box-shadow: var(--shadow-md); border: 1px solid var(--color-border); padding: 30px;">
                <h4 style="margin-bottom: 12px; font-size: 1.3rem;">Praktische Info</h4>
                <ul style="list-style: none; display: flex; flex-direction: column; gap: 14px;">
                    <li style="display: flex; gap: 10px; align-items: flex-start;">
                        <span style="color: var(--color-secondary); font-weight: bold; font-size: 1.2rem; line-height: 1;">&bull;</span>
                        <div>
                            <strong style="display: block; font-size: 0.95rem;">Wanneer?</strong>
                            <span style="font-size: 0.9rem; color: var(--color-text-muted);">Elke zondag van 9:45 tot 12:30.</span>
                        </div>
                    </li>
                    <li style="display: flex; gap: 10px; align-items: flex-start;">
                        <span style="color: var(--color-secondary); font-weight: bold; font-size: 1.2rem; line-height: 1;">&bull;</span>
                        <div>
                            <strong style="display: block; font-size: 0.95rem;">Waar?</strong>
                            <span style="font-size: 0.9rem; color: var(--color-text-muted);">VP-plein (Industriepark-Noord 33, naast drankenhandel De Vidts), 9100 Sint-Niklaas.</span>
                        </div>
                    </li>
                    <li style="display: flex; gap: 10px; align-items: flex-start;">
                        <span style="color: var(--color-secondary); font-weight: bold; font-size: 1.2rem; line-height: 1;">&bull;</span>
                        <div>
                            <strong style="display: block; font-size: 0.95rem;">Scoutswinkel (Hopper)</strong>
                            <span style="font-size: 0.9rem; color: var(--color-text-muted);">Algemene scoutshemden en broeken koop je bij Hopper, groepsdassen en T-shirts koop je in onze webshop.</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</section>

<!-- Scroll-naar-boven knop (Vic-stijl) -->
<button class="scroll-top-btn" id="scroll-top-btn" aria-label="Scroll naar boven">
    <i class="fa-solid fa-angles-up"></i>
</button>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

<script>
(function () {
    const hero    = document.querySelector('.hero');
    const mainnav = document.getElementById('mainnav');
    const scrollBtn = document.getElementById('scroll-top-btn');
    if (!hero || !mainnav) return;

    const navH = 70;

    window.addEventListener('scroll', () => {
        const heroBottom = hero.getBoundingClientRect().bottom;
        mainnav.style.transform = 'translateY(' + Math.min(0, heroBottom - navH) + 'px)';
        if (scrollBtn) scrollBtn.classList.toggle('visible', heroBottom <= navH);
    }, { passive: true });

    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    document.getElementById('hero-cta').addEventListener('click', () => {
        const welkom = document.getElementById('welkom');
        if (welkom) {
            const top = welkom.getBoundingClientRect().top + window.scrollY - 90;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
}());
</script>
