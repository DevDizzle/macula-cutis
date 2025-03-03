import { PredictionServiceClient } from "@google-cloud/aiplatform";
import { createCanvas } from "canvas";
import * as fs from 'fs';
import * as path from 'path';

// Google Cloud Project Details
const PROJECT_ID = "skin-lesion-443301";
const LOCATION = "us-central1";
const ENDPOINT_ID = "903117960334278656";

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
  projectId: PROJECT_ID,
  apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`,
  keyFilename: absolutePath
});

/**
 * Classify an uploaded image using Vertex AI AutoML
 * @param {string} imageData - Base64 encoded image data
 * @returns {Promise<{ label: string, confidence: number }>}
 */
export async function classifyImage(imageData: string): Promise<{ label: string; confidence: number }> {
  try {
    console.log("Starting image classification...");

    // Remove any Base64 prefix if present and decode
    const base64Image = imageData.split(",")[1] || imageData.replace(/^data:image\/\w+;base64,/, "");

    // Construct the full endpoint path
    const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}`;

    // Format request according to Vertex AI specifications:
    // - Use the 'endpoint' field (not 'name')
    // - Provide each instance with just the base64-encoded image content.
    // - Use parameters expected by the model (confidenceThreshold and maxPredictions)
    const request = {
      endpoint: endpoint,
      instances: [
        {
          content: base64Image
        }
      ],
      parameters: {
        confidenceThreshold: 0.5,
        maxPredictions: 1
      }
    };

    console.log("Making prediction request to Vertex AI...");
    console.log("Endpoint:", endpoint);
    console.log("Request structure:", JSON.stringify({
      ...request,
      // Avoid printing the full base64 string
      instances: [{ content: 'BASE64_STRING_TRUNCATED' }]
    }, null, 2));

    // Call Vertex AI for prediction
    const [response] = await predictionClient.predict(request);
    console.log("Raw response:", JSON.stringify(response, null, 2));

    if (!response.predictions || response.predictions.length === 0) {
      throw new Error("No predictions returned from the model");
    }

    const prediction = response.predictions[0];
    console.log("Parsed prediction:", prediction);

    // Extract prediction results
    return {
      label: prediction.displayNames?.[0] || "unknown",
      confidence: prediction.confidences?.[0] || 0
    };
  } catch (error: any) {
    console.error("Error in classifyImage:", error);
    console.error("Error details:", {
      code: error.code,
      details: error.details,
      metadata: error.metadata,
      status: error.status
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