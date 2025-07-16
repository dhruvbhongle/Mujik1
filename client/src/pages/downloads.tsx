import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { downloadManager } from "@/lib/download-manager";
import { useToast } from "@/hooks/use-toast";
import SongCard from "@/components/song-card";
import type { Song } from "@shared/schema";

export default function Downloads() {
  const [downloadedSongs, setDownloadedSongs] = useState<Song[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadDownloadedSongs();
  }, []);

  const loadDownloadedSongs = () => {
    const songs = downloadManager.getDownloadedSongs();
    setDownloadedSongs(songs);
    setTotalSize(downloadManager.getTotalDownloadSize());
  };

  const handleRemoveDownload = (songId: string) => {
    downloadManager.removeDownloadedSong(songId);
    loadDownloadedSongs();
    toast({
      title: "Download Removed",
      description: "Song has been removed from downloads.",
    });
  };

  const handleClearCache = () => {
    // Clear cache (in a real app, this would clear temporary files)
    toast({
      title: "Cache Cleared",
      description: "45 MB of cache has been cleared.",
    });
  };

  const handleClearAllDownloads = () => {
    downloadManager.clearAllDownloads();
    loadDownloadedSongs();
    toast({
      title: "All Downloads Cleared",
      description: "All downloaded songs have been removed.",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercentage = (totalSize / (1024 * 1024 * 1024)) * 100; // Assuming 1GB limit

  return (
    <div className="py-4 space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Downloaded Songs</h2>
      
      {/* Download Stats */}
      <Card className="music-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-medium text-foreground">Storage Used</h3>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(totalSize)} of 1 GB
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                {downloadedSongs.length} songs
              </p>
              <p className="text-sm text-muted-foreground">Downloaded</p>
            </div>
          </div>
          <div className="w-full bg-card rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Downloaded Songs List */}
      <div className="space-y-3">
        {downloadedSongs.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            <p className="text-muted-foreground text-lg mb-2">No downloaded songs</p>
            <p className="text-muted-foreground text-sm">Download songs to listen offline</p>
          </div>
        ) : (
          downloadedSongs.map((song) => (
            <div key={song.id} className="music-card rounded-xl p-4 flex items-center space-x-4">
              <img
                src={song.image}
                alt={`${song.name} album art`}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{song.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-primary bg-primary/20 px-2 py-1 rounded-full">
                    Downloaded
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(song.fileSize || 0)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDownload(song.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Storage Management */}
      <Card className="music-card">
        <CardContent className="p-4">
          <h3 className="font-medium text-foreground mb-3">Storage Management</h3>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-foreground hover:bg-card/70"
              onClick={handleClearCache}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.36 2.72L20.78 4.14l-1.42 1.42L18.36 4.14l-1.42-1.42L19.36 2.72zM12 6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6m0-2C7.03 4 3 8.03 3 13s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"/>
              </svg>
              Clear Cache (45 MB)
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-foreground hover:bg-card/70"
              onClick={handleClearAllDownloads}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
              Remove All Downloads
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-foreground hover:bg-card/70"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
              Download Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
