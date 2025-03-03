import * as fs from 'fs';
import * as path from 'path';

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
console.log("Credentials path:", credentialsPath);

if (!credentialsPath) {
  console.error("No credentials path set in environment");
  process.exit(1);
}

const absolutePath = path.resolve(process.cwd(), credentialsPath);
console.log("Absolute path:", absolutePath);

try {
  const credentialsContent = fs.readFileSync(absolutePath, 'utf8');
  const credentials = JSON.parse(credentialsContent);
  
  console.log("\nCredentials Details:");
  console.log("Project ID:", credentials.project_id);
  console.log("Service Account:", credentials.client_email);
  console.log("Type:", credentials.type);
  console.log("Token URI:", credentials.token_uri);
} catch (error) {
  console.error("Error reading credentials:", error);
}
