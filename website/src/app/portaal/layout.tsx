import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import PortaalLayoutClient from './PortaalLayoutClient'

export const metadata: Metadata = { title: 'Portaal – Scouts Kriko-M' }

export default async function PortaalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  const user = session?.user
  const naam = user ? ((user.user_metadata?.naam as string) || user.email?.split('@')[0] || 'gebruiker') : ''
  const isAdmin = user ? (user.app_metadata?.role === 'admin' || user.app_metadata?.role === 'groepsleiding') : false
  const role = user?.app_metadata?.role || ''

  return (
    <PortaalLayoutClient naam={naam} isAdmin={isAdmin} role={role}>
      {children}
    </PortaalLayoutClient>
  )
}
