<?php
/**
 * Calendar helpers — Scouts Kriko-M
 * Shared logic for the public calendar page and the .ics feed/export.
 *
 * Events are stored in data/calendar.json with this shape:
 *   { id, title, date (Y-m-d), time ("09:45 - 12:30" | ""), description, location }
 */

const CAL_TZ = 'Europe/Brussels';

/**
 * Dutch month abbreviation (1-12).
 */
function cal_month_nl(int $month): string
{
    $months = [1 => 'Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
    return $months[$month] ?? '';
}

/**
 * Dutch weekday name for a DateTime.
 */
function cal_weekday_nl(DateTime $dt): string
{
    $days = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
    // ISO-8601: 1 (Mon) .. 7 (Sun)
    return $days[(int) $dt->format('N') - 1] ?? '';
}

/**
 * Resolve start/end DateTime objects and whether the event is all-day.
 * Returns null if the event has no usable date.
 *
 * @return array{start: DateTime, end: DateTime, all_day: bool}|null
 */
function cal_event_datetimes(array $event): ?array
{
    $tz = new DateTimeZone(CAL_TZ);
    $date = trim((string) ($event['date'] ?? ''));
    if ($date === '') {
        return null;
    }

    $time = trim((string) ($event['time'] ?? ''));
    $start = null;
    $end = null;
    $allDay = true;

    if ($time !== '' && preg_match_all('/(\d{1,2}):(\d{2})/', $time, $m)) {
        $times = $m[0]; // e.g. ["09:45", "12:30"]
        $start = DateTime::createFromFormat('Y-m-d H:i', $date . ' ' . $times[0], $tz);
        if ($start) {
            $allDay = false;
            if (isset($times[1])) {
                $end = DateTime::createFromFormat('Y-m-d H:i', $date . ' ' . $times[1], $tz);
            }
            if (!$end) {
                $end = (clone $start)->modify('+1 hour');
            }
        }
    }

    if (!$start) {
        $start = DateTime::createFromFormat('Y-m-d H:i', $date . ' 00:00', $tz);
        if (!$start) {
            return null;
        }
        $allDay = true;
        $end = (clone $start)->modify('+1 day'); // DTEND is exclusive for all-day events
    }

    return ['start' => $start, 'end' => $end, 'all_day' => $allDay];
}

/**
 * Format a DateTime as an UTC iCalendar timestamp (e.g. 20260906T074500Z).
 */
function cal_ics_utc(DateTime $dt): string
{
    return (clone $dt)->setTimezone(new DateTimeZone('UTC'))->format('Ymd\THis\Z');
}

/**
 * Escape a value for inclusion in an iCalendar text property.
 */
function cal_ics_escape(string $value): string
{
    return str_replace(
        ['\\', ';', ',', "\r\n", "\n", "\r"],
        ['\\\\', '\\;', '\\,', '\\n', '\\n', '\\n'],
        $value
    );
}

/**
 * Build a full iCalendar (VCALENDAR) document from a list of events.
 */
function cal_build_ics(array $events, string $calName = 'Scouts Kriko-M'): string
{
    $now = (new DateTime('now', new DateTimeZone('UTC')))->format('Ymd\THis\Z');

    $lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Scouts Kriko-M//Kalender//NL',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:' . cal_ics_escape($calName),
        'X-WR-TIMEZONE:' . CAL_TZ,
    ];

    foreach ($events as $event) {
        $dt = cal_event_datetimes($event);
        if (!$dt) {
            continue;
        }

        $uid = ($event['id'] ?? uniqid('cal_', true)) . '@kriko-m.be';

        $lines[] = 'BEGIN:VEVENT';
        $lines[] = 'UID:' . cal_ics_escape((string) $uid);
        $lines[] = 'DTSTAMP:' . $now;

        if ($dt['all_day']) {
            $lines[] = 'DTSTART;VALUE=DATE:' . $dt['start']->format('Ymd');
            $lines[] = 'DTEND;VALUE=DATE:' . $dt['end']->format('Ymd');
        } else {
            $lines[] = 'DTSTART:' . cal_ics_utc($dt['start']);
            $lines[] = 'DTEND:' . cal_ics_utc($dt['end']);
        }

        $lines[] = 'SUMMARY:' . cal_ics_escape((string) ($event['title'] ?? 'Activiteit'));
        if (!empty($event['description'])) {
            $lines[] = 'DESCRIPTION:' . cal_ics_escape((string) $event['description']);
        }
        if (!empty($event['location'])) {
            $lines[] = 'LOCATION:' . cal_ics_escape((string) $event['location']);
        }
        $lines[] = 'END:VEVENT';
    }

    $lines[] = 'END:VCALENDAR';

    return implode("\r\n", $lines) . "\r\n";
}

/**
 * Build an "Add to Google Calendar" template URL for a single event.
 */
function cal_google_url(array $event): string
{
    $dt = cal_event_datetimes($event);
    if (!$dt) {
        return '#';
    }

    if ($dt['all_day']) {
        $dates = $dt['start']->format('Ymd') . '/' . $dt['end']->format('Ymd');
    } else {
        $dates = cal_ics_utc($dt['start']) . '/' . cal_ics_utc($dt['end']);
    }

    $params = [
        'action'   => 'TEMPLATE',
        'text'     => (string) ($event['title'] ?? 'Activiteit'),
        'dates'    => $dates,
        'details'  => (string) ($event['description'] ?? ''),
        'location' => (string) ($event['location'] ?? ''),
    ];

    return 'https://calendar.google.com/calendar/render?' . http_build_query($params);
}

/**
 * Absolute URL (http/https) to the .ics feed/export endpoint, optional single event id.
 */
function cal_ics_feed_url(?string $eventId = null): string
{
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $dir = rtrim(str_replace('\\', '/', dirname($_SERVER['PHP_SELF'] ?? '/')), '/');
    $url = $scheme . '://' . $host . $dir . '/kalender-ics.php';
    if ($eventId !== null && $eventId !== '') {
        $url .= '?id=' . rawurlencode($eventId);
    }
    return $url;
}
