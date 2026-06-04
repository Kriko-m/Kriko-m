<?php
/**
 * Ouderportaal — uitsluitend toegankelijk via Scouts & Gidsen-login.
 *
 * Geen lokale accounts/wachtwoorden meer: ouders loggen in via S&G, zien hun
 * leden (live uit de groepsadmin) en kunnen ze inschrijven voor kampen,
 * de kampspecifieke paklijst bekijken en hun webshop-bestellingen opvolgen.
 *
 * Lokaal bewaren we enkel: kamp-inschrijvingen (ga_id + kamp + opmerking)
 * en webshop-bestellingen. Geen profielen, geen namen van niet-bestellers.
 */
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/sgo_config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/kamp_helpers.php';

/* ── Demo-login (enkel in dev-modus, zolang er geen API-key is) ── */
if (sgo_dev_mode() && isset($_GET['demologin'])) {
    $_SESSION['sgo_logged_in']    = true;
    $_SESSION['parent_logged_in'] = true;
    $_SESSION['sgo_id']           = 'OUDER-DEMO';
    $_SESSION['sgo_email']        = 'demo.ouder@kriko-m.be';
    $_SESSION['sgo_name']         = 'Demo Ouder';
    $_SESSION['sgo_access_token'] = 'DEV-MOCK-TOKEN';
    $_SESSION['sgo_children']     = sgo_fetch_children('DEV-MOCK-TOKEN');
    header('Location: ouderportaal.php');
    exit;
}

/* ── Uitloggen ──────────────────────────────────────── */
if (isset($_GET['uitloggen']) || (isset($_GET['action']) && $_GET['action'] === 'logout')) {
    $_SESSION = [];
    session_destroy();
    header('Location: ouderportaal.php');
    exit;
}

$ingelogd    = !empty($_SESSION['sgo_logged_in']);
$kinderen    = $_SESSION['sgo_children'] ?? [];
$ouder_email = strtolower($_SESSION['sgo_email'] ?? '');
$ouder_ref   = $_SESSION['sgo_id'] ?? $ouder_email;
$token       = $_SESSION['sgo_access_token'] ?? '';

$flash = '';
$flash_type = 'success';

/* ── Helper: is dit lid van de ingelogde ouder? ── */
function _eigen_lid(array $kinderen, string $ga_id): bool {
    foreach ($kinderen as $k) {
        if (($k['ga_id'] ?? $k['id'] ?? '') === $ga_id) return true;
    }
    return false;
}

/* ── Kamp inschrijven / uitschrijven ────────────────── */
if ($ingelogd && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $actie   = $_POST['actie'] ?? '';
    $ga_id   = $_POST['ga_id'] ?? '';
    $kamp_id = $_POST['kamp_id'] ?? '';

    if (!_eigen_lid($kinderen, $ga_id)) {
        $flash = 'Je kan enkel je eigen leden inschrijven.';
        $flash_type = 'error';
    } elseif ($actie === 'inschrijven') {
        if (schrijf_kind_in($ga_id, $kamp_id, $_POST['opmerking'] ?? '', $ouder_ref)) {
            $flash = 'Inschrijving geregistreerd! Je vindt de paklijst nu bij het kamp.';
        } else {
            $flash = 'Dit lid was al ingeschreven voor dit kamp.';
            $flash_type = 'error';
        }
    } elseif ($actie === 'uitschrijven') {
        schrijf_kind_uit($ga_id, $kamp_id);
        $flash = 'Inschrijving geannuleerd.';
    }
}

/* ── Webshop: betaling melden ("ik heb overgeschreven") ── */
if ($ingelogd && isset($_GET['action'], $_GET['order_id']) && $_GET['action'] === 'confirm_order_payment') {
    $order_id = $_GET['order_id'];
    $orders = read_db('orders');
    $done = false;
    foreach ($orders as &$ord) {
        if (($ord['id'] ?? '') === $order_id
            && strtolower(trim($ord['email'] ?? '')) === $ouder_email
            && ($ord['status'] ?? '') === 'pending') {
            $ord['status'] = 'waiting_approval';
            $done = true;
            break;
        }
    }
    unset($ord);
    if ($done) {
        write_db('orders', $orders);
        $_SESSION['portaal_flash'] = 'Bedankt! Je betaling is gemeld. De status staat nu op "wachten op bevestiging".';
    } else {
        $_SESSION['portaal_flash_error'] = 'Kon de betaling niet melden (bestelling niet gevonden of al gemeld).';
    }
    header('Location: ouderportaal.php');
    exit;
}

