import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { requireLeiding } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireLeiding()
    if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

    const { id } = await params
    const admin = createAdminClient()

    // Eerst bestandsnaam ophalen voor opslagverwijdering
    const { data: echo } = await admin
      .from('echos')
      .select('file_name')
      .eq('id', id)
      .single()

    if (echo?.file_name) {
      await admin.storage.from('echos').remove([echo.file_name])
    }

    const { error } = await admin.from('echos').delete().eq('id', id)
    if (error) throw error

    revalidateTag('echos', 'max')
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Delete Echo error:', err)
    return NextResponse.json({ error: err.message || 'Serverfout bij verwijderen' }, { status: 500 })
  }
}
