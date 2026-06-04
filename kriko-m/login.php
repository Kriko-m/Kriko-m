<?php
/**
 * Admin login-handler (geen eigen pagina meer).
 *
 * De zichtbare login staat in ouderportaal.php (Admin-tab). Dit bestand:
 *   - verwerkt de POST van die tab (rol + wachtwoord)
 *   - handelt uitloggen af (?logout=1)
 *   - stuurt elke GET door naar het portaal
 */
require_once __DIR__ . '/includes/auth.php';

/* Uitloggen */
if (isset($_GET['logout']) && $_GET['logout'] == '1') {
    admin_logout();
    header('Location: ouderportaal.php?uitgelogd=1');
    exit;
}

/* Al ingelogd → meteen naar dashboard */
if (is_admin_logged_in()) {
    header('Location: admin.php');
    exit;
}

/* Login-poging vanuit de Admin-tab */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $role     = $_POST['role'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($role) || empty($password)) {
        header('Location: ouderportaal.php?admin_error=' . urlencode('Selecteer een rol en vul het wachtwoord in.'));
        exit;
    }
    if (verify_admin_login($role, $password)) {
        header('Location: admin.php');
        exit;
    }
    header('Location: ouderportaal.php?admin_error=' . urlencode('Ongeldig wachtwoord voor deze rol.'));
    exit;
}

/* Elke gewone GET → naar de login-pagina (portaal) */
header('Location: ouderportaal.php');
exit;
