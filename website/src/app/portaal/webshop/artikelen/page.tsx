import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import WebshopPageClient from '../WebshopPageClient'
import { Settings } from '@/lib/types'
import { normalizeSettings } from '@/lib/db'

export const metadata = { title: 'Artikelen & Assortiment — Webshop & Uniformen | Kriko-M' }

export default async function WebshopArtikelenPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')

  const { data: { user: verified }, error } = await supabase.auth.getUser()
  if (error || !verified) redirect('/portaal')

  const role = verified.app_metadata?.role || ''
  const isAuthorized = role === 'admin' || role === 'groepsleiding' || role === 'webshop'
  if (!isAuthorized) redirect('/portaal/home')

  const admin = createAdminClient()
  const { data: settingsData } = await admin.from('settings').select('*').single()

  return (
    <WebshopPageClient
      initialSettings={normalizeSettings(settingsData) as Settings}
      role={role}
      activeTab="artikelen"
    />
  )
}
