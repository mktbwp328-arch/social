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
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(`${origin}/login`)
  }

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
    // 2. Exchange code for access token (Implementation placeholder for each platform)
    // In a real app, you would use fetch() here to call the platform's token endpoint
    // with client_id, client_secret, and the code.
    
    console.log(`Exchanging code for platform: ${platform}`)
    
    // Mock token exchange
    const mockAccessToken = `mock_access_token_${platform}_${Date.now()}`
    const mockRefreshToken = `mock_refresh_token_${platform}_${Date.now()}`

    // 3. Save to user_connections
    const { error: upsertError } = await supabase
      .from('user_connections')
      .upsert({
        user_id: user.id,
        platform,
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour expiry
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, platform' })

    if (upsertError) throw upsertError

    return NextResponse.redirect(`${origin}/credentials?success=Connected ${platform}`)

  } catch (err: any) {
    console.error('OAuth Callback Error:', err)
    return NextResponse.redirect(`${origin}/credentials?error=${encodeURIComponent(err.message)}`)
  }
}
