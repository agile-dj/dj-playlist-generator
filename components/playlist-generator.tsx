'use client'

import { useEffect, useState } from "react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import SongList from "@/components/song-list"
import SpotifyIcon from "../Spotify_icon.svg"
import ClipLoader from "@/components/clip-loader"

const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "bar-mitzvah", label: "Bar Mitzvah" },
  { value: "party", label: "Party" },
  { value: "corporate", label: "Corporate Event" },
  { value: "birthday", label: "Birthday" },
]

export default function PlaylistGenerator() {
  const [eventType, setEventType] = useState<string>("")
  const [genres, setGenres] = useState<string[]>([])
  const [genresList, setGenresList] = useState<{ value: string; label: string }[]>([])
  const [duration, setDuration] = useState<number>(60)
  const [showResults, setShowResults] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch("/api/spotify/available-genres")
        const rawGenres: string[] = await res.json()

        if (!Array.isArray(rawGenres) || rawGenres.length === 0) {
          throw new Error("No genres received")
        }

        const mappedGenres = rawGenres.map((genre) => ({
          value: genre,
          label: genre.charAt(0).toUpperCase() + genre.slice(1),
        }))

        setGenresList(mappedGenres)
      } catch (error) {
        console.error("❌ Failed to load genres:", error)
      }
    }

    fetchGenres()
  }, [])

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setShowResults(true)
    }, 1500)
  }

  const handleBack = () => {
    setShowResults(false)
  }

  const redirectToSpotifyLogin = () => {
    const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!
    const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!
    const SCOPES = ['playlist-modify-public', 'playlist-modify-private'].join('%20')

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}`
    window.location.href = authUrl
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl">
        {!showResults ? (
          <div className="flex flex-col items-center">
            <h1 className="mb-2 text-center text-4xl font-bold tracking-tight text-violet-400">
              Design your perfect playlist 🎵
            </h1>
            <p className="mb-12 text-center text-violet-400">Fine-tune your sound</p>

            <div className="w-full rounded-xl bg-zinc-900 p-8 shadow-lg">
              <div className="space-y-8">
                {/* Event Type */}
                <div className="space-y-4">
                  <label className="text-lg font-medium text-violet-300">Event Type</label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="h-14 w-full border-0 bg-zinc-800 text-base text-violet-300 focus:outline-none">
                      <SelectValue placeholder="Select event type" className="text-white" />
                    </SelectTrigger>
                    <SelectContent className="border-violet-900 bg-zinc-800 text-white">
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-base !text-white hover:!text-white focus:bg-violet-900">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Genres */}
                <div className="space-y-4">
                  <label className="text-lg font-medium text-violet-300">Genres</label>
                  <div className="flex flex-wrap gap-2 p-4 rounded-lg bg-zinc-800">
                    {genres.map((genre) => (
                      <div key={genre} className="flex items-center gap-1 px-3 py-1 rounded-full bg-violet-600 text-white">
                        <span>{genresList.find(g => g.value === genre)?.label}</span>
                        <button
                          onClick={() => setGenres(genres.filter(g => g !== genre))}
                          className="hover:text-violet-200"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (value && !genres.includes(value)) {
                          setGenres([...genres, value])
                        }
                      }}
                    >
                      <SelectTrigger className="h-10 w-[120px] border-0 bg-zinc-800 text-base text-violet-300 hover:text-violet-400 focus:ring-violet-500">
                        <SelectValue placeholder="+ Add genre" />
                      </SelectTrigger>
                      <SelectContent className="border-0 bg-zinc-800 text-white p-0">
                        {genresList.filter(g => !genres.includes(g.value)).map((g) => (
                          <SelectItem 
                            key={g.value} 
                            value={g.value}
                            className="text-base !text-white hover:!text-white focus:bg-violet-900"
                          >
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Playlist Length */}
                <div className="space-y-4">
                  <label className="text-lg font-medium text-violet-300">Playlist Length</label>
                  <div className="grid grid-cols-6 gap-2">
                    {[30, 60, 90, 120, 150, 180].map((mins) => {
                      const label = mins < 60
                        ? `${mins}m`
                        : mins % 60 === 0
                          ? `${mins / 60}h`
                          : `${Math.floor(mins / 60)}.${(mins % 60) / 60 * 10}h`

                      return (
                        <button
                          key={mins}
                          onClick={() => setDuration(mins)}
                          className={`sm:h-14 h-10 rounded-lg text-base font-medium transition-all ${duration === mins
                              ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white'
                              : 'bg-zinc-800 text-violet-300 hover:bg-zinc-700'
                            }`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!eventType || genres.length === 0 || !duration || isGenerating}
                  className="mt-6 h-14 w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-base font-medium text-white hover:from-violet-700 hover:to-cyan-600"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center">
                      <ClipLoader color="#ffffff" size={24} />
                      <span className="ml-3">Generating...</span>
                    </div>
                  ) : (
                    "Generate Set Plan"
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Back + Spotify Button */}
            <div className="flex gap-4 mb-6">
              <Button
                onClick={handleBack}
                className="h-12 px-4 bg-gradient-to-r from-violet-600 to-cyan-500 text-base font-medium text-white hover:from-violet-700 hover:to-cyan-600"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Generator
              </Button>
              <Button
                onClick={redirectToSpotifyLogin}
                className="h-12 px-4 hover:bg-[#1ed760] ml-auto"
              >
                <Image src={SpotifyIcon} alt="Spotify" className="h-10 w-10" />
              </Button>
            </div>

            {/* Playlist Summary + Tracks */}
            <div className="rounded-xl bg-zinc-900 p-8 shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-violet-400">Your Playlist</h2>
                <p className="text-violet-400">
                  {eventTypes.find((e) => e.value === eventType)?.label} •{" "}
                  {genres.map(g => genresList.find(item => item.value === g)?.label).join(", ")} •{" "}
                  {duration} minutes
                </p>
              </div>

              <SongList genres={genres} eventType={eventType} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
