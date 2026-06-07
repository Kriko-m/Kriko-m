/**
 * CSRF — injecteert automatisch het sessie-token in elk POST-formulier.
 *
 * Het token staat in <meta name="csrf-token"> (server-side gerenderd). We voegen
 * het toe als verborgen veld 'csrf_token' aan elk same-origin POST-formulier.
 * We doen dit zowel bij het laden als vlak vóór verzenden (submit-capture), zodat
 * ook dynamisch toegevoegde formulieren gedekt zijn. Formulieren die het veld al
 * server-side bevatten (login, checkout, contact, register) worden niet gedupliceerd.
 */
(function () {
    function token() {
        var m = document.querySelector('meta[name="csrf-token"]');
        return m ? m.getAttribute('content') : '';
    }

    function ensureField(form) {
        if (!form || (form.method || '').toLowerCase() !== 'post') return;
        var existing = form.querySelector('input[name="csrf_token"]');
        if (existing) {
            if (!existing.value) existing.value = token();
            return;
        }
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'csrf_token';
        input.value = token();
        form.appendChild(input);
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('form').forEach(ensureField);
    });

    // Vangnet: zorg dat het veld er is op het moment van verzenden.
    document.addEventListener('submit', function (e) {
        if (e.target && e.target.tagName === 'FORM') ensureField(e.target);
    }, true);
})();
