<?php
/**
 * Portaal — Ouders (lokale accounts) / Leiding / Groepsleiding (S&G OAuth)
 *
 * Auth-systemen:
 *   Ouders       → eigen account op deze site (email + wachtwoord)
 *                  kinderen koppelen via S&G "voeg kind toe"-flow
 *   Leiding      → S&G OAuth2 (tak-beheer, kampen, echo's, CSV)
 *   Groepsleiding→ S&G OAuth2 (alles + kalender)
 */
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/sgo_config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/kamp_helpers.php';
require_once __DIR__ . '/includes/ouder_auth.php';

/* ── Demo-logins (enkel in dev-modus) ────────────────── */
if (sgo_dev_mode() && isset($_GET['demologin'])) {
    $dl = $_GET['demologin'];
    if ($dl === 'leiding') {
        $_SESSION['sgo_logged_in']      = true;
        $_SESSION['sgo_access_token']   = 'DEV-MOCK-TOKEN';
        $_SESSION['sgo_id']             = 'LEIDING-DEMO';
        $_SESSION['sgo_name']           = 'Vic Verhaegen';
        $_SESSION['sgo_email']          = 'vic.verhaegen@scouts.be';
        $_SESSION['sgo_portal_role']    = 'leiding';
        $_SESSION['sgo_leiding_takken'] = ['welpen'];
    } elseif ($dl === 'groepsleiding') {
        $_SESSION['sgo_logged_in']      = true;
        $_SESSION['sgo_access_token']   = 'DEV-MOCK-TOKEN';
        $_SESSION['sgo_id']             = 'GL-DEMO';
        $_SESSION['sgo_name']           = 'Pieter Room';
        $_SESSION['sgo_email']          = 'pieter.room@scouts.be';
        $_SESSION['sgo_portal_role']    = 'groepsleiding';
        $_SESSION['sgo_leiding_takken'] = ['kapoenen','welpen','jonggivers','givers'];
    } else {
        // Demo ouderaccount: maak aan als het nog niet bestaat
        $demo_email = 'demo.ouder@kriko-m.be';
        $demo_acc   = get_ouder_by_email($demo_email);
        if (!$demo_acc) {
            $demo_acc = create_ouder_account('Demo Ouder', $demo_email, 'demo1234');
            // Voeg mock-kinderen toe
            foreach (sgo_mock_children() as $kind) add_kind_to_account($demo_acc['id'], $kind);
            $demo_acc = get_ouder_by_id($demo_acc['id']); // herlaad met kinderen
        }
        ouder_session_set($demo_acc);
    }
    header('Location: ouderportaal.php'); exit;
}

/* ── Uitloggen ────────────────────────────────────────── */
if (isset($_GET['uitloggen'])) {
    $_SESSION = []; session_destroy();
    header('Location: ouderportaal.php'); exit;
}

/* ── Auth detectie ────────────────────────────────────── */
$ouder_ingelogd = !empty($_SESSION['ouder_logged_in']);
$sgo_ingelogd   = !empty($_SESSION['sgo_logged_in']);
$ingelogd       = $ouder_ingelogd || $sgo_ingelogd;

if ($ouder_ingelogd) {
    $ouder_account = get_ouder_by_id($_SESSION['ouder_account_id'] ?? '');
    $ouder_naam    = $ouder_account['naam']  ?? 'ouder';
    $ouder_email   = $ouder_account['email'] ?? '';
    $ouder_ref     = $_SESSION['ouder_account_id'] ?? '';
    $kinderen      = $ouder_account['kinderen'] ?? [];
    $token         = '';
    $portal_role   = 'ouder';
    $is_leiding    = false;
    $leiding_takken= [];
} elseif ($sgo_ingelogd) {
    $token          = $_SESSION['sgo_access_token'] ?? '';
    $ouder_naam     = $_SESSION['sgo_name']  ?? 'gebruiker';
    $ouder_email    = strtolower($_SESSION['sgo_email'] ?? '');
    $ouder_ref      = $_SESSION['sgo_id']   ?? $ouder_email;
    $portal_role    = sgo_get_portal_role($token);
    $is_leiding     = in_array($portal_role, ['leiding','groepsleiding']);
    $leiding_takken = $is_leiding ? sgo_get_leiding_takken($token) : [];
    $kinderen       = [];
} else {
    $ouder_naam = $ouder_email = $ouder_ref = $token = '';
    $kinderen = $leiding_takken = [];
    $portal_role = 'ouder'; $is_leiding = false;
}

/* ── Flash ────────────────────────────────────────────── */
$flash = ''; $flash_type = 'success'; $login_error = '';
if (isset($_GET['kind_toegevoegd'])) $flash = 'Kind succesvol gelinkt aan jouw account! 🎉';
if (isset($_GET['welkom']))          $flash = 'Account aangemaakt! Voeg hieronder je kind(eren) toe.';

/* ── Lokale ouder-login (POST voor HTML output) ────────── */
if (!$ingelogd && $_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['actie'] ?? '') === 'ouder_login') {
    $account = verify_ouder_login($_POST['email'] ?? '', $_POST['password'] ?? '');
    if ($account) {
        ouder_session_set($account);
        header('Location: ouderportaal.php'); exit;
    }
    $login_error = 'Ongeldig e-mailadres of wachtwoord.';
}

/* ── Kind toevoegen → redirect naar S&G ──────────────── */
if ($ouder_ingelogd && isset($_GET['actie']) && $_GET['actie'] === 'addkid') {
    header('Location: ' . sgo_addkid_url($_SESSION['ouder_account_id'])); exit;
}

/* ── Helpers ──────────────────────────────────────────── */
function _eigen_lid(array $kinderen, string $ga_id): bool {
    foreach ($kinderen as $k) {
        if (($k['ga_id'] ?? $k['id'] ?? '') === $ga_id) return true;
    }
    return false;
}

function _upload_kamp_bestand(array $file, string $kamp_id, string $type): ?string {
    if ($file['error'] !== UPLOAD_ERR_OK || $file['size'] > 10*1024*1024) return null;
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['pdf','jpg','jpeg','png','docx'])) return null;
    $dir = __DIR__ . '/uploads/kamp-bestanden/';
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $fn = 'bf-' . preg_replace('/[^a-z0-9]/', '', strtolower($kamp_id)) . '-' . $type . '-' . uniqid() . '.' . $ext;
    return move_uploaded_file($file['tmp_name'], $dir . $fn) ? $fn : null;
}

/* ================================================================
   ACTION HANDLERS
   ================================================================ */
