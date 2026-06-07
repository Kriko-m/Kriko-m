<?php
/**
 * Divisions Details - Takken View
 * Scouts Kriko-M Web Platform
 */

require_once __DIR__ . '/includes/db.php';

// Load scouts divisions data dynamically from the flat-file database
$settings = read_db('settings');
$takken_data = isset($settings['takken']) ? $settings['takken'] : [];

// Determine selected division or show directory
$selected_tak = isset($_GET['tak']) && array_key_exists($_GET['tak'], $takken_data) ? $_GET['tak'] : null;

$page_title = $selected_tak ? $takken_data[$selected_tak]['name'] : "Onze Takken";
require_once __DIR__ . '/includes/header.php';

// Haal de 2 meest recente goedgekeurde echo's op voor de geselecteerde tak
$recent_echos = [];
if ($selected_tak) {
    $echos = read_db('echos');
    $tak_echos = array_filter($echos, function($echo) use ($selected_tak) {
        return $echo['tak'] === $selected_tak && isset($echo['approved']) && $echo['approved'] === true;
    });
    if (!empty($tak_echos)) {
        usort($tak_echos, function($a, $b) {
            $valA = ($a['year'] * 100) + $a['month'];
            $valB = ($b['year'] * 100) + $b['month'];
            return $valB - $valA;
        });
        $recent_echos = array_slice(array_values($tak_echos), 0, 2);
    }
}

$months_nl = [
    1=>'Januari', 2=>'Februari', 3=>'Maart', 4=>'April', 5=>'Mei', 6=>'Juni',
    7=>'Juli', 8=>'Augustus', 9=>'September', 10=>'Oktober', 11=>'November', 12=>'December'
];
?>

<!-- 1. Takken Page Hero -->
<?php if ($selected_tak):
    $tak = $takken_data[$selected_tak];
