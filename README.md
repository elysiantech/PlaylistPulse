# VibeSync 🎧

**DJ Music Manager for Spotify**

This project started as a simple exercise with my daughter, who has recently started DJ'ing. She wanted a way to quickly access music files based on Spotify playlists that she could practice DJ'ing with. Together, we decided to build an application that:

1. Interfaces with Spotify.
2. Captures and displays your playlists.
3. Lets you select which songs you'd like to work with.
4. Downloads the equivalent video from YouTube.
5. Extracts just the audio as an MP3 file.
6. Tags the MP3 file with proper metadata.

While I don't condone violating any restrictions or rules set by the music industry, this project was a wonderful opportunity to bond and explore app development together. It was created during a holiday hackathon, and while it doesn't do everything it could, it provides an easy way to practice DJing with Spotify playlists.

---

## Features

- **Spotify Integration**: Login to access your Spotify playlists.
- **YouTube Integration**: Finds YouTube videos for playlist tracks.
- **MP3 Conversion**: Extracts audio from YouTube videos and saves as MP3 files.
- **ID3 Tagging**: Automatically tags MP3 files with song metadata.
- **Modern UI**: Glass morphism design with drag-and-drop queue management.
- **Electron Desktop Application**: Cross-platform desktop app built with Electron and Next.js.

---

## Installation

### Prerequisites

1. [Node.js](https://nodejs.org/) (v18 or later recommended)
2. [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
3. [Electron](https://www.electronjs.org/)
4. A [Spotify Developer Account](https://developer.spotify.com/dashboard/) to obtain a **client ID** and **client secret**.

---

### Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/elysiantech/PlaylistPulse.git
   cd PlaylistPulse
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `renderer` directory with the following:
   ```
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/spotify
   ```

   > **Important**: As of April 2025, Spotify requires `127.0.0.1` instead of `localhost` for redirect URIs.

4. **Run the Application**:
   ```bash
   npm run dev
   ```
   Access the app at `http://127.0.0.1:3000`

   For the Electron desktop app:
   ```bash
   npm run dev:desktop
   ```

---

## Usage

1. **Login with Spotify**:
   - Click the login button to authenticate with your Spotify account.
   - Your playlists will appear in the Crate Manager (left panel).

2. **Browse Tracks**:
   - Click a playlist to view its tracks in the Track Browser (center panel).
   - Each track shows album art, title, artist, year, and links to Spotify/YouTube.

3. **Build Your Queue**:
   - Click the + button to add tracks to your Export Queue (right panel).
   - Drag and drop to reorder tracks in your queue.

4. **Export**:
   - Select your export folder.
   - Click Export to download tracks as MP3 files with full metadata.

---

## Technologies Used

- **Electron**: Cross-platform desktop app framework.
- **Next.js**: React framework for the renderer process.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **@dnd-kit**: Drag and drop toolkit for queue management.
- **Spotify API**: Fetch playlists and track information.
- **YouTube Search**: Find equivalent videos via youtube-sr.
- **yt-dlp + FFmpeg**: Extract audio from YouTube videos.
- **node-id3**: Tag MP3 files with song metadata.

---

## Disclaimer

This app was created for personal, educational purposes and should not be used to violate copyright or licensing restrictions. Ensure that any music downloaded complies with Spotify and YouTube's terms of service.

---

## Contributions

This app is open to contributions! Feel free to fork the repository, make improvements, and submit pull requests.

---

## License

This project is licensed under the MIT License.
