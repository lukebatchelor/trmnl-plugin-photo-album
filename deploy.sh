#!/bin/zsh
set -e

# Configuration
REGISTRY="lbatch-nuc12.local:5000"
IMAGE_NAME="trmnl-plugin-photo-album"
TAG="${1:-latest}"

echo "🏗️  Building Docker image for linux/amd64..."
docker build --platform linux/amd64 -t "${IMAGE_NAME}:${TAG}" .

echo "🏷️  Tagging image for registry..."
docker tag "${IMAGE_NAME}:${TAG}" "${REGISTRY}/${IMAGE_NAME}:${TAG}"

echo "📤 Pushing to registry at ${REGISTRY}..."
docker push "${REGISTRY}/${IMAGE_NAME}:${TAG}"

echo "✅ Successfully pushed ${REGISTRY}/${IMAGE_NAME}:${TAG}"
echo ""

echo "🚀 Deploying to server..."
ssh lbatch@lbatch-nuc12.local 'cd ~/services/trmnl-plugin-photo-album && docker compose pull && docker compose up -d'

echo ""
echo "✅ Deployment complete!"
