import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Song {
  id: number
  artist: string
  title: string
  bpm: number
  length: string
}

interface SongListProps {
  genre: string
  eventType: string
}

// Hardcoded songs for different genres
const songsByGenre: Record<string, Song[]> = {
  pop: [
    { id: 1, artist: "Taylor Swift", title: "Cruel Summer", bpm: 170, length: "2:58" },
    { id: 2, artist: "The Weeknd", title: "Blinding Lights", bpm: 171, length: "3:20" },
    { id: 3, artist: "Dua Lipa", title: "Levitating", bpm: 103, length: "3:23" },
    { id: 4, artist: "Harry Styles", title: "As It Was", bpm: 174, length: "2:47" },
    { id: 5, artist: "Olivia Rodrigo", title: "good 4 u", bpm: 166, length: "2:58" },
    { id: 6, artist: "Justin Bieber", title: "Peaches", bpm: 90, length: "3:18" },
    { id: 7, artist: "Ariana Grande", title: "positions", bpm: 144, length: "2:52" },
    { id: 8, artist: "Billie Eilish", title: "Happier Than Ever", bpm: 110, length: "4:58" },
    { id: 9, artist: "Ed Sheeran", title: "Bad Habits", bpm: 126, length: "3:51" },
    { id: 10, artist: "BTS", title: "Butter", bpm: 110, length: "2:44" },
  ],
  rock: [
    { id: 1, artist: "AC/DC", title: "Back In Black", bpm: 96, length: "4:15" },
    { id: 2, artist: "Queen", title: "Bohemian Rhapsody", bpm: 72, length: "5:55" },
    { id: 3, artist: "Led Zeppelin", title: "Stairway to Heaven", bpm: 82, length: "8:02" },
    { id: 4, artist: "Guns N' Roses", title: "Sweet Child O' Mine", bpm: 126, length: "5:56" },
    { id: 5, artist: "Nirvana", title: "Smells Like Teen Spirit", bpm: 117, length: "5:01" },
    { id: 6, artist: "The Rolling Stones", title: "Paint It Black", bpm: 160, length: "3:22" },
    { id: 7, artist: "Metallica", title: "Enter Sandman", bpm: 123, length: "5:32" },
    { id: 8, artist: "The Beatles", title: "Come Together", bpm: 82, length: "4:19" },
    { id: 9, artist: "Pink Floyd", title: "Comfortably Numb", bpm: 63, length: "6:23" },
    { id: 10, artist: "Foo Fighters", title: "Everlong", bpm: 158, length: "4:10" },
  ],
  hiphop: [
    { id: 1, artist: "Kendrick Lamar", title: "HUMBLE.", bpm: 75, length: "2:57" },
    { id: 2, artist: "Drake", title: "God's Plan", bpm: 77, length: "3:18" },
    { id: 3, artist: "Travis Scott", title: "SICKO MODE", bpm: 155, length: "5:12" },
    { id: 4, artist: "Post Malone", title: "Rockstar", bpm: 160, length: "3:38" },
    { id: 5, artist: "Cardi B", title: "Bodak Yellow", bpm: 125, length: "3:44" },
    { id: 6, artist: "J. Cole", title: "MIDDLE CHILD", bpm: 123, length: "3:34" },
    { id: 7, artist: "Megan Thee Stallion", title: "Savage", bpm: 94, length: "2:34" },
    { id: 8, artist: "Lil Nas X", title: "MONTERO", bpm: 179, length: "2:17" },
    { id: 9, artist: "Kanye West", title: "Stronger", bpm: 104, length: "5:12" },
    { id: 10, artist: "Eminem", title: "Lose Yourself", bpm: 171, length: "5:26" },
  ],
  electronic: [
    { id: 1, artist: "Daft Punk", title: "Get Lucky", bpm: 116, length: "6:07" },
    { id: 2, artist: "Calvin Harris", title: "Summer", bpm: 128, length: "3:42" },
    { id: 3, artist: "Avicii", title: "Levels", bpm: 126, length: "3:19" },
    { id: 4, artist: "Skrillex", title: "Bangarang", bpm: 110, length: "3:35" },
    { id: 5, artist: "Marshmello", title: "Alone", bpm: 100, length: "3:20" },
    { id: 6, artist: "Zedd", title: "Clarity", bpm: 128, length: "4:30" },
    { id: 7, artist: "Martin Garrix", title: "Animals", bpm: 128, length: "3:12" },
    { id: 8, artist: "David Guetta", title: "Titanium", bpm: 126, length: "4:05" },
    { id: 9, artist: "Deadmau5", title: "Strobe", bpm: 128, length: "10:37" },
    { id: 10, artist: "Swedish House Mafia", title: "Don't You Worry Child", bpm: 129, length: "3:33" },
  ],
  jazz: [
    { id: 1, artist: "Miles Davis", title: "So What", bpm: 136, length: "9:22" },
    { id: 2, artist: "John Coltrane", title: "Giant Steps", bpm: 286, length: "4:46" },
    { id: 3, artist: "Dave Brubeck", title: "Take Five", bpm: 172, length: "5:24" },
    { id: 4, artist: "Thelonious Monk", title: "Round Midnight", bpm: 60, length: "6:41" },
    { id: 5, artist: "Louis Armstrong", title: "What a Wonderful World", bpm: 70, length: "2:21" },
    { id: 6, artist: "Duke Ellington", title: "Take the A Train", bpm: 160, length: "2:55" },
    { id: 7, artist: "Ella Fitzgerald", title: "Summertime", bpm: 72, length: "4:50" },
    { id: 8, artist: "Charlie Parker", title: "Ornithology", bpm: 220, length: "3:01" },
    { id: 9, artist: "Herbie Hancock", title: "Cantaloupe Island", bpm: 136, length: "5:30" },
    { id: 10, artist: "Bill Evans", title: "Waltz for Debby", bpm: 120, length: "6:48" },
  ],
  classical: [
    { id: 1, artist: "Ludwig van Beethoven", title: "Symphony No. 5", bpm: 108, length: "7:05" },
    { id: 2, artist: "Wolfgang Amadeus Mozart", title: "Eine kleine Nachtmusik", bpm: 140, length: "5:47" },
    { id: 3, artist: "Johann Sebastian Bach", title: "Air on the G String", bpm: 55, length: "5:46" },
    { id: 4, artist: "Antonio Vivaldi", title: "The Four Seasons - Spring", bpm: 114, length: "3:36" },
    { id: 5, artist: "Frédéric Chopin", title: "Nocturne Op. 9 No. 2", bpm: 138, length: "4:33" },
    { id: 6, artist: "Pyotr Ilyich Tchaikovsky", title: "Swan Lake", bpm: 94, length: "3:00" },
    { id: 7, artist: "Claude Debussy", title: "Clair de Lune", bpm: 100, length: "5:00" },
    { id: 8, artist: "Franz Schubert", title: "Ave Maria", bpm: 52, length: "4:55" },
    { id: 9, artist: "Johannes Brahms", title: "Hungarian Dance No. 5", bpm: 140, length: "2:56" },
    { id: 10, artist: "George Frideric Handel", title: "Messiah - Hallelujah", bpm: 100, length: "3:44" },
  ],
  rnb: [
    { id: 1, artist: "Beyoncé", title: "Crazy In Love", bpm: 100, length: "3:56" },
    { id: 2, artist: "Usher", title: "Yeah!", bpm: 105, length: "4:10" },
    { id: 3, artist: "Alicia Keys", title: "If I Ain't Got You", bpm: 72, length: "3:48" },
    { id: 4, artist: "Bruno Mars", title: "That's What I Like", bpm: 134, length: "3:30" },
    { id: 5, artist: "The Weeknd", title: "Earned It", bpm: 120, length: "4:37" },
    { id: 6, artist: "SZA", title: "Kill Bill", bpm: 94, length: "2:33" },
    { id: 7, artist: "Frank Ocean", title: "Thinkin Bout You", bpm: 115, length: "3:20" },
    { id: 8, artist: "Rihanna", title: "Love On The Brain", bpm: 172, length: "3:44" },
    { id: 9, artist: "John Legend", title: "All of Me", bpm: 120, length: "4:29" },
    { id: 10, artist: "H.E.R.", title: "Focus", bpm: 140, length: "3:15" },
  ],
}

