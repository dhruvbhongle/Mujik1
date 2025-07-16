import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const songs = pgTable("songs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  artist: text("artist").notNull(),
  album: text("album").notNull(),
  image: text("image").notNull(),
  duration: integer("duration").notNull(),
  url: text("url").notNull(),
  downloadUrl: text("download_url"),
  quality: text("quality").notNull(),
  language: text("language"),
  year: integer("year"),
  isDownloaded: boolean("is_downloaded").default(false),
  downloadedAt: timestamp("downloaded_at"),
  fileSize: integer("file_size"),
});

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  songIds: text("song_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSongSchema = createInsertSchema(songs);
export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
});

export type Song = typeof songs.$inferSelect;
export type InsertSong = z.infer<typeof insertSongSchema>;
export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;

export interface SaavnSong {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  duration: number;
  url: string;
  downloadUrl: string;
  quality: string;
  language?: string;
  year?: number;
}

export interface SearchResponse {
  results: SaavnSong[];
  total: number;
  page: number;
}

export interface DownloadProgress {
  songId: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
}
