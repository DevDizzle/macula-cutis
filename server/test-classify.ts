import { PredictionServiceClient } from "@google-cloud/aiplatform";
import * as fs from 'fs';
import * as path from 'path';

// Hardcode the exact endpoint string
const ENDPOINT = "projects/skin-lesion-443301/locations/us-central1/endpoints/903117960334278656";

(async () => {
  try {
    // Initialize the prediction client
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    console.log("Using credentials from:", credentialsPath);

    // Read and verify the credentials
    const credentialsContent = fs.readFileSync(path.resolve(process.cwd(), credentialsPath || ''), 'utf8');
    const credentials = JSON.parse(credentialsContent);
    console.log("\nCredentials Info:");
    console.log("- Project ID:", credentials.project_id);
    console.log("- Client Email:", credentials.client_email);

    const predictionClient = new PredictionServiceClient({
      apiEndpoint: 'us-central1-aiplatform.googleapis.com'
    });

    // Read test image data
    const base64FilePath = path.resolve(process.cwd(), 'attached_assets/base64.txt');
    const base64Data = fs.readFileSync(base64FilePath, 'utf8').trim();
    const base64Image = base64Data.split(",")[1] || base64Data;

    console.log("\nMaking prediction request with endpoint:", ENDPOINT);

    // Create request with all required fields for AutoML Vision
    const request = {
      endpoint: ENDPOINT,
      instances: [
        {
          content: base64Image,
          mimeType: "image/jpeg"
        }
      ],
      parameters: {
        confidenceThreshold: 0.5,
        maxPredictions: 1,
        feature_importance: true
      }
    };

    console.log("\nRequest structure:", JSON.stringify({
      ...request,
      instances: [{ content: "[BASE64_CONTENT_TRUNCATED]", mimeType: "image/jpeg" }],
      parameters: request.parameters
    }, null, 2));

    // Make the prediction request
    const [response] = await predictionClient.predict(request);
    console.log("\nResponse:", JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Test failed:", error);
    console.error("Error details:", {
      code: error.code,
      details: error.details,
      metadata: error.metadata,
      statusDetails: error.statusDetails,
      reason: error.reason,
      domain: error.domain
    });
  }
})();