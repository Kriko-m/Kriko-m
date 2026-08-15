import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import WebsiteBeheerClient from './WebsiteBeheerClient'
import { Settings } from '@/lib/types'

export const metadata = { title: 'Website Beheer — Portaal' }

export default async function WebsiteBeheerPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')

  const { data: { user: verified }, error } = await supabase.auth.getUser()
  if (error || !verified) redirect('/portaal')

  const role = verified.app_metadata?.role || ''
  const isGroepsleiding = role === 'admin' || role === 'groepsleiding'
  if (!isGroepsleiding) redirect('/portaal/home')

  const admin = createAdminClient()
  const { data: settingsData } = await admin.from('settings').select('*').single()

  return <WebsiteBeheerClient initialSettings={settingsData as Settings} />
}
