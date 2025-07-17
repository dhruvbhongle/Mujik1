import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import type { Song } from "@shared/schema";
import { getRelatedSongs } from "@/lib/saavn-api";

interface AudioPlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  progress: number;
  queue: Song[];
  currentIndex: number;
  showMiniPlayer: boolean;
  showFloatingPlayer: boolean;
  autoPlayEnabled: boolean;
  isLoadingRelated: boolean;

  // Actions
  playSong: (song: Song) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setQueue: (songs: Song[]) => void;
  showFloatingPlayerModal: () => void;
  hideFloatingPlayerModal: () => void;
  playRelatedSong: () => Promise<void>;
  toggleAutoPlay: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
}

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [showFloatingPlayer, setShowFloatingPlayer] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', async () => {
      if (queue.length > 0 && currentIndex < queue.length - 1) {
        // If there are more songs in the queue, play the next one
        playNext();
      } else if (autoPlayEnabled && currentSong) {
        // If auto-play is enabled and no more songs in queue, find related songs
        await playRelatedSong();
      }
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const playSong = useCallback((song: Song) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    setCurrentSong(song);
    setShowMiniPlayer(true);

    // Use the streaming URL or fallback to download URL
    audio.src = song.url || song.downloadUrl || '';
    audio.load();

    audio.play().then(() => {
      setIsPlaying(true);
    }).catch((error) => {
      console.error('Play error:', error);
      setIsPlaying(false);
    });
  }, []);

  const pauseSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resumeSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Resume error:', error);
      });
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  }, [isPlaying, pauseSong, resumeSong]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolumeState(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const nextIndex = (currentIndex + 1) % queue.length;
      setCurrentIndex(nextIndex);
      playSong(queue[nextIndex]);
    }
  }, [queue, currentIndex, playSong]);

  const playPrevious = useCallback(() => {
    if (queue.length > 0) {
      const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      playSong(queue[prevIndex]);
    }
  }, [queue, currentIndex, playSong]);

  const showFloatingPlayerModal = useCallback(() => {
    setShowFloatingPlayer(true);
  }, []);

  const hideFloatingPlayerModal = useCallback(() => {
    setShowFloatingPlayer(false);
  }, []);

  const playRelatedSong = useCallback(async () => {
    if (!currentSong || isLoadingRelated) return;

    setIsLoadingRelated(true);
    try {
      // Search for related songs using artist name first, then song name as fallback
      let searchQuery = currentSong.artist;
      let relatedSongs = await getRelatedSongs(searchQuery);

      // If no results with artist, try with song name
      if (relatedSongs.length === 0) {
        searchQuery = currentSong.name;
        relatedSongs = await getRelatedSongs(searchQuery);
      }

      if (relatedSongs.length > 0) {
        // Filter out the current song and pick a random related song
        const filteredSongs = relatedSongs.filter(song => song.id !== currentSong.id);
        if (filteredSongs.length > 0) {
          const randomIndex = Math.floor(Math.random() * filteredSongs.length);
          const nextSong = filteredSongs[randomIndex];

          // Convert SaavnSong to Song format
          const songToPlay: Song = {
            id: nextSong.id,
            name: nextSong.name,
            artist: nextSong.primaryArtists || nextSong.artist || "Unknown Artist",
            album: nextSong.album?.name || "Unknown Album",
            duration: nextSong.duration || 0,
            image: nextSong.image?.[2]?.link || nextSong.image || "",
            url: nextSong.downloadUrl?.[4]?.link || nextSong.downloadUrl || "",
            downloadUrl: nextSong.downloadUrl?.[4]?.link || nextSong.downloadUrl || "",
            year: nextSong.year || null,
            isDownloaded: false,
            downloadedAt: null,
            fileSize: null,
          };

          playSong(songToPlay);
        }
      }
    } catch (error) {
      console.error('Failed to fetch related songs:', error);
    } finally {
      setIsLoadingRelated(false);
    }
  }, [currentSong, isLoadingRelated, playSong]);

  const toggleAutoPlay = useCallback(() => {
    setAutoPlayEnabled(prev => !prev);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const value: AudioPlayerContextType = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    progress,
    queue,
    currentIndex,
    showMiniPlayer,
    showFloatingPlayer,
    autoPlayEnabled,
    isLoadingRelated,

    playSong,
    pauseSong,
    resumeSong,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    playNext,
    playPrevious,
    setQueue,
    showFloatingPlayerModal,
    hideFloatingPlayerModal,
    playRelatedSong,
    toggleAutoPlay,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}