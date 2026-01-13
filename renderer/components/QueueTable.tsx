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
import { GripVertical, Search, Download, CheckCircle, XCircle, Loader } from 'lucide-react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  releaseYear: string;
  spotifyUrl: string;
  albumArt?: string;
  youtubeUrl: string | null;
  downloadUrl: string | null;
  downloadFilename: string | null;
  selected: boolean;
  status: 'idle' | 'searching_youtube' | 'youtube_found' | 'downloading' | 'downloaded' | 'error';
  errorMessage?: string;
}

interface QueueTableProps {
  queuedTracks: Track[];
  onReorderQueue: (tracks: Track[]) => void;
  onRemoveFromQueue: (trackId: string) => void;
  onClearQueue: () => void;
  isExporting: boolean;
}

function SortableTrackRow({
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

  const getStatusBadge = (track: Track) => {
    switch (track.status) {
      case 'searching_youtube':
        return (
          <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
            <Search className="h-3 w-3 animate-spin" /> Searching
          </span>
        );
      case 'youtube_found':
        return (
          <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Found
          </span>
        );
      case 'downloading':
        return (
          <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
            <Download className="h-3 w-3 animate-bounce" /> Downloading
          </span>
        );
      case 'downloaded':
        return (
          <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Ready
          </span>
        );
      case 'error':
        return (
          <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1" title={track.errorMessage}>
            <XCircle className="h-3 w-3" /> Error
          </span>
        );
      default:
        return (
          <span className="bg-gray-500/10 text-gray-400 text-[10px] font-bold px-2 py-1 rounded">
            Queued
          </span>
        );
    }
  };

  return (
    <tr ref={setNodeRef} style={style} className="track-row group">
      <td className="py-3 pl-2 text-gray-600 font-mono">
        <div className="flex items-center gap-2">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400">
            <GripVertical className="h-4 w-4" />
          </button>
          {String(index + 1).padStart(2, '0')}
        </div>
      </td>
      <td className="py-3">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gray-800 rounded shadow-md flex-shrink-0 overflow-hidden">
            {track.albumArt ? (
              <img src={track.albumArt} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-white font-semibold truncate">{track.title}</div>
            <div className="text-xs text-gray-500 truncate">{track.artist}</div>
          </div>
        </div>
      </td>
      <td className="py-3">
        {getStatusBadge(track)}
      </td>
      <td className="py-3 text-right pr-4 space-x-4">
        <a
          title="Open in Spotify"
          href={track.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-spotify-green transition"
        >
          <i className="fa-brands fa-spotify text-lg"></i>
        </a>
        {track.youtubeUrl && (
          <a
            title="Open in YouTube"
            href={track.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-red-500 transition"
          >
            <i className="fa-brands fa-youtube text-lg"></i>
          </a>
        )}
        <button
          onClick={() => onRemove(track.id)}
          className="text-gray-500 hover:text-white"
          title="Remove from queue"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </td>
    </tr>
  );
}

export function QueueTable({
  queuedTracks,
  onReorderQueue,
  onRemoveFromQueue,
  onClearQueue,
  isExporting,
}: QueueTableProps) {
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

  return (
    <main className="flex-1 glass-panel flex flex-col overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-end">
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Current Session
          </h2>
          <h1 className="text-4xl font-black">Mainstage Queue</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClearQueue}
            disabled={queuedTracks.length === 0}
            className="bg-white/5 hover:bg-white/10 p-2 px-4 rounded-md text-xs font-bold border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Queue
          </button>
          <button
            disabled={isExporting}
            className="bg-vibe-cyan text-black p-2 px-6 rounded-md text-xs font-black uppercase tracking-tighter shadow-[0_0_15px_rgba(0,242,255,0.4)] disabled:opacity-50"
          >
            {isExporting ? (
              <span className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" /> Exporting...
              </span>
            ) : (
              'Play Session'
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {queuedTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <i className="fa-solid fa-music text-4xl mb-4 opacity-20"></i>
            <p className="text-sm">No tracks in queue</p>
            <p className="text-xs text-gray-600 mt-1">Select a playlist and click tracks to add them</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full text-left">
              <thead className="text-[10px] text-gray-500 uppercase tracking-widest sticky top-0 bg-[#080808]/80 backdrop-blur-md">
                <tr>
                  <th className="pb-4 pl-2 w-16">#</th>
                  <th className="pb-4">Track Detail</th>
                  <th className="pb-4 w-32">Status</th>
                  <th className="pb-4 text-right pr-4 w-32">Links</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <SortableContext
                  items={queuedTracks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {queuedTracks.map((track, index) => (
                    <SortableTrackRow
                      key={track.id}
                      track={track}
                      index={index}
                      onRemove={onRemoveFromQueue}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
        )}
      </div>
    </main>
  );
}
