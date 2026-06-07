import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Verplichte velden ontbreken' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { error } = await supabase.from('messages').insert({ name, email, subject: subject ?? '', message })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
