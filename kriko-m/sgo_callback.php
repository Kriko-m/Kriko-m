<?php
/**
 * OAuth2 callback — Scouts & Gidsen Vlaanderen Keycloak
 * S&G stuurt de gebruiker hier naartoe na inloggen.
 */

if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/sgo_config.php';

// S&G meldde een fout
if (isset($_GET['error'])) {
    $msg = urlencode($_GET['error_description'] ?? $_GET['error'] ?? 'Onbekende fout bij S&G login');
    header('Location: ouderportaal.php?sgo_error=' . $msg);
    exit;
}

// State-validatie (CSRF bescherming)
if (
    !isset($_GET['state'], $_SESSION['sgo_state']) ||
    !hash_equals($_SESSION['sgo_state'], $_GET['state'])
) {
    header('Location: ouderportaal.php?sgo_error=' . urlencode('Ongeldige login-poging (state mismatch).'));
    exit;
}
unset($_SESSION['sgo_state']);

$code = $_GET['code'] ?? '';
if (empty($code)) {
    header('Location: ouderportaal.php?sgo_error=' . urlencode('Geen autorisatiecode ontvangen.'));
    exit;
}

// Wissel code in voor access token
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

// Haal gebruikersinfo op
$userinfo = sgo_http_get(SGO_USERINFO_URL, $access_token);

// Zet sessie
$_SESSION['sgo_logged_in']    = true;
$_SESSION['sgo_access_token'] = $access_token;
$_SESSION['sgo_id']           = $userinfo['sub'] ?? '';
$_SESSION['sgo_email']        = $userinfo['email'] ?? '';
$_SESSION['sgo_name']         = trim(($userinfo['given_name'] ?? '') . ' ' . ($userinfo['family_name'] ?? ''));

// Unified parent sessie (compatibel met de rest van het portaal)
$_SESSION['parent_logged_in']  = true;
$_SESSION['parent_name']       = $_SESSION['sgo_name'];
$_SESSION['parent_login_type'] = 'sgo';

// Haal kinderen op via groepsadmin API (werkt zodra API-key geconfigureerd is)
$_SESSION['sgo_children'] = sgo_fetch_children($access_token);

header('Location: ouderportaal.php');
exit;
