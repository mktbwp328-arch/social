import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { publishPost } from '@/lib/social-service'

export async function POST(
  request: Request,
  { params }: { params: any }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // 1. Get the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // 2. Immediate publish
    const result = await publishPost(id)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, results: result.results })
  } catch (err: any) {
    console.error('Manual Publish Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
