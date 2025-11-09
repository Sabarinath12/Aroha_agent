# Voice & Map Input Application

## Overview
This project is a real-time, voice-enabled map application featuring "Aroha," an AI travel companion. It offers natural, continuous voice conversations for travel, locations, and directions using OpenAI's Realtime API with WebRTC. The application prioritizes a conversation-first experience with a dynamic UI where the map appears only when needed. Key capabilities include voice-activated directions, real-time map updates, multi-stage transportation journey progressions (e.g., Walk → Metro → Walk) with cost breakdowns, and discovery of nearby places. The app includes **Replit Auth** for zero-configuration authentication with multiple login providers (Google, GitHub, X, Apple, Email), securing access to the voice interface. The core ambition is to provide a seamless, low-latency, and intuitive voice interaction experience for travel planning.

## Recent Changes

### November 8, 2025 - Replit Auth Integration, Settings Menu, Landing & About Pages
- Migrated from Auth0 to Replit Auth for simplified, zero-configuration authentication
- Removed all Auth0 dependencies and environment variable requirements
- Created custom `useReplitAuth` hook wrapping Replit's authentication system
- Implemented server-side authentication middleware reading user data from Replit headers (`x-replit-user-id`, `x-replit-user-name`, `x-replit-user-roles`)
- Updated `/login`, `/signup`, and `/callback` routes to use Replit Auth popup flow
- Maintained existing dark mode design for all authentication pages
- Added support for multiple login providers: Google, GitHub, X (Twitter), Apple, and Email
- Updated `ProtectedRoute` component for Replit Auth integration
- Created settings dropdown menu in top-right corner of conversation panel
  - Settings icon button positioned inside conversation panel at top-right
  - Dropdown displays user profile (picture + name) and logout option
  - Perfectly aligned icons and text for clean presentation
- Fixed logout functionality to properly clear Replit session and prevent auto-login
  - Logout now redirects through Replit's logout page before returning to homepage
- Created beautiful landing page at root path (`/`)
  - Hero section: "Have you ever felt anxious while traveling to a new place? We've got you covered! Meet our most advanced travel agent, Aroha!"
  - Features showcase (voice conversations, smart directions, place discovery)
  - "How It Works" step-by-step guide
  - Call-to-action sections with sign-up buttons
  - Consistent dark theme with gradient effects and glassmorphism
  - "Learn More" button navigates to About page
- Created comprehensive About page at `/about`
  - Mission statement explaining Aroha's purpose
  - "What Makes Aroha Special" section with 4 feature cards (Natural Voice Interface, Intelligent Journey Planning, Real-Time Place Discovery, Zero Learning Curve)
  - Technology stack section highlighting OpenAI Realtime API, Google Maps Platform, and WebRTC
  - Navigation to Home and Sign In
  - CTA section encouraging users to get started
- Updated route structure:
  - `/` - Public landing page
  - `/about` - About page with detailed information
  - `/app` - Protected voice map application
  - `/login` and `/signup` - Authentication pages
- No environment variables required for authentication (handled automatically by Replit)

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript (Vite build tool).
- **UI/UX**: Shadcn UI (New York style, built on Radix UI) with a minimalist, Material Design-inspired approach.
- **Styling**: Tailwind CSS with custom design tokens (spacing, colors, typography using Inter font).
- **State Management**: TanStack Query for server state; React hooks for local state.
- **Routing**: Wouter for client-side routing.
- **Authentication**: Replit Auth with multiple OAuth providers (Google, GitHub, X, Apple, Email). Zero-configuration setup using popup-based authentication flow. Protected routes redirect unauthenticated users to login page. User profile display in header with logout functionality.
- **Interactive UI Layout**:
    - **Conversation-First Design**: Map panel is initially hidden, dynamically appearing when AI calls location-related functions (e.g., `search_location`, `get_directions`).
    - **Dynamic Map Appearance**: Map slides in from the right when needed, splitting the screen 50/50 with the conversation panel.
    - **Split-Screen Journey Display**: When transportation options are provided, the conversation panel splits into a scrollable conversation (60%) and a dedicated area for visual journey cards (40%).
    - **Visual Journey Blocks**: Transportation options are displayed as horizontal, color-coded blocks (e.g., Purple for Metro, Green for Bus) with icons, stage details, and total fare/duration, supporting horizontal scrolling for long journeys.
    - **Places Discovery Cards**: When Aroha finds nearby restaurants, hotels, or tourist attractions, beautiful place cards appear in a grid below the chat showing photos, ratings (with star icons), price levels, opening status, addresses, and action buttons ("View on Map" and Google Maps link). Cards automatically expand to full-panel view for better visibility, reducing transcript space above.

