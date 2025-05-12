import type { Metadata } from "next"
import PlaylistGenerator from "@/components/playlist-generator"

export const metadata: Metadata = {
  title: "MatchTune AI",
  description: "Generate the perfect playlist for your event using MatchTune AI",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="w-full px-2 py-4 border-b border-gray-800">
        <div className="container mx-auto flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">MatchTune AI</h1>
        </div>
      </header>
      <PlaylistGenerator />
    </main>
  )
}
