import { SpotifySong } from "@/types/song"
import { FilterParams } from './filter-songs'

export interface TempoSegment {
  label: string
  tempoRange: [number, number]
  duration: number
}

const MIN_SONGS_PER_SEGMENT = 10

export const convertTempoToRange = (tempo: string): [number, number] => {
  switch (tempo) {
    case "slow":
      return [50, 75]
    case "medium":
      return [90, 115]
    case "fast":
      return [120, 150]
    default:
      return [90, 115]
  }
}

interface PlaylistRequest {
  label: string
  duration: number
  tempoRange?: [number, number]
}

async function getSongsForRequest(
  request: PlaylistRequest,
  baseParams: Omit<FilterParams, 'duration' | 'tempoRange'>,
  filterSongs: (params: FilterParams) => Promise<SpotifySong[]>,
  usedTrackIds?: Set<string>
): Promise<SpotifySong[]> {
  // Make both requests in parallel - one with genres, one without
  const [withGenres, withoutGenres] = await Promise.all([
    filterSongs({
      ...baseParams,
      duration: request.duration,
      tempoRange: request.tempoRange,
      segment: request.label
    }),
    filterSongs({
      ...baseParams,
      genres: [], // no genre filtering
      duration: request.duration,
      tempoRange: request.tempoRange,
      segment: request.label
    })
  ])

  // Combine results, prioritizing songs with matching genres
  const uniqueSongs: SpotifySong[] = []
  const seenIds = new Set<string>()

  // Helper to add songs while respecting used track IDs
  const addUniqueSongs = (songs: SpotifySong[]) => {
    for (const song of songs) {
      const id = song.track_id
      if (!id || seenIds.has(id) || (usedTrackIds && usedTrackIds.has(id))) continue
      seenIds.add(id)
      if (usedTrackIds) usedTrackIds.add(id)
      uniqueSongs.push(song)
      if (uniqueSongs.length >= MIN_SONGS_PER_SEGMENT) break
    }
  }

  // First add songs that match the genre criteria
  addUniqueSongs(withGenres)

  // If we need more songs, add from the no-genre results
  if (uniqueSongs.length < MIN_SONGS_PER_SEGMENT) {
    addUniqueSongs(withoutGenres)
  }

  if (uniqueSongs.length === 0) {
    console.warn(`[PlaylistGenerator] Segment "${request.label}" has 0 songs even after fallback.`)
  }

  return uniqueSongs
}

export async function generateWeddingPlaylist(
  segments: TempoSegment[],
  baseParams: Omit<FilterParams, 'duration' | 'tempoRange'>,
  filterSongs: (params: FilterParams) => Promise<SpotifySong[]>
): Promise<SpotifySong[]> {
  try {
    const usedTrackIds = new Set<string>()
    const segmentRequests = segments.map(segment => ({
      label: segment.label,
      duration: segment.duration,
      tempoRange: segment.tempoRange
    }))

    // Get songs for all segments in parallel
    const segmentResults = await Promise.all(
      segmentRequests.map(request =>
        getSongsForRequest(request, baseParams, filterSongs, usedTrackIds)
          .then(songs => ({ label: request.label, songs }))
      )
    )

    return processWeddingSegments(segments, segmentResults)
  } catch (error) {
    console.error('Error generating wedding playlist:', error)
    throw error
  }
}

export async function generateRegularPlaylist(
  duration: number,
  baseParams: Omit<FilterParams, 'duration'>,
  filterSongs: (params: FilterParams) => Promise<SpotifySong[]>
): Promise<SpotifySong[]> {
  try {
    const songs = await getSongsForRequest(
      { label: "Full", duration },
      baseParams,
      filterSongs
    )

    return processRegularPlaylist([{ label: "Full", songs }])
  } catch (error) {
    console.error('Error generating regular playlist:', error)
    throw error
  }
}

export const processWeddingSegments = (
  segments: TempoSegment[],
  results: Array<{ label: string; songs: SpotifySong[] }>
): SpotifySong[] => {
  const segmentOrder = ["Reception", "ceremony", "Dancing"]
  return segmentOrder.flatMap(segment =>
    results
      .filter(result => result.label === segment)
      .flatMap(result =>
        result.songs.map(song => ({ ...song, segment }))
      )
  )
}

export const processRegularPlaylist = (
  results: Array<{ label: string; songs: SpotifySong[] }>
): SpotifySong[] => {
  return results[0].songs.map(song => ({ ...song, segment: "Full" }))
}
