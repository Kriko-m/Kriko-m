<?php
/**
 * Scouts & Gidsen Vlaanderen — OAuth2 / Keycloak configuratie
 *
 * API-key aanvragen via:
 * https://www.scoutsengidsenvlaanderen.be/leiding/ondersteuning/groepsleiding/website-en-it/groepsadministratie/aanvraag-api-key-voor-de-groepsadministratie
 *
 * Vul SGO_CLIENT_ID en SGO_CLIENT_SECRET in zodra je de key ontvangen hebt.
 */

define('SGO_CLIENT_ID',     'PLACEHOLDER_CLIENT_ID');
define('SGO_CLIENT_SECRET', 'PLACEHOLDER_CLIENT_SECRET');

// Productie-URL — pas aan zodra je domein bekend is
define('SGO_PROD_URL', 'https://kriko-m.be');

// Redirect URL: automatisch dev of productie
$_sgo_host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$_sgo_is_local = in_array($_sgo_host, ['localhost', '127.0.0.1']) || str_starts_with($_sgo_host, 'localhost:');
$_sgo_base = $_sgo_is_local
    ? (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_sgo_host
    : SGO_PROD_URL;
define('SGO_REDIRECT_URI', $_sgo_base . '/sgo_callback.php');

// Keycloak endpoints (live, niet aanpassen)
define('SGO_AUTH_URL',     'https://login.scoutsengidsenvlaanderen.be/realms/scouts/protocol/openid-connect/auth');
define('SGO_TOKEN_URL',    'https://login.scoutsengidsenvlaanderen.be/realms/scouts/protocol/openid-connect/token');
define('SGO_USERINFO_URL', 'https://login.scoutsengidsenvlaanderen.be/realms/scouts/protocol/openid-connect/userinfo');
define('SGO_LOGOUT_URL',   'https://login.scoutsengidsenvlaanderen.be/realms/scouts/protocol/openid-connect/logout');
define('SGO_API_BASE',     'https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/rest-ga');

define('SGO_GROEP_NUMMER', 'O3108G');

/**
 * DEV-MOCK: zolang de echte API-key niet ingevuld is, draaien we in
 * "demo-modus" zodat de volledige flow (login → kinderen → inschrijven →
 * paklijst → leiding-export) lokaal getest kan worden zonder S&G.
 * Zet de echte CLIENT_ID/SECRET in en deze modus schakelt vanzelf uit.
 */
function sgo_dev_mode(): bool {
    return SGO_CLIENT_ID === 'PLACEHOLDER_CLIENT_ID';
}

/** Is de API-key al geconfigureerd? */
function sgo_is_configured(): bool {
    return SGO_CLIENT_ID !== 'PLACEHOLDER_CLIENT_ID';
}

/* ── DEV-MOCK data (enkel actief in demo-modus) ──────────── */

function sgo_mock_children(): array {
    return [
        ['id' => 'GA-1001', 'voornaam' => 'Lotte',  'achternaam' => 'Peeters', 'tak' => 'kapoenen', 'geboortedatum' => '2019-03-12', 'ga_id' => 'GA-1001'],
        ['id' => 'GA-1002', 'voornaam' => 'Mil',    'achternaam' => 'Peeters', 'tak' => 'jonggivers', 'geboortedatum' => '2013-08-04', 'ga_id' => 'GA-1002'],
    ];
}

/** Mock-profiel + (live op te halen) medische fiche per lid. */
function sgo_mock_member(string $ga_id): array {
    $db = [
        'GA-1001' => ['voornaam' => 'Lotte', 'achternaam' => 'Peeters', 'tak' => 'kapoenen',   'geboortedatum' => '2019-03-12',
                      'medisch' => ['allergieën' => 'Noten', 'dieet' => '-', 'medicatie' => '-', 'opmerkingen' => 'Mag niet in de volle zon zonder pet.']],
        'GA-1002' => ['voornaam' => 'Mil',   'achternaam' => 'Peeters', 'tak' => 'jonggivers', 'geboortedatum' => '2013-08-04',
                      'medisch' => ['allergieën' => '-', 'dieet' => 'Vegetarisch', 'medicatie' => 'Ventolin (astma)', 'opmerkingen' => '-']],
    ];
    return $db[$ga_id] ?? ['voornaam' => 'Onbekend', 'achternaam' => $ga_id, 'tak' => '', 'geboortedatum' => '',
                           'medisch' => ['allergieën' => '', 'dieet' => '', 'medicatie' => '', 'opmerkingen' => '']];
}

/**
 * Haal het profiel + medische fiche van één lid LIVE op.
 * Wordt enkel gebruikt door de leiding bij het exporteren — nooit lokaal bewaard.
 *
 * @param string $token  Access token van de ingelogde LEIDING.
 * @param string $ga_id  Lidnummer in de groepsadmin.
 */
function sgo_fetch_member(string $token, string $ga_id): array {
    if (sgo_dev_mode()) {
        return sgo_mock_member($ga_id);
    }
    // Live: profiel + individuele steekkaart (medische fiche) ophalen.
    $lid  = sgo_http_get(SGO_API_BASE . '/lid/' . urlencode($ga_id), $token);
    $kaart = sgo_http_get(SGO_API_BASE . '/lid/' . urlencode($ga_id) . '/steekkaart', $token);

    $med = $kaart['medische_fiche'] ?? $kaart;
    return [
        'voornaam'      => $lid['voornaam'] ?? '',
        'achternaam'    => $lid['achternaam'] ?? '',
        'tak'           => $lid['afdeling'] ?? '',
        'geboortedatum' => $lid['geboortedatum'] ?? '',
        'medisch' => [
            'allergieën'  => $med['allergieen'] ?? ($med['allergieën'] ?? ''),
            'dieet'       => $med['dieet'] ?? '',
            'medicatie'   => $med['medicatie'] ?? '',
            'opmerkingen' => $med['opmerkingen'] ?? '',
        ],
    ];
}

/**
 * Heeft de ingelogde gebruiker een LEIDINGS-rol in deze groep?
 * In dev-modus: altijd waar (zodat de export testbaar is).
 */
function sgo_is_leiding(string $token = ''): bool {
    if (sgo_dev_mode()) return true;
    if ($token === '') $token = $_SESSION['sgo_access_token'] ?? '';
    if ($token === '') return false;
    $functies = sgo_http_get(SGO_API_BASE . '/lid/profiel', $token);
    // Leidings-/begeleidingsfuncties bevatten doorgaans 'leiding' in de omschrijving.
    $blob = strtolower(json_encode($functies['functies'] ?? $functies));
    return strpos($blob, 'leiding') !== false || strpos($blob, 'begeleid') !== false;
}

/**
 * Bepaal de portal-rol van de ingelogde gebruiker.
 * Returns: 'groepsleiding' | 'leiding' | 'ouder'
 * Gecached in $_SESSION['sgo_portal_role'].
 */
function sgo_get_portal_role(string $token = ''): string {
    if (isset($_SESSION['sgo_portal_role'])) return $_SESSION['sgo_portal_role'];
    if (sgo_dev_mode()) return $_SESSION['sgo_portal_role'] ?? 'ouder';
    if ($token === '') $token = $_SESSION['sgo_access_token'] ?? '';
    if ($token === '') return 'ouder';

    $profiel = sgo_http_get(SGO_API_BASE . '/lid/profiel', $token);
    $blob    = strtolower(json_encode($profiel['functies'] ?? $profiel));

    if (strpos($blob, 'groepsleiding') !== false || strpos($blob, 'groepsverantwoordelijke') !== false) {
        $role = 'groepsleiding';
    } elseif (strpos($blob, 'leiding') !== false || strpos($blob, 'begeleid') !== false) {
        $role = 'leiding';
    } else {
        $role = 'ouder';
    }
    return $_SESSION['sgo_portal_role'] = $role;
}

/**
 * Welke takken leidt deze gebruiker?
 * Returns array van tak-slugs, bv. ['welpen'] of ['kapoenen','welpen'].
 * Gecached in $_SESSION['sgo_leiding_takken'].
 */
function sgo_get_leiding_takken(string $token = ''): array {
    if (isset($_SESSION['sgo_leiding_takken'])) return $_SESSION['sgo_leiding_takken'];
    if (sgo_dev_mode()) return $_SESSION['sgo_leiding_takken'] ?? ['welpen'];
    if ($token === '') $token = $_SESSION['sgo_access_token'] ?? '';

    $profiel  = sgo_http_get(SGO_API_BASE . '/lid/profiel', $token);
    $alle     = ['kapoenen','welpen','jonggivers','givers'];
    $takken   = [];
    foreach ($profiel['functies'] ?? [] as $f) {
        $afd = strtolower($f['afdeling'] ?? '');
        foreach ($alle as $tak) {
            if (strpos($afd, substr($tak, 0, 5)) !== false && !in_array($tak, $takken)) {
                $takken[] = $tak;
            }
        }
    }
    if (sgo_get_portal_role($token) === 'groepsleiding') $takken = $alle;
    return $_SESSION['sgo_leiding_takken'] = ($takken ?: ['welpen']);
}

/** Mock leden per tak (dev-modus). */
function sgo_mock_tak_leden(string $tak): array {
    $db = [
        'welpen'     => [
            ['ga_id'=>'GA-2001','voornaam'=>'Emma', 'achternaam'=>'Claes',    'geboortedatum'=>'2015-03-14',
             'medisch'=>['allergieën'=>'Noten',   'dieet'=>'-','medicatie'=>'-',      'opmerkingen'=>'-']],
            ['ga_id'=>'GA-2002','voornaam'=>'Liam', 'achternaam'=>'Bogaert',  'geboortedatum'=>'2014-09-22',
             'medisch'=>['allergieën'=>'-',        'dieet'=>'Vegetarisch','medicatie'=>'-','opmerkingen'=>'-']],
            ['ga_id'=>'GA-2003','voornaam'=>'Noor', 'achternaam'=>'Jacobs',   'geboortedatum'=>'2015-07-01',
             'medisch'=>['allergieën'=>'-',        'dieet'=>'-','medicatie'=>'Ventolin','opmerkingen'=>'Astma']],
        ],
        'kapoenen'   => [
            ['ga_id'=>'GA-3001','voornaam'=>'Lotte','achternaam'=>'Peeters',  'geboortedatum'=>'2019-03-12',
             'medisch'=>['allergieën'=>'Noten',   'dieet'=>'-','medicatie'=>'-',      'opmerkingen'=>'Geen zon zonder pet']],
            ['ga_id'=>'GA-3002','voornaam'=>'Arne', 'achternaam'=>'De Smet',  'geboortedatum'=>'2018-11-05',
             'medisch'=>['allergieën'=>'-',        'dieet'=>'-','medicatie'=>'-',      'opmerkingen'=>'-']],
        ],
        'jonggivers' => [
            ['ga_id'=>'GA-4001','voornaam'=>'Mil',  'achternaam'=>'Peeters',  'geboortedatum'=>'2013-08-04',
             'medisch'=>['allergieën'=>'-',        'dieet'=>'Vegetarisch','medicatie'=>'Ventolin','opmerkingen'=>'-']],
            ['ga_id'=>'GA-4002','voornaam'=>'Jonas','achternaam'=>'Willems',  'geboortedatum'=>'2012-05-18',
             'medisch'=>['allergieën'=>'-',        'dieet'=>'-','medicatie'=>'-',      'opmerkingen'=>'-']],
        ],
        'givers'     => [
            ['ga_id'=>'GA-5001','voornaam'=>'Tibo', 'achternaam'=>'Aerts',    'geboortedatum'=>'2009-12-03',
             'medisch'=>['allergieën'=>'Pollen',   'dieet'=>'-','medicatie'=>'-',      'opmerkingen'=>'-']],
            ['ga_id'=>'GA-5002','voornaam'=>'Sara', 'achternaam'=>'Van Damme','geboortedatum'=>'2010-04-27',
             'medisch'=>['allergieën'=>'-',        'dieet'=>'Glutenvrij','medicatie'=>'-','opmerkingen'=>'-']],
        ],
    ];
    return $db[$tak] ?? [];
}

/** Haal alle leden van een tak op. */
function sgo_fetch_tak_leden(string $token, string $tak): array {
    if (sgo_dev_mode()) return sgo_mock_tak_leden($tak);
    $raw = sgo_http_get(SGO_API_BASE . '/groep/' . SGO_GROEP_NUMMER . '/leden', $token);
    $result = [];
    foreach ($raw['leden'] ?? [] as $lid) {
        if (strtolower($lid['afdeling'] ?? '') === strtolower($tak)) {
            $result[] = [
                'ga_id'         => $lid['id'] ?? '',
                'voornaam'      => $lid['voornaam'] ?? '',
                'achternaam'    => $lid['achternaam'] ?? '',
                'geboortedatum' => $lid['geboortedatum'] ?? '',
                'medisch'       => [],
            ];
        }
    }
    return $result;
}

/** Genereer de login-URL voor S&G Keycloak */
function sgo_login_url(): string {
    $state = bin2hex(random_bytes(16));
    $_SESSION['sgo_state'] = $state;

    return SGO_AUTH_URL . '?' . http_build_query([
        'client_id'     => SGO_CLIENT_ID,
        'redirect_uri'  => SGO_REDIRECT_URI,
        'response_type' => 'code',
        'scope'         => 'openid profile email',
        'state'         => $state,
    ]);
}

/** POST request helper */
function sgo_http_post(string $url, array $data): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($data),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
        CURLOPT_TIMEOUT        => 10,
    ]);
    $result = curl_exec($ch);
    curl_close($ch);
    return json_decode($result, true) ?? [];
}

