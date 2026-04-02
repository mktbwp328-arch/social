import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { publishPost } from '@/lib/social-service'
// @ts-ignore
import { after } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // SAFE AUTH CHECK for single-user mode
    const { data: authData } = await supabase.auth.getUser()
    const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'
    const userId = authData?.user?.id || DEFAULT_USER_ID

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

    const postId = data[0].id

    // Trigger publishing if scheduled for now (or near now)
    const scheduledDate = new Date(scheduled_at)
    if (scheduledDate <= new Date()) {
      // Use 'after' to ensure background publishing completes on Vercel
      if (typeof after === 'function') {
        after(async () => {
          console.log(`Starting background publish for post ${postId}...`)
          await publishPost(postId).catch(console.error)
        })
      } else {
        // Fallback for environments where 'after' is not available
        publishPost(postId).catch(console.error)
      }
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    console.error('Posts POST Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    // SAFE AUTH CHECK for single-user mode
    const { data: authData } = await supabase.auth.getUser()
    const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'
    const userId = authData?.user?.id || DEFAULT_USER_ID

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    console.error('Posts GET Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
