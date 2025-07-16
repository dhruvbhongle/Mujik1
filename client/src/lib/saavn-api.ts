import type { SearchResponse, SaavnSong } from "@shared/schema";

export async function searchSongs(query: string, page = 1, limit = 20): Promise<SearchResponse> {
  const response = await fetch(`/api/search/songs?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to search songs");
  }
  return response.json();
}

export async function getSongDetails(id: string): Promise<SaavnSong> {
  const response = await fetch(`/api/songs/${id}`);
  if (!response.ok) {
    throw new Error("Failed to get song details");
  }
  return response.json();
}

export async function getFeaturedSongs(): Promise<SaavnSong[]> {
  const response = await fetch("/api/songs/featured");
  if (!response.ok) {
    throw new Error("Failed to get featured songs");
  }
  return response.json();
}