/** GET request helper met Bearer token */
function sgo_http_get(string $url, string $token): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $token],
        CURLOPT_TIMEOUT        => 10,
    ]);
    $result = curl_exec($ch);
    curl_close($ch);
    return json_decode($result, true) ?? [];
}

/**
 * Haal kinderen op van deze ouder via de groepsadmin API.
 * Vereist geconfigureerde API-key + geldig access token.
 * Geeft lege array terug indien niet geconfigureerd.
 */
function sgo_fetch_children(string $token): array {
    if (sgo_dev_mode()) return sgo_mock_children();

    // Haal alle leden van de groep op
    $leden = sgo_http_get(SGO_API_BASE . '/groep/' . SGO_GROEP_NUMMER . '/leden', $token);

    // Haal profiel van ingelogde ouder op
    $profiel = sgo_http_get(SGO_API_BASE . '/lid/profiel', $token);
    $ouder_email = strtolower($_SESSION['sgo_email'] ?? '');

    if (empty($leden['leden']) || empty($ouder_email)) return [];

    // Filter leden waarvan één van de contactpersonen dit e-mailadres heeft
    $kinderen = [];
    foreach ($leden['leden'] as $lid) {
        $contacten = $lid['contacten'] ?? [];
        foreach ($contacten as $contact) {
            if (strtolower($contact['email'] ?? '') === $ouder_email) {
                $kinderen[] = [
                    'id'        => $lid['id'] ?? '',
                    'voornaam'  => $lid['voornaam'] ?? '',
                    'achternaam'=> $lid['achternaam'] ?? '',
                    'tak'       => $lid['afdeling'] ?? '',
                    'geboortedatum' => $lid['geboortedatum'] ?? '',
                    'ga_id'     => $lid['id'] ?? '',
                ];
                break;
            }
        }
    }
    return $kinderen;
}
