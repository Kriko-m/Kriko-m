import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import PortaalNav from '../_components/PortaalNav'
import KinderenBeheer from './KinderenBeheer'

export default async function KinderenPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portaal')

  const naam = (user.user_metadata?.naam as string) || user.email?.split('@')[0] || 'gebruiker'
  const isAdmin = user.app_metadata?.role === 'admin' || user.app_metadata?.role === 'groepsleiding'

  const admin = createAdminClient()
  const { data: kinderen } = await admin
    .from('parent_children')
    .select('*')
    .eq('parent_id', user.id)
    .order('added_at', { ascending: true })

  return (
    <>
      <PortaalNav naam={naam} isAdmin={isAdmin} />
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <a href="/portaal/dashboard" style={{ color: '#6A8A75', textDecoration: 'none', fontSize: '.9rem', fontWeight: 600 }}>← Dashboard</a>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-heading, Nunito, sans-serif)', color: '#1A3D2A', margin: 0 }}>👧 Gekoppelde leden</h1>
        </div>
        <KinderenBeheer kinderen={kinderen ?? []} parentId={user.id} />
      </main>
    </>
  )
}
