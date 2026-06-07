-- Voeg WhatsApp URL toe aan Welpen tak
UPDATE settings
SET takken = jsonb_set(
  takken,
  '{welpen,whatsapp_url}',
  '"https://chat.whatsapp.com/K0nyQRSMJOMGtbMsfnbLOX"'
)
WHERE id = 1;
