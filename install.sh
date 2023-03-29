# Installation script for Hexa-Data

# curl -sSL https://raw.githubusercontent.com/MaximeMRF/test-autoinstall/main/install.sh | bash

# Get the .env file
curl -o .env https://raw.githubusercontent.com/Hexa-ai/hexa-data/master/.env.example

# Get the conf file for warpfleet
curl -O https://raw.githubusercontent.com/Hexa-ai/hexa-data/master/conf.json

# Get the dockerfile for warpfleet
curl -O https://raw.githubusercontent.com/Hexa-ai/hexa-data/master/dockerfile-wfs

# Get the docker-compose file
curl -O https://raw.githubusercontent.com/Hexa-ai/hexa-data/master/docker-compose.yml

# Run the docker-compose file in background
docker-compose up -d