// Flash uit sessie (na redirect)
if (isset($_SESSION['portaal_flash']))       { $flash = $_SESSION['portaal_flash']; unset($_SESSION['portaal_flash']); }
if (isset($_SESSION['portaal_flash_error'])) { $flash = $_SESSION['portaal_flash_error']; $flash_type = 'error'; unset($_SESSION['portaal_flash_error']); }

/* ── Mijn bestellingen (gematcht op e-mail) ─────────── */
$my_orders = [];
if ($ingelogd && $ouder_email !== '') {
    foreach (read_db('orders') as $ord) {
        if (strtolower(trim($ord['email'] ?? '')) === $ouder_email) $my_orders[] = $ord;
    }
    usort($my_orders, fn($a, $b) => strcmp($b['date'] ?? '', $a['date'] ?? ''));
}

$status_labels = [
    'pending'          => ['Wachten op betaling', 'var(--color-warning)'],
    'waiting_approval' => ['Betaling gemeld', 'var(--color-accent)'],
    'confirmed'        => ['Bevestigd', 'var(--color-success)'],
    'approved'         => ['Bevestigd', 'var(--color-success)'],
    'paid'             => ['Betaald', 'var(--color-success)'],
    'completed'        => ['Geleverd', 'var(--color-success)'],
    'cancelled'        => ['Geannuleerd', 'var(--color-error)'],
];

$tak_kleur = [
    'kapoenen' => 'var(--color-kapoenen)', 'welpen' => 'var(--color-welpen)',
    'jonggivers' => 'var(--color-jonggivers)', 'givers' => 'var(--color-givers)',
];

/* ── Kriko Echo's per tak (voor het geselecteerde lid) ── */
$echos_by_tak = ['kapoenen' => [], 'welpen' => [], 'jonggivers' => [], 'givers' => []];
if ($ingelogd) {
    foreach (read_db('echos') as $echo) {
        if (empty($echo['approved'])) continue;
        $k = strtolower($echo['tak'] ?? '');
        if (isset($echos_by_tak[$k])) $echos_by_tak[$k][] = $echo;
    }
    foreach ($echos_by_tak as &$lijst) {
        usort($lijst, fn($a, $b) => (((int)$b['year'] * 100) + (int)$b['month']) - (((int)$a['year'] * 100) + (int)$a['month']));
    }
    unset($lijst);
}
$months_nl = [1=>'januari',2=>'februari',3=>'maart',4=>'april',5=>'mei',6=>'juni',
    7=>'juli',8=>'augustus',9=>'september',10=>'oktober',11=>'november',12=>'december'];

$page_title = "Ouderportaal";
require_once __DIR__ . '/includes/header.php';
?>

