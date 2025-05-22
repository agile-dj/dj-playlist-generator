'use client'

import { useEffect, useState } from 'react'
import GenreSelect from '@/components/ui/genre-select'
import { Button } from '@/components/ui/button'

export default function HomeClient() {
  const [genres, setGenres] = useState<string[]>([])
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [duration, setDuration] = useState(30)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 1. טוען ז'אנרים
  useEffect(() => {
    const url = new URL(window.location.href)
    const token = url.searchParams.get("token")

    if (token) {
      setAccessToken(token)
      sessionStorage.setItem("access_token", token)

      // הסרת ה־token מה־URL
      window.history.replaceState({}, document.title, "/")
    } else {
      const tokenFromSession = sessionStorage.getItem("access_token")
      if (tokenFromSession) {
        setAccessToken(tokenFromSession)
      }
    }
  }, [])


// 2. ברגע שיש accessToken, טוען ז'אנרים
useEffect(() => {
  const fetchGenres = async () => {
    try {
      const res = await fetch('/api/spotify/available-genres-working', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Genre fetch failed: ${text}`)
      }

      const data = await res.json()
      if (!Array.isArray(data.genres)) throw new Error("Genres is not an array")
      setGenres(data.genres)
    } catch (err) {
      console.error("❌ Failed to fetch genres:", err)
      setGenres([])
    }
  }

  if (accessToken) {
    fetchGenres()
  }
}, [accessToken])


  // 3. קריאה ליצירת פלייליסט
  const handleGenerate = async () => {
    if (!selectedGenre || !accessToken) return
    setLoading(true)

    const res = await fetch('/api/spotify/create-playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: accessToken,
        genre: selectedGenre,
        durationMinutes: duration,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.playlistUrl) {
      setPlaylistUrl(data.playlistUrl)
    } else {
      console.error("❌ Failed to create playlist", data)
      alert("Something went wrong creating your playlist.")
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="w-full px-2 py-4 border-b border-gray-800">
        <div className="container mx-auto flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            MatchTune AI
          </h1>
        </div>
      </header>

      <section className="max-w-xl mx-auto p-4 space-y-4">
        <h2 className="text-lg font-semibold">Choose a genre to generate your playlist 🎧</h2>
        
        <GenreSelect
          options={genres.map((g) => ({ label: g, value: g }))}
          onChange={(value) => setSelectedGenre(value)}
          placeholder="Select a genre..."
        />

        <Button onClick={handleGenerate} disabled={!selectedGenre || !accessToken || loading}>
          {loading ? "Generating..." : "Generate Playlist"}
        </Button>

        {playlistUrl && (
          <p className="mt-4">
            ✅ Your playlist is ready:{" "}
            <a href={playlistUrl} target="_blank" className="underline text-blue-400">
              Open in Spotify
            </a>
          </p>
        )}
      </section>
    </main>
  )
}
