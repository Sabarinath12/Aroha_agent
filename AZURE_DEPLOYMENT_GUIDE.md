# Deploy to Azure VM - Step by Step Guide

You already have an Azure VM! Let's get your app deployed.

## Prerequisites

Make sure your Azure VM has:
- Ubuntu 20.04 or 22.04 (or similar Linux)
- At least 1GB RAM (2GB recommended)
- Port 80 and 443 open in Network Security Group
- SSH access configured

## Step 1: Get Your Azure VM Details

From Azure Portal, note down:
- **Public IP Address**: (e.g., 20.123.45.67)
- **SSH Username**: (usually `azureuser` or whatever you set)
- **SSH Key or Password**: Your authentication method

## Step 2: Download Your Project from Replit

1. In Replit, click the three dots (⋮) in the file explorer
2. Select "Download as zip"
3. Save to your computer
4. Extract the zip file

## Step 3: Connect to Your Azure VM

**If using SSH key:**
```bash
ssh -i /path/to/your-key.pem azureuser@YOUR_AZURE_IP
```

**If using password:**
```bash
ssh azureuser@YOUR_AZURE_IP
# Enter password when prompted
```

## Step 4: Install Required Software on Azure VM

Once connected to your VM, run these commands:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (web server)
sudo apt install -y nginx

# Install Git (optional, for future updates)
sudo apt install -y git

echo "✅ All software installed!"
```

## Step 5: Create Application Directory

```bash
# Create directory for your app
sudo mkdir -p /var/www/aroha-app
sudo chown -R $USER:$USER /var/www/aroha-app
cd /var/www/aroha-app
```

## Step 6: Upload Your Project Files

**Option A: Using SCP (from your local computer)**

Open a **NEW terminal on your local computer** (not SSH):

```bash
# Navigate to where you extracted the Replit zip
cd /path/to/extracted/aroha-app

# Upload everything to Azure VM
scp -r * azureuser@YOUR_AZURE_IP:/var/www/aroha-app/

# Or if using SSH key:
scp -i /path/to/your-key.pem -r * azureuser@YOUR_AZURE_IP:/var/www/aroha-app/
```

**Option B: Using FileZilla (GUI Method)**
1. Download FileZilla
2. Connect to your Azure VM IP
3. Upload all files to `/var/www/aroha-app/`

**Option C: Using Git (if you pushed to GitHub)**
```bash
# On Azure VM:
cd /var/www/aroha-app
git clone https://github.com/yourusername/your-repo.git .
```

## Step 7: Setup Environment Variables

**Back on your Azure VM SSH session:**

```bash
cd /var/www/aroha-app

# Create .env file
nano .env
```

**Copy and paste this, then update with your actual values:**

```env
# Database Connection (keep using Neon or use Azure PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI API Key
OPENAI_API_KEY=sk-proj-your-key-here

# Google Maps API Key (MUST start with VITE_)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Node Environment
NODE_ENV=production
PORT=5000
```

**Save the file:**
- Press `Ctrl + O` (save)
- Press `Enter` (confirm)
- Press `Ctrl + X` (exit)

## Step 8: Install Dependencies and Build

```bash
cd /var/www/aroha-app

# Install all npm packages
npm install

# This might take 2-3 minutes
echo "✅ Dependencies installed!"

# Build the application
npm run build

echo "✅ Build complete!"
```

## Step 9: Setup Database

```bash
# Push your database schema to production
npx drizzle-kit push:pg

# You should see: "✓ Your schema has been pushed successfully"
```

## Step 10: Start Application with PM2

```bash
# Start the app with PM2
pm2 start npm --name "aroha-app" -- run dev

# Save PM2 configuration
pm2 save

# Make PM2 start on server reboot
pm2 startup
# ⚠️ IMPORTANT: Copy and run the command it shows you

# Check if app is running
pm2 status
pm2 logs aroha-app --lines 20
```

You should see: `[express] serving on port 5000`

## Step 11: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/aroha-app
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name YOUR_AZURE_IP;  # Replace with your actual Azure IP

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
        
        # Important for WebRTC
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

**Save and continue:**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/aroha-app /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Should see: "test is successful"

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx
```

## Step 12: Configure Azure Firewall

**In Azure Portal:**

1. Go to your VM
2. Click "Networking" in left sidebar
3. Click "Network security group"
4. Click "Inbound security rules"
5. Add these rules:

**Rule 1: HTTP**
- Port: 80
- Protocol: TCP
- Source: Any
- Action: Allow
- Priority: 100
- Name: Allow-HTTP

