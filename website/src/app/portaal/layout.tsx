import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import PortaalLayoutClient from './PortaalLayoutClient'

export const metadata: Metadata = { title: 'Leiding login – Scouts Kriko-M' }

export default async function PortaalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  // getUser() valideert de sessie server-side (getSession() leest enkel de JWT
  // zonder verificatie — niet betrouwbaar voor rol-afhankelijke UI).
  const { data: { user } } = await supabase.auth.getUser()

  const naam = user ? ((user.user_metadata?.naam as string) || user.email?.split('@')[0] || 'gebruiker') : ''
  const role = user?.app_metadata?.role || ''

  return (
    <PortaalLayoutClient naam={naam} role={role}>
      {children}
    </PortaalLayoutClient>
  )
}
