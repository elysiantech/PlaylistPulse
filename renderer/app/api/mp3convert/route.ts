import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import NodeID3 from 'node-id3';
import { spawn } from 'child_process';
import { PassThrough } from 'stream';

// Function to extract audio and add metadata
async function extractAudioWithMetadata(
  url: string,
  song: { title: string; artist: string; album: string; releaseYear: string },
): Promise<string> {
  // Create temporary directory
  const tempDir = path.join(os.tmpdir(), 'youtube-audio');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  // Generate sanitized filenames
  const sanitize = (input: string) =>
    input.replace(/[^\w\s]/gi, '_').replace(/_+/g, '_').trim(); // Replace invalid characters and excessive underscores

  const sanitizedTitle = sanitize(song.title);
  const sanitizedArtist = sanitize(song.artist);
  const sanitizedAlbum = sanitize(song.album);

  const audioFileName = `${sanitizedArtist}-${sanitizedAlbum}-${sanitizedTitle}.mp3`;
  const audioPath = path.join(tempDir, audioFileName);
  const tempAudioPath = path.join(tempDir, `${sanitizedTitle}-temp.mp3`);

  return new Promise((resolve, reject) => {
    // Spawn the yt-dlp process
    const ytDlp = spawn('/opt/homebrew/bin/yt-dlp', [
      url,
      '--output', tempAudioPath,
      '--extract-audio',
      '--audio-format', 'mp3',
      '--format', 'bestaudio/best',
    ]);

    // Handle output and errors
    // ytDlp.stdout.on('data', (data) => console.log(`yt-dlp: ${data}`));
    ytDlp.stderr.on('data', (data) => console.error(`yt-dlp error: ${data}`));

    ytDlp.on('close', (code) => {
      if (code === 0) {
        // Add ID3 metadata
        const tags = {
          title: song.title,
          artist: song.artist,
          album: song.album,
          year: song.releaseYear,
        };

        NodeID3.write(tags, tempAudioPath, (err) => {
          if (err) {
            console.error('Error writing ID3 tags:', err);
            reject(err);
          } else {
            // Rename the file to the final name
            fs.renameSync(tempAudioPath, audioPath);
            resolve(audioPath);
          }
        });
      } else {
        reject(new Error(`yt-dlp process exited with code ${code}`));
      }
    });
  });
}


export async function POST(request: Request) {
  try {
    const song: { title: string; artist: string; album: string; releaseYear: string; youtubeUrl: string } =
      await request.json();

    if (!song || !song.youtubeUrl) {
      return NextResponse.json({ error: 'Invalid input, expected a song object with a YouTube URL' }, { status: 400 });
    }

    // Call the extractAudioWithMetadata function to generate the MP3 file
    const audioPath = await extractAudioWithMetadata(song.youtubeUrl, {
      title: song.title,
      artist: song.artist,
      album: song.album,
      releaseYear: song.releaseYear,
    });

    // Extract the filename from the audioPath
    const filename = path.basename(audioPath);

    // Read the file as a buffer
    // Read the file as a buffer
    const encodedFilename = encodeURIComponent(filename);
    const stream = fs.createReadStream(audioPath);

    return new Response(stream as any, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'An error occurred while processing the request' },
      { status: 500 },
    );
  }
}

/*export async function POST(request: Request) {
  try {
    // Parse the incoming song data
    const song = await request.json();
    if (!song || !song.youtubeUrl) {
      return NextResponse.json({ error: 'Invalid input, expected a song object with a YouTube URL' }, { status: 400 });
    }

    // Forward the request to the external web_convert endpoint
    const response = await fetch(`${process.env.MODAL_CONVERT_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(song),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to convert audio: ${errorText}`);
    }

    // Convert ReadableStream to a Blob
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || 'download.mp3';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'An error occurred while processing the request' },
      { status: 500 },
    );
  }
}
  */