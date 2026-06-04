<?php
/**
 * 404 Pagina — met scouts grap
 */
$page_title = "Pagina niet gevonden";
http_response_code(404);
require_once __DIR__ . '/includes/header.php';
?>

<div class="container">
    <div class="error-404">
        <div class="error-404-number">404</div>
        <div class="error-404-emoji">🏕️</div>
        <h1 class="error-404-title">Verdwaald in het bos!</h1>
        <p class="error-404-text">
            Oeps — deze pagina is op kamp gegaan zonder het adres door te geven.
            Misschien heb je een verkeerde afslag genomen bij de derde boom links?<br><br>
            <em>"Een scout vindt altijd zijn weg — maar deze keer moet je toch even terug naar het startpunt."</em>
        </p>
        <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
            <a href="index.php" class="btn btn-secondary">
                <i class="fa-solid fa-house"></i> Terug naar home
            </a>
            <a href="evenementen.php" class="btn btn-outline">
                <i class="fa-solid fa-calendar"></i> Kalender bekijken
            </a>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
