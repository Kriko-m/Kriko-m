import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'

async function getUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function verifyChild(admin: ReturnType<typeof createAdminClient>, parentId: string, ga_id: string) {
  const { data } = await admin.from('parent_children').select('id').eq('parent_id', parentId).eq('ga_id', ga_id).single()
  return !!data
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { kamp_id, ga_id, opmerking } = await req.json()
  const admin = createAdminClient()

  if (!await verifyChild(admin, user.id, ga_id)) {
    return NextResponse.json({ error: 'Lid niet gevonden' }, { status: 403 })
  }

  const { error } = await admin.from('kampinschrijvingen').insert({
    kamp_id, ga_id, opmerking: opmerking ?? '', door: user.id,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { kamp_id, ga_id } = await req.json()
  const admin = createAdminClient()

  if (!await verifyChild(admin, user.id, ga_id)) {
    return NextResponse.json({ error: 'Lid niet gevonden' }, { status: 403 })
  }

  await admin.from('kampinschrijvingen').delete().eq('kamp_id', kamp_id).eq('ga_id', ga_id)
  return NextResponse.json({ ok: true })
}
