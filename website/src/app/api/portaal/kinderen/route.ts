import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { voornaam, tak } = await req.json()
  if (!voornaam?.trim() || !['kapoenen', 'welpen', 'jonggivers', 'givers'].includes(tak)) {
    return NextResponse.json({ error: 'Ongeldige gegevens' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('parent_children')
    .insert({ parent_id: user.id, voornaam: voornaam.trim(), tak, ga_id: `manual_${user.id}_${Date.now()}` })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
