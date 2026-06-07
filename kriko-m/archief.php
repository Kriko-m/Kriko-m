<?php
/**
 * Archief — overzicht van echos, verslagen en kampverhalen per jaar
 */
$page_title = "Archief";
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/db.php';

$echos      = read_db('echos');

if (!is_array($echos))    $echos    = [];

// Combineer alles met type-label.
// (Verslagen zitten hier bewust niet bij: die zijn leiding-only, niet publiek.)
$all = [];
foreach ($echos as $e) {
    if (isset($e['approved']) && !$e['approved']) continue;
    $jaar = $e['year'] ?? '2024';
    $maand = str_pad($e['month'] ?? '1', 2, '0', STR_PAD_LEFT);
    $all[] = [
        'type'  => 'echo',
        'label' => 'Kriko Echo',
        'title' => $e['title'] ?? (ucfirst($e['tak'] ?? '').' Echo '.$e['month'].'/'.($e['year'] ?? '')),
        'date'  => $jaar.'-'.$maand.'-01',
        'link'  => isset($e['file_name']) && $e['file_name'] ? 'uploads/echos/'.urlencode($e['file_name']) : '#',
        'icon'  => '📰',
    ];
}

// Sorteer op datum nieuwste eerst
usort($all, fn($a,$b) => strcmp($b['date'], $a['date']));

// Groepeer per jaar
$per_jaar = [];
foreach ($all as $item) {
    $jaar = substr($item['date'], 0, 4);
    $per_jaar[$jaar][] = $item;
}
krsort($per_jaar);
?>

<section class="tak-hero primair hero-archief">
    <div class="container">
        <span class="hero-eyebrow">Scouts Kriko-M</span>
        <h1 class="tak-hero-title">Archief</h1>
        <p style="color:rgba(255,255,255,.85);margin-top:8px;font-size:1.1rem;">Alle Kriko Echo's op chronologische volgorde.</p>
    </div>
</section>

<section class="section container">

    <?php if (empty($all)): ?>
        <div style="text-align:center;padding:60px 24px;color:var(--color-text-muted);">
            <div style="font-size:3rem;margin-bottom:16px;">📦</div>
            <p>Het archief is nog leeg. Kom binnenkort terug!</p>
        </div>
    <?php else: ?>
        <?php foreach ($per_jaar as $jaar => $items): ?>
        <div class="archief-year reveal">
            <div class="archief-year-title">
                🗓️ <?php echo htmlspecialchars($jaar); ?>
                <span style="font-size:0.8rem;font-weight:400;color:var(--color-text-muted);"><?php echo count($items); ?> items</span>
            </div>
            <div class="archief-grid">
                <?php foreach ($items as $item): ?>
                <a href="<?php echo htmlspecialchars($item['link']); ?>" class="archief-card"
                   <?php if (str_starts_with($item['link'], 'uploads/')): ?>target="_blank" rel="noopener"<?php endif; ?>>
                    <div class="archief-card-type"><?php echo htmlspecialchars($item['label']); ?></div>
                    <div class="archief-card-title">
                        <?php echo $item['icon']; ?> <?php echo htmlspecialchars($item['title']); ?>
                    </div>
                    <div class="archief-card-date">
                        <?php echo date('j F Y', strtotime($item['date'])); ?>
                    </div>
                </a>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endforeach; ?>
    <?php endif; ?>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
