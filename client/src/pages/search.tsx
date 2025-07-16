import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchSongs } from "@/lib/saavn-api";
import SongCard from "@/components/song-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Song } from "@shared/schema";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["/api/search/songs", debouncedQuery],
    queryFn: () => searchSongs(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
  };

  const categories = [
    { name: "Pop", color: "from-purple-500 to-pink-500", icon: "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" },
    { name: "Rock", color: "from-orange-500 to-red-500", icon: "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" },
    { name: "Electronic", color: "from-blue-500 to-cyan-500", icon: "M12 1l3.5 3.5v2.83l-3.5 3.5-3.5-3.5V4.5L12 1zM12 8.5l-3.5 3.5v2.83l3.5 3.5 3.5-3.5V12L12 8.5z" },
    { name: "Hip Hop", color: "from-green-500 to-teal-500", icon: "M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 9c0 5.55-4.5 10-9 10S3 16.55 3 11c0-5.55 4.5-10 9-10s9 4.45 9 10z" },
    { name: "Jazz", color: "from-yellow-500 to-orange-500", icon: "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" },
    { name: "Classical", color: "from-indigo-500 to-purple-500", icon: "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" },
  ];

  return (
    <div className="py-4 space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for songs, artists, albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input w-full text-foreground placeholder-muted-foreground rounded-xl px-4 py-4 pl-12"
        />
        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </Button>
        )}
      </div>

      {/* Search Results */}
      {debouncedQuery && (
        <div className="fade-in">
          <h2 className="text-xl font-bold text-foreground mb-4">
            {isLoading ? "Searching..." : `Search Results for "${debouncedQuery}"`}
          </h2>
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="music-card rounded-xl p-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2 mb-1" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                </div>
              ))
            ) : searchResults?.results && searchResults.results.length > 0 ? (
              searchResults.results.map((song) => (
                <SongCard
                  key={song.id}
                  song={{
                    id: song.id,
                    name: song.name,
                    artist: typeof song.artist === 'string' ? song.artist : song.artist?.name || song.primaryArtists || 'Unknown Artist',
                    album: typeof song.album === 'string' ? song.album : song.album?.name || 'Unknown Album',
                    image: song.image,
                    duration: song.duration,
                    url: song.url,
                    downloadUrl: song.downloadUrl || null,
                    quality: song.quality,
                    language: song.language || null,
                    year: song.year || null,
                    isDownloaded: false,
                    downloadedAt: null,
                    fileSize: null,
                  }}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <p className="text-muted-foreground">No results found for "{debouncedQuery}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Browse Categories */}
      {!debouncedQuery && (
        <div className="fade-in">
          <h2 className="text-xl font-bold text-foreground mb-4">Browse Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div
                key={category.name}
                className={`bg-gradient-to-br ${category.color} rounded-xl p-4 cursor-pointer hover:scale-105 transition-transform`}
              >
                <h3 className="font-bold text-white text-lg mb-2">{category.name}</h3>
                <svg className="w-8 h-8 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                  <path d={category.icon} />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
