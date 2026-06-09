import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { getSettings } from '@/lib/db'
import { Order } from '@/lib/types'
import PortaalNav from '../_components/PortaalNav'
import BestellingCard from './BestellingCard'

export default async function BestellingenPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')
  const user = session.user

  const role = user.app_metadata?.role || ''
  const isLeiding = role === 'admin' || role === 'groepsleiding' || role === 'leiding'
  if (isLeiding) redirect('/portaal/dashboard')

  const naam = (user.user_metadata?.naam as string) || user.email?.split('@')[0] || 'gebruiker'
  const isAdmin = role === 'admin' || role === 'groepsleiding'

  const admin = createAdminClient()
  const [authRes, settings, ordersRes] = await Promise.all([
    supabase.auth.getUser(),
    getSettings(),
    admin
      .from('orders')
      .select('*')
      .eq('email', user.email!)
      .order('created_at', { ascending: false })
  ])

  if (authRes.error || !authRes.data.user) redirect('/portaal')

  const bankIban = settings?.bank_iban || 'BE76 1234 5678 9012'
  const bankHolder = settings?.bank_holder || 'Scouts Kriko-M vzw'

  const orders = ((ordersRes.data ?? []) as Order[]).map(order => ({
    ...order,
    bank_iban: bankIban,
    bank_holder: bankHolder,
  }))

  return (
    <>
      <PortaalNav naam={naam} isAdmin={isAdmin} role={user.app_metadata?.role} />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px 80px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <a href="/portaal/dashboard" style={{ color: '#6A8A75', textDecoration: 'none', fontSize: '.9rem', fontWeight: 600 }}>← Dashboard</a>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-heading, Nunito, sans-serif)', color: '#1A3D2A', margin: 0 }}>🛍️ Mijn bestellingen</h1>
        </div>

        {!orders || orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6A8A75' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🛒</div>
            <p style={{ marginBottom: 20 }}>Je hebt nog geen bestellingen geplaatst.</p>
            <a href="/shop" style={{ display: 'inline-block', padding: '12px 24px', background: '#1A3D2A', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
              Naar de webshop
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map((order: Order) => (
              <BestellingCard key={order.id} order={order} />
            ))}
          </div>
        )}

      </main>
    </>
  )
}
