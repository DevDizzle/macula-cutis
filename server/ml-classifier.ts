import { PredictionServiceClient } from "@google-cloud/aiplatform";
import { createCanvas } from "canvas";

// Google Cloud Project Details
const PROJECT_ID = "skin-lesion-443301";
const LOCATION = "us-central1";
const ENDPOINT_ID = "903117960334278656";  // ✅ Correct Numeric ID

// Initialize Google Cloud AI Prediction Client
const predictionClient = new PredictionServiceClient({
  projectId: PROJECT_ID,
});

// Corrected `endpointPath`
const endpointPath = `projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}`;

/**
 * Classify an uploaded image using Vertex AI AutoML
 * @param {string} imageData - Base64 encoded image data
 * @returns {Promise<{ label: string, confidence: number }>}
 */
export async function classifyImage(imageData: string): Promise<{ label: string; confidence: number }> {
  try {
    console.log("Starting image classification...");

    // Remove any unnecessary Base64 prefixes
    const base64Image = imageData.split(",")[1] || imageData.replace(/^data:image\/\w+;base64,/, "");

    console.log("Making prediction request to Vertex AI...");
    const request = {
      name: endpointPath,  // ✅ Use "name" instead of "endpoint"
      instances: [{ content: base64Image }],
    };

    // Call Vertex AI for prediction
    const [response] = await predictionClient.predict(request);
    console.log("Received response:", JSON.stringify(response, null, 2));

    if (!response.predictions || response.predictions.length === 0) {
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

/**
 * Generate a placeholder heatmap (for SHAP/Grad-CAM)
 * @param {string} imageData - Base64 encoded image data
 * @returns {Promise<string>} - Heatmap overlay as a Base64 image
 */
export async function generateHeatmap(imageData: string): Promise<string> {
  const canvas = createCanvas(224, 224);
  const ctx = canvas.getContext("2d");

  // Draw red overlay for areas of interest (placeholder)
  ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
  ctx.fillRect(56, 56, 112, 112);

  return canvas.toDataURL();
}