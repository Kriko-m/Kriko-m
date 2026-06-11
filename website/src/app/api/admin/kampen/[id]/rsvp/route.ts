import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding } from '@/lib/auth'
import { TAKKEN } from '@/lib/constants'

const VALID_TAKKEN = new Set<string>(TAKKEN)
const VALID_STATUS = new Set(['ja', 'nee'])

// Lijst van antwoorden voor een kamp.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireLeiding()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { id } = await params
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('kamp_rsvp')
    .select('id, kamp_id, kind_naam, tak, status, opmerking, created_at, updated_at')
    .eq('kamp_id', id)
    .order('tak', { ascending: true })
    .order('kind_naam', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// Bewerk één antwoord (naam/tak/status/opmerking corrigeren).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireLeiding()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { id: kampId } = await params
  const body = await req.json()
  const { rsvp_id } = body
  if (!rsvp_id) return NextResponse.json({ error: 'rsvp_id ontbreekt' }, { status: 400 })

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if ('kind_naam' in body) {
    const naam = String(body.kind_naam ?? '').trim().replace(/\s+/g, ' ')
    if (!naam || naam.length > 120) return NextResponse.json({ error: 'Ongeldige naam' }, { status: 400 })
    update.kind_naam = naam
  }
  if ('tak' in body) {
    if (!VALID_TAKKEN.has(body.tak)) return NextResponse.json({ error: 'Ongeldige tak' }, { status: 400 })
    update.tak = body.tak
  }
  if ('status' in body) {
    if (!VALID_STATUS.has(body.status)) return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 })
    update.status = body.status
  }
  if ('opmerking' in body) {
    update.opmerking = String(body.opmerking ?? '').slice(0, 500)
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('kamp_rsvp')
    .update(update)
    .eq('id', rsvp_id)
    .eq('kamp_id', kampId)
    .select('id, kamp_id, kind_naam, tak, status, opmerking, created_at, updated_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Verwijder één antwoord (junk/duplicaat opruimen).
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireLeiding()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { id: kampId } = await params
  const { rsvp_id } = await req.json()
  if (!rsvp_id) return NextResponse.json({ error: 'rsvp_id ontbreekt' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('kamp_rsvp').delete().eq('id', rsvp_id).eq('kamp_id', kampId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
