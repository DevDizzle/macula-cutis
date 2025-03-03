import { PredictionServiceClient } from "@google-cloud/aiplatform";
import { createCanvas } from "canvas";
import * as fs from 'fs';
import * as path from 'path';

// Hardcoded endpoint path as provided
const ENDPOINT = "projects/skin-lesion-443301/locations/us-central1/endpoints/903117960334278656";

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
 * Utility: Extracts raw Base64 data from a Data URL if present.
 * If the string starts with "data:image/...", it returns the part after the comma.
 * Otherwise, returns the string unchanged.
 */
function extractBase64(imageData: string): string {
  if (imageData.startsWith("data:image/")) {
    const parts = imageData.split(",");
    return parts.length > 1 ? parts[1] : imageData;
  }
  return imageData;
}

/**
 * Classify an uploaded image using Vertex AI AutoML
 * @param {string} imageData - Base64 encoded image data (with or without data URI prefix)
 * @returns {Promise<{ label: string, confidence: number }>}
 */
export async function classifyImage(imageData: string): Promise<{ label: string; confidence: number }> {
  try {
    console.log("\n=== Starting Image Classification ===");
    console.log("Using endpoint:", ENDPOINT);

    // Extract raw Base64 string
    const rawBase64 = extractBase64(imageData);
    console.log("Raw Base64 length:", rawBase64.length);
    console.log("First 50 chars of raw Base64:", rawBase64.substring(0, 50));

    // Build the request object using the format matching the Deploy & Test tool.
    // Here, the image data is wrapped in an "image" object with "bytesBase64Encoded"
    const request = {
      name: ENDPOINT,
      instances: [
        {
          image: {
            bytesBase64Encoded: rawBase64
          }
        }
      ],
      parameters: {
        confidenceThreshold: 0.5
      }
    };

    // Log the request object (masking the Base64 content)
    console.log("\nRequest being sent to Vertex AI:");
    console.log(JSON.stringify({
      ...request,
      instances: [
        { image: { bytesBase64Encoded: `[Base64 string of length ${rawBase64.length}]` } }
      ]
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

    // Extract and return the prediction results
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
      metadata: error.metadata,
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