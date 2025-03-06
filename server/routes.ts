import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAnalysisSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      const parsed = insertAnalysisSchema.safeParse(req.body);
      if (!parsed.success) {
        console.error("Validation error:", parsed.error);
        return res.status(400).json(parsed.error);
      }

      // Return a friendly message instead of performing analysis
      res.json({
        status: "contact_required",
        message: "Thank you for your interest in MaculaCutis! The AI analysis service is currently in a limited preview. To learn more about accessing this service or to schedule a demo, please contact us at support@maculacutis.com",
        imageData: req.body.imageData, // Return the original image
      });
    } catch (error) {
      console.error("Error in /api/analyze:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ 
        message: "Analysis request failed",
        error: errorMessage 
      });
    }
  });

  app.get("/api/analyses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const analyses = await storage.getAnalysesByUserId(req.user!.id);
    res.json(analyses);
  });

  const httpServer = createServer(app);
  return httpServer;
}