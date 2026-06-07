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
require_once __DIR__ . '/includes/csrf.php';

/* ── Demo-logins (enkel in dev-modus) ────────────────── */
if (sgo_dev_mode() && isset($_GET['demologin'])) {
    // Eerst alle bestaande auth-state wissen (voorkomt conflict ouder ↔ sgo)
    foreach (['ouder_logged_in','ouder_account_id','ouder_naam','ouder_email',
              'sgo_logged_in','sgo_access_token','sgo_id','sgo_name','sgo_email',
              'sgo_portal_role','sgo_leiding_takken'] as $k) unset($_SESSION[$k]);
    $dl = $_GET['demologin'];
    if ($dl === 'leiding') {
        $_SESSION['sgo_logged_in']      = true;
        $_SESSION['sgo_access_token']   = 'DEV-MOCK-TOKEN';
        $_SESSION['sgo_id']             = 'LEIDING-DEMO';
        $_SESSION['sgo_name']           = 'Vic Verhaegen';
        $_SESSION['sgo_email']          = 'vic.verhaegen@scouts.be';
        $_SESSION['sgo_portal_role']    = 'leiding';
        $_SESSION['sgo_leiding_takken'] = ['kapoenen','welpen','jonggivers','givers'];
    } elseif ($dl === 'groepsleiding') {
        $_SESSION['sgo_logged_in']      = true;
        $_SESSION['sgo_access_token']   = 'DEV-MOCK-TOKEN';
        $_SESSION['sgo_id']             = 'GL-DEMO';
        $_SESSION['sgo_name']           = 'Pieter Room';
        $_SESSION['sgo_email']          = 'pieter.room@scouts.be';
        $_SESSION['sgo_portal_role']    = 'groepsleiding';
        $_SESSION['sgo_leiding_takken'] = ['kapoenen','welpen','jonggivers','givers'];
    } elseif ($dl === 'webshop') {
        $_SESSION['sgo_logged_in']      = true;
        $_SESSION['sgo_access_token']   = 'DEV-MOCK-TOKEN';
        $_SESSION['sgo_id']             = 'WEBSHOP-DEMO';
        $_SESSION['sgo_name']           = 'Emma Claes';
        $_SESSION['sgo_email']          = 'emma.claes@scouts.be';
        $_SESSION['sgo_portal_role']    = 'webshop';
        $_SESSION['sgo_leiding_takken'] = [];
    } elseif ($dl === 'website') {
        $_SESSION['sgo_logged_in']      = true;
        $_SESSION['sgo_access_token']   = 'DEV-MOCK-TOKEN';
        $_SESSION['sgo_id']             = 'WEBSITE-DEMO';
        $_SESSION['sgo_name']           = 'Lars Janssen';
        $_SESSION['sgo_email']          = 'lars.janssen@scouts.be';
        $_SESSION['sgo_portal_role']    = 'website';
        $_SESSION['sgo_leiding_takken'] = [];
    } else {
        $_SESSION['ouder_logged_in']  = true;
        $_SESSION['ouder_account_id'] = 'DEMO-OUDER';
        $_SESSION['ouder_naam']       = 'Demo Ouder';
        $_SESSION['ouder_email']      = 'demo@kriko-m.be';
        $_SESSION['ouder_kinderen']   = [
            ['ga_id'=>'GA-1001','voornaam'=>'Lotte', 'achternaam'=>'Peeters','tak'=>'kapoenen',  'geboortedatum'=>'2019-03-12'],
            ['ga_id'=>'GA-1002','voornaam'=>'Rune',  'achternaam'=>'Peeters','tak'=>'welpen',    'geboortedatum'=>'2016-05-20'],
            ['ga_id'=>'GA-1003','voornaam'=>'Milan', 'achternaam'=>'Peeters','tak'=>'jonggivers','geboortedatum'=>'2013-08-04'],
            ['ga_id'=>'GA-1004','voornaam'=>'Fien',  'achternaam'=>'Peeters','tak'=>'givers',    'geboortedatum'=>'2010-11-17'],
        ];
    }
    header('Location: ouderportaal.php'); exit;
}

/* ── Uitloggen ────────────────────────────────────────── */
if (isset($_GET['uitloggen'])) {
    $_SESSION = []; session_destroy();
    // ?uitgelogd=1 toont de bevestiging én wist het winkelmandje (mandje ↔ profiel).
    header('Location: ouderportaal.php?uitgelogd=1'); exit;
}

/* ── Auth detectie ────────────────────────────────────── */
$ouder_ingelogd = !empty($_SESSION['ouder_logged_in']);
$sgo_ingelogd   = !empty($_SESSION['sgo_logged_in']);
$ingelogd       = $ouder_ingelogd || $sgo_ingelogd;

if ($ouder_ingelogd) {
    $ouder_account = get_ouder_by_id($_SESSION['ouder_account_id'] ?? '');
    $ouder_naam    = $ouder_account['naam']  ?? ($_SESSION['ouder_naam'] ?? 'ouder');
    $ouder_email   = $ouder_account['email'] ?? ($_SESSION['ouder_email'] ?? '');
    $ouder_ref     = $_SESSION['ouder_account_id'] ?? '';
    $kinderen      = $ouder_account['kinderen'] ?? ($_SESSION['ouder_kinderen'] ?? []);
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
if (isset($_GET['login_vereist'])) {
    $login_error = $_GET['login_vereist'] === 'verslagen'
        ? 'Log in als leiding om de verslagen te bekijken.'
        : 'Log eerst in om de webshop te gebruiken.';
}
if (!empty($_SESSION['_flash'])) { $flash = $_SESSION['_flash']; $flash_type = $_SESSION['_flash_type'] ?? 'success'; unset($_SESSION['_flash'], $_SESSION['_flash_type']); }
if (isset($_GET['kind_toegevoegd'])) $flash = 'Kind succesvol gelinkt aan jouw account! 🎉';
if (isset($_GET['welkom']))          $flash = 'Account aangemaakt! Voeg hieronder je kind(eren) toe.';

/* ── Lokale ouder-login (POST voor HTML output) ────────── */
if (!$ingelogd && $_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['actie'] ?? '') === 'ouder_login') {
    if (!csrf_verify()) {
        $login_error = 'Beveiligingscontrole mislukt. Herlaad de pagina en probeer opnieuw.';
    } else {
        $account = verify_ouder_login($_POST['email'] ?? '', $_POST['password'] ?? '');
        if ($account) {
            ouder_session_set($account);
            header('Location: ouderportaal.php'); exit;
        }
        $login_error = 'Ongeldig e-mailadres of wachtwoord.';
    }
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
    // CSRF: weiger elke statuswijzigende actie zonder geldig sessie-token.
    if (!csrf_verify()) {
        $_SESSION['_flash']      = 'Beveiligingscontrole mislukt. Herlaad de pagina en probeer opnieuw.';
        $_SESSION['_flash_type'] = 'error';
        header('Location: ouderportaal.php'); exit;
    }
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
                if (isset($_FILES['kamp_foto']) && $_FILES['kamp_foto']['error'] === UPLOAD_ERR_OK) {
                    $fn = _upload_kamp_foto($_FILES['kamp_foto'], $nk['id']);
                    if ($fn) set_kamp_foto($nk['id'], $fn);
                }
                if (isset($_FILES['bestand']) && $_FILES['bestand']['error'] === UPLOAD_ERR_OK) {
                    $type = $_POST['bestand_type'] ?? 'overige';
                    $naam = trim($_POST['bestand_naam'] ?? '') ?: ($_FILES['bestand']['name'] ?? 'bestand');
                    $fn = _upload_kamp_bestand($_FILES['bestand'], $nk['id'], $type);
                    if ($fn) add_kamp_bestand($nk['id'], $type, $naam, $fn);
                }
                $flash = 'Kamp "' . htmlspecialchars($nk['naam']) . '" aangemaakt.';
            }
        } elseif ($actie === 'toggle_publiek' && $kamp && $mag) {
            update_kamp($kamp_id, ['open_voor_inschrijving' => empty($kamp['open_voor_inschrijving'])]);
            $flash = empty($kamp['open_voor_inschrijving']) ? 'Kamp gepubliceerd.' : 'Kamp op privé gezet.';
        } elseif ($actie === 'wijzig_kamp' && $kamp && $mag) {
            update_kamp($kamp_id, $_POST);
            $flash = 'Kamp bijgewerkt.';
        } elseif ($actie === 'verwijder_kamp' && $kamp && $mag) {
            delete_kamp($kamp_id);
            $flash = 'Kamp verwijderd.';
        } elseif ($actie === 'upload_foto' && $kamp && $mag && isset($_FILES['kamp_foto'])) {
            $fn = _upload_kamp_foto($_FILES['kamp_foto'], $kamp_id);
            if ($fn) { set_kamp_foto($kamp_id, $fn); $flash = 'Foto bijgewerkt.'; }
            else { $flash = 'Upload mislukt. Gebruik JPG, PNG of WEBP (max 10 MB).'; $flash_type = 'error'; }
        } elseif ($actie === 'upload_bestand' && $kamp && $mag && isset($_FILES['bestand'])) {
            $type = $_POST['bestand_type'] ?? 'overige';
            $naam = $_POST['bestand_naam'] ?? ($_FILES['bestand']['name'] ?? 'bestand');
            $fn   = _upload_kamp_bestand($_FILES['bestand'], $kamp_id, $type);
            if ($fn) { add_kamp_bestand($kamp_id, $type, $naam, $fn); $flash = 'Bestand geüpload.'; }
            else { $flash = 'Upload mislukt. Gebruik PDF, JPG, PNG of DOCX (max 10 MB).'; $flash_type = 'error'; }
        } elseif ($actie === 'verwijder_bestand' && $kamp && $mag) {
            delete_kamp_bestand($kamp_id, $_POST['bestand_id'] ?? '');
            $flash = 'Bestand verwijderd.';
        } elseif ($actie === 'verwijder_echo') {
            $eid    = $_POST['echo_id'] ?? '';
            $echos  = read_db('echos') ?: [];
            $target = array_values(array_filter($echos, fn($e) => ($e['id']??'') === $eid));
            if ($target && ($portal_role === 'groepsleiding' || in_array($target[0]['tak']??'', $leiding_takken))) {
                $fn = __DIR__ . '/uploads/echos/' . ($target[0]['file_name'] ?? '');
                if (file_exists($fn)) @unlink($fn);
                write_db('echos', array_values(array_filter($echos, fn($e) => ($e['id']??'') !== $eid)));
                $flash = 'Echo verwijderd.';
            }
        } elseif ($actie === 'vervang_echo') {
            $eid = $_POST['echo_id'] ?? '';
            $echos = read_db('echos') ?: [];
            foreach ($echos as $idx => $e) {
                if (($e['id']??'') !== $eid) continue;
                if ($portal_role !== 'groepsleiding' && !in_array($e['tak']??'', $leiding_takken)) break;
                if (isset($_FILES['echo_file']) && $_FILES['echo_file']['error'] === UPLOAD_ERR_OK
                    && strtolower(pathinfo($_FILES['echo_file']['name'], PATHINFO_EXTENSION)) === 'pdf') {
                    $old = __DIR__ . '/uploads/echos/' . ($e['file_name'] ?? '');
                    if (file_exists($old)) @unlink($old);
                    $fn = 'echo-' . ($e['year']??'') . '-' . ($e['month']??'') . '-' . ($e['tak']??'') . '-' . uniqid() . '.pdf';
                    $dir = __DIR__ . '/uploads/echos/';
                    if (!is_dir($dir)) mkdir($dir, 0755, true);
                    if (move_uploaded_file($_FILES['echo_file']['tmp_name'], $dir . $fn)) {
                        $echos[$idx]['file_name'] = $fn;
                        write_db('echos', $echos);
                        $flash = 'Echo vervangen.';
                    }
                }
                break;
            }
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

        /* ── Webshop-bestellingen ── */
        elseif ($actie === 'order_status') {
            $oid = $_POST['order_id'] ?? '';
            $new = $_POST['status'] ?? '';
            if (in_array($new, ['pending','waiting_approval','paid','completed','cancelled'])) {
                $orders = read_db('orders') ?: [];
                foreach ($orders as &$o) { if (($o['id'] ?? '') === $oid) { $o['status'] = $new; break; } }
                unset($o); write_db('orders', $orders);
                $flash = 'Bestelling bijgewerkt.';
            }
        } elseif ($actie === 'order_delete') {
            $oid = $_POST['order_id'] ?? '';
            write_db('orders', array_values(array_filter(read_db('orders') ?: [], fn($o) => ($o['id'] ?? '') !== $oid)));
            $flash = 'Bestelling verwijderd.';
        }

        /* ── Contactberichten ── */
        elseif ($actie === 'message_read') {
            $mid = $_POST['message_id'] ?? '';
            $msgs = read_db('messages') ?: [];
            foreach ($msgs as &$m) { if (($m['id'] ?? '') === $mid) { $m['read'] = true; break; } }
            unset($m); write_db('messages', $msgs);
            $flash = 'Bericht gemarkeerd als gelezen.';
        } elseif ($actie === 'message_delete') {
            $mid = $_POST['message_id'] ?? '';
            write_db('messages', array_values(array_filter(read_db('messages') ?: [], fn($m) => ($m['id'] ?? '') !== $mid)));
            $flash = 'Bericht verwijderd.';
        }

        /* ── Website-instellingen ── */
        elseif ($actie === 'save_settings') {
            $s = read_db('settings') ?: [];
            foreach (['scouts_year','bank_iban','bank_bic','bank_holder',
                      'contact_email','contact_phone','contact_address','alert_message'] as $f) {
                if (isset($_POST[$f])) $s[$f] = substr(trim($_POST[$f]), 0, 500);
            }
            $s['alert_active'] = !empty($_POST['alert_active']);
            write_db('settings', $s);
            $flash = 'Website-instellingen opgeslagen.';
        }
    }

    /* ── PRG: redirect after POST to prevent resubmission ── */
    if ($flash !== '') { $_SESSION['_flash'] = $flash; $_SESSION['_flash_type'] = $flash_type; }
    $redirect_tak  = $_POST['_active_tak']  ?? '';
    $redirect_kind = $_POST['_active_kind'] ?? '';
    $redirect_sectie = $_POST['sectie'] ?? '';
    $qs = array_filter(['sectie' => $redirect_sectie, 'tak' => $redirect_tak, 'kind' => $redirect_kind]);
    header('Location: ouderportaal.php' . ($qs ? ('?' . http_build_query($qs)) : '')); exit;
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

