# Aroha Agent

An intelligent, voice-powered travel companion that understands your needs, manages your journey, and guides you with empathy. Aroha combines real-time AI assistance with practical travel tools to make every trip seamless, safe, and personalized.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)](https://openai.com/)

## Core Features

### Smart Expenditure Tracker
Automatically monitors and manages your travel costs in real-time, helping you stay within budget while exploring new destinations.

### Transportation Selector
Intelligently chooses the best route and transportation mode (train, cab, rental, etc.) based on your comfort preferences, budget constraints, and time requirements.

### Restaurant & Spot Recommender
Discovers local dining options and must-visit destinations near your route, powered by Google Places API for authentic recommendations.

### Live Language Assistant
Translates conversations instantly using OpenAI's real-time capabilities, breaking down language barriers wherever you travel.

### Sentimental AI Guide
Detects your mood through voice analysis and responds with a calming, friendly tone. Your AI companion understands when you're stressed, excited, or need reassurance.

### AI Trip Planner + Voice Navigation
Builds your complete itinerary and provides hands-free, turn-by-turn voice guidance in real-time using Google Maps integration.

### "Take Me Home" Memory
One simple command returns you home safely. Aroha automatically saves routes and trip memories for future reference.

## Tech Stack

### Frontend

**Core Framework**
- React 18 with TypeScript
- Vite for blazing-fast builds
- Wouter for lightweight routing (~1.3KB)

**State Management**
- TanStack Query (React Query v5) for server state, caching, and mutations

**UI & Styling**
- Shadcn UI (New York style) built on Radix UI primitives
- Tailwind CSS for utility-first styling
- Framer Motion for smooth animations
- Lucide React icons
- CVA (class-variance-authority) for component variants

**Forms**
- React Hook Form + Zod for type-safe form validation
- @hookform/resolvers for seamless integration

**Maps**
- Google Maps JavaScript API
- Google Places API
- Google Directions API
- Google Geocoding API

### Backend

**Runtime & Framework**
- Node.js with Express.js
- TypeScript (ES modules)
- tsx for TypeScript execution

**Authentication**
- Passport.js with local strategy
- bcryptjs for secure password hashing
- express-session with MemoryStore (Redis recommended for production)

**Database**
- Neon PostgreSQL (serverless)
- Drizzle ORM for type-safe queries
- Drizzle Kit for migrations
- drizzle-zod for automatic schema validation

**AI & Voice**
- OpenAI Realtime API (gpt-4o-realtime-preview-2024-12-17)
- WebRTC for real-time audio streaming
- Server-side Voice Activity Detection (VAD)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- PostgreSQL database (Neon account recommended)
- OpenAI API key with Realtime API access
- Google Cloud Platform account with Maps APIs enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sabarinath12/Aroha_agent.git
   cd Aroha_agent
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Set up environment variables**

   Create `.env` files in both frontend and backend directories:

   **Backend `.env`:**
   ```env
   # Database
   DATABASE_URL=your_neon_postgresql_connection_string

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key

   # Session
   SESSION_SECRET=your_random_secret_key

   # Server
   PORT=3000
   NODE_ENV=development
   ```

   **Frontend `.env`:**
   ```env
   # Google Maps
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   # Backend API
   VITE_API_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   cd backend
   npm run db:push  # Push Drizzle schema to database
   ```

5. **Start the development servers**

   **Backend:**
   ```bash
   cd backend
   npm run dev
   ```

   **Frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## Project Structure

```
Aroha_agent/
├── frontend/
│   ├── src/
│   │   ├── components/      # React components (Shadcn UI)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and helpers
│   │   ├── pages/          # Page components
│   │   └── App.tsx         # Main app component
│   ├── public/             # Static assets
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/         # Express routes
│   │   ├── db/             # Database schema (Drizzle)
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   └── server.ts       # Entry point
│   └── package.json
│
└── README.md
```

## Usage

### Voice Commands

Aroha responds to natural language. Try these commands:

- **"Plan a trip to Paris for next week"** - Creates a complete itinerary
- **"Find me a good restaurant nearby"** - Discovers local dining options
- **"How do I say 'hello' in Japanese?"** - Instant translation
- **"Take me home"** - Returns you to your saved home location
- **"What's the cheapest way to get to the airport?"** - Transportation analysis

### Dashboard Features

- **Budget Tracker**: Monitor spending across categories
- **Route Planner**: Visual map interface with turn-by-turn directions
- **Trip History**: Review past journeys and expenses
- **Settings**: Customize preferences, voice settings, and home location

## Configuration

### Google Maps Setup

1. Enable these APIs in Google Cloud Console:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API

2. Create API key with appropriate restrictions
3. Add to frontend `.env` file

### OpenAI Realtime API

1. Request access to GPT-4 Realtime API (if not already enabled)
2. Add API key to backend `.env`
3. Configure VAD sensitivity in `backend/src/services/ai.ts`

### Database Migration

```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:push

# View database in Drizzle Studio
npm run db:studio
```

## Production Deployment

### Backend

1. **Replace MemoryStore with Redis:**
   ```typescript
   import RedisStore from 'connect-redis';
   import { createClient } from 'redis';
   
   const redisClient = createClient({ url: process.env.REDIS_URL });
   // Configure session with RedisStore
   ```

2. **Set production environment variables**
3. **Deploy to your preferred platform** (Railway, Render, AWS, etc.)

### Frontend

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy static files** to Vercel, Netlify, or Cloudflare Pages
3. **Update `VITE_API_URL`** to your production backend URL

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for the groundbreaking Realtime API
- Google Maps Platform for comprehensive location services
- The open-source community for amazing tools like React, Drizzle, and Shadcn UI

## Contact

For questions, suggestions, or feedback:

- GitHub: [@Sabarinath12](https://github.com/Sabarinath12)
- Project Link: [https://github.com/Sabarinath12/Aroha_agent](https://github.com/Sabarinath12/Aroha_agent)

---

Made with care for travelers who deserve better journey experiences
