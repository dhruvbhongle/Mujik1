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

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  username: text("username").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
  isEmailVerified: boolean("is_email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  songIds: text("song_ids").array(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSongSchema = createInsertSchema(songs);
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertSessionSchema = createInsertSchema(sessions).omit({
  createdAt: true,
});
export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Song = typeof songs.$inferSelect;
export type InsertSong = z.infer<typeof insertSongSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
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
