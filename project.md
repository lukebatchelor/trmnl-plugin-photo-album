# Project Overview

## Description

Photo album web application for uploading, viewing, and managing images. Built with Bun backend and Vite frontend.

## Features

- Upload images via drag-and-drop or file picker
- View uploaded images with thumbnails and metadata
- Delete single or multiple images
- Serve random image endpoint for external use

## Architecture

### Backend (Bun)

Server handles:
- Image uploads and storage
- File serving and deletion
- Image metadata (size, upload date)
- Static frontend assets in production

### Frontend (Vite + TypeScript)

Single-page application with:
- Image upload interface with filename validation
- Image gallery with expandable list
- Bulk selection and deletion
- Responsive design

### Development vs Production

**Development:**
- Frontend: Vite dev server on port 5173
- Backend: Bun server on port 3000
- Vite proxy forwards API requests to backend
- Hot module replacement for frontend changes

**Production:**
- Backend serves built frontend from `frontend/dist/`
- All assets and API on same origin
- No CORS configuration needed

## Project Structure

```
/
├── index.ts              # Backend server
├── frontend/
│   ├── src/
│   │   ├── main.ts       # Frontend application logic
│   │   └── style.css     # Styles
│   ├── index.html        # HTML template
│   ├── vite.config.ts    # Vite configuration
│   └── dist/             # Built assets (production)
├── album/                # Uploaded images storage
├── Dockerfile            # Multi-stage Docker build
└── docker-compose.yml    # Docker deployment
```

## API Endpoints

- `POST /upload` - Upload image
- `GET /images` - List all images with metadata
- `GET /image/:filename` - Serve specific image
- `GET /random` - Serve random image
- `POST /delete` - Delete images by filename

## Security

- Path traversal protection for file serving
- Filename validation (alphanumeric, dashes, underscores only)
- Directory boundary checks for uploads and static files
- Automatic filename sanitization

## Environment Variables

- `PORT` - Server port (default: 3000)
- `BASE_URL` - Full URL for image URLs in API responses and dev proxy configuration
