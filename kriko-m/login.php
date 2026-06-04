<?php
/**
 * Admin Session Login - Standalone page (geen nav/header/footer)
 */
require_once __DIR__ . '/includes/auth.php';

if (isset($_GET['logout']) && $_GET['logout'] == '1') {
    admin_logout();
    $logout_success = 'U bent succesvol uitgelogd.';
}

if (is_admin_logged_in()) {
    header('Location: admin.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $role     = $_POST['role'] ?? '';
    $password = $_POST['password'] ?? '';
    if (empty($role) || empty($password)) {
        $error = 'Selecteer een rol en vul het wachtwoord in.';
    } elseif (verify_admin_login($role, $password)) {
        header('Location: admin.php');
        exit;
    } else {
        $error = 'Ongeldig wachtwoord voor deze leidingrol! Gelieve opnieuw te proberen.';
    }
}
?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login | Scouts Kriko-M</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="assets/images/logo-finaal.png">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --green:       #1A3D2A;
            --green-mid:   #2A5C3F;
            --gold:        #C9963A;
            --gold-hover:  #B8862F;
            --bg:          #EEF5F1;
            --border:      #C2D9C9;
            --text:        #1A1A1A;
            --muted:       #6A8A75;
            --error:       #B23A4D;
            --success:     #3F7D5A;
            --radius:      14px;
        }

        html, body {
            height: 100%;
            font-family: 'Outfit', sans-serif;
            background: var(--bg);
            color: var(--text);
        }

        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 40px 20px;
            gap: 28px;
        }

        /* Title above card */
        .login-title {
            font-family: 'Nunito', sans-serif;
            font-size: 2rem;
            font-weight: 900;
            color: var(--green);
            letter-spacing: 0.06em;
            text-transform: uppercase;
            text-align: center;
        }

        /* Card */
        .card {
            width: 100%;
            max-width: 420px;
            background: #fff;
            border-radius: 20px;
            box-shadow: 0 12px 40px rgba(26,61,42,0.12);
            border: 1px solid var(--border);
            padding: 40px 36px 36px;
        }

        label {
            display: block;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--green);
            margin-bottom: 6px;
        }

        select, input[type="password"] {
            width: 100%;
            padding: 12px 14px;
            border: 2px solid var(--border);
            border-radius: var(--radius);
            font-family: inherit;
            font-size: 0.95rem;
            color: var(--text);
            background: #fff;
            transition: border-color 0.15s, box-shadow 0.15s;
            outline: none;
            margin-bottom: 18px;
        }

        select:focus, input[type="password"]:focus {
            border-color: var(--green-mid);
            box-shadow: 0 0 0 4px rgba(42,92,63,0.12);
        }

        .btn-login {
            width: 100%;
            padding: 14px;
            background: var(--green);
            color: #fff;
            border: none;
            border-radius: var(--radius);
            font-family: 'Outfit', sans-serif;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.15s, transform 0.15s;
            margin-top: 4px;
        }

        .btn-login:hover {
            background: var(--green-mid);
            transform: translateY(-1px);
        }

        .alert {
            padding: 11px 14px;
            border-radius: 10px;
            font-size: 0.88rem;
            font-weight: 600;
            text-align: center;
            margin-bottom: 20px;
        }
        .alert-error   { background: hsla(349,51%,47%,0.1); border: 1.5px solid var(--error);   color: var(--error); }
        .alert-success { background: hsla(145,33%,36%,0.1); border: 1.5px solid var(--success); color: var(--success); }

        /* Back link */
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            font-size: 0.88rem;
            font-weight: 600;
            color: var(--muted);
            text-decoration: none;
            transition: color 0.15s;
        }
        .back-link:hover { color: var(--green); }
        .back-link svg { width: 14px; height: 14px; fill: currentColor; flex-shrink: 0; }
    </style>
</head>
<body>

    <h1 class="login-title">Login</h1>

    <div class="card">

        <?php if (!empty($logout_success)): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($logout_success); ?></div>
        <?php endif; ?>

        <?php if (!empty($error)): ?>
            <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <form method="POST" action="login.php">
            <label for="role">Rol</label>
            <select id="role" name="role" required>
                <option value="" disabled selected>Kies uw rol</option>
                <option value="groepsleiding">Groepsleiding</option>
                <option value="kapoenen">Kapoenenleiding</option>
                <option value="welpen">Welpenleiding</option>
                <option value="jonggivers">Jonggiverleiding</option>
                <option value="givers">Giverleiding</option>
            </select>

            <label for="password">Wachtwoord</label>
            <input type="password" id="password" name="password" placeholder="••••••••" required autofocus>

            <button type="submit" class="btn-login">Aanmelden &rarr;</button>
        </form>

    </div>

    <a href="index.php" class="back-link">
        <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        Terug naar de website
    </a>

</body>
</html>
