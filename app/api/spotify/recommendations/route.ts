import { NextRequest, NextResponse } from 'next/server'

const client_id = process.env.SPOTIFY_CLIENT_ID!
const client_secret = process.env.SPOTIFY_CLIENT_SECRET!

export async function GET(req: NextRequest) {
  const genre = req.nextUrl.searchParams.get('seed_genres')

  if (!genre) {
    return NextResponse.json({ error: 'Genre is required' }, { status: 400 })
  }

  try {
    // === שלב 1: קבלת טוקן ===
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok) {
      console.error('🔴 Token error:', tokenData)
      return NextResponse.json({ error: 'Failed to get Spotify token' }, { status: 500 })
    }

    const access_token = tokenData.access_token
    console.log('🟢 Token OK')

    // === שלב 2: בקשת המלצות ===
    const spotifyUrl = `https://api.spotify.com/v1/recommendations?seed_genres=${encodeURIComponent(genre)}&limit=10`
    console.log("🎯 Spotify URL:", spotifyUrl)

    const tracksRes = await fetch(spotifyUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!tracksRes.ok) {
      const errorText = await tracksRes.text()
      console.error('🔴 Spotify recommendations error:', tracksRes.status, errorText)
      return NextResponse.json({ error: 'Spotify recommendations failed' }, { status: 500 })
    }

    const data = await tracksRes.json()
    const trackIds = data.tracks.map((t: any) => t.id).slice(0, 10)
    const playlistUrl = `https://open.spotify.com/track/${trackIds[0]}?utm_source=matchtune`

    return NextResponse.json({
      playlistUrl,
      tracks: data.tracks.map((t: any) => ({
        id: t.id,
        name: t.name,
        artist: t.artists?.[0]?.name,
        preview_url: t.preview_url,
        external_url: t.external_urls.spotify,
      })),
    })
  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
