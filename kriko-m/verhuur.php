<?php
/**
 * Verhuur - Verhuur van ons lokaal
 * Scouts Kriko-M Web Platform
 */

require_once __DIR__ . '/includes/db.php';
$settings = read_db('settings');

$contact_email   = isset($settings['contact_email'])   ? $settings['contact_email']   : 'groepsleiding@kriko-m.be';
$contact_phone   = isset($settings['contact_phone'])   ? $settings['contact_phone']   : '+32 3 776 00 00';
$contact_address = isset($settings['contact_address']) ? $settings['contact_address'] : 'Industriepark-Noord 33, 9100 Sint-Niklaas';

// Link naar het reservatieplatform Kampas (boekingspagina van ons lokaal)
$kampas_url = 'https://www.kampas.be/nl/domein/scouts-kriko-m-lokaal-terrein';

// Foto's van het lokaal: alles wat in assets/images/verhuur/ staat wordt automatisch getoond.
$verhuur_photos = [];
$verhuur_dir = __DIR__ . '/assets/images/verhuur';
if (is_dir($verhuur_dir)) {
    foreach (glob($verhuur_dir . '/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', GLOB_BRACE) as $f) {
        // Sla ontbrekende of lege (kapotte) bestanden over
        if (is_file($f) && filesize($f) > 0) {
            $verhuur_photos[] = 'assets/images/verhuur/' . basename($f);
        }
    }
    sort($verhuur_photos);
}

// Labels voor de fotogalerij (gebruikt bij placeholders wanneer er nog geen foto's zijn)
$verhuur_placeholders = [
    ['icon' => 'fa-people-roof',  'label' => 'Grote zaal'],
    ['icon' => 'fa-utensils',     'label' => 'Keuken'],
    ['icon' => 'fa-bed',          'label' => 'Slaapzaal'],
    ['icon' => 'fa-tree',         'label' => 'Buitenruimte'],
    ['icon' => 'fa-shower',       'label' => 'Sanitair'],
    ['icon' => 'fa-fire',         'label' => 'Kampvuurplaats'],
];

$page_title = "Verhuur lokaal";
require_once __DIR__ . '/includes/header.php';
?>

<!-- 1. Page Header — foto van het lokaal -->
<section class="verhuur-hero" style="background-image: linear-gradient(rgba(102, 12, 25, 0.55), rgba(102, 12, 25, 0.55)), url('assets/images/verhuur/lokaal-04.jpg');">
    <div class="container verhuur-hero-inner">
        <h1 class="verhuur-hero-title">Ons lokaal</h1>
        <a href="<?php echo htmlspecialchars($kampas_url); ?>" target="_blank" rel="noopener" class="btn btn-primary verhuur-hero-btn">
            <i class="fas fa-calendar-check" style="margin-right: 8px;"></i>Reserveer via KAMPAS
        </a>
    </div>
</section>

<section class="section container vh-page">

    <!-- 2. Korte intro -->
    <div class="vh-intro">
        <span class="vh-eyebrow">Verhuur lokaal &amp; terrein</span>
        <h2 class="vh-intro-title">Huur ons lokaal voor jouw groep</h2>
        <p class="vh-lead">
            Ons verwarmde lokaal met ruime keuken en groot omheind terrein in Sint-Niklaas staat te huur voor groepen: ideaal voor weekends, kampen, vergaderingen en familiefeesten. Of je nu met de jeugdbeweging op weekend trekt of een feest geeft — bij Kriko-M voelt je groep zich meteen thuis. Bekijk de beschikbaarheid en boek meteen online via <strong>KAMPAS</strong>.
        </p>
    </div>

    <!-- 3. Fotogalerij -->
    <div class="vh-block">
        <h3 class="vh-block-title">In beeld</h3>
        <?php if (!empty($verhuur_photos)): ?>
            <div class="verhuur-gallery">
                <?php foreach ($verhuur_photos as $i => $photo): ?>
                    <a href="<?php echo htmlspecialchars($photo); ?>" class="verhuur-photo" data-lightbox="verhuur" aria-label="Foto <?php echo $i + 1; ?> van het lokaal vergroten">
                        <img src="<?php echo htmlspecialchars($photo); ?>" alt="Lokaal Scouts Kriko-M — foto <?php echo $i + 1; ?>" loading="lazy" onerror="this.closest('.verhuur-photo').remove();">
                    </a>
                <?php endforeach; ?>
            </div>
        <?php else: ?>
            <div class="verhuur-gallery">
                <?php foreach ($verhuur_placeholders as $ph): ?>
                    <div class="verhuur-photo verhuur-photo-placeholder">
                        <i class="fas <?php echo htmlspecialchars($ph['icon']); ?>"></i>
                        <span><?php echo htmlspecialchars($ph['label']); ?></span>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>

    <!-- 4. Specs — 2×2 -->
    <div class="vh-block">
        <h3 class="vh-block-title">In één oogopslag</h3>
        <div class="vh-specs">
            <article class="vh-feature">
                <div class="vh-feature-icon"><i class="fas fa-people-roof"></i></div>
                <h3>Capaciteit</h3>
                <p>Tot 100 gasten overdag in onze verwarmde polyvalente zaal van 165 m² — eten, spelen of vergaderen.</p>
            </article>
            <article class="vh-feature">
                <div class="vh-feature-icon"><i class="fas fa-location-dot"></i></div>
                <h3>Locatie</h3>
                <p><?php echo htmlspecialchars($contact_address); ?>, met 3.500 m² volledig omheind terrein om te ravotten.</p>
            </article>
            <article class="vh-feature">
                <div class="vh-feature-icon"><i class="fas fa-utensils"></i></div>
                <h3>Keuken</h3>
                <p>Volledig uitgerust: vijf industriële gasbranders, oven, microgolf, koelkast én diepvries.</p>
            </article>
            <article class="vh-feature">
                <div class="vh-feature-icon"><i class="fas fa-bed"></i></div>
                <h3>Slaapplaatsen</h3>
                <p>'s Nachts slaapplaats voor 50 à 60 personen, met een aparte leidingsruimte erbij.</p>
            </article>
        </div>
    </div>


</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
