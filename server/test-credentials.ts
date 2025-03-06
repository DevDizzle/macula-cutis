import { PredictionServiceClient } from "@google-cloud/aiplatform";

async function testCredentials() {
  try {
    console.log("Testing Google Cloud credentials...");

    if (!process.env.GOOGLE_CREDENTIALS) {
      throw new Error("GOOGLE_CREDENTIALS environment variable is not set");
    }

    // Initialize the client with credentials from environment variable
    const client = new PredictionServiceClient({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      apiEndpoint: 'us-central1-aiplatform.googleapis.com'
    });
    console.log("✅ Successfully initialized PredictionServiceClient");

    // List available endpoints as a further test
    const parent = `projects/skin-lesion-443301/locations/us-central1`;
    console.log(`Attempting to list endpoints in ${parent}...`);

    try {
      const [endpoints] = await client.listEndpoints({ parent });
      console.log(`✅ Successfully listed ${endpoints.length} endpoints`);
      console.log("Your Google Cloud credentials are working correctly!");
    } catch (error) {
      console.log("⚠️ Could not list endpoints, but client initialization succeeded");
      console.log("This may be due to permissions or project configuration");
      console.log(error);
    }
  } catch (error) {
    console.error("❌ Failed to initialize PredictionServiceClient:");
    console.error(error);

    console.log("\nEnvironment variable status:");
    console.log("GOOGLE_CREDENTIALS:", process.env.GOOGLE_CREDENTIALS ? "Set ✅" : "Not set ❌");

    console.log("\nPlease ensure you've set up your credentials correctly in the Replit Secrets tool.");
  }
}

testCredentials();