"use client"

import { useState } from "react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import SongList from "@/components/song-list"
import SpotifyIcon from "../Spotify_icon.svg"
import ClipLoader from "@/components/ui/clip-loader"
import { Slider } from "@/components/ui/slider"
import { filterSongs } from "./filter-songs"
import { eventTypes, genresList } from "./hardcoded-params"


export default function PlaylistGenerator() {
  const [eventType, setEventType] = useState<string>("")
  const [genres, setGenres] = useState<string[]>([])
  const [popularity, setPopularity] = useState(50)
  const [danceability, setDanceability] = useState(50)
  const [duration, setDuration] = useState<number>(60)
  const [showResults, setShowResults] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [filteredSongs, setFilteredSongs] = useState<any[]>([])

  const handleGenerate = () => {
    setIsGenerating(true)
    filterSongs({
      eventType,
      genres,
      popularity,
      danceability,
      duration
    })
      .then(songs => {
        setFilteredSongs(songs)
        setIsGenerating(false)
        setShowResults(true)
      })
      .catch(error => {
        console.error('Error filtering songs:', error)
        setIsGenerating(false)
      })
  }

  const handleBack = () => {
    setShowResults(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl">
        {!showResults ? (
          <div className="flex flex-col items-center">
            <h1 className="mb-2 text-center text-4xl font-bold tracking-tight text-violet-400">
              Design your perfect playlist🎵
            </h1>
            <p className="mb-12 text-center text-violet-400">Fine-tune your sound</p>

            <div className="w-full rounded-xl bg-zinc-900 p-8 shadow-lg">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-lg font-medium text-violet-300">Event Type</label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="h-14 w-full border-0 bg-zinc-800 text-base text-violet-300 focus:outline-none">
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
                  <div className="grid grid-cols-2 gap-6 pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <label className="text-lg font-medium text-violet-300">Popularity</label>
                        <span className="text-lg text-violet-400">{popularity}%</span>
                      </div>
                      <Slider
                        value={[popularity]}
                        onValueChange={([value]) => setPopularity(value)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <label className="text-lg font-medium text-violet-300">Danceability</label>
                        <span className="text-lg text-violet-400">{danceability}%</span>
                      </div>
                      <Slider
                        value={[danceability]}
                        onValueChange={([value]) => setDanceability(value)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-lg font-medium text-violet-300">Playlist Length</label>
                  <div className="grid grid-cols-6 gap-2">
                    {[30, 60, 90, 120, 150, 180].map((mins) => {
                      const label = mins < 60
                        ? `${mins}m`
                        : mins % 60 === 0
                          ? `${mins / 60}h`
                          : `${Math.floor(mins / 60)}.${(mins % 60) / 60 * 10}h`; // E.g., 90 -> 1.5h

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
                      );
                    })}
                  </div>
                </div>
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
            <div className="flex gap-4 mb-6">
              <Button
                onClick={handleBack}
                className="h-12 px-4 bg-gradient-to-r from-violet-600 to-cyan-500 text-base font-medium text-white hover:from-violet-700 hover:to-cyan-600"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Generator
              </Button>
              <Button
                onClick={() => console.log('Export to Spotify')}
                className="h-12 px-4 hover:bg-[#1ed760] ml-auto"
              >
                <Image src={SpotifyIcon} alt="Spotify" className="h-10 w-10 " />
                Export Playlist
              </Button>
            </div>

            <div className="rounded-xl bg-zinc-900 p-8 shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-violet-400">Your Playlist</h2>
                <p className="text-violet-400">
                  {eventTypes.find((e) => e.value === eventType)?.label} •{" "}
                  {genres.map(g => genresList.find(item => item.value === g)?.label).join(", ")} •{" "}
                  {duration} minutes
                </p>
              </div>
              {showResults && (
                <div className="space-y-8">
                  {isGenerating ? (
                    <div className="flex justify-center items-center py-12">
                      <ClipLoader color="#7c3aed" size={40} />
                    </div>
                  ) : (
                    <SongList songs={filteredSongs} />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
