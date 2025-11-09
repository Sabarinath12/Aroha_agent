# Self-Hosting - Your Next Steps 🚀

Your backup is ready! Here's exactly what to do next:

## ✅ What's Been Done

1. ✓ Backup created in `backup_20251108_110344/` folder
2. ✓ Environment variables saved
3. ✓ Configuration files backed up
4. ✓ Quick start guide created

## 📥 Step 1: Download Everything from Replit

**Download this project:**
1. Click on the three dots (⋮) in the file explorer
2. Select "Download as zip"
3. Save to your computer (approximately 50-100 MB)

## 💰 Step 2: Choose Your Hosting Provider

**Recommended Budget-Friendly Options:**

| Provider | Cost/Month | RAM | Notes |
|----------|-----------|-----|-------|
| **Hetzner Cloud** | €4.51 (~$5) | 2GB | Best value, EU based |
| **DigitalOcean** | $6 | 1GB | Very popular, easy to use |
| **Vultr** | $6 | 1GB | Good performance |
| **Oracle Cloud** | FREE | 1GB | Always free tier (limited) |
| **AWS Lightsail** | $3.50 | 512MB | Minimal but works |

**My Recommendation:** Start with **Hetzner Cloud** (best value) or **DigitalOcean** (easiest for beginners).

## 🖥️ Step 3: Create Your Server

### For DigitalOcean (Example):

1. Go to https://www.digitalocean.com/
2. Sign up and add payment method
3. Click "Create" → "Droplets"
4. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($6/month)
   - **Datacenter**: Choose closest to your users
   - **SSH Key**: Create and add your SSH key
5. Click "Create Droplet"
6. Wait ~60 seconds for server to be ready
7. Note the IP address (e.g., 192.168.1.100)

### For Hetzner Cloud:

1. Go to https://www.hetzner.com/cloud
2. Create account
3. Create new project
4. Add server:
   - **Location**: Choose closest to you
   - **Image**: Ubuntu 22.04
   - **Type**: CX11 (2GB RAM, €4.51/month)
   - **SSH Key**: Add your SSH key
5. Create and save IP address

## 🔧 Step 4: Setup Your Server (5-10 minutes)

**SSH into your server:**
```bash
ssh root@YOUR_SERVER_IP
```

**Run these commands one by one:**

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 and Nginx
npm install -g pm2
apt install -y nginx

# Create app directory
mkdir -p /var/www/aroha-app
cd /var/www/aroha-app
```

## 📤 Step 5: Upload Your Project

**From your local computer:**

```bash
# Extract the ZIP you downloaded from Replit
unzip aroha-map-app.zip

# Upload to server (replace YOUR_SERVER_IP)
scp -r aroha-map-app/* root@YOUR_SERVER_IP:/var/www/aroha-app/
```

## ⚙️ Step 6: Configure and Start

**Back on your server (SSH):**

```bash
cd /var/www/aroha-app

# Install dependencies
npm install

# Create environment file
nano .env
```

**Copy this into .env and update the values:**
```env
DATABASE_URL=your_database_url_here
OPENAI_API_KEY=your_openai_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
NODE_ENV=production
PORT=5000
```

**Save and continue:**
```bash
# Build the app
npm run build

# Push database schema
npx drizzle-kit push:pg

# Start with PM2
pm2 start npm --name aroha -- run dev
pm2 save
pm2 startup
# ^ Follow the command it gives you

# Configure Nginx
nano /etc/nginx/sites-available/aroha
```

**Paste this Nginx config:**
```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Finish setup:**
```bash
# Enable site
ln -s /etc/nginx/sites-available/aroha /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx

# Open firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable
```

## 🎉 Step 7: Test Your App

Open your browser and go to:
```
http://YOUR_SERVER_IP
```

You should see your Aroha app running!

## 🔒 Optional: Add HTTPS (Recommended)

If you have a domain name:

```bash
# Install certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
certbot --nginx -d your-domain.com

# Follow the prompts
```

## 📊 Cost Summary

**Monthly Costs:**
- VPS Server: $5-6
- Database (Neon free tier): $0
- Domain (optional): ~$1/month
- SSL Certificate: $0 (Let's Encrypt)
- **Total: ~$5-6/month**

**Plus API Usage:**
- OpenAI Realtime API: ~$0.06/minute of audio
- Google Maps: Free (up to 28,000 loads/month)

## 🆘 Troubleshooting

**App won't start?**
```bash
pm2 logs aroha
pm2 restart aroha
```

**Can't access from browser?**
```bash
# Check if app is running
pm2 status

# Check Nginx
systemctl status nginx

# Check firewall
ufw status
```

**Database connection issues?**
- Verify your DATABASE_URL in .env
- Check Neon dashboard to ensure database is active
- Make sure you ran `npx drizzle-kit push:pg`

## 📚 Full Documentation

For more detailed instructions, see:
- `BACKUP_AND_SELFHOST_GUIDE.md` - Complete guide
- `backup_20251108_110344/QUICK_START.md` - Quick reference
- `backup_20251108_110344/API_KEYS_CHECKLIST.md` - API keys needed

## 🎯 Next Steps After Deployment

1. Test all features (voice, map, directions)
2. Monitor logs: `pm2 logs aroha`
3. Setup automatic backups of your database
4. Consider getting a domain name
5. Add HTTPS with Let's Encrypt

---

**Questions?** Everything you need is in the backup folder and the detailed guide!

**Ready to save money?** Let's get you self-hosted! 💪
