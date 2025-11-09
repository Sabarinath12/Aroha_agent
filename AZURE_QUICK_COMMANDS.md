# Azure VM Deployment - Quick Command Reference

Copy and paste these commands in order. **Update values in CAPS with your actual details.**

## 🔗 Step 1: Connect to Azure VM

```bash
ssh azureuser@YOUR_AZURE_IP
# Or with key: ssh -i /path/to/key.pem azureuser@YOUR_AZURE_IP
```

## 📦 Step 2: Install Software (Run Once)

```bash
# Update and install everything
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/aroha-app
sudo chown -R $USER:$USER /var/www/aroha-app
cd /var/www/aroha-app
```

## 📤 Step 3: Upload Files (From Your Computer)

**Open NEW terminal on your local computer:**

```bash
# Navigate to extracted Replit download
cd /path/to/extracted/project

# Upload to Azure (replace YOUR_AZURE_IP)
scp -r * azureuser@YOUR_AZURE_IP:/var/www/aroha-app/
```

## ⚙️ Step 4: Configure Environment (On Azure VM)

```bash
cd /var/www/aroha-app

# Create .env file
cat > .env << 'EOF'
DATABASE_URL=YOUR_NEON_DATABASE_URL_HERE
OPENAI_API_KEY=YOUR_OPENAI_KEY_HERE
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_KEY_HERE
NODE_ENV=production
PORT=5000
EOF

# Edit with your actual values
nano .env
# Ctrl+O to save, Enter, Ctrl+X to exit
```

## 🏗️ Step 5: Build and Deploy

```bash
cd /var/www/aroha-app

# Install and build
npm install
npm run build

# Setup database
npx drizzle-kit push:pg

# Start with PM2
pm2 start npm --name aroha-app -- run dev
pm2 save
pm2 startup
# ^ IMPORTANT: Run the command it shows you
```

## 🌐 Step 6: Configure Nginx

```bash
# Create Nginx config
sudo cat > /etc/nginx/sites-available/aroha-app << 'EOF'
server {
    listen 80;
    server_name YOUR_AZURE_IP;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF

# Replace YOUR_AZURE_IP with actual IP
sudo nano /etc/nginx/sites-available/aroha-app

# Enable site
sudo ln -s /etc/nginx/sites-available/aroha-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 🔥 Step 7: Open Ports in Azure Portal

**In Azure Portal → Your VM → Networking → Add inbound rules:**

1. Port 80 (HTTP)
2. Port 443 (HTTPS)  
3. Port 22 (SSH) - if not already open

## ✅ Test: Open Browser

```
http://YOUR_AZURE_IP
```

---

## 🛠️ Daily Commands

```bash
# View logs
pm2 logs aroha-app

# Restart app
pm2 restart aroha-app

# Check status
pm2 status

# Monitor
pm2 monit

# Stop app
pm2 stop aroha-app
```

## 🔄 Update App

```bash
# Upload new files from local computer
scp -r * azureuser@YOUR_AZURE_IP:/var/www/aroha-app/

# On Azure VM
cd /var/www/aroha-app
npm install
npm run build
pm2 restart aroha-app
```

## 🐛 Troubleshooting

```bash
# App not working?
pm2 logs aroha-app --lines 100

# Nginx issues?
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# Start fresh
pm2 delete aroha-app
cd /var/www/aroha-app
pm2 start npm --name aroha-app -- run dev
```

## 🔒 Optional: Add HTTPS (with domain)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

**That's it!** App should be running at `http://YOUR_AZURE_IP` 🚀
