import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

import { SpotifySong, convertToChartSong } from "@/types/song"

interface BpmChartProps {
  songs: SpotifySong[]
  totalDurationMinutes: number
}

export default function BpmChart({ songs }: BpmChartProps) {
  // Convert songs to chart format and prepare data for Recharts
  const chartData = songs.map((song, index) => {
    const chartSong = convertToChartSong(song)
    return ({
      name: chartSong.title,
      bpm: chartSong.bpm,
      artist: chartSong.artist,
      index: index + 1,
      segment: chartSong.segment // Optional field for segment info
    })
  })

  // Calculate exact segment alignment with playlist segments
  const segments: { name: string; startIndex: number; endIndex: number }[] = [];
  let lastSegment: string | null = null;
  let startIndex = 0;

  chartData.forEach((item, idx) => {
    if (item.segment !== lastSegment) {
      if (lastSegment !== null) {
        segments.push({ name: lastSegment, startIndex, endIndex: idx - 1 });
      }
      lastSegment = item.segment;
      startIndex = idx;
    }
    if (idx === chartData.length - 1) {
      segments.push({ name: lastSegment, startIndex, endIndex: idx });
    }
  });

  // Ensure first segment always starts at track 1
  if (segments.length > 0 && segments[0].startIndex !== 0) {
    segments[0].startIndex = 0;
  }

  return (
    <div className="rounded-md border border-violet-900 bg-zinc-900 p-4">
      <h3 className="mb-4 text-lg font-medium text-violet-300">BPM Flow</h3>
      <div className="h-[300px] w-full">
        <div className="flex w-full text-xs text-white justify-between mb-1 px-1">
          {segments.map((seg, i) => (
            <div
              key={`label-${i}`}
              style={{
                flex: `${seg.endIndex - seg.startIndex + 1} 0 auto`,
                textAlign: "center"
              }}
            >
              {seg.name}
            </div>
          ))}
        </div>
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
              formatter={(value: number) => [`${value} BPM`]}
              labelFormatter={(value) => songs[value - 1]?.track_name || `Track ${value}`}
            />
            {segments.slice(0, -1).map((seg, i) => (
              <ReferenceLine
                key={`segment-end-${i}`}
                x={segments[i].endIndex + 1}
                stroke="#8b5cf6"
                strokeDasharray="4 4"
              />
            ))}
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
