<?php
/**
 * Kalender — publieke agenda met groepsactiviteiten.
 * Scouts Kriko-M Web Platform
 *
 * Toont een maandkalender naast een lijst met aankomende evenementen,
 * met de mogelijkheid om events aan een persoonlijke agenda toe te voegen
 * (per evenement via Google/Apple/Outlook, of via een volledig abonnement).
 */

$page_title = "Kalender";

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/calendar_helpers.php';
$body_class = 'page-kalender';
require_once __DIR__ . '/includes/header.php';

$tz = new DateTimeZone(CAL_TZ);
$today = new DateTime('today', $tz);

// Load + sort group activities chronologically
$events = read_db('calendar');
if (!is_array($events)) {
    $events = [];
}
usort($events, static function ($a, $b) {
    return strcmp((string) ($a['date'] ?? ''), (string) ($b['date'] ?? ''));
});

// Upcoming = today or later
$upcoming = array_values(array_filter($events, static function ($e) use ($today, $tz) {
    $d = DateTime::createFromFormat('Y-m-d', (string) ($e['date'] ?? ''), $tz);
    return $d instanceof DateTime && $d->setTime(0, 0) >= $today;
}));

// Compact event list for the JS month grid
$grid_events = array_map(static function ($e) {
    return [
        'id'    => (string) ($e['id'] ?? ''),
        'date'  => (string) ($e['date'] ?? ''),
        'title' => (string) ($e['title'] ?? ''),
        'time'  => (string) ($e['time'] ?? ''),
    ];
}, $events);

// Calendar subscription / export URLs
$ics_url    = cal_ics_feed_url();
$webcal_url = preg_replace('#^https?://#', 'webcal://', $ics_url);
?>


<div class="page-header">
    <div class="page-header-line"></div>
    <h2 class="page-header-title">Kalender</h2>
    <p class="page-header-sub">Alle groepsactiviteiten van Scouts Kriko-M op een rijtje — en in één klik in jouw eigen agenda.</p>
</div>

