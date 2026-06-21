import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding } from '@/lib/auth'
import { getActiveWerkjaar } from '@/lib/db'
import { revalidateTag } from 'next/cache'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
// Toegestane MIME-types → extensie. Extensie wordt afgeleid van het
// gevalideerde MIME-type, niet van file.name (dat is door de client te spoofen).
const ALLOWED_MIME: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
// Omslagfoto's: enkel afbeeldingen.
const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(req: NextRequest) {
  try {
    const user = await requireLeiding()
    if (!user) {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const uploadType = formData.get('type') as string | null

    if (!file || !uploadType) {
      return NextResponse.json({ error: 'Bestand en type zijn verplicht' }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Bestand is te groot (max. 10 MB).' }, { status: 400 })
    }

    const ext = ALLOWED_MIME[file.type]
    if (!ext) {
      return NextResponse.json({ error: 'Bestandstype niet toegestaan. Enkel PDF, JPG, PNG of WebP.' }, { status: 400 })
    }
    if (uploadType === 'kamp-foto' && !IMAGE_MIME.has(file.type)) {
      return NextResponse.json({ error: 'Omslagfoto moet een afbeelding zijn (JPG, PNG of WebP).' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const admin = createAdminClient()

    if (uploadType === 'kamp-foto') {
      const kampId = formData.get('kampId') as string | null
      if (!kampId) return NextResponse.json({ error: 'kampId is verplicht' }, { status: 400 })

      const filename = `kf-${kampId}-${Date.now()}.${ext}`

      // Upload naar storage
      const { error: storageError } = await admin.storage
        .from('kamp-fotos')
        .upload(filename, buffer, { contentType: file.type, upsert: true })

      if (storageError) throw storageError

      // Database bijwerken
      const { data, error: dbError } = await admin
        .from('kampen')
        .update({ foto: filename })
        .eq('id', kampId)
        .select()
        .single()

      if (dbError) throw dbError

      revalidateTag('kampen', 'max')
      return NextResponse.json(data)
    }

    if (uploadType === 'kamp-bestand') {
      const kampId = formData.get('kampId') as string | null
      const bestandType = formData.get('bestandType') as string | null
      const bestandNaam = formData.get('bestandNaam') as string | null

      if (!kampId || !bestandType || !bestandNaam) {
        return NextResponse.json({ error: 'kampId, bestandType en bestandNaam zijn verplicht' }, { status: 400 })
      }

      const filename = `kb-${kampId}-${bestandType}-${Date.now()}.${ext}`

      // Upload naar storage
      const { error: storageError } = await admin.storage
        .from('kamp-bestanden')
        .upload(filename, buffer, { contentType: file.type, upsert: true })

      if (storageError) throw storageError

      // Database invoegen
      const { data, error: dbError } = await admin
        .from('kamp_bestanden')
        .insert({
          kamp_id: kampId,
          type: bestandType,
          naam: bestandNaam,
          file_name: filename,
        })
        .select()
        .single()

      if (dbError) throw dbError

      revalidateTag('kampen', 'max')
      return NextResponse.json(data)
    }

    if (uploadType === 'evenement-cover' || uploadType === 'evenement-document') {
      // Evenement-media (enkel groepsleiding maakt evenementen aan; requireLeiding
      // volstaat hier voor de upload zelf — koppeling gebeurt via de calendar-API).
      if (uploadType === 'evenement-cover' && !IMAGE_MIME.has(file.type)) {
        return NextResponse.json({ error: 'Coverfoto moet een afbeelding zijn (JPG, PNG of WebP).' }, { status: 400 })
      }
      // Cover → publieke kamp-fotos bucket; document → publieke kamp-bestanden bucket.
      const bucket = uploadType === 'evenement-cover' ? 'kamp-fotos' : 'kamp-bestanden'
      const prefix = uploadType === 'evenement-cover' ? 'ev-cover' : 'ev-doc'
      const filename = `${prefix}-${Date.now()}.${ext}`

      const { error: storageError } = await admin.storage
        .from(bucket)
        .upload(filename, buffer, { contentType: file.type, upsert: true })
      if (storageError) throw storageError

      const { data: pub } = admin.storage.from(bucket).getPublicUrl(filename)
      return NextResponse.json({ url: pub.publicUrl })
    }

    if (uploadType === 'echo') {
      const echoTak = formData.get('echoTak') as string | null
      const echoMonth = formData.get('echoMonth') as string | null
      const echoYear = formData.get('echoYear') as string | null

      if (!echoTak || !echoMonth || !echoYear) {
        return NextResponse.json({ error: 'echoTak, echoMonth en echoYear zijn verplicht' }, { status: 400 })
      }

      const filename = `echo-${echoYear}-${echoMonth}-${echoTak}-${Date.now()}.${ext}`
      const capitalizedTak = echoTak.charAt(0).toUpperCase() + echoTak.slice(1)
      const title = `Kriko Echo ${capitalizedTak} ${echoMonth}/${echoYear}`

      // Upload naar storage
      const { error: storageError } = await admin.storage
        .from('echos')
        .upload(filename, buffer, { contentType: file.type, upsert: true })

      if (storageError) throw storageError

      // Database invoegen
      const { data, error: dbError } = await admin
        .from('echos')
        .insert({
          title,
          month: Number(echoMonth),
          year: Number(echoYear),
          tak: echoTak,
          file_name: filename,
          approved: true,
          werkjaar: await getActiveWerkjaar(),
        })
        .select()
        .single()

      if (dbError) throw dbError

      revalidateTag('echos', 'max')
      return NextResponse.json(data)
    }

    if (uploadType === 'portal-background') {
      if (!IMAGE_MIME.has(file.type)) {
        return NextResponse.json({ error: 'Achtergrond moet een afbeelding zijn (JPG, PNG of WebP).' }, { status: 400 })
      }
      
      const tak = formData.get('tak') as string | null
      if (!tak) return NextResponse.json({ error: 'tak is verplicht' }, { status: 400 })

      const filename = `portal-bg-${tak}-${Date.now()}.${ext}`

      const { error: storageError } = await admin.storage
        .from('kamp-fotos')
        .upload(filename, buffer, { contentType: file.type, upsert: true })

      if (storageError) throw storageError

      const { data: pub } = admin.storage.from('kamp-fotos').getPublicUrl(filename)
      return NextResponse.json({ url: pub.publicUrl })
    }

    return NextResponse.json({ error: 'Ongeldig uploadtype' }, { status: 400 })
  } catch (err) {
    console.error('Upload API error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Serverfout bij uploaden' }, { status: 500 })
  }
}
