import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { insertSongSchema, type SaavnSong, type SearchResponse } from "@shared/schema";
import { z } from "zod";

const SAAVN_API_BASE = "https://saavn.dev/api";

export async function registerRoutes(app: Express): Promise<Server> {
  // Search songs using Saavn API
  app.get("/api/search/songs", async (req, res) => {
    try {
      const { query, page = 1, limit = 20 } = req.query;
      
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const response = await axios.get(`${SAAVN_API_BASE}/search/songs`, {
        params: { query, page, limit },
        timeout: 10000,
      });

      const searchResponse: SearchResponse = {
        results: response.data.data?.results?.map((song: any) => {
          // Find the best quality URL (prefer 320kbps, 160kbps, 96kbps, then fallback)
          const bestQuality = song.downloadUrl?.find((url: any) => url.quality === '320kbps') ||
                             song.downloadUrl?.find((url: any) => url.quality === '160kbps') ||
                             song.downloadUrl?.find((url: any) => url.quality === '96kbps') ||
                             song.downloadUrl?.[song.downloadUrl.length - 1];
          
          return {
            ...song,
            artist: song.artists?.primary?.[0]?.name || song.artist || 'Unknown Artist',
            album: song.album?.name || song.album || 'Unknown Album',
            url: bestQuality?.url || '',
            downloadUrl: bestQuality?.url || '',
            quality: bestQuality?.quality || '12kbps',
          };
        }) || [],
        total: response.data.data?.total || 0,
        page: Number(page),
      };

      res.json(searchResponse);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to search songs" });
    }
  });

  // Get downloaded songs
  app.get("/api/songs/downloaded", async (req, res) => {
    try {
      const downloadedSongs = await storage.getDownloadedSongs();
      res.json(downloadedSongs);
    } catch (error) {
      console.error("Get downloaded songs error:", error);
      res.status(500).json({ error: "Failed to get downloaded songs" });
    }
  });

  // Get featured/trending songs
  app.get("/api/songs/featured", async (req, res) => {
    try {
      const response = await axios.get(`${SAAVN_API_BASE}/search/songs`, {
        params: { query: "trending bollywood", limit: 10 },
        timeout: 10000,
      });

      const songs = response.data.data?.results?.map((song: any) => {
        // Find the best quality URL (prefer 320kbps, 160kbps, 96kbps, then fallback)
        const bestQuality = song.downloadUrl?.find((url: any) => url.quality === '320kbps') ||
                           song.downloadUrl?.find((url: any) => url.quality === '160kbps') ||
                           song.downloadUrl?.find((url: any) => url.quality === '96kbps') ||
                           song.downloadUrl?.[song.downloadUrl.length - 1];
        
        return {
          ...song,
          artist: song.artists?.primary?.[0]?.name || song.artist || 'Unknown Artist',
          album: song.album?.name || song.album || 'Unknown Album',
          url: bestQuality?.url || '',
          downloadUrl: bestQuality?.url || '',
          quality: bestQuality?.quality || '12kbps',
        };
      }) || [];
      
      res.json(songs);
    } catch (error) {
      console.error("Featured songs error:", error);
      res.status(500).json({ error: "Failed to get featured songs" });
    }
  });

  // Get song details
  app.get("/api/songs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const response = await axios.get(`${SAAVN_API_BASE}/songs/${id}`, {
        timeout: 10000,
      });

      res.json(response.data);
    } catch (error) {
      console.error("Song fetch error:", error);
      res.status(500).json({ error: "Failed to fetch song details" });
    }
  });

  // Save song to local storage
  app.post("/api/songs", async (req, res) => {
    try {
      const validatedData = insertSongSchema.parse(req.body);
      const song = await storage.createSong(validatedData);
      res.json(song);
    } catch (error) {
      console.error("Save song error:", error);
      res.status(400).json({ error: "Failed to save song" });
    }
  });

  // Mark song as downloaded
  app.patch("/api/songs/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      const { fileSize } = req.body;
      
      await storage.markSongAsDownloaded(id, fileSize);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark downloaded error:", error);
      res.status(500).json({ error: "Failed to mark song as downloaded" });
    }
  });

  // Delete downloaded song
  app.delete("/api/songs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteSong(id);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Song not found" });
      }
    } catch (error) {
      console.error("Delete song error:", error);
      res.status(500).json({ error: "Failed to delete song" });
    }
  });

  // Get category-based songs
  app.get("/api/songs/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const categoryQueries = {
        bollywood: "bollywood hindi latest",
        marathi: "marathi latest songs",
        telugu: "telugu latest songs",
        hollywood: "english latest songs",
        kannada: "kannada latest songs",
        punjabi: "punjabi latest songs",
        tamil: "tamil latest songs",
        gujarati: "gujarati latest songs"
      };
      
      const query = categoryQueries[category as keyof typeof categoryQueries] || category;
      
      const response = await axios.get(`${SAAVN_API_BASE}/search/songs`, {
        params: { query, limit: 10 },
        timeout: 10000,
      });

      const songs = response.data.data?.results?.map((song: any) => {
        // Find the best quality URL (prefer 320kbps, 160kbps, 96kbps, then fallback)
        const bestQuality = song.downloadUrl?.find((url: any) => url.quality === '320kbps') ||
                           song.downloadUrl?.find((url: any) => url.quality === '160kbps') ||
                           song.downloadUrl?.find((url: any) => url.quality === '96kbps') ||
                           song.downloadUrl?.[song.downloadUrl.length - 1];
        
        return {
          ...song,
          artist: song.artists?.primary?.[0]?.name || song.artist || 'Unknown Artist',
          album: song.album?.name || song.album || 'Unknown Album',
          url: bestQuality?.url || '',
          downloadUrl: bestQuality?.url || '',
          quality: bestQuality?.quality || '12kbps',
        };
      }) || [];
      
      res.json(songs);
    } catch (error) {
      console.error("Category songs error:", error);
      res.status(500).json({ error: "Failed to get category songs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
