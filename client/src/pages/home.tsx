import { useQuery } from "@tanstack/react-query";
import { getFeaturedSongs, getCategorySongs } from "@/lib/saavn-api";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import SongCard from "@/components/song-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Song } from "@shared/schema";

export default function Home() {
  const { setQueue, playSong } = useAudioPlayer();

  // Get different categories based on the day of the week for variety
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  const categories = [
    { id: 'bollywood', name: 'Bollywood Hits', color: 'from-pink-500 to-rose-500' },
    { id: 'hollywood', name: 'Hollywood Hits', color: 'from-blue-500 to-purple-500' },
    { id: 'marathi', name: 'Marathi Songs', color: 'from-orange-500 to-red-500' },
    { id: 'telugu', name: 'Telugu Songs', color: 'from-green-500 to-emerald-500' },
    { id: 'kannada', name: 'Kannada Songs', color: 'from-yellow-500 to-orange-500' },
    { id: 'punjabi', name: 'Punjabi Songs', color: 'from-indigo-500 to-blue-500' },
    { id: 'tamil', name: 'Tamil Songs', color: 'from-purple-500 to-pink-500' },
  ];

  const { data: featuredSongs, isLoading: featuredLoading } = useQuery({
    queryKey: ["/api/songs/featured"],
    queryFn: getFeaturedSongs,
  });

  const { data: bollywoodSongs, isLoading: bollywoodLoading } = useQuery({
    queryKey: ["/api/songs/category/bollywood"],
    queryFn: () => getCategorySongs('bollywood'),
  });

  const { data: hollywoodSongs, isLoading: hollywoodLoading } = useQuery({
    queryKey: ["/api/songs/category/hollywood"],
    queryFn: () => getCategorySongs('hollywood'),
  });

  const { data: marathiSongs, isLoading: marathiLoading } = useQuery({
    queryKey: ["/api/songs/category/marathi"],
    queryFn: () => getCategorySongs('marathi'),
  });

  const { data: teluguSongs, isLoading: teluguLoading } = useQuery({
    queryKey: ["/api/songs/category/telugu"],
    queryFn: () => getCategorySongs('telugu'),
  });

  const { data: kannadaSongs, isLoading: kannadaLoading } = useQuery({
    queryKey: ["/api/songs/category/kannada"],
    queryFn: () => getCategorySongs('kannada'),
  });

  const convertToSong = (song: any): Song => ({
    id: song.id,
    name: song.name,
    artist: song.artist,
    album: song.album,
    image: song.image,
    duration: song.duration,
    url: song.url,
    downloadUrl: song.downloadUrl,
    quality: song.quality,
    language: song.language,
    year: song.year,
    isDownloaded: false,
    downloadedAt: null,
    fileSize: null,
  });

  const handlePlayFeatured = () => {
    if (featuredSongs && featuredSongs.length > 0) {
      const songs: Song[] = featuredSongs.map(convertToSong);
      setQueue(songs);
      playSong(songs[0]);
    }
  };

  const handlePlayCategory = (songs: any[]) => {
    if (songs && songs.length > 0) {
      const convertedSongs: Song[] = songs.map(convertToSong);
      setQueue(convertedSongs);
      playSong(convertedSongs[0]);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Hero Section */}
      <section>
        <Card className="music-gradient rounded-2xl p-6 mb-6">
          <CardContent className="p-0">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Discover Weekly</h2>
                <p className="text-white/80">Your personalized playlist</p>
              </div>
            </div>
            <Button 
              onClick={handlePlayFeatured}
              className="bg-white text-black hover:bg-white/90 font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Play Now
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Bollywood Hits Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Bollywood Hits</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handlePlayCategory(bollywoodSongs || [])}
            className="text-primary hover:text-primary/80"
          >
            Play All
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bollywoodLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="music-card rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            bollywoodSongs?.slice(0, 6).map((song) => (
              <SongCard
                key={song.id}
                song={convertToSong(song)}
                showAlbum={false}
              />
            ))
          )}
        </div>
      </section>

      {/* Hollywood Hits Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Hollywood Hits</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handlePlayCategory(hollywoodSongs || [])}
            className="text-primary hover:text-primary/80"
          >
            Play All
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hollywoodLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="music-card rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            hollywoodSongs?.slice(0, 6).map((song) => (
              <SongCard
                key={song.id}
                song={convertToSong(song)}
                showAlbum={false}
              />
            ))
          )}
        </div>
      </section>

      {/* Marathi Songs Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Marathi Songs</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handlePlayCategory(marathiSongs || [])}
            className="text-primary hover:text-primary/80"
          >
            Play All
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {marathiLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="music-card rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            marathiSongs?.slice(0, 6).map((song) => (
              <SongCard
                key={song.id}
                song={convertToSong(song)}
                showAlbum={false}
              />
            ))
          )}
        </div>
      </section>

      {/* Telugu Songs Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Telugu Songs</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handlePlayCategory(teluguSongs || [])}
            className="text-primary hover:text-primary/80"
          >
            Play All
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teluguLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="music-card rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            teluguSongs?.slice(0, 6).map((song) => (
              <SongCard
                key={song.id}
                song={convertToSong(song)}
                showAlbum={false}
              />
            ))
          )}
        </div>
      </section>

      {/* Kannada Songs Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Kannada Songs</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handlePlayCategory(kannadaSongs || [])}
            className="text-primary hover:text-primary/80"
          >
            Play All
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kannadaLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="music-card rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            kannadaSongs?.slice(0, 6).map((song) => (
              <SongCard
                key={song.id}
                song={convertToSong(song)}
                showAlbum={false}
              />
            ))
          )}
        </div>
      </section>

      {/* Top Charts Section */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">Top Charts</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {featuredLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="music-card rounded-xl p-4">
                <Skeleton className="w-full aspect-square rounded-lg mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))
          ) : (
            featuredSongs?.slice(0, 12).map((song) => (
              <div key={song.id} className="music-card rounded-xl p-4 music-card-hover cursor-pointer group relative">
                <img
                  src={song.image}
                  alt={`${song.name} album art`}
                  className="w-full aspect-square rounded-lg mb-3 shadow-lg object-cover"
                />
                <h3 className="font-medium text-foreground text-sm truncate">{song.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => playSong(convertToSong(song))}
                  className="absolute top-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </Button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Made for You Section */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">Made for You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Chill Mix", description: "Relaxing songs for focus" },
            { name: "Workout Beats", description: "High energy music" },
            { name: "Throwback Mix", description: "Classic hits from the past" },
          ].map((playlist, index) => (
            <div key={index} className="music-card rounded-xl p-4 music-card-hover cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{playlist.name}</h3>
                  <p className="text-sm text-muted-foreground">{playlist.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
