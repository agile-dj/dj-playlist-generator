import type { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import { parse } from 'csv-parse'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const datasetPath = path.join(process.cwd(), 'spotify_dataset', 'dataset.csv')
    const fileContent = await fs.readFile(datasetPath, 'utf-8')

    const genres = await new Promise<string[]>((resolve, reject) => {
      const genreSet = new Set<string>()

      parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      })
        .on('data', (row: any) => {
          if (row.track_genre) genreSet.add(row.track_genre.trim())
        })
        .on('end', () => {
          resolve(Array.from(genreSet))
        })
        .on('error', reject)
    })

    res.status(200).json(genres.map(g => ({ value: g, label: g })))
  } catch (error) {
    console.error("Failed to load genres:", error)
    res.status(500).json({ error: "Failed to load genres" })
  }
}