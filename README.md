# trmnl-plugin-photo-album

Photo album web application for uploading, viewing, and managing images.

## Features

- Upload images via web interface
- View thumbnails with metadata
- Delete single or multiple images

## Getting Started

### Local Development

**Backend:**
```bash
bun install
bun run index.ts
```

**Frontend (in a separate terminal):**
```bash
cd frontend
bun install
bun run dev
```

The frontend dev server runs on `http://localhost:5173` with proxy to backend on `http://localhost:3000`

### Production Build

Build the frontend:
```bash
cd frontend
bun run build
```

Then run the backend (it will serve the built frontend):
```bash
bun run index.ts
```

Server runs on `http://localhost:3000`

### Docker

```bash
docker compose up -d
```

Docker automatically builds the frontend and serves it from the backend

## Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

- `PORT` - Server port (default: 3000)
- `BASE_URL` - Base URL for the application (default: `http://localhost:PORT`)
  - Used by backend to generate image URLs
  - Used by frontend dev server proxy configuration

Images are stored in the `./album` directory.

## Project Structure

- `/frontend` - Vite-based frontend application
  - In development: runs on port 5173 with proxy to backend
  - In production: built to `frontend/dist/` and served by backend
- `/index.ts` - Backend server (Bun)
- `/album` - Image storage directory

## How It Works

### Development Mode
- **Frontend**: Vite dev server runs on `http://localhost:5173`
- **Backend**: Bun server runs on `http://localhost:3000` (or value from `.env`)
- **Requests**: Frontend uses relative URLs (`/upload`, `/images`, etc.)
  - Vite's proxy intercepts these and forwards them to the backend
  - Same-origin: no CORS issues

### Production Mode
- **Frontend**: Built static assets served from backend at `frontend/dist/`
- **Backend**: Serves both frontend and API from same origin
- **Requests**: Frontend uses the same relative URLs (`/upload`, `/images`, etc.)
  - Requests go directly to backend (same domain)
  - Same-origin: no CORS issues

In both modes, the frontend always uses relative URLs since it's always on the same domain as the backend (either via proxy in dev or same server in prod).