?>
    <?php
    // Handmatige donkere variant per tak — voorkomt vuile kleuren bij color-mix met zwart
    $tak_dark = [
        'kapoenen'   => '#d4780a',  // Warm amber — geel → oranje gradient (levendig, niet vuil)
        'welpen'     => '#1a5216',  // Donkergroen
        'jonggivers' => '#8a3200',  // Donkeroranje
        'givers'     => '#153666',  // Donkerblauw
    ][$selected_tak] ?? '#3a0a14';
    ?>
    <style>
        :root {
            --tak-color:      var(--color-<?php echo htmlspecialchars($selected_tak); ?>);
            --tak-color-dark: <?php echo $tak_dark; ?>;
        }
    </style>

    <section class="tak-hero <?php echo $tak['class']; ?>">
        <div class="container">
            <h2 class="tak-hero-title"><?php echo $tak['name']; ?></h2>
        </div>
    </section>

    <!-- 2. Tak Specific Detail Layout -->
    <section class="section container">
        <div class="tak-layout">
            <!-- Left Main Column -->
            <div style="display: flex; flex-direction: column; gap: 40px;">
                <!-- Description -->
                <div style="background-color: var(--color-bg-white); border-radius: var(--border-radius-lg); box-shadow: var(--shadow-md); padding: 40px; border: 1px solid var(--color-border);">
                    <h3 style="font-size: 1.8rem; margin-bottom: 18px; color: var(--color-primary-dark);">Wie zijn we?</h3>
                    <p style="font-size: 1.05rem; line-height: 1.7; color: var(--color-text-dark); margin-bottom: 20px;"><?php echo $tak['description']; ?></p>
                    
                    <h4 style="font-size: 1.3rem; margin-top: 30px; margin-bottom: 12px; color: var(--color-primary-dark);">Programma & Vergaderingen</h4>
                    <p style="color: var(--color-text-muted);">Elke zondagochtend verzamelen we aan onze scoutslokalen op het VP-plein van <strong>9:45 tot 12:30</strong> stipt. De vergadering is gevuld met actieve bosspelen, sjorringen, knutselen en sport. Vergeet niet de maandelijkse planner (Kriko Echo) te downloaden om te zien of we een speciale activiteit hebben!</p>
                </div>

                <!-- Leaders team grid -->
                <div class="leaders-section">
                    <h3 style="font-size: 1.6rem; border-bottom: 2px solid var(--color-bg-linen); padding-bottom: 12px; color: var(--color-primary-dark);">De Leiding</h3>
                    <p style="color: var(--color-text-muted); font-size: 0.95rem; margin-top: 8px;">Dit team staat elke zondag klaar om er een onvergetelijke vergadering van te maken. Heb je een vraag? Spreek ons gerust aan na de vergadering of stuur een mailtje of sms.</p>
                    
                    <div class="leaders-grid">
                        <?php foreach ($tak['leaders'] as $leader): 
                            // Extract initials
                            $parts = explode(' ', $leader['name']);
                            $initials = '';
                            if (count($parts) >= 2) {
                                $initials = substr($parts[0], 0, 1) . substr(end($parts), 0, 1);
                            } else {
                                $initials = substr($leader['name'], 0, 2);
                            }
                        ?>
                            <div class="leader-card">
                                <div class="leader-avatar"><?php echo strtoupper($initials); ?></div>
                                <h4><?php echo htmlspecialchars($leader['name']); ?></h4>
                                <?php if (!empty($leader['totem'])): ?>
                                    <p class="leader-totem">"<?php echo htmlspecialchars($leader['totem']); ?>"</p>
                                <?php endif; ?>
                                <p style="font-weight: 600; font-size: 0.85rem; color: var(--color-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;"><?php echo htmlspecialchars($leader['role']); ?></p>
                                <?php if (!empty($leader['phone'])): ?>
                                    <a href="tel:<?php echo str_replace([' ', '.'], '', $leader['phone']); ?>" class="leader-phone">
                                        <svg style="width: 12px; height: 12px; fill: none; stroke: currentColor;" stroke-width="2" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                        </svg>
                                        <?php echo htmlspecialchars($leader['phone']); ?>
                                    </a>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <!-- Right Sidebar Column -->
            <div>
                <!-- 1. Echo planning card -->
                <div class="side-card" style="background: linear-gradient(135deg, color-mix(in srgb, var(--tak-color) 80%, var(--tak-color-dark)), color-mix(in srgb, var(--tak-color) 45%, var(--tak-color-dark))); color: var(--color-bg-white); border: none;">
                    <a href="echos.php" style="text-decoration: none;">
                        <h3 style="color: rgba(255,255,255,0.9);">Kriko Echo <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.7em; opacity: 0.6; margin-left: 4px;"></i></h3>
                    </a>
                    <p style="font-size: 0.8rem; color: rgba(255,255,255,0.55); margin: -4px 0 14px; border-bottom: 1px dashed rgba(255,255,255,0.2); padding-bottom: 14px;">Onze maandelijkse planning</p>
                    
                    <div class="echo-card-pdfs">
                        <?php if (empty($recent_echos)): ?>
                            <p class="echo-card-empty" style="color: rgba(255,255,255,0.7);">Momenteel geen editie beschikbaar.</p>
                        <?php else: ?>
                            <?php foreach ($recent_echos as $echo):
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

                <!-- 2. Contact details card -->
                <div class="side-card">
                    <h3>Contact</h3>

                    <!-- E-mail kopieer knop -->
                    <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 8px;">Vragen aan de leiding?</p>
                    <button onclick="copyTakEmail(this, '<?php echo htmlspecialchars($tak['email']); ?>')" class="btn btn-outline" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; margin-bottom: 16px;">
                        <svg style="width: 18px; height: 18px; flex-shrink:0;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <span><?php echo htmlspecialchars($tak['email']); ?></span>
                    </button>

                    <!-- WhatsApp knop -->
                    <?php if (!empty($tak['whatsapp_url'])): ?>
                    <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 8px;">Altijd als eerste op de hoogte?</p>
                    <button onclick="openWaModal('<?php echo htmlspecialchars($tak['whatsapp_url']); ?>', '<?php echo htmlspecialchars($tak['name']); ?>')"
                            class="btn" style="width: 100%; background-color: transparent; color: #25D366; border: 1.5px solid #25D366; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
                        <i class="fab fa-whatsapp" style="font-size: 1.1rem;"></i>
                        <span>Doe mee op WhatsApp</span>
                    </button>
                    <?php endif; ?>
                </div>

                <!-- WhatsApp modal -->
                <?php if (!empty($tak['whatsapp_url'])): ?>
                <div id="wa-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:500; align-items:center; justify-content:center; backdrop-filter:blur(4px);" onclick="if(event.target===this) closeWaModal()">
                    <div style="background:#fff; border-radius:20px; padding:36px 32px; max-width:360px; width:90%; text-align:center; position:relative; box-shadow: 0 24px 60px rgba(0,0,0,0.25);">
                        <button onclick="closeWaModal()" style="position:absolute; top:14px; right:16px; background:none; border:none; font-size:1.4rem; cursor:pointer; color:var(--color-text-muted);">&times;</button>
                        <i class="fab fa-whatsapp" style="font-size:2.8rem; color:#25D366; display:block; margin-bottom:12px;"></i>
                        <h3 id="wa-modal-title" style="font-size:1.2rem; color:var(--color-primary-dark); margin-bottom:6px;"></h3>
                        <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:20px;">De leiding gebruikt deze groep voor last-minute berichten, zoals afgelastingen of wijzigingen. Scan de QR-code met je gsm-camera, of tik op de knop.</p>
                        <img id="wa-modal-qr" src="" alt="WhatsApp QR-code"
                             style="width:180px; height:180px; border-radius:12px; border:1px solid var(--color-border); display:block; margin:0 auto 8px;">
                        <p style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:20px;">
                            <i class="fas fa-mobile-screen" style="margin-right:4px;"></i>Scan met je gsm-camera
                        </p>
                        <a id="wa-modal-link" href="#" target="_blank" rel="noopener"
                           class="btn" style="width:100%; background-color:#25D366; color:#fff; display:flex; align-items:center; justify-content:center; gap:8px;">
                            <i class="fab fa-whatsapp"></i> Deelnemen op dit toestel
                        </a>
                    </div>
                </div>
                <?php endif; ?>

                <!-- 3. Uniform instructions card -->
                <div class="side-card">
                    <h3>Uniform regels</h3>
                    <p style="font-size: 0.9rem; line-height: 1.5; color: var(--color-text-dark);"><?php echo $tak['uniform']; ?></p>
                    <a href="ouderportaal.php?show_webshop=1" class="tak-card-link" style="margin-top: 14px; display: inline-flex;">Bestel onze groepsdas &raquo;</a>
                </div>
            </div>
        </div>
    </section>


