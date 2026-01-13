# PlaylistPulse - Project Instructions

## Important: Spotify API Change (April 2025)

Spotify increased security requirements on **April 9, 2025**. They no longer allow `http://localhost` for redirect URIs.

**Required:** Use `http://127.0.0.1:3000/spotify` instead of `http://localhost:3000/spotify`

This applies to:
- `.env` file: `SPOTIFY_REDIRECT_URI`
- Spotify Developer Dashboard: Redirect URIs setting
- Electron app URL loading
- Browser access during development

## Development

- Access the app at `http://127.0.0.1:3000` (NOT localhost)
- Run with `npm run dev` for web-only or `npm run dev:desktop` for Electron

## Tech Stack

- Electron + Next.js
- Spotify OAuth for playlist access
- YouTube search via youtube-sr
- yt-dlp + ffmpeg for MP3 conversion
- node-id3 for MP3 metadata tagging

## API Routes

All backend routes are in `renderer/app/api/`:
- `/api/spotify/auth/*` - OAuth flow
- `/api/spotify/me` - User profile
- `/api/spotify/playlists` - List playlists
- `/api/spotify/playlists/[id]` - Playlist tracks
- `/api/youtube` - YouTube video search
- `/api/mp3convert` - Download and convert to MP3
