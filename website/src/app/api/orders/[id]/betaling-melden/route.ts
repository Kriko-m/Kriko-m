import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { id } = await params
  const admin = createAdminClient()

  // Controleer dat deze bestelling van deze gebruiker is
  const { data: order } = await admin
    .from('orders')
    .select('id, status, email')
    .eq('id', id)
    .single()

  if (!order || order.email.toLowerCase() !== user.email!.toLowerCase()) {
    return NextResponse.json({ error: 'Bestelling niet gevonden' }, { status: 404 })
  }
  if (order.status !== 'pending') {
    return NextResponse.json({ error: 'Status kan niet gewijzigd worden' }, { status: 400 })
  }

  await admin.from('orders').update({ status: 'waiting_approval' }).eq('id', id)
  return NextResponse.json({ ok: true })
}
