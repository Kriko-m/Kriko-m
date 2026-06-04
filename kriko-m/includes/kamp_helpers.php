<?php
/**
 * Kamp-helpers — beheer van kampen/weekends en inschrijvingen.
 *
 * PRIVACY BY DESIGN:
 *  - In data/kampinschrijvingen.json bewaren we ENKEL het S&G-lidnummer (ga_id),
 *    het kamp, een vrije opmerking van de ouder en wie/wanneer inschreef.
 *  - GEEN namen, GEEN geboortedata, GEEN medische gegevens lokaal.
 *  - Namen + medische fiche worden pas LIVE opgehaald uit de groepsadmin-API
 *    op het moment dat de leiding een ledenlijst exporteert.
 */

require_once __DIR__ . '/db.php';

/* ── Kampen ──────────────────────────────────────────── */

function read_kampen(): array {
    $k = read_db('kampen');
    return is_array($k) ? $k : [];
}

function get_kamp(string $kamp_id): ?array {
    foreach (read_kampen() as $kamp) {
        if (($kamp['id'] ?? '') === $kamp_id) return $kamp;
    }
    return null;
}

function save_kampen(array $kampen): bool {
    return write_db('kampen', array_values($kampen));
}

/**
 * Open kampen die bij een bepaalde tak horen (of 'alle').
 */
function open_kampen_voor_tak(string $tak): array {
    $tak = strtolower($tak);
    $result = [];
    foreach (read_kampen() as $kamp) {
        if (empty($kamp['open_voor_inschrijving'])) continue;
        $kamp_tak = strtolower($kamp['tak'] ?? 'alle');
        if ($kamp_tak === 'alle' || $kamp_tak === $tak) {
            $result[] = $kamp;
        }
    }
    return $result;
}

/* ── Inschrijvingen ──────────────────────────────────── */

function read_inschrijvingen(): array {
    $i = read_db('kampinschrijvingen');
    return is_array($i) ? $i : [];
}

function save_inschrijvingen(array $inschrijvingen): bool {
    return write_db('kampinschrijvingen', array_values($inschrijvingen));
}

/** Is dit lid (ga_id) al ingeschreven voor dit kamp? */
function kind_is_ingeschreven(string $ga_id, string $kamp_id): bool {
    foreach (read_inschrijvingen() as $ins) {
        if (($ins['ga_id'] ?? '') === $ga_id && ($ins['kamp_id'] ?? '') === $kamp_id) {
            return true;
        }
    }
    return false;
}

/** Alle kamp-id's waarvoor dit lid ingeschreven is. */
function kampen_voor_kind(string $ga_id): array {
    $ids = [];
    foreach (read_inschrijvingen() as $ins) {
        if (($ins['ga_id'] ?? '') === $ga_id) {
            $ids[] = $ins['kamp_id'] ?? '';
        }
    }
    return array_filter($ids);
}

/** Alle inschrijvingen voor één kamp (voor de leiding-export). */
function inschrijvingen_voor_kamp(string $kamp_id): array {
    $result = [];
    foreach (read_inschrijvingen() as $ins) {
        if (($ins['kamp_id'] ?? '') === $kamp_id) $result[] = $ins;
    }
    return $result;
}

/**
 * Schrijf een lid in voor een kamp. Bewaart enkel het ga_id + opmerking.
 * Geeft false terug als het lid al ingeschreven was.
 */
function schrijf_kind_in(string $ga_id, string $kamp_id, string $opmerking, string $door): bool {
    if ($ga_id === '' || $kamp_id === '') return false;
    if (kind_is_ingeschreven($ga_id, $kamp_id)) return false;

    $inschrijvingen = read_inschrijvingen();
    $inschrijvingen[] = [
        'id'              => 'ins_' . bin2hex(random_bytes(6)),
        'kamp_id'         => $kamp_id,
        'ga_id'           => $ga_id,
        'opmerking'       => substr(trim($opmerking), 0, 1000),
        'ingeschreven_op' => date('Y-m-d H:i:s'),
        'door'            => $door, // S&G-id of e-mail van de ouder die inschreef
    ];
    return save_inschrijvingen($inschrijvingen);
}

/** Schrijf een lid uit voor een kamp. */
function schrijf_kind_uit(string $ga_id, string $kamp_id): bool {
    $inschrijvingen = read_inschrijvingen();
    $before = count($inschrijvingen);
    $inschrijvingen = array_filter($inschrijvingen, function ($ins) use ($ga_id, $kamp_id) {
        return !(($ins['ga_id'] ?? '') === $ga_id && ($ins['kamp_id'] ?? '') === $kamp_id);
    });
    if (count($inschrijvingen) === $before) return false;
    return save_inschrijvingen($inschrijvingen);
}
