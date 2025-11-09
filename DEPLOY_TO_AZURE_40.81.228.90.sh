#!/bin/bash

# Aroha App - Azure VM Deployment Script
# VM: Standard B4as v2 (4 vcpus, 16 GiB memory)
# IP: 40.81.228.90

echo "=========================================="
echo "Aroha App - Azure Deployment"
echo "IP: 40.81.228.90"
echo "=========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running on Azure VM or local computer
if [ -f /etc/azure/vm-id ] || [ -f /var/lib/waagent/provisioned ] || hostname | grep -q "azure"; then
    echo -e "${GREEN}✓ Running on Azure VM${NC}"
    ON_AZURE=true
else
    echo -e "${YELLOW}ℹ Running on local computer${NC}"
    ON_AZURE=false
fi

if [ "$ON_AZURE" = true ]; then
    echo ""
    echo "=========================================="
    echo "STEP 1: Installing Required Software"
    echo "=========================================="
    
    # Update system
    echo -e "${YELLOW}→ Updating system packages...${NC}"
    sudo apt update -qq
    
    # Install Node.js 20
    if ! command -v node &> /dev/null; then
        echo -e "${YELLOW}→ Installing Node.js 20...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null 2>&1
        sudo apt install -y nodejs -qq
        echo -e "${GREEN}✓ Node.js installed: $(node --version)${NC}"
    else
        echo -e "${GREEN}✓ Node.js already installed: $(node --version)${NC}"
    fi
    
    # Install PM2
    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}→ Installing PM2...${NC}"
        sudo npm install -g pm2 > /dev/null 2>&1
        echo -e "${GREEN}✓ PM2 installed${NC}"
    else
        echo -e "${GREEN}✓ PM2 already installed${NC}"
    fi
    
    # Install Nginx
    if ! command -v nginx &> /dev/null; then
        echo -e "${YELLOW}→ Installing Nginx...${NC}"
        sudo apt install -y nginx -qq
        echo -e "${GREEN}✓ Nginx installed${NC}"
    else
        echo -e "${GREEN}✓ Nginx already installed${NC}"
    fi
    
    echo ""
    echo "=========================================="
    echo "STEP 2: Creating Application Directory"
    echo "=========================================="
    
    # Create app directory
    sudo mkdir -p /var/www/aroha-app
    sudo chown -R $USER:$USER /var/www/aroha-app
    echo -e "${GREEN}✓ Directory created: /var/www/aroha-app${NC}"
    
    echo ""
    echo "=========================================="
    echo "STEP 3: Next Steps - Upload Your Files"
    echo "=========================================="
    echo ""
    echo "From your LOCAL computer, run this command:"
    echo ""
    echo -e "${YELLOW}cd /path/to/extracted/replit/project${NC}"
    echo -e "${YELLOW}scp -r * azureuser@40.81.228.90:/var/www/aroha-app/${NC}"
    echo ""
    echo "After uploading files, run this script again to continue setup!"
    echo ""
    
else
    echo ""
    echo "=========================================="
    echo "Upload Project Files to Azure VM"
    echo "=========================================="
    echo ""
    echo "Run this command from your project directory:"
    echo ""
    echo -e "${YELLOW}scp -r * azureuser@40.81.228.90:/var/www/aroha-app/${NC}"
    echo ""
    echo "Or if using SSH key:"
    echo -e "${YELLOW}scp -i /path/to/key.pem -r * azureuser@40.81.228.90:/var/www/aroha-app/${NC}"
    echo ""
    echo "Then SSH into the VM and continue:"
    echo -e "${YELLOW}ssh azureuser@40.81.228.90${NC}"
    echo ""
fi
