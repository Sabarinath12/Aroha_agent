# Deploy to YOUR Azure VM - Personalized Guide

**Your Azure VM Details:**
- **Public IP**: 40.81.228.90
- **VM Size**: Standard B4as v2 (4 vcpus, 16 GiB memory) 💪
- **Ports**: HTTP (80) ✓ Open

---

## 🚀 Quick Deployment (15 minutes)

### Step 1: Download Project from Replit

1. In Replit, click three dots (⋮) in file explorer
2. Select "Download as zip"
3. Save and extract to your computer

### Step 2: Connect to Your Azure VM

```bash
ssh azureuser@40.81.228.90
```

### Step 3: Install Required Software (One-Time Setup)

Copy and paste this entire block:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 and Nginx
sudo npm install -g pm2
sudo apt install -y nginx

# Verify installations
node --version   # Should show v20.x
pm2 --version    # Should show latest
nginx -v         # Should show version

# Create app directory
sudo mkdir -p /var/www/aroha-app
sudo chown -R $USER:$USER /var/www/aroha-app

echo "✅ Software installation complete!"
```

### Step 4: Upload Your Project Files

**Open a NEW terminal on your LOCAL computer** (not SSH):

```bash
# Navigate to where you extracted the Replit download
cd /path/to/your/extracted/project

# Upload everything to Azure
scp -r * azureuser@40.81.228.90:/var/www/aroha-app/
```

This will take 1-2 minutes depending on your internet speed.

### Step 5: Configure Environment Variables

**Back in your SSH session (Azure VM):**

```bash
cd /var/www/aroha-app

# Create .env file
nano .env
```

**Copy and paste this, then update YOUR actual values:**

```env
DATABASE_URL=postgresql://user:password@host/database
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_KEY_HERE
NODE_ENV=production
PORT=5000
```

**Get your actual values from:** `backup_20251108_110344/env_variables.txt`

**Save the file:**
- `Ctrl + O` (save)
- `Enter` (confirm)
- `Ctrl + X` (exit)

### Step 6: Install, Build & Deploy

```bash
cd /var/www/aroha-app

# Install dependencies (2-3 minutes)
npm install

# Build the application (1 minute)
npm run build

# Push database schema
npx drizzle-kit push:pg

# Start with PM2
pm2 start npm --name aroha-app -- run dev

# Save PM2 config
pm2 save

# Enable auto-start on reboot
pm2 startup

# ⚠️ IMPORTANT: Copy and run the command that pm2 startup shows you
```

### Step 7: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/aroha-app
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name 40.81.228.90;

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

**Save and activate:**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/aroha-app /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Should see: "test is successful"

# Restart Nginx
sudo systemctl restart nginx

# Verify it's running
sudo systemctl status nginx
```

### Step 8: Verify Ports in Azure Portal

Go to Azure Portal → Your VM → Networking → Check these ports are open:

- ✅ Port 22 (SSH)
- ✅ Port 80 (HTTP) - You said this is open!
- ⚠️ Port 443 (HTTPS) - Open this for future SSL

### Step 9: Test Your App! 🎉

Open your browser:

```
http://40.81.228.90
```

You should see your Aroha app!

---

## ✅ Verification Checklist

Test these features:
- [ ] App loads in browser
- [ ] Click microphone - voice conversation starts
- [ ] Hear Aroha speaking
- [ ] Ask about a location - map appears
- [ ] Search location works
- [ ] Get directions works
- [ ] Transportation pricing shows

---

## 🛠️ Daily Management Commands

```bash
# View app logs
pm2 logs aroha-app

# View last 50 lines
pm2 logs aroha-app --lines 50

# Restart app
pm2 restart aroha-app

# Check status
pm2 status

# Monitor in real-time
pm2 monit

# Stop app
pm2 stop aroha-app

# Start app
pm2 start aroha-app

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## 🔄 How to Update Your App Later

When you make changes in Replit:

**1. Download new version from Replit**

**2. Upload to Azure (from local computer):**
```bash
cd /path/to/new/version
scp -r * azureuser@40.81.228.90:/var/www/aroha-app/
```

**3. Rebuild and restart (on Azure VM):**
```bash
ssh azureuser@40.81.228.90
cd /var/www/aroha-app
npm install
npm run build
pm2 restart aroha-app
pm2 logs aroha-app --lines 30
```

---

## 🐛 Troubleshooting

### App not loading in browser?

```bash
# Check if app is running
pm2 status

# Should show: aroha-app | online

# Check app logs
pm2 logs aroha-app --lines 100

# Restart if needed
pm2 restart aroha-app
```

### Nginx not working?

```bash
# Test Nginx config
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### Voice/WebRTC not working?

**Problem**: Browsers require HTTPS for microphone access in production

**Solution**: You need a domain name and SSL certificate

1. Get a domain (e.g., from Namecheap, GoDaddy)
2. Point domain to 40.81.228.90
3. Install SSL certificate:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

**Temporary workaround**: Test with `http://localhost:5000` through SSH tunnel:
```bash
# On your local computer
ssh -L 5000:localhost:5000 azureuser@40.81.228.90
# Then access http://localhost:5000 in your browser
```

### Database connection error?

```bash
# Verify .env file
cat .env | grep DATABASE_URL

# Test connection
psql "$DATABASE_URL"

# Re-push schema
npx drizzle-kit push:pg
```

---

## 💰 Cost Estimate

**Your VM (Standard B4as v2)**: ~$125-140/month
- This is quite powerful! You could:
  - Run multiple apps on it
  - Or downgrade to B1s ($7-10/month) if only running this one app

**Other Costs**:
- Database (Neon free tier): $0
- Bandwidth: Included in VM price
- **Total**: ~$125-140/month (or $7-10 with B1s)

**API Usage** (pay per use):
- OpenAI Realtime API: ~$0.06/minute
- Google Maps: Free up to 28,000 loads/month

---

## 🎯 Optional: Add HTTPS (When You Get a Domain)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace yourdomain.com)
sudo certbot --nginx -d yourdomain.com

# Certbot will:
# 1. Verify you own the domain
# 2. Get SSL certificate from Let's Encrypt (free)
# 3. Update Nginx config automatically
# 4. Setup auto-renewal

# Test auto-renewal
sudo certbot renew --dry-run
```

Then update Nginx config:
```bash
sudo nano /etc/nginx/sites-available/aroha-app
# Change: server_name 40.81.228.90;
# To: server_name yourdomain.com;

sudo nginx -t
sudo systemctl restart nginx
```

---

## 📊 Your VM Resources

With 16GB RAM and 4 vCPUs, you have plenty of power!

**Current usage:**
```bash
# Check memory
free -h

# Check CPU
htop

# Check disk space
df -h

# Check processes
pm2 monit
```

You could easily run 5-10 Node.js apps on this VM!

---

## 🎉 You're All Set!

Your app should be running at:
```
http://40.81.228.90
```

**Next Steps:**
1. Test all features
2. Consider getting a domain for HTTPS
3. Setup Azure Backup
4. Monitor with `pm2 monit`

Need help? Check the logs:
```bash
pm2 logs aroha-app
```

Enjoy your self-hosted Aroha app! 🚀
