<?php
/**
 * CSRF-bescherming — gedeelde hulpfuncties.
 *
 * Werking: bij het eerste bezoek genereren we één geheim token per sessie.
 * Elk POST-formulier moet dat token meesturen (verborgen veld `csrf_token`,
 * of automatisch geïnjecteerd via assets/js/csrf.js op basis van de
 * <meta name="csrf-token"> in de header). Bij elke POST vergelijken we het
 * meegestuurde token met het token in de sessie. Een externe site kan ons
 * token niet lezen (same-origin policy), dus een vervalst verzoek faalt.
 */

/** Haal (of genereer) het CSRF-token voor de huidige sessie. */
function csrf_token(): string {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/** Geef een kant-en-klaar verborgen formulierveld terug. */
function csrf_field(): string {
    return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars(csrf_token()) . '">';
}

/**
 * Controleer het token van een binnenkomende POST.
 * Gebruik hash_equals() tegen timing-aanvallen.
 */
function csrf_verify(): bool {
    if (session_status() === PHP_SESSION_NONE) session_start();
    $sent = $_POST['csrf_token'] ?? '';
    $real = $_SESSION['csrf_token'] ?? '';
    return is_string($sent) && $real !== '' && hash_equals($real, $sent);
}
