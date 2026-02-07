#!/bin/bash
# Ambrane Billing - EC2 Setup & Deployment Script
# This script automates the installation of Docker, Certbot, and the deployment of the application.

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Ambrane Billing EC2 Setup ===${NC}"

# 0. Setup Swap Space (Prevents build hangs on small EC2 instances)
echo -e "${GREEN}[0/6] Checking for Swap Space...${NC}"
if [ $(free -m | grep Swap | awk '{print $2}') -eq 0 ]; then
    echo "No swap space found. Creating 2GB swap file..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap space created successfully."
else
    echo "Swap space already exists."
fi

# 1. Update and Install Dependencies
echo -e "${GREEN}[1/6] Installing Docker, Docker Compose V2, and Certbot...${NC}"
sudo apt update

if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing..."
    sudo apt install -y ca-certificates curl gnupg
    
    # Add Docker's official GPG key
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    # Add the repository to Apt sources
    echo \
      "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
    echo "Docker is already installed. Skipping repository setup."
fi

sudo apt install -y git certbot

# 2. Setup Docker permissions
echo -e "${GREEN}[2/6] Setting up Docker permissions...${NC}"
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# 3. Prompt for Domain
echo -e "${BLUE}Please enter your domain name [default: ambranelabs.com]:${NC}"
read input_domain
DOMAIN=${input_domain:-ambranelabs.com}

# 4. Generate SSL Certificates
echo -e "${GREEN}[3/6] Generating SSL certificates for $DOMAIN...${NC}"
# Note: This requires Port 80 to be open and pointed to this instance.
sudo certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# 5. Update Nginx Configuration
echo -e "${GREEN}[4/6] Updating Nginx configuration...${NC}"
# Use sed to replace 'your-domain.com' with the actual domain in nginx/default.conf
sed -i "s/your-domain.com/$DOMAIN/g" ./nginx/default.conf

# 6. Setup Environment Variables
echo -e "${GREEN}[5/6] Setting up environment variables for $DOMAIN...${NC}"
if [ ! -f ".env" ]; then
    echo "Creating .env from template..."
    cp ./backend/.env.example .env || touch .env
    
    # Generate a random JWT secret if not present
    JWT_SECRET=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32 ; echo '')
    echo "JWT_SECRET=$JWT_SECRET" >> .env
fi

# Ensure domain-specific variables are correct (overwrite or append)
# We use a temporary file to avoid complex sed patterns for existing keys
grep -vE "^(NEXT_PUBLIC_API_URL|CORS_ORIGIN)=" .env > .env.tmp || true
echo "NEXT_PUBLIC_API_URL=https://$DOMAIN" >> .env.tmp
echo "CORS_ORIGIN=https://$DOMAIN" >> .env.tmp
mv .env.tmp .env

# 7. Run Docker Compose
echo -e "${GREEN}[6/7] Launching application with Docker Compose...${NC}"
sudo docker compose up -d --build

# Wait for services to be ready
echo -e "${GREEN}Waiting for services to start...${NC}"
sleep 15

# 8. Setup Production Tenant
echo -e "${GREEN}[7/7] Setting up production tenant with menu items...${NC}"
if [ -f "./backend/setup_production_tenant.sh" ]; then
    # Set the backend URL to use the domain
    export BACKEND_URL="https://$DOMAIN"
    
    # Run the tenant setup script
    cd backend
    chmod +x setup_production_tenant.sh
    ./setup_production_tenant.sh
    cd ..
    
    echo -e "${GREEN}✅ Production tenant created successfully!${NC}"
    echo -e "${BLUE}Login credentials:${NC}"
    echo -e "  Email: hello@ambrane.com"
    echo -e "  Password: 1@AmbraneLabs"
else
    echo -e "${BLUE}⚠️  Tenant setup script not found. Skipping tenant creation.${NC}"
fi

echo -e "${BLUE}=== Deployment Complete! ===${NC}"
echo -e "Your application should now be accessible at: ${GREEN}https://$DOMAIN${NC}"
echo -e "Note: If this is your first time running Docker, you may need to logout and login for group changes to take effect without 'sudo'."
