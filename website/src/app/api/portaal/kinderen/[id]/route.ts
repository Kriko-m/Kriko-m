import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { id } = await params

  // RLS restricts delete operations to parent_children owned by the logged-in user.
  // Using .select() tells us if a row was actually deleted.
  const { data, error } = await supabase
    .from('parent_children')
    .delete()
    .eq('id', id)
    .select('id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
