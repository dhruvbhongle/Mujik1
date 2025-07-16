import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}

export function useDownloadedSongs() {
  const [downloadedSongs, setDownloadedSongs] = useLocalStorage<string[]>("downloaded_songs", []);
  const [downloadProgress, setDownloadProgress] = useLocalStorage<Record<string, number>>("download_progress", {});

  const addDownloadedSong = (songId: string) => {
    setDownloadedSongs(prev => [...prev, songId]);
  };

  const removeDownloadedSong = (songId: string) => {
    setDownloadedSongs(prev => prev.filter(id => id !== songId));
    setDownloadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[songId];
      return newProgress;
    });
  };

  const updateDownloadProgress = (songId: string, progress: number) => {
    setDownloadProgress(prev => ({ ...prev, [songId]: progress }));
  };

  const isDownloaded = (songId: string) => downloadedSongs.includes(songId);

  return {
    downloadedSongs,
    downloadProgress,
    addDownloadedSong,
    removeDownloadedSong,
    updateDownloadProgress,
    isDownloaded,
  };
}
