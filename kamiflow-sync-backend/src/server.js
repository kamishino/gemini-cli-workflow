const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const db = require("./database");
const auth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "50mb" }));

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGINS === "*" ? "*" : process.env.CORS_ORIGINS?.split(","),
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/v1/", limiter);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    version: "1.0.0",
    uptime: process.uptime(),
  });
});

// API Routes
app.post("/v1/projects/:projectId/sync", auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { files, deletions } = req.body;

    if (!Array.isArray(files)) {
      return res.status(400).json({ error: "Invalid files array" });
    }

    let synced = 0;
    let deleted = 0;

    // Process file uploads
    for (const file of files) {
      db.upsertFile(projectId, file.path, file.content, file.checksum, file.modified, file.size);
      synced++;
    }

    // Process deletions
    if (Array.isArray(deletions)) {
      for (const filePath of deletions) {
        db.deleteFile(projectId, filePath);
        deleted++;
      }
    }

    res.json({ synced, deleted, conflicts: [] });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ error: "Sync failed" });
  }
});

app.get("/v1/projects/:projectId/files", auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const since = parseInt(req.query.since) || 0;

    const files = db.getFilesSince(projectId, since);

    res.json({
      files: files.map(f => ({
        path: f.path,
        content: f.content,
        checksum: f.checksum,
        modified: f.modified,
        size: f.size,
      })),
      hasMore: false,
    });
  } catch (error) {
    console.error("Pull error:", error);
    res.status(500).json({ error: "Pull failed" });
  }
});

app.get("/v1/projects/:projectId/status", auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const stats = db.getProjectStats(projectId);

    res.json({
      lastSync: stats.lastSync,
      fileCount: stats.fileCount,
    });
  } catch (error) {
    console.error("Status error:", error);
    res.status(500).json({ error: "Status failed" });
  }
});

app.delete("/v1/projects/:projectId", auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const deleted = db.deleteProject(projectId);

    res.json({ deleted });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Delete failed" });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`KamiFlow Sync Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
