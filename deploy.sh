#!/bin/bash

# Stop and remove existing containers
docker compose -f docker-compose.prod.yml down

# Remove old builds
rm -rf apps/client/.next
rm -rf apps/server/dist

# Build and start new containers
docker compose -f docker-compose.prod.yml up --build -d
