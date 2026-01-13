# PlaylistPulse → VibeSync UI Migration Plan

## Overview

Migrate the current PlaylistPulse UI to the new VibeSync design while preserving all existing functionality. The new UI features a three-panel glass morphism layout with improved DJ-focused UX.

---

## Current vs Target Architecture

### Current (PlaylistPulse)
- Single-column layout
- Playlist dropdown selector
- Track table with checkboxes
- Inline download button
- Status indicators per track

### Target (VibeSync)
- Three-panel glass morphism layout
- Left sidebar: Crate Manager (Spotify playlists)
- Center: Main queue table with album art
- Right sidebar: Export panel
- Footer: Playback controls (future)
- Navbar: Search + user profile

---

## Feature Mapping

| Current Feature | Target Location | Notes |
|----------------|-----------------|-------|
| Playlist dropdown | Left sidebar "Crate Manager" | Each playlist = one crate |
| Track table | Main content area | Add album art, remove checkboxes (queue-based) |
| Track selection | Click to add to queue | Tracks flow from crate → queue |
| Download button | "Finalize & Export Mix" | Download all queued tracks |
| Spotify login | Navbar user profile | Keep green button in sidebar |
| Download path selector | Part of export flow | Modal or right panel |
| Status indicators | Track row badges/icons | Keep status visualization |

---

## Features NOT Included (Deprecated/Out of Scope)

- **BPM/Key display**: Spotify deprecated audio-features API (Nov 2024)
- **Playback controls footer**: Placeholder only (no audio preview)
- **Global search**: Placeholder only for this phase

---

## Implementation Phases

### Phase 1: Layout & Styling Foundation
**Files to modify:** `renderer/pages/index.tsx`, `renderer/styles/globals.css`, `tailwind.config.js`

1. Add CSS custom properties for VibeSync theme
   - `--vibe-cyan: #00f2ff`
   - `--glass: rgba(255, 255, 255, 0.03)`
   - `--glass-border: rgba(255, 255, 255, 0.1)`
   - Dark background gradient

2. Create glass-panel utility class
   ```css
   .glass-panel {
     background: var(--glass);
     backdrop-filter: blur(12px);
     border: 1px solid var(--glass-border);
     border-radius: 12px;
   }
   ```

3. Update body/html to use dark gradient background

4. Restructure main layout to three-column flex

### Phase 2: Navigation Bar
**Files to create/modify:** `renderer/components/Navbar.tsx`, `renderer/pages/index.tsx`

1. Create Navbar component with:
   - VIBESYNC logo (italic, cyan accent)
   - Search input (placeholder, non-functional)
   - Notification bell icon (placeholder)
   - User profile chip (from Spotify user data)
   - Login/Logout functionality

### Phase 3: Left Sidebar - Crate Manager
**Files to create/modify:** `renderer/components/CrateManager.tsx`

