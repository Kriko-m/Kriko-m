<?php
/**
 * Ouder registratie — standalone pagina
 */
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/includes/ouder_auth.php';

// Al ingelogd → meteen door
if (is_ouder_logged_in()) { header('Location: ouderportaal.php'); exit; }

$error = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $naam     = trim($_POST['naam']     ?? '');
    $email    = trim($_POST['email']    ?? '');
    $pw       = $_POST['password']      ?? '';
    $pw2      = $_POST['password2']     ?? '';

    if (empty($naam) || empty($email) || empty($pw)) {
        $error = 'Vul alle velden in.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Ongeldig e-mailadres.';
    } elseif (strlen($pw) < 8) {
        $error = 'Wachtwoord moet minstens 8 tekens zijn.';
    } elseif ($pw !== $pw2) {
        $error = 'Wachtwoorden komen niet overeen.';
    } elseif (get_ouder_by_email($email)) {
        $error = 'Dit e-mailadres is al geregistreerd. <a href="ouderportaal.php" style="color:inherit;font-weight:700;">Inloggen?</a>';
    } else {
        $account = create_ouder_account($naam, $email, $pw);
        if ($account) {
            ouder_session_set($account);
            header('Location: ouderportaal.php?welkom=1');
            exit;
        }
        $error = 'Registratie mislukt. Probeer opnieuw.';
    }
}
?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account aanmaken | Scouts Kriko-M</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="assets/images/logo-finaal.png">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
            --green:      #1A3D2A;
            --green-mid:  #2A5C3F;
            --gold:       #C9963A;
            --bg:         #EEF5F1;
            --border:     #C2D9C9;
            --text:       #1A1A1A;
            --muted:      #6A8A75;
            --error:      #B23A4D;
            --radius:     14px;
        }
        html, body { height: 100%; font-family: 'Outfit', sans-serif; background: var(--bg); color: var(--text); }
        body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 40px 20px; gap: 20px; }

        h1 { font-family: 'Nunito', sans-serif; font-size: 2rem; font-weight: 900; color: var(--green); letter-spacing: .06em; text-transform: uppercase; text-align: center; }

        .card { width: 100%; max-width: 440px; background: #fff; border-radius: 20px; box-shadow: 0 12px 40px rgba(26,61,42,.12); border: 1px solid var(--border); padding: 36px 36px 32px; }

        label { display: block; font-size: .85rem; font-weight: 600; color: var(--green); margin-bottom: 6px; }
        input { width: 100%; padding: 12px 14px; border: 2px solid var(--border); border-radius: var(--radius); font-family: inherit; font-size: .95rem; color: var(--text); background: #fff; outline: none; margin-bottom: 16px; transition: border-color .15s, box-shadow .15s; }
        input:focus { border-color: var(--green-mid); box-shadow: 0 0 0 4px rgba(42,92,63,.12); }

        .btn { width: 100%; padding: 14px; background: var(--green); color: #fff; border: none; border-radius: var(--radius); font-family: 'Outfit', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background .15s, transform .15s; margin-top: 4px; }
        .btn:hover { background: var(--green-mid); transform: translateY(-1px); }

        .alert-error { padding: 11px 14px; border-radius: 10px; font-size: .88rem; font-weight: 600; text-align: center; margin-bottom: 18px; background: hsla(349,51%,47%,.1); border: 1.5px solid var(--error); color: var(--error); }

        .hint { font-size: .8rem; color: var(--muted); text-align: center; margin-top: 14px; }
        .hint a { color: var(--green); font-weight: 700; text-decoration: none; }
        .hint a:hover { text-decoration: underline; }

        .back-link { display: inline-flex; align-items: center; gap: 7px; font-size: .88rem; font-weight: 600; color: var(--muted); text-decoration: none; transition: color .15s; }
        .back-link:hover { color: var(--green); }
        .back-link svg { width: 14px; height: 14px; fill: currentColor; }
    </style>
</head>
<body>
    <h1>Account aanmaken</h1>

    <div class="card">
        <?php if ($error): ?>
            <div class="alert-error"><?php echo $error; ?></div>
        <?php endif; ?>

        <form method="POST">
            <label for="naam">Naam</label>
            <input type="text" id="naam" name="naam" value="<?php echo htmlspecialchars($_POST['naam'] ?? ''); ?>" placeholder="Volledige naam" required autofocus>

            <label for="email">E-mailadres</label>
            <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>" placeholder="naam@voorbeeld.be" required>

            <label for="password">Wachtwoord</label>
            <input type="password" id="password" name="password" placeholder="Minimaal 8 tekens" required>

            <label for="password2">Wachtwoord bevestigen</label>
            <input type="password" id="password2" name="password2" placeholder="Herhaal wachtwoord" required>

            <button type="submit" class="btn">Account aanmaken →</button>
        </form>

        <p class="hint">Al een account? <a href="ouderportaal.php">Inloggen</a></p>
    </div>

    <a href="index.php" class="back-link">
        <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        Terug naar de website
    </a>
</body>
</html>
