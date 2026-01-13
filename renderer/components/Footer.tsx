'use client'

export function Footer() {
  return (
    <footer className="h-20 flex items-center justify-between px-6 mt-2">
      {/* Now Playing (placeholder) */}
      <div className="w-1/3 flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-800 rounded animate-pulse"></div>
        <div>
          <div className="w-32 h-3 bg-gray-800 rounded mb-2"></div>
          <div className="w-20 h-2 bg-gray-900 rounded"></div>
        </div>
      </div>

      {/* Playback Controls (placeholder) */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-8 text-gray-400">
          <i className="fa-solid fa-shuffle hover:text-vibe-cyan cursor-pointer text-xs opacity-50"></i>
          <i className="fa-solid fa-backward-step text-lg hover:text-white cursor-pointer opacity-50"></i>
          <i className="fa-solid fa-circle-play text-4xl text-white hover:scale-110 cursor-pointer opacity-50"></i>
          <i className="fa-solid fa-forward-step text-lg hover:text-white cursor-pointer opacity-50"></i>
          <i className="fa-solid fa-repeat hover:text-vibe-cyan cursor-pointer text-xs opacity-50"></i>
        </div>
      </div>

      {/* Volume (placeholder) */}
      <div className="w-1/3 flex justify-end items-center gap-4 text-gray-500">
        <i className="fa-solid fa-volume-high text-xs opacity-50"></i>
        <div className="w-24 h-1 bg-white/10 rounded-full">
          <div className="bg-gray-500 h-full w-2/3 rounded-full"></div>
        </div>
      </div>
    </footer>
  );
}
