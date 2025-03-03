import { classifyImage } from "./ml-classifier";
import * as fs from 'fs';
import * as path from 'path';

(async () => {
  try {
    // Adjust the file path to point to the base64 data in attached_assets
    const base64FilePath = path.resolve(process.cwd(), 'attached_assets/base64.txt');

    // Read the Base64 string from the file and trim whitespace.
    const base64Data = fs.readFileSync(base64FilePath, 'utf8').trim();

    // Check if the data already includes the data URL prefix.
    let testDataUrl: string;
    if (base64Data.startsWith('data:image/')) {
      testDataUrl = base64Data;
    } else {
      // If not, prepend the expected prefix (adjust MIME type if needed).
      testDataUrl = `data:image/jpeg;base64,${base64Data}`;
    }

    // Log some details about the Base64 string (first/last 100 characters) to verify it's complete.
    console.log("Test data URL length:", testDataUrl.length);
    console.log("First 100 chars:", testDataUrl.slice(0, 100));
    console.log("Last 100 chars:", testDataUrl.slice(-100));

    // Call the classifyImage function with your known-good Base64 string.
    const result = await classifyImage(testDataUrl);
    console.log("Classification result:", result);
  } catch (err) {
    console.error("Error during classification test:", err);
  }
})();