import { songs, playlists, type Song, type InsertSong, type Playlist, type InsertPlaylist } from "@shared/schema";

export interface IStorage {
  getSong(id: string): Promise<Song | undefined>;
  getSongs(): Promise<Song[]>;
  createSong(song: InsertSong): Promise<Song>;
  updateSong(id: string, song: Partial<InsertSong>): Promise<Song | undefined>;
  deleteSong(id: string): Promise<boolean>;
  getDownloadedSongs(): Promise<Song[]>;
  markSongAsDownloaded(id: string, fileSize: number): Promise<void>;
  
  getPlaylist(id: number): Promise<Playlist | undefined>;
  getPlaylists(): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: number, playlist: Partial<InsertPlaylist>): Promise<Playlist | undefined>;
  deletePlaylist(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private songs: Map<string, Song>;
  private playlists: Map<number, Playlist>;
  private playlistCurrentId: number;

  constructor() {
    this.songs = new Map();
    this.playlists = new Map();
    this.playlistCurrentId = 1;
  }

  async getSong(id: string): Promise<Song | undefined> {
    return this.songs.get(id);
  }

  async getSongs(): Promise<Song[]> {
    return Array.from(this.songs.values());
  }

  async createSong(insertSong: InsertSong): Promise<Song> {
    const song: Song = {
      ...insertSong,
      isDownloaded: insertSong.isDownloaded || false,
      downloadedAt: insertSong.downloadedAt || null,
      fileSize: insertSong.fileSize || null,
    };
    this.songs.set(song.id, song);
    return song;
  }

  async updateSong(id: string, songUpdate: Partial<InsertSong>): Promise<Song | undefined> {
    const existing = this.songs.get(id);
    if (!existing) return undefined;

    const updated: Song = { ...existing, ...songUpdate };
    this.songs.set(id, updated);
    return updated;
  }

  async deleteSong(id: string): Promise<boolean> {
    return this.songs.delete(id);
  }

  async getDownloadedSongs(): Promise<Song[]> {
    return Array.from(this.songs.values()).filter(song => song.isDownloaded);
  }

  async markSongAsDownloaded(id: string, fileSize: number): Promise<void> {
    const song = this.songs.get(id);
    if (song) {
      song.isDownloaded = true;
      song.downloadedAt = new Date();
      song.fileSize = fileSize;
      this.songs.set(id, song);
    }
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async getPlaylists(): Promise<Playlist[]> {
    return Array.from(this.playlists.values());
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = this.playlistCurrentId++;
    const playlist: Playlist = {
      id,
      ...insertPlaylist,
      createdAt: new Date(),
    };
    this.playlists.set(id, playlist);
    return playlist;
  }

  async updatePlaylist(id: number, playlistUpdate: Partial<InsertPlaylist>): Promise<Playlist | undefined> {
    const existing = this.playlists.get(id);
    if (!existing) return undefined;

    const updated: Playlist = { ...existing, ...playlistUpdate };
    this.playlists.set(id, updated);
    return updated;
  }

  async deletePlaylist(id: number): Promise<boolean> {
    return this.playlists.delete(id);
  }
}

export const storage = new MemStorage();
