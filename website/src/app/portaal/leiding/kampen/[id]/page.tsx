import { redirect, notFound } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import { Kamp } from '@/lib/types'
import KampBeheer from './KampBeheer'

export default async function KampBeheerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')

  const role = session.user.app_metadata?.role || ''
  const isLeiding = role === 'admin' || role === 'groepsleiding' || role === 'leiding'
  if (!isLeiding) redirect('/portaal')

  const { id } = await params
  const admin = createAdminClient()
  const { data } = await admin
    .from('kampen')
    .select('*, kamp_bestanden(*)')
    .eq('id', id)
    .single()

  if (!data) notFound()
  const kamp = data as Kamp
  const canPublish = role === 'admin' || role === 'groepsleiding'

  return (
    <div className="portaal-dashboard-bg-wrapper" style={{ '--portal-bg': "url('/images/hero-bg.webp')" } as React.CSSProperties}>
      <div className="portaal-dashboard-card">
        <KampBeheer initialKamp={kamp} canPublish={canPublish} />
      </div>
    </div>
  )
}
