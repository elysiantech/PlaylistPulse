'use client'

import { Plus, Check, Loader } from 'lucide-react';
import { Track } from './QueueTable';

interface TrackListProps {
  playlistName: string | null;
  tracks: Track[];
  queuedTrackIds: Set<string>;
  onAddToQueue: (track: Track) => void;
  isLoading: boolean;
}

export function TrackList({
  playlistName,
  tracks,
  queuedTrackIds,
  onAddToQueue,
  isLoading,
}: TrackListProps) {
  return (
    <main className="flex-1 glass-panel flex flex-col overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          {playlistName ? 'Browsing Playlist' : 'Select a Playlist'}
        </h2>
        <h1 className="text-3xl font-black">
          {playlistName || 'Track Browser'}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="h-8 w-8 animate-spin text-vibe-cyan" />
          </div>
        ) : !playlistName ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <i className="fa-solid fa-compact-disc text-4xl mb-4 opacity-20"></i>
            <p className="text-sm">Select a playlist from the Crate Manager</p>
            <p className="text-xs text-gray-600 mt-1">Click a playlist to browse its tracks</p>
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <i className="fa-solid fa-music text-4xl mb-4 opacity-20"></i>
            <p className="text-sm">No tracks in this playlist</p>
          </div>
        ) : (
          <div className="space-y-1">
            {tracks.map((track) => {
              const isQueued = queuedTrackIds.has(track.id);
              return (
                <div
                  key={track.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 group"
                >
                  {/* Album Art */}
                  <div className="w-10 h-10 bg-gray-800 rounded shadow-md flex-shrink-0 overflow-hidden">
                    {track.albumArt ? (
                      <img src={track.albumArt} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold truncate text-sm">{track.title}</div>
                    <div className="text-xs text-gray-500 truncate">{track.artist}</div>
                  </div>

                  {/* Year */}
                  <div className="text-gray-500 text-xs w-12 text-right flex-shrink-0">
                    {track.releaseYear}
                  </div>

                  {/* Spotify Link */}
                  <a
                    href={track.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-green-500 transition flex-shrink-0"
                    title="Open in Spotify"
                  >
                    <i className="fa-brands fa-spotify text-lg"></i>
                  </a>

                  {/* YouTube Link */}
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.title} ${track.artist}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-red-500 transition flex-shrink-0"
                    title="Search on YouTube"
                  >
                    <i className="fa-brands fa-youtube text-lg"></i>
                  </a>

                  {/* Add Button */}
                  <div className="flex-shrink-0">
                    {isQueued ? (
                      <span className="text-vibe-cyan">
                        <Check className="h-5 w-5" />
                      </span>
                    ) : (
                      <button
                        onClick={() => onAddToQueue(track)}
                        className="p-2 rounded-full bg-white/5 hover:bg-vibe-cyan hover:text-black transition"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