<section class="section container section--no-top">

    <!-- 2. Action bar: abonneren, downloaden, inschrijven -->
    <div class="cal-actions">
        <div class="cal-actions-group">
            <a href="<?php echo htmlspecialchars($webcal_url); ?>" class="btn btn-secondary cal-actions-btn">
                <i class="fa-regular fa-calendar-plus"></i> Abonneer op onze agenda
            </a>
            <a href="<?php echo htmlspecialchars($ics_url); ?>" class="btn btn-outline cal-actions-btn">
                <i class="fa-solid fa-download"></i> Download (.ics)
            </a>
        </div>
        <a href="ouderportaal.php" class="btn btn-primary cal-actions-btn">
            Inschrijven voor weekend/kamp <i class="fa-solid fa-arrow-right"></i>
        </a>
    </div>
    <p class="cal-actions-hint">
        <i class="fa-solid fa-circle-info"></i>
        "Abonneren" zet onze hele kalender in jouw agenda-app &mdash; nieuwe activiteiten verschijnen dan automatisch.
    </p>

    <?php if (empty($events)): ?>
        <div class="cal-empty">
            <p>Er staan momenteel geen activiteiten gepland. Kom snel eens terug kijken!</p>
        </div>
    <?php else: ?>

        <!-- 3. Two-column layout: month grid + upcoming list -->
        <div class="cal-layout">

            <!-- Left: month grid (rendered by JS) -->
            <div class="cal-calendar" id="cal-calendar">
                <div class="cal-cal-header">
                    <span class="cal-cal-title" id="cal-title">&nbsp;</span>
                    <div class="cal-cal-nav">
                        <button type="button" class="cal-today-btn" id="cal-today">Vandaag</button>
                        <button type="button" class="cal-nav-btn" id="cal-prev" aria-label="Vorige maand">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        <button type="button" class="cal-nav-btn" id="cal-next" aria-label="Volgende maand">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div class="cal-weekdays">
                    <span>Ma</span><span>Di</span><span>Wo</span><span>Do</span><span>Vr</span><span>Za</span><span>Zo</span>
                </div>
                <div class="cal-days" id="cal-days"></div>
                <div class="cal-legend">
                    <span class="cal-legend-item"><span class="cal-legend-dot cal-legend-today"></span> Vandaag</span>
                    <span class="cal-legend-item"><span class="cal-legend-dot cal-legend-event"></span> Activiteit</span>
                </div>
            </div>

            <!-- Right: upcoming events list -->
            <div class="cal-upcoming">
                <h3 class="cal-upcoming-title">Aankomende activiteiten</h3>

                <?php if (empty($upcoming)): ?>
                    <p class="cal-upcoming-empty">Er zijn momenteel geen aankomende activiteiten gepland.</p>
                <?php else: ?>
                    <?php foreach ($upcoming as $event):
                        $dt = cal_event_datetimes($event);
                        if (!$dt) {
                            continue;
                        }
                        $start = $dt['start'];
                        $day      = $start->format('d');
                        $month    = cal_month_nl((int) $start->format('n'));
                        $weekday  = cal_weekday_nl($start);
                        $date_str = $start->format('j') . ' ' . cal_month_nl((int) $start->format('n')) . ' ' . $start->format('Y');

                        // Countdown in whole days
                        $diff_days = (int) $today->diff((clone $start)->setTime(0, 0))->format('%r%a');
                        if ($diff_days === 0) {
                            $countdown = 'Vandaag';
                        } elseif ($diff_days === 1) {
                            $countdown = 'Morgen';
                        } else {
                            $countdown = 'Nog ' . $diff_days . ' dagen';
                        }

                        $google = cal_google_url($event);
                        $ics    = cal_ics_feed_url((string) ($event['id'] ?? ''));
                        $event_id = htmlspecialchars((string) ($event['id'] ?? ''));
                    ?>
                        <article class="cal-event" id="event-<?php echo $event_id; ?>" data-date="<?php echo htmlspecialchars((string) ($event['date'] ?? '')); ?>">
                            <div class="cal-event-date" aria-hidden="true">
                                <span class="cal-event-day"><?php echo htmlspecialchars($day); ?></span>
                                <span class="cal-event-month"><?php echo htmlspecialchars($month); ?></span>
                            </div>
                            <div class="cal-event-body">
                                <span class="cal-countdown"><?php echo htmlspecialchars($countdown); ?></span>
                                <h4 class="cal-event-title"><?php echo htmlspecialchars((string) ($event['title'] ?? '')); ?></h4>
                                <div class="cal-event-meta">
                                    <span><i class="fa-regular fa-calendar"></i> <?php echo htmlspecialchars($weekday . ' ' . $date_str); ?></span>
                                    <?php if (!empty($event['time'])): ?>
                                        <span><i class="fa-regular fa-clock"></i> <?php echo htmlspecialchars((string) $event['time']); ?></span>
                                    <?php endif; ?>
                                    <?php if (!empty($event['location'])): ?>
                                        <span><i class="fa-solid fa-location-dot"></i> <?php echo htmlspecialchars((string) $event['location']); ?></span>
                                    <?php endif; ?>
                                </div>
                                <?php if (!empty($event['description'])): ?>
                                    <p class="cal-event-desc"><?php echo htmlspecialchars((string) $event['description']); ?></p>
                                <?php endif; ?>
                                <div class="cal-event-actions">
                                    <span class="cal-add-label">In agenda:</span>
                                    <a href="<?php echo htmlspecialchars($google); ?>" class="cal-add-btn" target="_blank" rel="noopener">
                                        <i class="fa-brands fa-google"></i> Google
                                    </a>
                                    <a href="<?php echo htmlspecialchars($ics); ?>" class="cal-add-btn">
                                        <i class="fa-regular fa-calendar"></i> Apple / Outlook
                                    </a>
                                </div>
                            </div>
                        </article>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>

    <?php endif; ?>
