import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { TempoSegment, convertTempoToRange } from "../playlist-utils"

import { WeddingSegmentState } from "@/types/playlist"

interface WeddingSegmentsProps {
  state: WeddingSegmentState
  onChange: (newState: WeddingSegmentState) => void
}

export function WeddingSegments({ state, onChange }: WeddingSegmentsProps) {
  return (
    <div className="space-y-6 rounded-lg border border-violet-900 p-4 mt-4 bg-zinc-800">
      <h2 className="text-xl font-semibold text-violet-300">Wedding Segments</h2>

      <div className="space-y-2">
        <label className="text-violet-200">Reception</label>
        <Select 
          value={state.receptionTempo} 
          onValueChange={(value) => onChange({ ...state, receptionTempo: value })} 
          data-cy="reception-tempo-select">
          <SelectTrigger className="h-12 w-full bg-zinc-700 border-0 text-violet-200" data-cy="reception-tempo-trigger">
            <SelectValue placeholder="Select tempo for reception" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 text-white">
            <SelectItem value="slow" data-cy="tempo-option-slow">Slow</SelectItem>
            <SelectItem value="medium" data-cy="tempo-option-medium">Medium</SelectItem>
            <SelectItem value="fast" data-cy="tempo-option-fast">Fast</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-violet-200">Reception Duration (minutes)</label>
        <Slider
          value={[state.receptionDuration]}
          onValueChange={([value]: [number]) => onChange({ ...state, receptionDuration: value })}
          min={10}
          max={120}
          step={5}
          className="w-full"
          data-cy="reception-duration-slider"
        />
        <span className="text-sm text-violet-300">{state.receptionDuration} minutes</span>
      </div>

      <div className="space-y-2">
        <label className="text-violet-200">Ceremony</label>
        <Select 
          value={state.ceremonyTempo} 
          onValueChange={(value) => onChange({ ...state, ceremonyTempo: value })} 
          data-cy="ceremony-tempo-select">
          <SelectTrigger className="h-12 w-full bg-zinc-700 border-0 text-violet-200" data-cy="ceremony-tempo-trigger">
            <SelectValue placeholder="Select tempo for ceremony" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 text-white">
            <SelectItem value="slow" data-cy="tempo-option-slow">Slow</SelectItem>
            <SelectItem value="medium" data-cy="tempo-option-medium">Medium</SelectItem>
            <SelectItem value="fast" data-cy="tempo-option-fast">Fast</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-violet-200">Ceremony Duration (minutes)</label>
        <Slider
          value={[state.ceremonyDuration]}
          onValueChange={([value]: [number]) => onChange({ ...state, ceremonyDuration: value })}
          min={10}
          max={120}
          step={5}
          className="w-full"
          data-cy="ceremony-duration-slider"
        />
        <span className="text-sm text-violet-300">{state.ceremonyDuration} minutes</span>
      </div>

      <div className="space-y-2">
        <label className="text-violet-200">Dancing</label>
        <Select 
          value={state.dancingTempo} 
          onValueChange={(value) => onChange({ ...state, dancingTempo: value })} 
          data-cy="dancing-tempo-select">
          <SelectTrigger className="h-12 w-full bg-zinc-700 border-0 text-violet-200" data-cy="dancing-tempo-trigger">
            <SelectValue placeholder="Select tempo for dancing" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 text-white">
            <SelectItem value="slow" data-cy="tempo-option-slow">Slow</SelectItem>
            <SelectItem value="medium" data-cy="tempo-option-medium">Medium</SelectItem>
            <SelectItem value="fast" data-cy="tempo-option-fast">Fast</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-violet-200">Dancing Duration (minutes)</label>
        <Slider
          value={[state.dancingDuration]}
          onValueChange={([value]: [number]) => onChange({ ...state, dancingDuration: value })}
          min={10}
          max={120}
          step={5}
          className="w-full"
          data-cy="dancing-duration-slider"
        />
        <span className="text-sm text-violet-300">{state.dancingDuration} minutes</span>
      </div>

      <div className="pt-2">
        <Slider
          value={[state.receptionDuration + state.ceremonyDuration + state.dancingDuration]}
          disabled
          min={10}
          max={300}
          step={5}
          className="w-full opacity-70"
        />
        <span className="text-sm text-violet-400">
          Total Duration: {state.receptionDuration + state.ceremonyDuration + state.dancingDuration} minutes
        </span>
      </div>
    </div>
  )
}

export function getWeddingSegments(
  state: WeddingSegmentState
): TempoSegment[] {
  return [
    {
      label: "Reception",
      tempoRange: convertTempoToRange(state.receptionTempo),
      duration: state.receptionDuration
    },
    {
      label: "ceremony",
      tempoRange: convertTempoToRange(state.ceremonyTempo),
      duration: state.ceremonyDuration
    },
    {
      label: "Dancing",
      tempoRange: convertTempoToRange(state.dancingTempo),
      duration: state.dancingDuration
    }
  ]
}
