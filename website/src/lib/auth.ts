import type { User } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase'

// Gecentraliseerde rolcontroles voor server-side gebruik (API routes &
// server components). Het portaal is leiding-only sinds de ouderaccounts weg zijn.

const LEIDING_ROLES = new Set(['admin', 'groepsleiding', 'leiding', 'webshop'])
const GROEPSLEIDING_ROLES = new Set(['admin', 'groepsleiding'])
const WEBSHOP_ROLES = new Set(['admin', 'groepsleiding', 'webshop'])

async function getVerifiedUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ?? null
}

// Elke leiding (takleiding, groepsleiding, webshop of admin). null = geen toegang.
export async function requireLeiding(): Promise<User | null> {
  const user = await getVerifiedUser()
  if (!user) return null
  return LEIDING_ROLES.has(user.app_metadata?.role) ? user : null
}

// Enkel groeps-/hoofdleiding (beheer, rollover, ...). null = geen toegang.
export async function requireGroepsleiding(): Promise<User | null> {
  const user = await getVerifiedUser()
  if (!user) return null
  return GROEPSLEIDING_ROLES.has(user.app_metadata?.role) ? user : null
}

// Webshop beheer (groepsleiding, webshop of admin). null = geen toegang.
export async function requireWebshop(): Promise<User | null> {
  const user = await getVerifiedUser()
  if (!user) return null
  return WEBSHOP_ROLES.has(user.app_metadata?.role) ? user : null
}
