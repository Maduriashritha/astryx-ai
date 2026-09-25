import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null | undefined

// Server-only client using the service role key; the `generations` table has RLS
// enabled with no public policies, so it is only reachable through these routes.
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
  return client
}
