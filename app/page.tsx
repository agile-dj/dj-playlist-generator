import type { Metadata } from "next"
import PlaylistGenerator from "@/components/playlist-generator"

export const metadata: Metadata = {
  title: "Playlist Generator",
  description: "Generate the perfect playlist for your event",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <PlaylistGenerator />
    </main>
  )
}
