# API Keys Checklist

Before deploying, ensure you have:

## Required API Keys

- [ ] **OpenAI API Key**
  - Get from: https://platform.openai.com/api-keys
  - Used for: Real-time voice conversations
  - Cost: Pay-per-use (audio minutes)

- [ ] **Google Maps API Key**
  - Get from: https://console.cloud.google.com/google/maps-apis
  - Required APIs to enable:
    - Maps JavaScript API
    - Places API
    - Directions API
    - Geocoding API
  - Cost: Free tier available (28,000 map loads/month)
  - IMPORTANT: Must be prefixed with VITE_ in .env file

## Database

- [ ] **PostgreSQL Database URL**
  - Recommended: Keep using Neon (free tier) or Supabase
  - Format: postgresql://user:password@host:port/database
  - Or self-host PostgreSQL on your server

## Testing

After deployment, test:
- [ ] Voice conversation works
- [ ] Map loads correctly  
- [ ] Location search works
- [ ] Directions work
- [ ] Transportation pricing shows
