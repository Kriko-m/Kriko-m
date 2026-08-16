import type { Metadata } from 'next'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import PortaalLayoutClient from './PortaalLayoutClient'
import { Settings } from '@/lib/types'
import { normalizeSettings } from '@/lib/db'

export const metadata: Metadata = { title: 'Leiding login – Scouts Kriko-M' }

export default async function PortaalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const naam = user ? ((user.user_metadata?.naam as string) || user.email?.split('@')[0] || 'gebruiker') : ''
  const role = user?.app_metadata?.role || ''

  let settings: Settings | null = null
  try {
    const admin = createAdminClient()
    const { data } = await admin.from('settings').select('*').single()
    if (data) settings = normalizeSettings(data) as Settings
  } catch (err) {
    console.error('Error fetching settings in PortaalLayout:', err)
  }

  return (
    <PortaalLayoutClient naam={naam} role={role} settings={settings}>
      {children}
    </PortaalLayoutClient>
  )
}
