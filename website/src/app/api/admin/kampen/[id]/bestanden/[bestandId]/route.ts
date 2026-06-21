import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding } from '@/lib/auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; bestandId: string }> }
) {
  try {
    const user = await requireLeiding()
    if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

    const { id: kampId, bestandId } = await params
    const admin = createAdminClient()

    // Ophalen voor opslagverwijdering
    const { data: bestand } = await admin
      .from('kamp_bestanden')
      .select('file_name')
      .eq('id', bestandId)
      .eq('kamp_id', kampId)
      .single()

    if (bestand?.file_name) {
      await admin.storage.from('kamp-bestanden').remove([bestand.file_name])
    }

    const { error } = await admin.from('kamp_bestanden').delete().eq('id', bestandId)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Delete camp file error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Serverfout bij verwijderen' }, { status: 500 })
  }
}
