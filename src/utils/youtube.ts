export interface YoutubeInfo {
  url: string | null
  thumbnail: string | null
}

export async function getYoutubeLink(trackName: string, artist: string): Promise<YoutubeInfo> {
  const apiKey = "AIzaSyA79qNAj_B6pj-cNZu4WgXpu94NL15C2lY"
  const query = encodeURIComponent(`${trackName} ${artist}`)
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${query}&key=${apiKey}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    const item = data.items?.[0]
    const videoId = item?.id?.videoId
    const thumbnail = item?.snippet?.thumbnails?.default?.url

    return {
      url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
      thumbnail: thumbnail || null
    }
  } catch (err) {
    console.error("YouTube API error:", err)
    return { url: null, thumbnail: null }
  }
}

