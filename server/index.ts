import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { join } from "path";

// Use environment variables for Google credentials
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log("Using Google credentials from environment variable");
} else {
  console.warn("WARNING: No GOOGLE_APPLICATION_CREDENTIALS environment variable set");
  // In production, this will fail without credentials
}

const app = express();

// Increase request size limits to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 🔹 Use Replit-assigned PORT or fallback to 5000
  const port = process.env.PORT || 5000;

  server.listen({
    port,
    host: "0.0.0.0",  // Ensure it's exposed properly
    reusePort: true,
  }, () => {
    log(`🚀 Server running on port ${port}`);
  });
})().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});