if ($ingelogd && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $actie   = $_POST['actie'] ?? '';
    $kamp_id = $_POST['kamp_id'] ?? '';

    /* ── OUDER ── */
    if ($portal_role === 'ouder') {

        // Kind ontkoppelen van account
        if ($actie === 'ontkoppel_kind' && $ouder_ingelogd) {
            remove_kind_from_account($_SESSION['ouder_account_id'], $_POST['ga_id'] ?? '');
            $kinderen = get_ouder_by_id($_SESSION['ouder_account_id'])['kinderen'] ?? [];
            $flash = 'Kind ontkoppeld van jouw account.';
        }
        // Account verwijderen
        elseif ($actie === 'verwijder_account' && $ouder_ingelogd) {
            delete_ouder_account($_SESSION['ouder_account_id']);
            $_SESSION = []; session_destroy();
            header('Location: ouderportaal.php'); exit;
        }

        $ga_id = $_POST['ga_id'] ?? '';
        if (!_eigen_lid($kinderen, $ga_id)) {
            if (!in_array($actie, ['ontkoppel_kind','verwijder_account'])) {
                $flash = 'Je kan enkel je eigen leden inschrijven.'; $flash_type = 'error';
            }
        } elseif ($actie === 'inschrijven') {
            if (schrijf_kind_in($ga_id, $kamp_id, $_POST['opmerking'] ?? '', $ouder_ref))
                $flash = 'Inschrijving geregistreerd!';
            else { $flash = 'Dit lid was al ingeschreven.'; $flash_type = 'error'; }
        } elseif ($actie === 'uitschrijven') {
            schrijf_kind_uit($ga_id, $kamp_id);
            $flash = 'Inschrijving geannuleerd.';
        }
    }

    /* ── LEIDING / GROEPSLEIDING ── */
    if ($is_leiding) {
        $kamp = $kamp_id ? get_kamp($kamp_id) : null;
        $mag  = !$kamp || $portal_role === 'groepsleiding' || in_array($kamp['tak'] ?? '', $leiding_takken);

        if ($actie === 'maak_kamp') {
            $tak = $_POST['tak'] ?? ($leiding_takken[0] ?? 'alle');
            if ($portal_role === 'groepsleiding' || in_array($tak, $leiding_takken)) {
                $nk = create_kamp(array_merge($_POST, ['tak' => $tak, 'aangemaakt_door' => $ouder_ref]));
                $flash = 'Kamp "' . htmlspecialchars($nk['naam']) . '" aangemaakt.';
            }
        } elseif ($actie === 'wijzig_kamp' && $kamp && $mag) {
            update_kamp($kamp_id, $_POST);
            $flash = 'Kamp bijgewerkt.';
        } elseif ($actie === 'verwijder_kamp' && $kamp && $mag) {
            delete_kamp($kamp_id);
            $flash = 'Kamp verwijderd.';
        } elseif ($actie === 'upload_bestand' && $kamp && $mag && isset($_FILES['bestand'])) {
            $type = $_POST['bestand_type'] ?? 'overige';
            $naam = $_POST['bestand_naam'] ?? ($_FILES['bestand']['name'] ?? 'bestand');
            $fn   = _upload_kamp_bestand($_FILES['bestand'], $kamp_id, $type);
            if ($fn) { add_kamp_bestand($kamp_id, $type, $naam, $fn); $flash = 'Bestand geüpload.'; }
            else { $flash = 'Upload mislukt. Gebruik PDF, JPG, PNG of DOCX (max 10 MB).'; $flash_type = 'error'; }
        } elseif ($actie === 'verwijder_bestand' && $kamp && $mag) {
            delete_kamp_bestand($kamp_id, $_POST['bestand_id'] ?? '');
            $flash = 'Bestand verwijderd.';
        } elseif ($actie === 'upload_echo') {
            $tak  = $_POST['echo_tak'] ?? ($leiding_takken[0] ?? '');
            if (($portal_role === 'groepsleiding' || in_array($tak, $leiding_takken)) && isset($_FILES['echo_file'])) {
                $ef = $_FILES['echo_file'];
                if ($ef['error'] === UPLOAD_ERR_OK && strtolower(pathinfo($ef['name'], PATHINFO_EXTENSION)) === 'pdf') {
                    $month = max(1, min(12, (int)($_POST['echo_month'] ?? date('n'))));
                    $year  = (int)($_POST['echo_year'] ?? date('Y'));
                    $fn    = 'echo-' . $year . '-' . $month . '-' . $tak . '-' . uniqid() . '.pdf';
                    $dir   = __DIR__ . '/uploads/echos/';
                    if (!is_dir($dir)) mkdir($dir, 0755, true);
                    if (move_uploaded_file($ef['tmp_name'], $dir . $fn)) {
                        $echos   = read_db('echos') ?: [];
                        $echos[] = ['id' => 'echo_' . bin2hex(random_bytes(6)),
                            'title' => 'Kriko Echo ' . ucfirst($tak) . ' ' . $month . '/' . $year,
                            'month' => $month, 'year' => $year, 'tak' => $tak,
                            'file_name' => $fn, 'uploaded_at' => date('Y-m-d H:i:s'), 'approved' => true];
                        write_db('echos', $echos);
                        $flash = 'Kriko Echo geüpload.';
                    } else { $flash = 'Upload mislukt.'; $flash_type = 'error'; }
                } else { $flash = 'Enkel PDF-bestanden toegestaan.'; $flash_type = 'error'; }
            }
        }
    }

    /* ── GROEPSLEIDING: kalender ── */
    if ($portal_role === 'groepsleiding') {
        if ($actie === 'maak_event') {
            $events   = read_db('calendar') ?: [];
            $events[] = ['id' => 'cal_' . bin2hex(random_bytes(6)),
                'title'       => substr(trim($_POST['title'] ?? ''), 0, 200),
                'date'        => $_POST['date'] ?? '',
                'time'        => substr(trim($_POST['time'] ?? ''), 0, 50),
                'location'    => substr(trim($_POST['location'] ?? ''), 0, 300),
                'description' => substr(trim($_POST['description'] ?? ''), 0, 1000)];
            usort($events, fn($a,$b) => strcmp($a['date']??'', $b['date']??''));
            write_db('calendar', $events);
            $flash = 'Evenement aangemaakt.';
        } elseif ($actie === 'verwijder_event') {
            $eid    = $_POST['event_id'] ?? '';
            $events = array_values(array_filter(read_db('calendar') ?: [], fn($e) => ($e['id'] ?? '') !== $eid));
            write_db('calendar', $events);
            $flash = 'Evenement verwijderd.';
        }
    }
}

/* ── GET: betaling bevestigen ─────────────────────────── */
if ($ingelogd && isset($_GET['action'], $_GET['order_id']) && $_GET['action'] === 'confirm_order_payment') {
    $orders = read_db('orders') ?: [];
    foreach ($orders as &$ord) {
        if (($ord['id'] ?? '') === $_GET['order_id'] && strtolower($ord['email'] ?? '') === $ouder_email) {
            if ($ord['status'] === 'pending') { $ord['status'] = 'waiting_approval'; $flash = 'Betaling gemeld!'; }
            break;
        }
    }
    unset($ord); write_db('orders', $orders);
}

/* ── DATA PREP ────────────────────────────────────────── */
$tak_kleur = ['kapoenen'=>'var(--color-kapoenen)','welpen'=>'var(--color-welpen)',
              'jonggivers'=>'var(--color-jonggivers)','givers'=>'var(--color-givers)'];

$status_labels = [
    'pending'          => ['Wachten op betaling', '#BE8A2E'],
    'waiting_approval' => ['Betaling gemeld',      '#C9963A'],
    'confirmed'        => ['Bevestigd',             '#3F7D5A'],
    'approved'         => ['Bevestigd',             '#3F7D5A'],
    'paid'             => ['Betaald',               '#3F7D5A'],
    'completed'        => ['Geleverd',              '#8A9A8A'],
    'cancelled'        => ['Geannuleerd',           '#B23A4D'],
];
$done_statuses = ['completed','cancelled'];

$my_orders = [];
if ($ingelogd && $portal_role === 'ouder') {
    foreach (read_db('orders') ?: [] as $ord) {
        if (strtolower($ord['email'] ?? '') === $ouder_email) $my_orders[] = $ord;
    }
    usort($my_orders, fn($a,$b) => strcmp($b['date']??'', $a['date']??''));
}

$echos_by_tak = ['kapoenen'=>[],'welpen'=>[],'jonggivers'=>[],'givers'=>[]];
if ($ingelogd) {
    foreach (read_db('echos') ?: [] as $echo) {
        if (empty($echo['approved'])) continue;
        $k = strtolower($echo['tak'] ?? '');
        if (isset($echos_by_tak[$k])) $echos_by_tak[$k][] = $echo;
    }
    foreach ($echos_by_tak as &$lijst)
        usort($lijst, fn($a,$b) => (((int)$b['year']*100)+(int)$b['month'])-(((int)$a['year']*100)+(int)$a['month']));
    unset($lijst);
}

$months_nl = [1=>'januari',2=>'februari',3=>'maart',4=>'april',5=>'mei',6=>'juni',
    7=>'juli',8=>'augustus',9=>'september',10=>'oktober',11=>'november',12=>'december'];

$bestand_labels = ['uitnodiging'=>'📬 Uitnodiging','paklijst_pdf'=>'🎒 Paklijst',
                   'infobrief'=>'📋 Infobrief','overige'=>'📎 Bijlage'];

$calendar_events = ($portal_role === 'groepsleiding') ? (function() {
    $ev = read_db('calendar') ?: [];
    usort($ev, fn($a,$b) => strcmp($a['date']??'', $b['date']??''));
    return $ev;
})() : [];