</section>

<script>
(function () {
    const events = <?php echo json_encode($grid_events, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>;
    const daysRoot = document.getElementById('cal-days');
    const titleEl  = document.getElementById('cal-title');
    const prevBtn  = document.getElementById('cal-prev');
    const nextBtn  = document.getElementById('cal-next');
    if (!daysRoot || !titleEl) return;

    const MONTHS_NL = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
                       'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];

    // Map "YYYY-MM-DD" -> [events]
    const byDate = {};
    events.forEach(function (e) {
        if (!e.date) return;
        (byDate[e.date] = byDate[e.date] || []).push(e);
    });

    const todayBtn = document.getElementById('cal-today');
    const calendarEl = document.getElementById('cal-calendar');

    function toKey(d) {
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return d.getFullYear() + '-' + m + '-' + day;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = toKey(today);

    // Start on the month of the first upcoming event, else current month
    let view = new Date(today.getFullYear(), today.getMonth(), 1);
    const futureKeys = Object.keys(byDate).filter(function (k) { return k >= todayKey; }).sort();
    if (futureKeys.length) {
        const parts = futureKeys[0].split('-');
        view = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    }

    let selectedKey = null; // currently highlighted day in the grid

    function render() {
        const year = view.getFullYear();
        const month = view.getMonth();
        titleEl.textContent = MONTHS_NL[month] + ' ' + year;

        // Disable "Vandaag" when already on the current month
        if (todayBtn) {
            const onCurrent = (year === today.getFullYear() && month === today.getMonth());
            todayBtn.disabled = onCurrent;
        }

        // Monday-based offset for the 1st of the month
        const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        daysRoot.innerHTML = '';

        for (let i = 0; i < firstDow; i++) {
            const empty = document.createElement('span');
            empty.className = 'cal-day empty';
            daysRoot.appendChild(empty);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const key = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            const dayEvents = byDate[key];
            const cell = document.createElement(dayEvents ? 'button' : 'span');
            cell.className = 'cal-day';
            cell.textContent = d;

            if (key === todayKey) cell.classList.add('today');
            if (key === selectedKey) cell.classList.add('selected');

            if (dayEvents) {
                cell.classList.add('has-event');
                cell.type = 'button';
                cell.title = dayEvents.map(function (e) { return e.title; }).join(', ');
                cell.setAttribute('aria-label', d + ': ' + cell.title);
                const dot = document.createElement('span');
                dot.className = 'cal-day-dot';
                cell.appendChild(dot);
                cell.addEventListener('click', function () {
                    selectDay(key);
                    highlightEvent(dayEvents[0].id);
                });
            }
            daysRoot.appendChild(cell);
        }
    }

    // Jump the grid to the month of `dateStr` and highlight that day cell
    function selectDay(dateStr) {
        if (!dateStr) return;
        const parts = dateStr.split('-');
        view = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
        selectedKey = dateStr;
        render();
    }

    function highlightEvent(id) {
        const target = document.getElementById('event-' + id);
        if (!target) return;
        document.querySelectorAll('.cal-event.highlight').forEach(function (el) {
            el.classList.remove('highlight');
        });
        target.classList.add('highlight');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(function () { target.classList.remove('highlight'); }, 1600);
    }

    // Click an event card → jump the calendar to that day
    document.querySelectorAll('.cal-event').forEach(function (card) {
        card.addEventListener('click', function (e) {
            // Don't hijack clicks on the "add to calendar" links
            if (e.target.closest('a, .cal-event-actions')) return;
            selectDay(card.getAttribute('data-date'));
            if (calendarEl) {
                calendarEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

    if (prevBtn) prevBtn.addEventListener('click', function () {
        view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
        render();
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
        view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
        render();
    });
    if (todayBtn) todayBtn.addEventListener('click', function () {
        view = new Date(today.getFullYear(), today.getMonth(), 1);
        selectedKey = null;
        render();
    });

    render();
}());
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
