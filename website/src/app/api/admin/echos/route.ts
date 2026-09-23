import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding } from '@/lib/auth'
import { getActiveWerkjaar } from '@/lib/db'
import { revalidateTag } from 'next/cache'

export async function POST(req: NextRequest) {
  try {
    const user = await requireLeiding()
    if (!user) {
      return NextResponse.json({ error: 'Geen toegang. Log opnieuw in.' }, { status: 403 })
    }

    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Geen gegevens ontvangen' }, { status: 400 })
    }

    const { title, tak, month, year, filename } = body

    if (!title || !tak || !month || !year || !filename) {
      return NextResponse.json({ error: 'Niet alle verplichte velden zijn meegegeven' }, { status: 400 })
    }

    const admin = createAdminClient()
    const activeWerkjaar = await getActiveWerkjaar()

    const { data, error: dbError } = await admin
      .from('echos')
      .insert({
        title,
        month: Number(month),
        year: Number(year),
        tak,
        file_name: filename,
        approved: false,
        werkjaar: activeWerkjaar,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Echo database insert error:', dbError)
      // Probeer geüpload bestand weer op te ruimen bij databasefout
      await admin.storage.from('echos').remove([filename]).catch(() => null)
      return NextResponse.json({ error: `Fout bij opslaan in database: ${dbError.message}` }, { status: 500 })
    }

    revalidateTag('echos', 'max')
    return NextResponse.json(data)
  } catch (err: unknown) {
    console.error('Register Echo error:', err)
    const message = err instanceof Error 
      ? err.message 
      : typeof err === 'object' && err !== null && 'message' in err 
        ? String((err as { message: unknown }).message) 
        : 'Onbekende serverfout bij registreren Echo'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
