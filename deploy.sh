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

# Prepare the deploy command
DEPLOY_CMD="ssh lbatch@lbatch-nuc12.local 'cd ~/services/trmnl-plugin-photo-album && docker compose pull && docker compose up -d'"

echo "📋 Next step: Deploy to server"
echo ""
echo "Run this command to deploy:"
echo "  ${DEPLOY_CMD}"
echo ""
echo "Command copied to clipboard - paste and run!"

# Copy to clipboard for easy pasting
echo -n "${DEPLOY_CMD}" | pbcopy
