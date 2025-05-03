"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import SongList from "@/components/song-list"
import ClipLoader from "@/components/clip-loader"

const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "bar-mitzvah", label: "Bar Mitzvah" },
  { value: "party", label: "Party" },
  { value: "corporate", label: "Corporate Event" },
  { value: "birthday", label: "Birthday" },
]

const genres = [
  { value: "pop", label: "Pop" },
  { value: "rock", label: "Rock" },
  { value: "hiphop", label: "Hip Hop" },
  { value: "electronic", label: "Electronic" },
  { value: "jazz", label: "Jazz" },
  { value: "classical", label: "Classical" },
  { value: "rnb", label: "R&B" },
]

const playlistLengths = [
  { value: "10", label: "10 songs" },
  { value: "15", label: "15 songs" },
  { value: "20", label: "20 songs" },
]

export default function PlaylistGenerator() {
  const [eventType, setEventType] = useState<string>("")
  const [genre, setGenre] = useState<string>("")
  const [playlistLength, setPlaylistLength] = useState<string>("")
  const [showResults, setShowResults] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    // Simulate loading time
    setTimeout(() => {
      setIsGenerating(false)
      setShowResults(true)
    }, 1500)
  }

  const handleBack = () => {
    setShowResults(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl">
        {!showResults ? (
          <div className="flex flex-col items-center">
            <h1 className="mb-2 text-center text-5xl font-bold tracking-tight text-violet-400">
              Design your perfect set
            </h1>
            <p className="mb-12 text-center text-violet-400">Fine-tune your sound</p>

            <div className="w-full rounded-xl bg-zinc-900 p-8 shadow-lg">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-lg font-medium text-violet-300">Event Type</label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="h-14 w-full border-violet-900 bg-zinc-800 text-base text-white hover:text-white focus:ring-violet-500">
                      <SelectValue placeholder="Select event type" className="text-white" />
                    </SelectTrigger>
                    <SelectContent className="border-violet-900 bg-zinc-800 text-white">
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-base !text-white hover:!text-white focus:bg-violet-900"
>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <label className="text-lg font-medium text-violet-300">Genre</label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger className="h-14 w-full border-violet-900 bg-zinc-800 text-base text-white hover:text-white focus:ring-violet-500">
                      <SelectValue placeholder="Select genre" className="text-white" />
                    </SelectTrigger>
                    <SelectContent className="border-violet-900 bg-zinc-800 text-white">
                      {genres.map((g) => (
                        <SelectItem key={g.value} value={g.value} className="text-base !text-white hover:!text-white focus:bg-violet-900"
>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <label className="text-lg font-medium text-violet-300">Set Length</label>
                  <div className="flex flex-wrap gap-2">
                    {playlistLengths.map((length) => (
                      <button
                        key={length.value}
                        onClick={() => setPlaylistLength(length.value)}
                        className={`h-14 rounded-full px-6 text-base font-medium transition-colors ${
                          playlistLength === length.value
                            ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                            : "border border-violet-800 bg-zinc-800 text-white hover:bg-violet-900"
                        }`}
                      >
                        {length.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!eventType || !genre || !playlistLength || isGenerating}
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
            <Button
              onClick={handleBack}
              className="mb-6 self-start h-12 px-4 bg-gradient-to-r from-violet-600 to-cyan-500 text-base font-medium text-white hover:from-violet-700 hover:to-cyan-600"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Generator
            </Button>

            <div className="rounded-xl bg-zinc-900 p-8 shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-violet-400">Your Set</h2>
                <p className="text-violet-400">
                  {eventTypes.find((e) => e.value === eventType)?.label} •{" "}
                  {genres.find((g) => g.value === genre)?.label} •{" "}
                  {playlistLengths.find((l) => l.value === playlistLength)?.label}
                </p>
              </div>

              <SongList genre={genre} eventType={eventType} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
