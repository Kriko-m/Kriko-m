<?php
/**
 * Lokale ouder-accounts — hulpfuncties
 * Sla minimale data op: naam, email, wachtwoord-hash, gelinkte kinderen (ga_id + voornaam + tak).
 * Medische info en volledige profielen blijven bij S&G.
 */
require_once __DIR__ . '/db.php';

function read_ouder_accounts(): array {
    $a = read_db('ouder_accounts');
    return is_array($a) ? $a : [];
}

function save_ouder_accounts(array $accounts): bool {
    return write_db('ouder_accounts', array_values($accounts));
}

function get_ouder_by_email(string $email): ?array {
    $email = strtolower(trim($email));
    foreach (read_ouder_accounts() as $acc) {
        if (strtolower($acc['email'] ?? '') === $email) return $acc;
    }
    return null;
}

function get_ouder_by_id(string $id): ?array {
    foreach (read_ouder_accounts() as $acc) {
        if (($acc['id'] ?? '') === $id) return $acc;
    }
    return null;
}

function create_ouder_account(string $naam, string $email, string $password): ?array {
    if (get_ouder_by_email($email)) return null; // email al in gebruik
    $accounts   = read_ouder_accounts();
    $account    = [
        'id'            => 'ouder_' . bin2hex(random_bytes(8)),
        'naam'          => substr(trim($naam), 0, 200),
        'email'         => strtolower(trim($email)),
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'kinderen'      => [],
        'created_at'    => date('Y-m-d H:i:s'),
    ];
    $accounts[] = $account;
    save_ouder_accounts($accounts);
    return $account;
}

function verify_ouder_login(string $email, string $password): ?array {
    $account = get_ouder_by_email($email);
    if (!$account) return null;
    if (!password_verify($password, $account['password_hash'] ?? '')) return null;
    return $account;
}

/**
 * Koppel een kind (ga_id + voornaam + tak) aan een ouderaccount.
 * Slaat géén geboortedatum, achternaam of medische info op.
 */
function add_kind_to_account(string $account_id, array $kind): bool {
    $accounts = read_ouder_accounts();
    foreach ($accounts as &$acc) {
        if (($acc['id'] ?? '') !== $account_id) continue;
        foreach ($acc['kinderen'] ?? [] as $k) {
            if (($k['ga_id'] ?? '') === ($kind['ga_id'] ?? '')) return true; // al gelinkt
        }
        $acc['kinderen'][] = [
            'ga_id'    => $kind['ga_id']    ?? '',
            'voornaam' => $kind['voornaam'] ?? '',
            'tak'      => strtolower($kind['tak'] ?? ''),
            'added_at' => date('Y-m-d H:i:s'),
        ];
        return save_ouder_accounts($accounts);
    }
    return false;
}

function remove_kind_from_account(string $account_id, string $ga_id): bool {
    $accounts = read_ouder_accounts();
    foreach ($accounts as &$acc) {
        if (($acc['id'] ?? '') !== $account_id) continue;
        $before = count($acc['kinderen'] ?? []);
        $acc['kinderen'] = array_values(
            array_filter($acc['kinderen'] ?? [], fn($k) => ($k['ga_id'] ?? '') !== $ga_id)
        );
        if (count($acc['kinderen']) < $before) return save_ouder_accounts($accounts);
        break;
    }
    return false;
}

function delete_ouder_account(string $account_id): bool {
    $accounts = array_values(
        array_filter(read_ouder_accounts(), fn($a) => ($a['id'] ?? '') !== $account_id)
    );
    return save_ouder_accounts($accounts);
}

function is_ouder_logged_in(): bool {
    return !empty($_SESSION['ouder_logged_in']);
}

/** Is er iemand ingelogd in het portaal (ouder-account óf S&G-leiding)? */
function portaal_ingelogd(): bool {
    return !empty($_SESSION['ouder_logged_in']) || !empty($_SESSION['sgo_logged_in']);
}

/**
 * Bescherm een "groene" portaal-/webshop-pagina: niet-ingelogde bezoekers
 * worden naar de login-pagina gestuurd. Moet aangeroepen worden vóór elke uitvoer.
 */
function vereis_portaal_login(string $reden = ''): void {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (portaal_ingelogd()) return;
    $q = $reden !== '' ? '?login_vereist=' . rawurlencode($reden) : '?login_vereist=1';
    header('Location: ouderportaal.php' . $q);
    exit;
}

function ouder_session_set(array $account): void {
    $_SESSION['ouder_logged_in']  = true;
    $_SESSION['ouder_account_id'] = $account['id'];
    $_SESSION['ouder_naam']       = $account['naam'];
    $_SESSION['ouder_email']      = $account['email'];
}
