import { songs, playlists, type Song, type InsertSong, type Playlist, type InsertPlaylist } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";

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
      downloadUrl: insertSong.downloadUrl || null,
      language: insertSong.language || null,
      year: insertSong.year || null,
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
      image: insertPlaylist.image || null,
      description: insertPlaylist.description || null,
      songIds: insertPlaylist.songIds || null,
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

// Database storage implementation
export class DatabaseStorage implements IStorage {
  private db: any;
  private fallback: MemStorage;

  constructor() {
    this.fallback = new MemStorage();
    try {
      if (process.env.DATABASE_URL) {
        const sql = neon(process.env.DATABASE_URL);
        this.db = drizzle(sql);
      }
    } catch (error) {
      console.warn('Database connection failed, using in-memory storage:', error);
      this.db = null;
    }
  }

  async getSong(id: string): Promise<Song | undefined> {
    if (!this.db) return this.fallback.getSong(id);
    
    try {
      const result = await this.db.select().from(songs).where(eq(songs.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.getSong(id);
    }
  }

  async getSongs(): Promise<Song[]> {
    if (!this.db) return this.fallback.getSongs();
    
    try {
      return await this.db.select().from(songs);
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.getSongs();
    }
  }

  async createSong(insertSong: InsertSong): Promise<Song> {
    if (!this.db) return this.fallback.createSong(insertSong);
    
    try {
      const result = await this.db.insert(songs).values(insertSong).returning();
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.createSong(insertSong);
    }
  }

  async updateSong(id: string, songUpdate: Partial<InsertSong>): Promise<Song | undefined> {
    if (!this.db) return this.fallback.updateSong(id, songUpdate);
    
    try {
      const result = await this.db.update(songs).set(songUpdate).where(eq(songs.id, id)).returning();
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.updateSong(id, songUpdate);
    }
  }

  async deleteSong(id: string): Promise<boolean> {
    if (!this.db) return this.fallback.deleteSong(id);
    
    try {
      const result = await this.db.delete(songs).where(eq(songs.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.deleteSong(id);
    }
  }

  async getDownloadedSongs(): Promise<Song[]> {
    if (!this.db) return this.fallback.getDownloadedSongs();
    
    try {
      return await this.db.select().from(songs).where(eq(songs.isDownloaded, true));
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.getDownloadedSongs();
    }
  }

  async markSongAsDownloaded(id: string, fileSize: number): Promise<void> {
    if (!this.db) return this.fallback.markSongAsDownloaded(id, fileSize);
    
    try {
      await this.db.update(songs).set({
        isDownloaded: true,
        downloadedAt: new Date(),
        fileSize: fileSize
      }).where(eq(songs.id, id));
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.markSongAsDownloaded(id, fileSize);
    }
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    if (!this.db) return this.fallback.getPlaylist(id);
    
    try {
      const result = await this.db.select().from(playlists).where(eq(playlists.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.getPlaylist(id);
    }
  }

  async getPlaylists(): Promise<Playlist[]> {
    if (!this.db) return this.fallback.getPlaylists();
    
    try {
      return await this.db.select().from(playlists);
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.getPlaylists();
    }
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    if (!this.db) return this.fallback.createPlaylist(insertPlaylist);
    
    try {
      const result = await this.db.insert(playlists).values(insertPlaylist).returning();
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.createPlaylist(insertPlaylist);
    }
  }

  async updatePlaylist(id: number, playlistUpdate: Partial<InsertPlaylist>): Promise<Playlist | undefined> {
    if (!this.db) return this.fallback.updatePlaylist(id, playlistUpdate);
    
    try {
      const result = await this.db.update(playlists).set(playlistUpdate).where(eq(playlists.id, id)).returning();
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.updatePlaylist(id, playlistUpdate);
    }
  }

  async deletePlaylist(id: number): Promise<boolean> {
    if (!this.db) return this.fallback.deletePlaylist(id);
    
    try {
      const result = await this.db.delete(playlists).where(eq(playlists.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.deletePlaylist(id);
    }
  }
}

// Use database storage with fallback to memory storage
export const storage = new DatabaseStorage();
