import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { publishPost } from '@/lib/social-service'

/**
 * Cron Job API to scan for and process overdue pending posts.
 * Recommended schedule: Every 1-5 minutes.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    // In production, you'd check CRON_SECRET for security
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response('Unauthorized', { status: 401 })
    // }

    const supabase = await createClient()
    const now = new Date().toISOString()

    // 1. Find all pending posts that should have been posted by now
    const { data: pendingPosts, error } = await supabase
      .from('posts')
      .select('id')
      .eq('status', 'pending')
      .lte('scheduled_at', now)

    if (error) throw error

    if (!pendingPosts || pendingPosts.length === 0) {
      return NextResponse.json({ message: 'No pending posts to process' })
    }

    console.log(`Cron: Processing ${pendingPosts.length} overdue posts...`)

    // 2. Process them (sequential or parallel-limited)
    const results = []
    for (const post of pendingPosts) {
      const result = await publishPost(post.id)
      results.push({ id: post.id, status: result.error ? 'failed' : 'success' })
    }

    return NextResponse.json({ 
      processed: pendingPosts.length,
      results 
    })
  } catch (err: any) {
    console.error('Cron Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
