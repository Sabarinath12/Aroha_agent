# Backup & Self-Hosting Guide

## Project Backup Instructions

### 1. Export Project Files from Replit

**Option A: Export as ZIP (Recommended)**
1. Click on the three dots menu (⋮) in the file explorer
2. Select "Download as zip"
3. Save the zip file to your local machine

**Option B: Clone via Git**
```bash
# If you have Git integration enabled, clone the repository
git clone <your-replit-git-url>
```

### 2. Export Database Data

Your database is hosted on Neon PostgreSQL. To backup your data:

```bash
# From Replit shell, export the database schema and data
npx drizzle-kit push:pg

# Export database to SQL file (if you have pg_dump available)
# Or use Neon's dashboard to create a backup
```

**Alternative: Use Neon Dashboard**
1. Go to your Neon console: https://console.neon.tech
2. Find your database project
3. Use the "Branches" feature to create a snapshot
4. Or export data using their SQL editor

### 3. Document Environment Variables

You need these environment variables for self-hosting:

```env
# Database Connection
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI API Key
OPENAI_API_KEY=sk-proj-...

# Google Maps API Key (must be prefixed with VITE_ for frontend)
VITE_GOOGLE_MAPS_API_KEY=...

# Node Environment
NODE_ENV=production
```

### 4. Save Configuration Files

Ensure you have these files backed up:
- `package.json` - All dependencies
- `drizzle.config.ts` - Database configuration
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration
- All files in `shared/`, `server/`, and `client/` directories

---

## Self-Hosting Guide

### Prerequisites

1. **Server Requirements**
   - Ubuntu 20.04+ or similar Linux distribution
   - 1GB+ RAM minimum (2GB recommended)
   - Node.js 20.x
   - PostgreSQL database (can use Neon, Supabase, or self-hosted)

2. **Domain & SSL (Optional but Recommended)**
   - Domain name for your application
   - SSL certificate (Let's Encrypt is free)

### Step 1: Choose Your Hosting Provider

**Budget-Friendly Options:**
- **DigitalOcean Droplets**: $6/month for basic droplet
- **Hetzner Cloud**: €4.51/month for CX11
- **Vultr**: $6/month for 1GB RAM instance
- **Linode**: $5/month for Nanode
- **Oracle Cloud**: Free tier available (always free for limited resources)
- **AWS Lightsail**: $3.50/month for smallest instance
- **Google Cloud**: Free tier available

**Database Hosting:**
- Keep using Neon PostgreSQL (has free tier)
- Or use Supabase PostgreSQL (free tier)
- Or self-host PostgreSQL on same server

### Step 2: Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (for reverse proxy)
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### Step 3: Deploy Your Application

```bash
# Create application directory
mkdir -p /var/www/aroha-map-app
cd /var/www/aroha-map-app

# Upload your project files
# Option 1: Use SCP from your local machine
# scp -r /path/to/project/* root@your-server-ip:/var/www/aroha-map-app/

# Option 2: Use Git
# git clone <your-repository-url> .

# Install dependencies
npm install

# Build the application
npm run build
```

### Step 4: Configure Environment Variables

```bash
# Create .env file
nano .env

# Add your environment variables:
DATABASE_URL=postgresql://user:password@host:port/database
OPENAI_API_KEY=sk-proj-...
VITE_GOOGLE_MAPS_API_KEY=...
NODE_ENV=production
PORT=5000
```

### Step 5: Database Setup

```bash
# Push database schema to your production database
npx drizzle-kit push:pg

# If migrating data from Neon, import your SQL backup
# psql $DATABASE_URL < backup.sql
```

### Step 6: Start Application with PM2

```bash
# Start the application
pm2 start npm --name "aroha-app" -- start

# Or if you need to run the dev command
pm2 start "npm run dev" --name "aroha-app"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on server reboot
pm2 startup
# Follow the instructions printed by the command above
```

### Step 7: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/aroha-app

# Add this configuration:
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or server IP

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebRTC support
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/aroha-app /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 8: Setup SSL with Let's Encrypt (Optional)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Certbot will automatically configure Nginx for HTTPS
```

### Step 9: Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH (important!)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

### Step 10: Monitoring & Maintenance

```bash
# View application logs
pm2 logs aroha-app

# Monitor application status
pm2 monit

# Restart application
pm2 restart aroha-app

# Stop application
pm2 stop aroha-app

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## Cost Comparison

### Current Setup (Replit)
- Unknown cost (you mentioned it's getting expensive)

### Self-Hosted Setup (Estimated Monthly)
- **VPS Server**: $3.50 - $12/month (depending on provider)
- **Database (Neon free tier)**: $0
- **Domain name**: ~$12/year ($1/month)
- **SSL Certificate (Let's Encrypt)**: $0
- **Total**: ~$4.50 - $13/month

### API Costs (Ongoing)
- **OpenAI Realtime API**: Pay-per-use (based on audio minutes)
- **Google Maps API**: Free tier available (28,000 map loads/month free)

---

## Deployment Checklist

- [ ] Export project files from Replit
- [ ] Backup database from Neon
- [ ] Save all environment variables
- [ ] Choose hosting provider and create server
- [ ] Setup Node.js and PM2
- [ ] Upload project files
- [ ] Install dependencies and build
- [ ] Configure environment variables
- [ ] Setup database connection
- [ ] Start application with PM2
- [ ] Configure Nginx reverse proxy
- [ ] Setup SSL certificate (optional)
- [ ] Configure firewall
- [ ] Test application thoroughly
- [ ] Setup monitoring and backups

---

## Updating Your Application

```bash
# SSH into server
ssh root@your-server-ip

# Navigate to application directory
cd /var/www/aroha-map-app

# Pull latest changes (if using Git)
git pull origin main

# Or upload new files via SCP
# scp -r /path/to/updated/files/* root@your-server-ip:/var/www/aroha-map-app/

# Install new dependencies
npm install

# Rebuild application
npm run build

# Restart application
pm2 restart aroha-app
```

---

## Troubleshooting

### Application won't start
```bash
# Check PM2 logs
pm2 logs aroha-app --lines 100

# Check if port 5000 is in use
sudo lsof -i :5000

# Verify environment variables
pm2 env 0
```

### Can't connect to database
```bash
# Test database connection
psql $DATABASE_URL

# Check Neon dashboard for database status
# Verify DATABASE_URL is correct
```

### Nginx errors
```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### WebRTC/Voice not working
- Ensure your domain has HTTPS (required for WebRTC)
- Check browser console for errors
- Verify OPENAI_API_KEY is valid
- Check that proxy settings allow WebSocket connections

---

## Need Help?

- **DigitalOcean Tutorials**: https://www.digitalocean.com/community/tutorials
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/getting-started/
