import { SpotifySong } from "@/types/song"

export interface TempoSegment {
  label: string
  tempoRange: [number, number]
  duration: number
}

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
