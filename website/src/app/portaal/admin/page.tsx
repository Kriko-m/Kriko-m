import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import AdminTabs from './AdminTabs'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')
  const user = session.user

  const isAdmin = user.app_metadata?.role === 'admin' || user.app_metadata?.role === 'groepsleiding'
  if (!isAdmin) redirect('/portaal')

  const naam = (user.user_metadata?.naam as string) || user.email?.split('@')[0] || 'gebruiker'
  const admin = createAdminClient()

  const [authRes, ordersRes, messagesRes, settingsRes] = await Promise.all([
    supabase.auth.getUser(),
    admin.from('orders').select('*').order('created_at', { ascending: false }),
    admin.from('messages').select('*').order('created_at', { ascending: false }),
    admin.from('settings').select('*').single(),
  ])

  if (authRes.error || !authRes.data.user) redirect('/portaal')

  return (
    <>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-heading, Nunito, sans-serif)', color: '#1A3D2A', margin: 0 }}>⚙️ Beheer</h1>
        </div>

        <AdminTabs
          orders={ordersRes.data ?? []}
          messages={messagesRes.data ?? []}
          settings={settingsRes.data ?? {}}
        />
      </main>
    </>
  )
}
