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
