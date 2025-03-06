import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { join } from "path";
import killPort from 'kill-port';

// Validate Google Cloud credentials
if (!process.env.GOOGLE_CREDENTIALS) {
  console.error("ERROR: GOOGLE_CREDENTIALS environment variable is not set");
  console.error("Please set the GOOGLE_CREDENTIALS environment variable with your Google Cloud service account credentials");
  process.exit(1);
}

try {
  // Validate that the credentials are valid JSON
  JSON.parse(process.env.GOOGLE_CREDENTIALS);
  console.log("✅ Google Cloud credentials validated successfully");
} catch (error) {
  console.error("ERROR: Invalid GOOGLE_CREDENTIALS format. Must be valid JSON");
  console.error(error);
  process.exit(1);
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

  const port = process.env.PORT || 5000;

  try {
    // First, attempt to kill any process that might be using our port
    log(`Checking for processes using port ${port}...`);
    await killPort(Number(port));
    log(`Successfully cleared port ${port}`);

    // Now start the server
    server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      log(`🚀 Server running on port ${port}`);
    }).on('error', (error: any) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});