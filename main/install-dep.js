"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
// Helper to run shell commands
const runCommand = (command) => {
    try {
        return (0, child_process_1.execSync)(command, { stdio: 'pipe' }).toString().trim();
    }
    catch (error) {
        return null; // Return null if the command fails
    }
};
// Check for Homebrew
const checkBrew = () => {
    const brewPath = runCommand('which brew');
    if (!brewPath) {
        console.log('Homebrew not found. Installing Homebrew...');
        runCommand('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
        console.log('Homebrew installed successfully.');
    }
    else {
        console.log(`Homebrew is installed: ${brewPath}`);
    }
};
// Check for yt-dlp and ffmpeg
const checkDependencies = () => {
    const ytDlpPath = runCommand('which yt-dlp');
    const ffmpegPath = runCommand('which ffmpeg');
    if (!ytDlpPath) {
        console.log('yt-dlp not found. Installing...');
        runCommand('brew install yt-dlp');
        console.log('yt-dlp installed successfully.');
    }
    else {
        console.log(`yt-dlp is installed: ${ytDlpPath}`);
    }
    if (!ffmpegPath) {
        console.log('ffmpeg not found. Installing...');
        runCommand('brew install ffmpeg');
        console.log('ffmpeg installed successfully.');
    }
    else {
        console.log(`ffmpeg is installed: ${ffmpegPath}`);
    }
};
// Run checks
const installDependencies = () => {
    console.log('Checking and installing dependencies...');
    checkBrew();
    checkDependencies();
    console.log('All dependencies are installed.');
};
installDependencies();
