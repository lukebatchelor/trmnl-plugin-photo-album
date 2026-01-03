# trmnl-plugin-photo-album

Photo album web application for uploading, viewing, and managing images.

## Features

- Upload images via web interface
- View thumbnails with metadata
- Delete single or multiple images

## Getting Started

### Local Development

```bash
bun install
bun run index.ts
```

### Docker

```bash
docker compose up -d
```

Server runs on `http://localhost:3000`

## Environment Variables

- `PORT` - Server port (default: 3000)
- `BASE_URL` - Base URL for the application (default: `http://localhost:PORT`)

Images are stored in the `./album` directory.
