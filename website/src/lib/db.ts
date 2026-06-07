/**
 * Server-side database helpers — enkel gebruiken in Server Components en API routes.
 * Gebruik createAdminClient() zodat RLS omzeild wordt voor server-to-server calls.
 */
import { createAdminClient } from './supabase'

export async function getSettings() {
  const supabase = createAdminClient()
  const { data } = await supabase.from('settings').select('*').single()
  return data
}

export async function getCalendarEvents() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('calendar')
    .select('*')
    .order('date', { ascending: true })
  return data ?? []
}

export async function getEchos() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('echos')
    .select('*')
    .eq('approved', true)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
  return data ?? []
}

export async function getShopProducts() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('shop_products')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
  return data ?? []
}

export async function getKampen(tak?: string) {
  const supabase = createAdminClient()
  let query = supabase.from('kampen').select('*, kamp_bestanden(*)').order('datum_van', { ascending: true })
  if (tak) query = query.eq('tak', tak)
  const { data } = await query
  return data ?? []
}

export async function getOrders() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getMessages() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getVerslagen() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('verslagen')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false })
  return data ?? []
}
