import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase'
import EchoManager from '../_components/EchoManager'
import { Echo } from '@/lib/types'

export const metadata = { title: 'Kriko Echo — Portaal' }

export default async function EchosPortaalPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/portaal')

  const { data: { user: verified }, error } = await supabase.auth.getUser()
  if (error || !verified) redirect('/portaal')

  const role = verified.app_metadata?.role || ''
  const isLeiding = role === 'admin' || role === 'groepsleiding' || role === 'leiding'
  if (!isLeiding) redirect('/portaal')

  const admin = createAdminClient()
  const { data: echosData } = await admin
    .from('echos')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  const echos = (echosData ?? []) as Echo[]

  return <EchoManager initialEchos={echos} />
}
