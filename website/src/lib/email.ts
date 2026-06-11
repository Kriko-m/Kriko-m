import { Resend } from 'resend'
import { OrderItem } from '@/lib/types'

// Resend-client. Wordt alleen server-side gebruikt (API routes).
// RESEND_API_KEY moet gezet zijn; RESEND_FROM moet een geverifieerd
// afzenderdomein zijn (zie Resend-dashboard → Domains).
const FROM = process.env.RESEND_FROM || 'Scouts Kriko-M <bestellingen@kriko-m.be>'
// Optioneel: stuur een kopie naar het groepsadres (komma-gescheiden mogelijk).
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
  childName: string
  items: OrderItem[]
  total: number
  communication: string
  bankIban: string
  bankHolder: string
}

export async function sendOrderConfirmation(params: OrderConfirmationParams) {
  const resend = getClient()
  if (!resend) {
    // Geen API-key geconfigureerd — sla over in plaats van te crashen.
    console.warn('RESEND_API_KEY ontbreekt; bevestigingsmail niet verstuurd.')
    return
  }

  const { to, orderRef, customerName, childName, items, total, communication, bankIban, bankHolder } = params

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
        <h1 style="margin:0;font-size:20px;">Bedankt voor je bestelling!</h1>
        <p style="margin:6px 0 0;opacity:.9;font-size:14px;">Bestelling ${esc(orderRef)}</p>
      </div>
      <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;">
        <p style="margin:0 0 16px;">Hallo ${esc(customerName)},</p>
        <p style="margin:0 0 20px;line-height:1.5;">We hebben je bestelling voor <strong>${esc(childName)}</strong> goed ontvangen. Voltooi de betaling via overschrijving met onderstaande gegevens. Vermeld de gestructureerde mededeling <strong>exact</strong>, anders kunnen we je betaling niet automatisch verwerken.</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">${itemRows}
          <tr><td style="padding:10px 0 0;font-weight:bold;">Totaal</td><td style="padding:10px 0 0;text-align:right;font-weight:bold;">${euro(total)}</td></tr>
        </table>

        <div style="background:#F0ECE4;border-radius:10px;padding:16px 18px;">
          <h2 style="margin:0 0 12px;font-size:15px;color:#650B19;">Overschrijvingsgegevens</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:3px 0;color:#666;">Begunstigde</td><td style="padding:3px 0;text-align:right;">${esc(bankHolder)}</td></tr>
            <tr><td style="padding:3px 0;color:#666;">IBAN</td><td style="padding:3px 0;text-align:right;font-family:monospace;">${esc(bankIban)}</td></tr>
            <tr><td style="padding:3px 0;color:#666;">Bedrag</td><td style="padding:3px 0;text-align:right;font-weight:bold;">${euro(total)}</td></tr>
            <tr><td style="padding:3px 0;color:#666;">Mededeling</td><td style="padding:3px 0;text-align:right;font-weight:bold;font-family:monospace;">${esc(communication)}</td></tr>
          </table>
        </div>

        <p style="margin:20px 0 0;font-size:13px;color:#888;line-height:1.5;">Zodra we de betaling ontvangen, ligt je bestelling de eerstvolgende zondag na de vergadering klaar aan de lokalen.</p>
        <p style="margin:16px 0 0;font-size:13px;color:#888;">Stevige linkerhand,<br/>Scouts Kriko-M</p>
      </div>
    </div>
  </body></html>`

  const text = [
    `Bedankt voor je bestelling! (${orderRef})`,
    ``,
    `Hallo ${customerName},`,
    `We hebben je bestelling voor ${childName} goed ontvangen.`,
    ``,
    ...items.map((i) => `- ${i.quantity}x ${i.name} (${i.size}): ${euro(i.price * i.quantity)}`),
    `Totaal: ${euro(total)}`,
    ``,
    `Overschrijvingsgegevens:`,
    `  Begunstigde: ${bankHolder}`,
    `  IBAN: ${bankIban}`,
    `  Bedrag: ${euro(total)}`,
    `  Mededeling: ${communication} (exact vermelden!)`,
    ``,
    `Zodra we de betaling ontvangen, ligt je bestelling de eerstvolgende zondag klaar aan de lokalen.`,
    `Stevige linkerhand, Scouts Kriko-M`,
  ].join('\n')

  await resend.emails.send({
    from: FROM,
    to,
    ...(BCC ? { bcc: BCC.split(',').map((s) => s.trim()).filter(Boolean) } : {}),
    subject: `Bestelling ${orderRef} — Scouts Kriko-M`,
    html,
    text,
  })
}
