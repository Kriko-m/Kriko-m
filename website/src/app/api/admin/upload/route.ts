import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { revalidateTag } from 'next/cache'

async function requireLeiding() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const role = user.app_metadata?.role
  if (role !== 'admin' && role !== 'groepsleiding' && role !== 'leiding') return null
  return user
}

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

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const ext = file.name.split('.').pop() || ''

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
        })
        .select()
        .single()

      if (dbError) throw dbError

      revalidateTag('echos', 'max')
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Ongeldig uploadtype' }, { status: 400 })
  } catch (err: any) {
    console.error('Upload API error:', err)
    return NextResponse.json({ error: err.message || 'Serverfout bij uploaden' }, { status: 500 })
  }
}