// Default songs if genre not found
const defaultSongs: Song[] = [
  { id: 1, artist: "Various Artists", title: "Song 1", bpm: 120, length: "3:30" },
  { id: 2, artist: "Various Artists", title: "Song 2", bpm: 125, length: "3:45" },
  { id: 3, artist: "Various Artists", title: "Song 3", bpm: 130, length: "4:00" },
  { id: 4, artist: "Various Artists", title: "Song 4", bpm: 135, length: "3:15" },
  { id: 5, artist: "Various Artists", title: "Song 5", bpm: 140, length: "3:50" },
  { id: 6, artist: "Various Artists", title: "Song 6", bpm: 145, length: "4:10" },
  { id: 7, artist: "Various Artists", title: "Song 7", bpm: 150, length: "3:25" },
  { id: 8, artist: "Various Artists", title: "Song 8", bpm: 155, length: "3:40" },
  { id: 9, artist: "Various Artists", title: "Song 9", bpm: 160, length: "4:05" },
  { id: 10, artist: "Various Artists", title: "Song 10", bpm: 165, length: "3:55" },
]

export default function SongList({ genre, eventType }: SongListProps) {
  // Get songs based on genre, or use default if not found
  const songs = songsByGenre[genre] || defaultSongs

  return (
    <div className="rounded-md border border-violet-900">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-violet-900 to-violet-800 hover:from-violet-900 hover:to-violet-800">
            <TableHead className="w-[50px] text-white">#</TableHead>
            <TableHead className="text-white">Artist</TableHead>
            <TableHead className="text-white">Song</TableHead>
            <TableHead className="text-white text-right">BPM</TableHead>
            <TableHead className="text-white text-right">Length</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {songs.map((song) => (
            <TableRow key={song.id} className="border-violet-900/30 hover:bg-violet-900/10">
              <TableCell className="font-medium text-violet-400">{song.id}</TableCell>
              <TableCell>{song.artist}</TableCell>
              <TableCell>{song.title}</TableCell>
              <TableCell className="text-right">{song.bpm}</TableCell>
              <TableCell className="text-right">{song.length}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
