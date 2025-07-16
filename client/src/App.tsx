import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Search from "@/pages/search";
import Downloads from "@/pages/downloads";
import NotFound from "@/pages/not-found";
import MiniPlayer from "@/components/mini-player";
import FloatingPlayer from "@/components/floating-player";
import BottomNavigation from "@/components/bottom-navigation";
import { AudioPlayerProvider } from "@/hooks/use-audio-player";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/downloads" component={Downloads} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AudioPlayerProvider>
          <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Header */}
            <header className="bg-background/95 backdrop-blur-sm sticky top-0 z-40 border-b border-border/50">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                    <h1 className="text-xl font-bold">StreamTunes</h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                      </svg>
                    </button>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="pb-32 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
              <Router />
            </main>

            {/* Mini Player */}
            <MiniPlayer />

            {/* Floating Player */}
            <FloatingPlayer />

            {/* Bottom Navigation */}
            <BottomNavigation />
          </div>
          <Toaster />
        </AudioPlayerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
