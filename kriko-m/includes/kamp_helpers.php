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

/** Maak een nieuw kamp aan. */
function create_kamp(array $data): array {
    $kampen  = read_kampen();
    $kamp = [
        'id'                     => 'kamp_' . bin2hex(random_bytes(6)),
        'naam'                   => substr(trim($data['naam'] ?? 'Nieuw kamp'), 0, 200),
        'tak'                    => $data['tak'] ?? 'alle',
        'datum_van'              => $data['datum_van'] ?? '',
        'datum_tot'              => $data['datum_tot'] ?? '',
        'locatie'                => substr(trim($data['locatie'] ?? ''), 0, 300),
        'beschrijving'           => substr(trim($data['beschrijving'] ?? ''), 0, 2000),
        'open_voor_inschrijving' => !empty($data['open_voor_inschrijving']),
        'prijs'                  => max(0, (float)($data['prijs'] ?? 0)),
        'paklijst'               => [],
        'bestanden'              => [],
        'aangemaakt_op'          => date('Y-m-d H:i:s'),
        'aangemaakt_door'        => substr($data['aangemaakt_door'] ?? '', 0, 200),
    ];
    $kampen[] = $kamp;
    save_kampen($kampen);
    return $kamp;
}

/** Werk een kamp bij. Alleen de meegegeven velden worden overschreven. */
function update_kamp(string $kamp_id, array $data): bool {
    $kampen  = read_kampen();
    $changed = false;
    foreach ($kampen as &$kamp) {
        if (($kamp['id'] ?? '') !== $kamp_id) continue;
        foreach (['naam','locatie','beschrijving','datum_van','datum_tot'] as $f) {
            if (array_key_exists($f, $data))
                $kamp[$f] = is_string($data[$f]) ? substr(trim($data[$f]), 0, 2000) : $data[$f];
        }
        if (array_key_exists('open_voor_inschrijving', $data))
            $kamp['open_voor_inschrijving'] = !empty($data['open_voor_inschrijving']);
        if (array_key_exists('prijs', $data))
            $kamp['prijs'] = max(0, (float)$data['prijs']);
        $changed = true;
        break;
    }
    return $changed && save_kampen($kampen);
}

/** Verwijder kamp + al zijn inschrijvingen + al zijn bestanden. */
function delete_kamp(string $kamp_id): bool {
    $kamp = get_kamp($kamp_id);
    if ($kamp) {
        $dir = __DIR__ . '/../uploads/kamp-bestanden/';
        foreach ($kamp['bestanden'] ?? [] as $b) {
            $p = $dir . ($b['file_name'] ?? '');
            if (file_exists($p)) @unlink($p);
        }
    }
    $ins = array_values(array_filter(read_inschrijvingen(), fn($i) => ($i['kamp_id'] ?? '') !== $kamp_id));
    save_inschrijvingen($ins);
    return save_kampen(array_values(array_filter(read_kampen(), fn($k) => ($k['id'] ?? '') !== $kamp_id)));
}

/** Voeg een bestand toe aan een kamp. */
function add_kamp_bestand(string $kamp_id, string $type, string $naam, string $file_name): bool {
    $kampen = read_kampen();
    foreach ($kampen as &$kamp) {
        if (($kamp['id'] ?? '') !== $kamp_id) continue;
        if (!isset($kamp['bestanden'])) $kamp['bestanden'] = [];
        $kamp['bestanden'][] = [
            'id'          => 'bf_' . bin2hex(random_bytes(6)),
            'type'        => $type,
            'naam'        => substr(trim($naam), 0, 200),
            'file_name'   => $file_name,
            'uploaded_at' => date('Y-m-d H:i:s'),
        ];
        return save_kampen($kampen);
    }
    return false;
}

/** Verwijder een bestand van een kamp (ook het fysieke bestand). */
function delete_kamp_bestand(string $kamp_id, string $bestand_id): bool {
    $kampen = read_kampen();
    foreach ($kampen as &$kamp) {
        if (($kamp['id'] ?? '') !== $kamp_id) continue;
        $before = count($kamp['bestanden'] ?? []);
        foreach ($kamp['bestanden'] ?? [] as $b) {
            if (($b['id'] ?? '') === $bestand_id) {
                $p = __DIR__ . '/../uploads/kamp-bestanden/' . ($b['file_name'] ?? '');
                if (file_exists($p)) @unlink($p);
                break;
            }
        }
        $kamp['bestanden'] = array_values(array_filter($kamp['bestanden'] ?? [], fn($b) => ($b['id'] ?? '') !== $bestand_id));
        if (count($kamp['bestanden']) < $before) return save_kampen($kampen);
        break;
    }
    return false;
}

/** Alle kampen voor een tak — ook gesloten (voor leidingsbeheer). */
function kampen_voor_tak_leiding(string $tak): array {
    $tak = strtolower($tak);
    return array_values(array_filter(read_kampen(), function($k) use ($tak) {
        $kt = strtolower($k['tak'] ?? 'alle');
        return $kt === $tak || $kt === 'alle';
    }));
}

/** Geeft de volledige inschrijving-record terug voor één lid+kamp (incl. opmerking). */
function get_inschrijving(string $ga_id, string $kamp_id): ?array {
    foreach (read_inschrijvingen() as $ins) {
        if (($ins['ga_id'] ?? '') === $ga_id && ($ins['kamp_id'] ?? '') === $kamp_id) return $ins;
    }
    return null;
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
