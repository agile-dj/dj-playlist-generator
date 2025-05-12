import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Song {
  id: number
  artist: string
  title: string
  bpm: number
  length: string
}

interface BpmChartProps {
  songs: Song[]
}

export default function BpmChart({ songs }: BpmChartProps) {
  // Prepare data for Recharts
  const chartData = songs.map((song, index) => ({
    name: song.title,
    bpm: song.bpm,
    artist: song.artist,
    index: index + 1
  }))

  return (
    <div className="rounded-md border border-violet-900 bg-zinc-900 p-4">
      <h3 className="mb-4 text-lg font-medium text-violet-300">BPM Flow</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="bpmColor" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="index" 
              stroke="#8b5cf6"
              tick={{ fill: '#8b5cf6' }}
              label={{ value: 'Track Number', position: 'bottom', fill: '#8b5cf6' }}
            />
            <YAxis 
              dataKey="bpm"
              stroke="#8b5cf6"
              tick={{ fill: '#8b5cf6' }}
              label={{ value: 'BPM', angle: -90, position: 'left', fill: '#8b5cf6' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #8b5cf6',
                borderRadius: '0.375rem',
                color: '#8b5cf6'
              }}
              labelStyle={{ color: '#8b5cf6' }}
              formatter={(value: number, name: string) => [`${value} BPM`, 'BPM']}
              labelFormatter={(value) => `Track ${value}`}
            />
            <Line
              type="monotone"
              dataKey="bpm"
              stroke="url(#bpmColor)"
              strokeWidth={3}
              dot={{
                fill: '#ffffff',
                stroke: '#8b5cf6',
                strokeWidth: 2,
                r: 4
              }}
              activeDot={{
                fill: '#ffffff',
                stroke: '#06b6d4',
                strokeWidth: 2,
                r: 6
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
