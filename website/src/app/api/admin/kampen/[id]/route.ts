import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding, requireGroepsleiding } from '@/lib/auth'
import { sanitizeKampAudience } from '@/lib/kamp'
import { revalidateTag } from 'next/cache'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireLeiding()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const allowed = ['naam', 'datum_van', 'datum_tot', 'locatie', 'beschrijving', 'prijs', 'paklijst', 'briefadres', 'contact_info', 'foto']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  // Tags (audience) apart valideren; 'groep'/'leiding' enkel voor groepsleiding.
  if ('audience' in body) {
    const { audience, needsGroepsleiding } = sanitizeKampAudience(body.audience)
    if (audience.length === 0) {
      return NextResponse.json({ error: 'Selecteer minstens één tag.' }, { status: 400 })
    }
    if (needsGroepsleiding && !(await requireGroepsleiding())) {
      return NextResponse.json({ error: 'Enkel groepsleiding mag de tags ‘groep’ of ‘leiding’ gebruiken.' }, { status: 403 })
    }
    update.audience = audience
  }

  const admin = createAdminClient()
  const { data, error } = await admin.from('kampen').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  revalidateTag('kampen', 'max')
  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireLeiding()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { id } = await params
  const admin = createAdminClient()
  await admin.from('kampen').delete().eq('id', id)
  
  revalidateTag('kampen', 'max')
  return NextResponse.json({ ok: true })
}
