<?php
/**
 * Footer — Vic-stijl (4 kolommen)
 */

require_once __DIR__ . '/db.php';
$settings = read_db('settings');

$contact_email   = isset($settings['contact_email'])   ? $settings['contact_email']   : 'groepsleiding@kriko-m.be';
$contact_phone   = isset($settings['contact_phone'])   ? $settings['contact_phone']   : '+32 3 776 00 00';
$contact_address = isset($settings['contact_address']) ? $settings['contact_address'] : 'Industriepark-Noord 33, 9100 Sint-Niklaas';
?>
    <?php if ($current_page !== 'admin.php'): ?>
    <footer class="site-footer">
        <div class="site-footer-inner">

            <!-- Kolom 1: Merk -->
            <div class="footer-col footer-col-brand">
                <span class="footer-brand-name">Kriko-M</span>
                <span class="footer-brand-sub">Scouts &amp; Gidsen &mdash; Sint-Niklaas</span>
                <div class="footer-brand-divider"></div>
                <span class="footer-brand-desc">Elke zondag op het VP-plein. Avontuur, vriendschap en buiten zijn — dat is wat we doen.</span>
                <span class="footer-social-label">Volg ons</span>
                <div class="footer-social">
                    <a href="https://www.facebook.com/ScoutsKrikoM/" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                    <a href="https://www.instagram.com/scouts_kriko_m/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                </div>
            </div>

            <!-- Kolom 2: Quick links -->
            <div class="footer-col">
                <span class="footer-col-title">Quick links</span>
                <ul class="footer-links">
                    <li><a href="index.php">Homepage</a></li>
                    <li><a href="evenementen.php">Kalender</a></li>
                    <li><a href="echos.php">Kriko Echo</a></li>
                    <li><a href="verhuur.php">Verhuur lokaal</a></li>
                    <li><a href="shop.php">Webshop</a></li>
                    <li><a href="inschrijven.php">Inschrijven</a></li>
                    <li><a href="verslagen.php">Verslagen</a></li>
                    <li><a href="archief.php">Archief</a></li>
                    <li><a href="ouderportaal.php">Ouderportaal</a></li>
                </ul>
            </div>

            <!-- Kolom 3: Takken -->
            <div class="footer-col">
                <span class="footer-col-title">Takken</span>
                <ul class="footer-links">
                    <li><a href="takken.php?tak=kapoenen">Kapoenen</a></li>
                    <li><a href="takken.php?tak=welpen">Welpen</a></li>
                    <li><a href="takken.php?tak=jonggivers">Jonggivers</a></li>
                    <li><a href="takken.php?tak=givers">Givers</a></li>
                </ul>
            </div>

            <!-- Kolom 4: Contact -->
            <div class="footer-col">
                <span class="footer-col-title">Contact</span>
                <a href="contact.php" class="footer-contact-btn">
                    <i class="fas fa-envelope"></i> Contacteer ons
                </a>
                <ul class="footer-links">
                    <li>
                        <button type="button" class="footer-copy-mail" data-email="<?php echo htmlspecialchars($contact_email); ?>" title="Klik om te kopiëren">
                            <i class="far fa-copy"></i>
                            <span class="footer-copy-mail-text"><?php echo htmlspecialchars($contact_email); ?></span>
                        </button>
                    </li>
                    <li><a href="tel:<?php echo preg_replace('/\s+/', '', $contact_phone); ?>"><?php echo htmlspecialchars($contact_phone); ?></a></li>
                    <li style="color:#bbb; font-size:0.85rem;"><?php echo htmlspecialchars($contact_address); ?></li>
                </ul>
            </div>

        </div>

        <div class="site-footer-bottom">
            <span>&copy; <?php echo date('Y'); ?> Scouts &amp; Gidsen Kriko-M Sint-Niklaas</span>
            <a href="ouderportaal.php" class="dev-trigger" title="Portaal">⚙</a>
        </div>
    </footer>
    <?php endif; ?>

    <!-- JavaScripts -->
    <script src="assets/js/main.js"></script>
    <script src="assets/js/cart.js"></script>
    <script src="assets/js/lightbox.js"></script>
</body>
</html>
