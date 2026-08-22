import { Resend } from 'resend'
import { OrderItem } from '@/lib/types'

// Resend-client. Wordt alleen server-side gebruikt (API routes).
// RESEND_API_KEY moet gezet zijn; RESEND_FROM moet een geverifieerd afzenderdomein zijn.
const FROM_WEBSHOP = process.env.RESEND_FROM || 'Scouts Kriko-M Webshop <bestellingen@kriko-m.be>'
const FROM_CONTACT = process.env.RESEND_FROM_CONTACT || process.env.RESEND_FROM || 'Scouts Kriko-M <groepsleiding@kriko-m.be>'
const BCC = process.env.RESEND_BCC || ''

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

const euro = (n: number) => '€' + n.toFixed(2).replace('.', ',')
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

interface OrderConfirmationParams {
  to: string
  orderRef: string
  customerName: string
  items: OrderItem[]
  total: number
  communication: string
  bankIban: string
  bankHolder: string
}

export async function sendOrderConfirmation(params: OrderConfirmationParams) {
  const resend = getClient()
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY ontbreekt in environment variables; bevestigingsmail niet verstuurd.')
    return
  }

  const { to, orderRef, customerName, items, total, communication, bankIban, bankHolder } = params

  const itemRows = items
    .map(
      (i) => `<tr>
        <td style="padding:6px 0;border-bottom:1px solid #eee;">${i.quantity}× ${esc(i.name)} <span style="color:#888;">(${esc(i.size)})</span></td>
        <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">${euro(i.price * i.quantity)}</td>
      </tr>`
    )
    .join('')

  const html = `<!doctype html><html><body style="margin:0;background:#F0ECE4;font-family:Arial,Helvetica,sans-serif;color:#2b2b2b;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:#650B19;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;">
        <h1 style="margin:0;font-size:20px;">Bedankt voor je bestelling</h1>
        <p style="margin:6px 0 0;opacity:.9;font-size:14px;">Bestelnummer: ${esc(orderRef)}</p>
      </div>
      <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;">
        <p style="margin:0 0 16px;">Beste ${esc(customerName)},</p>
        <p style="margin:0 0 20px;line-height:1.5;">We hebben je bestelling goed ontvangen. Je kan betalen via <strong>handmatige overschrijving</strong> met onderstaande gegevens, of <strong>contant/cash bij afhaling</strong>.</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">${itemRows}
          <tr><td style="padding:10px 0 0;font-weight:bold;">Totaal</td><td style="padding:10px 0 0;text-align:right;font-weight:bold;">${euro(total)}</td></tr>
        </table>

        <div style="background:#F0ECE4;border-radius:10px;padding:16px 18px;">
          <h2 style="margin:0 0 12px;font-size:15px;color:#650B19;">Betaling via Overschrijving (Optie 1)</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:3px 0;color:#666;">Begunstigde</td><td style="padding:3px 0;text-align:right;">${esc(bankHolder)}</td></tr>
            <tr><td style="padding:3px 0;color:#666;">IBAN</td><td style="padding:3px 0;text-align:right;font-family:monospace;">${esc(bankIban)}</td></tr>
            <tr><td style="padding:3px 0;color:#666;">Bedrag</td><td style="padding:3px 0;text-align:right;font-weight:bold;">${euro(total)}</td></tr>
            <tr><td style="padding:3px 0;color:#666;">Mededeling</td><td style="padding:3px 0;text-align:right;font-weight:bold;font-family:monospace;">${esc(communication)}</td></tr>
          </table>
        </div>

        <div style="background:#EEF5F1;border:1px solid #C2D9C9;border-radius:10px;padding:16px 18px;margin-top:16px;">
          <h2 style="margin:0 0 8px;font-size:15px;color:#1A3D2A;">Betaling Cash bij Afhaling (Optie 2)</h2>
          <p style="margin:0;font-size:13px;color:#2b2b2b;line-height:1.4;">
            Je kan ook contant/cash betalen zodra je je bestelling komt ophalen bij de webshopverantwoordelijke.
          </p>
        </div>

        <p style="margin:20px 0 0;font-size:13px;color:#888;line-height:1.5;">De webshopverantwoordelijke neemt zelf contact met je op om een afhaalmoment af te spreken.</p>
        <p style="margin:16px 0 0;font-size:13px;color:#888;">Stevige linkerhand,<br/>Scouts Kriko-M</p>
      </div>
    </div>
  </body></html>`

  const text = [
    `Bedankt voor je bestelling! (${orderRef})`,
    ``,
    `Beste ${customerName},`,
    `We hebben je bestelling goed ontvangen.`,
    ``,
    ...items.map((i) => `- ${i.quantity}x ${i.name} (${i.size}): ${euro(i.price * i.quantity)}`),
    `Totaal: ${euro(total)}`,
    ``,
    `Betalingsmogelijkheden:`,
    `1. Handmatige overschrijving:`,
    `   Begunstigde: ${bankHolder}`,
    `   IBAN: ${bankIban}`,
    `   Bedrag: ${euro(total)}`,
    `   Mededeling: ${communication}`,
    `2. Cash bij afhaling.`,
    ``,
    `De webshopverantwoordelijke neemt zelf contact op voor het afhaalmoment.`,
    `Stevige linkerhand, Scouts Kriko-M`,
  ].join('\n')

  const res = await resend.emails.send({
    from: FROM_WEBSHOP,
    to,
    ...(BCC ? { bcc: BCC.split(',').map((s) => s.trim()).filter(Boolean) } : {}),
    subject: `Bevestiging bestelling ${orderRef} — Scouts Kriko-M`,
    html,
    text,
  })

  if (res.error) {
    console.error('⚠️ Resend fout bij verzenden bestelbevestiging:', res.error)
  }
}