/* ── Groepsleiding beheer-data ── */
$gl_orders = $gl_messages = []; $gl_settings = [];
$gl_msg_unread = 0;
if ($portal_role === 'groepsleiding') {
    $gl_orders = read_db('orders') ?: [];
    usort($gl_orders, fn($a,$b) => strcmp($b['date']??'', $a['date']??''));
    $gl_messages = read_db('messages') ?: [];
    usort($gl_messages, fn($a,$b) => strcmp($b['date']??'', $a['date']??''));
    foreach ($gl_messages as $m) if (empty($m['read'])) $gl_msg_unread++;
    $gl_settings = read_db('settings') ?: [];
}

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
           min-height:100vh; padding:40px 20px; gap:20px; }
    .brand { display:flex; align-items:center; gap:14px; }
    .brand img { width:52px; height:52px; object-fit:contain; }
    .brand-text { font-family:'Nunito',sans-serif; font-weight:900; color:var(--green); line-height:1.1; }
    .brand-text span { display:block; font-size:1.5rem; letter-spacing:.06em; text-transform:uppercase; }
    .brand-text small { font-size:.78rem; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; }
    .card { width:100%; max-width:520px; background:#fff; border-radius:22px;
            box-shadow:0 16px 50px rgba(26,61,42,.13); border:1px solid var(--border); overflow:hidden; }
    .tabs { display:grid; grid-template-columns:1fr 1fr; border-bottom:2px solid var(--border); }
    .tab-btn { padding:18px 16px; background:none; border:none; font-family:'Outfit',sans-serif;
               font-size:1rem; font-weight:600; cursor:pointer; color:var(--muted);
               transition:color .15s,background .15s; }
    .tab-btn.active { color:var(--green); background:color-mix(in srgb,var(--green) 6%,transparent);
                      border-bottom:2px solid var(--green); margin-bottom:-2px; }
    .tab-pane { display:none; padding:36px 40px 40px; }
    .tab-pane.active { display:block; }
    .pane-title { font-family:'Nunito',sans-serif; font-size:1.35rem; font-weight:900; color:var(--green);
                  margin-bottom:6px; }
    .pane-sub { font-size:.88rem; color:var(--muted); margin-bottom:24px; line-height:1.55; }
    label { display:block; font-size:.82rem; font-weight:700; color:var(--green); margin-bottom:6px; margin-top:18px; }
    label:first-of-type { margin-top:0; }
    input[type=email],input[type=password] {
      width:100%; padding:13px 15px; border:2px solid var(--border); border-radius:var(--radius);
      font-family:inherit; font-size:.97rem; color:var(--text); background:#fff; outline:none;
      transition:border-color .15s,box-shadow .15s; }
    input:focus { border-color:var(--green-mid); box-shadow:0 0 0 4px rgba(42,92,63,.1); }
    .btn-login { display:block; width:100%; margin-top:22px; padding:15px;
                 background:var(--green); color:#fff; border:none; border-radius:var(--radius);
                 font-family:'Outfit',sans-serif; font-size:1.02rem; font-weight:700;
                 cursor:pointer; transition:background .15s; letter-spacing:.02em; }
    .btn-login:hover { background:var(--green-mid); }
    .alert-err { padding:11px 14px; border-radius:10px; font-size:.85rem; font-weight:600;
                 text-align:center; margin-bottom:18px;
                 background:hsla(349,51%,47%,.1); border:1.5px solid var(--error); color:var(--error); }
    .alert-ok { width:100%; max-width:520px; padding:12px 16px; border-radius:12px; font-size:.88rem;
                font-weight:600; text-align:center;
                background:hsla(145,33%,36%,.12); border:1.5px solid #3F7D5A; color:#2C5A40; }
    .divider { border:none; border-top:1px solid var(--border); margin:22px 0; }
    .demo-btn { display:block; text-align:center; padding:14px; border-radius:12px;
                font-size:.93rem; font-weight:700; color:#fff; text-decoration:none;
                transition:opacity .15s; }
    .demo-btn:hover { opacity:.88; }
    .back-link { display:inline-flex; align-items:center; gap:7px; font-size:.88rem;
                 font-weight:600; color:var(--muted); text-decoration:none; transition:color .15s; }
    .back-link:hover { color:var(--green); }
    .back-link svg { width:14px; height:14px; fill:currentColor; }
    @media (max-width:560px) { .tab-pane { padding:26px 24px 30px; } .card { max-width:100%; } }
  </style>
</head>
<body>
  <div class="brand">
    <img src="assets/images/logo-finaal.png" alt="Kriko-M">
    <div class="brand-text">
      <span>Kriko-M</span>
      <small>Scouts &amp; Gidsen Sint-Niklaas</small>
    </div>
  </div>

  <?php if (isset($_GET['uitgelogd'])): ?>
    <div class="alert-ok">Je bent uitgelogd.</div>
    <!-- Winkelmandje hoort bij het profiel: leegmaken bij uitloggen. -->
    <script>try { localStorage.removeItem('kriko_cart'); } catch (e) {}</script>
  <?php endif; ?>

  <div class="card">
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('ouder',this)">👨‍👩‍👧 Ouder / Lid</button>
      <button class="tab-btn"        onclick="switchTab('leiding',this)">🛡️ Leiding</button>
    </div>

    <!-- ── OUDER TAB ── -->
    <div id="pane-ouder" class="tab-pane active">
      <div class="pane-title">Inloggen</div>
      <div class="pane-sub">Log in met je account. Nog geen account?
        <a href="register.php" style="color:var(--green);font-weight:700;">Registreer hier</a>.</div>

      <?php if ($login_error): ?>
        <div class="alert-err"><?php echo htmlspecialchars($login_error); ?></div>
      <?php endif; ?>
      <?php if (isset($_GET['sgo_error'])): ?>
        <div class="alert-err"><?php echo htmlspecialchars(urldecode($_GET['sgo_error'])); ?></div>
      <?php endif; ?>

      <form method="POST">
        <?php echo csrf_field(); ?>
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
        <a href="ouderportaal.php?demologin=1" style="display:block;text-align:center;font-size:.82rem;color:var(--muted);text-decoration:underline;">
          Demo ouder-account</a>
      <?php endif; ?>
    </div>

    <!-- ── LEIDING TAB ── -->
    <div id="pane-leiding" class="tab-pane">
      <div class="pane-title">Inloggen — Leiding</div>
      <div class="pane-sub">Log in met je persoonlijk <strong>Scouts &amp; Gidsen Vlaanderen</strong>-account. Je rol en takken worden automatisch herkend.</div>

      <?php if (sgo_dev_mode()): ?>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <a href="ouderportaal.php?demologin=leiding"     class="demo-btn" style="background:var(--green);">Demo — Leiding</a>
          <a href="ouderportaal.php?demologin=groepsleiding" class="demo-btn" style="background:var(--green-mid);">Demo — Groepsleiding</a>
          <a href="ouderportaal.php?demologin=webshop"     class="demo-btn" style="background:var(--green-mid);">Demo — Webshop</a>
          <a href="ouderportaal.php?demologin=website"     class="demo-btn" style="background:var(--green-mid);">Demo — Website</a>
        </div>
        <p style="font-size:.75rem;color:var(--muted);margin-top:14px;text-align:center;">
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
$page_title = match($portal_role) { 'leiding'=>'Leiding','groepsleiding'=>'Groepsleiding','webshop'=>'Webshop','website'=>'Website',default=>'Ouder' };
require_once __DIR__ . '/includes/header.php';
?>

<section class="section" style="padding-top:80px;padding-bottom:100px;min-height:70vh;">
  <div class="portaal-wrap">

  <?php if ($flash): ?>
  <div id="portaal-flash" style="margin:0 0 24px;padding:13px 18px;border-radius:12px;font-weight:600;font-size:0.9rem;
      transition:opacity .4s,margin .4s,padding .4s,max-height .4s;
      <?php echo $flash_type==='error'
        ? 'background:hsla(349,51%,47%,.1);border:1.5px solid var(--color-error);color:var(--color-error);'
        : 'background:hsla(145,33%,36%,.1);border:1.5px solid var(--color-success);color:var(--color-success);'; ?>">
      <?php echo htmlspecialchars($flash); ?>
  </div>
  <script>
    (function() {
      var el = document.getElementById('portaal-flash');
      if (!el) return;
      setTimeout(function() {
        el.style.opacity = '0';
        el.style.margin = '0';
        el.style.padding = '0';
        el.style.maxHeight = '0';
        el.style.overflow = 'hidden';
        setTimeout(function() { el.remove(); }, 420);
      }, 3500);
    })();
  </script>
  <?php endif; ?>

  <?php if ($portal_role === 'ouder'): /* ══════════ OUDER ══════════ */
    $sectie = $_GET['sectie'] ?? '';
    if (!in_array($sectie, ['kampen','webshop','echos','account'], true)) $sectie = '';
    $meerdere_kinderen = !empty($kinderen) && count($kinderen) > 1;
  ?>

    <?php if ($sectie === '' && !empty($kinderen)): /* intro enkel op het startmenu */ ?>
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
    <?php endif; /* /intro gate */ ?>

    <?php
    /* Herbruikbare leden-chips voor de kampen- en echo-secties */
    $render_chips = function() use ($kinderen, $tak_kleur) {
      foreach ($kinderen as $i => $kind):
        $c_id = $kind['ga_id'] ?? $kind['id'] ?? '';
        $c_tak= strtolower($kind['tak'] ?? '');
        $c_kl = $tak_kleur[$c_tak] ?? 'var(--color-accent)'; ?>
      <button class="kind-chip <?php echo $i===0?'active':''; ?>"
          data-kind="<?php echo htmlspecialchars($c_id); ?>" style="--kleur:<?php echo $c_kl; ?>">
        <span class="kind-chip-avatar"><?php echo strtoupper(substr($kind['voornaam']??'?',0,1)); ?></span>
        <span class="kind-chip-info">
          <span class="kind-chip-naam"><?php echo htmlspecialchars($kind['voornaam']??''); ?></span>
          <span class="kind-chip-tak"><?php echo htmlspecialchars($c_tak?:'tak'); ?></span>
        </span>
      </button>
      <?php endforeach;
    };
    ?>

    <?php if (empty($kinderen)): ?>
      <div class="portaal-empty" style="padding:40px 24px;text-align:center;">
        <div style="font-size:2.4rem;margin-bottom:10px;">🧐</div>
        We vonden geen lid gekoppeld aan jouw account.<br>
        Klopt dit niet? Neem contact op met de <a href="contact.php" style="color:var(--color-accent);">groepsleiding</a>.
      </div>

    <?php elseif ($sectie === ''): /* ═══════════ STARTMENU ═══════════ */
      $ke_cm=(int)date('n'); $ke_cy=(int)date('Y');
      $ke_nm=$ke_cm===12?1:$ke_cm+1; $ke_ny=$ke_cm===12?$ke_cy+1:$ke_cy;
      $stat_open=0; $stat_in=0; $stat_echos=0;
      foreach ($kinderen as $kk) {
        $kt=strtolower($kk['tak']??''); $kg=$kk['ga_id']??$kk['id']??'';
        $kids_ids=kampen_voor_kind($kg);
        foreach (open_kampen_voor_tak($kt) as $okmp)
          if (in_array($okmp['id'],$kids_ids,true)) $stat_in++; else $stat_open++;
        foreach (($echos_by_tak[$kt]??[]) as $e) {
          $em=(int)($e['month']??0); $ey=(int)($e['year']??0);
          if (($em===$ke_cm&&$ey===$ke_cy)||($em===$ke_nm&&$ey===$ke_ny)) $stat_echos++;
        }
      }
      $stat_orders=count($my_orders); $stat_leden=count($kinderen);
      $menu_items = [
        ['sectie'=>'kampen','icon'=>'🏕️','titel'=>'Kampen','kleur'=>'var(--color-kapoenen)',
         'desc'=>'Schrijf je kinderen in voor weekends en kampen, en bekijk documenten & paklijsten.',
         'stat'=>$stat_open>0 ? $stat_open.' open '.($stat_open===1?'inschrijving':'inschrijvingen') : ($stat_in>0?$stat_in.' ingeschreven':'Geen open kampen')],
        ['sectie'=>'webshop','icon'=>'🛍️','titel'=>'Webshop','kleur'=>'var(--color-accent)',
         'desc'=>'Bestel uniformstukken, kledij en accessoires, en volg je bestellingen op.',
         'stat'=>$stat_orders>0 ? $stat_orders.' '.($stat_orders===1?'bestelling':'bestellingen') : 'Naar de shop'],
        ['sectie'=>'echos','icon'=>'📰','titel'=>"Kriko Echo's",'kleur'=>'var(--color-givers)',
         'desc'=>'Download de maandelijkse planningsbrieven van de tak van je kind(eren).',
         'stat'=>$stat_echos>0 ? $stat_echos.' beschikbaar' : 'Niets dit moment'],
        ['sectie'=>'account','icon'=>'👨‍👩‍👧','titel'=>'Mijn leden','kleur'=>'var(--color-jonggivers)',
         'desc'=>'Beheer je gekoppelde kinderen, voeg een lid toe of pas je account aan.',
         'stat'=>$stat_leden.' '.($stat_leden===1?'lid gekoppeld':'leden gekoppeld')],
      ];
    ?>
      <?php $voornaam = explode(' ', trim($ouder_naam))[0] ?: $ouder_naam; ?>
      <div class="portaal-hero">
        <span class="portaal-hero-deco">⛺</span>
        <div class="portaal-hero-content">
          <span class="portaal-hero-kicker">Ouderportaal</span>
          <h1>Hallo, <?php echo htmlspecialchars($voornaam); ?>! 👋</h1>
          <p>Beheer alles voor jouw <?php echo $stat_leden === 1 ? 'kind' : 'kinderen'; ?> bij Scouts Kriko-M, op één plek.</p>
          <div class="portaal-hero-stats">
            <span><strong><?php echo $stat_leden; ?></strong> <?php echo $stat_leden === 1 ? 'lid' : 'leden'; ?></span>
            <span><strong><?php echo $stat_open; ?></strong> open <?php echo $stat_open === 1 ? 'kamp' : 'kampen'; ?></span>
            <span><strong><?php echo $stat_orders; ?></strong> <?php echo $stat_orders === 1 ? 'bestelling' : 'bestellingen'; ?></span>
          </div>
        </div>
      </div>

      <h2 class="portaal-menu-label">Waar wil je naartoe?</h2>
      <div class="portaal-menu">
        <?php foreach ($menu_items as $mi): ?>
        <a class="portaal-menu-card" href="ouderportaal.php?sectie=<?php echo $mi['sectie']; ?>" style="--kleur:<?php echo $mi['kleur']; ?>">
          <span class="portaal-menu-icon"><?php echo $mi['icon']; ?></span>
          <span class="portaal-menu-body">
            <span class="portaal-menu-titel"><?php echo $mi['titel']; ?></span>
            <span class="portaal-menu-desc"><?php echo htmlspecialchars($mi['desc']); ?></span>
          </span>
          <span class="portaal-menu-foot">
            <span class="portaal-menu-stat"><?php echo htmlspecialchars($mi['stat']); ?></span>
            <span class="portaal-menu-arrow"><i class="fa-solid fa-arrow-right"></i></span>
          </span>
        </a>
        <?php endforeach; ?>
      </div>

    <?php else: /* ═══════════ SECTIE GESELECTEERD ═══════════ */
      $sectie_titels=['kampen'=>'🏕️ Kampen','webshop'=>'🛍️ Webshop','echos'=>"📰 Kriko Echo's",'account'=>'👨‍👩‍👧 Mijn leden'];
      $sectie_kleuren=['kampen'=>'var(--color-kapoenen)','webshop'=>'var(--color-accent)','echos'=>'var(--color-givers)','account'=>'var(--color-jonggivers)'];
      $sk=$sectie_kleuren[$sectie] ?? 'var(--color-accent)';
    ?>
      <div class="portaal-sectie-head" style="--kleur:<?php echo $sk; ?>">
        <a href="ouderportaal.php" class="portaal-back" title="Terug naar menu"><i class="fa-solid fa-arrow-left"></i></a>
        <h1 class="portaal-sectie-titel"><?php echo $sectie_titels[$sectie] ?? ''; ?></h1>
      </div>

      <?php if ($sectie === 'kampen'): /* ─── KAMPEN ─── */ ?>
      <div class="portaal-grid" style="grid-template-columns:200px minmax(0,1fr);">

      <!-- Leden-kolom -->
      <aside class="portaal-leden">
        <div class="portaal-leden-title"><?php echo $meerdere_kinderen ? 'Leden' : 'Lid'; ?></div>
        <?php if ($meerdere_kinderen): ?>
        <div class="kind-chips" role="tablist"><?php $render_chips(); ?></div>
        <?php endif; ?>
      </aside>

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
          </div>

          <!-- Ingeschreven kampen -->
          <div class="portaal-subhead">🏕️ Ingeschreven kampen</div>
          <?php if (empty($kampen_in)): ?>
            <div class="portaal-empty">Nog niet ingeschreven voor een kamp.</div>
          <?php else: foreach ($kampen_in as $kamp):
            $periode  = date('j/n',strtotime($kamp['datum_van'])).' – '.date('j/n/Y',strtotime($kamp['datum_tot']));
            $bestanden= $kamp['bestanden'] ?? [];
            $ins_rec  = get_inschrijving($ga_id,$kamp['id']); ?>
          <div class="portaal-kamp is-in" style="padding:0;overflow:hidden;">
            <?php if (!empty($kamp['foto'])): ?>
            <div style="width:100%;height:140px;overflow:hidden;border-radius:var(--border-radius-lg) var(--border-radius-lg) 0 0;">
              <img src="uploads/kamp-fotos/<?php echo urlencode($kamp['foto']); ?>" alt="<?php echo htmlspecialchars($kamp['naam']); ?>"
                   style="width:100%;height:100%;object-fit:cover;">
            </div>
            <?php endif; ?>
            <div style="padding:16px 18px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
              <div>
                <div class="portaal-kamp-naam"><?php echo htmlspecialchars($kamp['naam']); ?> <span style="color:var(--color-success);font-size:.78rem;">✓ ingeschreven</span></div>
                <div class="portaal-kamp-meta">📅 <?php echo $periode; ?> &middot; 📍 <?php echo htmlspecialchars($kamp['locatie']??''); ?></div>
              </div>
              <form method="post" style="flex-shrink:0;">
                <input type="hidden" name="actie" value="uitschrijven">
                <input type="hidden" name="sectie" value="kampen">
                <input type="hidden" name="ga_id" value="<?php echo htmlspecialchars($ga_id); ?>">
                <input type="hidden" name="kamp_id" value="<?php echo htmlspecialchars($kamp['id']); ?>">
                <button type="submit" style="background:none;border:1.5px solid var(--color-error);color:var(--color-error);
                    padding:4px 10px;border-radius:8px;font-size:.78rem;cursor:pointer;"
                    data-confirm="Inschrijving annuleren?">Uitschrijven</button>
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
            </div><!-- /.kamp-inner-padding -->
          </div><!-- /.portaal-kamp.is-in -->
          <?php endforeach; endif; ?>

          <!-- Schrijf in voor kamp -->
          <div class="portaal-subhead">➕ Schrijf in voor een kamp</div>
          <?php if (empty($kampen_uit)): ?>
            <div class="portaal-empty">Geen open kampen op dit moment voor deze tak.</div>
          <?php else: foreach ($kampen_uit as $kamp):
            $periode = date('j/n',strtotime($kamp['datum_van'])).' – '.date('j/n/Y',strtotime($kamp['datum_tot'])); ?>
          <div class="portaal-kamp" style="padding:0;overflow:hidden;">
            <?php if (!empty($kamp['foto'])): ?>
            <div style="width:100%;height:160px;overflow:hidden;border-radius:var(--border-radius-lg) var(--border-radius-lg) 0 0;">
              <img src="uploads/kamp-fotos/<?php echo urlencode($kamp['foto']); ?>" alt="<?php echo htmlspecialchars($kamp['naam']); ?>"
                   style="width:100%;height:100%;object-fit:cover;">
            </div>
            <?php endif; ?>
            <div style="padding:18px 20px;">
            <div class="portaal-kamp-naam"><?php echo htmlspecialchars($kamp['naam']); ?></div>
            <div class="portaal-kamp-meta">📅 <?php echo $periode; ?> &middot; 📍 <?php echo htmlspecialchars($kamp['locatie']??''); ?></div>
            <?php if (!empty($kamp['beschrijving'])): ?>
              <div class="portaal-kamp-desc"><?php echo nl2br(htmlspecialchars($kamp['beschrijving'])); ?></div>
            <?php endif; ?>
            <form method="post" style="margin-top:12px;display:flex;flex-direction:column;gap:9px;">
              <input type="hidden" name="actie" value="inschrijven">
              <input type="hidden" name="sectie" value="kampen">
              <input type="hidden" name="ga_id" value="<?php echo htmlspecialchars($ga_id); ?>">
              <input type="hidden" name="kamp_id" value="<?php echo htmlspecialchars($kamp['id']); ?>">
              <textarea name="opmerking" rows="2" class="form-control" style="font-size:.88rem;"
                  placeholder="Vrije opmerking voor de leiding (optioneel). Medische info niet nodig — die staat bij S&G."></textarea>
              <button type="submit" class="btn btn-secondary" style="align-self:flex-start;padding:8px 18px;font-size:.88rem;">
                  <i class="fa-solid fa-check"></i> Inschrijven</button>
            </form>
            </div><!-- /.kamp-inner-padding -->
          </div><!-- /.portaal-kamp -->
          <?php endforeach; endif; ?>

        </div><!-- /.portaal-card -->
      </div><!-- /.kind-panel / direct -->
      <?php endforeach; ?>

      </div><!-- /.portaal-main -->
      </div><!-- /.portaal-grid (kampen) -->
      <?php endif; /* /kampen */ ?>

      <?php if ($sectie === 'webshop'): /* ─── WEBSHOP ─── */ ?>
      <div class="portaal-sectie-wrap">
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
               data-confirm="Bevestig dat je het bedrag hebt overgeschreven.">
               <i class="fa-solid fa-check"></i> Ik heb betaald</a>
            <?php endif; ?>
          </div>
          <?php endforeach; endif; ?>
        </div>
      </div><!-- /.portaal-sectie-wrap -->
      <?php endif; /* /webshop */ ?>

      <?php if ($sectie === 'echos'): /* ─── KRIKO ECHO'S ─── */ ?>
        <?php if ($meerdere_kinderen): ?>
        <div class="kind-chips" role="tablist" style="margin-bottom:22px;"><?php $render_chips(); ?></div>
        <?php endif; ?>

        <!-- Kriko Echo's — enkel lopende maand + volgende maand -->
        <?php
        $ke_cm = (int)date('n'); $ke_cy = (int)date('Y');
        $ke_nm = $ke_cm === 12 ? 1 : $ke_cm + 1;
        $ke_ny = $ke_cm === 12 ? $ke_cy + 1 : $ke_cy;
        $ke_filter = fn($e) =>
            ((int)($e['month']??0) === $ke_cm && (int)($e['year']??0) === $ke_cy) ||
            ((int)($e['month']??0) === $ke_nm && (int)($e['year']??0) === $ke_ny);
        ?>
        <?php if ($meerdere_kinderen): foreach ($kinderen as $i => $kind):
          $ke_id   = $kind['ga_id'] ?? $kind['id'] ?? '';
          $ke_tak  = strtolower($kind['tak'] ?? '');
          $ke_list = array_values(array_filter($echos_by_tak[$ke_tak] ?? [], $ke_filter)); ?>
        <div class="portaal-shop-card kind-panel <?php echo $i===0?'active':''; ?>"
             data-kind="<?php echo htmlspecialchars($ke_id); ?>"
             style="margin-top:16px;">
          <div class="portaal-shop-head">📰 Kriko Echo's</div>
          <?php if (empty($ke_list)): ?>
            <p style="font-size:.82rem;color:var(--color-text-muted);margin:0;">Geen Kriko Echo beschikbaar voor deze tak.</p>
          <?php else: ?>
          <div class="portaal-echo-grid">
            <?php foreach ($ke_list as $echo):
              $label = ($months_nl[(int)($echo['month']??0)]??'').' '.($echo['year']??''); ?>
            <a class="portaal-echo-btn" href="uploads/echos/<?php echo urlencode($echo['file_name']??''); ?>" target="_blank" rel="noopener">
              <span><i class="fa-solid fa-file-pdf"></i> <span class="portaal-echo-maand"><?php echo htmlspecialchars(trim($label)); ?></span></span>
              <span class="portaal-echo-open">Openen <i class="fa-solid fa-arrow-up-right-from-square"></i></span>
            </a>
            <?php endforeach; ?>
          </div>
          <?php endif; ?>
        </div>
        <?php endforeach; else:
          $ke_tak  = strtolower($kinderen[0]['tak'] ?? '');
          $ke_list = array_values(array_filter($echos_by_tak[$ke_tak] ?? [], $ke_filter)); ?>
        <div class="portaal-shop-card" style="margin-top:16px;">
          <div class="portaal-shop-head">📰 Kriko Echo's</div>
          <?php if (empty($ke_list)): ?>
            <p style="font-size:.82rem;color:var(--color-text-muted);margin:0;">Geen Kriko Echo beschikbaar voor deze tak.</p>
          <?php else: ?>
          <div class="portaal-echo-grid">
            <?php foreach ($ke_list as $echo):
              $label = ($months_nl[(int)($echo['month']??0)]??'').' '.($echo['year']??''); ?>
            <a class="portaal-echo-btn" href="uploads/echos/<?php echo urlencode($echo['file_name']??''); ?>" target="_blank" rel="noopener">
              <span><i class="fa-solid fa-file-pdf"></i> <span class="portaal-echo-maand"><?php echo htmlspecialchars(trim($label)); ?></span></span>
              <span class="portaal-echo-open">Openen <i class="fa-solid fa-arrow-up-right-from-square"></i></span>
            </a>
            <?php endforeach; ?>
          </div>
          <?php endif; ?>
        </div>
        <?php endif; ?>
      <?php endif; /* /echos */ ?>

      <?php if ($sectie === 'account'): /* ─── MIJN LEDEN / ACCOUNT ─── */ ?>
      <div class="portaal-sectie-wrap">
        <div class="portaal-card">

          <!-- Leden beheren -->
          <div style="font-size:.73rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;
               color:var(--color-text-muted);margin-bottom:12px;">Gekoppelde leden</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <?php foreach ($kinderen as $kind):
              $k_ga_id  = $kind['ga_id'] ?? $kind['id'] ?? '';
              $k_naam   = htmlspecialchars(trim(($kind['voornaam']??'').' '.($kind['achternaam']??'')));
              $k_tak    = htmlspecialchars(strtolower($kind['tak'] ?? ''));
              $k_confirm= htmlspecialchars($kind['voornaam'] ?? 'Dit kind', ENT_QUOTES); ?>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;
                 padding:12px 16px;background:var(--color-bg-linen);border-radius:12px;">
              <div>
                <div style="font-weight:700;font-size:.95rem;color:var(--color-primary-dark);"><?php echo $k_naam; ?></div>
                <div style="font-size:.76rem;color:var(--color-text-muted);text-transform:capitalize;"><?php echo $k_tak; ?></div>
              </div>
              <?php if ($ouder_ingelogd): ?>
              <form method="post">
                <input type="hidden" name="actie" value="ontkoppel_kind">
                <input type="hidden" name="sectie" value="account">
                <input type="hidden" name="ga_id" value="<?php echo htmlspecialchars($k_ga_id); ?>">
                <button type="submit"
                    style="background:none;border:1.5px solid var(--color-error);color:var(--color-error);
                           padding:6px 12px;border-radius:8px;font-size:.78rem;cursor:pointer;white-space:nowrap;"
                    data-confirm="<?php echo $k_confirm; ?> ontkoppelen van jouw account?" data-confirm-danger>
                  <i class="fa-solid fa-link-slash"></i> Ontkoppelen</button>
              </form>
              <?php endif; ?>
            </div>
            <?php endforeach; ?>
          </div>

          <?php if ($ouder_ingelogd): ?>
          <!-- Lid toevoegen -->
          <a href="ouderportaal.php?actie=addkid"
             style="display:flex;align-items:center;gap:10px;padding:13px 16px;margin-top:18px;
                    background:none;border:1.5px dashed var(--color-accent);border-radius:12px;
                    text-decoration:none;transition:background .15s;">
            <span style="width:34px;height:34px;border-radius:50%;
                         background:color-mix(in srgb,var(--color-accent) 15%,transparent);
                         color:var(--color-accent);display:flex;align-items:center;justify-content:center;
                         font-size:1.2rem;font-weight:700;flex-shrink:0;">+</span>
            <span>
              <span style="display:block;font-weight:700;font-size:.92rem;color:var(--color-accent);">Lid toevoegen</span>
              <span style="font-size:.76rem;color:var(--color-text-muted);">via S&amp;G-account van je kind</span>
            </span>
          </a>

          <!-- Account verwijderen -->
          <div style="border-top:1px solid var(--color-border);padding-top:18px;margin-top:20px;">
            <form method="post">
              <input type="hidden" name="actie" value="verwijder_account">
              <button type="submit"
                  style="background:none;border:none;font-size:.82rem;color:var(--color-error);
                         cursor:pointer;text-decoration:underline;padding:0;"
                  data-confirm="Account en alle gekoppelde kinderen verwijderen?" data-confirm-danger>
                <i class="fa-solid fa-trash" style="margin-right:5px;"></i>Account verwijderen</button>
            </form>
          </div>
          <?php endif; ?>

        </div>
      </div>
      <?php endif; /* /account */ ?>

    <?php endif; /* /kinderen (leeg / startmenu / sectie) */ ?>

    <?php if (!empty($kinderen)): ?>
    <script>
      // Herstel actief kind na PRG-redirect (kampen & echo's)
      (function() {
        const urlKind = new URLSearchParams(location.search).get('kind');
        if (!urlKind) return;
        document.querySelectorAll('.kind-chip').forEach(c => c.classList.toggle('active', c.dataset.kind === urlKind));
        document.querySelectorAll('.kind-panel').forEach(p => p.classList.toggle('active', p.dataset.kind === urlKind));
      })();
      // Injecteer actief kind in de kampen-formulieren vóór submit
      document.querySelectorAll('.portaal-main form').forEach(function(form) {
        form.addEventListener('submit', function() {
          const activePanel = document.querySelector('.kind-panel.active[data-kind]');
          if (activePanel && !this.querySelector('[name="_active_kind"]')) {
            const h = document.createElement('input');
            h.type = 'hidden'; h.name = '_active_kind'; h.value = activePanel.dataset.kind;
            this.appendChild(h);
          }
        });
      });
    </script>
    <?php endif; ?>

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
            </span>
          </button>
          <?php endforeach; ?>
          <?php if ($portal_role === 'groepsleiding'): ?>
          <button class="kind-chip" data-kind="tak-groepsleiding" style="--kleur:#1A3D2A;">
            <span class="kind-chip-avatar" style="font-size:.75rem;">G</span>
            <span class="kind-chip-info">
              <span class="kind-chip-naam">Groepsleiding</span>
            </span>
          </button>
          <?php endif; ?>
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
          <div class="portaal-lid-head" style="padding-bottom:20px;margin-bottom:0;">
            <div class="portaal-lid-avatar" style="border-radius:16px;width:64px;height:64px;font-size:1.4rem;"><?php echo strtoupper(substr($tak,0,1)); ?></div>
            <div style="flex:1;">
              <div class="portaal-lid-naam" style="font-size:1.45rem;"><?php echo htmlspecialchars(['kapoenen'=>'Kapoenen','welpen'=>'Welpen','jonggivers'=>'Jonggivers','givers'=>'Givers'][$tak]??ucfirst($tak)); ?></div>
              <div style="display:flex;gap:20px;margin-top:8px;flex-wrap:wrap;">
                <span style="display:flex;align-items:center;gap:6px;font-size:.85rem;color:var(--color-text-muted);">🏕️ <strong style="color:var(--color-primary);"><?php echo count($tak_kampen); ?></strong> kamp<?php echo count($tak_kampen)!==1?'en':''; ?></span>
                <span style="display:flex;align-items:center;gap:6px;font-size:.85rem;color:var(--color-text-muted);">📰 <strong style="color:var(--color-primary);"><?php echo count($tak_echos); ?></strong> echo's</span>
                <?php $open_kampen = array_filter($tak_kampen, fn($k)=>$k['open_voor_inschrijving']); if ($open_kampen): ?>
                <span style="display:inline-flex;align-items:center;gap:5px;font-size:.78rem;font-weight:700;background:hsla(145,33%,36%,.1);color:var(--color-success);padding:3px 10px;border-radius:20px;">✓ <?php echo count($open_kampen); ?> open voor inschrijving</span>
                <?php endif; ?>
              </div>
            </div>
          </div>

          <?php
          $nm = (int)date('n') + 1; $ny = (int)date('Y');
          if ($nm > 12) { $nm = 1; $ny++; }
          $has_next_ke = false;
          foreach ($tak_echos as $_e) { if ((int)$_e['month']===$nm && (int)$_e['year']===$ny) { $has_next_ke=true; break; } }
          ?>
          <!-- Tab buttons -->
          <div style="display:flex;gap:8px;margin:20px 0;flex-wrap:wrap;border-bottom:1px solid var(--color-border);padding-bottom:16px;align-items:center;">
            <button class="gl-tab-btn active" onclick="takTab('kampen','<?php echo $tak; ?>',this)">🏕️ Kampen &amp; Weekenden <?php if($tak_kampen): ?><span style="background:var(--color-primary);color:#fff;border-radius:20px;padding:1px 7px;font-size:.7rem;margin-left:3px;"><?php echo count($tak_kampen); ?></span><?php endif; ?></button>
            <button class="gl-tab-btn" onclick="takTab('echos','<?php echo $tak; ?>',this)">📰 Kriko Echo's <?php if($tak_echos): ?><span style="background:var(--color-accent);color:#fff;border-radius:20px;padding:1px 7px;font-size:.7rem;margin-left:3px;"><?php echo count($tak_echos); ?></span><?php endif; ?></button>
            <?php if ($portal_role === 'groepsleiding'): ?>
            <button class="gl-tab-btn" onclick="takTab('kalender','<?php echo $tak; ?>',this)">📅 Kalender <?php if(!empty($calendar_events)): ?><span style="background:var(--color-accent);color:#fff;border-radius:20px;padding:1px 7px;font-size:.7rem;margin-left:3px;"><?php echo count($calendar_events); ?></span><?php endif; ?></button>
            <?php endif; ?>
            <?php if (!$has_next_ke): ?>
            <span style="display:inline-flex;align-items:center;gap:6px;margin-left:4px;padding:6px 12px;
                background:#fff8e1;border:1.5px solid #f59e0b;border-radius:10px;font-size:.78rem;
                font-weight:700;color:#92400e;">
              ⚠️ Echo <?php echo $months_nl[$nm]; ?> nog niet geüpload
            </span>
            <?php endif; ?>
          </div>

          <!-- ─── KAMPEN BEHEER ─── -->
          <div id="tak-<?php echo $tak; ?>-kampen" class="tak-pane active">
          <?php
          $today = date('Y-m-d');
          $aankomende = array_filter($tak_kampen, fn($k) => ($k['datum_tot'] ?? '9999') >= $today);
          $voorbije   = array_filter($tak_kampen, fn($k) => ($k['datum_tot'] ?? '9999') <  $today);
          ?>
          <?php if (empty($aankomende)): ?>
            <div class="portaal-empty">Geen aankomende kampen voor deze tak.</div>
          <?php endif; ?>
          <?php foreach ($aankomende as $kamp):
            $periode  = date('j/n',strtotime($kamp['datum_van'])).' – '.date('j/n/Y',strtotime($kamp['datum_tot']));
            $ins_count= count(inschrijvingen_voor_kamp($kamp['id']));
            $bestanden= $kamp['bestanden'] ?? [];
            $is_open  = !empty($kamp['open_voor_inschrijving']); ?>
          <div class="portaal-kamp" style="margin-bottom:16px;padding:0;overflow:hidden;">
            <?php if (!empty($kamp['foto'])): ?>
            <div style="width:100%;height:180px;overflow:hidden;border-radius:var(--border-radius-lg) var(--border-radius-lg) 0 0;">
              <img src="uploads/kamp-fotos/<?php echo urlencode($kamp['foto']); ?>" alt="Omslagfoto"
                   style="width:100%;height:100%;object-fit:cover;">
            </div>
            <?php endif; ?>
            <div style="padding:20px 22px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
              <div style="flex:1;min-width:0;">
                <div class="portaal-kamp-naam" style="font-size:1.15rem;"><?php echo htmlspecialchars($kamp['naam']); ?></div>
                <div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:10px;">
                  <span style="font-size:.88rem;color:var(--color-text-muted);">📅 <?php echo $periode; ?></span>
                  <?php if ($kamp['locatie']??''): ?><span style="font-size:.88rem;color:var(--color-text-muted);">📍 <?php echo htmlspecialchars($kamp['locatie']); ?></span><?php endif; ?>
                  <span style="font-size:.88rem;color:var(--color-text-muted);">👤 <?php echo $ins_count; ?> inschrijving<?php echo $ins_count!==1?'en':''; ?></span>
                  <span style="font-size:.88rem;color:var(--color-text-muted);">📎 <?php echo count($bestanden); ?> bestand<?php echo count($bestanden)!==1?'en':''; ?></span>
                </div>
                <?php if ($kamp['beschrijving']??''): ?>
                <div style="margin-top:10px;font-size:.88rem;color:var(--color-text-dark);line-height:1.5;"><?php echo nl2br(htmlspecialchars($kamp['beschrijving'])); ?></div>
                <?php endif; ?>
              </div>
              <div style="display:flex;gap:8px;flex-shrink:0;align-items:flex-start;flex-wrap:wrap;">
                <!-- Publiek toggle -->
                <form method="post" style="display:inline;">
                  <input type="hidden" name="actie" value="toggle_publiek">
                  <input type="hidden" name="kamp_id" value="<?php echo htmlspecialchars($kamp['id']); ?>">
                  <button type="submit" style="display:inline-flex;align-items:center;gap:7px;padding:8px 14px;
                      border-radius:10px;font-size:.82rem;font-weight:700;cursor:pointer;border:1.5px solid;
                      <?php echo $is_open
                        ? 'background:hsla(145,33%,36%,.1);color:var(--color-success);border-color:var(--color-success);'
                        : 'background:#f5f5f5;color:#888;border-color:#ccc;'; ?>">
                    <?php echo $is_open ? '● Publiek' : '○ Privé'; ?>
                  </button>
                </form>
                <a href="leiding-export.php?kamp=<?php echo urlencode($kamp['id']); ?>" target="_blank"
                   style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:var(--color-primary);color:#fff;border-radius:10px;font-size:.82rem;font-weight:700;text-decoration:none;">
                   <i class="fa-solid fa-file-csv"></i> CSV</a>
                <form method="post" style="display:inline;">
                  <input type="hidden" name="actie" value="verwijder_kamp">
                  <input type="hidden" name="kamp_id" value="<?php echo htmlspecialchars($kamp['id']); ?>">
                  <button type="submit" style="background:none;border:1.5px solid var(--color-error);color:var(--color-error);padding:8px 12px;border-radius:10px;font-size:.82rem;cursor:pointer;"
                      data-confirm="Kamp en alle inschrijvingen verwijderen?" data-confirm-danger>✕</button>
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
                <div style="text-align:right;grid-column:1/-1;">
                  <button type="submit" class="btn btn-secondary" style="padding:7px 16px;font-size:.85rem;">Opslaan</button></div>
              </form>
            </details>

            <!-- Foto beheer -->
            <details style="margin-top:6px;">
              <summary style="cursor:pointer;font-size:.82rem;color:var(--color-primary);font-weight:700;
                  list-style:none;display:flex;align-items:center;gap:6px;padding:6px 0;">
                  <i class="fa-solid fa-image"></i> Omslagfoto <?php echo !empty($kamp['foto']) ? '(aanwezig)' : '(geen)'; ?></summary>
              <div style="margin-top:10px;">
                <?php if (!empty($kamp['foto'])): ?>
                <img src="uploads/kamp-fotos/<?php echo urlencode($kamp['foto']); ?>" alt="Huidige omslagfoto"
                     style="width:100%;max-height:160px;object-fit:cover;border-radius:10px;margin-bottom:10px;">
                <?php endif; ?>
                <form method="post" enctype="multipart/form-data" style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;">
                  <input type="hidden" name="actie" value="upload_foto">
                  <input type="hidden" name="kamp_id" value="<?php echo htmlspecialchars($kamp['id']); ?>">
                  <div style="flex:1;min-width:160px;">
                    <label class="form-label" style="font-size:.75rem;">Nieuwe foto (JPG/PNG/WEBP)</label>
                    <input type="file" name="kamp_foto" accept="image/jpeg,image/png,image/webp" required style="font-size:.78rem;width:100%;">
                  </div>
                  <button type="submit" class="btn btn-secondary" style="padding:7px 14px;font-size:.82rem;white-space:nowrap;">
                    <i class="fa-solid fa-upload"></i> <?php echo !empty($kamp['foto']) ? 'Vervangen' : 'Uploaden'; ?>
                  </button>
                </form>
              </div>
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
                <form method="post" enctype="multipart/form-data" style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">
                  <input type="hidden" name="actie" value="upload_bestand">
                  <input type="hidden" name="kamp_id" value="<?php echo htmlspecialchars($kamp['id']); ?>">
                  <div style="display:grid;grid-template-columns:auto 1fr;gap:8px;">
                    <select name="bestand_type" class="form-control" style="font-size:.82rem;">
                      <?php foreach ($bestand_labels as $v=>$l): ?><option value="<?php echo $v; ?>"><?php echo $l; ?></option><?php endforeach; ?>
                    </select>
                    <input type="text" name="bestand_naam" class="form-control" placeholder="Bestandsnaam (optioneel)" style="font-size:.82rem;">
                  </div>
                  <?php $bz_id = 'bz-'.$kamp['id']; ?>
                  <div class="file-pick-zone" style="padding:12px 16px;" onclick="document.getElementById('<?php echo $bz_id; ?>').click()"
                       ondragover="event.preventDefault();this.classList.add('drag-over')"
                       ondragleave="this.classList.remove('drag-over')"
                       ondrop="event.preventDefault();this.classList.remove('drag-over');handleFilePick('<?php echo $bz_id; ?>',event.dataTransfer.files[0])">
                    <i class="fa-regular fa-file" style="color:var(--color-accent);"></i>
                    <span id="<?php echo $bz_id; ?>-label" style="font-size:.85rem;">Klik of sleep een bestand</span>
                    <span style="font-size:.72rem;color:var(--color-text-muted);">PDF · JPG · PNG · DOCX</span>
                    <input type="file" id="<?php echo $bz_id; ?>" name="bestand" accept=".pdf,.jpg,.jpeg,.png,.docx" required style="display:none"
                           onchange="handleFilePick('<?php echo $bz_id; ?>',this.files[0])">
                  </div>
                  <button type="submit" class="btn btn-secondary" style="padding:8px;font-size:.85rem;width:100%;">
                    <i class="fa-solid fa-upload"></i> Uploaden
                  </button>
                </form>
              </div>
            </details>
            </div><!-- /.kamp-inner-padding -->
          </div><!-- /.portaal-kamp -->
          <?php endforeach; /* /aankomende */ ?>

          <!-- Archief: voorbije kampen -->
          <?php if (!empty($voorbije)): ?>
          <details style="margin-top:18px;">
            <summary style="cursor:pointer;font-size:.88rem;font-weight:700;color:var(--color-text-muted);
                list-style:none;display:flex;align-items:center;gap:8px;padding:10px 14px;
                background:var(--color-bg-linen);border-radius:10px;">
              <i class="fa-solid fa-box-archive"></i> Archief (<?php echo count($voorbije); ?> voorbije kamp<?php echo count($voorbije)!==1?'en':''; ?>)
            </summary>
            <div style="margin-top:8px;display:flex;flex-direction:column;gap:10px;">
            <?php foreach ($voorbije as $kamp):
              $periode  = date('j/n',strtotime($kamp['datum_van'])).' – '.date('j/n/Y',strtotime($kamp['datum_tot']));
              $ins_count= count(inschrijvingen_voor_kamp($kamp['id'])); ?>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 16px;
                background:var(--color-bg-linen);border-radius:12px;opacity:.75;">
              <div>
                <div style="font-weight:700;font-size:.9rem;color:var(--color-primary-dark);"><?php echo htmlspecialchars($kamp['naam']); ?></div>
                <div style="font-size:.78rem;color:var(--color-text-muted);margin-top:2px;">📅 <?php echo $periode; ?> · 👤 <?php echo $ins_count; ?> inschrijvingen</div>
              </div>
              <div style="display:flex;gap:6px;flex-shrink:0;">
                <a href="leiding-export.php?kamp=<?php echo urlencode($kamp['id']); ?>" target="_blank"
                   style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;background:var(--color-primary);color:#fff;border-radius:8px;font-size:.78rem;font-weight:700;text-decoration:none;">
                   <i class="fa-solid fa-file-csv"></i> CSV</a>
                <form method="post" style="display:inline;">
                  <input type="hidden" name="actie" value="verwijder_kamp">
                  <input type="hidden" name="kamp_id" value="<?php echo htmlspecialchars($kamp['id']); ?>">
                  <button type="submit" style="background:none;border:1.5px solid var(--color-error);color:var(--color-error);padding:6px 10px;border-radius:8px;font-size:.78rem;cursor:pointer;"
                      data-confirm="Kamp verwijderen?" data-confirm-danger>✕</button>
                </form>
              </div>
            </div>
            <?php endforeach; ?>
            </div>
          </details>
          <?php endif; ?>

          <!-- Nieuw kamp aanmaken — modal trigger -->
          <button type="button" onclick="document.getElementById('modal-kamp-<?php echo $tak; ?>').classList.add('open')"
            style="width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 20px;
                   background:color-mix(in srgb,var(--color-primary) 6%,transparent);
                   border:1.5px dashed var(--color-border);border-radius:14px;font-family:'Outfit',sans-serif;
                   font-weight:700;font-size:.95rem;color:var(--color-primary);cursor:pointer;margin-top:10px;">
            <i class="fa-solid fa-plus"></i> Nieuw kamp / weekend aanmaken
          </button>

          <!-- Modal -->
          <div id="modal-kamp-<?php echo $tak; ?>" class="kamp-modal-backdrop" onclick="if(event.target===this)this.classList.remove('open')">
            <div class="kamp-modal-box">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
                <span style="font-family:'Outfit',sans-serif;font-weight:700;font-size:1.1rem;color:var(--color-primary);">
                  <i class="fa-solid fa-plus"></i> Nieuw kamp / weekend — <?php echo htmlspecialchars(['kapoenen'=>'Kapoenen','welpen'=>'Welpen','jonggivers'=>'Jonggivers','givers'=>'Givers'][$tak]??ucfirst($tak)); ?>
                </span>
                <button type="button" onclick="document.getElementById('modal-kamp-<?php echo $tak; ?>').classList.remove('open')"
                  style="background:none;border:1.5px solid var(--color-border);border-radius:8px;width:32px;height:32px;
                         font-size:1rem;cursor:pointer;color:var(--color-text-muted);display:flex;align-items:center;justify-content:center;">✕</button>
              </div>
              <form method="post" enctype="multipart/form-data" style="display:flex;flex-direction:column;gap:14px;">
                <input type="hidden" name="actie" value="maak_kamp">
                <input type="hidden" name="tak" value="<?php echo htmlspecialchars($tak); ?>">

                <div><label class="form-label">Naam *</label>
                  <input type="text" name="naam" required class="form-control" placeholder="bv. Zomerkamp 2026"></div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                  <div><label class="form-label">Van *</label>
                    <input type="date" name="datum_van" required class="form-control"></div>
                  <div><label class="form-label">Tot *</label>
                    <input type="date" name="datum_tot" required class="form-control"></div>
                </div>

                <div><label class="form-label">Locatie</label>
                  <input type="text" name="locatie" class="form-control" placeholder="bv. Domein De Ster, Sint-Niklaas"></div>

                <div><label class="form-label">Beschrijving <span style="font-weight:400;color:var(--color-text-muted);">(zichtbaar voor ouders)</span></label>
                  <textarea name="beschrijving" rows="3" class="form-control" placeholder="Vertel ouders wat er te verwachten is — programma, thema, bijzonderheden..."></textarea></div>

                <!-- Omslagfoto — modern dropzone -->
                <div>
                  <label class="form-label">Omslagfoto <span style="font-weight:400;color:var(--color-text-muted);">(optioneel)</span></label>
                  <div class="file-pick-zone" onclick="document.getElementById('foto-new-<?php echo $tak; ?>').click()"
                       ondragover="event.preventDefault();this.classList.add('drag-over')"
                       ondragleave="this.classList.remove('drag-over')"
                       ondrop="event.preventDefault();this.classList.remove('drag-over');handleFilePick('foto-new-<?php echo $tak; ?>',event.dataTransfer.files[0])">
                    <i class="fa-regular fa-image" style="font-size:1.3rem;color:var(--color-accent);"></i>
                    <span id="foto-new-<?php echo $tak; ?>-label">Sleep een foto hierheen of klik</span>
                    <span style="font-size:.75rem;color:var(--color-text-muted);">JPG · PNG · WEBP · max 10 MB</span>
                    <input type="file" id="foto-new-<?php echo $tak; ?>" name="kamp_foto" accept="image/jpeg,image/png,image/webp" style="display:none"
                           onchange="handleFilePick('foto-new-<?php echo $tak; ?>',this.files[0])">
                  </div>
                </div>

                <!-- Bijlage (optioneel bij aanmaken) -->
                <div>
                  <label class="form-label">Bijlage toevoegen <span style="font-weight:400;color:var(--color-text-muted);">(optioneel)</span></label>
                  <div style="display:grid;grid-template-columns:auto 1fr;gap:8px;margin-bottom:8px;">
                    <select name="bestand_type" class="form-control" style="font-size:.85rem;">
                      <?php foreach ($bestand_labels as $v=>$l): ?><option value="<?php echo $v; ?>"><?php echo $l; ?></option><?php endforeach; ?>
                    </select>
                    <input type="text" name="bestand_naam" class="form-control" style="font-size:.85rem;" placeholder="Bestandsnaam (optioneel)">
                  </div>
                  <div class="file-pick-zone" onclick="document.getElementById('bijlage-new-<?php echo $tak; ?>').click()"
                       ondragover="event.preventDefault();this.classList.add('drag-over')"
                       ondragleave="this.classList.remove('drag-over')"
                       ondrop="event.preventDefault();this.classList.remove('drag-over');handleFilePick('bijlage-new-<?php echo $tak; ?>',event.dataTransfer.files[0])">
                    <i class="fa-regular fa-file" style="font-size:1.3rem;color:var(--color-accent);"></i>
                    <span id="bijlage-new-<?php echo $tak; ?>-label">Sleep een bestand hierheen of klik</span>
                    <span style="font-size:.75rem;color:var(--color-text-muted);">PDF · JPG · PNG · DOCX · max 10 MB</span>
                    <input type="file" id="bijlage-new-<?php echo $tak; ?>" name="bestand" accept=".pdf,.jpg,.jpeg,.png,.docx" style="display:none"
                           onchange="handleFilePick('bijlage-new-<?php echo $tak; ?>',this.files[0])">
                  </div>
                </div>

                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding-top:4px;">
                  <label style="display:flex;align-items:center;gap:8px;font-size:.9rem;cursor:pointer;">
                    <input type="checkbox" name="open_voor_inschrijving" value="1" id="ovi_new_<?php echo $tak; ?>">
                    Meteen open voor inschrijving
                  </label>
                  <button type="submit" class="btn btn-secondary" style="padding:11px 28px;font-size:.95rem;">Kamp aanmaken</button>
                </div>
              </form>
            </div>
          </div>

          </div><!-- /.tak-pane kampen -->

          <!-- ─── KRIKO ECHO'S ─── -->
          <div id="tak-<?php echo $tak; ?>-echos" class="tak-pane">
          <p style="font-size:.85rem;color:var(--color-text-muted);margin-bottom:16px;">
            <?php echo count($tak_echos); ?> echo<?php echo count($tak_echos)!==1?'\'s':''; ?> geüpload voor deze tak. Zie het volledige archief rechts. →
          </p>

          <!-- Upload echo -->
          <form method="post" enctype="multipart/form-data" id="echo-upload-form-<?php echo $tak; ?>">
            <input type="hidden" name="actie" value="upload_echo">
            <input type="hidden" name="echo_tak" value="<?php echo htmlspecialchars($tak); ?>">
            <div style="border:2px dashed var(--color-border);border-radius:16px;padding:28px 24px;
                        background:var(--color-bg-linen);transition:border-color .2s,background .2s;cursor:pointer;"
                 id="echo-dropzone-<?php echo $tak; ?>"
                 onclick="document.getElementById('echo-file-<?php echo $tak; ?>').click()"
                 ondragover="event.preventDefault();this.style.borderColor='var(--color-accent)';this.style.background='color-mix(in srgb,var(--color-accent) 5%,white)'"
                 ondragleave="this.style.borderColor='';this.style.background='var(--color-bg-linen)'"
                 ondrop="event.preventDefault();this.style.borderColor='';this.style.background='var(--color-bg-linen)';handleEchoDrop(event,'<?php echo $tak; ?>')">
              <div style="text-align:center;pointer-events:none;">
                <div id="echo-drop-icon-<?php echo $tak; ?>" style="font-size:2.5rem;margin-bottom:10px;color:var(--color-accent);">
                  <i class="fa-regular fa-file-pdf"></i>
                </div>
                <div id="echo-drop-label-<?php echo $tak; ?>" style="font-weight:700;font-size:.95rem;color:var(--color-primary);margin-bottom:4px;">
                  Sleep een PDF hierheen, of klik om te kiezen
                </div>
                <div style="font-size:.78rem;color:var(--color-text-muted);">Alleen PDF-bestanden · max 10 MB</div>
              </div>
              <input type="file" name="echo_file" id="echo-file-<?php echo $tak; ?>" accept=".pdf" required
                     style="display:none;"
                     onchange="updateEchoDropzone('<?php echo $tak; ?>',this)">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:12px;align-items:end;margin-top:14px;">
              <div><label class="form-label">Maand</label>
                <select name="echo_month" class="form-control">
                  <?php for($m=1;$m<=12;$m++): ?><option value="<?php echo $m; ?>"<?php echo $m===$nm?' selected':''; ?>><?php echo $months_nl[$m]; ?></option><?php endfor; ?>
                </select></div>
              <div><label class="form-label">Jaar</label>
                <input type="number" name="echo_year" value="<?php echo $ny; ?>" class="form-control" min="2020" max="2035"></div>
              <button type="submit" class="btn btn-secondary" style="padding:11px 20px;font-size:.9rem;white-space:nowrap;">
                <i class="fa-solid fa-upload"></i> Uploaden
              </button>
            </div>
          </form>

          </div><!-- /.tak-pane echos -->

          <?php if ($portal_role === 'groepsleiding'): ?>
          <!-- ─── KALENDER (enkel groepsleiding) ─── -->
          <div id="tak-<?php echo $tak; ?>-kalender" class="tak-pane">
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
                    data-confirm="Evenement verwijderen?" data-confirm-danger>✕</button>
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
          </div><!-- /.tak-pane kalender -->
          <?php endif; /* /groepsleiding kalender */ ?>

        </div><!-- /.portaal-card -->
      </div><!-- /.kind-panel -->
      <?php endforeach; /* /leiding_takken */ ?>

      <?php if ($portal_role === 'groepsleiding'): ?>
      <div class="kind-panel" data-kind="tak-groepsleiding" style="--kleur:#1A3D2A;">
        <div class="portaal-card">
          <div class="portaal-lid-head">
            <div class="portaal-lid-avatar" style="border-radius:12px;">G</div>
            <div>
              <div class="portaal-lid-naam">Groepsleiding</div>
              <div class="portaal-lid-meta"><?php echo count($gl_orders); ?> bestelling(en) · <?php echo $gl_msg_unread; ?> ongelezen</div>
            </div>
          </div>

          <!-- Sub-tabs -->
          <div style="display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap;">
            <button class="gl-tab-btn active" data-gltab="orders" onclick="glTab('orders',this)">
              🛍️ Bestellingen <?php if ($gl_orders): ?><span style="background:var(--color-accent);color:#fff;border-radius:20px;padding:1px 7px;font-size:.7rem;margin-left:3px;"><?php echo count($gl_orders); ?></span><?php endif; ?>
            </button>
            <button class="gl-tab-btn" data-gltab="messages" onclick="glTab('messages',this)">
              ✉️ Berichten <?php if ($gl_msg_unread): ?><span style="background:var(--color-error);color:#fff;border-radius:20px;padding:1px 7px;font-size:.7rem;margin-left:3px;"><?php echo $gl_msg_unread; ?></span><?php endif; ?>
            </button>
            <button class="gl-tab-btn" data-gltab="settings" onclick="glTab('settings',this)">🌐 Instellingen</button>
          </div>

          <!-- ─── BESTELLINGEN ─── -->
          <div id="gl-orders" class="gl-pane active">
            <?php if (empty($gl_orders)): ?>
              <div class="portaal-empty">Nog geen bestellingen.</div>
            <?php else: ?>
            <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:.85rem;">
              <thead><tr style="text-align:left;border-bottom:2px solid var(--color-border);">
                <th style="padding:8px;">Datum</th><th style="padding:8px;">Klant</th>
                <th style="padding:8px;">Items</th><th style="padding:8px;">Totaal</th>
                <th style="padding:8px;">Status</th><th style="padding:8px;">Actie</th>
              </tr></thead>
              <tbody>
              <?php foreach ($gl_orders as $o):
                $st = $o['status'] ?? 'pending';
                [$stl,$stk] = $status_labels[$st] ?? [ucfirst($st),'#888'];
                $items = implode(', ', array_map(fn($it)=>($it['quantity']??1).'× '.($it['name']??''), $o['items']??[])); ?>
              <tr style="border-bottom:1px solid var(--color-border);">
                <td style="padding:8px;white-space:nowrap;"><?php echo date('j/n/y',strtotime($o['date']??'now')); ?></td>
                <td style="padding:8px;"><?php echo htmlspecialchars($o['customer_name'] ?? $o['child_name'] ?? '—'); ?><br>
                    <span style="font-size:.75rem;color:var(--color-text-muted);"><?php echo htmlspecialchars($o['email']??''); ?></span></td>
                <td style="padding:8px;max-width:200px;"><?php echo htmlspecialchars($items); ?></td>
                <td style="padding:8px;white-space:nowrap;">€<?php echo number_format((float)($o['total']??0),2,',','.'); ?></td>
                <td style="padding:8px;"><span style="background:<?php echo $stk; ?>;color:#fff;padding:2px 9px;border-radius:20px;font-size:.72rem;font-weight:700;white-space:nowrap;"><?php echo htmlspecialchars($stl); ?></span></td>
                <td style="padding:8px;">
                  <div style="display:flex;gap:4px;align-items:center;">
                    <form method="post" style="margin:0;">
                      <input type="hidden" name="actie" value="order_status">
                      <input type="hidden" name="order_id" value="<?php echo htmlspecialchars($o['id']??''); ?>">
                      <select name="status" onchange="this.form.submit()" style="font-size:.75rem;padding:3px 6px;border:1px solid var(--color-border);border-radius:6px;">
                        <?php foreach (['pending'=>'Wachtend','waiting_approval'=>'Gemeld','paid'=>'Betaald','completed'=>'Geleverd','cancelled'=>'Geannuleerd'] as $sv=>$sl): ?>
                          <option value="<?php echo $sv; ?>"<?php echo $st===$sv?' selected':''; ?>><?php echo $sl; ?></option>
                        <?php endforeach; ?>
                      </select>
                    </form>
                    <form method="post" style="margin:0;">
                      <input type="hidden" name="actie" value="order_delete">
                      <input type="hidden" name="order_id" value="<?php echo htmlspecialchars($o['id']??''); ?>">
                      <button type="submit" style="background:none;border:none;color:var(--color-error);cursor:pointer;font-size:.9rem;"
                          data-confirm="Bestelling verwijderen?" data-confirm-danger>✕</button>
                    </form>
                  </div>
                </td>
              </tr>
              <?php endforeach; ?>
              </tbody>
            </table>
            </div>
            <?php endif; ?>
          </div>

          <!-- ─── BERICHTEN ─── -->
          <div id="gl-messages" class="gl-pane">
            <?php if (empty($gl_messages)): ?>
              <div class="portaal-empty">Nog geen berichten.</div>
            <?php else: foreach ($gl_messages as $m): ?>
            <div style="padding:14px;border:1px solid var(--color-border);border-radius:12px;margin-bottom:10px;
                <?php echo empty($m['read'])?'background:color-mix(in srgb,var(--color-accent) 5%,transparent);border-left:4px solid var(--color-accent);':'background:#fff;'; ?>">
              <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div>
                  <strong style="color:var(--color-primary);"><?php echo htmlspecialchars($m['name']??$m['subject']??'Bericht'); ?></strong>
                  <?php if (empty($m['read'])): ?><span style="background:var(--color-accent);color:#fff;font-size:.65rem;padding:1px 7px;border-radius:20px;margin-left:6px;">NIEUW</span><?php endif; ?>
                  <div style="font-size:.78rem;color:var(--color-text-muted);">
                    <a href="mailto:<?php echo htmlspecialchars($m['email']??''); ?>" style="color:var(--color-accent);"><?php echo htmlspecialchars($m['email']??''); ?></a>
                    · <?php echo date('j/n/Y',strtotime($m['date']??'now')); ?>
                    <?php if($m['subject']??''): ?> · <?php echo htmlspecialchars($m['subject']); ?><?php endif; ?>
                  </div>
                </div>
                <div style="display:flex;gap:5px;flex-shrink:0;">
                  <?php if (empty($m['read'])): ?>
                  <form method="post" style="margin:0;">
                    <input type="hidden" name="actie" value="message_read">
                    <input type="hidden" name="message_id" value="<?php echo htmlspecialchars($m['id']??''); ?>">
                    <button type="submit" style="background:none;border:1.5px solid var(--color-success);color:var(--color-success);padding:3px 9px;border-radius:7px;font-size:.72rem;cursor:pointer;">✓ Gelezen</button>
                  </form>
                  <?php endif; ?>
                  <form method="post" style="margin:0;">
                    <input type="hidden" name="actie" value="message_delete">
                    <input type="hidden" name="message_id" value="<?php echo htmlspecialchars($m['id']??''); ?>">
                    <button type="submit" style="background:none;border:1.5px solid var(--color-error);color:var(--color-error);padding:3px 9px;border-radius:7px;font-size:.72rem;cursor:pointer;"
                        data-confirm="Bericht verwijderen?" data-confirm-danger>✕</button>
                  </form>
                </div>
              </div>
              <p style="font-size:.88rem;margin-top:8px;line-height:1.5;color:var(--color-text-dark);"><?php echo nl2br(htmlspecialchars($m['message']??'')); ?></p>
            </div>
            <?php endforeach; endif; ?>
          </div>

          <!-- ─── INSTELLINGEN ─── -->
          <div id="gl-settings" class="gl-pane">
            <form method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
              <input type="hidden" name="actie" value="save_settings">
              <div style="grid-column:1/-1;font-weight:700;color:var(--color-primary);font-size:.95rem;">Algemeen</div>
              <div><label class="form-label" style="font-size:.78rem;">Scoutsjaar</label>
                <input type="text" name="scouts_year" class="form-control" style="font-size:.88rem;padding:8px 11px;" value="<?php echo htmlspecialchars($gl_settings['scouts_year']??''); ?>"></div>
              <div><label class="form-label" style="font-size:.78rem;">Contact e-mail</label>
                <input type="email" name="contact_email" class="form-control" style="font-size:.88rem;padding:8px 11px;" value="<?php echo htmlspecialchars($gl_settings['contact_email']??''); ?>"></div>
              <div><label class="form-label" style="font-size:.78rem;">Telefoon</label>
                <input type="text" name="contact_phone" class="form-control" style="font-size:.88rem;padding:8px 11px;" value="<?php echo htmlspecialchars($gl_settings['contact_phone']??''); ?>"></div>
              <div><label class="form-label" style="font-size:.78rem;">Adres</label>
                <input type="text" name="contact_address" class="form-control" style="font-size:.88rem;padding:8px 11px;" value="<?php echo htmlspecialchars($gl_settings['contact_address']??''); ?>"></div>
              <div style="grid-column:1/-1;font-weight:700;color:var(--color-primary);font-size:.95rem;margin-top:8px;">Bankgegevens</div>
              <div><label class="form-label" style="font-size:.78rem;">IBAN</label>
                <input type="text" name="bank_iban" class="form-control" style="font-size:.88rem;padding:8px 11px;" value="<?php echo htmlspecialchars($gl_settings['bank_iban']??''); ?>"></div>
              <div><label class="form-label" style="font-size:.78rem;">BIC</label>
                <input type="text" name="bank_bic" class="form-control" style="font-size:.88rem;padding:8px 11px;" value="<?php echo htmlspecialchars($gl_settings['bank_bic']??''); ?>"></div>
              <div style="grid-column:1/-1"><label class="form-label" style="font-size:.78rem;">Rekeninghouder</label>
                <input type="text" name="bank_holder" class="form-control" style="font-size:.88rem;padding:8px 11px;" value="<?php echo htmlspecialchars($gl_settings['bank_holder']??''); ?>"></div>
              <div style="grid-column:1/-1;font-weight:700;color:var(--color-primary);font-size:.95rem;margin-top:8px;">Aankondigingsbalk</div>
              <div style="grid-column:1/-1"><label class="form-label" style="font-size:.78rem;">Bericht</label>
                <textarea name="alert_message" rows="2" class="form-control" style="font-size:.88rem;padding:8px 11px;"><?php echo htmlspecialchars($gl_settings['alert_message']??''); ?></textarea></div>
              <div style="grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
                <label style="display:flex;align-items:center;gap:8px;font-size:.88rem;">
                  <input type="checkbox" name="alert_active" value="1"<?php echo !empty($gl_settings['alert_active'])?' checked':''; ?>> Balk tonen op de site</label>
                <button type="submit" class="btn btn-secondary" style="padding:10px 24px;font-size:.9rem;">Opslaan</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <?php endif; ?>

      </div><!-- /.portaal-main -->

      <!-- Kolom 3: rechterkolom leiding — switcht mee met tabblad -->
      <aside class="portaal-side">
        <?php
        $alle_echos = [];
        foreach ($leiding_takken as $lt) {
            foreach ($echos_by_tak[$lt] ?? [] as $e) { $e['_tak'] = $lt; $alle_echos[] = $e; }
        }
        usort($alle_echos, fn($a,$b) => (((int)$b['year']*100)+(int)$b['month'])-(((int)$a['year']*100)+(int)$a['month']));
        ?>

        <!-- Paneel: Snelle acties — één per tak -->
        <?php foreach ($leiding_takken as $si => $lt):
          $lt_kampen = kampen_voor_tak_leiding($lt);
          usort($lt_kampen, fn($a,$b) => strcmp($a['datum_van']??'',$b['datum_van']??''));
          $tak_namen_s = ['kapoenen'=>'Kapoenen','welpen'=>'Welpen','jonggivers'=>'Jonggivers','givers'=>'Givers'];
        ?>
        <div class="side-pane portaal-shop-card" data-side="kampen-<?php echo $lt; ?>" <?php echo $si > 0 ? 'style="display:none"' : ''; ?>>
          <div class="portaal-shop-head">⚡ Snelle acties</div>
          <p style="font-size:.84rem;color:var(--color-text-muted);margin-bottom:12px;">CSV-export voor <?php echo htmlspecialchars($tak_namen_s[$lt]??ucfirst($lt)); ?>.</p>
          <?php if (empty($lt_kampen)): ?>
            <p style="font-size:.82rem;color:var(--color-text-muted);">Nog geen kampen aangemaakt.</p>
          <?php else: ?>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <?php foreach ($lt_kampen as $k): ?>
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
        <?php endforeach; ?>

        <!-- Paneel: Echo archief -->
        <div class="side-pane portaal-shop-card" data-side="echos" style="display:none;padding:0;overflow:hidden;">
          <div style="padding:16px 18px 12px;border-bottom:1px solid var(--color-border);display:flex;align-items:center;justify-content:space-between;">
            <span style="font-family:'Outfit',sans-serif;font-weight:700;font-size:.95rem;color:var(--color-primary);">📰 Kriko Echo archief</span>
            <span style="font-size:.75rem;color:var(--color-text-muted);"><?php echo count($alle_echos); ?> totaal</span>
          </div>
          <?php if (empty($alle_echos)): ?>
            <p style="font-size:.82rem;color:var(--color-text-muted);padding:16px 18px;">Nog geen echo's geüpload.</p>
          <?php else: ?>
          <div style="display:flex;flex-direction:column;max-height:460px;overflow-y:auto;">
            <?php foreach ($alle_echos as $e):
              $ek     = $e['_tak'];
              $ekl    = $tak_kleur[$ek] ?? 'var(--color-accent)';
              $elabel = ($months_nl[(int)($e['month']??0)]??'').' '.($e['year']??'');
              $eid    = $e['id'] ?? ''; ?>
            <div style="border-bottom:1px solid var(--color-border);">
              <!-- Row -->
              <div style="display:flex;align-items:center;gap:10px;padding:10px 18px;">
                <span style="width:8px;height:8px;border-radius:50%;background:<?php echo $ekl; ?>;flex-shrink:0;"></span>
                <span style="flex:1;min-width:0;">
                  <span style="display:block;font-size:.85rem;font-weight:700;color:var(--color-primary-dark);"><?php echo htmlspecialchars($elabel); ?></span>
                  <span style="font-size:.72rem;color:var(--color-text-muted);text-transform:capitalize;"><?php echo $ek; ?></span>
                </span>
                <a href="uploads/echos/<?php echo urlencode($e['file_name']??''); ?>" target="_blank" rel="noopener"
                   style="color:var(--color-accent);font-size:.72rem;flex-shrink:0;" title="Openen">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
                <button type="button" title="Vervangen"
                  onclick="this.closest('div').nextElementSibling.style.display=this.closest('div').nextElementSibling.style.display==='none'?'block':'none'"
                  style="background:none;border:none;cursor:pointer;color:var(--color-text-muted);font-size:.78rem;padding:2px 4px;" >
                  <i class="fa-solid fa-pen"></i>
                </button>
                <form method="post" style="margin:0;" data-confirm="Echo verwijderen?" data-confirm-danger>
                  <input type="hidden" name="actie" value="verwijder_echo">
                  <input type="hidden" name="echo_id" value="<?php echo htmlspecialchars($eid); ?>">
                  <button type="submit" style="background:none;border:none;cursor:pointer;color:var(--color-error);font-size:.78rem;padding:2px 4px;">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </form>
              </div>
              <!-- Replace form (hidden) -->
              <div style="display:none;padding:8px 18px 12px;">
                <form method="post" enctype="multipart/form-data" style="display:flex;gap:8px;align-items:center;">
                  <input type="hidden" name="actie" value="vervang_echo">
                  <input type="hidden" name="echo_id" value="<?php echo htmlspecialchars($eid); ?>">
                  <input type="file" name="echo_file" accept=".pdf" required style="font-size:.75rem;flex:1;min-width:0;">
                  <button type="submit" class="btn btn-secondary" style="padding:5px 12px;font-size:.78rem;white-space:nowrap;">
                    <i class="fa-solid fa-upload"></i> Vervangen
                  </button>
                </form>
              </div>
            </div>
            <?php endforeach; ?>
          </div>
          <?php endif; ?>
        </div>
      </aside>
    </div><!-- /.portaal-grid -->

    <style>
      .gl-tab-btn { padding:9px 16px; border:1.5px solid var(--color-border); background:#fff;
        border-radius:10px; font-family:'Outfit',sans-serif; font-weight:600; font-size:.88rem;
        color:var(--color-text-muted); cursor:pointer; transition:all .15s; }
      .gl-tab-btn.active { background:var(--color-primary); color:#fff; border-color:var(--color-primary); }
      .gl-pane { display:none; }
      .gl-pane.active { display:block; }
      .tak-pane { display:none; }
      .tak-pane.active { display:block; }
      .kamp-modal-backdrop {
        display:none; position:fixed; inset:0; z-index:900;
        background:rgba(0,0,0,.45); backdrop-filter:blur(3px);
        align-items:center; justify-content:center; padding:20px;
      }
      .kamp-modal-backdrop.open { display:flex; }
      .kamp-modal-box {
        background:#fff; border-radius:20px; padding:28px 32px;
        width:100%; max-width:620px; max-height:90vh; overflow-y:auto;
        box-shadow:0 24px 60px rgba(0,0,0,.25);
        animation:modalIn .2s ease;
      }
      @keyframes modalIn { from{opacity:0;transform:scale(.96) translateY(12px)} to{opacity:1;transform:none} }
      .file-pick-zone {
        display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px;
        border:2px dashed var(--color-border); border-radius:12px; padding:18px 16px;
        background:var(--color-bg-linen); cursor:pointer; transition:border-color .15s,background .15s;
        text-align:center; user-select:none;
      }
      .file-pick-zone:hover, .file-pick-zone.drag-over {
        border-color:var(--color-accent);
        background:color-mix(in srgb,var(--color-accent) 5%,white);
      }
      .file-pick-zone.has-file {
        border-color:var(--color-success); background:color-mix(in srgb,var(--color-success) 6%,white);
      }
    </style>
    <script>
      function glTab(tab, btn) {
        btn.closest('.portaal-card').querySelectorAll('.gl-tab-btn').forEach(b => b.classList.remove('active'));
        btn.closest('.portaal-card').querySelectorAll('.gl-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('gl-' + tab).classList.add('active');
      }
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') document.querySelectorAll('.kamp-modal-backdrop.open').forEach(m => m.classList.remove('open'));
      });
      function handleFilePick(inputId, file) {
        if (!file) return;
        const input = document.getElementById(inputId);
        if (input && input.files !== undefined) {
          // for drag-drop: create DataTransfer to assign file
          try { const dt = new DataTransfer(); dt.items.add(file); input.files = dt.files; } catch(e) {}
        }
        const label = document.getElementById(inputId + '-label');
        const zone  = input ? input.closest('.file-pick-zone') : null;
        if (label) label.textContent = file.name;
        if (zone)  zone.classList.add('has-file');
      }
      function switchSidePane(pane) {
        document.querySelectorAll('.side-pane').forEach(p => p.style.display = 'none');
        const sp = document.querySelector('.side-pane[data-side="' + pane + '"]');
        if (sp) sp.style.display = 'block';
      }
      function takTab(tab, tak, btn) {
        btn.closest('.portaal-card').querySelectorAll('.gl-tab-btn').forEach(b => b.classList.remove('active'));
        btn.closest('.portaal-card').querySelectorAll('.tak-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tak-' + tak + '-' + tab).classList.add('active');
        switchSidePane(tab === 'echos' ? 'echos' : 'kampen-' + tak);
      }
      // Switch right panel to the active tak's kampen pane when switching tak chip
      document.querySelectorAll('.kind-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const tak = (chip.dataset.kind || '').replace('tak-', '');
          switchSidePane('kampen-' + tak);
        });
      });
      function updateEchoDropzone(tak, input) {
        const file = input.files[0];
        if (!file) return;
        const icon  = document.getElementById('echo-drop-icon-' + tak);
        const label = document.getElementById('echo-drop-label-' + tak);
        icon.innerHTML  = '<i class="fa-solid fa-circle-check" style="color:var(--color-success);"></i>';
        label.textContent = file.name;
        label.style.color = 'var(--color-success)';
      }
      function handleEchoDrop(e, tak) {
        const dt = e.dataTransfer;
        if (!dt.files.length) return;
        const input = document.getElementById('echo-file-' + tak);
        input.files = dt.files;
        updateEchoDropzone(tak, input);
      }
    </script>

  <?php endif; /* /role switch */ ?>
  </div><!-- /.portaal-wrap -->
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

