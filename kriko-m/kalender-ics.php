<?php
/**
 * iCalendar feed / export endpoint — Scouts Kriko-M
 *
 *   kalender-ics.php            → full calendar (download / webcal subscription)
 *   kalender-ics.php?id=cal_1   → single event (.ics)
 *
 * Served with the text/calendar content type so calendar apps recognise it.
 */

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/calendar_helpers.php';

$events = read_db('calendar');
if (!is_array($events)) {
    $events = [];
}

$single = isset($_GET['id']) ? trim((string) $_GET['id']) : '';
if ($single !== '') {
    $events = array_values(array_filter($events, static function ($e) use ($single) {
        return ($e['id'] ?? '') === $single;
    }));
}

// Sort chronologically
usort($events, static function ($a, $b) {
    return strcmp((string) ($a['date'] ?? ''), (string) ($b['date'] ?? ''));
});

$ics = cal_build_ics($events);

$filename = $single !== ''
    ? 'kriko-m-' . preg_replace('/[^A-Za-z0-9_-]/', '', $single) . '.ics'
    : 'kriko-m-kalender.ics';

header('Content-Type: text/calendar; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-cache, must-revalidate');

echo $ics;
