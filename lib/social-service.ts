import { createClient } from '@/lib/supabase/server'
import { getValidAccessToken } from './supabase/token-service'
import axios from 'axios'

/**
 * Main service to publish scheduled posts to social media platforms.
 * @param postId The ID of the post in the Supabase 'posts' table.
 */
export async function publishPost(postId: string) {
  const supabase = await createClient()
  
  // 1. Fetch post details
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single()

  if (postError || !post) {
    console.error(`Post ${postId} not found:`, postError)
    return { error: 'Post not found' }
  }

  if (post.status === 'posted') {
    return { success: true, message: 'Already posted' }
  }

  // 2. Mark as processing
  await supabase.from('posts').update({ status: 'processing' }).eq('id', postId)

  const results = []
  let hasError = false

  try {
    // 3. Download the video from Supabase Storage
    const mediaBuffer = await downloadMedia(post.media_url)

    // 4. Process each platform
    for (const platform of post.platforms) {
      try {
        // Get valid token (auto-refresh if needed)
        const accessToken = await getValidAccessToken(post.user_id, platform)
        
        let platformResult;
        switch (platform) {
          case 'facebook':
            platformResult = await publishToFacebook(post, accessToken, mediaBuffer)
            break
          case 'tiktok':
            platformResult = await publishToTikTok(post, accessToken, mediaBuffer)
            break
          case 'youtube':
            platformResult = await publishToYouTube(post, accessToken, mediaBuffer)
            break
          default:
            throw new Error(`Platform ${platform} not supported yet`)
        }
        results.push({ platform, success: true, data: platformResult })
      } catch (err: any) {
        console.error(`Error publishing to ${platform}:`, err)
        results.push({ platform, error: err.message || 'Unknown error' })
        hasError = true
      }
    }

    // 5. Update final status
    const finalStatus = hasError ? 'failed' : 'posted'
    const errorMsg = hasError ? JSON.stringify(results.filter(r => r.error)) : null
    
    await supabase.from('posts').update({ 
      status: finalStatus, 
      error_message: errorMsg,
      updated_at: new Date().toISOString()
    }).eq('id', postId)

    return { success: !hasError, results }
    
  } catch (err: any) {
    console.error('Publishing worker error:', err)
    await supabase.from('posts').update({ 
      status: 'failed', 
      error_message: err.message 
    }).eq('id', postId)
    return { error: err.message }
  }
}

/**
 * Downloads a video from Supabase Storage public URL into a Buffer.
 */
async function downloadMedia(url: string): Promise<Buffer> {
  const response = await axios.get(url, { responseType: 'arraybuffer' })
  return Buffer.from(response.data)
}

/**
 * Real API Implementation for Facebook Reels
 */
async function publishToFacebook(post: any, accessToken: string, mediaBuffer: Buffer) {
  // Meta Reels Publishing (simplified flow)
  // 1. Initialize
  const initRes = await axios.post(`https://graph.facebook.com/v19.0/me/video_reels`, {
    upload_phase: 'start',
    access_token: accessToken
  })
  const videoId = initRes.data.video_id
  const uploadUrl = `https://rupload.facebook.com/video-reels-upload/${videoId}`

  // 2. Upload
  await axios.post(uploadUrl, mediaBuffer, {
    headers: {
      'Authorization': `OAuth ${accessToken}`,
      'offset': '0',
      'file_size': mediaBuffer.length.toString(),
      'Content-Type': 'application/octet-stream'
    }
  })

  // 3. Finish & Publish
  const publishRes = await axios.post(`https://graph.facebook.com/v19.0/me/video_reels`, {
    upload_phase: 'finish',
    video_id: videoId,
    video_state: 'PUBLISHED',
    description: post.caption,
    access_token: accessToken
  })

  return publishRes.data
}

/**
 * Real API Implementation for TikTok Direct Post
 */
async function publishToTikTok(post: any, accessToken: string, mediaBuffer: Buffer) {
  // TikTok Content Posting API v2
  // 1. Initialize
  const initRes = await axios.post('https://open.tiktokapis.com/v2/post/publish/video/init/', 
    {
      post_info: {
        title: post.caption.substring(0, 50),
        description: post.caption,
        privacy_level: 'PUBLIC_TO_EVERYONE',
        disable_comment: false
      },
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: mediaBuffer.length,
        chunk_size: mediaBuffer.length,
        total_chunk_count: 1
      }
    },
    { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
  )

  const uploadUrl = initRes.data.data.upload_url
  const publishId = initRes.data.data.publish_id

  // 2. Upload binary
  // TikTok requires binary direct PUT to the provided upload_url
  await axios.put(uploadUrl, mediaBuffer, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Length': mediaBuffer.length
    }
  })

  return { publish_id: publishId }
}

/**
 * Real API Implementation for YouTube Shorts
 */
async function publishToYouTube(post: any, accessToken: string, mediaBuffer: Buffer) {
  // YouTube Data API v3 (Resumable Upload)
  // 1. Initialize
  const metadata = {
    snippet: {
      title: post.caption.substring(0, 70),
      description: post.caption + ' #shorts',
      categoryId: '22'
    },
    status: {
      privacyStatus: 'public',
      selfDeclaredMadeForKids: false
    }
  }

  const initRes = await axios.post('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', 
    metadata, 
    { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json; charset=UTF-8' } }
  )

  const uploadUrl = initRes.headers.location

  // 2. Upload
  const uploadRes = await axios.put(uploadUrl, mediaBuffer, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Length': mediaBuffer.length
    }
  })

  return uploadRes.data
}
