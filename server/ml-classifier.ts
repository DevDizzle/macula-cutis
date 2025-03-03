import { PredictionServiceClient } from "@google-cloud/aiplatform";
import { createCanvas } from "canvas";
import * as fs from 'fs';
import * as path from 'path';

// Hardcoded endpoint path as provided
const ENDPOINT_PATH = "projects/skin-lesion-443301/locations/us-central1/endpoints/903117960334278656";

// Debug logging for credentials
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
console.log("Using Google credentials from:", credentialsPath);

// Get absolute path and verify file exists
const absolutePath = path.resolve(process.cwd(), credentialsPath || '');
console.log("Absolute credentials path:", absolutePath);

if (!credentialsPath || !fs.existsSync(absolutePath)) {
  throw new Error(`Google Cloud credentials file not found at: ${absolutePath}`);
}

try {
  // Verify we can read the credentials file
  const credentialsContent = fs.readFileSync(absolutePath, 'utf8');
  const credentials = JSON.parse(credentialsContent);
  console.log("Successfully loaded credentials for service account:", credentials.client_email);
} catch (error) {
  console.error("Error loading credentials:", error);
  throw new Error("Failed to load Google Cloud credentials");
}

// Initialize Google Cloud AI Prediction Client
const predictionClient = new PredictionServiceClient({
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  keyFilename: absolutePath
});

/**
 * Classify an uploaded image using Vertex AI AutoML
 * @param {string} imageData - Base64 encoded image data
 * @returns {Promise<{ label: string; confidence: number }>}
 */
export async function classifyImage(imageData: string): Promise<{ label: string; confidence: number }> {
  try {
    console.log("\n=== Starting Image Classification ===");
    console.log("Using endpoint:", ENDPOINT_PATH);

    // Remove any Base64 prefix if present and ensure proper formatting
    const base64Image = imageData.split(",")[1] || imageData.replace(/^data:image\/\w+;base64,/, "");
    console.log("Base64 Image length:", base64Image.length);
    console.log("First 50 chars of base64:", base64Image.substring(0, 50));

    // Build request according to the latest Vertex AI format
    const request = {
      name: ENDPOINT_PATH,
      instances: [
        {
          image: {
            bytesBase64Encoded: base64Image
          }
        }
      ],
      parameters: {
        confidenceThreshold: 0.5,
        maxPredictions: 1
      }
    };

    // Log the complete request object (masking the base64 content)
    console.log("\nRequest being sent to Vertex AI:");
    console.log(JSON.stringify({
      ...request,
      instances: [{ 
        image: { bytesBase64Encoded: `[Base64 string of length ${base64Image.length}]` }
      }]
    }, null, 2));

    // Call Vertex AI for prediction
    console.log("\nMaking prediction request...");
    const [response] = await predictionClient.predict(request);
    console.log("\nRaw response:", JSON.stringify(response, null, 2));

    if (!response.predictions || response.predictions.length === 0) {
      throw new Error("No predictions returned from the model");
    }

    const prediction = response.predictions[0];
    console.log("\nParsed prediction:", prediction);

    return {
      label: prediction.displayNames?.[0] || "unknown",
      confidence: prediction.confidences?.[0] || 0
    };
  } catch (error: any) {
    console.error("\n=== Error in classifyImage ===");
    console.error("Error object:", error);
    console.error("Error details:", {
      code: error.code,
      details: error.details,
      metadata: error.metadata?.internalRepr ? Object.fromEntries(error.metadata.internalRepr) : error.metadata,
      status: error.status,
      reason: error.reason,
      domain: error.domain,
      errorInfoMetadata: error.errorInfoMetadata
    });
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