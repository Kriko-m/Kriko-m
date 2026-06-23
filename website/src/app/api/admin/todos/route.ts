import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding } from '@/lib/auth'
import { getActiveWerkjaar } from '@/lib/db'

export async function GET(req: NextRequest) {
  const user = await requireLeiding()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === '1'
  const tak = searchParams.get('tak') || 'evenementen'

  const werkjaar = await getActiveWerkjaar()
  const admin = createAdminClient()
  let query = admin
    .from('todos')
    .select('*')
    .eq('werkjaar', werkjaar)

  // all=1 → alle takken (groepsleiding-overzicht); anders één tak.
  if (!all) query = query.eq('tak', tak)

  const { data, error } = await query.order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const user = await requireLeiding()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = await req.json()
  const { title, month, tak } = body

  if (!title || !month || !tak) {
    return NextResponse.json({ error: 'Ontbrekende velden' }, { status: 400 })
  }

  const werkjaar = await getActiveWerkjaar()
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('todos')
    .insert({
      title,
      month: Number(month),
      tak,
      completed: false,
      werkjaar,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