/* ── Niet ingelogd → standalone login pagina (geen header/nav/footer) ── */
if (!$ingelogd): ?>
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login | Scouts Kriko-M</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link rel="icon" type="image/png" href="assets/images/logo-finaal.png">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --green:#1A3D2A; --green-mid:#2A5C3F; --gold:#C9963A; --bg:#EEF5F1;
            --border:#C2D9C9; --text:#1A1A1A; --muted:#6A8A75; --error:#B23A4D; --radius:14px; }
    html,body { height:100%; font-family:'Outfit',sans-serif; background:var(--bg); color:var(--text); }
    body { display:flex; flex-direction:column; align-items:center; justify-content:center;
           min-height:100vh; padding:40px 20px; gap:24px; }
    h1 { font-family:'Nunito',sans-serif; font-size:2rem; font-weight:900; color:var(--green);
         letter-spacing:.06em; text-transform:uppercase; }
    .card { width:100%; max-width:440px; background:#fff; border-radius:20px;
            box-shadow:0 12px 40px rgba(26,61,42,.12); border:1px solid var(--border); overflow:hidden; }
    /* Tabs */
    .tabs { display:grid; grid-template-columns:1fr 1fr; border-bottom:2px solid var(--border); }
    .tab-btn { padding:14px; background:none; border:none; font-family:'Outfit',sans-serif;
               font-size:.92rem; font-weight:600; cursor:pointer; color:var(--muted);
               transition:color .15s,background .15s; }
    .tab-btn.active { color:var(--green); background:color-mix(in srgb,var(--green) 6%,transparent);
                      border-bottom:2px solid var(--green); margin-bottom:-2px; }
    /* Tab content */
    .tab-pane { display:none; padding:28px 32px 32px; }
    .tab-pane.active { display:block; }
    label { display:block; font-size:.8rem; font-weight:600; color:var(--green); margin-bottom:5px; margin-top:14px; }
    label:first-of-type { margin-top:0; }
    input[type=email],input[type=password],select {
      width:100%; padding:11px 13px; border:2px solid var(--border); border-radius:var(--radius);
      font-family:inherit; font-size:.93rem; color:var(--text); background:#fff; outline:none;
      transition:border-color .15s,box-shadow .15s; }
    input:focus,select:focus { border-color:var(--green-mid); box-shadow:0 0 0 4px rgba(42,92,63,.1); }
    .btn-login { display:block; width:100%; margin-top:18px; padding:13px;
                 background:var(--green); color:#fff; border:none; border-radius:var(--radius);
                 font-family:'Outfit',sans-serif; font-size:.97rem; font-weight:700;
                 cursor:pointer; transition:background .15s; }
    .btn-login:hover { background:var(--green-mid); }
    .hint { font-size:.8rem; color:var(--muted); text-align:center; margin-top:12px; }
    .hint a { color:var(--green); font-weight:700; text-decoration:none; }
    .alert-err { padding:9px 12px; border-radius:9px; font-size:.83rem; font-weight:600;
                 text-align:center; margin-bottom:14px;
                 background:hsla(349,51%,47%,.1); border:1.5px solid var(--error); color:var(--error); }
    .alert-ok { width:100%; max-width:440px; padding:11px 14px; border-radius:11px; font-size:.85rem;
                font-weight:600; text-align:center;
                background:hsla(145,33%,36%,.12); border:1.5px solid #3F7D5A; color:#2C5A40; }
    .divider { border:none; border-top:1px solid var(--border); margin:18px 0; }
    .back-link { display:inline-flex; align-items:center; gap:7px; font-size:.88rem;
                 font-weight:600; color:var(--muted); text-decoration:none; transition:color .15s; }
    .back-link:hover { color:var(--green); }
    .back-link svg { width:14px; height:14px; fill:currentColor; }
    @media (max-width:480px) { .tab-pane { padding:22px 20px 26px; } }
  </style>
</head>
<body>
  <h1>Portaal</h1>

  <?php if (isset($_GET['uitgelogd'])): ?>
    <div class="alert-ok">Je bent uitgelogd.</div>
  <?php endif; ?>

  <div class="card">
    <!-- Tabs -->
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('ouder',this)">👨‍👩‍👧 Ouder / Lid</button>
      <button class="tab-btn"        onclick="switchTab('leiding',this)">🛡️ Leiding</button>
    </div>

    <!-- ── OUDER TAB ── -->
    <div id="pane-ouder" class="tab-pane active">
      <p style="font-size:.85rem;color:var(--muted);margin-bottom:18px;line-height:1.5;">
        Log in met je account op deze site. Nog geen account?
        <a href="register.php" style="color:var(--green);font-weight:700;">Registreer hier</a>.</p>

      <?php if ($login_error): ?>
        <div class="alert-err"><?php echo htmlspecialchars($login_error); ?></div>
      <?php endif; ?>
      <?php if (isset($_GET['sgo_error'])): ?>
        <div class="alert-err"><?php echo htmlspecialchars(urldecode($_GET['sgo_error'])); ?></div>
      <?php endif; ?>

      <form method="POST">
        <input type="hidden" name="actie" value="ouder_login">
        <label>E-mailadres</label>
        <input type="email" name="email" required placeholder="naam@voorbeeld.be"
               value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>" autofocus>
        <label>Wachtwoord</label>
        <input type="password" name="password" required placeholder="••••••••">
        <button type="submit" class="btn-login">Inloggen →</button>
      </form>
      <?php if (sgo_dev_mode()): ?>
        <hr class="divider">
        <a href="ouderportaal.php?demologin=1" style="display:block;text-align:center;font-size:.78rem;color:var(--muted);text-decoration:underline;">
          Demo ouder-account</a>
      <?php endif; ?>
    </div>

    <!-- ── LEIDING TAB ── -->
    <div id="pane-leiding" class="tab-pane">
      <p style="font-size:.85rem;color:var(--muted);margin-bottom:18px;line-height:1.5;">
        Leiding en groepsleiding loggen in met hun persoonlijk
        <strong>Scouts &amp; Gidsen Vlaanderen</strong>-account. Je rol en takken
        worden automatisch herkend.</p>

      <?php if (sgo_dev_mode()): ?>
        <div style="display:flex;flex-direction:column;gap:9px;">
          <a href="ouderportaal.php?demologin=leiding"
             style="display:block;text-align:center;padding:12px;background:var(--green);
                    border-radius:11px;font-size:.9rem;font-weight:700;color:#fff;text-decoration:none;">
             Demo — Leiding (welpen)</a>
          <a href="ouderportaal.php?demologin=groepsleiding"
             style="display:block;text-align:center;padding:12px;background:var(--green-mid);
                    border-radius:11px;font-size:.9rem;font-weight:700;color:#fff;text-decoration:none;">
             Demo — Groepsleiding</a>
        </div>
        <p style="font-size:.72rem;color:var(--muted);margin-top:12px;text-align:center;">
            Echte S&amp;G-login actief zodra de API-key geconfigureerd is.</p>
      <?php else: ?>
        <a href="<?php echo htmlspecialchars(sgo_login_url()); ?>" class="btn-login" style="text-decoration:none;text-align:center;">
            <i class="fa-solid fa-right-to-bracket"></i> Inloggen via Scouts &amp; Gidsen</a>
      <?php endif; ?>
    </div>
  </div>

  <a href="index.php" class="back-link">
    <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
    Terug naar de website
  </a>

  <script>
    function switchTab(tab, btn) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('pane-' + tab).classList.add('active');
    }
  </script>
</body>
</html>
<?php
exit;
endif;

/* ── Ingelogd: gebruik normale header/footer ── */
$page_title = match($portal_role) { 'leiding'=>'Leiding Portaal','groepsleiding'=>'Groepsleiding Portaal',default=>'Ouderportaal' };
require_once __DIR__ . '/includes/header.php';
?>

