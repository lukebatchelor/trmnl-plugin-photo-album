import { mkdir, stat, unlink } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const ALBUM_DIR = "./album";
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Ensure album directory exists
if (!existsSync(ALBUM_DIR)) {
  await mkdir(ALBUM_DIR, { recursive: true });
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Serve upload page
    if (path === "/" && req.method === "GET") {
      return new Response(await Bun.file("./static/index.html").text(), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Upload image endpoint
    if (path === "/upload" && req.method === "POST") {
      try {
        const formData = await req.formData();
        const file = formData.get("image") as File;

        if (!file) {
          return new Response("No image provided", { status: 400 });
        }

        // Save file to album directory
        const filename = file.name;
        const filepath = join(ALBUM_DIR, filename);
        await Bun.write(filepath, file);

        return new Response(JSON.stringify({ success: true, filename }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response("Upload failed", { status: 500 });
      }
    }

    // List all images endpoint
    if (path === "/images" && req.method === "GET") {
      try {
        const files = await Array.fromAsync(
          new Bun.Glob("*.{jpg,jpeg,png,gif,webp}").scan({
            cwd: ALBUM_DIR,
          })
        );

        // Get file stats for each image
        const imagesWithStats = await Promise.all(
          files.map(async (file) => {
            const filepath = join(ALBUM_DIR, file);
            const stats = await stat(filepath);
            return {
              filename: file,
              url: `${BASE_URL}/image/${file}`,
              uploadedAt: stats.mtime.toISOString(),
              size: stats.size,
            };
          })
        );

        // Sort by upload time descending (newest first)
        imagesWithStats.sort((a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );

        return new Response(JSON.stringify({ images: imagesWithStats }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response("Failed to list images", { status: 500 });
      }
    }

    // Serve specific image endpoint
    if (path.startsWith("/image/") && req.method === "GET") {
      const filename = path.slice("/image/".length);
      const filepath = join(ALBUM_DIR, filename);

      if (!existsSync(filepath)) {
        return new Response("Image not found", { status: 404 });
      }

      const file = Bun.file(filepath);
      return new Response(file);
    }

    // Serve random image endpoint
    if (path === "/random" && req.method === "GET") {
      try {
        const files = await Array.fromAsync(
          new Bun.Glob("*.{jpg,jpeg,png,gif,webp}").scan({
            cwd: ALBUM_DIR,
          })
        );

        if (files.length === 0) {
          return new Response("No images available", { status: 404 });
        }

        const randomFile = files[Math.floor(Math.random() * files.length)];
        const filepath = join(ALBUM_DIR, randomFile);
        const file = Bun.file(filepath);

        return new Response(file);
      } catch (error) {
        return new Response("Failed to get random image", { status: 500 });
      }
    }

    // Delete images endpoint
    if (path === "/delete" && req.method === "POST") {
      try {
        const body = await req.json();
        const filenames = body.filenames;

        if (!Array.isArray(filenames) || filenames.length === 0) {
          return new Response("No filenames provided", { status: 400 });
        }

        // Delete each file
        const results = await Promise.allSettled(
          filenames.map(async (filename) => {
            const filepath = join(ALBUM_DIR, filename);

            // Security check: ensure the path is within ALBUM_DIR
            if (!filepath.startsWith(ALBUM_DIR)) {
              throw new Error("Invalid filename");
            }

            if (existsSync(filepath)) {
              await unlink(filepath);
              return { filename, deleted: true };
            } else {
              return { filename, deleted: false, error: "File not found" };
            }
          })
        );

        const deletedFiles = results.map((result) =>
          result.status === "fulfilled" ? result.value : { error: result.reason }
        );

        return new Response(JSON.stringify({ results: deletedFiles }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response("Delete failed", { status: 500 });
      }
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);