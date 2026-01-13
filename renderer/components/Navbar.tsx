'use client'

import { LogIn, LogOut } from "lucide-react";

interface NavbarProps {
  isAuthenticated: boolean;
  user: any | null;
}

export function Navbar({ isAuthenticated, user }: NavbarProps) {
  return (
    <nav className="flex justify-between items-center px-4 py-3 mb-2">
      <div className="text-2xl font-black tracking-tighter italic accent-cyan">VIBESYNC</div>
      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <a href="/api/spotify/auth/logout">
            <div className="flex items-center gap-2 bg-[#1A1A1A] p-1 pr-3 rounded-full cursor-pointer hover:bg-[#252525] transition">
              <div className="w-7 h-7 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                {user.images?.[0]?.url ? (
                  <img src={user.images[0].url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-xs font-bold">{user.display_name?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">
                {user.display_name || 'User'}
              </span>
              <LogOut className="h-3 w-3 text-gray-500" />
            </div>
          </a>
        ) : (
          <a href="/api/spotify/auth/login">
            <div className="flex items-center gap-2 bg-vibe-cyan hover:bg-cyan-300 p-2 px-4 rounded-full cursor-pointer transition">
              <LogIn className="h-4 w-4 text-black" />
              <span className="text-xs font-bold text-black">LOGIN</span>
            </div>
          </a>
        )}
      </div>
    </nav>
  );
}
