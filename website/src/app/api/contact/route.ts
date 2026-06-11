import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message, website } = await req.json()

    // Honeypot — bots vullen dit verborgen veld in.
    if (typeof website === 'string' && website.trim() !== '') {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Verplichte velden ontbreken' }, { status: 400 })
    }
    // Lengtelimieten tegen misbruik / oversized payloads.
    if (name.length > 120 || email.length > 160 || (subject?.length ?? 0) > 200 || message.length > 5000) {
      return NextResponse.json({ error: 'Een van de velden is te lang.' }, { status: 400 })
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Vul een geldig e-mailadres in.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('messages').insert({
      name: name.trim(),
      email: email.trim(),
      subject: (subject ?? '').slice(0, 200),
      message: message.slice(0, 5000),
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
