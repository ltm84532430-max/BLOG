import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("blog.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS journal (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/posts", (req, res) => {
    const category = req.query.category;
    let posts;
    if (category && category !== 'All') {
      posts = db.prepare("SELECT * FROM posts WHERE category = ? ORDER BY created_at DESC").all(category);
    } else {
      posts = db.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
    }
    res.json(posts);
  });

  app.post("/api/posts", (req, res) => {
    const { title, content, category } = req.body;
    const result = db.prepare("INSERT INTO posts (title, content, category) VALUES (?, ?, ?)").run(title, content, category || 'General');
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/posts/:id", (req, res) => {
    db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/journal", (req, res) => {
    const entries = db.prepare("SELECT * FROM journal ORDER BY created_at DESC").all();
    res.json(entries);
  });

  app.post("/api/journal", (req, res) => {
    const { content } = req.body;
    const result = db.prepare("INSERT INTO journal (content) VALUES (?)").run(content);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/journal/:id", (req, res) => {
    db.prepare("DELETE FROM journal WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
