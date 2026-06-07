<?php
/**
 * Clothing Webshop - Shop View
 * Scouts Kriko-M Web Platform
 */

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/ouder_auth.php';

// De webshop is publiek te bekijken. Bestellen/toevoegen kan enkel ingelogd:
// gasten zien een read-only versie met een duidelijke login-uitnodiging.
if (session_status() === PHP_SESSION_NONE) session_start();
$ingelogd = portaal_ingelogd();

$page_title = "Scoutsshop";
require_once __DIR__ . '/includes/header.php';

// Fetch catalogue from database
$all_items = read_db('shop');

// Filter active items only
$active_items = array_filter($all_items, function($item) {
    return isset($item['active']) && $item['active'] === true;
});

// Category names mapping
$categories = [
    'kledij' => 'Kriko-M Kledij',
    'uniform' => 'Scouts Uniform',
    'accessoires' => 'Accessoires & Kentekens'
];
?>

<!-- 1. Page Header — eigen groene webshop-banner (primair, groen via portaal-thema) -->
<section class="tak-hero primair hero-webshop">
    <div class="container">
        <span class="hero-eyebrow">Draag met trots</span>
        <h2 class="tak-hero-title">Onze Scouts Webshop</h2>
        <p style="font-size: 1.2rem; color: hsla(0, 0%, 100%, 0.9); margin-top: 8px;">Kriko-M truien, t-shirts, dassen en kentekens.</p>
    </div>
</section>

<!-- 2. Main Shop Gallery -->
<section class="section container">

    <?php if (!$ingelogd): ?>
    <!-- Gast-melding: webshop is read-only zonder login -->
    <div style="background-color: hsla(145, 33%, 36%, 0.10); border: 2px solid var(--color-primary); border-radius: var(--border-radius-lg); padding: 22px 24px; margin-bottom: 28px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <i class="fa-solid fa-circle-info" style="font-size: 1.6rem; color: var(--color-primary); flex-shrink: 0;"></i>
        <div style="flex: 1; min-width: 220px;">
            <strong style="display: block; color: var(--color-primary-dark); font-size: 1.1rem; margin-bottom: 2px;">Je bekijkt de webshop als gast</strong>
            <span style="font-size: 0.95rem; color: var(--color-text-dark); line-height: 1.5;">Bekijken kan vrij, maar om artikelen in je winkelmandje te leggen en te bestellen moet je inloggen met je ouder- of leidingsaccount.</span>
        </div>
        <a href="ouderportaal.php?login_vereist=webshop" class="btn btn-secondary" style="flex-shrink: 0;">
            <i class="fa-solid fa-right-to-bracket" style="margin-right: 6px;"></i> Inloggen om te bestellen
        </a>
    </div>
    <?php endif; ?>

    <!-- Info Announcement Bar -->
    <div style="background-color: hsla(29, 57%, 46%, 0.1); border: 2px dashed var(--color-accent); border-radius: var(--border-radius-lg); padding: 24px; margin-bottom: 40px; display: flex; gap: 16px; align-items: flex-start;">
        <svg style="width: 28px; height: 28px; color: var(--color-secondary); flex-shrink: 0; margin-top: 2px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
            <h4 style="color: var(--color-primary-dark); font-size: 1.15rem; margin-bottom: 4px;">Hoe werkt bestellen bij ons?</h4>
            <p style="font-size: 0.95rem; color: var(--color-text-dark); line-height: 1.5;">
                Voeg kledingstukken toe aan je winkelwagen en voltooi de checkout. Betalingen gebeuren eenvoudig via **overschrijving** (je ontvangt direct alle instructies en een gestructureerde mededeling). Zodra we de betaling binnenkrijgen, ligt de bestelling de **eerstvolgende zondag** klaar aan de lokalen!
            </p>
        </div>
    </div>

    <!-- Producten op volle breedte; het winkelmandje schuift in/uit langs de rechterrand -->
    <div class="shop-products">
        <?php foreach ($categories as $cat_key => $cat_name):
            // Filter items in this category
            $cat_items = array_filter($active_items, fn($item) => $item['category'] === $cat_key);
            if (empty($cat_items)) continue;
        ?>
        <div class="shop-cat">
            <h3 class="shop-cat-title"><?php echo $cat_name; ?></h3>

            <div class="shop-grid">
                <?php foreach ($cat_items as $item): ?>
                    <div class="shop-card">
                        <!-- Product image container -->
                        <div class="shop-card-image">
                            <?php if (!empty($item['image']) && file_exists(__DIR__ . '/' . $item['image'])): ?>
                                <img src="<?php echo htmlspecialchars($item['image']); ?>" alt="<?php echo htmlspecialchars($item['name']); ?>">
                            <?php else: ?>
                                <!-- Visual fallback SVG graphic if image is missing -->
                                <div style="display: flex; height: 100%; width: 100%; align-items: center; justify-content: center; background-color: var(--color-primary-light); color: var(--color-bg-white);">
                                    <svg style="width: 60px; height: 60px; fill: currentColor; opacity: 0.35;" viewBox="0 0 24 24">
                                        <path d="M12 2c1.1 0 2 .9 2 2v1h-4V4c0-1.1.9-2 2-2zm6 3h-2v1h-8V5H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-6 13c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z"/>
                                    </svg>
                                    <span style="position: absolute; bottom: 12px; font-size: 0.8rem; letter-spacing: 0.5px; opacity: 0.8; font-family: 'Outfit', sans-serif; font-weight: 700; text-transform: uppercase;">Scouts Kriko-M</span>
                                </div>
                            <?php endif; ?>
                            <span class="shop-badge"><?php echo htmlspecialchars($item['category']); ?></span>
                        </div>

                        <!-- Product body details -->
                        <div class="shop-card-body">
                            <h3 class="shop-card-title"><?php echo htmlspecialchars($item['name']); ?></h3>
                            <div class="shop-card-price">€<?php echo number_format($item['price'], 2, ',', ''); ?></div>
                            <p class="shop-card-desc"><?php echo htmlspecialchars($item['description']); ?></p>
                            
                            <?php if ($ingelogd): ?>
                            <!-- Size Select (enkel ingelogd: bestellen mogelijk) -->
                            <?php if (!empty($item['sizes']) && count($item['sizes']) > 0):
                                $select_id = 'size-select-' . htmlspecialchars($item['id']);
                            ?>
                                <label class="form-label" for="<?php echo $select_id; ?>" style="margin-bottom: 4px; font-size: 0.8rem;">Selecteer Maat:</label>
                                <select id="<?php echo $select_id; ?>" name="size[<?php echo htmlspecialchars($item['id']); ?>]" class="shop-size-select">
                                    <?php foreach ($item['sizes'] as $size): ?>
                                        <option value="<?php echo htmlspecialchars($size); ?>"><?php echo htmlspecialchars($size); ?></option>
                                    <?php endforeach; ?>
                                </select>
                            <?php endif; ?>

                            <!-- Trigger Button -->
                            <button class="btn btn-secondary btn-add-to-cart" style="width: 100%; margin-top: auto;"
                                    data-id="<?php echo htmlspecialchars($item['id']); ?>"
                                    data-name="<?php echo htmlspecialchars($item['name']); ?>"
                                    data-price="<?php echo htmlspecialchars($item['price']); ?>"
                                    data-image="<?php echo htmlspecialchars($item['image']); ?>">
                                <svg style="width: 18px; height: 18px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                                In winkelmandje
                            </button>
                            <?php else: ?>
                            <!-- Gast: read-only, link naar login i.p.v. bestellen -->
                            <a href="ouderportaal.php?login_vereist=webshop" class="btn btn-outline" style="width: 100%; margin-top: auto;">
                                <i class="fa-solid fa-right-to-bracket" style="margin-right: 6px;"></i> Log in om te bestellen
                            </a>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endforeach; ?>
    </div><!-- /.shop-products -->
