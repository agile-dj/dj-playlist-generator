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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(songList)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
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
        <BpmChart songs={songList} />
      ) : (
        <div className="rounded-md border border-violet-900">
          <div className="bg-gradient-to-r from-violet-900 to-violet-800 p-4">
            <div className="flex items-center">
              <div className="w-10" />
              <div className="flex-1 grid grid-cols-4 text-white font-medium">
                <div>Artist</div>
                <div>Song name</div>
                <div className="text-right">BPM</div>
                <div className="text-right">Length</div>
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
                  {songList.map((song, index) => (
                    <Draggable
                      key={song.track_id}
                      draggableId={song.track_id}
                      index={index}
                    >
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
                            <div className="text-right">{Math.round(song.tempo)}</div>
                            <div className="text-right">{Math.round(song.duration_ms / 1000 / 60)}m</div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
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
