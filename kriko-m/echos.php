<?php
/**
 * Kriko Echo's — Vic-stijl
 */

$page_title = "Kriko Echo";
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/db.php';

$all_echos = array_filter(read_db('echos'), function($echo) {
    return isset($echo['approved']) && $echo['approved'] === true;
});

$settings    = read_db('settings');
$takken_data = isset($settings['takken']) ? $settings['takken'] : [];
$takken_keys = ['kapoenen', 'welpen', 'jonggivers', 'givers'];

$echos_by_tak = array_fill_keys($takken_keys, []);

foreach ($all_echos as $echo) {
    $k = $echo['tak'];
    if (isset($echos_by_tak[$k])) {
        $echos_by_tak[$k][] = $echo;
    }
}

foreach ($takken_keys as $k) {
    usort($echos_by_tak[$k], function($a, $b) {
        $va = ((int)$a['year'] * 100) + (int)$a['month'];
        $vb = ((int)$b['year'] * 100) + (int)$b['month'];
        return $va === $vb
            ? strtotime($b['uploaded_at']) - strtotime($a['uploaded_at'])
            : $vb - $va;
    });
}

$months_nl = [
    1=>'januari',2=>'februari',3=>'maart',4=>'april',5=>'mei',6=>'juni',
    7=>'juli',8=>'augustus',9=>'september',10=>'oktober',11=>'november',12=>'december'
];

$tak_ages = [
    'kapoenen'   => '6 – 8 jaar',
    'welpen'     => '8 – 11 jaar',
    'jonggivers' => '11 – 14 jaar',
    'givers'     => '14 – 17 jaar',
];

// Ouders zien enkel de KE van de lopende maand en de volgende maand
$ke_cur_m = (int)date('n');
$ke_cur_y = (int)date('Y');
$ke_nxt_m = $ke_cur_m === 12 ? 1 : $ke_cur_m + 1;
$ke_nxt_y = $ke_cur_m === 12 ? $ke_cur_y + 1 : $ke_cur_y;
function ke_zichtbaar(array $e, int $cm, int $cy, int $nm, int $ny): bool {
    $em = (int)($e['month'] ?? 0); $ey = (int)($e['year'] ?? 0);
    return ($em === $cm && $ey === $cy) || ($em === $nm && $ey === $ny);
}
?>

<section class="tak-hero primair hero-echos">
    <div class="container">
        <span class="hero-eyebrow">Maandelijks bulletin</span>
        <h1 class="tak-hero-title">Kriko Echo</h1>
    </div>
</section>

<div class="echo-page-wrap">

    <div class="echo-grid-wrap">
        <div class="echo-grid">
            <?php foreach ($takken_keys as $tak_key):
                $tak      = isset($takken_data[$tak_key]) ? $takken_data[$tak_key] : [];
                $naam     = isset($tak['name']) ? $tak['name'] : ucfirst($tak_key);
                $leeftijd = $tak_ages[$tak_key];
                $pdfs     = array_values(array_filter($echos_by_tak[$tak_key],
                                fn($e) => ke_zichtbaar($e, $ke_cur_m, $ke_cur_y, $ke_nxt_m, $ke_nxt_y)));
            ?>
            <div class="echo-card echo-card-<?php echo $tak_key; ?>">
                <div class="echo-card-inner">
                    <span class="echo-card-naam"><?php echo htmlspecialchars($naam); ?></span>
                    <span class="echo-card-leeftijd"><?php echo htmlspecialchars($leeftijd); ?></span>

                    <div class="echo-card-pdfs">
                        <?php if (empty($pdfs)): ?>
                            <p class="echo-card-empty">Momenteel geen editie beschikbaar.</p>
                        <?php else: ?>
                            <?php foreach ($pdfs as $echo):
                                $label = $months_nl[(int)$echo['month']] . ' ' . $echo['year'];
                            ?>
                            <a href="uploads/echos/<?php echo urlencode($echo['file_name']); ?>"
                               target="_blank" rel="noopener"
                               class="echo-card-pdf-btn">
                                <span class="echo-pdf-left">
                                    <i class="fa-solid fa-file-pdf"></i>
                                    <span class="echo-pdf-maand"><?php echo htmlspecialchars($label); ?></span>
                                </span>
                                <span class="echo-pdf-open">
                                    Openen <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                </span>
                            </a>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>

</div>

<button class="scroll-top-btn" id="scroll-top-btn" aria-label="Scroll naar boven">
    <i class="fa-solid fa-angles-up"></i>
</button>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
