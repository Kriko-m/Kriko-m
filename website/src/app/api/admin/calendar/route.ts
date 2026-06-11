import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding } from '@/lib/auth'
import { getActiveWerkjaar } from '@/lib/db'
import { revalidateTag } from 'next/cache'

export async function POST(req: NextRequest) {
  const user = await requireLeiding()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = await req.json()
  const werkjaar = await getActiveWerkjaar()
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('calendar')
    .insert({
      title: body.title,
      date: body.date,
      time: body.time || '',
      location: body.location || '',
      description: body.description || '',
      tak: body.tak || 'groep',
      werkjaar,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  revalidateTag('calendar', 'max')
  return NextResponse.json(data)
}
