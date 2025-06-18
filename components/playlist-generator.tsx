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
import { WeddingSegments, getWeddingSegments } from "./wedding-playlist/wedding-segments"
import { processWeddingSegments, processRegularPlaylist } from "./playlist-utils"
import { PlaylistState, WeddingSegmentState } from "@/types/playlist"

const initialWeddingState: WeddingSegmentState = {
  receptionTempo: "",
  ceremonyTempo: "",
  dancingTempo: "",
  receptionDuration: 30,
  ceremonyDuration: 15,
  dancingDuration: 60
}

const initialPlaylistState: PlaylistState = {
  eventType: "",
  genres: [],
  popularity: 50,
  danceability: 50,
  duration: 60,
  showResults: false,
  isGenerating: false,
  filteredSongs: [],
  weddingSegments: initialWeddingState,
  genresList: []
}

export default function PlaylistGenerator() {
  const [state, setState] = useState<PlaylistState>(initialPlaylistState)
  const [weddingState, setWeddingState] = useState<WeddingSegmentState>(initialWeddingState)

  useEffect(() => {
    fetch("/api/genres")
      .then((res) => res.json())
      .then((data) => setState(prev => ({ ...prev, genresList: data })))
      .catch((err) => console.error("Failed to fetch genres:", err))
  }, [])

  const handleGenerate = () => {
    setState(prev => ({ ...prev, isGenerating: true }))

    const baseParams = {
      eventType: state.eventType,
      genres: state.genres,
      popularity: state.popularity,
      danceability: state.danceability
    }

    const weddingSegments = state.eventType === "wedding"
      ? getWeddingSegments(weddingState)
      : []

    if (state.eventType === "wedding") {
      // Step 1: gather all results for each segment (with possible duplicates between segments)
      Promise.all(
        weddingSegments.map(segment =>
          (async () => {
            const songs = await filterSongs({
              ...baseParams,
              duration: segment.duration,
              tempoRange: segment.tempoRange,
              segment: segment.label
            })

            const MIN_SONGS = 10
            if (songs.length >= MIN_SONGS) return { label: segment.label, songs }

            const fallbackSongs = await filterSongs({
              ...baseParams,
              genres: [], // remove genre filtering
              duration: segment.duration,
              tempoRange: segment.tempoRange,
              segment: segment.label
            })

            const merged = [...songs]
            for (const s of fallbackSongs) {
              if (!merged.some(existing => existing.track_id === s.track_id)) {
                merged.push(s)
              }
              if (merged.length >= MIN_SONGS) break
            }

            return { label: segment.label, songs: merged }
          })()
        )
      )
        .then(async rawSegmentResults => {
          // Step 2: filter out duplicates across segments, async, with fallback if needed
          const MIN_SONGS = 10
          let usedTrackIds = new Set<string>()
          const uniqueSegmentResults = await Promise.all(
            rawSegmentResults.map(async ({ label, songs }, i) => {
              const unique: typeof songs = []

              for (const song of songs) {
                const id = song.track_id
                if (!id || usedTrackIds.has(id)) continue
                usedTrackIds.add(id)
                unique.push(song)
              }

              if (unique.length >= MIN_SONGS) return { label, songs: unique }

              const fallbackSongs = await filterSongs({
                ...baseParams,
                genres: [],
                duration: weddingSegments[i].duration,
                tempoRange: weddingSegments[i].tempoRange,
                segment: label
              })

              for (const song of fallbackSongs) {
                const id = song.track_id
                if (!id || usedTrackIds.has(id)) continue
                usedTrackIds.add(id)
                unique.push(song)
                if (unique.length >= MIN_SONGS) break
              }

              if (unique.length === 0) {
                console.warn(`[PlaylistGenerator] Segment "${label}" has 0 songs even after fallback.`)
              }

              return { label, songs: unique }
            })
          )
          console.log("Segment Results:", uniqueSegmentResults)
          const results = uniqueSegmentResults // make sure this includes all segments
          const combinedSongs = processWeddingSegments(weddingSegments, results)

          setState(prev => ({
            ...prev,
            filteredSongs: combinedSongs,
            isGenerating: false,
            showResults: true
          }))
        })
        .catch(error => {
          console.error('Error filtering songs:', error)
          setState(prev => ({ ...prev, isGenerating: false }))
        })
    } else {
      // Not a wedding: use old logic with fallback if not enough songs
      const MIN_SONGS = 10
      filterSongs({ ...baseParams, duration: state.duration })
        .then(songs => {
          if (songs.length >= MIN_SONGS) return songs
          return filterSongs({ ...baseParams, genres: [], duration: state.duration })
            .then(fallbackSongs => {
              const merged = [...songs]
              for (const s of fallbackSongs) {
                if (!merged.some(existing => existing.track_id === s.track_id)) {
                  merged.push(s)
                }
                if (merged.length >= MIN_SONGS) break
              }
              return merged
            })
        })
        .then(songs => [{ label: "Full", songs }])
        .then(results => {
          const combinedSongs = processRegularPlaylist(results)
          setState(prev => ({
            ...prev,
            filteredSongs: combinedSongs,
            isGenerating: false,
            showResults: true
          }))
        })
        .catch(error => {
          console.error('Error filtering songs:', error)
          setState(prev => ({ ...prev, isGenerating: false }))
        })
    }
  }

  const handleBack = () => {
    setState(prev => ({ ...prev, showResults: false }))
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl">
        {!state.showResults ? (
          <div className="flex flex-col items-center">
            <h1 className="mb-2 text-center text-4xl font-bold tracking-tight text-violet-400">
              Design your perfect playlist🎵
            </h1>
            <p className="mb-12 text-center text-violet-400">Fine-tune your sound</p>

            <div className="w-full rounded-xl bg-zinc-900 p-8 shadow-lg">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-lg font-medium text-violet-300">Event Type</label>
                  <Select 
                  value={state.eventType} 
                  onValueChange={(value) => setState(prev => ({ ...prev, eventType: value }))} 
                  data-cy="event-type-select">
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
                {state.eventType === "wedding" && (
                  <WeddingSegments
                    state={weddingState}
                    onChange={setWeddingState}
                  />
                )}

                <div className="space-y-4">
                  <label className="text-lg font-medium text-violet-300">Genres</label>
                  <div className="flex flex-wrap gap-2 p-4 rounded-lg bg-zinc-800">
                    {state.genres.map((genre) => (
                      <div key={genre} className="flex items-center gap-1 px-3 py-1 rounded-full bg-violet-600 text-white">
                        <span>{state.genresList.find(g => g.value === genre)?.label || genre}</span>
                        <button
                          onClick={() => setState(prev => ({ ...prev, genres: prev.genres.filter(g => g !== genre) }))}
                          className="hover:text-violet-200"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (value && !state.genres.includes(value)) {
                          setState(prev => ({ ...prev, genres: [...prev.genres, value] }))
                        }
                      }}
                      data-cy="genre-select"
                    >
                      <SelectTrigger className="h-10 w-[120px] border-0 bg-zinc-800 text-base text-violet-300 hover:text-violet-400 focus:ring-violet-500" data-cy="genre-select-trigger">
                        <SelectValue placeholder="+ Add genre" />
                      </SelectTrigger>
                      <SelectContent className="border-0 bg-zinc-800 text-white p-0">
                        {(state.genresList || []).filter(g => !state.genres.includes(g.value)).map((g) => (
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
                        <span className="text-lg text-violet-400">{state.popularity}%</span>
                      </div>
                      <Slider
                        data-cy="popularity-slider"
                        value={[state.popularity]}
                        onValueChange={([value]) => setState(prev => ({ ...prev, popularity: value }))}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <label className="text-lg font-medium text-violet-300">Danceability</label>
                        <span className="text-lg text-violet-400">{state.danceability}%</span>
                      </div>
                      <Slider
                        data-cy="danceability-slider"
                        value={[state.danceability]}
                        onValueChange={([value]) => setState(prev => ({ ...prev, danceability: value }))}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-lg font-medium text-violet-300">Playlist Length</label>
                  {state.eventType !== "wedding" ? (
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
                            onClick={() => setState(prev => ({ ...prev, duration: mins }))}
                            className={`sm:h-14 h-10 rounded-lg text-base font-medium transition-all ${state.duration === mins
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
                        value={[state.weddingSegments.receptionDuration + state.weddingSegments.ceremonyDuration + state.weddingSegments.dancingDuration]}
                        disabled
                        min={10}
                        max={300}
                        step={5}
                        className="w-full opacity-70"
                      />
                      <span className="text-sm text-violet-400">
                        Total Duration: {state.weddingSegments.receptionDuration + state.weddingSegments.ceremonyDuration + state.weddingSegments.dancingDuration} minutes
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  data-cy="generate-button"
                  onClick={handleGenerate}
                  disabled={!state.eventType || state.genres.length === 0 || state.duration === 0 || state.isGenerating}
                  className="mt-6 h-14 w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-base font-medium text-white hover:from-violet-700 hover:to-cyan-600"
                >
                  {state.isGenerating ? (
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
                  {eventTypes.find((e) => e.value === state.eventType)?.label} •{" "}
                  {state.genres.map(g => state.genresList.find(item => item.value === g)?.label || g).join(", ")} •{" "}
                  {Math.round(state.filteredSongs.reduce((acc, s) => acc + s.duration_ms, 0) / 1000 / 60)} minutes
                </p>
              </div>
              {state.showResults && (
                <div className="space-y-8">
                  {state.isGenerating ? (
                    <div className="flex justify-center items-center py-12">
                      <ClipLoader color="#7c3aed" size={40} />
                    </div>
                  ) : (
                    <SongList songs={state.filteredSongs} />
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
