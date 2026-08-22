import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { sendContactFormNotification } from '@/lib/email'

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
    
    // Bewaar het bericht in de database
    try {
      const { error } = await supabase.from('messages').insert({
        name: name.trim(),
        email: email.trim(),
        subject: (subject ?? '').slice(0, 200),
        message: message.slice(0, 5000),
      })
      if (error) {
        console.error('⚠️ Fout bij opslaan bericht in database:', error)
      }
    } catch (dbErr) {
      console.error('⚠️ Database insert fout bij contactbericht:', dbErr)
    }

    // Zoek het contact e-mailadres uit de settings (standaard groepsleiding@kriko-m.be)
    let targetEmail = 'groepsleiding@kriko-m.be'
    try {
      const { data: settings } = await supabase.from('settings').select('contact_email').eq('id', 1).single()
      if (settings?.contact_email && typeof settings.contact_email === 'string' && settings.contact_email.trim() !== '') {
        targetEmail = settings.contact_email.trim()
      }
    } catch (settingsErr) {
      console.warn('Kon contact_email niet ophalen uit settings; standaard naar groepsleiding@kriko-m.be:', settingsErr)
    }

    const emailResult = await sendContactFormNotification({
      to: targetEmail,
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim(),
      message: message.trim(),
    })

    return NextResponse.json({ ok: true, emailSent: emailResult?.ok ?? false })
  } catch (err) {
    console.error('❌ Server error in /api/contact:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
