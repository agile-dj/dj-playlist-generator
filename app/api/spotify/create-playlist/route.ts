// app/api/spotify/create-playlist/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { access_token, genre, durationMinutes } = await req.json();

  if (!access_token || !genre || !durationMinutes) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  try {
    // 1. שליפת פרטי משתמש
    const userRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const user = await userRes.json();

    if (!user.id) {
      return NextResponse.json({ error: "Failed to get user info", details: user }, { status: 401 });
    }

    // 2. שליפת שירים לפי ז'אנר
    const recRes = await fetch(`https://api.spotify.com/v1/recommendations?seed_genres=${genre}&limit=100`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const recData = await recRes.json();

    if (!recData.tracks || recData.tracks.length === 0) {
      return NextResponse.json({ error: "No tracks found" }, { status: 404 });
    }

    // 3. סינון שירים לפי משך זמן כולל
    const durationMsTarget = durationMinutes * 60 * 1000;
    let totalMs = 0;
    const selectedTracks: string[] = [];

    for (const track of recData.tracks) {
      if (totalMs + track.duration_ms <= durationMsTarget) {
        selectedTracks.push(track.uri);
        totalMs += track.duration_ms;
      }
    }

    if (selectedTracks.length === 0) {
      return NextResponse.json({ error: "Not enough tracks to meet duration" }, { status: 400 });
    }

    // 4. יצירת פלייליסט
    const createRes = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `🎵 MatchTune: ${genre} - ${durationMinutes} min`,
        description: "Auto-generated playlist by MatchTune AI",
        public: false,
      }),
    });

    const playlist = await createRes.json();

    // 5. הוספת שירים לפלייליסט
    await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: selectedTracks,
      }),
    });

    return NextResponse.json({
      playlistUrl: playlist.external_urls.spotify,
      playlistId: playlist.id,
      trackCount: selectedTracks.length,
      durationMinutes: Math.round(totalMs / 1000 / 60),
    });
  } catch (err: any) {
    console.error("❌ Playlist creation error:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}
