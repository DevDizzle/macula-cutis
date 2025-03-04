import { PredictionServiceClient } from "@google-cloud/aiplatform";
import * as fs from 'fs';
import * as path from 'path';

// Google Cloud Project Details
const PROJECT_ID = "skin-lesion-443301";
const LOCATION = "us-central1";
const ENDPOINT_ID = "903117960334278656";

(async () => {
  try {
    // Initialize the client with credentials from environment variable
    const predictionClient = new PredictionServiceClient({
      projectId: PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    // Read and prepare the image data
    const base64FilePath = path.resolve(process.cwd(), 'attached_assets/base64.txt');
    const base64Data = fs.readFileSync(base64FilePath, 'utf8').trim();
    const base64Image = base64Data.split(",")[1] || base64Data;

    // Construct the endpoint path
    const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}`;
    console.log("\nEndpoint path:", endpoint);
    console.log("API Endpoint:", `${LOCATION}-aiplatform.googleapis.com`);

    // Create request using the REST API format
    const request = {
      name: endpoint,
      instances: [
        {
          content: base64Image
        }
      ],
      parameters: {
        confidenceThreshold: 0.5,
        maxPredictions: 5
      }
    };

    console.log("\nRequest structure:", JSON.stringify({
      ...request,
      instances: [{ content: "[BASE64_CONTENT_TRUNCATED]" }]
    }, null, 2));

    // Make the prediction request
    console.log("\nMaking prediction request...");
    const [response] = await predictionClient.predict(request);
    console.log("\nResponse:", JSON.stringify(response, null, 2));

  } catch (error) {
    if (error instanceof Error) {
      console.error("Test failed:", error.message);
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    } else {
      console.error("Unknown error occurred:", error);
    }
  }
})();