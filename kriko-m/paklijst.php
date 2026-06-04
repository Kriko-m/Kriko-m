<?php
/**
 * De paklijst is niet langer publiek: ze is kampspecifiek en enkel
 * zichtbaar voor ingeschreven leden via "Mijn Kampen" (S&G-login).
 */
header('Location: mijn-kampen.php');
exit;