<section class="section" style="padding-top:30px;padding-bottom:80px;min-height:60vh;">
  <div class="portaal-wrap">

    <?php if ($flash): ?>
    <div style="margin:0 auto 24px;padding:14px 18px;border-radius:var(--border-radius-md);font-weight:600;
        <?php echo $flash_type === 'error'
            ? 'background:hsla(4,75%,48%,0.1);border:2px solid var(--color-error);color:var(--color-error);'
            : 'background:hsla(145,63%,35%,0.1);border:2px solid var(--color-success);color:var(--color-success);'; ?>">
        <?php echo htmlspecialchars($flash); ?>
    </div>
    <?php endif; ?>

    <?php if (!$ingelogd): ?>
        <!-- ── NIET INGELOGD: enkel S&G ── -->
        <span class="portaal-eyebrow">Ouderportaal</span>
        <?php if (isset($_GET['sgo_error'])): ?>
            <div style="max-width:480px;margin:0 auto 18px;background:hsla(4,75%,48%,0.1);border:1.5px solid var(--color-error);
                color:var(--color-error);padding:12px 16px;border-radius:10px;font-size:0.85rem;">
                <?php echo htmlspecialchars(urldecode($_GET['sgo_error'])); ?>
            </div>
        <?php endif; ?>
        <div style="max-width:480px;margin:0 auto;text-align:center;background:var(--color-bg-white);
            border:1px solid var(--color-border);border-radius:var(--border-radius-lg);padding:40px 32px;box-shadow:var(--shadow-md);">
            <div style="font-size:2.6rem;margin-bottom:12px;">🔐</div>
            <h3 style="font-size:1.4rem;margin-bottom:10px;">Log in met je Scouts-account</h3>
            <p style="color:var(--color-text-muted);font-size:0.92rem;margin-bottom:24px;line-height:1.6;">
                Je logt veilig in via <strong>Scouts &amp; Gidsen Vlaanderen</strong>. Wij bewaren géén wachtwoorden
                of profielen — je leden komen rechtstreeks uit de groepsadministratie.
            </p>
            <?php if (sgo_dev_mode()): ?>
                <a href="ouderportaal.php?demologin=1" class="btn btn-secondary" style="width:100%;">
                    <i class="fa-solid fa-flask"></i> Demo-login (testmodus)
                </a>
                <p style="font-size:0.78rem;color:var(--color-text-muted);margin-top:14px;">
                    De echte S&amp;G-login werkt zodra de API-key in <code>sgo_config.php</code> staat.
                </p>
            <?php else: ?>
                <a href="<?php echo htmlspecialchars(sgo_login_url()); ?>" class="btn btn-secondary" style="width:100%;">
                    <i class="fa-solid fa-right-to-bracket"></i> Inloggen via Scouts &amp; Gidsen
                </a>
            <?php endif; ?>
        </div>

    <?php else: ?>
        <!-- ── INGELOGD: dashboard ── -->
        <div class="portaal-hero">
            <div class="portaal-hero-text">
                <span class="portaal-hero-eyebrow">Ouderportaal</span>
                <h2>Hallo, <?php echo htmlspecialchars($_SESSION['sgo_name'] ?? 'ouder'); ?>! 👋</h2>
                <p>Selecteer een lid links om de ingeschreven kampen, de paklijst en de Kriko Echo's te bekijken.</p>
            </div>
            <span class="portaal-hero-deco">⛺</span>
        </div>

        <?php if (empty($kinderen)): ?>
            <div class="portaal-empty" style="padding:40px 24px;">
                <div style="font-size:2.4rem;margin-bottom:10px;">🧐</div>
                We vonden geen leden gekoppeld aan jouw account.<br>
                Klopt dit niet? Neem contact op met de <a href="contact.php" style="color:var(--color-accent);">groepsleiding</a>.
            </div>
        <?php else: ?>

          <div class="portaal-grid">
            <!-- ===== KOLOM 1: leden-selector (links) ===== -->
            <aside class="portaal-leden">
              <div class="portaal-leden-title">Leden</div>
              <div class="kind-chips" role="tablist">
            <?php foreach ($kinderen as $i => $kind): ?>
                <?php
                    $c_id  = $kind['ga_id'] ?? $kind['id'] ?? '';
                    $c_tak = strtolower($kind['tak'] ?? '');
                    $c_kl  = $tak_kleur[$c_tak] ?? 'var(--color-accent)';
                ?>
                <button class="kind-chip <?php echo $i === 0 ? 'active' : ''; ?>" data-kind="<?php echo htmlspecialchars($c_id); ?>" style="--kleur:<?php echo $c_kl; ?>">
                    <span class="kind-chip-avatar"><?php echo strtoupper(substr($kind['voornaam'] ?? '?', 0, 1)); ?></span>
                    <span class="kind-chip-info">
                        <span class="kind-chip-naam"><?php echo htmlspecialchars($kind['voornaam'] ?? ''); ?></span>
                        <span class="kind-chip-tak"><?php echo htmlspecialchars($c_tak ?: 'tak'); ?></span>
                    </span>
                </button>
            <?php endforeach; ?>
              </div><!-- /.kind-chips -->
            </aside><!-- /.portaal-leden -->

            <!-- ===== KOLOM 2: inhoud van het geselecteerde lid ===== -->
            <div class="portaal-main">
            <!-- Panelen per lid -->
            <?php foreach ($kinderen as $i => $kind): ?>
                <?php
                    $ga_id = $kind['ga_id'] ?? $kind['id'] ?? '';
                    $tak   = strtolower($kind['tak'] ?? '');
                    $naam  = trim(($kind['voornaam'] ?? '') . ' ' . ($kind['achternaam'] ?? ''));
                    $kleur = $tak_kleur[$tak] ?? 'var(--color-accent)';
                    $open_kampen      = open_kampen_voor_tak($tak);
                    $ingeschreven_ids = kampen_voor_kind($ga_id);
                    $kampen_in  = array_filter($open_kampen, fn($k) => in_array($k['id'], $ingeschreven_ids, true));
                    $kampen_uit = array_filter($open_kampen, fn($k) => !in_array($k['id'], $ingeschreven_ids, true));
                    $mijn_echos = $echos_by_tak[$tak] ?? [];
                ?>
                <div class="kind-panel <?php echo $i === 0 ? 'active' : ''; ?>" data-kind="<?php echo htmlspecialchars($ga_id); ?>" style="--kleur:<?php echo $kleur; ?>">
                  <div class="portaal-card">

                    <div class="portaal-lid-head">
                        <div class="portaal-lid-avatar"><?php echo strtoupper(substr($kind['voornaam'] ?? '?', 0, 1)); ?></div>
                        <div>
                            <div class="portaal-lid-naam"><?php echo htmlspecialchars($naam); ?></div>
                            <div class="portaal-lid-meta"><?php echo htmlspecialchars($tak ?: 'tak onbekend'); ?> &middot; lidnr. <?php echo htmlspecialchars($ga_id); ?></div>
                        </div>
                    </div>

                    <!-- Ingeschreven kampen -->
                    <div class="portaal-subhead">🏕️ Ingeschreven kampen</div>
                    <?php if (empty($kampen_in)): ?>
                        <div class="portaal-empty">Nog niet ingeschreven. Kies hieronder een kamp om <?php echo htmlspecialchars($kind['voornaam'] ?? 'dit lid'); ?> in te schrijven.</div>
                    <?php else: foreach ($kampen_in as $kamp): ?>
                        <?php $periode = date('j/n', strtotime($kamp['datum_van'])) . ' – ' . date('j/n/Y', strtotime($kamp['datum_tot'])); ?>
                        <div class="portaal-kamp is-in">
                            <div class="portaal-kamp-naam"><?php echo htmlspecialchars($kamp['naam']); ?> <span style="color:var(--color-success);font-size:0.78rem;">✓ ingeschreven</span></div>
                            <div class="portaal-kamp-meta">📅 <?php echo $periode; ?> &middot; 📍 <?php echo htmlspecialchars($kamp['locatie'] ?? ''); ?></div>
                            <details style="margin-top:12px;">
                                <summary style="cursor:pointer;font-weight:700;color:var(--color-primary);font-size:0.92rem;">🎒 Paklijst bekijken</summary>
                                <div style="margin-top:12px;">
                                    <form class="paklijst-form" data-key="paklijst_<?php echo htmlspecialchars($kamp['id'] . '_' . $ga_id); ?>">
                                    <?php $pi = 0; foreach (($kamp['paklijst'] ?? []) as $cat): ?>
                                        <div class="paklijst-section" style="margin-bottom:12px;">
                                            <div class="paklijst-section-title"><i class="fa-solid fa-list-check" style="color:var(--color-accent);"></i> <?php echo htmlspecialchars($cat['categorie']); ?></div>
                                            <?php foreach (($cat['items'] ?? []) as $item): $pi++; $cid = 'pk_' . $kamp['id'] . '_' . $ga_id . '_' . $pi; ?>
                                            <div class="paklijst-item"><input type="checkbox" id="<?php echo htmlspecialchars($cid); ?>"><label for="<?php echo htmlspecialchars($cid); ?>"><?php echo htmlspecialchars($item); ?></label></div>
                                            <?php endforeach; ?>
                                        </div>
                                    <?php endforeach; ?>
                                    </form>
                                    <form method="post" style="display:inline;">
                                        <input type="hidden" name="actie" value="uitschrijven">
                                        <input type="hidden" name="ga_id" value="<?php echo htmlspecialchars($ga_id); ?>">
                                        <input type="hidden" name="kamp_id" value="<?php echo htmlspecialchars($kamp['id']); ?>">
                                        <button type="submit" class="btn btn-outline" style="padding:6px 13px;font-size:0.8rem;color:var(--color-error);border-color:var(--color-error);" onclick="return confirm('Inschrijving annuleren?');">Inschrijving annuleren</button>
                                    </form>
                                </div>
                            </details>
                        </div>
                    <?php endforeach; endif; ?>

                    <!-- Kriko Echo's -->
                    <div class="portaal-subhead">📰 Kriko Echo's</div>
                    <?php if (empty($mijn_echos)): ?>
                        <div class="portaal-empty">Momenteel geen Kriko Echo beschikbaar voor deze tak.</div>
                    <?php else: ?>
                        <div class="portaal-echo-grid">
                        <?php foreach ($mijn_echos as $echo): $label = ($months_nl[(int)($echo['month'] ?? 0)] ?? '') . ' ' . ($echo['year'] ?? ''); ?>
                            <a class="portaal-echo-btn" href="uploads/echos/<?php echo urlencode($echo['file_name'] ?? ''); ?>" target="_blank" rel="noopener">
                                <span><i class="fa-solid fa-file-pdf"></i><span class="portaal-echo-maand"><?php echo htmlspecialchars(trim($label)); ?></span></span>
                                <span class="portaal-echo-open">Openen <i class="fa-solid fa-arrow-up-right-from-square"></i></span>
                            </a>
                        <?php endforeach; ?>
                        </div>
                    <?php endif; ?>

                    <!-- Schrijf in voor een kamp -->
                    <div class="portaal-subhead">➕ Schrijf in voor een kamp</div>
                    <?php if (empty($kampen_uit)): ?>
                        <div class="portaal-empty">Geen open kampen op dit moment voor deze tak.</div>
                    <?php else: foreach ($kampen_uit as $kamp): ?>
                        <?php $periode = date('j/n', strtotime($kamp['datum_van'])) . ' – ' . date('j/n/Y', strtotime($kamp['datum_tot'])); ?>
                        <div class="portaal-kamp">
                            <div class="portaal-kamp-naam"><?php echo htmlspecialchars($kamp['naam']); ?></div>
                            <div class="portaal-kamp-meta">📅 <?php echo $periode; ?> &middot; 📍 <?php echo htmlspecialchars($kamp['locatie'] ?? ''); ?></div>
                            <?php if (!empty($kamp['beschrijving'])): ?><div class="portaal-kamp-desc"><?php echo htmlspecialchars($kamp['beschrijving']); ?></div><?php endif; ?>
                            <form method="post" style="margin-top:12px;display:flex;flex-direction:column;gap:9px;">
                                <input type="hidden" name="actie" value="inschrijven">
                                <input type="hidden" name="ga_id" value="<?php echo htmlspecialchars($ga_id); ?>">
                                <input type="hidden" name="kamp_id" value="<?php echo htmlspecialchars($kamp['id']); ?>">
                                <textarea name="opmerking" rows="2" class="form-control" style="font-size:0.9rem;" placeholder="Vrije opmerking voor de leiding (optioneel). Medische info hoeft hier NIET — die staat veilig bij Scouts & Gidsen."></textarea>
                                <button type="submit" class="btn btn-secondary" style="align-self:flex-start;padding:8px 18px;font-size:0.88rem;"><i class="fa-solid fa-check"></i> Inschrijven</button>
                            </form>
                        </div>
                    <?php endforeach; endif; ?>

                  </div><!-- /.portaal-card -->
                </div><!-- /.kind-panel -->
            <?php endforeach; ?>

            </div><!-- /.portaal-main -->

            <!-- ===== RECHTERKOLOM: webshop-kader ===== -->
            <aside class="portaal-side">
                <div class="portaal-shop-card">
                    <div class="portaal-shop-head">🛍️ Webshop</div>
                    <p>Bestel kledij, uniformstukken, dassen en accessoires van Kriko-M.</p>
                    <a href="shop.php" class="portaal-shop-btn"><i class="fa-solid fa-bag-shopping"></i> Naar de webshop</a>

                    <div class="portaal-shop-divider"></div>
                    <div class="portaal-shop-subtitle">Mijn bestellingen</div>

                    <?php if (empty($my_orders)): ?>
                        <p style="font-size:0.82rem;color:var(--color-text-muted);margin:0;">Je hebt nog geen bestellingen geplaatst.</p>
                    <?php else: foreach ($my_orders as $ord): ?>
                        <?php
                            $st = $ord['status'] ?? 'pending';
                            [$st_label, $st_kleur] = $status_labels[$st] ?? [ucfirst($st), 'var(--color-text-muted)'];
                            $items_txt = implode(', ', array_map(fn($it) => ($it['quantity'] ?? 1) . '× ' . ($it['name'] ?? ''), $ord['items'] ?? []));
                        ?>
                        <div class="portaal-order">
                            <div class="portaal-order-naam"><?php echo htmlspecialchars($items_txt ?: 'Bestelling'); ?></div>
                            <div class="portaal-order-meta">
                                <?php echo htmlspecialchars(date('j/n/Y', strtotime($ord['date'] ?? 'now'))); ?>
                                &middot; €<?php echo number_format((float)($ord['total'] ?? 0), 2, ',', '.'); ?>
                            </div>
                            <span class="portaal-order-status" style="background:<?php echo $st_kleur; ?>;"><?php echo htmlspecialchars($st_label); ?></span>
                            <?php if ($st === 'pending'): ?>
                                <a href="ouderportaal.php?action=confirm_order_payment&order_id=<?php echo urlencode($ord['id']); ?>"
                                   class="btn btn-outline" style="display:block;margin-top:9px;padding:6px 12px;font-size:0.78rem;text-align:center;"
                                   onclick="return confirm('Bevestig dat je het bedrag hebt overgeschreven.');">
                                    <i class="fa-solid fa-check"></i> Ik heb betaald
                                </a>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; endif; ?>
                </div>
            </aside>
          </div><!-- /.portaal-grid -->

        <?php endif; ?>

    <?php endif; ?>

  </div><!-- /.portaal-wrap -->
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