<?php else: ?>
    <!-- 3. Tak-overzicht -->
    <section class="tak-hero primair hero-takken">
        <div class="container">
            <span class="hero-eyebrow">Scouts Kriko-M</span>
            <h1 class="tak-hero-title">Onze Takken</h1>
            <p style="color:rgba(255,255,255,.85);margin-top:8px;font-size:1.1rem;">Klik op een tak voor alle info, de leiding en de laatste Kriko Echo.</p>
        </div>
    </section>

    <section class="vic-takken-section vic-takken-section--full">
        <div class="vic-takken-grid">
            <?php
            $tak_images = [
                'kapoenen'   => 'assets/images/tak_kapoenen.jpg',
                'welpen'     => 'assets/images/tak_welpen.jpg',
                'jonggivers' => 'assets/images/tak_jonggivers.jpg',
                'givers'     => 'assets/images/tak_givers.jpg',
            ];
            foreach ($takken_data as $key => $tak):
                $img = isset($tak_images[$key]) ? $tak_images[$key] : 'assets/images/hero-bg.jpg';
            ?>
                <a href="takken.php?tak=<?php echo $key; ?>"
                   class="vic-tak-card tak-<?php echo $tak['class']; ?>"
                   style="background-image: url('<?php echo $img; ?>')">
                    <span class="vic-tak-name"><?php echo htmlspecialchars($tak['name']); ?></span>
                    <span class="vic-tak-age"><?php echo htmlspecialchars($tak['age_range']); ?></span>
                </a>
            <?php endforeach; ?>
        </div>
    </section>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
