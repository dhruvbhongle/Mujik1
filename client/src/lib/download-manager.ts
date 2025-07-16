import type { Song } from "@shared/schema";
import { apiRequest } from "./queryClient";

export interface DownloadProgress {
  songId: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  error?: string;
}

class DownloadManager {
  private downloads: Map<string, DownloadProgress> = new Map();
  private listeners: Set<(progress: DownloadProgress) => void> = new Set();

  addProgressListener(listener: (progress: DownloadProgress) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(progress: DownloadProgress) {
    this.listeners.forEach(listener => listener(progress));
  }

  async downloadSong(song: Song): Promise<void> {
    const downloadProgress: DownloadProgress = {
      songId: song.id,
      progress: 0,
      status: 'pending',
    };

    this.downloads.set(song.id, downloadProgress);
    this.notifyListeners(downloadProgress);

    try {
      // Update status to downloading
      downloadProgress.status = 'downloading';
      this.notifyListeners(downloadProgress);

      // Simulate download progress (in a real app, this would be actual file download)
      const downloadUrl = song.downloadUrl || song.url;
      if (!downloadUrl) {
        throw new Error('No download URL available');
      }

      // Simulate progressive download
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        downloadProgress.progress = i;
        this.notifyListeners(downloadProgress);
      }

      // Save to local storage
      const songData = {
        ...song,
        isDownloaded: true,
        downloadedAt: new Date().toISOString(),
        fileSize: Math.floor(Math.random() * 5000000) + 1000000, // Mock file size
      };

      const existingSongs = JSON.parse(localStorage.getItem('downloaded_songs') || '[]');
      const updatedSongs = [...existingSongs.filter((s: Song) => s.id !== song.id), songData];
      localStorage.setItem('downloaded_songs', JSON.stringify(updatedSongs));

      // Mark as completed
      downloadProgress.status = 'completed';
      downloadProgress.progress = 100;
      this.notifyListeners(downloadProgress);

      // Notify backend
      await apiRequest('PATCH', `/api/songs/${song.id}/download`, {
        fileSize: songData.fileSize
      });

    } catch (error) {
      downloadProgress.status = 'error';
      downloadProgress.error = error instanceof Error ? error.message : 'Download failed';
      this.notifyListeners(downloadProgress);
      throw error;
    } finally {
      // Remove from active downloads after 5 seconds
      setTimeout(() => {
        this.downloads.delete(song.id);
      }, 5000);
    }
  }

  getDownloadProgress(songId: string): DownloadProgress | undefined {
    return this.downloads.get(songId);
  }

  cancelDownload(songId: string): void {
    this.downloads.delete(songId);
  }

  getDownloadedSongs(): Song[] {
    try {
      return JSON.parse(localStorage.getItem('downloaded_songs') || '[]');
    } catch {
      return [];
    }
  }

  removeDownloadedSong(songId: string): void {
    const songs = this.getDownloadedSongs();
    const updatedSongs = songs.filter(song => song.id !== songId);
    localStorage.setItem('downloaded_songs', JSON.stringify(updatedSongs));
  }

  isDownloaded(songId: string): boolean {
    return this.getDownloadedSongs().some(song => song.id === songId);
  }

  getTotalDownloadSize(): number {
    return this.getDownloadedSongs().reduce((total, song) => total + (song.fileSize || 0), 0);
  }

  clearAllDownloads(): void {
    localStorage.removeItem('downloaded_songs');
  }
}

export const downloadManager = new DownloadManager();
