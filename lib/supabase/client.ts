import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? 'https://hmtocsetxotmtmnchdmo.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdG9jc2V0eG90bXRtbmNoZG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MjUyNTgsImV4cCI6MjA5MDQwMTI1OH0.XVq0FTMrkFIbZ3qt5kva4c32ml7dlzmIhGEG_wAx-vA'
  )
}
