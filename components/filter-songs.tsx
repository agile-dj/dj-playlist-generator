import { SpotifySong } from '@/types/song'

interface FilterParams {
  eventType: string;
  genres: string[];
  popularity: number;
  danceability: number;
  segment?: string;
  tempo?: number;
  tempoRange?: [number, number];
  duration: number;
}

export async function filterSongs(params: FilterParams): Promise<SpotifySong[]> {
  const response = await fetch('api/songs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params)
  })

  if (!response.ok) {
    console.log(response)
    throw new Error('Failed to fetch songs')
  }

  const songs: SpotifySong[] = await response.json()

  const filtered = params.tempoRange
    ? songs.filter(song => song.tempo >= params.tempoRange![0] && song.tempo <= params.tempoRange![1])
    : songs;

  return filtered
}
