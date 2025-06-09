import { useState, useEffect } from "react"
import { BarChart3, List, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import BpmChart from "./bpm-chart"

import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd"

import { SpotifySong } from "@/types/song"

interface SongListProps {
  songs: SpotifySong[]
}

export default function SongList({ songs }: SongListProps) {
  const [showChart, setShowChart] = useState(false)
  const [songList, setSongList] = useState<SpotifySong[]>(songs)

  useEffect(() => {
    setSongList(songs)
  }, [songs])

  const totalDurationMinutes = Number(
    (songList.reduce((acc, song) => acc + song.duration_ms, 0) / 1000 / 60).toFixed(1)
  )

  const genres = Array.from(new Set(songList.map((s) => s.track_genre)))

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(songList)
    const [moved] = items.splice(result.source.index, 1)

    const prevSong = items[result.destination.index - 1]
    const nextSong = items[result.destination.index]
    const destinationSegment = prevSong?.segment || nextSong?.segment || moved.segment

    moved.segment = destinationSegment

    items.splice(result.destination.index, 0, moved)
    setSongList(items)
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button
          onClick={() => setShowChart(!showChart)}
          className="h-12 px-4 bg-gradient-to-r from-violet-600 to-cyan-500 text-base font-medium text-white hover:from-violet-700 hover:to-cyan-600"
        >
          {showChart ? (
            <>
              <List className="mr-2 h-4 w-4" />
              View List
            </>
          ) : (
            <>
              <BarChart3 className="mr-2 h-4 w-4" />
              View Stats
            </>
          )}
        </Button>
      </div>

      {showChart ? (
        <BpmChart songs={songList} totalDurationMinutes={totalDurationMinutes} genres={genres} />
      ) : (
        <div className="rounded-md border border-violet-900">
          <div className="bg-gradient-to-r from-violet-900 to-violet-800 p-4">
            <div className="flex items-center">
              <div className="w-10" />
              <div className="flex-1 grid grid-cols-4 text-white font-medium">
                <div>Artist</div>
                <div>Song name</div>
                <div className="text-right">Length</div>
                <div className="text-right">Play</div>
              </div>
            </div>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="songs">
              {(provided: DroppableProvided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="divide-y divide-violet-900/30"
                >
                  {songList.map((song, index) => {
                    const isNewSegment =
                      index === 0 || song.segment !== songList[index - 1].segment

                    return (
                      <div key={`${song.track_id}-${index}`}>
                        {isNewSegment && (
                          <div className="bg-violet-950 px-4 py-2 text-white font-semibold border-t border-violet-800">
                            {song.segment}
                          </div>
                        )}
                        <Draggable draggableId={song.track_id} index={index}>
                          {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center p-4 bg-transparent ${snapshot.isDragging ? 'bg-violet-900/20' : 'hover:bg-violet-900/10'}`}
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="text-violet-400 mr-4"
                              >
                                <GripVertical />
                              </div>
                              <div className="flex-1 grid grid-cols-4">
                                <div>{song.artists}</div>
                                <div>{song.track_name}</div>
                                <div className="text-right">{Math.round(song.duration_ms / 1000 / 60)}m</div>
                                <div className="text-right"></div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      </div>
                    )
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
    </div>
  )
}
