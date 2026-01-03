#!/bin/zsh
set -e

# Configuration
REGISTRY="lbatch-nuc12.local:5000"
IMAGE_NAME="trmnl-plugin-photo-album"
TAG="${1:-latest}"
REMOTE_HOST="lbatch@lbatch-nuc12.local"
REMOTE_PATH="/home/lbatch/services/trmnl-plugin-photo-album"

echo "🏗️  Building Docker image for linux/amd64..."
docker build --platform linux/amd64 -t "${IMAGE_NAME}:${TAG}" .

echo "🏷️  Tagging image for registry..."
docker tag "${IMAGE_NAME}:${TAG}" "${REGISTRY}/${IMAGE_NAME}:${TAG}"

echo "📤 Pushing to registry at ${REGISTRY}..."
docker push "${REGISTRY}/${IMAGE_NAME}:${TAG}"

echo "✅ Successfully pushed ${REGISTRY}/${IMAGE_NAME}:${TAG}"
echo ""

echo "📋 Syncing config files to server..."
scp Caddyfile docker-compose.yml "${REMOTE_HOST}:${REMOTE_PATH}/"

echo "🚀 Deploying to server..."
ssh "${REMOTE_HOST}" "cd ${REMOTE_PATH} && docker compose pull && docker compose up -d"

echo ""
echo "✅ Deployment complete!"
