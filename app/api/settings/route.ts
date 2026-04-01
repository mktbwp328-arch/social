import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'
    const userId = user?.id || DEFAULT_USER_ID

    const { data, error } = await supabase
      .from('api_settings')
      .select('platform, client_id')
      
    if (error) return NextResponse.json({ error: `DB Error: ${error.message}` }, { status: 500 })

    return NextResponse.json({ data })
  } catch (err: any) {
    console.error('Settings GET Error:', err)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: err.message,
      hint: 'Ensure .env.local is correct and SQL schema is applied.'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'
    const userId = user?.id || DEFAULT_USER_ID

    const body = await request.json()
    const { platform, client_id, client_secret } = body

    if (!platform || !client_id || !client_secret) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('api_settings')
      .upsert({
        user_id: userId,
        platform,
        client_id,
        client_secret,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id, platform' })
      .select()

    if (error) return NextResponse.json({ error: `DB Error: ${error.message}` }, { status: 500 })

    return NextResponse.json({ data })
  } catch (err: any) {
    console.error('Settings POST Error:', err)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: err.message
    }, { status: 500 })
  }
}
