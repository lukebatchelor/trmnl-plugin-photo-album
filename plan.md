# TRMNL Photo Album Plugin Plan

## Overview
A minimal Bun server for serving random images from a photo album upload directory.

## Features

### 1. Upload Interface
- Simple HTML webpage for uploading images
- User-friendly form interface

### 2. API Endpoints
- **POST /upload** - Upload new images to the album
- **GET /images** - List URLs of all available images
- **GET /image/:filename** - Serve a specific image
- **GET /random** - Serve a random image from the album

## Technical Stack
- Runtime: Bun
- Storage: File system (upload directory)
- No database required

## Deployment
- Docker containerized
- Will use provided template when ready

## File Structure
```
/album            - Image storage directory (mounted volume for Docker)
/src
  server.ts       - Main server file
  routes/         - Endpoint handlers
  static/         - Upload webpage
Dockerfile        - Container configuration
```

## Notes
- Images stored in `./album` directory for Docker volume mounting
- Album directory will persist data outside container
