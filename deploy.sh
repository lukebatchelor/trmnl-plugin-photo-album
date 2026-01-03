#!/bin/bash
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
echo "To deploy on your server, run:"
echo "  docker-compose pull && docker-compose up -d"
