import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireGroepsleiding } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = await requireGroepsleiding()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Inhoud is verplicht' }, { status: 400 })
  if (content.length > 2000) return NextResponse.json({ error: 'Bericht te lang' }, { status: 400 })

  const author_naam = (user.user_metadata?.naam as string) || user.email?.split('@')[0] || 'Groepsleiding'
  const author_email = user.email ?? ''

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('leiding_berichten')
    .insert({ content: content.trim(), author_naam, author_email })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
