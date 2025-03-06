import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAnalysisSchema } from "@shared/schema";
import { classifyImage } from "./ml-classifier";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      googleCredentials: process.env.GOOGLE_CREDENTIALS ? "available" : (process.env.GOOGLE_APPLICATION_CREDENTIALS ? "file-based" : "missing")
    });
  });
  
  app.post("/api/analyze", async (req, res) => {
    try {
      console.log("Starting analysis request...");
      const parsed = insertAnalysisSchema.safeParse(req.body);
      if (!parsed.success) {
        console.error("Validation error:", parsed.error);
        return res.status(400).json(parsed.error);
      }

      const { imageData } = parsed.data;
      console.log("Image data received, length:", imageData.length);

      const prediction = await classifyImage(imageData);
      console.log("Prediction received:", prediction);

      // Heatmap functionality temporarily disabled
      const heatmap = null;
      console.log("Heatmap generation skipped");

      // Store without user association for now
      const analysis = await storage.createAnalysis({
        imageData,
        prediction: prediction.label,
        confidence: prediction.confidence,
        heatmapData: heatmap,
      });

      console.log("Analysis saved:", analysis.id);
      res.json(analysis);
    } catch (error) {
      console.error("Error in /api/analyze:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ 
        message: "Analysis failed",
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