interface WebshopOrderNotificationParams {
  to: string
  orderRef: string
  customerName: string
  email: string
  items: OrderItem[]
  total: number
  communication: string
  bankIban: string
  bankHolder: string
}

export async function sendWebshopOrderNotification(params: WebshopOrderNotificationParams) {
  const resend = getClient()
  if (!resend) {
    console.warn('RESEND_API_KEY ontbreekt; notificatiemail niet verstuurd.')
    return
  }

  const { to, orderRef, customerName, email, items, total } = params

  const itemRows = items
    .map(
      (i) => `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee;"><strong>${i.quantity}×</strong> ${esc(i.name)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${esc(i.size)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${euro(i.price)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;">${euro(i.price * i.quantity)}</td>
      </tr>`
    )
    .join('')

  const html = `<!doctype html><html><body style="margin:0;background:#F0ECE4;font-family:Arial,Helvetica,sans-serif;color:#2b2b2b;">
    <div style="max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#650B19;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;">
        <h1 style="margin:0;font-size:20px;">Nieuwe Webshop Bestelling</h1>
        <p style="margin:6px 0 0;opacity:.9;font-size:14px;">Bestelnummer: <strong>${esc(orderRef)}</strong></p>
      </div>
      <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">
          Beste webshopverantwoordelijke,<br/><br/>
          Er is zojuist een nieuwe bestelling geplaatst via de webshop van Scouts Kriko-M.
        </p>

        <div style="background:#F0ECE4;border-radius:10px;padding:16px 18px;margin-bottom:20px;">
          <h3 style="margin:0 0 10px;font-size:15px;color:#650B19;">Gegevens Koper</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:4px 0;color:#666;width:140px;">Naam koper:</td><td style="padding:4px 0;font-weight:bold;">${esc(customerName)}</td></tr>
            <tr><td style="padding:4px 0;color:#666;">E-mailadres:</td><td style="padding:4px 0;"><a href="mailto:${esc(email)}" style="color:#650B19;font-weight:bold;">${esc(email)}</a></td></tr>
            <tr><td style="padding:4px 0;color:#666;">Totaalbedrag:</td><td style="padding:4px 0;font-weight:bold;font-size:16px;color:#1A3D2A;">${euro(total)}</td></tr>
          </table>
        </div>

        <h3 style="margin:0 0 12px;font-size:15px;color:#650B19;">Bestelde Artikelen</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
          <thead>
            <tr style="background:#f8f9fa;text-align:left;">
              <th style="padding:8px;border-bottom:2px solid #ddd;">Artikel</th>
              <th style="padding:8px;border-bottom:2px solid #ddd;">Maat</th>
              <th style="padding:8px;border-bottom:2px solid #ddd;text-align:right;">Stukprijs</th>
              <th style="padding:8px;border-bottom:2px solid #ddd;text-align:right;">Subtotaal</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
            <tr>
              <td colspan="3" style="padding:12px 8px 0;font-weight:bold;text-align:right;">Totaalbedrag:</td>
              <td style="padding:12px 8px 0;text-align:right;font-weight:bold;font-size:16px;color:#650B19;">${euro(total)}</td>
            </tr>
          </tbody>
        </table>

        <p style="margin:20px 0 0;font-size:13px;color:#666;line-height:1.5;">
          Je kan rechtstreeks met de koper communiceren via <a href="mailto:${esc(email)}" style="color:#650B19;">${esc(email)}</a> om een afhaalmoment af te spreken.
        </p>
      </div>
    </div>
  </body></html>`

  const text = [
    `Nieuwe Webshop Bestelling (${orderRef})`,
    ``,
    `Naam koper: ${customerName}`,
    `E-mailadres: ${email}`,
    `Totaalbedrag: ${euro(total)}`,
    ``,
    `Bestelde artikelen:`,
    ...items.map((i) => `- ${i.quantity}x ${i.name} (${i.size}): ${euro(i.price * i.quantity)}`),
    ``,
    `Communiceer met de koper via ${email} om af te spreken voor de afhaling.`,
  ].join('\n')

  const res = await resend.emails.send({
    from: FROM_WEBSHOP,
    to,
    subject: `Nieuwe Webshop Bestelling ${orderRef} — ${customerName}`,
    html,
    text,
  })

  if (res.error) {
    console.error('⚠️ Resend fout bij verzenden bestelnotificatie naar webshop:', res.error)
  }
}

