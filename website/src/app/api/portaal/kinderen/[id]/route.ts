import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { id } = await params
  const admin = createAdminClient()

  // Verifieer dat dit kind van deze ouder is
  const { data: kind } = await admin
    .from('parent_children')
    .select('parent_id')
    .eq('id', id)
    .single()

  if (!kind || kind.parent_id !== user.id) {
    return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
  }

  await admin.from('parent_children').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
