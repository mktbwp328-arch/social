import { createClient } from './server'

export async function getValidAccessToken(userId: string, platform: string) {
  const supabase = await createClient()

  // 1. Get the connection and API settings
  const { data: conn, error: connError } = await supabase
    .from('user_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', platform)
    .single()

  if (connError || !conn) {
    throw new Error(`No connection found for ${platform}`)
  }

  // 2. Check if token is still valid (with 5-minute buffer)
  const now = new Date()
  const bufferTime = 5 * 60 * 1000
  if (conn.expires_at && new Date(conn.expires_at).getTime() - now.getTime() > bufferTime) {
    return conn.access_token
  }

  // 3. Token expired or needs refresh
  if (!conn.refresh_token) {
    // If no refresh token, we just have to hope the access token still works or prompt re-auth
    // For Meta/Facebook, tokens can be long-lived (60 days) and don't always have a refresh_token
    return conn.access_token 
  }

  // 4. Get API credentials
  const { data: settings } = await supabase
    .from('api_settings')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', platform)
    .single()

  if (!settings) {
    throw new Error(`API settings not found for ${platform}`)
  }

  let newAccessToken = ''
  let newRefreshToken = conn.refresh_token
  let expiresIn = 0

  // 5. Platform-specific refresh logic
  try {
    switch (platform) {
      case 'tiktok':
        const ttRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_key: settings.client_id,
            client_secret: settings.client_secret,
            grant_type: 'refresh_token',
            refresh_token: conn.refresh_token,
          }),
        })
        const ttData = await ttRes.json()
        if (!ttRes.ok) throw new Error(ttData.error_description || 'TikTok refresh failed')
        newAccessToken = ttData.access_token
        newRefreshToken = ttData.refresh_token
        expiresIn = ttData.expires_in
        break

      case 'youtube':
        const ytRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: settings.client_id,
            client_secret: settings.client_secret,
            grant_type: 'refresh_token',
            refresh_token: conn.refresh_token,
          }),
        })
        const ytData = await ytRes.json()
        if (!ytRes.ok) throw new Error(ytData.error || 'YouTube refresh failed')
        newAccessToken = ytData.access_token
        expiresIn = ytData.expires_in
        break

      case 'facebook':
        // Meta typically uses long-lived tokens (60 days) that you exchange once.
        // If it expires, user usually has to re-interact or you exchange again if you have the right permissions.
        // For now, return what we have or implement the exchange-token logic if needed.
        return conn.access_token

      default:
        return conn.access_token
    }

    // 6. Update the connection in DB
    const expiresAt = new Date(now.getTime() + expiresIn * 1000).toISOString()
    await supabase
      .from('user_connections')
      .update({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_at: expiresAt,
        updated_at: now.toISOString(),
      })
      .eq('id', conn.id)

    return newAccessToken
  } catch (err) {
    console.error(`Error refreshing ${platform} token:`, err)
    throw err
  }
}
