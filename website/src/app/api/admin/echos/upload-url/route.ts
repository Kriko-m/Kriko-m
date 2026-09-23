import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await requireLeiding()
    if (!user) {
      return NextResponse.json({ error: 'Geen toegang. Log opnieuw in.' }, { status: 403 })
    }

    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Ongeldige aanvraaggegevens' }, { status: 400 })
    }

    const { tak, month, year, fileSize } = body

    if (!tak || !month || !year) {
      return NextResponse.json({ error: 'Tak, maand en jaar zijn verplicht' }, { status: 400 })
    }

    // Controleer max bestandsgrootte (25 MB voor directe opslag)
    const MAX_DIRECT_BYTES = 25 * 1024 * 1024
    if (fileSize && Number(fileSize) > MAX_DIRECT_BYTES) {
      return NextResponse.json({ 
        error: `Bestand is te groot (${(fileSize / (1024 * 1024)).toFixed(1)} MB). Het maximum is 25 MB.` 
      }, { status: 400 })
    }

    const admin = createAdminClient()

    // Controleer of er al een Kriko Echo bestaat voor deze maand & jaar voor deze tak
    const { data: existingEcho, error: checkError } = await admin
      .from('echos')
      .select('id')
      .eq('tak', tak)
      .eq('month', Number(month))
      .eq('year', Number(year))
      .maybeSingle()

    if (checkError) {
      console.error('Fout bij controleren bestaande echo:', checkError)
      return NextResponse.json({ error: `Databasefout bij controle: ${checkError.message}` }, { status: 500 })
    }

    if (existingEcho) {
      return NextResponse.json({
        error: 'Er bestaat al een Kriko Echo voor deze maand. Verwijder eerst de bestaande Echo als je deze wilt vervangen.'
      }, { status: 400 })
    }

    const filename = `echo-${year}-${month}-${tak}-${Date.now()}.pdf`
    const capitalizedTak = tak.charAt(0).toUpperCase() + tak.slice(1)
    const title = `Kriko Echo ${capitalizedTak} ${month}/${year}`

    // Maak een veilige signed upload URL aan in Supabase Storage
    const { data: signData, error: signError } = await admin.storage
      .from('echos')
      .createSignedUploadUrl(filename)

    if (signError || !signData) {
      console.error('Supabase signed URL error:', signError)
      return NextResponse.json({ 
        error: `Kon upload-link niet genereren in opslag: ${signError?.message || 'Onbekende fout'}` 
      }, { status: 500 })
    }

    return NextResponse.json({
      signedUrl: signData.signedUrl,
      path: signData.path,
      token: signData.token,
      filename,
      title,
    })
  } catch (err: unknown) {
    console.error('Echo upload-url error:', err)
    const message = err instanceof Error 
      ? err.message 
      : typeof err === 'object' && err !== null && 'message' in err 
        ? String((err as { message: unknown }).message) 
        : 'Onbekende serverfout bij aanmaken upload'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
