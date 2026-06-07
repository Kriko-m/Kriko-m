<?php
/**
 * Verslagen & notulen (PDF downloads) — enkel voor leiding/groepsleiding.
 * De groepsleiding beheert (uploadt) de verslagen; ouders en publiek hebben geen toegang.
 */
require_once __DIR__ . '/sgo_config.php';
require_once __DIR__ . '/includes/db.php';
if (session_status() === PHP_SESSION_NONE) session_start();

// Leiding-only: niet-leiding wordt naar de login gestuurd.
$_vs_role = !empty($_SESSION['sgo_logged_in']) ? sgo_get_portal_role($_SESSION['sgo_access_token'] ?? '') : '';
if (!in_array($_vs_role, ['leiding', 'groepsleiding'], true)) {
    header('Location: ouderportaal.php?login_vereist=verslagen');
    exit;
}

$page_title = "Verslagen";
require_once __DIR__ . '/includes/header.php';

$verslagen = read_db('verslagen');
if (!is_array($verslagen)) $verslagen = [];
usort($verslagen, fn($a, $b) => strcmp($b['date'], $a['date']));

// Groepeer per jaar
$per_jaar = [];
foreach ($verslagen as $v) {
    $jaar = isset($v['date']) ? substr($v['date'], 0, 4) : 'Onbekend';
    $per_jaar[$jaar][] = $v;
}
krsort($per_jaar);
?>

<section class="tak-hero primair hero-verslagen">
    <div class="container">
        <span class="hero-eyebrow">Leiding</span>
        <h1 class="tak-hero-title">Verslagen</h1>
        <p style="color:rgba(255,255,255,.85);margin-top:8px;font-size:1.1rem;">Notulen van leidingsvergaderingen en groepsbijeenkomsten.</p>
    </div>
</section>

<section class="section container">

    <div style="background:var(--color-bg-linen);border:1px solid var(--color-border);border-radius:var(--border-radius-md);padding:16px 20px;margin-bottom:32px;display:flex;gap:12px;align-items:flex-start;">
        <i class="fa-solid fa-circle-info" style="color:var(--color-accent);margin-top:2px;flex-shrink:0;"></i>
        <p style="font-size:0.88rem;color:var(--color-text-muted);margin:0;line-height:1.5;">
            Notulen van leidings- en groepsvergaderingen, beheerd door de groepsleiding. Enkel zichtbaar voor leiding.
            Mis je een verslag? <a href="contact.php" style="color:var(--color-accent);">Neem contact op</a> met de groepsleiding.
        </p>
    </div>

    <?php if (empty($verslagen)): ?>
        <div style="text-align:center;padding:60px 24px;color:var(--color-text-muted);">
            <div style="font-size:3rem;margin-bottom:16px;">📋</div>
            <p>Nog geen verslagen gepubliceerd.</p>
        </div>
    <?php else: ?>
        <?php foreach ($per_jaar as $jaar => $lijst): ?>
        <div class="archief-year reveal">
            <div class="archief-year-title">
                <i class="fa-solid fa-calendar-days" style="color:var(--color-accent);"></i>
                Scoutsjaar <?php echo htmlspecialchars($jaar); ?>–<?php echo htmlspecialchars((string)((int)$jaar + 1)); ?>
            </div>
            <?php foreach ($lijst as $v): ?>
            <?php
                $heeft_pdf = !empty($v['bestand']) && file_exists(__DIR__ . '/uploads/verslagen/' . $v['bestand']);
                $date_fmt = isset($v['date']) ? date('j F Y', strtotime($v['date'])) : '';
            ?>
            <?php if ($heeft_pdf): ?>
            <a href="uploads/verslagen/<?php echo urlencode($v['bestand']); ?>" class="verslag-item" target="_blank" rel="noopener">
            <?php else: ?>
            <div class="verslag-item">
            <?php endif; ?>
                <div class="verslag-icon"><i class="fa-solid fa-file-pdf"></i></div>
                <div class="verslag-info">
                    <div class="verslag-title"><?php echo htmlspecialchars($v['title']); ?></div>
                    <div class="verslag-meta">
                        <?php echo htmlspecialchars($date_fmt); ?>
                        <?php if (!empty($v['tak'])): ?> &bull; <?php echo htmlspecialchars(ucfirst($v['tak'])); ?><?php endif; ?>
                        <?php if (!empty($v['samenvatting'])): ?><br><?php echo htmlspecialchars($v['samenvatting']); ?><?php endif; ?>
                    </div>
                </div>
                <?php if ($heeft_pdf): ?>
                <div class="verslag-download"><i class="fa-solid fa-download"></i> PDF</div>
                <?php else: ?>
                <div class="verslag-download" style="color:var(--color-text-muted);font-weight:400;"><i class="fa-solid fa-lock"></i> Binnenkort</div>
                <?php endif; ?>
            <?php if ($heeft_pdf): ?></a><?php else: ?></div><?php endif; ?>
            <?php endforeach; ?>
        </div>
        <?php endforeach; ?>
    <?php endif; ?>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
