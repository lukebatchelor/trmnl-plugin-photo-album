FROM oven/bun:1 AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build the server
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
RUN mkdir -p /app/static /app/album

# Copy built server and static assets
COPY --from=builder /app/server.js /app/server.js
COPY --from=builder /app/static /app/static

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Run the server
CMD ["bun", "./server.js"]
