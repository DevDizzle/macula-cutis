import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAnalysisSchema } from "@shared/schema";
import { classifyImage, generateHeatmap } from "./ml-classifier";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/analyze", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const parsed = insertAnalysisSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const { imageData } = parsed.data;
    
    try {
      const prediction = await classifyImage(imageData);
      const heatmap = await generateHeatmap(imageData);
      
      const analysis = await storage.createAnalysis({
        userId: req.user!.id,
        imageData,
        prediction: prediction.label,
        confidence: Math.round(prediction.confidence * 100),
        heatmapData: heatmap,
      });

      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Analysis failed" });
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
