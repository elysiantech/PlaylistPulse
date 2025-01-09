# Playlist Pulse 🎶

**Playlist DJ for Spotify**

This project started as a simple exercise with my daughter, who has recently started DJ'ing. She wanted a way to quickly access music files based on Spotify playlists that she could practice DJ'ing with. Together, we decided to build an application that:

1. Interfaces with Spotify.
2. Captures and displays your playlists.
3. Lets you select which songs you'd like to work with.
4. Downloads the equivalent video from YouTube.
5. Extracts just the audio as an MP3 file.
6. Tags the MP3 file with proper metadata.

While I don't condone violating any restrictions or rules set by the music industry, this project was a wonderful opportunity to bond and explore app development together. It was created during a holiday hackathon, and while it doesn’t do everything it could, it provides an easy way to practice DJing with Spotify playlists.

---

## Features

- **Spotify Integration**: Login to access your Spotify playlists.
- **YouTube Integration**: Finds YouTube videos for playlist tracks.
- **MP3 Conversion**: Extracts audio from YouTube videos and saves as MP3 files.
- **ID3 Tagging**: Automatically tags MP3 files with song metadata.
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
   git clone https://github.com/elysiantech/playlist-pulse.git
   cd playlist-pulse

	2.	Install Dependencies:

npm install


	3.	Configure Environment Variables:
Create a .env.local file in the renderer directory with the following:

NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/spotify
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
YOUTUBE_API_KEY=your_youtube_api_key


	4.	Run the Application:

npm run dev:desktop

Usage
	1.	Login with Spotify:
	•	Click the login button to authenticate with your Spotify account.
	•	Select a playlist to view its tracks.
	2.	Select Songs:
	•	Check the songs you want to download as MP3 files.
	3.	Download and Convert:
	•	The app will fetch the corresponding YouTube video, extract the audio, and tag it with the appropriate metadata.
	4.	Access MP3 Files:
	•	Your MP3 files will be saved locally, ready for DJ practice.

Technologies Used
	•	Electron: Cross-platform desktop app framework.
	•	Next.js: React framework for the renderer process.
	•	Tailwind CSS: Utility-first CSS framework for styling.
	•	Spotify API: Fetch playlists and track information.
	•	YouTube API: Search for equivalent videos.
	•	FFmpeg: Extract audio from YouTube videos.
	•	ID3 Tagging: Tag MP3 files with song metadata.

Disclaimer

This app was created for personal, educational purposes and should not be used to violate copyright or licensing restrictions. Ensure that any music downloaded complies with Spotify and YouTube’s terms of service.

Contributions

This app is open to contributions! Feel free to fork the repository, make improvements, and submit pull requests.

License

This project is licensed under the MIT License.
