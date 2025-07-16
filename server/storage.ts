import { songs, playlists, users, sessions, type Song, type InsertSong, type Playlist, type InsertPlaylist, type User, type InsertUser, type Session, type InsertSession } from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Songs
  getSong(id: string): Promise<Song | undefined>;
  getSongs(): Promise<Song[]>;
  createSong(song: InsertSong): Promise<Song>;
  updateSong(id: string, song: Partial<InsertSong>): Promise<Song | undefined>;
  deleteSong(id: string): Promise<boolean>;
  getDownloadedSongs(): Promise<Song[]>;
  markSongAsDownloaded(id: string, fileSize: number): Promise<void>;
  
  // Playlists
  getPlaylist(id: number): Promise<Playlist | undefined>;
  getPlaylists(): Promise<Playlist[]>;
  getUserPlaylists(userId: number): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: number, playlist: Partial<InsertPlaylist>): Promise<Playlist | undefined>;
  deletePlaylist(id: number): Promise<boolean>;
  
  // Users (for future authentication)
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Sessions (for future authentication)
  getSession(id: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  deleteSession(id: string): Promise<boolean>;
  deleteUserSessions(userId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private songs: Map<string, Song>;
  private playlists: Map<number, Playlist>;
  private users: Map<number, User>;
  private sessions: Map<string, Session>;
  private playlistCurrentId: number;
  private userCurrentId: number;

  constructor() {
    this.songs = new Map();
    this.playlists = new Map();
    this.users = new Map();
    this.sessions = new Map();
    this.playlistCurrentId = 1;
    this.userCurrentId = 1;
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

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.userCurrentId++,
      ...insertUser,
      isEmailVerified: insertUser.isEmailVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated: User = { ...existing, ...userUpdate, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getUserPlaylists(userId: number): Promise<Playlist[]> {
    return Array.from(this.playlists.values()).filter(playlist => playlist.userId === userId);
  }

  // Session methods
  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const session: Session = {
      ...insertSession,
      createdAt: new Date(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async deleteSession(id: string): Promise<boolean> {
    return this.sessions.delete(id);
  }

  async deleteUserSessions(userId: number): Promise<void> {
    for (const [sessionId, session] of this.sessions) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
      }
    }
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
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        this.db = drizzle(pool);
        // Test connection
        this.testConnection();
      }
    } catch (error) {
      console.warn('Database connection failed, using in-memory storage:', error);
      this.db = null;
    }
  }

  private async testConnection() {
    try {
      if (this.db) {
        await this.db.execute('SELECT NOW()');
        console.log('✓ Database connected successfully');
      }
    } catch (error) {
      console.warn('Database test failed, falling back to memory storage:', error);
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

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    if (!this.db) return this.fallback.getUser(id);
    
    try {
      const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.getUser(id);
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!this.db) return this.fallback.getUserByEmail(email);
    
    try {
      const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.getUserByEmail(email);
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!this.db) return this.fallback.getUserByUsername(username);
    
    try {
      const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.getUserByUsername(username);
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!this.db) return this.fallback.createUser(insertUser);
    
    try {
      const result = await this.db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.createUser(insertUser);
    }
  }

  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    if (!this.db) return this.fallback.updateUser(id, userUpdate);
    
    try {
      const result = await this.db.update(users).set(userUpdate).where(eq(users.id, id)).returning();
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.updateUser(id, userUpdate);
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    if (!this.db) return this.fallback.deleteUser(id);
    
    try {
      const result = await this.db.delete(users).where(eq(users.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.deleteUser(id);
    }
  }

  async getUserPlaylists(userId: number): Promise<Playlist[]> {
    if (!this.db) return this.fallback.getUserPlaylists(userId);
    
    try {
      return await this.db.select().from(playlists).where(eq(playlists.userId, userId));
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.getUserPlaylists(userId);
    }
  }

  // Session methods
  async getSession(id: string): Promise<Session | undefined> {
    if (!this.db) return this.fallback.getSession(id);
    
    try {
      const result = await this.db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.getSession(id);
    }
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    if (!this.db) return this.fallback.createSession(insertSession);
    
    try {
      const result = await this.db.insert(sessions).values(insertSession).returning();
      return result[0];
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.createSession(insertSession);
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    if (!this.db) return this.fallback.deleteSession(id);
    
    try {
      const result = await this.db.delete(sessions).where(eq(sessions.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.deleteSession(id);
    }
  }

  async deleteUserSessions(userId: number): Promise<void> {
    if (!this.db) return this.fallback.deleteUserSessions(userId);
    
    try {
      await this.db.delete(sessions).where(eq(sessions.userId, userId));
    } catch (error) {
      console.warn('Database error, falling back to memory:', error);
      return this.fallback.deleteUserSessions(userId);
    }
  }
}

// Use database storage with fallback to memory storage
export const storage = new DatabaseStorage();
