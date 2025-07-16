import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/hooks/use-audio-player";

export default function MiniPlayer() {
  const {
    currentSong,
    isPlaying,
    progress,
    showMiniPlayer,
    showFloatingPlayerModal,
    togglePlayPause,
    playNext,
    playPrevious,
  } = useAudioPlayer();

  if (!showMiniPlayer || !currentSong) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 music-card rounded-xl p-3 shadow-lg border border-border/50 z-30">
      <div className="flex items-center space-x-3" onClick={showFloatingPlayerModal}>
        <img
          src={currentSong.image}
          alt={currentSong.name}
          className="w-12 h-12 rounded-lg object-cover cursor-pointer"
        />
        <div className="flex-1 min-w-0 cursor-pointer">
          <h3 className="font-medium text-foreground text-sm truncate">{currentSong.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              playPrevious();
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              {isPlaying ? (
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              ) : (
                <path d="M8 5v14l11-7z"/>
              )}
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              playNext();
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </Button>
        </div>
      </div>
      <div className="w-full bg-card mt-2 rounded-full h-1">
        <div 
          className="bg-primary h-1 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
