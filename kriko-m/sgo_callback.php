<?php
/**
 * OAuth2 callback — Scouts & Gidsen Vlaanderen Keycloak
 *
 * Twee flows:
 *   1. Normale login  → state is willekeurige hex → stel leiding-sessie in
 *   2. Kind toevoegen → state begint met 'addkid_{account_id}_' → koppel kind aan ouderaccount
 */
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/sgo_config.php';

/* ── S&G foutmelding ── */
if (isset($_GET['error'])) {
    $msg = urlencode($_GET['error_description'] ?? $_GET['error'] ?? 'Onbekende fout bij S&G login');
    header('Location: ouderportaal.php?sgo_error=' . $msg);
    exit;
}

/* ── State-validatie (CSRF) ── */
if (
    !isset($_GET['state'], $_SESSION['sgo_state']) ||
    !hash_equals($_SESSION['sgo_state'], $_GET['state'])
) {
    header('Location: ouderportaal.php?sgo_error=' . urlencode('Ongeldige login-poging (state mismatch).'));
    exit;
}
$state = $_SESSION['sgo_state'];
unset($_SESSION['sgo_state']);

$code = $_GET['code'] ?? '';
if (empty($code)) {
    header('Location: ouderportaal.php?sgo_error=' . urlencode('Geen autorisatiecode ontvangen.'));
    exit;
}

/* ── Detecteer flow: addkid of normale login ── */
$is_addkid  = str_starts_with($state, 'addkid_');
$account_id = '';
if ($is_addkid) {
    // state = 'addkid_{account_id}_{nonce}'
    $parts      = explode('_', $state, 3);
    $account_id = $parts[1] ?? '';
}

/* ── Dev-modus: mock zonder echte API ── */
if (sgo_dev_mode()) {
    if ($is_addkid && $account_id) {
        require_once __DIR__ . '/includes/ouder_auth.php';
        // Mock: voeg het eerste mock-kind toe
        $mock = sgo_mock_children()[0] ?? [];
        if ($mock) add_kind_to_account($account_id, $mock);
        header('Location: ouderportaal.php?kind_toegevoegd=1');
    } else {
        // Normale demo-login → redirect naar demologin
        header('Location: ouderportaal.php?demologin=1');
    }
    exit;
}

/* ── Wissel code in voor access token ── */
$token_response = sgo_http_post(SGO_TOKEN_URL, [
    'grant_type'    => 'authorization_code',
    'code'          => $code,
    'redirect_uri'  => SGO_REDIRECT_URI,
    'client_id'     => SGO_CLIENT_ID,
    'client_secret' => SGO_CLIENT_SECRET,
]);

if (empty($token_response['access_token'])) {
    header('Location: ouderportaal.php?sgo_error=' . urlencode('Token ophalen mislukt. Probeer opnieuw.'));
    exit;
}

$access_token = $token_response['access_token'];
$userinfo     = sgo_http_get(SGO_USERINFO_URL, $access_token);

/* ════════════════════════════════════════════
   FLOW 1 — Kind toevoegen aan ouderaccount
   ════════════════════════════════════════════ */
if ($is_addkid && $account_id) {
    require_once __DIR__ . '/includes/ouder_auth.php';

    // Haal ledenprofiel op om ga_id en tak te kennen
    $profiel = sgo_http_get(SGO_API_BASE . '/lid/profiel', $access_token);
    $kind    = [
        'ga_id'    => $profiel['id']       ?? ($userinfo['sub'] ?? ''),
        'voornaam' => $profiel['voornaam'] ?? ($userinfo['given_name'] ?? ''),
        'tak'      => strtolower($profiel['afdeling'] ?? ''),
    ];

    if ($kind['ga_id']) {
        add_kind_to_account($account_id, $kind);
        header('Location: ouderportaal.php?kind_toegevoegd=1');
    } else {
        header('Location: ouderportaal.php?sgo_error=' . urlencode('Kon het lid niet ophalen van S&G.'));
    }
    exit;
}

/* ════════════════════════════════════════════
   FLOW 2 — Normale S&G login (leiding/groepsleiding)
   ════════════════════════════════════════════ */
$_SESSION['sgo_logged_in']    = true;
$_SESSION['sgo_access_token'] = $access_token;
$_SESSION['sgo_id']           = $userinfo['sub'] ?? '';
$_SESSION['sgo_email']        = strtolower($userinfo['email'] ?? '');
$_SESSION['sgo_name']         = trim(($userinfo['given_name'] ?? '') . ' ' . ($userinfo['family_name'] ?? ''));

header('Location: ouderportaal.php');
exit;
