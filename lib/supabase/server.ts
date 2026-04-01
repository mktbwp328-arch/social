import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? 'https://hmtocsetxotmtmnchdmo.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdG9jc2V0eG90bXRtbmNoZG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MjUyNTgsImV4cCI6MjA5MDQwMTI1OH0.XVq0FTMrkFIbZ3qt5kva4c32ml7dlzmIhGEG_wAx-vA',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
