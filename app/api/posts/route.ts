import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { publishPost } from '@/lib/social-service'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // AUTH BYPASS: Use a fixed UUID for single-user local use if no session exists
    let { data: { user } } = await supabase.auth.getUser()
    const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'
    const userId = user?.id || DEFAULT_USER_ID

    const body = await request.json()
    const { caption, media_url, scheduled_at, platforms } = body

    if (!scheduled_at || !platforms || platforms.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: userId,
          caption,
          media_url,
          scheduled_at,
          platforms,
          status: 'pending',
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Trigger publishing if scheduled for now (or near now)
    const scheduledDate = new Date(scheduled_at)
    if (scheduledDate <= new Date()) {
      // Execute asynchronously or await if you want to wait for response
      publishPost(data[0].id).catch(console.error)
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('scheduled_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