<!-- ── Kriko bevestigings-modal (vervangt browser confirm()) ── -->
<div id="kriko-confirm-modal" style="display:none;position:fixed;inset:0;z-index:9500;
     background:rgba(15,30,20,.52);backdrop-filter:blur(4px);
     align-items:center;justify-content:center;padding:20px;"
     onclick="if(event.target===this)krikoConfirmCancel()">
  <div style="background:#fff;border-radius:18px;max-width:360px;width:100%;
       box-shadow:0 20px 50px rgba(26,61,42,.24);overflow:hidden;
       animation:modalIn .18s ease;">
    <div style="padding:26px 24px 12px;">
      <p id="kriko-confirm-msg" style="font-family:'Outfit',sans-serif;font-size:1rem;
         font-weight:600;color:var(--color-primary-dark);margin:0;line-height:1.55;"></p>
    </div>
    <div style="padding:12px 24px 22px;display:flex;gap:10px;justify-content:flex-end;">
      <button id="kriko-confirm-cancel-btn"
          style="padding:9px 20px;border-radius:10px;border:1.5px solid var(--color-border);
                 background:#fff;color:var(--color-text-muted);font-family:'Outfit',sans-serif;
                 font-weight:600;font-size:.9rem;cursor:pointer;transition:background .12s;">
        Annuleren</button>
      <button id="kriko-confirm-ok-btn"
          style="padding:9px 22px;border-radius:10px;border:none;
                 background:var(--color-primary);color:#fff;font-family:'Outfit',sans-serif;
                 font-weight:700;font-size:.9rem;cursor:pointer;transition:background .12s;">
        Bevestigen</button>
    </div>
  </div>