<section class="section" style="padding-top:80px;padding-bottom:100px;min-height:70vh;">
  <div class="portaal-wrap">

  <?php if ($flash): ?>
  <div style="margin:0 0 24px;padding:13px 18px;border-radius:12px;font-weight:600;font-size:0.9rem;
      <?php echo $flash_type==='error'
        ? 'background:hsla(349,51%,47%,.1);border:1.5px solid var(--color-error);color:var(--color-error);'
        : 'background:hsla(145,33%,36%,.1);border:1.5px solid var(--color-success);color:var(--color-success);'; ?>">
      <?php echo htmlspecialchars($flash); ?>
  </div>
  <?php endif; ?>

  <?php if ($portal_role === 'ouder'): /* ══════════ OUDER ══════════ */ ?>

    <!-- Intro popup -->
    <div id="portaal-intro-overlay" style="display:none;position:fixed;inset:0;z-index:2000;
        background:rgba(15,30,20,.55);backdrop-filter:blur(4px);align-items:center;justify-content:center;padding:20px;">
      <div style="background:#fff;border-radius:20px;max-width:520px;width:100%;
          box-shadow:0 24px 60px rgba(26,61,42,.28);overflow:hidden;position:relative;">
        <div style="background:linear-gradient(120deg,#1A3D2A 0%,#2A5C3F 60%,#C9963A 160%);
            padding:32px 32px 24px;position:relative;overflow:hidden;">
          <span style="display:block;font-family:'Nunito',sans-serif;font-size:.7rem;font-weight:800;
              letter-spacing:.2em;text-transform:uppercase;color:rgba(226,197,141,.85);margin-bottom:8px;">Welkom bij het ouderportaal</span>
          <h2 style="color:#fff;font-size:1.55rem;margin:0 0 6px;font-family:'Nunito',sans-serif;font-weight:900;">
              Hallo, <?php echo htmlspecialchars($ouder_naam); ?>! 👋</h2>
          <p style="color:rgba(255,255,255,.82);font-size:.9rem;margin:0;line-height:1.5;">Hier beheer je alles voor jouw kinderen bij Scouts Kriko-M.</p>
          <span style="position:absolute;right:10px;bottom:-28px;font-size:7rem;opacity:.12;pointer-events:none;line-height:1;">⛺</span>
        </div>
        <div style="padding:26px 32px 28px;">
          <ul style="list-style:none;display:flex;flex-direction:column;gap:14px;margin-bottom:26px;">
            <li style="display:flex;align-items:flex-start;gap:13px;"><span style="font-size:1.3rem;flex-shrink:0;">🏕️</span>
                <span style="font-size:.92rem;line-height:1.5;"><strong>Schrijf je in</strong> voor weekends en kampen — en klik op een kamp voor extra info &amp; documenten.</span></li>
            <li style="display:flex;align-items:flex-start;gap:13px;"><span style="font-size:1.3rem;flex-shrink:0;">📄</span>
                <span style="font-size:.92rem;line-height:1.5;"><strong>Download de Kriko Echo's</strong> — de maandelijkse planningsbrieven van jouw tak.</span></li>
            <li style="display:flex;align-items:flex-start;gap:13px;"><span style="font-size:1.3rem;flex-shrink:0;">🛍️</span>
                <span style="font-size:.92rem;line-height:1.5;"><strong>Bestel uniform &amp; merchandise</strong> via de webshop rechtsboven.</span></li>
          </ul>
          <button id="portaal-intro-close" style="width:100%;padding:13px;background:#1A3D2A;color:#fff;border:none;
              border-radius:12px;font-family:'Outfit',sans-serif;font-size:.97rem;font-weight:700;cursor:pointer;">Begrepen, aan de slag! →</button>
          <p style="text-align:center;margin-top:12px;font-size:.78rem;color:#6A8A75;">Dit venster verschijnt niet opnieuw.</p>
        </div>
        <button onclick="closeIntro()" style="position:absolute;top:14px;right:16px;background:rgba(255,255,255,.18);
            border:none;color:#fff;width:30px;height:30px;border-radius:50%;font-size:1.1rem;cursor:pointer;
            display:flex;align-items:center;justify-content:center;">&times;</button>
      </div>
    </div>
    <script>
      function closeIntro(){document.getElementById('portaal-intro-overlay').style.display='none';localStorage.setItem('kriko_portaal_intro_seen','1');}
      document.getElementById('portaal-intro-close').addEventListener('click',closeIntro);
      document.getElementById('portaal-intro-overlay').addEventListener('click',function(e){if(e.target===this)closeIntro();});
      if(!localStorage.getItem('kriko_portaal_intro_seen'))document.getElementById('portaal-intro-overlay').style.display='flex';
    </script>

    <?php if (empty($kinderen)): ?>
      <div class="portaal-empty" style="padding:40px 24px;text-align:center;">
        <div style="font-size:2.4rem;margin-bottom:10px;">🧐</div>
        We vonden geen lid gekoppeld aan jouw account.<br>
        Klopt dit niet? Neem contact op met de <a href="contact.php" style="color:var(--color-accent);">groepsleiding</a>.
      </div>
    <?php else:
      $meerdere_kinderen = count($kinderen) > 1;
      /* Eén kind: toon direct zonder selector.
         Meerdere kinderen (ouder met 2+ leden via contactpersoon): toon chip-selector. */
    ?>
    <div class="portaal-grid" style="grid-template-columns:<?php echo $meerdere_kinderen ? '200px minmax(0,1fr) 320px' : 'minmax(0,1fr) 320px'; ?>">

      <?php if ($meerdere_kinderen): ?>
      <!-- Chip-selector (enkel bij meerdere kinderen) -->
      <aside class="portaal-leden">
        <div class="portaal-leden-title">Kinderen</div>
        <div class="kind-chips" role="tablist">
          <?php foreach ($kinderen as $i => $kind):
            $c_id = $kind['ga_id'] ?? $kind['id'] ?? '';
            $c_tak= strtolower($kind['tak'] ?? '');
            $c_kl = $tak_kleur[$c_tak] ?? 'var(--color-accent)'; ?>
          <button class="kind-chip <?php echo $i===0?'active':''; ?>"
              data-kind="<?php echo htmlspecialchars($c_id); ?>"
              style="--kleur:<?php echo $c_kl; ?>">
            <span class="kind-chip-avatar"><?php echo strtoupper(substr($kind['voornaam']??'?',0,1)); ?></span>
            <span class="kind-chip-info">
              <span class="kind-chip-naam"><?php echo htmlspecialchars($kind['voornaam']??''); ?></span>
              <span class="kind-chip-tak"><?php echo htmlspecialchars($c_tak?:'tak'); ?></span>
            </span>
          </button>
          <?php endforeach; ?>
          <?php if ($ouder_ingelogd): ?>
          <a href="ouderportaal.php?actie=addkid"
             style="display:flex;align-items:center;gap:10px;padding:8px 14px 8px 8px;margin-top:6px;
                    background:none;border:1.5px dashed var(--color-accent);border-radius:14px;
                    cursor:pointer;text-decoration:none;transition:background .15s;"
             title="Kind toevoegen via S&G">
            <span style="width:42px;height:42px;border-radius:50%;background:color-mix(in srgb,var(--color-accent) 15%,transparent);
                         color:var(--color-accent);display:flex;align-items:center;justify-content:center;
                         font-size:1.2rem;font-weight:700;flex-shrink:0;">+</span>
            <span style="display:flex;flex-direction:column;line-height:1.2;">
              <span style="font-weight:700;font-size:.9rem;color:var(--color-accent);">Kind toevoegen</span>
              <span style="font-size:.72rem;color:var(--color-text-muted);">via S&amp;G-account</span>
            </span>
          </a>
          <?php endif; ?>
        </div>
      </aside>
      <?php endif; ?>

      <!-- Inhoud per kind -->
      <div class="portaal-main">
      <?php foreach ($kinderen as $i => $kind):
        $ga_id= $kind['ga_id'] ?? $kind['id'] ?? '';
        $tak  = strtolower($kind['tak'] ?? '');
        $naam = trim(($kind['voornaam']??'').' '.($kind['achternaam']??''));
        $kleur= $tak_kleur[$tak] ?? 'var(--color-accent)';
        $open_kampen     = open_kampen_voor_tak($tak);
        $ingeschreven_ids= kampen_voor_kind($ga_id);
        $kampen_in  = array_filter($open_kampen, fn($k)=>in_array($k['id'],$ingeschreven_ids,true));
        $kampen_uit = array_filter($open_kampen, fn($k)=>!in_array($k['id'],$ingeschreven_ids,true));
        $mijn_echos = $echos_by_tak[$tak] ?? []; ?>
      <div class="<?php echo $meerdere_kinderen ? 'kind-panel '.($i===0?'active':'') : ''; ?>"
           <?php if ($meerdere_kinderen): ?>data-kind="<?php echo htmlspecialchars($ga_id); ?>"<?php endif; ?>
           style="--kleur:<?php echo $kleur; ?>">
        <div class="portaal-card">
          <div class="portaal-lid-head">
            <div class="portaal-lid-avatar"><?php echo strtoupper(substr($kind['voornaam']??'?',0,1)); ?></div>
            <div style="flex:1;">
              <div class="portaal-lid-naam"><?php echo htmlspecialchars($naam); ?></div>
              <div class="portaal-lid-meta"><?php echo htmlspecialchars($tak?:'onbekend'); ?></div>
            </div>
            <?php if ($ouder_ingelogd): ?>
            <form method="post" style="flex-shrink:0;">
              <input type="hidden" name="actie" value="ontkoppel_kind">
              <input type="hidden" name="ga_id" value="<?php echo htmlspecialchars($ga_id); ?>">
              <?php $voornaam_confirm = htmlspecialchars($kind['voornaam'] ?? 'Dit kind', ENT_QUOTES); ?>
              <button type="submit" title="Kind ontkoppelen van account"
                  style="background:none;border:1.5px solid var(--color-border);color:var(--color-text-muted);
                         padding:4px 9px;border-radius:8px;font-size:.75rem;cursor:pointer;"
                  onclick="return confirm('<?php echo $voornaam_confirm; ?> ontkoppelen van jouw account?');">
                  <i class="fa-solid fa-link-slash"></i></button>
            </form>
            <?php endif; ?>
          </div>

          <!-- Ingeschreven kampen -->
          <div class="portaal-subhead">🏕️ Ingeschreven kampen</div>
          <?php if (empty($kampen_in)): ?>
            <div class="portaal-empty">Nog niet ingeschreven voor een kamp.</div>
          <?php else: foreach ($kampen_in as $kamp):
            $periode  = date('j/n',strtotime($kamp['datum_van'])).' – '.date('j/n/Y',strtotime($kamp['datum_tot']));
            $bestanden= $kamp['bestanden'] ?? [];
            $ins_rec  = get_inschrijving($ga_id,$kamp['id']); ?>
          <div class="portaal-kamp is-in">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
              <div>
                <div class="portaal-kamp-naam"><?php echo htmlspecialchars($kamp['naam']); ?> <span style="color:var(--color-success);font-size:.78rem;">✓ ingeschreven</span></div>
                <div class="portaal-kamp-meta">📅 <?php echo $periode; ?> &middot; 📍 <?php echo htmlspecialchars($kamp['locatie']??''); ?></div>
              </div>
              <form method="post" style="flex-shrink:0;">
                <input type="hidden" name="actie" value="uitschrijven">
                <input type="hidden" name="ga_id" value="<?php echo htmlspecialchars($ga_id); ?>">
                <input type="hidden" name="kamp_id" value="<?php echo htmlspecialchars($kamp['id']); ?>">
                <button type="submit" style="background:none;border:1.5px solid var(--color-error);color:var(--color-error);
                    padding:4px 10px;border-radius:8px;font-size:.78rem;cursor:pointer;"
                    onclick="return confirm('Inschrijving annuleren?');">Uitschrijven</button>
              </form>
            </div>
            <?php if ($ins_rec && !empty($ins_rec['opmerking'])): ?>
              <div style="font-size:.8rem;color:var(--color-text-muted);margin-top:6px;">
                  💬 Jouw opmerking: <em><?php echo htmlspecialchars($ins_rec['opmerking']); ?></em></div>
            <?php endif; ?>
            <?php if (!empty($bestanden) || !empty($kamp['paklijst'])): ?>
            <details style="margin-top:12px;">
              <summary style="cursor:pointer;font-weight:700;color:var(--color-primary);font-size:.88rem;
                  padding:8px 0;list-style:none;display:flex;align-items:center;gap:8px;">
                  <i class="fa-solid fa-chevron-right" style="font-size:.7rem;transition:transform .2s;"></i>
                  Documenten &amp; paklijst bekijken</summary>
              <?php if (!empty($bestanden)): ?>
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0;">
                <?php foreach ($bestanden as $b):
                  $bl = $bestand_labels[$b['type']??''] ?? '📎 Bijlage'; ?>
                <a href="uploads/kamp-bestanden/<?php echo urlencode($b['file_name']??''); ?>"
                   target="_blank" rel="noopener"
                   style="display:inline-flex;align-items:center;gap:7px;padding:8px 14px;
                       background:var(--color-bg-linen);border:1px solid var(--color-border);
                       border-radius:10px;font-size:.85rem;font-weight:600;color:var(--color-primary);
                       text-decoration:none;transition:background .15s;">
                    <?php echo $bl; ?> — <?php echo htmlspecialchars($b['naam']??''); ?></a>
                <?php endforeach; ?>
              </div>
              <?php endif; ?>
              <?php if (!empty($kamp['paklijst'])): ?>
              <form class="paklijst-form" data-key="paklijst_<?php echo htmlspecialchars($kamp['id'].'_'.$ga_id); ?>">
                <?php $pi=0; foreach ($kamp['paklijst'] as $cat): ?>
                <div class="paklijst-section" style="margin-bottom:10px;">
                  <div class="paklijst-section-title"><i class="fa-solid fa-list-check" style="color:var(--color-accent);"></i> <?php echo htmlspecialchars($cat['categorie']); ?></div>
                  <?php foreach ($cat['items']??[] as $item): $pi++; $cid='pk_'.$kamp['id'].'_'.$ga_id.'_'.$pi; ?>
                  <div class="paklijst-item"><input type="checkbox" id="<?php echo $cid; ?>"><label for="<?php echo $cid; ?>"><?php echo htmlspecialchars($item); ?></label></div>
                  <?php endforeach; ?>
                </div>
                <?php endforeach; ?>
              </form>
              <?php endif; ?>
            </details>
            <?php endif; ?>
          </div>
          <?php endforeach; endif; ?>

          <!-- Schrijf in voor kamp -->
          <div class="portaal-subhead">➕ Schrijf in voor een kamp</div>
          <?php if (empty($kampen_uit)): ?>
            <div class="portaal-empty">Geen open kampen op dit moment voor deze tak.</div>
          <?php else: foreach ($kampen_uit as $kamp):
            $periode = date('j/n',strtotime($kamp['datum_van'])).' – '.date('j/n/Y',strtotime($kamp['datum_tot'])); ?>
          <div class="portaal-kamp">
            <div class="portaal-kamp-naam"><?php echo htmlspecialchars($kamp['naam']); ?></div>
            <div class="portaal-kamp-meta">📅 <?php echo $periode; ?> &middot; 📍 <?php echo htmlspecialchars($kamp['locatie']??''); ?></div>
            <?php if (!empty($kamp['beschrijving'])): ?>
              <div class="portaal-kamp-desc"><?php echo htmlspecialchars($kamp['beschrijving']); ?></div>
            <?php endif; ?>
            <form method="post" style="margin-top:12px;display:flex;flex-direction:column;gap:9px;">
              <input type="hidden" name="actie" value="inschrijven">
              <input type="hidden" name="ga_id" value="<?php echo htmlspecialchars($ga_id); ?>">
              <input type="hidden" name="kamp_id" value="<?php echo htmlspecialchars($kamp['id']); ?>">
              <textarea name="opmerking" rows="2" class="form-control" style="font-size:.88rem;"
                  placeholder="Vrije opmerking voor de leiding (optioneel). Medische info niet nodig — die staat bij S&G."></textarea>
              <button type="submit" class="btn btn-secondary" style="align-self:flex-start;padding:8px 18px;font-size:.88rem;">
                  <i class="fa-solid fa-check"></i> Inschrijven</button>
            </form>
          </div>
          <?php endforeach; endif; ?>

          <!-- Kriko Echo's -->
          <div class="portaal-subhead">📰 Kriko Echo's</div>
          <?php if (empty($mijn_echos)): ?>
            <div class="portaal-empty">Geen Kriko Echo beschikbaar voor deze tak.</div>
          <?php else: ?>
          <div class="portaal-echo-grid">
            <?php foreach ($mijn_echos as $echo):
              $label = ($months_nl[(int)($echo['month']??0)]??'').' '.($echo['year']??''); ?>
            <a class="portaal-echo-btn" href="uploads/echos/<?php echo urlencode($echo['file_name']??''); ?>" target="_blank" rel="noopener">
              <span><i class="fa-solid fa-file-pdf"></i> <span class="portaal-echo-maand"><?php echo htmlspecialchars(trim($label)); ?></span></span>
              <span class="portaal-echo-open">Openen <i class="fa-solid fa-arrow-up-right-from-square"></i></span>
            </a>
            <?php endforeach; ?>
          </div>
          <?php endif; ?>

        </div><!-- /.portaal-card -->
      </div><!-- /.kind-panel / direct -->
      <?php endforeach; ?>

      <?php if ($ouder_ingelogd && !$meerdere_kinderen): ?>
      <!-- Voeg kind toe (enkel getoond als er maar 1 kind is — anders staat het in de chip-kolom links) -->
      <a href="ouderportaal.php?actie=addkid"
         style="display:flex;align-items:center;gap:12px;margin-top:14px;padding:13px 18px;
                background:none;border:1.5px dashed var(--color-accent);border-radius:14px;
                text-decoration:none;transition:background .15s;">
        <span style="width:42px;height:42px;border-radius:50%;background:color-mix(in srgb,var(--color-accent) 15%,transparent);
                     color:var(--color-accent);display:flex;align-items:center;justify-content:center;
                     font-size:1.2rem;font-weight:700;flex-shrink:0;">+</span>
        <span>
          <span style="display:block;font-weight:700;font-size:.9rem;color:var(--color-accent);">Kind toevoegen</span>
          <span style="font-size:.78rem;color:var(--color-text-muted);">Log in met het S&amp;G-account van je kind</span>
        </span>
      </a>
      <?php endif; ?>

      <?php if ($ouder_ingelogd): ?>
      <div style="margin-top:10px;text-align:right;">
        <form method="post" style="display:inline;">
          <input type="hidden" name="actie" value="verwijder_account">
          <button type="submit" style="background:none;border:none;font-size:.78rem;color:var(--color-text-muted);
              cursor:pointer;text-decoration:underline;"
              onclick="return confirm('Account en alle gekoppelde kinderen verwijderen?');">
              Account verwijderen</button>
        </form>
      </div>
      <?php endif; ?>

      </div><!-- /.portaal-main -->

      <!-- Webshop + bestellingen -->
      <aside class="portaal-side">
        <div class="portaal-shop-card">
          <div class="portaal-shop-head">🛍️ Webshop</div>
          <p>Bestel kledij, uniformstukken en accessoires van Kriko-M.</p>
          <a href="shop.php" class="portaal-shop-btn"><i class="fa-solid fa-bag-shopping"></i> Naar de webshop</a>
          <div class="portaal-shop-divider"></div>
          <div class="portaal-shop-subtitle">Mijn bestellingen</div>
          <?php if (empty($my_orders)): ?>
            <p style="font-size:.82rem;color:var(--color-text-muted);margin:0;">Nog geen bestellingen geplaatst.</p>
          <?php else: foreach ($my_orders as $ord):
            $st = $ord['status'] ?? 'pending';
            [$st_label,$st_kleur] = $status_labels[$st] ?? [ucfirst($st),'#888'];
            $is_done = in_array($st,$done_statuses);
            $items_txt = implode(', ',array_map(fn($it)=>($it['quantity']??1).'× '.($it['name']??''),$ord['items']??[])); ?>
          <div class="portaal-order" style="<?php echo $is_done?'opacity:.5;':''; ?>">
            <div class="portaal-order-naam"><?php echo htmlspecialchars($items_txt?:'Bestelling'); ?></div>
            <div class="portaal-order-meta">
                <?php echo date('j/n/Y',strtotime($ord['date']??'now')); ?>
                &middot; €<?php echo number_format((float)($ord['total']??0),2,',','.'); ?>
            </div>
            <span class="portaal-order-status" style="background:<?php echo $st_kleur; ?>;"><?php echo htmlspecialchars($st_label); ?></span>
            <?php if ($st==='pending'): ?>
            <a href="ouderportaal.php?action=confirm_order_payment&order_id=<?php echo urlencode($ord['id']); ?>"
               class="btn btn-outline" style="display:block;margin-top:9px;padding:6px 12px;font-size:.78rem;text-align:center;"
               onclick="return confirm('Bevestig dat je het bedrag hebt overgeschreven.');">
               <i class="fa-solid fa-check"></i> Ik heb betaald</a>
            <?php endif; ?>
          </div>
          <?php endforeach; endif; ?>
        </div>
      </aside>
    </div><!-- /.portaal-grid -->
    <?php endif; /* /kinderen */ ?>

  <?php else: /* ══════════ LEIDING / GROEPSLEIDING ══════════ */ ?>

    <div class="portaal-grid">
      <!-- Kolom 1: tak-selector -->
      <aside class="portaal-leden">
        <div class="portaal-leden-title">Tak</div>
        <div class="kind-chips" role="tablist">
          <?php foreach ($leiding_takken as $i => $tak):
            $kl = $tak_kleur[$tak] ?? 'var(--color-accent)';
            $tak_namen = ['kapoenen'=>'Kapoenen','welpen'=>'Welpen','jonggivers'=>'Jonggivers','givers'=>'Givers']; ?>
          <button class="kind-chip <?php echo $i===0?'active':''; ?>" data-kind="tak-<?php echo htmlspecialchars($tak); ?>" style="--kleur:<?php echo $kl; ?>">
            <span class="kind-chip-avatar" style="font-size:.75rem;"><?php echo strtoupper(substr($tak,0,1)); ?></span>
            <span class="kind-chip-info">
              <span class="kind-chip-naam"><?php echo htmlspecialchars($tak_namen[$tak]??ucfirst($tak)); ?></span>
              <span class="kind-chip-tak">tak</span>
            </span>
          </button>
          <?php endforeach; ?>
        </div>
      </aside>

      <!-- Kolom 2: tak-inhoud -->
      <div class="portaal-main">
      <?php foreach ($leiding_takken as $i => $tak):
        $kl = $tak_kleur[$tak] ?? 'var(--color-accent)';
        $tak_kampen = kampen_voor_tak_leiding($tak);
        $tak_echos  = $echos_by_tak[$tak] ?? [];
        usort($tak_kampen, fn($a,$b) => strcmp($a['datum_van']??'', $b['datum_van']??'')); ?>
      <div class="kind-panel <?php echo $i===0?'active':''; ?>" data-kind="tak-<?php echo htmlspecialchars($tak); ?>" style="--kleur:<?php echo $kl; ?>">
        <div class="portaal-card">
          <div class="portaal-lid-head">
            <div class="portaal-lid-avatar" style="border-radius:12px;"><?php echo strtoupper(substr($tak,0,1)); ?></div>
            <div>
              <div class="portaal-lid-naam"><?php echo htmlspecialchars(['kapoenen'=>'Kapoenen','welpen'=>'Welpen','jonggivers'=>'Jonggivers','givers'=>'Givers'][$tak]??ucfirst($tak)); ?></div>
              <div class="portaal-lid-meta"><?php echo count($tak_kampen); ?> kamp(en) &middot; <?php echo count($tak_echos); ?> echo('s)</div>
            </div>
          </div>

          <!-- ─── KAMPEN BEHEER ─── -->
          <div class="portaal-subhead">🏕️ Kampen &amp; Weekenden</div>

          <?php foreach ($tak_kampen as $kamp):
            $periode  = date('j/n',strtotime($kamp['datum_van'])).' – '.date('j/n/Y',strtotime($kamp['datum_tot']));
            $ins_count= count(inschrijvingen_voor_kamp($kamp['id']));
            $bestanden= $kamp['bestanden'] ?? []; ?>
          <div class="portaal-kamp" style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
              <div>
                <div class="portaal-kamp-naam"><?php echo htmlspecialchars($kamp['naam']); ?>
                  <?php if ($kamp['open_voor_inschrijving']): ?><span style="background:hsla(145,33%,36%,.1);color:var(--color-success);font-size:.72rem;font-weight:700;padding:2px 8px;border-radius:20px;margin-left:6px;">open</span><?php else: ?><span style="background:hsla(0,0%,60%,.1);color:#888;font-size:.72rem;font-weight:700;padding:2px 8px;border-radius:20px;margin-left:6px;">gesloten</span><?php endif; ?>
                </div>
                <div class="portaal-kamp-meta">📅 <?php echo $periode; ?> &middot; 📍 <?php echo htmlspecialchars($kamp['locatie']??''); ?> &middot; 👤 <?php echo $ins_count; ?> inschrijvingen</div>
              </div>
              <div style="display:flex;gap:6px;flex-shrink:0;">
                <a href="leiding-export.php?kamp=<?php echo urlencode($kamp['id']); ?>" target="_blank"
                   style="display:inline-flex;align-items:center;gap:5px;padding:5px 11px;background:var(--color-primary);color:#fff;border-radius:8px;font-size:.78rem;font-weight:700;text-decoration:none;">
                   <i class="fa-solid fa-file-csv"></i> CSV</a>
                <form method="post" style="display:inline;">
                  <input type="hidden" name="actie" value="verwijder_kamp">
                  <input type="hidden" name="kamp_id" value="<?php echo htmlspecialchars($kamp['id']); ?>">
                  <button type="submit" style="background:none;border:1.5px solid var(--color-error);color:var(--color-error);padding:5px 10px;border-radius:8px;font-size:.78rem;cursor:pointer;"
                      onclick="return confirm('Kamp en alle inschrijvingen verwijderen?');">✕</button>
                </form>
              </div>
            </div>

            <!-- Kamp bewerken -->
            <details style="margin-top:10px;">
              <summary style="cursor:pointer;font-size:.82rem;color:var(--color-primary);font-weight:700;
                  list-style:none;display:flex;align-items:center;gap:6px;padding:6px 0;">
                  <i class="fa-solid fa-pen"></i> Bewerken</summary>
              <form method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
                <input type="hidden" name="actie" value="wijzig_kamp">
                <input type="hidden" name="kamp_id" value="<?php echo htmlspecialchars($kamp['id']); ?>">
                <div><label class="form-label" style="font-size:.78rem;">Naam</label>
                  <input type="text" name="naam" value="<?php echo htmlspecialchars($kamp['naam']); ?>" class="form-control" style="font-size:.85rem;padding:7px 10px;"></div>
                <div><label class="form-label" style="font-size:.78rem;">Locatie</label>
                  <input type="text" name="locatie" value="<?php echo htmlspecialchars($kamp['locatie']??''); ?>" class="form-control" style="font-size:.85rem;padding:7px 10px;"></div>
                <div><label class="form-label" style="font-size:.78rem;">Van</label>
                  <input type="date" name="datum_van" value="<?php echo htmlspecialchars($kamp['datum_van']); ?>" class="form-control" style="font-size:.85rem;padding:7px 10px;"></div>
                <div><label class="form-label" style="font-size:.78rem;">Tot</label>
                  <input type="date" name="datum_tot" value="<?php echo htmlspecialchars($kamp['datum_tot']); ?>" class="form-control" style="font-size:.85rem;padding:7px 10px;"></div>
                <div style="grid-column:1/-1"><label class="form-label" style="font-size:.78rem;">Beschrijving</label>
                  <textarea name="beschrijving" rows="2" class="form-control" style="font-size:.85rem;padding:7px 10px;"><?php echo htmlspecialchars($kamp['beschrijving']??''); ?></textarea></div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <input type="checkbox" name="open_voor_inschrijving" id="ovi_<?php echo htmlspecialchars($kamp['id']); ?>" value="1"<?php echo $kamp['open_voor_inschrijving']?' checked':''; ?>>
                  <label for="ovi_<?php echo htmlspecialchars($kamp['id']); ?>" style="font-size:.82rem;">Open voor inschrijving</label>
                </div>
                <div style="text-align:right;">
                  <button type="submit" class="btn btn-secondary" style="padding:7px 16px;font-size:.85rem;">Opslaan</button></div>
              </form>
            </details>

            <!-- Bestanden -->
            <details style="margin-top:6px;">
              <summary style="cursor:pointer;font-size:.82rem;color:var(--color-primary);font-weight:700;
                  list-style:none;display:flex;align-items:center;gap:6px;padding:6px 0;">
                  <i class="fa-solid fa-paperclip"></i> Bestanden (<?php echo count($bestanden); ?>)</summary>
              <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px;">
                <?php foreach ($bestanden as $b):
                  $bl = $bestand_labels[$b['type']??''] ?? '📎'; ?>
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px;
                    background:var(--color-bg-linen);border-radius:9px;font-size:.83rem;">
                  <a href="uploads/kamp-bestanden/<?php echo urlencode($b['file_name']??''); ?>" target="_blank" rel="noopener"
                     style="color:var(--color-primary);font-weight:600;text-decoration:none;">
                     <?php echo $bl; ?> <?php echo htmlspecialchars($b['naam']??''); ?></a>
                  <form method="post" style="margin:0;">
                    <input type="hidden" name="actie" value="verwijder_bestand">
                    <input type="hidden" name="kamp_id" value="<?php echo htmlspecialchars($kamp['id']); ?>">
                    <input type="hidden" name="bestand_id" value="<?php echo htmlspecialchars($b['id']); ?>">
                    <button type="submit" style="background:none;border:none;color:var(--color-error);font-size:.85rem;cursor:pointer;">✕</button>
                  </form>
                </div>
                <?php endforeach; ?>
                <!-- Upload nieuw bestand -->
                <form method="post" enctype="multipart/form-data" style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end;margin-top:4px;">
                  <input type="hidden" name="actie" value="upload_bestand">
                  <input type="hidden" name="kamp_id" value="<?php echo htmlspecialchars($kamp['id']); ?>">
                  <div>
                    <label class="form-label" style="font-size:.75rem;">Type</label>
                    <select name="bestand_type" class="form-control" style="font-size:.82rem;padding:6px 9px;">
                      <?php foreach ($bestand_labels as $v=>$l): ?><option value="<?php echo $v; ?>"><?php echo $l; ?></option><?php endforeach; ?>
                    </select>
                  </div>
                  <div>
                    <label class="form-label" style="font-size:.75rem;">Bestandsnaam</label>
                    <input type="text" name="bestand_naam" class="form-control" placeholder="bv. Uitnodiging zomerkamp" style="font-size:.82rem;padding:6px 9px;">
                  </div>
                  <div>
                    <input type="file" name="bestand" accept=".pdf,.jpg,.jpeg,.png,.docx" required style="font-size:.78rem;">
                    <button type="submit" class="btn btn-secondary" style="padding:6px 12px;font-size:.8rem;margin-top:6px;width:100%;">Uploaden</button>
                  </div>
                </form>
              </div>
            </details>
          </div>
          <?php endforeach; ?>

          <!-- Nieuw kamp aanmaken -->
          <details style="margin-top:6px;">
            <summary style="cursor:pointer;font-size:.9rem;color:var(--color-primary);font-weight:700;
                list-style:none;display:flex;align-items:center;gap:8px;padding:10px 14px;
                background:color-mix(in srgb,var(--color-primary) 6%,transparent);border-radius:10px;">
                <i class="fa-solid fa-plus"></i> Nieuw kamp aanmaken</summary>
            <form method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;padding:14px;background:var(--color-bg-linen);border-radius:10px;">
              <input type="hidden" name="actie" value="maak_kamp">
              <input type="hidden" name="tak" value="<?php echo htmlspecialchars($tak); ?>">
              <div style="grid-column:1/-1"><label class="form-label" style="font-size:.78rem;">Naam *</label>
                <input type="text" name="naam" required class="form-control" style="font-size:.88rem;padding:8px 11px;" placeholder="bv. Zomerkamp 2026"></div>
              <div><label class="form-label" style="font-size:.78rem;">Van *</label>
                <input type="date" name="datum_van" required class="form-control" style="font-size:.88rem;padding:8px 11px;"></div>
              <div><label class="form-label" style="font-size:.78rem;">Tot *</label>
                <input type="date" name="datum_tot" required class="form-control" style="font-size:.88rem;padding:8px 11px;"></div>
              <div style="grid-column:1/-1"><label class="form-label" style="font-size:.78rem;">Locatie</label>
                <input type="text" name="locatie" class="form-control" style="font-size:.88rem;padding:8px 11px;" placeholder="bv. Domein De Ster, Sint-Niklaas"></div>
              <div style="grid-column:1/-1"><label class="form-label" style="font-size:.78rem;">Beschrijving</label>
                <textarea name="beschrijving" rows="2" class="form-control" style="font-size:.88rem;padding:8px 11px;"></textarea></div>
              <div style="grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
                <label style="display:flex;align-items:center;gap:8px;font-size:.85rem;">
                  <input type="checkbox" name="open_voor_inschrijving" value="1"> Open voor inschrijving</label>
                <button type="submit" class="btn btn-secondary" style="padding:9px 20px;font-size:.88rem;">Aanmaken</button>
              </div>
            </form>
          </details>

          <!-- ─── KRIKO ECHO'S ─── -->
          <div class="portaal-subhead" style="margin-top:28px;">📰 Kriko Echo's</div>
          <?php if (!empty($tak_echos)): ?>
          <div class="portaal-echo-grid" style="margin-bottom:14px;">
            <?php foreach ($tak_echos as $echo):
              $label = ($months_nl[(int)($echo['month']??0)]??'').' '.($echo['year']??''); ?>
            <a class="portaal-echo-btn" href="uploads/echos/<?php echo urlencode($echo['file_name']??''); ?>" target="_blank" rel="noopener">
              <span><i class="fa-solid fa-file-pdf"></i> <span class="portaal-echo-maand"><?php echo htmlspecialchars(trim($label)); ?></span></span>
              <span class="portaal-echo-open">Openen <i class="fa-solid fa-arrow-up-right-from-square"></i></span>
            </a>
            <?php endforeach; ?>
          </div>
          <?php endif; ?>
          <!-- Upload echo -->
          <form method="post" enctype="multipart/form-data" style="display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end;padding:14px;background:var(--color-bg-linen);border-radius:10px;">
            <input type="hidden" name="actie" value="upload_echo">
            <input type="hidden" name="echo_tak" value="<?php echo htmlspecialchars($tak); ?>">
            <div><label class="form-label" style="font-size:.78rem;">Maand</label>
              <select name="echo_month" class="form-control" style="font-size:.85rem;padding:7px 10px;">
                <?php for($m=1;$m<=12;$m++): ?><option value="<?php echo $m; ?>"<?php echo $m==date('n')?' selected':''; ?>><?php echo $months_nl[$m]; ?></option><?php endfor; ?>
              </select></div>
            <div><label class="form-label" style="font-size:.78rem;">Jaar</label>
              <input type="number" name="echo_year" value="<?php echo date('Y'); ?>" class="form-control" style="font-size:.85rem;padding:7px 10px;" min="2020" max="2035"></div>
            <div>
              <input type="file" name="echo_file" accept=".pdf" required style="font-size:.78rem;">
              <button type="submit" class="btn btn-secondary" style="padding:7px 14px;font-size:.82rem;margin-top:6px;width:100%;"><i class="fa-solid fa-upload"></i> Upload PDF</button>
            </div>
          </form>

          <?php if ($portal_role === 'groepsleiding'): ?>
          <!-- ─── KALENDER (enkel groepsleiding) ─── -->
          <div class="portaal-subhead" style="margin-top:28px;">📅 Kalender</div>
          <?php if (!empty($calendar_events)): ?>
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">
            <?php foreach ($calendar_events as $ev): ?>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;
                background:var(--color-bg-linen);border-radius:10px;font-size:.88rem;">
              <div>
                <div style="font-weight:700;color:var(--color-primary);"><?php echo htmlspecialchars($ev['title']??''); ?></div>
                <div style="font-size:.78rem;color:var(--color-text-muted);">
                  📅 <?php echo date('j/n/Y',strtotime($ev['date']??'now')); ?>
                  <?php if($ev['time']??''): ?> · <?php echo htmlspecialchars($ev['time']); ?><?php endif; ?>
                  <?php if($ev['location']??''): ?> · 📍 <?php echo htmlspecialchars($ev['location']); ?><?php endif; ?>
                </div>
              </div>
              <form method="post" style="flex-shrink:0;">
                <input type="hidden" name="actie" value="verwijder_event">
                <input type="hidden" name="event_id" value="<?php echo htmlspecialchars($ev['id']??''); ?>">
                <button type="submit" style="background:none;border:1.5px solid var(--color-error);color:var(--color-error);padding:4px 9px;border-radius:7px;font-size:.75rem;cursor:pointer;"
                    onclick="return confirm('Evenement verwijderen?');">✕</button>
              </form>
            </div>
            <?php endforeach; ?>
          </div>
          <?php endif; ?>
          <!-- Nieuw evenement -->
          <form method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px;background:var(--color-bg-linen);border-radius:10px;">
            <input type="hidden" name="actie" value="maak_event">
            <div style="grid-column:1/-1"><label class="form-label" style="font-size:.78rem;">Titel *</label>
              <input type="text" name="title" required class="form-control" style="font-size:.85rem;padding:7px 10px;" placeholder="bv. Groepsdag"></div>
            <div><label class="form-label" style="font-size:.78rem;">Datum *</label>
              <input type="date" name="date" required class="form-control" style="font-size:.85rem;padding:7px 10px;"></div>
            <div><label class="form-label" style="font-size:.78rem;">Tijdstip</label>
              <input type="text" name="time" class="form-control" style="font-size:.85rem;padding:7px 10px;" placeholder="bv. 14:00 – 17:00"></div>
            <div><label class="form-label" style="font-size:.78rem;">Locatie</label>
              <input type="text" name="location" class="form-control" style="font-size:.85rem;padding:7px 10px;"></div>
            <div><label class="form-label" style="font-size:.78rem;">Beschrijving</label>
              <input type="text" name="description" class="form-control" style="font-size:.85rem;padding:7px 10px;"></div>
            <div style="display:flex;align-items:flex-end;">
              <button type="submit" class="btn btn-secondary" style="padding:9px 18px;font-size:.85rem;width:100%;">Evenement aanmaken</button>
            </div>
          </form>
          <?php endif; /* /groepsleiding kalender */ ?>

        </div><!-- /.portaal-card -->
      </div><!-- /.kind-panel -->
      <?php endforeach; /* /leiding_takken */ ?>
      </div><!-- /.portaal-main -->

      <!-- Kolom 3: rechterkolom leiding -->
      <aside class="portaal-side">
        <div class="portaal-shop-card">
          <div class="portaal-shop-head">⚡ Snelle acties</div>
          <p>Exporteer de ledenlijst voor een kamp als CSV-bestand met medische gegevens.</p>
          <?php
          $alle_mijn_kampen = [];
          foreach ($leiding_takken as $lt) {
              foreach (kampen_voor_tak_leiding($lt) as $k) $alle_mijn_kampen[] = $k;
          }
          usort($alle_mijn_kampen, fn($a,$b)=>strcmp($a['datum_van']??'',$b['datum_van']??'')); ?>
          <?php if (empty($alle_mijn_kampen)): ?>
            <p style="font-size:.82rem;color:var(--color-text-muted);">Nog geen kampen aangemaakt.</p>
          <?php else: ?>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">
            <?php foreach ($alle_mijn_kampen as $k): ?>
            <a href="leiding-export.php?kamp=<?php echo urlencode($k['id']); ?>" target="_blank"
               style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;
                   background:var(--color-bg-linen);border:1px solid var(--color-border);border-radius:10px;
                   font-size:.82rem;font-weight:600;color:var(--color-primary);text-decoration:none;">
              <span><?php echo htmlspecialchars($k['naam']); ?></span>
              <span style="color:var(--color-accent);font-size:.75rem;white-space:nowrap;"><i class="fa-solid fa-download"></i> CSV</span>
            </a>
            <?php endforeach; ?>
          </div>
          <?php endif; ?>
        </div>
      </aside>
    </div><!-- /.portaal-grid -->

  <?php endif; /* /role switch */ ?>
  </div><!-- /.portaal-wrap -->
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
