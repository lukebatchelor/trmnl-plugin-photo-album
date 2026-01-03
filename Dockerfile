FROM oven/bun:1 AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copy root package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy frontend package files
COPY frontend/package.json frontend/bun.lock ./frontend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN bun install --frozen-lockfile

# Copy all source files
WORKDIR /app
COPY . .

# Build the frontend
WORKDIR /app/frontend
ENV NODE_ENV=production
RUN bun run build

# Build the server
WORKDIR /app
ENV NODE_ENV=production
RUN bun build --target=bun index.ts --outfile=server.js

# Final stage
FROM oven/bun:1 as final

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json for production dependencies (if any are added later)
COPY --from=builder /app/package.json /app/package.json

# Create necessary directories for image storage
RUN mkdir -p /app/album /app/frontend/dist

# Copy built server and frontend assets
COPY --from=builder /app/server.js /app/server.js
COPY --from=builder /app/frontend/dist /app/frontend/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Run the server
CMD ["bun", "./server.js"]
