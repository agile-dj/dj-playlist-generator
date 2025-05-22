// components/SpotifyLogin.tsx
"use client"

import { Button } from "@/components/ui/button"

export default function SpotifyLogin() {
  const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
  const REDIRECT_URI = "http://127.0.0.1:3000/api/spotify/callback"
  const SCOPES = [
    "playlist-modify-public",
    "playlist-modify-private",
    "user-read-private",
  ].join(" ")

  const AUTH_URL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(
    SCOPES
  )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`

  const handleLogin = () => {
    window.location.href = AUTH_URL
  }

  return (
    <Button variant="default" size="lg" onClick={handleLogin}>
      התחברות לספוטיפיי
    </Button>
  )
}
