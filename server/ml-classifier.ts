import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';
import { spawn } from 'child_process';
import * as path from 'path';

// Google Cloud Project Details
const PROJECT_ID = "skin-lesion-443301";
const LOCATION = "us-central1";
const ENDPOINT_ID = "903117960334278656";

/**
 * Classify an uploaded image using Vertex AI AutoML
 * @param {string} imageData - Base64 encoded image data (with or without data URL prefix)
 * @returns {Promise<{ label: string; confidence: number }>}
 */
export async function classifyImage(imageData: string): Promise<{ label: string; confidence: number }> {
  try {
    console.log("Starting image classification...");

    // Remove the data URL prefix if present
    const base64Image = imageData.startsWith('data:image/')
      ? imageData.split(",")[1]
      : imageData;

    // Validate base64 string
    if (!base64Image || base64Image.trim().length === 0) {
      throw new Error('Invalid base64 image data');
    }
    console.log("Base64 image length:", base64Image.length);

    if (!process.env.GOOGLE_CREDENTIALS) {
      throw new Error('Google Cloud credentials not found in environment variables');
    }

    // Initialize auth client with the service account credentials from environment variable
    const auth = new GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    // Get access token
    const accessToken = await auth.getAccessToken();
    console.log("Got access token");

    // Construct endpoint URL
    const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}`;
    const apiUrl = `https://${LOCATION}-aiplatform.googleapis.com/v1/${endpoint}:predict`;

    console.log("Using API URL:", apiUrl);

    // Make prediction request
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
