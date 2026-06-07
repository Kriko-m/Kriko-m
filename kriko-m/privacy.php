<?php
/**
 * Privacyverklaring (GDPR) — Scouts Kriko-M
 * Algemene tekst; laat ze door de groepsleiding nakijken en aanvullen waar nodig.
 */
require_once __DIR__ . '/includes/db.php';
$settings = read_db('settings');
$contact_email   = $settings['contact_email']   ?? 'groepsleiding@kriko-m.be';
$contact_address = $settings['contact_address'] ?? 'Industriepark-Noord 33, 9100 Sint-Niklaas';

$page_title = "Privacyverklaring";
require_once __DIR__ . '/includes/header.php';
?>

<section class="tak-hero primair hero-contact">
    <div class="container">
        <span class="hero-eyebrow">Jouw gegevens, jouw rechten</span>
        <h1 class="tak-hero-title">Privacyverklaring</h1>
        <p style="color:rgba(255,255,255,.85);margin-top:8px;font-size:1.1rem;">Hoe Scouts Kriko-M met je persoonsgegevens omgaat.</p>
    </div>
</section>

<section class="section container" style="max-width: 820px;">
    <div class="checkout-card">
        <p style="color: var(--color-text-muted); margin-bottom: 24px;"><em>Laatst bijgewerkt: <?php echo date('d-m-Y'); ?></em></p>

        <h3 style="color: var(--color-primary-dark); margin-bottom: 8px;">1. Wie zijn wij?</h3>
        <p style="margin-bottom: 20px; line-height: 1.6;">
            Scouts &amp; Gidsen Kriko-M (vzw) is verantwoordelijk voor de verwerking van je persoonsgegevens
            via deze website. Je kan ons bereiken via <a href="mailto:<?php echo htmlspecialchars($contact_email); ?>"><?php echo htmlspecialchars($contact_email); ?></a>
            of op ons adres: <?php echo htmlspecialchars($contact_address); ?>.
        </p>

        <h3 style="color: var(--color-primary-dark); margin-bottom: 8px;">2. Welke gegevens verzamelen we?</h3>
        <ul style="margin: 0 0 20px 20px; line-height: 1.7;">
            <li><strong>Ouderaccount:</strong> naam, e-mailadres en een versleuteld wachtwoord.</li>
            <li><strong>Webshopbestelling:</strong> naam van de ouder/voogd, naam en tak van het lid, e-mailadres en de bestelgegevens.</li>
            <li><strong>Contactformulier:</strong> naam, e-mailadres en de inhoud van je bericht.</li>
            <li><strong>Gekoppelde leden:</strong> voornaam en tak (ter herkenning); volledige lidgegevens en medische info blijven bij Scouts &amp; Gidsen Vlaanderen.</li>
        </ul>

        <h3 style="color: var(--color-primary-dark); margin-bottom: 8px;">3. Waarvoor gebruiken we ze?</h3>
        <p style="margin-bottom: 20px; line-height: 1.6;">
            Om je account te beheren, je bestellingen en betalingen te verwerken, je vragen te beantwoorden en
            je te informeren over de werking van onze scouts. We gebruiken je gegevens niet voor reclame en
            verkopen ze nooit door.
        </p>

        <h3 style="color: var(--color-primary-dark); margin-bottom: 8px;">4. Hoelang bewaren we ze?</h3>
        <p style="margin-bottom: 20px; line-height: 1.6;">
            Niet langer dan nodig: accountgegevens zolang je account bestaat, bestelgegevens zolang nodig voor
            onze boekhouding, en contactberichten tot je vraag is afgehandeld.
        </p>

        <h3 style="color: var(--color-primary-dark); margin-bottom: 8px;">5. Delen met derden</h3>
        <p style="margin-bottom: 20px; line-height: 1.6;">
            We delen je gegevens enkel met Scouts &amp; Gidsen Vlaanderen (de koepel, voor het ledenbeheer) en
            niet met commerciële partijen. Betalingen verlopen via gewone bankoverschrijving; we bewaren geen
            bankkaart- of betaalgegevens.
        </p>

        <h3 style="color: var(--color-primary-dark); margin-bottom: 8px;">6. Cookies</h3>
        <p style="margin-bottom: 20px; line-height: 1.6;">
            We gebruiken enkel functionele cookies (o.a. om je winkelmandje en je login te onthouden). We volgen
            je niet en plaatsen geen trackingcookies van derden.
        </p>

        <h3 style="color: var(--color-primary-dark); margin-bottom: 8px;">7. Jouw rechten</h3>
        <p style="margin-bottom: 20px; line-height: 1.6;">
            Je hebt het recht om je gegevens in te zien, te laten verbeteren of te laten verwijderen. Een
            ouderaccount kan je zelf verwijderen in het <a href="ouderportaal.php">ouderportaal</a>. Voor andere
            vragen mail je <a href="mailto:<?php echo htmlspecialchars($contact_email); ?>"><?php echo htmlspecialchars($contact_email); ?></a>.
            Ben je het niet eens met onze verwerking, dan kan je klacht indienen bij de
            Gegevensbeschermingsautoriteit (gegevensbeschermingsautoriteit.be).
        </p>

        <p style="margin-top: 28px;">
            Zie ook onze <a href="voorwaarden.php" style="font-weight: 700;">verkoopsvoorwaarden</a>.
        </p>
    </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
