// app/api/spotify/available-genres-working/route.ts
import { NextRequest, NextResponse } from "next/server"

const testedGenres = [
  "pop", "edm", "hip-hop", "rock", "jazz",
  "house", "techno", "classical", "reggaeton", "indie",
  "dance", "blues", "country", "soul", "funk"
]

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization")

  if (!auth) {
    return NextResponse.json({ error: "Missing access token" }, { status: 401 })
  }

  const workingGenres: string[] = []

  for (const genre of testedGenres) {
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=genre:%22${encodeURIComponent(
          genre
        )}%22&type=track&limit=1`,
        {
          headers: {
            Authorization: auth,
          },
        }
      )

      const text = await res.text()
      if (!res.ok) {
        console.log(`❌ ${genre} → ${res.status}: ${text}`)
        continue
      }

      const data = JSON.parse(text)
      if (Array.isArray(data.tracks?.items) && data.tracks.items.length > 0) {
        workingGenres.push(genre)
        console.log(`✅ ${genre} → ${data.tracks.items.length} tracks`)
      } else {
        console.log(`⚠️ ${genre} → no tracks`)
      }
    } catch (e) {
      console.log(`💥 Exception in genre ${genre}:`, e)
    }
  }

  return NextResponse.json({ genres: workingGenres })
}
