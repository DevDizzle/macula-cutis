import { PredictionServiceClient } from "@google-cloud/aiplatform";
import * as fs from 'fs';
import * as path from 'path';

// Google Cloud Project Details
const PROJECT_NUMBER = "144316181020";
const LOCATION = "us-central1";
const ENDPOINT_ID = "903117960334278656";

async function testEndpoint() {
  try {
    // Initialize the client
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    console.log("Using credentials from:", credentialsPath);

    // Read and verify the credentials
    const credentialsContent = fs.readFileSync(path.resolve(process.cwd(), credentialsPath || ''), 'utf8');
    const credentials = JSON.parse(credentialsContent);
    console.log("\nCredentials Info:");
    console.log("- Project ID:", credentials.project_id);
    console.log("- Client Email:", credentials.client_email);
    console.log("- Token URI:", credentials.token_uri);

    const predictionClient = new PredictionServiceClient({
      apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`
    });

    // Read test image
    const base64FilePath = path.resolve(process.cwd(), 'attached_assets/base64.txt');
    const base64Data = fs.readFileSync(base64FilePath, 'utf8').trim();
    const base64Image = base64Data.split(",")[1] || base64Data;

    // Construct endpoint path
    const name = `projects/${PROJECT_NUMBER}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}`;
    console.log("\nEndpoint path:", name);

    // Create request with mimeType
    const request = {
      name,
      instances: [{
        content: base64Image,
        mimeType: "image/jpeg"
      }]
    };

    console.log("\nMaking test prediction request with mimeType...");
    const [response] = await predictionClient.predict(request);
    console.log("\nResponse:", JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("\nTest failed:", error);
    console.error("Error details:", {
      code: error.code,
      details: error.details,
      reason: error.reason,
      domain: error.domain,
      metadata: error.metadata
    });
  }
}

testEndpoint();