</div>
<script>
(function() {
  var modal   = document.getElementById('kriko-confirm-modal');
  var msgEl   = document.getElementById('kriko-confirm-msg');
  var okBtn   = document.getElementById('kriko-confirm-ok-btn');
  var cxBtn   = document.getElementById('kriko-confirm-cancel-btn');
  var _cb     = null;

  function show(msg, cb, danger) {
    msgEl.textContent = msg;
    okBtn.style.background = danger ? 'var(--color-error)' : 'var(--color-primary)';
    modal.style.display = 'flex';
    _cb = cb;
    setTimeout(function(){ okBtn.focus(); }, 50);
  }
  window.krikoConfirmCancel = function() { modal.style.display = 'none'; _cb = null; };

  okBtn.addEventListener('click', function() {
    modal.style.display = 'none';
    var cb = _cb; _cb = null;
    if (cb) cb();
  });
  cxBtn.addEventListener('click', window.krikoConfirmCancel);

  document.addEventListener('keydown', function(e) {
    if (modal.style.display !== 'flex') return;
    if (e.key === 'Escape') { e.preventDefault(); window.krikoConfirmCancel(); }
    if (e.key === 'Enter')  { e.preventDefault(); okBtn.click(); }
  });

  // Intercept clicks on elements with data-confirm
  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-confirm]');
    if (!el || el.tagName === 'FORM') return;
    var msg    = el.getAttribute('data-confirm');
    var danger = el.hasAttribute('data-confirm-danger');
    e.preventDefault();
    e.stopImmediatePropagation();
    show(msg, function() {
      el.removeAttribute('data-confirm');
      el.click();
    }, danger);
  }, true);

  // Intercept form submits with data-confirm
  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (!form.hasAttribute('data-confirm')) return;
    var msg    = form.getAttribute('data-confirm');
    var danger = form.hasAttribute('data-confirm-danger');
    e.preventDefault();
    show(msg, function() {
      form.removeAttribute('data-confirm');
      form.submit();
    }, danger);
  }, true);
})();
</script>
