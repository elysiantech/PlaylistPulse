'use client'

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader, Moon, Sun, LogIn, LogOut, Play, CheckCircle, XCircle, Search, Download } from "lucide-react";
import { toast } from "sonner";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  releaseYear: string;
  spotifyUrl: string;
  youtubeUrl: string | null;
  downloadUrl: string | null;
  downloadFilename: string | null;
  selected: boolean;
  status: 'idle' | 'searching_youtube' | 'youtube_found' | 'downloading' | 'downloaded' | 'error';
  errorMessage?: string;
}

const Main = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any | null>(null);
  const [downloadPath, setDownloadPath] = useState<string>("");
  const [showDownloadPathSelector, setShowDownloadPathSelector] = useState(false);

  // Initialize download path
  useEffect(() => {
    const savedPath = localStorage.getItem('downloadPath');
    if (savedPath) {
      setDownloadPath(savedPath);
    } else {
      // Set default path
      const defaultPath = `${navigator.platform.includes('Mac') ? '~/Downloads' : 'Downloads'}/PlaylistPulse`;
      setDownloadPath(defaultPath);
    }
  }, []);

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const sortedTracks = [...tracks].sort((a, b) => {
    if (!sortField || sortOrder === null) return 0; // No sort
    const fieldA = a[sortField as keyof Track];
    const fieldB = b[sortField as keyof Track];

    if (fieldA! < fieldB!) return sortOrder === 'asc' ? -1 : 1;
    if (fieldA! > fieldB!) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  const paginatedTracks = sortedTracks.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

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

  const handleSelectAll = (checked: boolean) => {
    setTracks(tracks.map(track => ({ ...track, selected: checked })));
  };

  const handleSelectTrack = (trackId: string, checked: boolean) => {
    setTracks(
      tracks.map(track =>
        track.id === trackId ? { 
          ...track, 
          selected: checked,
        } : track
      )
    );
  };

  const selectDownloadPath = async () => {
    try {
      // In Electron, we can use the dialog API
      if (typeof window !== 'undefined' && (window as any).electron) {
        const result = await (window as any).electron.showOpenDialog({
          properties: ['openDirectory'],
          title: 'Choose Download Folder'
        });
        if (!result.canceled && result.filePaths.length > 0) {
          setDownloadPath(result.filePaths[0]);
          localStorage.setItem('downloadPath', result.filePaths[0]);
          toast.success(`Download folder set to: ${result.filePaths[0]}`);
          return result.filePaths[0];
        }
      } else {
        // Fallback for web - use default Downloads folder
        const defaultPath = `${navigator.platform.includes('Mac') ? '~/Downloads' : 'Downloads'}/PlaylistPulse`;
        setDownloadPath(defaultPath);
        localStorage.setItem('downloadPath', defaultPath);
        return defaultPath;
      }
    } catch (error) {
      console.error('Error selecting download path:', error);
      toast.error('Failed to select download folder');
    }
    return null;
  };

  const getStatusIndicator = (track: Track) => {
    switch (track.status) {
      case 'searching_youtube':
        return <div className="flex items-center gap-1 text-amber-600"><Search className="h-4 w-4 animate-spin" /><span className="text-xs">Searching YouTube...</span></div>;
      case 'youtube_found':
        return <div className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" /><span className="text-xs">Found on YouTube</span></div>;
      case 'downloading':
        return <div className="flex items-center gap-1 text-blue-600"><Download className="h-4 w-4 animate-bounce" /><span className="text-xs">Downloading...</span></div>;
      case 'downloaded':
        return <div className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" /><span className="text-xs">Downloaded ✓</span></div>;
      case 'error':
        return <div className="flex items-center gap-1 text-red-600" title={track.errorMessage}><XCircle className="h-4 w-4" /><span className="text-xs">Error</span></div>;
      case 'idle':
      default:
        return track.selected ? <span className="text-xs text-muted-foreground">Queued</span> : null;
    }
  };

  const downloadDirectly = async (selectedSong: any, customDownloadPath?: string) => {
    const response = await fetch(`/api/mp3convert`, {
      method: 'POST',
      body: JSON.stringify({
        ...selectedSong,
        downloadDir: customDownloadPath || downloadPath
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return { 
          filename: result.filename, 
          filePath: result.filePath,
          message: result.message 
        };
      }
    }
    return { error: 'Download failed' }
  }

  const handleConversion = async () => {
    // Check if download path is set, if not prompt user to select
    let targetDownloadPath = downloadPath;
    if (!downloadPath || downloadPath.includes('~/') || downloadPath.includes('Downloads/PlaylistPulse')) {
      targetDownloadPath = await selectDownloadPath();
      if (!targetDownloadPath) {
        toast.error("Please select a download folder");
        return;
      }
    }

    setIsConverting(true);
    const selectedTracks = tracks.filter(track => track.selected);
    
    for (const selectedTrack of selectedTracks) {
      try {
        // Update status to searching YouTube
        setTracks(prev => prev.map(track =>
          track.id === selectedTrack.id
            ? { ...track, status: 'searching_youtube' as const }
            : track
        ));

        if (!selectedTrack.youtubeUrl) {
          selectedTrack.youtubeUrl = await fetchYoutubeUrl(selectedTrack.id, `${selectedTrack.title} ${selectedTrack.artist}`);
        }

        if (selectedTrack.youtubeUrl) {
          // Update status to YouTube found
          setTracks(prev => prev.map(track =>
            track.id === selectedTrack.id
              ? { ...track, status: 'youtube_found' as const, youtubeUrl: selectedTrack.youtubeUrl }
              : track
          ));

          if (!selectedTrack.downloadUrl) {
            // Update status to downloading
            setTracks(prev => prev.map(track =>
              track.id === selectedTrack.id
                ? { ...track, status: 'downloading' as const }
                : track
            ));

            // Download directly to user's chosen folder
            const result = await downloadDirectly(selectedTrack, targetDownloadPath);
            if (result.filePath) {
              setTracks(prev => prev.map(track =>
                track.id === selectedTrack.id
                  ? {
                    ...track,
                    downloadUrl: result.filePath!,
                    downloadFilename: result.filename!,
                    youtubeUrl: selectedTrack.youtubeUrl,
                    status: 'downloaded' as const
                  } : track
              ));
              toast.success(result.message || `Downloaded ${result.filename}`);
            } else {
              setTracks(prev => prev.map(track =>
                track.id === selectedTrack.id
                  ? { ...track, status: 'error' as const, errorMessage: result.error }
                  : track
              ));
              toast.error(result.error || "Download failed");
            }
          }
        } else {
          setTracks(prev => prev.map(track =>
            track.id === selectedTrack.id
              ? { ...track, status: 'error' as const, errorMessage: 'YouTube URL not found' }
              : track
          ));
          toast.error(`Could not find YouTube video for ${selectedTrack.title}`);
        }
      } catch (error) {
        setTracks(prev => prev.map(track =>
          track.id === selectedTrack.id
            ? { ...track, status: 'error' as const, errorMessage: 'Conversion error' }
            : track
        ));
        toast.error("Error during conversion");
      } 
    }
    setIsConverting(false);
  };

  const fetchYoutubeUrl = async (trackId: string, query: string) => {
    const response = await fetch(`/api/youtube?query=${encodeURIComponent(query)}`);
    if (response.ok) {
      const results = await response.json()
      if (results){
      const videoId = results[0].id;
      return `https://youtube.com/watch?v=${videoId}` 
      }
    }
    return null;
       
  };

  useEffect(() => {
    tracks.forEach(track => {
      if (track.selected && !track.youtubeUrl) {
        // fetchYoutubeUrl(track.id, `${track.title} ${track.artist}`);
      }
    });
  }, [tracks]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch('/api/spotify/playlists');
        if (response.ok) {
          const data = await response.json()
          setPlaylists(data.items);
        }
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };
    if (isAuthenticated) {
      fetchPlaylists();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch(`/api/spotify/playlists/${selectedPlaylist}`);
        if (response.ok) {
          const data = await response.json()
          setTracks(data.map((track: any) => {
            const releaseYear = track.releaseDate?.slice(0, 4) || 'Unknown';
            return {
              id: track.id,
              title: track.title,
              artist: track.artist,
              album: track.album,
              releaseYear: releaseYear,
              spotifyUrl: track.spotifyUrl,
              youtubeUrl: null,
              downloadUrl: null,
              downloadFilename: null,
              selected: false,
              status: 'idle' as const,
            }
          }));
        }
      } catch (error) {
        console.error("Error fetching tracks:", error);
      }
    };
    if (selectedPlaylist) {
      fetchTracks();
    }
  }, [selectedPlaylist]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Playlist Pulse</h1>
          <div className="flex gap-4">
            {/* Theme Toggle Button */}
            {/* <Button
              variant="default"
              className="bg-gray-800 text-white hover:bg-gray-700" // Add background styles
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button> */}

            {/* Authentication Button */}
            <a href={!isAuthenticated ? '/api/spotify/auth/login' : '/api/spotify/auth/logout'}>
              <Button
                //size="icon"
                className="bg-green-600 text-white hover:bg-green-500 flex items-center space-x-2 px-4 py-2"
              >
                {!isAuthenticated ? (
                  <LogIn className="h-5 w-5" />
                ) : (
                  <LogOut className="h-5 w-5" />
                )}
                {isAuthenticated && user?.display_name ? (
                  <span className="text-xs font-medium">{user.display_name}</span>
                ) : (<span className="text-xs font-medium">Spotify Login</span>)}
              </Button>
            </a>

            {/* Download Path Display */}
            <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium">Download to:</span>
              <code 
                className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                title={downloadPath || "Click to select download folder"}
                onClick={() => selectDownloadPath()}
              >
                {downloadPath ? 
                  (downloadPath.length > 50 ? `...${downloadPath.slice(-47)}` : downloadPath) : 
                  "Click to select folder"
                }
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectDownloadPath()}
                className="text-xs"
              >
                Change
              </Button>
            </div>

            {/* Convert Button */}
            <Button
              variant='default'
              onClick={handleConversion}
              disabled={!tracks.some(track => track.selected) || isConverting}
              className={`${isConverting ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-500'
                } text-white`}
            >
              {isConverting ? (
                <Loader className="h-5 w-5 animate-spin-slow mr-2" />
              ) : null}
              Download
            </Button>
          </div>
        </div>

        {isAuthenticated && (
          <div className="mb-8">
            <select
              className="w-full max-w-xs p-2 rounded-md border border-input bg-background"
              onChange={(e) => setSelectedPlaylist(e.target.value)}
              value={selectedPlaylist || ""}
            >
              <option value="">Select a Spotify Playlist</option>
              {playlists.map((playlist) => (
                <option key={playlist.id} value={playlist.id}>
                  {playlist.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedPlaylist && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={paginatedTracks.length > 0 && paginatedTracks.every((t) => t.selected)}
                      onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    />
                  </TableHead>
                  {['title', 'artist', 'album', 'releaseYear'].map((field) => (
                    <TableHead
                      key={field}
                      onClick={() => {
                        if (sortField === field) {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? null : 'asc');
                        } else {
                          setSortField(field);
                          setSortOrder('asc');
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                      {sortField === field ? (sortOrder === 'asc' ? ' ▲' : sortOrder === 'desc' ? ' ▼' : '') : ''}
                    </TableHead>
                  ))}
                  <TableHead>Spotify</TableHead>
                  <TableHead>YouTube</TableHead>
                  <TableHead>Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTracks.map((track) => (
                  <TableRow key={track.id}>
                    <TableCell>
                      <Checkbox
                        checked={track.selected}
                        onCheckedChange={(checked) => handleSelectTrack(track.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="truncate max-w-[250px]">{track.title}</TableCell>
                    <TableCell className="truncate max-w-[250px]">{track.artist}</TableCell>
                    <TableCell className="truncate max-w-[250px]">{track.album}</TableCell>
                    <TableCell>{track.releaseYear}</TableCell>
                    <TableCell>
                      <a
                        href={track.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-spotify-green hover:underline"
                      >
                        <Play className="h-5 w-5" />
                      </a>
                    </TableCell>
                    <TableCell>
                      {track.youtubeUrl ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={track.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-500 hover:underline"
                          >
                            Play
                          </a>
                          {(track.status === 'searching_youtube' || track.status === 'youtube_found') && getStatusIndicator(track)}
                        </div>
                      ) : (
                        getStatusIndicator(track)
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusIndicator(track)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                Rows per page:
                <Select
                  value={rowsPerPage.toString()}
                  onValueChange={(value) =>{
                    setRowsPerPage(Number(value));
                    setCurrentPage(1); // Reset to first page
                  }}
                >
                 <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value} rows
                </SelectItem>
              ))}
            </SelectContent>
                </Select>
                <span>
                  Page {currentPage} of {Math.ceil(tracks.length / rowsPerPage)}
                </span>
                
              </div>
              <div className="flex gap-2">
              <Button
              variant="outline"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Previ
                </Button>
                <Button
                variant="outline"
                  disabled={currentPage === Math.ceil(tracks.length / rowsPerPage)}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Next
                </Button>
                <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.ceil(tracks.length / rowsPerPage))}
                disabled={currentPage === Math.ceil(tracks.length / rowsPerPage)}
                >
            Last
          </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;