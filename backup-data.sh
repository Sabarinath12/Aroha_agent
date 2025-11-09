#!/bin/bash

# Aroha Map App - Quick Backup Script
# This script helps you backup essential data before self-hosting

echo "=========================================="
echo "Aroha Map App - Backup Script"
echo "=========================================="
echo ""

# Create backup directory with timestamp
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "✓ Created backup directory: $BACKUP_DIR"
echo ""

# 1. Save environment variables to a file
echo "📝 Saving environment variables..."
cat > "$BACKUP_DIR/env_variables.txt" << EOF
# Environment Variables for Aroha Map App
# Copy these to your .env file on your self-hosted server

DATABASE_URL=$DATABASE_URL
OPENAI_API_KEY=$OPENAI_API_KEY
VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
NODE_ENV=production
EOF
echo "✓ Environment variables saved to $BACKUP_DIR/env_variables.txt"
echo ""

# 2. Copy essential configuration files
echo "📋 Copying configuration files..."
cp package.json "$BACKUP_DIR/" 2>/dev/null && echo "  ✓ package.json"
cp package-lock.json "$BACKUP_DIR/" 2>/dev/null && echo "  ✓ package-lock.json"
cp tsconfig.json "$BACKUP_DIR/" 2>/dev/null && echo "  ✓ tsconfig.json"
cp vite.config.ts "$BACKUP_DIR/" 2>/dev/null && echo "  ✓ vite.config.ts"
cp drizzle.config.ts "$BACKUP_DIR/" 2>/dev/null && echo "  ✓ drizzle.config.ts"
cp tailwind.config.ts "$BACKUP_DIR/" 2>/dev/null && echo "  ✓ tailwind.config.ts"
echo ""

# 3. Save database schema
echo "💾 Saving database schema..."
if [ -f "shared/schema.ts" ]; then
    cp shared/schema.ts "$BACKUP_DIR/"
    echo "✓ Database schema saved"
else
    echo "⚠ Database schema not found"
fi
echo ""

# 4. Create installation instructions
echo "📖 Creating quick start guide..."
cat > "$BACKUP_DIR/QUICK_START.md" << 'EOF'
# Quick Start Guide

## On Your New Server

1. **Upload all project files to your server**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp env_variables.txt .env
   # Edit .env and update DATABASE_URL if needed
   ```

4. **Build the application**
   ```bash
   npm run build
   ```

5. **Push database schema**
   ```bash
   npx drizzle-kit push:pg
   ```

6. **Start with PM2**
   ```bash
   pm2 start npm --name aroha-app -- run dev
   pm2 save
   pm2 startup
   ```

7. **Access your app**
   - Local: http://localhost:5000
   - Public: http://your-server-ip:5000

See BACKUP_AND_SELFHOST_GUIDE.md for complete instructions.
EOF
echo "✓ Quick start guide created"
echo ""

# 5. Create list of required API keys
echo "🔑 Creating API keys checklist..."
cat > "$BACKUP_DIR/API_KEYS_CHECKLIST.md" << 'EOF'
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
EOF
echo "✓ API keys checklist created"
echo ""

# Summary
echo "=========================================="
echo "✓ Backup Complete!"
echo "=========================================="
echo ""
echo "Backup saved to: ./$BACKUP_DIR"
echo ""
echo "📦 Contents:"
echo "  - env_variables.txt (your environment variables)"
echo "  - Configuration files (package.json, tsconfig.json, etc.)"
echo "  - Database schema (schema.ts)"
echo "  - QUICK_START.md (deployment instructions)"
echo "  - API_KEYS_CHECKLIST.md (required API keys)"
echo ""
echo "📋 Next Steps:"
echo "  1. Download this entire project as ZIP from Replit"
echo "  2. Copy the backup folder to your local machine"
echo "  3. Follow BACKUP_AND_SELFHOST_GUIDE.md for full setup"
echo "  4. Upload everything to your new server"
echo ""
echo "💡 Tip: Use 'scp -r $BACKUP_DIR user@server:/path/' to copy files"
echo ""
