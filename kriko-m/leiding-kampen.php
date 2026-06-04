<?php
/**
 * Leiding — kampoverzicht + ledenlijst exporteren.
 * Enkel toegankelijk voor wie als leiding via S&G is ingelogd.
 */
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/sgo_config.php';
require_once __DIR__ . '/includes/kamp_helpers.php';

$token    = $_SESSION['sgo_access_token'] ?? '';
$ingelogd = !empty($_SESSION['sgo_logged_in']);
$is_leiding = $ingelogd && sgo_is_leiding($token);

$page_title = "Leiding — Kampen";
require_once __DIR__ . '/includes/header.php';
?>

<section class="section container">
    <div class="page-header" style="padding:32px 0 24px;">
        <div class="page-header-line"></div>
        <h1 class="page-header-title">📋 Kampen — Leiding</h1>
        <p class="page-header-sub">Bekijk de inschrijvingen en exporteer de ledenlijst per kamp.</p>
    </div>

    <?php if (!$is_leiding): ?>
        <div style="max-width:480px;margin:0 auto;text-align:center;background:var(--color-bg-white);
            border:1px solid var(--color-border);border-radius:var(--border-radius-lg);padding:40px 32px;box-shadow:var(--shadow-md);">
            <div style="font-size:2.6rem;margin-bottom:12px;">🔐</div>
            <h2 style="font-size:1.3rem;margin-bottom:10px;">Enkel voor leiding</h2>
            <p style="color:var(--color-text-muted);font-size:0.92rem;margin-bottom:24px;">
                Log in met je Scouts &amp; Gidsen-account met leidingsrechten om de ledenlijsten te bekijken.
            </p>
            <?php if (sgo_dev_mode()): ?>
                <a href="mijn-kampen.php?demologin=1" class="btn btn-secondary" style="width:100%;">
                    <i class="fa-solid fa-flask"></i> Demo-login (testmodus)
                </a>
            <?php else: ?>
                <a href="<?php echo htmlspecialchars(sgo_login_url()); ?>" class="btn btn-secondary" style="width:100%;">
                    <i class="fa-solid fa-right-to-bracket"></i> Inloggen via Scouts &amp; Gidsen
                </a>
            <?php endif; ?>
        </div>
    <?php else: ?>
        <div style="max-width:880px;margin:0 auto;">
            <div style="background:hsla(29,57%,46%,0.08);border:1px solid var(--color-accent);border-radius:var(--border-radius-md);
                padding:14px 18px;margin-bottom:24px;display:flex;gap:12px;align-items:flex-start;">
                <i class="fa-solid fa-shield-halved" style="color:var(--color-accent);margin-top:2px;"></i>
                <p style="font-size:0.86rem;color:var(--color-text-dark);margin:0;line-height:1.5;">
                    De export haalt namen en medische fiches <strong>live</strong> uit de groepsadministratie en wordt
                    rechtstreeks gedownload — er wordt niets op de website bewaard. Open het bestand in Google Sheets via
                    <em>Bestand → Importeren</em> of in Excel.
                </p>
            </div>

            <?php foreach (read_kampen() as $kamp): ?>
                <?php $aantal = count(inschrijvingen_voor_kamp($kamp['id'])); ?>
                <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;
                    background:var(--color-bg-white);border:1px solid var(--color-border);border-radius:var(--border-radius-md);
                    padding:16px 20px;margin-bottom:12px;box-shadow:var(--shadow-sm);">
                    <div>
                        <div style="font-weight:700;font-size:1.05rem;"><?php echo htmlspecialchars($kamp['naam']); ?></div>
                        <div style="font-size:0.82rem;color:var(--color-text-muted);">
                            <?php echo htmlspecialchars(ucfirst($kamp['tak'] ?? 'alle')); ?> &middot;
                            <?php echo date('d/m/Y', strtotime($kamp['datum_van'])); ?> –
                            <?php echo date('d/m/Y', strtotime($kamp['datum_tot'])); ?> &middot;
                            <strong><?php echo $aantal; ?></strong> ingeschreven
                        </div>
                    </div>
                    <a href="leiding-export.php?kamp=<?php echo urlencode($kamp['id']); ?>"
                       class="btn btn-secondary" style="padding:9px 18px;font-size:0.88rem;<?php echo $aantal === 0 ? 'opacity:0.5;pointer-events:none;' : ''; ?>">
                        <i class="fa-solid fa-file-arrow-down"></i> Ledenlijst exporteren
                    </a>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
