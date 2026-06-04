<?php
/**
 * Verslagen & notulen (PDF downloads)
 */
$page_title = "Verslagen";
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/db.php';

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

<section class="section container">
    <div class="page-header" style="padding:32px 0 28px;">
        <div class="page-header-line"></div>
        <h1 class="page-header-title">📄 Verslagen</h1>
        <p class="page-header-sub">Notulen van leidingsvergaderingen en groepsbijeenkomsten.</p>
    </div>

    <div style="background:var(--color-bg-linen);border:1px solid var(--color-border);border-radius:var(--border-radius-md);padding:16px 20px;margin-bottom:32px;display:flex;gap:12px;align-items:flex-start;">
        <i class="fa-solid fa-circle-info" style="color:var(--color-accent);margin-top:2px;flex-shrink:0;"></i>
        <p style="font-size:0.88rem;color:var(--color-text-muted);margin:0;line-height:1.5;">
            Verslagen zijn beschikbaar als PDF-download. Enkel voor leden en ouders. Heb je een verslag nodig dat hier niet staat?
            <a href="contact.php" style="color:var(--color-accent);">Neem contact op</a> met de groepsleiding.
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
