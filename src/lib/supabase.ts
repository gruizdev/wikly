import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables')
}

// createBrowserClient stores the session in cookies (not localStorage),
// so the server-side middleware can read it for route protection.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
