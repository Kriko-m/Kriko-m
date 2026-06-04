<?php
/**
 * Reusable Header Layout Component
 * Scouts Kriko-M Web Platform
 */

require_once __DIR__ . '/db.php';
if (session_status() === PHP_SESSION_NONE) session_start();

// Fetch site configuration settings
$settings = read_db('settings');
$alert_active = isset($settings['alert_active']) ? $settings['alert_active'] : false;
$alert_message = isset($settings['alert_message']) ? $settings['alert_message'] : '';
$scouts_year = isset($settings['scouts_year']) ? $settings['scouts_year'] : '2026-2027';

// Determine active page helper
$current_page = basename($_SERVER['PHP_SELF']);
function active_class($page, $current) {
    return ($page === $current) ? 'active' : '';
}
?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($page_title) ? $page_title . " | Scouts Kriko-M" : "Scouts Kriko-M Sint-Niklaas"; ?></title>
    <meta name="description" content="Welkom bij Scouts Kriko-M uit Sint-Niklaas. Ontdek onze takken, maandelijkse Kriko Echo's planningen, webshop, en hoe lid te worden!">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="assets/images/logo-finaal.png">
    <link rel="shortcut icon" href="assets/images/logo-finaal.png">

    <!-- Stylesheet -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<?php
$portal_pages = ['ouderportaal.php', 'shop.php', 'checkout.php', 'order-success.php'];
$body_classes = [];
if (in_array($current_page, $portal_pages)) $body_classes[] = 'portal-theme';
if ($current_page === 'ouderportaal.php') $body_classes[] = 'portaal';
if (isset($body_class)) $body_classes[] = $body_class;
?>
<body<?php if ($body_classes) echo ' class="' . implode(' ', $body_classes) . '"'; ?>>


    <?php $is_portal_page = in_array($current_page, $portal_pages); ?>

    <!-- Laadscherm — enkel op de publieke site, niet in portaal -->
    <?php if (!$is_portal_page): ?>
    <div id="loading-screen" aria-hidden="true">
        <img src="assets/images/logo-finaal.png" alt="Kriko-M laden…">
        <div class="loading-bar-wrap"><div class="loading-bar"></div></div>
    </div>
    <script>
        (function () {
            var ls = document.getElementById('loading-screen');
            if (!ls) return;
            if (sessionStorage.getItem('kriko_seen')) {
                ls.style.display = 'none';
            } else {
                sessionStorage.setItem('kriko_seen', '1');
            }
        })();
    </script>
    <?php endif; ?>

    <!-- 1. Top Announcement Banner (enkel publieke site) -->
    <?php if ($alert_active && !empty($alert_message) && !$is_portal_page): ?>
        <div class="alert-banner">
            <div class="container alert-container">
                <div class="alert-text">
                    <svg style="width: 20px; height: 20px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                    </svg>
                    <span><?php echo htmlspecialchars($alert_message); ?></span>
                </div>
                <button class="alert-close" aria-label="Melding sluiten">&times;</button>
            </div>
        </div>
    <?php endif; ?>

    <!-- 2. Navigatie: portaal-nav / hoofdnav -->
    <?php if ($is_portal_page): ?>
        <!-- Portaal-nav: bosgroen, portaal-specifieke links -->
        <nav class="portaal-nav" id="portaal-nav">
            <a href="index.php" class="portaal-nav-brand">
                <img src="assets/images/logo-finaal.png" alt="Kriko-M">
                <div class="portaal-nav-brand-text">
                    KRIKO-M
                    <small><?php
                        echo in_array($current_page, ['shop.php', 'checkout.php', 'order-success.php'])
                            ? 'WEBSHOP' : 'PORTAAL';
                    ?></small>
                </div>
            </a>

            <button class="portaal-nav-toggle" id="portaal-nav-toggle" aria-label="Menu openen">
                <span></span><span></span><span></span>
            </button>

            <div class="portaal-nav-links" id="portaal-nav-links">
                <?php
                $is_shop_page = in_array($current_page, ['shop.php', 'checkout.php', 'order-success.php']);
                $portaal_uit  = !empty($_SESSION['sgo_logged_in']) || !empty($_SESSION['ouder_logged_in']);
                ?>
                <?php if ($current_page === 'ouderportaal.php'): ?>
                    <a href="shop.php"><i class="fa-solid fa-bag-shopping"></i> Webshop</a>
                    <?php if ($portaal_uit): ?>
                        <a href="ouderportaal.php?uitloggen=1" class="uit"><i class="fa-solid fa-right-from-bracket"></i> Uitloggen</a>
                    <?php endif; ?>
                <?php elseif ($is_shop_page): ?>
                    <a href="shop.php" <?php if ($current_page === 'shop.php') echo 'class="accent"'; ?>><i class="fa-solid fa-bag-shopping"></i> Webshop</a>
                    <a href="ouderportaal.php"><i class="fa-solid fa-house"></i> Portaal</a>
                    <?php if ($portaal_uit): ?>
                        <a href="ouderportaal.php?uitloggen=1" class="uit"><i class="fa-solid fa-right-from-bracket"></i> Uitloggen</a>
                    <?php endif; ?>
                <?php endif; ?>
                <a href="index.php" class="uit"><i class="fa-solid fa-arrow-left"></i> Terug naar site</a>
            </div>
        </nav>
        <script>
            document.getElementById('portaal-nav-toggle').addEventListener('click', function() {
                document.getElementById('portaal-nav-links').classList.toggle('open');
            });
        </script>

    <?php else: ?>
        <!-- Hoofdsite nav -->
        <header class="site-header">
            <nav class="mainnav" id="mainnav">
                <div class="mainnav-inner">
                    <a href="index.php" class="nav-logo">
                        <img src="assets/images/logo-finaal.png" alt="Kriko-M logo">
                    </a>
                    <ul class="nav-links">
                        <li class="has-dropdown">
                            <a href="takken.php" class="<?php echo ($current_page === 'takken.php') ? 'nav-active' : ''; ?>">TAKKEN <span class="arrow">&#9660;</span></a>
                            <ul class="dropdown">
                                <li><a href="takken.php?tak=kapoenen">Kapoenen</a></li>
                                <li><a href="takken.php?tak=welpen">Welpen</a></li>
                                <li><a href="takken.php?tak=jonggivers">Jonggivers</a></li>
                                <li><a href="takken.php?tak=givers">Givers</a></li>
                            </ul>
                        </li>
                        <li><a href="echos.php" class="<?php echo ($current_page === 'echos.php') ? 'nav-active' : ''; ?>">KRIKO ECHO</a></li>
                        <li><a href="evenementen.php" class="<?php echo ($current_page === 'evenementen.php') ? 'nav-active' : ''; ?>">KALENDER</a></li>
                        <li><a href="verhuur.php" class="<?php echo ($current_page === 'verhuur.php') ? 'nav-active' : ''; ?>">VERHUUR</a></li>
                    </ul>
                    <button class="cart-trigger-btn nav-cart-btn" aria-label="Winkelwagen bekijken" style="display: none;">
                        <svg style="width: 20px; height: 20px; fill: none; stroke: currentColor;" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                        <span class="cart-count" style="display: none;">0</span>
                    </button>
                    <a href="ouderportaal.php" class="nav-cta-secondary">PORTAAL</a>
                    <a href="inschrijven.php" class="nav-cta">INSCHRIJVEN</a>
                    <button class="nav-hamburger" id="nav-hamburger" aria-label="Menu openen" aria-expanded="false">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </nav>
        </header>
    <?php endif; ?>

    <!-- GDPR Cookiebanner (enkel publieke site) -->
    <?php if (!$is_portal_page): ?>
    <div id="cookie-banner" class="cookie-hidden" role="dialog" aria-label="Cookie-melding">
        <span class="cookie-icon">🍪</span>
        <div class="cookie-text">
            <p>Scouts Kriko-M gebruikt <strong>functionele cookies</strong> om je winkelmandje, voorkeuren en instellingen te onthouden. We volgen je niet en delen geen gegevens met derden.</p>
            <div class="cookie-actions">
                <button class="cookie-btn-accept">Begrepen, akkoord!</button>
                <button class="cookie-btn-decline">Enkel essentieel</button>
            </div>
        </div>
    </div>
    <?php endif; ?>

    <!-- 3. Visual Sliding Cart Drawer (enkel publieke site) -->
    <?php if (!$is_portal_page): ?>
    <div class="cart-backdrop"></div>
    <div class="cart-drawer">
        <div class="cart-drawer-header">
            <h3 style="color: var(--color-bg-white); font-size: 1.25rem;">Winkelmandje</h3>
            <button class="cart-drawer-close">&times;</button>
        </div>
        <div class="cart-drawer-body">
            <!-- Dynamically populated via JS -->
        </div>
        <div class="cart-drawer-footer">
            <div class="cart-subtotal">
                <span>Subtotaal:</span>
                <span class="cart-subtotal-value">€0,00</span>
            </div>
            <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 16px; line-height: 1.3;">Bestellingen worden betaald via overschrijving. Instructies worden getoond tijdens de checkout.</p>
            <a href="checkout.php" class="btn btn-secondary btn-cart-checkout" style="width: 100%;">Naar afrekenen</a>
        </div>
    </div>
    <?php endif; ?>
