'use client'

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

import { Navbar } from "@/components/Navbar";
import { CrateManager } from "@/components/CrateManager";
import { TrackList } from "@/components/TrackList";
import { QueuePanel } from "@/components/QueuePanel";
import { Track } from "@/components/QueueTable";

const QUEUE_STORAGE_KEY = 'vibesync_queue';

export default function Home() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  // Playlist state
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  // Queue state
  const [queuedTracks, setQueuedTracks] = useState<Track[]>([]);

  // Export state
  const [downloadPath, setDownloadPath] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  // Request tracking to prevent stale responses
  const latestPlaylistRequest = useRef<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    // Load download path
    const savedPath = localStorage.getItem('downloadPath');
    if (savedPath) {
      setDownloadPath(savedPath);
    } else {
      const defaultPath = `${navigator.platform.includes('Mac') ? '~/Downloads' : 'Downloads'}/VibeSync`;
      setDownloadPath(defaultPath);
    }

    // Load queued tracks
    const savedQueue = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (savedQueue) {
      try {
        const parsed = JSON.parse(savedQueue);
        // Reset status to idle on restore (need to re-download)
        const restored = parsed.map((t: Track) => ({
          ...t,
          status: t.status === 'downloaded' ? 'downloaded' : 'idle',
        }));
        setQueuedTracks(restored);
      } catch (e) {
        console.error('Failed to restore queue:', e);
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queuedTracks));
  }, [queuedTracks]);

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/spotify/me');
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.isAuthenticated);
          setUser(data.user);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setIsAuthenticated(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch playlists when authenticated
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch('/api/spotify/playlists');
        if (response.ok) {
          const data = await response.json();
          setPlaylists(data.items || []);
        }
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };
    if (isAuthenticated) {
      fetchPlaylists();
    }
  }, [isAuthenticated]);

  // Fetch tracks when playlist is selected
  const handleSelectPlaylist = useCallback(async (playlistId: string) => {
    // Track this request to prevent stale responses
    latestPlaylistRequest.current = playlistId;

    setSelectedPlaylistId(playlistId);
    setIsLoadingTracks(true);

    try {
      const response = await fetch(`/api/spotify/playlists/${playlistId}`);

      // Ignore response if a newer request was made
      if (latestPlaylistRequest.current !== playlistId) {
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const tracks: Track[] = data.map((track: any) => ({
          id: track.id,
          title: track.title,
          artist: track.artist,
          album: track.album,
          releaseYear: track.releaseDate?.slice(0, 4) || 'Unknown',
          spotifyUrl: track.spotifyUrl,
          albumArt: track.albumArt || null,
          youtubeUrl: null,
          downloadUrl: null,
          downloadFilename: null,
          selected: false,
          status: 'idle' as const,
        }));
        setPlaylistTracks(tracks);
      }
    } catch (error) {
      // Ignore errors from stale requests
      if (latestPlaylistRequest.current !== playlistId) {
        return;
      }
      console.error("Error fetching tracks:", error);
      toast.error("Failed to load tracks");
    } finally {
      // Only clear loading if this is still the latest request
      if (latestPlaylistRequest.current === playlistId) {
        setIsLoadingTracks(false);
      }
    }
  }, []);

  // Add track to queue
  const handleAddToQueue = useCallback((track: Track) => {
    setQueuedTracks((prev) => {
      // Check if already in queue
      if (prev.some((t) => t.id === track.id)) {
        toast.info(`${track.title} is already in queue`);
        return prev;
      }
      toast.success(`Added ${track.title} to queue`);
      return [...prev, { ...track, status: 'idle' }];
    });
  }, []);

  // Remove track from queue
  const handleRemoveFromQueue = useCallback((trackId: string) => {
    setQueuedTracks((prev) => prev.filter((t) => t.id !== trackId));
  }, []);

  // Reorder queue
  const handleReorderQueue = useCallback((newOrder: Track[]) => {
    setQueuedTracks(newOrder);
  }, []);

  // Clear queue
  const handleClearQueue = useCallback(() => {
    setQueuedTracks([]);
    toast.success("Queue cleared");
  }, []);

  // Select download path
  const selectDownloadPath = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).electron) {
        const result = await (window as any).electron.showOpenDialog({
          properties: ['openDirectory'],
          title: 'Choose Export Folder'
        });
        if (!result.canceled && result.filePaths.length > 0) {
          setDownloadPath(result.filePaths[0]);
          localStorage.setItem('downloadPath', result.filePaths[0]);
          toast.success(`Export folder set to: ${result.filePaths[0]}`);
          return result.filePaths[0];
        }
      } else {
        const defaultPath = `${navigator.platform.includes('Mac') ? '~/Downloads' : 'Downloads'}/VibeSync`;
        setDownloadPath(defaultPath);
        localStorage.setItem('downloadPath', defaultPath);
        return defaultPath;
      }
    } catch (error) {
      console.error('Error selecting download path:', error);
      toast.error('Failed to select export folder');
    }
    return null;
  };

  // Export queue
  const handleExport = async () => {
    if (queuedTracks.length === 0) {
      toast.error("No tracks in queue");
      return;
    }

    // Ensure download path is set
    let targetPath = downloadPath;
    if (!downloadPath || downloadPath.includes('~/')) {
      targetPath = await selectDownloadPath();
      if (!targetPath) {
        toast.error("Please select an export folder");
        return;
      }
    }

    setIsExporting(true);

    for (const track of queuedTracks) {
      // Skip already downloaded
      if (track.status === 'downloaded') continue;

      try {
        // Update status: searching YouTube
        setQueuedTracks((prev) =>
          prev.map((t) =>
            t.id === track.id ? { ...t, status: 'searching_youtube' } : t
          )
        );

        // Search YouTube
        let youtubeUrl = track.youtubeUrl;
        if (!youtubeUrl) {
          const ytResponse = await fetch(
            `/api/youtube?query=${encodeURIComponent(`${track.title} ${track.artist}`)}`
          );
          if (ytResponse.ok) {
            const results = await ytResponse.json();
            if (results && results.length > 0) {
              youtubeUrl = `https://youtube.com/watch?v=${results[0].id}`;
            }
          }
        }

        if (!youtubeUrl) {
          setQueuedTracks((prev) =>
            prev.map((t) =>
              t.id === track.id
                ? { ...t, status: 'error', errorMessage: 'YouTube video not found' }
                : t
            )
          );
          toast.error(`Could not find ${track.title} on YouTube`);
          continue;
        }

        // Update status: YouTube found
        setQueuedTracks((prev) =>
          prev.map((t) =>
            t.id === track.id ? { ...t, status: 'youtube_found', youtubeUrl } : t
          )
        );

        // Update status: downloading
        setQueuedTracks((prev) =>
          prev.map((t) =>
            t.id === track.id ? { ...t, status: 'downloading' } : t
          )
        );

        // Download and convert
        const convertResponse = await fetch('/api/mp3convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: track.title,
            artist: track.artist,
            album: track.album,
            releaseYear: track.releaseYear,
            youtubeUrl,
            downloadDir: targetPath,
          }),
        });

        if (convertResponse.ok) {
          const result = await convertResponse.json();
          if (result.success) {
            setQueuedTracks((prev) =>
              prev.map((t) =>
                t.id === track.id
                  ? {
                      ...t,
                      status: 'downloaded',
                      downloadUrl: result.filePath,
                      downloadFilename: result.filename,
                      youtubeUrl,
                    }
                  : t
              )
            );
            toast.success(`Downloaded ${track.title}`);
          } else {
            throw new Error(result.error);
          }
        } else {
          const error = await convertResponse.json();
          throw new Error(error.error);
        }
      } catch (error: any) {
        setQueuedTracks((prev) =>
          prev.map((t) =>
            t.id === track.id
              ? { ...t, status: 'error', errorMessage: error.message }
              : t
          )
        );
        toast.error(`Failed to download ${track.title}`);
      }
    }

    setIsExporting(false);
    toast.success("Export complete!");
  };

  // Get queued track IDs for quick lookup
  const queuedTrackIds = new Set(queuedTracks.map((t) => t.id));

  // Get selected playlist name
  const selectedPlaylistName =
    playlists.find((p) => p.id === selectedPlaylistId)?.name || null;

  return (
    <div className="h-screen flex flex-col overflow-hidden p-2 text-white">
      <Navbar isAuthenticated={isAuthenticated} user={user} />

      <div className="flex flex-1 overflow-hidden gap-2">
        {/* Left: Crate Manager */}
        <CrateManager
          playlists={playlists}
          selectedPlaylistId={selectedPlaylistId}
          onSelectPlaylist={handleSelectPlaylist}
          isAuthenticated={isAuthenticated}
        />

        {/* Center: Track List from selected playlist */}
        <TrackList
          playlistName={selectedPlaylistName}
          tracks={playlistTracks}
          queuedTrackIds={queuedTrackIds}
          onAddToQueue={handleAddToQueue}
          isLoading={isLoadingTracks}
        />

        {/* Right: Queue + Export */}
        <QueuePanel
          queuedTracks={queuedTracks}
          onReorderQueue={handleReorderQueue}
          onRemoveFromQueue={handleRemoveFromQueue}
          onClearQueue={handleClearQueue}
          downloadPath={downloadPath}
          onSelectDownloadPath={selectDownloadPath}
          onExport={handleExport}
          isExporting={isExporting}
        />
      </div>
    </div>
  );
}
