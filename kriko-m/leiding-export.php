<?php
/**
 * Leiding-export: ledenlijst per kamp als CSV (opent in Google Sheets / Excel).
 *
 * PRIVACY: namen + medische fiche worden LIVE uit de groepsadmin-API gehaald
 * met het S&G-token van de ingelogde leiding, en rechtstreeks naar de browser
 * gestreamd. Niets wordt op de server bewaard.
 *
 * Gebruik:  leiding-export.php?kamp=<kamp_id>
 */
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/sgo_config.php';
require_once __DIR__ . '/includes/kamp_helpers.php';

/* ── Toegangscontrole: enkel ingelogde LEIDING ── */
$token = $_SESSION['sgo_access_token'] ?? '';
$ingelogd = !empty($_SESSION['sgo_logged_in']);

if (!$ingelogd || !sgo_is_leiding($token)) {
    http_response_code(403);
    echo 'Geen toegang. Log in als leiding via Scouts &amp; Gidsen.';
    exit;
}

$kamp_id = $_GET['kamp'] ?? '';
$kamp = get_kamp($kamp_id);
if (!$kamp) {
    http_response_code(404);
    echo 'Kamp niet gevonden.';
    exit;
}

$inschrijvingen = inschrijvingen_voor_kamp($kamp_id);

/* ── CSV-headers (UTF-8 BOM + puntkomma → opent netjes in NL Excel & Google Sheets) ── */
$bestandsnaam = 'ledenlijst-' . preg_replace('/[^a-z0-9\-]/i', '-', $kamp_id) . '-' . date('Y-m-d') . '.csv';
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $bestandsnaam . '"');
header('Cache-Control: no-store');

$out = fopen('php://output', 'w');
fprintf($out, "\xEF\xBB\xBF"); // UTF-8 BOM

// Titelregel
fputcsv($out, ['Ledenlijst — ' . $kamp['naam'] . ' (' . ($kamp['locatie'] ?? '') . ')'], ';');
fputcsv($out, ['Periode', date('d/m/Y', strtotime($kamp['datum_van'])) . ' – ' . date('d/m/Y', strtotime($kamp['datum_tot']))], ';');
fputcsv($out, ['Geëxporteerd op', date('d/m/Y H:i')], ';');
fputcsv($out, [], ';');

// Kolomkoppen
fputcsv($out, [
    '#', 'Voornaam', 'Achternaam', 'Tak', 'Geboortedatum',
    'Allergieën', 'Dieet', 'Medicatie', 'Medische opmerkingen',
    'Opmerking ouder', 'Lidnummer'
], ';');

$nr = 0;
foreach ($inschrijvingen as $ins) {
    $nr++;
    // LIVE ophalen — nooit lokaal bewaard:
    $lid = sgo_fetch_member($token, $ins['ga_id'] ?? '');
    $med = $lid['medisch'] ?? [];
    fputcsv($out, [
        $nr,
        $lid['voornaam'] ?? '',
        $lid['achternaam'] ?? '',
        ucfirst($lid['tak'] ?? ''),
        $lid['geboortedatum'] ?? '',
        $med['allergieën'] ?? '',
        $med['dieet'] ?? '',
        $med['medicatie'] ?? '',
        $med['opmerkingen'] ?? '',
        $ins['opmerking'] ?? '',
        $ins['ga_id'] ?? '',
    ], ';');
}

if ($nr === 0) {
    fputcsv($out, ['(nog geen inschrijvingen voor dit kamp)'], ';');
}

fclose($out);
exit;
