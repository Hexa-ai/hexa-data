# Installation script for Hexa-Data

# Run this command to install Hexa-Data
# curl -sSL https://raw.githubusercontent.com/MaximeMRF/test-autoinstall/main/install.sh | bash

# Script begin here

# Get the .env file
curl -o .env https://raw.githubusercontent.com/MaximeMRF/test-autoinstall/main/.env.install

# Get the conf file for warpfleet
curl -O https://raw.githubusercontent.com/MaximeMRF/test-autoinstall/main/conf.json

# Get the dockerfile for warpfleet
curl -O https://raw.githubusercontent.com/MaximeMRF/test-autoinstall/main/dockerfile-wfs

# Get the docker-compose file
curl -O https://raw.githubusercontent.com/MaximeMRF/test-autoinstall/main/docker-compose.yml

# Run the docker-compose file in background
docker-compose up -d