import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding, requireGroepsleiding } from '@/lib/auth'
import { AUDIENCE_TAGS } from '@/lib/constants'
import { revalidateTag } from 'next/cache'

const VALID_AUDIENCE = new Set<string>(AUDIENCE_TAGS)

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireLeiding()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const admin = createAdminClient()

  // Bestaand event ophalen om de rechten te bepalen.
  const { data: existing, error: fetchErr } = await admin
    .from('calendar')
    .select('audience, is_evenement')
    .eq('id', id)
    .single()
  if (fetchErr || !existing) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  const resultingAudience: string[] = 'audience' in body
    ? (Array.isArray(body.audience) ? body.audience.filter((a: string) => VALID_AUDIENCE.has(a)) : [])
    : (existing.audience ?? [])
  const resultingEvenement = 'is_evenement' in body ? !!body.is_evenement : !!existing.is_evenement

  const touchesPublic =
    resultingAudience.includes('ouders') || (existing.audience ?? []).includes('ouders')
  const touchesEvenement = resultingEvenement || existing.is_evenement

  // Publieke events / evenementen mogen enkel door groepsleiding bewerkt worden.
  if (touchesPublic || touchesEvenement) {
    const gl = await requireGroepsleiding()
    if (!gl) return NextResponse.json({ error: 'Enkel groepsleiding kan publieke events of evenementen bewerken.' }, { status: 403 })
  }

  const update: Record<string, unknown> = {}
  for (const key of ['title', 'date', 'datum_tot', 'time', 'location', 'description', 'facebook_event_url', 'external_link_url']) {
    if (key in body) update[key] = body[key] ?? null
  }
  if ('audience' in body) update.audience = [...new Set(resultingAudience)]
  if ('is_evenement' in body) update.is_evenement = resultingEvenement
  // Media enkel zinvol op evenementen.
  if ('cover_image' in body) update.cover_image = resultingEvenement ? (body.cover_image || '') : ''
  if ('document_url' in body) update.document_url = resultingEvenement ? (body.document_url || '') : ''
  if ('banner_image' in body) update.banner_image = resultingEvenement ? (body.banner_image || '') : ''
  if ('header' in body) update.header = resultingEvenement ? (body.header || '') : ''
  if ('body' in body) update.body = resultingEvenement ? (body.body || '') : ''

  const { data, error } = await admin
    .from('calendar')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidateTag('calendar', 'max')
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
  const { error } = await admin.from('calendar').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidateTag('calendar', 'max')
  return NextResponse.json({ ok: true })
}
