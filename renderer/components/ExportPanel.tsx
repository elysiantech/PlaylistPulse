'use client'

import { Download, FolderOpen, Loader } from 'lucide-react';

interface ExportPanelProps {
  downloadPath: string;
  onSelectDownloadPath: () => void;
  onExport: () => void;
  isExporting: boolean;
  queueLength: number;
}

export function ExportPanel({
  downloadPath,
  onSelectDownloadPath,
  onExport,
  isExporting,
  queueLength,
}: ExportPanelProps) {
  return (
    <aside className="w-80 flex flex-col gap-2">
      <div className="glass-panel p-6 flex-1">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <i className="fa-solid fa-file-export accent-cyan"></i>
          Export Session
        </h3>

        <p className="text-[11px] text-gray-500 mb-6">
          Convert your current VibeSync queue into MP3 files with full metadata for your DJ software.
        </p>

        {/* Download Path */}
        <div className="mb-6">
          <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 block">
            Export Location
          </label>
          <button
            onClick={onSelectDownloadPath}
            className="w-full bg-white/5 hover:bg-white/10 text-left p-3 rounded-lg border border-white/5 transition flex items-center justify-between group"
          >
            <span className="text-xs text-gray-300 truncate max-w-[200px]">
              {downloadPath || 'Select folder...'}
            </span>
            <FolderOpen className="h-4 w-4 text-gray-600 group-hover:text-vibe-cyan flex-shrink-0" />
          </button>
        </div>

        {/* Export Format Buttons (future) */}
        <div className="space-y-3 opacity-50">
          <button
            disabled
            className="w-full bg-white/5 text-left p-3 rounded-lg border border-white/5 flex items-center justify-between cursor-not-allowed"
          >
            <span className="text-xs font-semibold text-gray-500">Rekordbox XML</span>
            <span className="text-[9px] text-gray-600">Coming Soon</span>
          </button>
          <button
            disabled
            className="w-full bg-white/5 text-left p-3 rounded-lg border border-white/5 flex items-center justify-between cursor-not-allowed"
          >
            <span className="text-xs font-semibold text-gray-500">Serato Tracklist (.txt)</span>
            <span className="text-[9px] text-gray-600">Coming Soon</span>
          </button>
          <button
            disabled
            className="w-full bg-white/5 text-left p-3 rounded-lg border border-white/5 flex items-center justify-between cursor-not-allowed"
          >
            <span className="text-xs font-semibold text-gray-500">Virtual DJ Playlist</span>
            <span className="text-[9px] text-gray-600">Coming Soon</span>
          </button>
        </div>

        {/* Pro Tip */}
        <div className="mt-8 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
          <div className="text-[10px] uppercase font-bold text-cyan-500 mb-1">Pro Tip</div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Files are downloaded with ID3 metadata including title, artist, album, and year for easy library management.
          </p>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={onExport}
        disabled={isExporting || queueLength === 0}
        className="bg-vibe-cyan text-black font-black py-4 rounded-xl shadow-lg hover:scale-[1.02] transition active:scale-95 uppercase tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        {isExporting ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            Finalize & Export ({queueLength})
          </>
        )}
      </button>
    </aside>
  );
}
