import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: any }
) {
  const { platform } = await params
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (!code) {
    return NextResponse.redirect(`${origin}/credentials?error=No code provided`)
  }

  const supabase = await createClient()
  
  // AUTH BYPASS: Using fixed user ID for local mode
  const { data: authData } = await supabase.auth.getUser()
  const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'
  const userId = authData?.user?.id || DEFAULT_USER_ID

  // 1. Get API Settings for Client Secret
  const { data: settings } = await supabase
    .from('api_settings')
    .select('*')
    .eq('platform', platform)
    .single()

  if (!settings) {
    return NextResponse.redirect(`${origin}/credentials?error=Settings not found`)
  }

  try {
    let accessToken = ''
    let refreshToken = ''
    let expiresIn = 3600
    const redirectUri = `${origin}/api/auth/callback/${platform}`

    // 2. Real token exchange for each platform
    if (platform === 'tiktok') {
      const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: settings.client_id,
          client_secret: settings.client_secret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error_description || 'TikTok token exchange failed')
      accessToken = data.access_token
      refreshToken = data.refresh_token
      expiresIn = data.expires_in
    } 
    else if (platform === 'youtube') {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: settings.client_id,
          client_secret: settings.client_secret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error_description || 'YouTube token exchange failed')
      accessToken = data.access_token
      refreshToken = data.refresh_token
      expiresIn = data.expires_in
    }
    else if (platform === 'facebook') {
      const res = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${settings.client_id}&redirect_uri=${redirectUri}&client_secret=${settings.client_secret}&code=${code}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'Facebook token exchange failed')
      accessToken = data.access_token
      expiresIn = data.expires_in || 5184000 // default 60 days for long-lived tokens
    }

    // 3. Save to user_connections
    const { error: upsertError } = await supabase
      .from('user_connections')
      .upsert({
        user_id: userId,
        platform,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, platform' })

    if (upsertError) throw upsertError

    return NextResponse.redirect(`${origin}/credentials?success=Connected ${platform}`)

  } catch (err: any) {
    console.error('OAuth Callback Error:', err)
    return NextResponse.redirect(`${origin}/credentials?error=${encodeURIComponent(err.message)}`)
  }
}
