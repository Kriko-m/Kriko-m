import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import LeidingPanel from './LeidingPanel'
import { Settings } from '@/lib/types'
import { normalizeSettings } from '@/lib/db'

export default async function LeidingPortaalPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')

  const { data: { user: verified }, error } = await supabase.auth.getUser()
  if (error || !verified) redirect('/portaal')

  const role = verified.app_metadata?.role || ''
  const isLeiding = role === 'admin' || role === 'groepsleiding' || role === 'leiding'
  if (!isLeiding) redirect('/portaal')

  const isGroepsleiding = role === 'admin' || role === 'groepsleiding'
  const naam = verified.user_metadata?.naam || (isGroepsleiding ? 'Groepsleiding' : 'Leiding')

  let settings: Settings | null = null
  try {
    const admin = createAdminClient()
    const { data } = await admin.from('settings').select('*').eq('id', 1).single()
    if (data) settings = normalizeSettings(data) as Settings
  } catch (err) {
    console.error('Error loading settings on portaal leiding page:', err)
  }

  return (
    <LeidingPanel
      isGroepsleiding={isGroepsleiding}
      naam={naam}
      settings={settings}
    />
  )
}
