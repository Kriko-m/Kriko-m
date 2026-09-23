import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import EchoManager from '../_components/EchoManager'
import { Echo } from '@/lib/types'

export const metadata = { title: 'Kriko Echo — Portaal' }

export default async function EchosPortaalPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')

  const { data: { user: verified }, error } = await supabase.auth.getUser()
  if (error || !verified) redirect('/portaal')

  const role = verified.app_metadata?.role || ''
  if (role === 'webshop') redirect('/portaal?error=unauthorized')

  const isLeiding = role === 'admin' || role === 'groepsleiding' || role === 'leiding'
  if (!isLeiding) redirect('/portaal')

  const isGroepsleiding = role === 'admin' || role === 'groepsleiding'

  const admin = createAdminClient()
  const [echosRes, storageFilesRes] = await Promise.all([
    admin
      .from('echos')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false }),
    admin.storage.from('echos').list(),
  ])

  const sizeMap: Record<string, number> = {}
  if (storageFilesRes.data) {
    for (const f of storageFilesRes.data) {
      if (f.name && f.metadata?.size) {
        sizeMap[f.name] = f.metadata.size
      }
    }
  }

  const echos: Echo[] = (echosRes.data ?? []).map((echo) => ({
    ...echo,
    file_size: sizeMap[echo.file_name] ?? undefined,
  })) as Echo[]

  return <EchoManager initialEchos={echos} isGroepsleiding={isGroepsleiding} />
}
