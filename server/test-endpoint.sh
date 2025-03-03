#!/bin/bash

# Use our exact endpoint
ENDPOINT="projects/skin-lesion-443301/locations/us-central1/endpoints/903117960334278656"

# Use our service account credentials file to get a token
GOOGLE_APPLICATION_CREDENTIALS="attached_assets/skin-lesion-443301-9fd70b8d7c77.json"
ACCESS_TOKEN=$(node -e "
const fs = require('fs');
const {GoogleAuth} = require('google-auth-library');
const credentials = JSON.parse(fs.readFileSync('${GOOGLE_APPLICATION_CREDENTIALS}'));
const auth = new GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});
auth.getAccessToken().then(token => console.log(token));
")

# Read the base64 image data from our test file
BASE64_DATA=$(cat attached_assets/base64.txt | tr -d '\n')

# Create the input JSON with the actual base64 data
echo "{
  \"instances\": [
    {
      \"content\": \"$BASE64_DATA\",
      \"mimeType\": \"image/jpeg\"
    }
  ],
  \"parameters\": {
    \"confidenceThreshold\": 0.5,
    \"maxPredictions\": 1
  }
}" > test-input.json

# Make the API request with our access token
curl \
  -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://us-central1-aiplatform.googleapis.com/v1/$ENDPOINT:predict" \
  -d "@test-input.json"