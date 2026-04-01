import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: any }
) {
  const { platform } = await params
  const supabase = await createClient()

  // 1. Check if user has API settings (Client ID/Secret) for this platform
  const { data: settings, error: settingsError } = await supabase
    .from('api_settings')
    .select('*')
    .eq('platform', platform)
    .single()

  if (settingsError || !settings) {
    return NextResponse.json({ error: `Please configure API settings for ${platform} first.` }, { status: 400 })
  }

  // 2. Construct OAuth URL based on platform
  let oauthUrl = ''
  const redirectUri = `${new URL(request.url).origin}/api/auth/callback/${platform}`
  const state = Math.random().toString(36).substring(7)

  switch (platform) {
    case 'facebook':
      oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${settings.client_id}&redirect_uri=${redirectUri}&state=${state}&scope=pages_manage_posts,pages_read_engagement`
      break
    case 'tiktok':
      oauthUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${settings.client_id}&scope=video.upload,user.info.basic&response_type=code&redirect_uri=${redirectUri}&state=${state}`
      break
    case 'youtube':
      oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${settings.client_id}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/youtube.upload&state=${state}&access_type=offline&prompt=consent`
      break
    default:
      return NextResponse.json({ error: 'Platform not supported' }, { status: 400 })
  }

  // 3. Redirect user to platform OAuth page
  return NextResponse.redirect(oauthUrl)
}
