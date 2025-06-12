export interface SpotifySong {
  track_id: string
  artists: string
  album_name: string
  track_name: string
  popularity: number
  duration_ms: number
  danceability: number
  track_genre: string
  tempo: number
  segment: string
  youtube_url?: string
}

export interface ChartSong {
  id: number
  artist: string
  title: string
  bpm: number
  length: string
  segment: string
}

export function convertToChartSong(song: SpotifySong): ChartSong {
  return {
    id: parseInt(song.track_id),
    artist: song.artists,
    title: song.track_name,
    bpm: song.tempo,
    length: `${Math.round(song.duration_ms / 1000 / 60)}m`,
    segment: song.segment ?? "General"
  }
}
