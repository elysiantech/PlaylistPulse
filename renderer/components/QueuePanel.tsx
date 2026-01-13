'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Search, Download, CheckCircle, XCircle, Loader, FolderOpen, Trash2 } from 'lucide-react';
import { Track } from './QueueTable';

interface QueuePanelProps {
  queuedTracks: Track[];
  onReorderQueue: (tracks: Track[]) => void;
  onRemoveFromQueue: (trackId: string) => void;
  onClearQueue: () => void;
  downloadPath: string;
  onSelectDownloadPath: () => void;
  onExport: () => void;
  isExporting: boolean;
}

function SortableTrackItem({
  track,
  index,
  onRemove,
}: {
  track: Track;
  index: number;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusIcon = (track: Track) => {
    switch (track.status) {
      case 'searching_youtube':
        return <Search className="h-3 w-3 text-amber-400 animate-spin" />;
      case 'youtube_found':
        return <CheckCircle className="h-3 w-3 text-blue-400" />;
      case 'downloading':
        return <Download className="h-3 w-3 text-cyan-400 animate-bounce" />;
      case 'downloaded':
        return <CheckCircle className="h-3 w-3 text-green-400" />;
      case 'error':
        return (
          <span title={track.errorMessage}>
            <XCircle className="h-3 w-3 text-red-400" />
          </span>
        );
      default:
        return <span className="w-3 h-3 rounded-full bg-gray-600" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 group"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span className="text-[10px] text-gray-600 font-mono w-5">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="w-8 h-8 bg-gray-800 rounded shadow-md flex-shrink-0 overflow-hidden">
        {track.albumArt ? (
          <img src={track.albumArt} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs text-white font-semibold truncate">{track.title}</div>
        <div className="text-[10px] text-gray-500 truncate">{track.artist}</div>
      </div>

      <div className="flex items-center gap-2">
        {getStatusIcon(track)}
        <button
          onClick={() => onRemove(track.id)}
          className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
          title="Remove"
        >
          <i className="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>
    </div>
  );
}

export function QueuePanel({
  queuedTracks,
  onReorderQueue,
  onRemoveFromQueue,
  onClearQueue,
  downloadPath,
  onSelectDownloadPath,
  onExport,
  isExporting,
}: QueuePanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = queuedTracks.findIndex((t) => t.id === active.id);
      const newIndex = queuedTracks.findIndex((t) => t.id === over.id);
      onReorderQueue(arrayMove(queuedTracks, oldIndex, newIndex));
    }
  };

  const downloadedCount = queuedTracks.filter(t => t.status === 'downloaded').length;

  return (
    <aside className="w-80 glass-panel flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Export Queue
            </h2>
            <h3 className="text-lg font-black">
              {queuedTracks.length} Track{queuedTracks.length !== 1 ? 's' : ''}
            </h3>
          </div>
          {queuedTracks.length > 0 && (
            <button
              onClick={onClearQueue}
              className="text-gray-500 hover:text-red-400 transition p-2"
              title="Clear queue"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-2">
        {queuedTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
            <i className="fa-solid fa-list text-3xl mb-3 opacity-20"></i>
            <p className="text-xs">Queue is empty</p>
            <p className="text-[10px] text-gray-600 mt-1">Click + on tracks to add</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={queuedTracks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {queuedTracks.map((track, index) => (
                <SortableTrackItem
                  key={track.id}
                  track={track}
                  index={index}
                  onRemove={onRemoveFromQueue}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Export Section */}
      <div className="p-4 border-t border-white/5 space-y-3">
        {/* Download Path */}
        <button
          onClick={onSelectDownloadPath}
          className="w-full bg-white/5 hover:bg-white/10 text-left p-3 rounded-lg border border-white/5 transition flex items-center justify-between group"
        >
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Export to</div>
            <div className="text-xs text-gray-300 truncate">
              {downloadPath || 'Select folder...'}
            </div>
          </div>
          <FolderOpen className="h-4 w-4 text-gray-600 group-hover:text-vibe-cyan flex-shrink-0 ml-2" />
        </button>

        {/* Progress indicator */}
        {downloadedCount > 0 && downloadedCount < queuedTracks.length && (
          <div className="text-[10px] text-gray-500 text-center">
            {downloadedCount} of {queuedTracks.length} ready
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={onExport}
          disabled={isExporting || queuedTracks.length === 0}
          className="w-full bg-vibe-cyan text-black font-black py-3 rounded-lg shadow-lg hover:scale-[1.02] transition active:scale-95 uppercase tracking-tighter text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,242,255,0.3)]"
        >
          {isExporting ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export ({queuedTracks.length})
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
