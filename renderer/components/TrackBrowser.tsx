'use client'

import { X, Plus, Loader } from 'lucide-react';
import { Track } from './QueueTable';

interface TrackBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  playlistName: string;
  tracks: Track[];
  queuedTrackIds: Set<string>;
  onAddToQueue: (track: Track) => void;
  isLoading: boolean;
}

export function TrackBrowser({
  isOpen,
  onClose,
  playlistName,
  tracks,
  queuedTrackIds,
  onAddToQueue,
  isLoading,
}: TrackBrowserProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative ml-auto w-[500px] h-full bg-[#0a0a0a] border-l border-white/10 flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              Browsing Playlist
            </h2>
            <h1 className="text-2xl font-black">{playlistName}</h1>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Track List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="h-8 w-8 animate-spin text-vibe-cyan" />
            </div>
          ) : tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-sm">No tracks in this playlist</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tracks.map((track) => {
                const isQueued = queuedTrackIds.has(track.id);
                return (
                  <div
                    key={track.id}
                    className={`p-3 rounded-lg flex items-center gap-4 transition ${
                      isQueued
                        ? 'bg-vibe-cyan/10 border border-vibe-cyan/20'
                        : 'bg-white/5 hover:bg-white/10 cursor-pointer'
                    }`}
                    onClick={() => !isQueued && onAddToQueue(track)}
                  >
                    {/* Album Art */}
                    <div className="w-12 h-12 bg-gray-800 rounded shadow-md flex-shrink-0 overflow-hidden">
                      {track.albumArt ? (
                        <img src={track.albumArt} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold truncate">{track.title}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {track.artist} • {track.album}
                      </div>
                    </div>

                    {/* Add Button */}
                    {isQueued ? (
                      <span className="text-[10px] text-vibe-cyan font-bold uppercase">In Queue</span>
                    ) : (
                      <button className="text-gray-400 hover:text-vibe-cyan transition p-2">
                        <Plus className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <p className="text-[11px] text-gray-500 text-center">
            Click a track to add it to your queue
          </p>
        </div>
      </div>
    </div>
  );
}
