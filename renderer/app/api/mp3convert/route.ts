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
  downloadDir?: string,
): Promise<string> {
  // Use specified download directory or default to user's Downloads/PlaylistPulse folder
  const targetDir = downloadDir || path.join(os.homedir(), 'Downloads', 'PlaylistPulse');
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Generate sanitized filenames
  const sanitize = (input: string) =>
    input.replace(/[^\w\s]/gi, '_').replace(/_+/g, '_').trim(); // Replace invalid characters and excessive underscores

  const sanitizedTitle = sanitize(song.title);
  const sanitizedArtist = sanitize(song.artist);
  const sanitizedAlbum = sanitize(song.album);

  const audioFileName = `${sanitizedArtist}-${sanitizedAlbum}-${sanitizedTitle}.mp3`;
  const audioPath = path.join(targetDir, audioFileName);
  const tempAudioPath = path.join(targetDir, `${sanitizedTitle}-temp.mp3`);

  return new Promise((resolve, reject) => {
    // Set timeout for the entire process
    const timeout = setTimeout(() => {
      ytDlp.kill('SIGTERM');
      reject(new Error('Download timeout after 2 minutes'));
    }, 120000); // 2 minutes timeout

    // Determine yt-dlp path - try multiple locations
    const ytDlpPaths = [
      '/opt/homebrew/bin/yt-dlp',
      '/usr/local/bin/yt-dlp', 
      '/usr/bin/yt-dlp',
      'yt-dlp'
    ];
    
    let ytDlpPath = ytDlpPaths[0]; // Default to homebrew path
    
    // Try to find working yt-dlp path
    for (const testPath of ytDlpPaths) {
      try {
        if (fs.existsSync(testPath) || testPath === 'yt-dlp') {
          ytDlpPath = testPath;
          break;
        }
      } catch (err) {
        continue;
      }
    }

    console.log(`Using yt-dlp path: ${ytDlpPath}`);

    // Spawn the yt-dlp process with additional options to handle signature issues
    const ytDlp = spawn(ytDlpPath, [
      url,
      '--output', tempAudioPath,
      '--extract-audio',
      '--audio-format', 'mp3',
      '--format', 'bestaudio/best',
      '--no-warnings',
      '--ignore-errors',
      '--retry-sleep', '5',
      '--retries', '3'
    ]);

    let stderrOutput = '';

    // Handle output and errors
    ytDlp.stdout.on('data', (data) => {
      console.log(`yt-dlp: ${data}`);
    });
    
    ytDlp.stderr.on('data', (data) => {
      const message = data.toString();
      stderrOutput += message;
      console.error(`yt-dlp error: ${message}`);
    });

    ytDlp.on('error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start yt-dlp: ${error.message}`));
    });

    ytDlp.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code === 0) {
        // Check if file was actually created
        if (!fs.existsSync(tempAudioPath)) {
          reject(new Error('Download failed: Audio file was not created'));
          return;
        }

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
            try {
              fs.renameSync(tempAudioPath, audioPath);
              resolve(audioPath);
            } catch (renameError) {
              reject(new Error(`Failed to rename file: ${renameError}`));
            }
          }
        });
      } else {
        reject(new Error(`yt-dlp process exited with code ${code}. Error: ${stderrOutput}`));
      }
    });
  });
}


export async function POST(request: Request) {
  try {
    console.log('=== STARTING DOWNLOAD REQUEST ===');
    const data: { 
      title: string; 
      artist: string; 
      album: string; 
      releaseYear: string; 
      youtubeUrl: string;
      downloadDir?: string;
    } = await request.json();

    console.log('Request data:', {
      title: data.title,
      artist: data.artist,
      youtubeUrl: data.youtubeUrl,
      downloadDir: data.downloadDir
    });

    if (!data || !data.youtubeUrl) {
      console.log('ERROR: Invalid input data');
      return NextResponse.json({ error: 'Invalid input, expected a song object with a YouTube URL' }, { status: 400 });
    }

    console.log('Calling extractAudioWithMetadata...');
    // Call the extractAudioWithMetadata function to download directly to final location
    const audioPath = await extractAudioWithMetadata(data.youtubeUrl, {
      title: data.title,
      artist: data.artist,
      album: data.album,
      releaseYear: data.releaseYear,
    }, data.downloadDir);

    console.log('Download completed successfully:', audioPath);
    
    // Return success response with file path instead of streaming
    const filename = path.basename(audioPath);
    
    return NextResponse.json({ 
      success: true, 
      filename,
      filePath: audioPath,
      message: `Downloaded successfully to ${audioPath}`
    });
  } catch (error) {
    console.error('=== DOWNLOAD ERROR ===');
    console.error('Error processing request:', error);
    console.error('Error stack:', (error as Error).stack);
    return NextResponse.json(
      { error: (error as Error).message || 'An error occurred while processing the request' },
      { status: 500 },
    );
  }
}