1. Create CrateManager component:
   - Header with disc icon and "Crate Manager" title
   - List of Spotify playlists (fetched on auth)
   - Each playlist item: icon + name, hover effect
   - Click playlist → load tracks in center panel
   - "IMPORT PLAYLIST" button (triggers Spotify login if not auth'd)

2. State management:
   - `selectedCrate: string | null` (playlist ID)
   - Playlists loaded from existing `/api/spotify/playlists`

### Phase 4: Main Content - Queue Table
**Files to create/modify:** `renderer/components/QueueTable.tsx`
**Dependencies:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

1. Create QueueTable component:
   - Header: "Current Session" label + "Mainstage Queue" title
   - Action buttons: "Clear Queue", "Play Session" (placeholder)
   - Scrollable table with sticky header

2. Table columns:
   - `#` - Track number in queue (with drag handle)
   - `Track Detail` - Album art thumbnail + title + artist
   - `Vibe` - Status indicator (replaces BPM/Key)
   - `Source Links` - Spotify icon, YouTube icon, ellipsis menu

3. Track interactions:
   - **Drag-and-drop reordering** (using @dnd-kit)
   - Row hover effect
   - Ellipsis menu: "Remove from queue", "Download now"
   - Spotify/YouTube icons link to external URLs

4. Queue state:
   - `queuedTracks: Track[]` - tracks added to queue (persisted to localStorage)
   - Add track from crate → appears in queue
   - Tracks preserve status through download flow
   - **Multi-playlist support**: tracks can come from any playlist

### Phase 5: Right Sidebar - Export Panel
**Files to create/modify:** `renderer/components/ExportPanel.tsx`

1. Create ExportPanel component:
   - Header: "Export Session" with file-export icon
   - Description text
   - Export format buttons (styled, not fully functional yet):
     - "Rekordbox XML" → future
     - "Serato Tracklist (.txt)" → future
     - "Virtual DJ Playlist" → future
   - Pro Tip card with cyan accent

2. "Finalize & Export Mix" button:
   - Triggers download flow for all queued tracks
   - Uses existing mp3convert API
   - Shows progress per track

### Phase 6: Footer - Playback Controls
**Files to create/modify:** `renderer/components/Footer.tsx`

1. Create Footer component (placeholder/skeleton):
   - Left: Album art placeholder + track info skeleton
   - Center: Playback controls (non-functional icons)
   - Right: Volume slider (visual only)

2. Mark as placeholder for future audio preview feature

### Phase 7: State Management Refactor
**Files to modify:** `renderer/pages/index.tsx` or create `renderer/hooks/useVibeSync.ts`

1. Consolidate state:
   ```typescript
   interface VibeSyncState {
     // Auth
     isAuthenticated: boolean;
     user: SpotifyUser | null;

     // Playlists (Crates)
     playlists: Playlist[];
     selectedPlaylistId: string | null;
     playlistTracks: Track[];

     // Queue (persisted to localStorage)
     queuedTracks: Track[];

     // Export
     downloadPath: string;
     isExporting: boolean;
   }
   ```

2. Actions:
   - `selectPlaylist(id)` - Load tracks for crate
   - `addToQueue(track)` - Add track to queue (from any playlist)
   - `removeFromQueue(trackId)` - Remove from queue
   - `reorderQueue(fromIndex, toIndex)` - Drag-and-drop reorder
   - `clearQueue()` - Clear all queued tracks
   - `exportQueue()` - Download all queued tracks

3. Persistence:
   - Save `queuedTracks` to localStorage on every change
   - Restore queue from localStorage on app launch
   - Clear downloaded status on restore (re-download if needed)

### Phase 8: Integration & Polish
1. Wire up all components in `index.tsx`
2. Add transitions and hover effects
3. Toast notifications for actions
4. Error handling and loading states
5. Responsive adjustments (if needed)

---

## New Component Structure

```
renderer/
├── components/
│   ├── ui/              (existing - keep)
│   ├── Navbar.tsx       (new)
│   ├── CrateManager.tsx (new)
│   ├── QueueTable.tsx   (new)
│   ├── ExportPanel.tsx  (new)
│   ├── Footer.tsx       (new)
│   └── theme-provider.tsx (existing - keep)
├── hooks/
│   └── useVibeSync.ts   (new - optional)
├── pages/
│   └── index.tsx        (refactor to compose new components)
└── styles/
    └── globals.css      (update with VibeSync theme)
```

---

## New Dependencies

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- `@dnd-kit/core` - Drag-and-drop foundation
- `@dnd-kit/sortable` - Sortable list preset
- `@dnd-kit/utilities` - CSS transform utilities

---

## API Routes (No Changes Required)

All existing API routes remain unchanged:
- `/api/spotify/auth/*` - Authentication
- `/api/spotify/me` - User profile
- `/api/spotify/playlists` - List playlists
- `/api/spotify/playlists/[id]` - Playlist tracks
- `/api/youtube` - YouTube search
- `/api/mp3convert` - Download & convert

---

## Test Coverage Plan

### Unit Tests (Vitest + React Testing Library)

1. **Component Tests**
   - `Navbar.test.tsx` - Renders correctly, login/logout state
   - `CrateManager.test.tsx` - Playlist list rendering, selection
   - `QueueTable.test.tsx` - Track rendering, status indicators
   - `ExportPanel.test.tsx` - Button rendering, click handlers

2. **Hook Tests**
   - `useVibeSync.test.ts` - State transitions, actions

### Integration Tests

1. **Playlist Flow**
   - Load playlists on auth
   - Select playlist → tracks load
   - Add track to queue

2. **Export Flow**
   - Queue tracks
   - Click export → download sequence
   - Status updates per track

### E2E Tests (Playwright)

1. **Authentication Flow**
   - Click login → redirect → callback → authenticated state

2. **Full Workflow**
   - Login → Select playlist → Add tracks → Export

---

## Migration Checklist

- [ ] Phase 1: Layout & Styling Foundation
- [ ] Phase 2: Navigation Bar
- [ ] Phase 3: Left Sidebar - Crate Manager
- [ ] Phase 4: Main Content - Queue Table
- [ ] Phase 5: Right Sidebar - Export Panel
- [ ] Phase 6: Footer - Playback Controls
- [ ] Phase 7: State Management Refactor
- [ ] Phase 8: Integration & Polish
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] E2E Tests

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Breaking existing download flow | Keep API routes unchanged, test thoroughly |
| State complexity increase | Consider useReducer or Zustand for queue state |
| Glass morphism performance | Test backdrop-filter on target platforms |
| Spotify API rate limits | Existing caching should be sufficient |

---

## Estimated Effort

| Phase | Complexity |
|-------|------------|
| Phase 1 | Low |
| Phase 2 | Low |
| Phase 3 | Medium |
| Phase 4 | Medium |
| Phase 5 | Low |
| Phase 6 | Low |
| Phase 7 | Medium |
| Phase 8 | Low |
| Tests | Medium |

---

## Design Decisions (Confirmed)

1. **Queue persistence**: Yes - save to localStorage, restore on app launch
2. **Multi-playlist queue**: Yes - users can mix tracks from any playlist
3. **Track ordering**: Yes - drag-and-drop reordering in queue
4. **Export formats**: MP3 download only for now (Rekordbox/Serato/VirtualDJ future)
