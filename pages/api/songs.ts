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
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SpotifySong[]>
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const params = req.body as FilterParams
  const datasetPath = path.join(process.cwd(), 'spotify_dataset', 'dataset.csv')
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
          danceability: Number(row.danceability)
        }
        songs.push(song)
      })
      .on('end', () => {
        resolve(songs)
      })
      .on('error', reject)
  })

  // Filter songs based on parameters
  const filteredSongs = songs.filter(song => {
    // Genre filter
    if (!params.genres.includes(song.track_genre)) {
      return false
    }

    // Popularity filter (±10)
    if (Math.abs(song.popularity - params.popularity) > 10) {
      return false
    }

    // // Danceability filter (±40%)
    // if (Math.abs(song.danceability - params.danceability) > 0.4) {
    //   return false
    // }

    return true
  })

  // Sort by popularity 
  const sortedSongs = filteredSongs.sort((a, b) => b.popularity - a.popularity).slice(0, 20)

  // filter by total songs duration 
  const totalDuration = sortedSongs.reduce((acc: number, song: SpotifySong) => acc + song.duration_ms, 0)
  
  if (totalDuration > params.duration * 60 * 1000) {
    sortedSongs.pop()
  }

  res.status(200).json(sortedSongs)
}
