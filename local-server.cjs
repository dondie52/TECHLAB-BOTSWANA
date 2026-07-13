const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const port = Number(process.argv[2] || 8080);
const host = "127.0.0.1";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://${host}:${port}`);
    let pathname = decodeURIComponent(url.pathname);

    if (pathname === "/") {
      pathname = "/index.html";
    }

    const filePath = path.resolve(root, `.${pathname}`);

    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found");
        return;
      }

      res.writeHead(200, {
        "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      });
      res.end(data);
    });
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Server error");
  }
});

server.listen(port, host, () => {
  console.log(`TechLab local server running at http://${host}:${port}/`);
});
