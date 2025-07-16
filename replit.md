# StreamTunes Music App

## Overview

StreamTunes is a modern music streaming application built with React and Express. It allows users to search for songs, play music, manage downloads, and organize playlists. The app integrates with the Saavn API to provide music search and streaming capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: Context API with React hooks for audio player state
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Structure**: RESTful endpoints for song search and management
- **External Integration**: Saavn API for music data and streaming
- **Session Management**: Express sessions with PostgreSQL store

### Database Design
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured but can be added by code agent)
- **Schema**: Two main tables - songs and playlists
- **Migration**: Drizzle Kit for database migrations

## Key Components

### Audio Player System
- **Context Provider**: Centralized audio player state management
- **Components**: Mini player, floating player, and playback controls
- **Features**: Play/pause, next/previous, volume control, progress seeking
- **Queue Management**: Song queue with current index tracking

### Music Search and Discovery
- **Search Interface**: Real-time search with debouncing
- **External API**: Integration with Saavn API for music data
- **Results Display**: Song cards with play, download, and metadata
- **Categories**: Genre-based music discovery

### Download Management
- **Local Storage**: Client-side download tracking
- **Progress Tracking**: Real-time download progress indicators
- **File Management**: Simulated download system with size tracking
- **Offline Access**: Downloaded songs management interface

### UI/UX Components
- **Responsive Design**: Mobile-first approach with bottom navigation
- **Component Library**: Comprehensive UI components from Radix UI
- **Theming**: Dark theme with custom color variables
- **Accessibility**: ARIA labels and keyboard navigation support

## Data Flow

### Music Search Flow
1. User enters search query in search page
2. Query is debounced and sent to `/api/search/songs`
3. Backend proxies request to Saavn API
4. Results are formatted and returned to frontend
5. Song cards are rendered with play/download actions

### Audio Playback Flow
1. User clicks play on a song card
2. Audio player context updates current song state
3. Audio element loads song URL and begins playback
4. Progress updates are tracked and displayed
5. Mini player and floating player components reflect current state

### Download Flow
1. User clicks download button on song card
2. Download manager simulates file download with progress
3. Song is marked as downloaded in local storage
4. Download status is reflected across the application
5. Downloaded songs are accessible in downloads page

## External Dependencies

### API Integration
- **Saavn API**: Primary source for music data and streaming URLs
- **Axios**: HTTP client for API requests with timeout handling
- **Error Handling**: Comprehensive error handling for API failures

### Third-Party Libraries
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui**: Unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing library
- **drizzle-orm**: Type-safe database operations
- **zod**: Runtime type validation

### Development Tools
- **Vite**: Fast build tool with HMR
- **TypeScript**: Static type checking
- **ESLint**: Code linting and formatting
- **Replit Integration**: Development environment integration

## Deployment Strategy

### Development Setup
- **Database**: Requires DATABASE_URL environment variable
- **API**: Saavn API integration for music data
- **Local Storage**: Client-side data persistence
- **Hot Reload**: Vite development server with fast refresh

### Production Build
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Static Files**: Express serves built React app in production
- **Environment**: NODE_ENV determines development/production behavior

### Database Management
- **Schema**: Located in `shared/schema.ts` for type sharing
- **Migrations**: Drizzle Kit manages database schema changes
- **Storage Interface**: Abstracted storage layer supports multiple implementations
- **Memory Storage**: In-memory storage for development/testing

## Recent Changes

### July 16, 2025 - Search Functionality & Multi-Language Support
- Fixed search API endpoints to use correct `query` parameter instead of `q`
- Added category-based song endpoints for different languages (Bollywood, Marathi, Telugu, Hollywood, Kannada, Punjabi, Tamil, Gujarati)
- Implemented multi-language home page with separate sections for each category
- Fixed TypeScript errors in storage layer for proper null handling
- Updated API response parsing to handle `response.data.data.results` structure
- Added "Play All" functionality for each category section
- Improved search results display with proper type conversion

### Features Added
- Multi-language music discovery (8 different categories)
- Category-based song recommendations that refresh daily
- Enhanced search functionality with debounced input
- Real-time API integration with JioSaavn
- Proper error handling for API failures

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and a focus on user experience with features like real-time search, audio playback, and download management.