**Rule 2: HTTPS**
- Port: 443
- Protocol: TCP
- Source: Any
- Action: Allow
- Priority: 101
- Name: Allow-HTTPS

**Rule 3: SSH (if not already there)**
- Port: 22
- Protocol: TCP
- Source: Your IP or Any
- Action: Allow
- Priority: 102
- Name: Allow-SSH

## Step 13: Test Your Application! 🎉

Open your browser and go to:
```
http://YOUR_AZURE_IP
```

You should see your Aroha voice & map application!

## Verification Checklist

- [ ] App loads in browser
- [ ] Voice conversation starts (microphone permission)
- [ ] Can hear Aroha speaking
- [ ] Map appears when asking about locations
- [ ] Search location works
- [ ] Get directions works
- [ ] Transportation pricing shows

## Optional: Add HTTPS with SSL

**If you have a domain name pointed to your Azure IP:**

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace your-domain.com)
sudo certbot --nginx -d your-domain.com

# Follow the prompts
# Certbot will automatically update your Nginx config

# Test auto-renewal
sudo certbot renew --dry-run
```

**Update Nginx config to use your domain:**
```bash
sudo nano /etc/nginx/sites-available/aroha-app
# Change server_name from IP to your-domain.com
```

## Common Commands for Management

```bash
# View app logs
pm2 logs aroha-app

# Restart app
pm2 restart aroha-app

# Stop app
pm2 stop aroha-app

# View app status
pm2 status

# Monitor app in real-time
pm2 monit

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Updating Your App

When you make changes in Replit:

```bash
# Download new zip from Replit
# Upload to Azure VM using SCP:
scp -r * azureuser@YOUR_AZURE_IP:/var/www/aroha-app/

# SSH into Azure VM
ssh azureuser@YOUR_AZURE_IP

# Navigate to app directory
cd /var/www/aroha-app

# Install any new dependencies
npm install

# Rebuild
npm run build

# Restart app
pm2 restart aroha-app

# Check logs
pm2 logs aroha-app --lines 50
```

## Troubleshooting

### App won't start
```bash
# Check PM2 logs for errors
pm2 logs aroha-app --lines 100

# Check if port 5000 is already in use
sudo lsof -i :5000

# Try restarting
pm2 delete aroha-app
pm2 start npm --name "aroha-app" -- run dev
```

### Can't access from browser
```bash
# Check if app is running
pm2 status

# Check Nginx is running
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check Azure firewall rules in portal
```

### Database connection errors
```bash
# Test database connection
psql "$DATABASE_URL"

# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Try pushing schema again
npx drizzle-kit push:pg
```

### Voice/WebRTC not working
- **HTTPS Required**: WebRTC needs HTTPS in production
  - Get a domain name
  - Use Let's Encrypt (free SSL)
- Check browser console for errors (F12)
- Verify OPENAI_API_KEY is correct
- Check if microphone permission is granted

### Google Maps not loading
- Verify VITE_GOOGLE_MAPS_API_KEY in .env
- Ensure key starts with `VITE_`
- Check these APIs are enabled in Google Cloud Console:
  - Maps JavaScript API
  - Places API
  - Directions API
  - Geocoding API

## Azure-Specific Tips

**Save Money:**
- Stop VM when not in use: Azure Portal → VM → Stop
- Use B1s size for development ($7-10/month)
- Use auto-shutdown feature in Azure

**Backups:**
- Enable Azure Backup for your VM
- Or manually backup: `sudo tar -czf backup.tar.gz /var/www/aroha-app`

**Monitoring:**
- Enable Azure Monitor
- Or use: `pm2 install pm2-logrotate`

**Static IP:**
- Configure static IP in Azure to prevent IP changes
- Networking → Public IP → Configuration → Static

## Cost Estimate (Azure)

- **VM (B1s)**: ~$7-10/month
- **Database (Neon free tier)**: $0
- **Bandwidth**: Usually free for moderate usage
- **Total**: ~$7-10/month

Plus pay-per-use:
- OpenAI Realtime API: ~$0.06/minute
- Google Maps: Free (28k loads/month)

---

## 🎉 You're Done!

Your app is now running on Azure! Access it at: `http://YOUR_AZURE_IP`

Questions? Check the logs with `pm2 logs aroha-app` or Nginx logs.

**Next steps:**
1. Get a domain name for HTTPS
2. Setup SSL with Let's Encrypt
3. Configure auto-backups
4. Test all features thoroughly

Enjoy your self-hosted voice & map application! 🚀