### Backend
- **Runtime**: Node.js with Express.js (TypeScript, ES modules).
- **API Pattern**: RESTful endpoints (JSON format).
- **Transportation Journey System**: Generates multi-stage journey progressions (e.g., Metro + Walk, Direct Bus, Ride-hailing) with detailed fare calculations for Bengaluru (Metro, BMTC Bus, Uber/Ola). Journeys are sorted by total fare (cheapest first) and include personalized recommendations.
- **Real-time Voice Conversation Flow**:
    - Uses OpenAI Realtime API via WebRTC for low-latency bidirectional audio streaming and server-side Voice Activity Detection (VAD).
    - **AI Function Calling**: Configured with tools for map interaction (`search_location`, `center_map`, `add_marker`, `get_directions`, `compare_transportation`, `find_nearby_places`).
    - **AI Personality (Aroha)**: A friendly, warm, and concise travel companion (1-2 sentence responses max). Aroha acts immediately using tools, elaborating only when asked. She is aware of the visual journey blocks and references them concisely.

### Map Integration
- **Provider**: Google Maps JavaScript API (with Places library, Geocoding API, Directions API).
- **Readiness System**: Robust initialization handling ensures map readiness before operations, with error handling and toast notifications.
- **Imperative API**: MapContainer exposes methods (`searchLocation`, `centerMap`, `addMarker`, `drawRoute`, `showPlaces`, `clearPlaces`) for AI programmatic control.
- **Marker Management**: Automatic clearing of previous single markers; `showPlaces` for multiple POI markers with info windows; `clearPlaces` for stale results.
- **Route Visualization**: Directions drawn as cyan polylines with automatic viewport adjustment.
- **Live Location Sharing**: "My Location" button on map overlay uses browser Geolocation API to center map on user's current position with marker placement. Includes loading states and comprehensive error handling for permission, availability, and timeout cases.

### Data Layer
- **ORM**: Drizzle ORM for PostgreSQL.
- **Database**: Neon serverless PostgreSQL.
- **Schema**: Centralized, type-safe schema (e.g., `Users` table).
- **Migrations**: Drizzle Kit.

### Project Structure
- **Monorepo**: Client and server directories, with shared types.
- **Build**: Client to `dist/public`, server to `dist` (esbuild).

## External Dependencies

### Third-Party APIs
- **OpenAI API**: Realtime API (`gpt-4o-realtime-preview-2024-12-17`) for voice conversations (WebRTC, VAD, transcription). Requires `OPENAI_API_KEY`.
- **Google Maps API**: JavaScript Maps API, Places library. Requires `VITE_GOOGLE_MAPS_API_KEY`.
- **Replit Auth**: Built-in authentication service providing enterprise-grade security (Firebase, Google Cloud Identity, reCAPTCHA, Stytch). No configuration or environment variables required. Supports multiple OAuth providers and email authentication.

### Database
- **Neon Serverless PostgreSQL**: Cloud-hosted PostgreSQL. Requires `DATABASE_URL`.

### Core Libraries
- **UI & Styling**: Radix UI, Tailwind CSS, `class-variance-authority`, Lucide React.
- **Form Handling**: React Hook Form, Zod, `@hookform/resolvers`.
- **Data Fetching**: TanStack Query.