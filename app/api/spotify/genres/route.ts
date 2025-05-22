import { NextResponse } from 'next/server';

// קריאת משתני סביבה
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

// 💡 הוסף את ההדפסות כאן – מיד אחרי טעינת המשתנים
console.log("CLIENT_ID:", client_id);
console.log("CLIENT_SECRET:", client_secret ? "✅ LOADED" : "❌ MISSING");

export async function GET() {
  try {
    // בדיקה שחובה שהמשתנים קיימים
    if (!client_id || !client_secret) {
      console.error('❗ Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET');
      return NextResponse.json(
        { error: 'Missing Spotify credentials' },
        { status: 500 }
      );
    }

    // 1. קבלת טוקן גישה מ־Spotify
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('🔐 Failed to get token:', tokenData);
      return NextResponse.json(
        { error: 'Failed to get access token from Spotify', details: tokenData },
        { status: 500 }
      );
    }

    const access_token = tokenData.access_token;

    // 2. בקשת קטגוריות (genres)
    const genresResponse = await fetch(
      'https://api.spotify.com/v1/browse/categories?limit=50',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const genresData = await genresResponse.json();

    if (!genresResponse.ok) {
      console.error('🎧 Failed to fetch genres:', genresData);
      return NextResponse.json(
        { error: 'Failed to fetch genres from Spotify', details: genresData },
        { status: 500 }
      );
    }

    // בדיקת תקינות מבנה התגובה
    if (!genresData.categories?.items) {
      console.error('⚠️ Unexpected Spotify response structure:', genresData);
      return NextResponse.json(
        { error: 'Invalid response format from Spotify', raw: genresData },
        { status: 500 }
      );
    }

    // ✅ הצלחה
    return NextResponse.json(genresData.categories.items);
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message || error);
    return NextResponse.json(
      { error: 'Unexpected error fetching genres from Spotify' },
      { status: 500 }
    );
  }
}
