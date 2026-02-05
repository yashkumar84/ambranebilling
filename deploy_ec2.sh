#!/bin/bash
# Ambrane Billing - EC2 Setup & Deployment Script
# This script automates the installation of Docker, Certbot, and the deployment of the application.

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Ambrane Billing EC2 Setup ===${NC}"

# 1. Update and Install Dependencies
echo -e "${GREEN}[1/6] Installing Docker, Docker Compose V2, and Certbot...${NC}"
sudo apt update
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
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin git certbot

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
echo -e "${GREEN}[5/6] Setting up environment variables...${NC}"
if [ ! -f ".env" ]; then
    echo "Creating .env from template..."
    # You might want to customize this part to accurately reflect your needs
    cp ./backend/.env.example .env || echo "No .env.example found in backend/"
    
    # Generate a random JWT secret
    JWT_SECRET=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32 ; echo '')
    echo "JWT_SECRET=$JWT_SECRET" >> .env
    echo "NEXT_PUBLIC_API_URL=https://$DOMAIN" >> .env
    echo "CORS_ORIGIN=https://$DOMAIN" >> .env
fi

# 7. Run Docker Compose
echo -e "${GREEN}[6/6] Launching application with Docker Compose...${NC}"
sudo docker compose up -d --build

echo -e "${BLUE}=== Deployment Complete! ===${NC}"
echo -e "Your application should now be accessible at: ${GREEN}https://$DOMAIN${NC}"
echo -e "Note: If this is your first time running Docker, you may need to logout and login for group changes to take effect without 'sudo'."
