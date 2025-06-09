import { promises as fs } from 'fs'
import path from 'path'
import { parse } from 'csv-parse'
import type { NextApiRequest, NextApiResponse } from 'next'
import { SpotifySong } from '@/types/song'

interface FilterParams {
  eventType: string
  genres: string[]
  popularity: number
  danceability: number
  duration: number
  tempoRange?: [number, number]
  segment?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SpotifySong[]>
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const params = req.body as FilterParams
  const datasetPath = path.join(process.cwd(), 'spotify_dataset', 'songs_data.csv')
  const fileContent = await fs.readFile(datasetPath, 'utf-8')
  
  const songs: SpotifySong[] = await new Promise((resolve, reject) => {
    const songs: SpotifySong[] = []
    
    parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      cast: true
    })
      .on('data', (row: any) => {
        // Convert string values to numbers where needed
        const song: SpotifySong = {
          ...row,
          popularity: Number(row.popularity),
          duration_ms: Number(row.duration_ms),
          danceability: Number(row.danceability),
          tempo: Number(row.tempo)
        }
        songs.push(song)
      })
      .on('end', () => {
        resolve(songs)
      })
      .on('error', reject)
  })

  // Flexible filtering logic for songs
  let filteredSongs = songs.filter(song => {
    const genreMatch = params.genres.includes(song.track_genre);
    const popularityMatch = Math.abs(song.popularity - params.popularity) <= 20;
    const tempoMatch = !params.tempoRange || (
      song.tempo >= params.tempoRange[0] && song.tempo <= params.tempoRange[1]
    );
    return genreMatch && popularityMatch && tempoMatch;
  });

  // Fallback: if too few songs matched, relax genre constraint but keep tempo filter
  if (filteredSongs.length < 20) {
    filteredSongs = songs.filter(song => {
      const popularityMatch = Math.abs(song.popularity - params.popularity) <= 25;
      const tempoMatch = !params.tempoRange || (
        song.tempo >= params.tempoRange[0] && song.tempo <= params.tempoRange[1]
      );
      return popularityMatch && tempoMatch;
    });
  }

  // Sort by popularity 
  const sortedSongs = filteredSongs.sort((a, b) => b.popularity - a.popularity)

  // Accumulate songs until total duration exceeds maxDuration
  let playlist: SpotifySong[] = []
  let accumulatedDuration = 0
  const maxDuration = params.duration * 60 * 1000

  for (const song of sortedSongs) {
    if (accumulatedDuration + song.duration_ms > maxDuration) break;
    playlist.push(song)
    accumulatedDuration += song.duration_ms
  }

  res.status(200).json(playlist)
}
