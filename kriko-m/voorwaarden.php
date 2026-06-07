<?php
/**
 * Verkoopsvoorwaarden webshop — Scouts Kriko-M
 * Algemene tekst; laat ze door de groepsleiding nakijken en aanvullen waar nodig.
 */
require_once __DIR__ . '/includes/db.php';
$settings = read_db('settings');
$contact_email = $settings['contact_email'] ?? 'groepsleiding@kriko-m.be';
$bank_holder   = $settings['bank_holder']   ?? 'Scouts Kriko-M vzw';

$page_title = "Verkoopsvoorwaarden";
require_once __DIR__ . '/includes/header.php';
?>

<section class="tak-hero primair hero-webshop">
    <div class="container">
        <span class="hero-eyebrow">Onze webshop</span>
        <h1 class="tak-hero-title">Verkoopsvoorwaarden</h1>
        <p style="color:rgba(255,255,255,.85);margin-top:8px;font-size:1.1rem;">De afspraken bij een bestelling in onze scoutsshop.</p>
    </div>
</section>

<section class="section container" style="max-width: 820px;">
    <div class="checkout-card">
        <p style="color: var(--color-text-muted); margin-bottom: 24px;"><em>Laatst bijgewerkt: <?php echo date('d-m-Y'); ?></em></p>

        <h3 style="color: var(--color-primary-dark); margin-bottom: 8px;">1. Verkoper</h3>
        <p style="margin-bottom: 20px; line-height: 1.6;">
            De webshop wordt beheerd door <?php echo htmlspecialchars($bank_holder); ?>. Bestellen kan enkel met
            een geldig ouder- of leidingsaccount.
        </p>

        <h3 style="color: var(--color-primary-dark); margin-bottom: 8px;">2. Prijzen</h3>
        <p style="margin-bottom: 20px; line-height: 1.6;">
            Alle prijzen zijn in euro en inclusief btw. We bieden de artikelen aan tegen kostprijs ter
            ondersteuning van de werking. De prijs op het moment van bestellen geldt.
        </p>

        <h3 style="color: var(--color-primary-dark); margin-bottom: 8px;">3. Betaling</h3>
        <p style="margin-bottom: 20px; line-height: 1.6;">
            Betaling gebeurt via gewone bankoverschrijving. Na het plaatsen van je bestelling krijg je de
            bankgegevens en een unieke <strong>gestructureerde mededeling</strong>. Vermeld die exact, zodat de
            leiding je betaling automatisch kan koppelen. Je bestelling wordt pas verwerkt nadat we de betaling
            ontvangen hebben.
        </p>

        <h3 style="color: var(--color-primary-dark); margin-bottom: 8px;">4. Levering</h3>
        <p style="margin-bottom: 20px; line-height: 1.6;">
            Bestellingen worden niet verzonden, maar liggen klaar aan de lokalen (VP-plein). Zodra je betaling
            verwerkt is, kan je je bestelling de eerstvolgende zondag na de vergadering afhalen.
        </p>

        <h3 style="color: var(--color-primary-dark); margin-bottom: 8px;">5. Ruilen &amp; maten</h3>
        <p style="margin-bottom: 20px; line-height: 1.6;">
            Kledij verkeerd van maat? Neem contact op via
            <a href="mailto:<?php echo htmlspecialchars($contact_email); ?>"><?php echo htmlspecialchars($contact_email); ?></a>;
            in de mate van het mogelijke ruilen we naar de juiste maat.
        </p>

        <h3 style="color: var(--color-primary-dark); margin-bottom: 8px;">6. Annulering</h3>
        <p style="margin-bottom: 20px; line-height: 1.6;">
            Heb je verkeerd besteld of toch nog niet betaald? Laat het ons weten via e-mail, dan annuleren we de
            bestelling. Reeds betaalde, op maat gemaakte of bestelde artikelen kunnen we niet altijd terugnemen.
        </p>

        <h3 style="color: var(--color-primary-dark); margin-bottom: 8px;">7. Vragen</h3>
        <p style="margin-bottom: 0; line-height: 1.6;">
            Vragen over je bestelling? Mail
            <a href="mailto:<?php echo htmlspecialchars($contact_email); ?>"><?php echo htmlspecialchars($contact_email); ?></a>
            of volg je bestelling op in het <a href="ouderportaal.php">ouderportaal</a>.
        </p>

        <p style="margin-top: 28px;">
            Zie ook onze <a href="privacy.php" style="font-weight: 700;">privacyverklaring</a>.
        </p>
    </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
