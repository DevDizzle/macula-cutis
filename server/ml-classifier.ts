import { PredictionServiceClient } from "@google-cloud/aiplatform";
import { createCanvas } from "canvas";

// Google Cloud Project Details
const PROJECT_ID = "skin-lesion-443301";
const LOCATION = "us-central1";
const ENDPOINT_ID = "903117960334278656";

// Initialize Google Cloud AI Prediction Client with explicit project
const predictionClient = new PredictionServiceClient({
  projectId: PROJECT_ID,
  apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`
});

// Construct the full endpoint path for predictions
const endpointPath = `projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}`;

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

    // Format the request according to Vertex AI Image Classification requirements
    const instance = {
      structValue: {
        fields: {
          image: {
            stringValue: base64Image
          }
        }
      }
    };

    const request = {
      name: endpointPath,
      instances: [instance]
    };

    console.log("Making prediction request to Vertex AI...");
    console.log("Request format:", JSON.stringify(request, null, 2));

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