// Alias for backwards compatibility
export const sendKatrienNotification = sendWebshopOrderNotification

interface ContactFormNotificationParams {
  to?: string
  name: string
  email: string
  subject?: string
  message: string
}

export async function sendContactFormNotification(params: ContactFormNotificationParams) {
  const resend = getClient()
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY ontbreekt in environment variables; contactmail niet verstuurd.')
    return { ok: false, error: 'RESEND_API_KEY ontbreekt' }
  }

  const { name, email, subject, message } = params
  const to = params.to || 'groepsleiding@kriko-m.be'
  const emailSubject = subject?.trim()
    ? `[Contactformulier] ${subject.trim()} — ${name}`
    : `Nieuw bericht via het contactformulier — ${name}`

  const html = `<!doctype html><html><body style="margin:0;background:#F0ECE4;font-family:Arial,Helvetica,sans-serif;color:#2b2b2b;">
    <div style="max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#650B19;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;">
        <h1 style="margin:0;font-size:20px;">Nieuw Contactbericht</h1>
        <p style="margin:6px 0 0;opacity:.9;font-size:14px;">Ontvangen via het contactformulier op de website</p>
      </div>
      <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
        <div style="background:#F0ECE4;border-radius:10px;padding:16px 18px;margin-bottom:20px;">
          <h3 style="margin:0 0 10px;font-size:15px;color:#650B19;">Afzender</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:4px 0;color:#666;width:120px;">Naam:</td><td style="padding:4px 0;font-weight:bold;">${esc(name)}</td></tr>
            <tr><td style="padding:4px 0;color:#666;">E-mailadres:</td><td style="padding:4px 0;"><a href="mailto:${esc(email)}" style="color:#650B19;font-weight:bold;">${esc(email)}</a></td></tr>
            ${subject?.trim() ? `<tr><td style="padding:4px 0;color:#666;">Onderwerp:</td><td style="padding:4px 0;font-weight:bold;">${esc(subject.trim())}</td></tr>` : ''}
          </table>
        </div>

        <h3 style="margin:0 0 10px;font-size:15px;color:#650B19;">Bericht</h3>
        <div style="background:#FAF8F5;border:1px solid #E5DFD5;border-radius:8px;padding:16px;white-space:pre-wrap;line-height:1.6;font-size:14px;color:#2B2B2B;">${esc(message)}</div>

        <p style="margin:24px 0 0;font-size:13px;color:#777;line-height:1.5;">
          Je kan direct op deze e-mail antwoorden om contact op te nemen met <strong>${esc(name)}</strong> (<a href="mailto:${esc(email)}" style="color:#650B19;">${esc(email)}</a>).
        </p>
      </div>
    </div>
  </body></html>`

  const text = [
    `Nieuw bericht via het contactformulier van Scouts Kriko-M`,
    ``,
    `Naam: ${name}`,
    `E-mailadres: ${email}`,
    ...(subject?.trim() ? [`Onderwerp: ${subject.trim()}`] : []),
    ``,
    `Bericht:`,
    message,
    ``,
    `---`,
    `Beantwoord deze e-mail om rechtstreeks te antwoorden naar ${email}.`,
  ].join('\n')

  const res = await resend.emails.send({
    from: FROM_CONTACT,
    to,
    replyTo: email,
    subject: emailSubject,
    html,
    text,
  })

  if (res.error) {
    console.error('⚠️ Resend fout bij verzenden contactmail:', res.error)
    return { ok: false, error: res.error }
  } else {
    console.log('✅ Contactformulier e-mail succesvol verzonden van', FROM_CONTACT, 'naar:', to, 'ID:', res.data?.id)
    return { ok: true, data: res.data }
  }
}

