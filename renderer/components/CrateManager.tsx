'use client'

import { Disc, Bolt, Moon, Clock } from "lucide-react";

interface Playlist {
  id: string;
  name: string;
  images?: { url: string }[];
}

interface CrateManagerProps {
  playlists: Playlist[];
  selectedPlaylistId: string | null;
  onSelectPlaylist: (id: string) => void;
  isAuthenticated: boolean;
}

export function CrateManager({
  playlists,
  selectedPlaylistId,
  onSelectPlaylist,
  isAuthenticated,
}: CrateManagerProps) {
  // Default icons for playlists based on index
  const getPlaylistIcon = (index: number) => {
    const icons = [Bolt, Moon, Clock, Disc];
    const Icon = icons[index % icons.length];
    return <Icon className="w-4 h-4" />;
  };

  return (
    <aside className="w-72 glass-panel flex flex-col p-4">
      <div className="flex items-center gap-3 text-gray-400 font-bold mb-6 px-2">
        <i className="fa-solid fa-compact-disc text-xl accent-cyan"></i>
        <span>Crate Manager</span>
      </div>

      <div className="space-y-1 flex-1 overflow-y-auto">
        {playlists.length > 0 ? (
          playlists.map((playlist, index) => (
            <div
              key={playlist.id}
              onClick={() => onSelectPlaylist(playlist.id)}
              className={`p-2 track-row cursor-pointer flex items-center gap-3 text-sm transition ${
                selectedPlaylistId === playlist.id
                  ? 'text-vibe-cyan bg-white/10 rounded'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {getPlaylistIcon(index)}
              <span className="truncate">{playlist.name}</span>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-sm px-2">
            {isAuthenticated ? 'No playlists found' : 'Login to see your playlists'}
          </div>
        )}
      </div>

    </aside>
  );
}
