import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { kamp_id, ga_id, opmerking } = await req.json()

  // RLS enforces:
  // 1. 'door' must match user.id
  // 2. 'ga_id' must exist in parent_children for this user
  const { error } = await supabase.from('kampinschrijvingen').insert({
    kamp_id, ga_id, opmerking: opmerking ?? '', door: user.id,
  })

  if (error) {
    if (error.code === '42501') {
      return NextResponse.json({ error: 'Lid niet gevonden of geen toegang' }, { status: 403 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { kamp_id, ga_id } = await req.json()

  // RLS restricts deletes to registrations connected to user's children.
  // Using .select() tells us if a row was actually deleted.
  const { data, error } = await supabase
    .from('kampinschrijvingen')
    .delete()
    .eq('kamp_id', kamp_id)
    .eq('ga_id', ga_id)
    .select('id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Inschrijving niet gevonden of geen toegang' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