</section>

<?php if ($ingelogd): ?>
<!-- Winkelmandje: schuift in/uit langs de rechterrand. De tab is de toggle (geen aparte knop). -->
<aside class="shop-cart-dock collapsed" id="shop-cart">
    <button type="button" class="shop-cart-tab" id="shop-cart-toggle" aria-expanded="false" aria-controls="shop-cart-panel" aria-label="Winkelmandje openen of sluiten">
        <i class="fa-solid fa-bag-shopping"></i>
        <span class="cart-count" style="display:none;">0</span>
        <span class="shop-cart-tab-label">Mandje</span>
    </button>
    <div class="shop-cart-panel" id="shop-cart-panel">
        <div class="cart-drawer-body"><!-- gevuld door cart.js --></div>
        <div class="shop-cart-foot">
            <div class="cart-subtotal"><span>Subtotaal</span><span class="cart-subtotal-value">€0,00</span></div>
            <p class="shop-cart-note">Bestellingen worden betaald via overschrijving. De instructies en gestructureerde mededeling verschijnen bij het afrekenen.</p>
            <a href="checkout.php" class="btn btn-secondary btn-cart-checkout" style="width: 100%;">Naar afrekenen</a>
        </div>
    </div>
</aside>
<script>
(function () {
    var dock = document.getElementById('shop-cart');
    var tab  = document.getElementById('shop-cart-toggle');
    if (!dock || !tab) return;
    tab.addEventListener('click', function () {
        var collapsed = dock.classList.toggle('collapsed');
        tab.setAttribute('aria-expanded', String(!collapsed));
    });
    // Bij toevoegen het mandje uitschuiven (feedback).
    document.addEventListener('click', function (e) {
        if (e.target.closest('.btn-add-to-cart')) {
            dock.classList.remove('collapsed');
            tab.setAttribute('aria-expanded', 'true');
        }
    });
})();
</script>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
