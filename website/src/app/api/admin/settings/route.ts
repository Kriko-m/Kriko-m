import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireGroepsleiding } from '@/lib/auth'
import { revalidateTag } from 'next/cache'
import { TAKKEN } from '@/lib/constants'

// Welke publieke tak-velden de website-content-editor mag aanpassen.
const TAK_EDITABLE_FIELDS = ['email', 'whatsapp_url', 'description', 'uniform', 'photo'] as const

export async function PATCH(req: NextRequest) {
  const user = await requireGroepsleiding()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = await req.json()
  const allowed = [
    'scouts_year',
    'bank_iban',
    'bank_bic',
    'bank_holder',
    'alert_message',
    'alert_active',
    'reg_fee_first',
    'reg_fee_extra',
    'home_leiding_foto',
  ]
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) {
      if (key === 'alert_active') {
        update[key] = body[key] === 'true' || body[key] === true
      } else if (key === 'reg_fee_first' || key === 'reg_fee_extra') {
        update[key] = Number(body[key]) || 0
      } else {
        update[key] = String(body[key]).slice(0, 1000)
      }
    }
  }

  const admin = createAdminClient()

  // Takken-content (publieke takpagina's): veilige per-tak merge op de
  // bestaande JSONB zodat we nooit andere takken/velden overschrijven.
  if (body.takken && typeof body.takken === 'object') {
    const { data: current } = await admin.from('settings').select('takken').eq('id', 1).single()
    const merged: Record<string, Record<string, unknown>> = { ...(current?.takken ?? {}) }

    for (const [tak, incoming] of Object.entries(body.takken as Record<string, unknown>)) {
      if (!(TAKKEN as readonly string[]).includes(tak)) continue
      if (!incoming || typeof incoming !== 'object') continue
      const src = incoming as Record<string, unknown>
      const target = { ...(merged[tak] ?? {}) }

      for (const field of TAK_EDITABLE_FIELDS) {
        if (field in src) target[field] = String(src[field] ?? '').slice(0, 2000)
      }

      if (Array.isArray(src.leaders)) {
        target.leaders = (src.leaders as unknown[])
          .filter(l => l && typeof l === 'object')
          .map(l => ({
            name: String((l as Record<string, unknown>).name ?? '').slice(0, 120),
            totem: String((l as Record<string, unknown>).totem ?? '').slice(0, 200),
            role: String((l as Record<string, unknown>).role ?? '').slice(0, 120),
            phone: String((l as Record<string, unknown>).phone ?? '').slice(0, 60),
          }))
          .filter(l => l.name)
      }

      merged[tak] = target
    }

    update.takken = merged
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Geen geldige velden' }, { status: 400 })
  }

  const { data, error } = await admin.from('settings').update(update).eq('id', 1).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidateTag('settings', 'max')
  return NextResponse.json(data)
}
