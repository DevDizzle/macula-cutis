import { readFileSync } from "fs";
import { join } from "path";
import { PredictionServiceClient } from "@google-cloud/aiplatform";
import { createCanvas } from "canvas";

// Google Cloud Project Details
const PROJECT_ID = "skin-lesion-443301";
const LOCATION = "us-central1";
const ENDPOINT_ID = "skin_lesion_v1";

// Load credentials from the JSON file
const credentials = JSON.parse(
  readFileSync(
    join(process.cwd(), "attached_assets/skin-lesion-443301-9fd70b8d7c77.json"),
    "utf-8"
  )
);

// Initialize Vertex AI Prediction Client
const predictionClient = new PredictionServiceClient({
  credentials,
  projectId: PROJECT_ID,
});

// Construct the full endpoint path
const endpointPath = `projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}`;

export async function classifyImage(
  imageData: string
): Promise<{ label: string; confidence: number }> {
  try {
    console.log("Starting image classification...");

    // Remove the "data:image/..." prefix if present
    const base64Image = imageData.split(",")[1] || imageData;

    console.log("Making prediction request to Vertex AI...");
    const request = {
      endpoint: endpointPath,
      instances: [{ content: base64Image }],
    };

    // Call Vertex AI for prediction
    const [response] = await predictionClient.predict(request);
    console.log("Received response:", JSON.stringify(response, null, 2));

    if (!response.predictions || !response.predictions.length) {
      throw new Error("No predictions returned from the model");
    }

    const prediction = response.predictions[0];

    return {
      label: prediction.displayNames?.[0] || "unknown",
      confidence: prediction.confidenceScores?.[0] || 0,
    };
  } catch (error) {
    console.error("Error in classifyImage:", error);
    throw new Error(`Failed to classify image: ${error.message}`);
  }
}

export async function generateHeatmap(imageData: string): Promise<string> {
  const canvas = createCanvas(224, 224);
  const ctx = canvas.getContext("2d");

  // Draw red overlay for areas of interest (placeholder)
  ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
  ctx.fillRect(56, 56, 112, 112);

  return canvas.toDataURL();
}