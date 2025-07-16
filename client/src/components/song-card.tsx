import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { downloadManager } from "@/lib/download-manager";
import { useToast } from "@/hooks/use-toast";
import type { Song } from "@shared/schema";

interface SongCardProps {
  song: Song;
  showAlbum?: boolean;
  showDownload?: boolean;
  onPlay?: (song: Song) => void;
}

export default function SongCard({ song, showAlbum = true, showDownload = true, onPlay }: SongCardProps) {
  const { playSong, currentSong, isPlaying } = useAudioPlayer();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const isCurrentSong = currentSong?.id === song.id;
  const isDownloaded = downloadManager.isDownloaded(song.id);

  const handlePlay = () => {
    if (onPlay) {
      onPlay(song);
    } else {
      playSong(song);
    }
  };

  const handleDownload = async () => {
    if (isDownloaded) {
      toast({
        title: "Already Downloaded",
        description: `${song.name} is already in your downloads.`,
      });
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    const unsubscribe = downloadManager.addProgressListener((progress) => {
      if (progress.songId === song.id) {
        setDownloadProgress(progress.progress);
        
        if (progress.status === 'completed') {
          setIsDownloading(false);
          toast({
            title: "Download Complete",
            description: `${song.name} has been downloaded successfully.`,
          });
        } else if (progress.status === 'error') {
          setIsDownloading(false);
          toast({
            title: "Download Failed",
            description: progress.error || "Failed to download the song.",
            variant: "destructive",
          });
        }
      }
    });

    try {
      await downloadManager.downloadSong(song);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      unsubscribe();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="music-card rounded-xl p-4 music-card-hover group">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={song.image}
            alt={`${song.name} album art`}
            className="w-12 h-12 rounded-lg object-cover"
          />
          {isCurrentSong && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className={`w-4 h-4 ${isPlaying ? 'pulse-play' : ''}`}>
                <svg className="w-full h-full text-primary" fill="currentColor" viewBox="0 0 24 24">
                  {isPlaying ? (
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  ) : (
                    <path d="M8 5v14l11-7z"/>
                  )}
                </svg>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{song.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
          {showAlbum && (
            <p className="text-xs text-muted-foreground/70 truncate">{song.album}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground hidden sm:block">
            {formatDuration(song.duration)}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlay}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              {isCurrentSong && isPlaying ? (
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              ) : (
                <path d="M8 5v14l11-7z"/>
              )}
            </svg>
          </Button>

          {showDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isDownloading ? (
                <div className="w-4 h-4 relative">
                  <svg className="w-full h-full text-muted-foreground" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <div 
                    className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"
                    style={{ transform: `rotate(${downloadProgress * 3.6}deg)` }}
                  />
                </div>
              ) : isDownloaded ? (
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
