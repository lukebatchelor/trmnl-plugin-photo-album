import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const ALBUM_DIR = "./album";
const PORT = process.env.PORT || 3000;

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

        const baseUrl = `${url.protocol}//${url.host}`;
        const imageUrls = files.map((file) => `${baseUrl}/image/${file}`);

        return new Response(JSON.stringify({ images: imageUrls }), {
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

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);