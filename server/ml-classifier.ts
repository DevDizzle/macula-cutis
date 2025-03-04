import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';
import { createCanvas } from "canvas";

// Google Cloud Project Details
const PROJECT_ID = "skin-lesion-443301";
const LOCATION = "us-central1";
const ENDPOINT_ID = "903117960334278656";

/**
 * Classify an uploaded image using Vertex AI AutoML
 * @param {string} imageData - Base64 encoded image data (with or without data URL prefix)
 * @returns {Promise<{ label: string, confidence: number }>}
 */
export async function classifyImage(imageData: string): Promise<{ label: string; confidence: number }> {
  try {
    console.log("Starting image classification...");

    // Remove the data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Image = imageData.startsWith('data:image/')
      ? imageData.split(",")[1]
      : imageData;

    // Validate base64 string
    if (!base64Image || base64Image.trim().length === 0) {
      throw new Error('Invalid base64 image data');
    }
    console.log("Base64 image length:", base64Image.length);

    // Initialize auth client with the service account credentials
    const auth = new GoogleAuth({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    // Get access token
    const accessToken = await auth.getAccessToken();
    console.log("Got access token");

    // Construct endpoint URL exactly as in test-endpoint.sh
    const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}`;
    const apiUrl = `https://${LOCATION}-aiplatform.googleapis.com/v1/${endpoint}:predict`;

    console.log("Using API URL:", apiUrl);

    // Make request using the exact format from test-endpoint.sh
    const response = await axios.post(
      apiUrl,
      {
        instances: [{ content: base64Image }],
        parameters: {
          confidenceThreshold: 0.5,
          maxPredictions: 5
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Raw response:", JSON.stringify(response.data, null, 2));

    if (!response.data.predictions || response.data.predictions.length === 0) {
      throw new Error("No predictions returned from the model");
    }

    const prediction = response.data.predictions[0];
    if (!prediction.displayNames?.[0] || !prediction.confidences?.[0]) {
      throw new Error("Invalid prediction format returned from the model");
    }

    return {
      label: prediction.displayNames[0],
      confidence: prediction.confidences[0]
    };
  } catch (error: any) {
    console.error("Error in classifyImage:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    throw new Error(`Failed to classify image: ${error instanceof Error ? error.message : String(error)}`);
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