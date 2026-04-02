import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Get a specific post by ID.
 */
export async function GET(
  request: Request,
  { params }: { params: any }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ data: post })
  } catch (err: any) {
    console.error('Post GET Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * Update a specific post (PATCH).
 */
export async function PATCH(
  request: Request,
  { params }: { params: any }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()
    
    // Whitelist allowed fields to update
    const { caption, media_url, scheduled_at, platforms, status } = body
    const updates: any = {}
    
    if (caption !== undefined) updates.caption = caption
    if (media_url !== undefined) updates.media_url = media_url
    if (scheduled_at !== undefined) updates.scheduled_at = scheduled_at
    if (platforms !== undefined) updates.platforms = platforms
    if (status !== undefined) updates.status = status
    
    updates.updated_at = new Date().toISOString()

    const { data: post, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: post })
  } catch (err: any) {
    console.error('Post PATCH Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * Delete a specific post.
 */
export async function DELETE(
  request: Request,
  { params }: { params: any }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Post DELETE Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
