import { SpotifySong } from "./song"

export interface GenreItem {
  value: string
  label: string
}

export interface WeddingSegmentState {
  receptionTempo: string
  ceremonyTempo: string
  dancingTempo: string
  receptionDuration: number
  ceremonyDuration: number
  dancingDuration: number
}

export interface PlaylistState {
  eventType: string
  genres: string[]
  popularity: number
  danceability: number
  duration: number
  showResults: boolean
  isGenerating: boolean
  filteredSongs: SpotifySong[]
  weddingSegments: WeddingSegmentState
  genresList: GenreItem[]
}
