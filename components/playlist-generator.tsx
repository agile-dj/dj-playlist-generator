"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import SongList from "@/components/song-list"
import ClipLoader from "@/components/ui/clip-loader"
import { Slider } from "@/components/ui/slider"
import { filterSongs } from "./filter-songs"
import { eventTypes } from "./hardcoded-params"


export default function PlaylistGenerator() {
  const [eventType, setEventType] = useState<string>("")
  const [genres, setGenres] = useState<string[]>([])
  const [popularity, setPopularity] = useState(50)
  const [danceability, setDanceability] = useState(50)
  const [duration, setDuration] = useState<number>(60)
  const [showResults, setShowResults] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [filteredSongs, setFilteredSongs] = useState<any[]>([])
  // Wedding segment tempos
  const [receptionTempo, setReceptionTempo] = useState<string>("")
  const [ceremonyTempo, setceremonyTempo] = useState<string>("")
  const [dancingTempo, setDancingTempo] = useState<string>("")
  const [receptionDuration, setReceptionDuration] = useState<number>(30)
  const [ceremonyDuration, setceremonyDuration] = useState<number>(15)
  const [dancingDuration, setDancingDuration] = useState<number>(60)
  const [genresList, setGenresList] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    fetch("/api/genres")
      .then((res) => res.json())
      .then((data) => setGenresList(data))
      .catch((err) => console.error("Failed to fetch genres:", err))
  }, [])

  const handleGenerate = () => {
    setIsGenerating(true)

    // Helper to convert tempo label to numeric range
    const convertTempoToRange = (tempo: string): [number, number] => {
      switch (tempo) {
        case "slow":
          return [50, 75];
        case "medium":
          return [90, 115];
        case "fast":
          return [120, 150];
        default:
          return [90, 115];
      }
    }

    const weddingSegments = [
      {
        label: "Reception",
        tempoRange: convertTempoToRange(receptionTempo),
        duration: receptionDuration
      },
      {
        label: "ceremony",
        tempoRange: convertTempoToRange(ceremonyTempo),
        duration: ceremonyDuration
      },
      {
        label: "Dancing",
        tempoRange: convertTempoToRange(dancingTempo),
        duration: dancingDuration
      }
    ]

    const baseParams = {
      eventType,
      genres,
      popularity,
      danceability
    }

    const promises = eventType === "wedding"
      ? weddingSegments.map(segment =>
          filterSongs({
            ...baseParams,
            duration: segment.duration,
            tempoRange: segment.tempoRange,
            segment: segment.label
          }).then(songs => ({ label: segment.label, songs }))
        )
      : [filterSongs({ ...baseParams, duration }).then(songs => ({ label: "Full", songs }))]

    Promise.all(promises)
      .then(results => {
        const segmentOrder = ["Reception", "ceremony", "Dancing"];
        const combinedSongs = eventType === "wedding"
          ? segmentOrder.flatMap(segment =>
              results
                .filter(result => result.label === segment)
                .flatMap(result =>
                  result.songs.map(song => ({ ...song, segment }))
                )
            )
          : results[0].songs.map(song => ({ ...song, segment: "Full" }));
        setFilteredSongs(combinedSongs)
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
                  <Select value={eventType} onValueChange={setEventType} data-cy="event-type-select">
                    <SelectTrigger className="h-14 w-full border-0 bg-zinc-800 text-base text-violet-300 focus:outline-none" data-cy="event-type-trigger">
                      <SelectValue placeholder="Select event type" className="text-white" />
                    </SelectTrigger>
                    <SelectContent className="border-violet-900 bg-zinc-800 text-white">
                      {eventTypes.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          data-cy={`event-type-option-${type.value.toLowerCase()}`}
                          className="text-base !text-white hover:!text-white focus:bg-violet-900"
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {eventType === "wedding" && (
                  <div className="space-y-6 rounded-lg border border-violet-900 p-4 mt-4 bg-zinc-800">
                    <h2 className="text-xl font-semibold text-violet-300">Wedding Segments</h2>

                    <div className="space-y-2">
                      <label className="text-violet-200">Reception</label>
                      <Select value={receptionTempo} onValueChange={setReceptionTempo} data-cy="reception-tempo-select">
                        <SelectTrigger className="h-12 w-full bg-zinc-700 border-0 text-violet-200" data-cy="reception-tempo-trigger">
                          <SelectValue placeholder="Select tempo for reception" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 text-white">
                          <SelectItem value="slow" data-cy="tempo-option-slow">Slow</SelectItem>
                          <SelectItem value="medium" data-cy="tempo-option-medium">Medium</SelectItem>
                          <SelectItem value="fast" data-cy="tempo-option-fast">Fast</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-violet-200">Reception Duration (minutes)</label>
                      <Slider
                        value={[receptionDuration]}
                        onValueChange={([value]) => setReceptionDuration(value)}
                        min={10}
                        max={120}
                        step={5}
                        className="w-full"
                      />
                      <span className="text-sm text-violet-300">{receptionDuration} minutes</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-violet-200">ceremony</label>
                      <Select value={ceremonyTempo} onValueChange={setceremonyTempo} data-cy="ceremony-tempo-select">
                        <SelectTrigger className="h-12 w-full bg-zinc-700 border-0 text-violet-200" data-cy="ceremony-tempo-trigger">
                          <SelectValue placeholder="Select tempo for ceremony" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 text-white">
                          <SelectItem value="slow" data-cy="tempo-option-slow">Slow</SelectItem>
                          <SelectItem value="medium" data-cy="tempo-option-medium">Medium</SelectItem>
                          <SelectItem value="fast" data-cy="tempo-option-fast">Fast</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-violet-200">ceremony Duration (minutes)</label>
                      <Slider
                        value={[ceremonyDuration]}
                        onValueChange={([value]) => setceremonyDuration(value)}
                        min={10}
                        max={120}
                        step={5}
                        className="w-full"
                      />
                      <span className="text-sm text-violet-300">{ceremonyDuration} minutes</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-violet-200">Dancing</label>
                      <Select value={dancingTempo} onValueChange={setDancingTempo} data-cy="dancing-tempo-select">
                        <SelectTrigger className="h-12 w-full bg-zinc-700 border-0 text-violet-200" data-cy="dancing-tempo-trigger">
                          <SelectValue placeholder="Select tempo for dancing" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 text-white">
                          <SelectItem value="slow" data-cy="tempo-option-slow">Slow</SelectItem>
                          <SelectItem value="medium" data-cy="tempo-option-medium">Medium</SelectItem>
                          <SelectItem value="fast" data-cy="tempo-option-fast">Fast</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-violet-200">Dancing Duration (minutes)</label>
                      <Slider
                        value={[dancingDuration]}
                        onValueChange={([value]) => setDancingDuration(value)}
                        min={10}
                        max={120}
                        step={5}
                        className="w-full"
                      />
                      <span className="text-sm text-violet-300">{dancingDuration} minutes</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <label className="text-lg font-medium text-violet-300">Genres</label>
                  <div className="flex flex-wrap gap-2 p-4 rounded-lg bg-zinc-800">
                    {genres.map((genre) => (
                      <div key={genre} className="flex items-center gap-1 px-3 py-1 rounded-full bg-violet-600 text-white">
                        <span>{genresList.find(g => g.value === genre)?.label || genre}</span>
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
                      data-cy="genre-select"
                    >
                      <SelectTrigger className="h-10 w-[120px] border-0 bg-zinc-800 text-base text-violet-300 hover:text-violet-400 focus:ring-violet-500" data-cy="genre-select-trigger">
                        <SelectValue placeholder="+ Add genre" />
                      </SelectTrigger>
                      <SelectContent className="border-0 bg-zinc-800 text-white p-0">
                        {(genresList || []).filter(g => !genres.includes(g.value)).map((g) => (
                          <SelectItem
                            key={g.value}
                            value={g.value}
                            data-cy={`genre-option-${g.value.toLowerCase().replace(' ', '-')}`}
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
                        data-cy="popularity-slider"
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
                        data-cy="danceability-slider"
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
                  {eventType !== "wedding" ? (
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
                  ) : (
                    <div className="pt-2">
                      <Slider
                        value={[receptionDuration + ceremonyDuration + dancingDuration]}
                        disabled
                        min={10}
                        max={300}
                        step={5}
                        className="w-full opacity-70"
                      />
                      <span className="text-sm text-violet-400">
                        Total Duration: {receptionDuration + ceremonyDuration + dancingDuration} minutes
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  data-cy="generate-button"
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
            </div>

            <div className="rounded-xl bg-zinc-900 p-8 shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-violet-400">Your Playlist</h2>
                <p className="text-violet-400">
                  {eventTypes.find((e) => e.value === eventType)?.label} •{" "}
                  {genres.map(g => genresList.find(item => item.value === g)?.label || g).join(", ")} •{" "}
                  {Math.round(filteredSongs.reduce((acc, s) => acc + s.duration_ms, 0) / 1000 / 60)} minutes
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
