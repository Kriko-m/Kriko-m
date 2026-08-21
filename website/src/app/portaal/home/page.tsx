import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import LeidingPanel from '../leiding/LeidingPanel'
import { Settings } from '@/lib/types'
import { normalizeSettings } from '@/lib/db'

export default async function HomePage() {
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
  const naam = verified.user_metadata?.naam || (isGroepsleiding ? 'Groepsleiding' : 'Leiding')

  let settings: Settings | null = null
  let unapprovedEchosCount = 0
  try {
    const admin = createAdminClient()
    const [settingsRes, echosRes] = await Promise.all([
      admin.from('settings').select('*').eq('id', 1).single(),
      isGroepsleiding
        ? admin.from('echos').select('*', { count: 'exact', head: true }).eq('approved', false)
        : Promise.resolve({ count: 0 }),
    ])
    if (settingsRes.data) settings = normalizeSettings(settingsRes.data) as Settings
    if (echosRes.count) unapprovedEchosCount = echosRes.count
  } catch (err) {
    console.error('Error loading data on portaal home:', err)
  }

  return (
    <LeidingPanel
      isGroepsleiding={isGroepsleiding}
      naam={naam}
      settings={settings}
      unapprovedEchosCount={unapprovedEchosCount}
    />
  )
}
