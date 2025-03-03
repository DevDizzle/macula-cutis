#!/bin/bash

# Read the base64 image data from our test file
BASE64_DATA=$(cat attached_assets/base64.txt | tr -d '\n')

# Create the input JSON with the actual base64 data
echo "{
  \"instances\": [
    {
      \"content\": \"$BASE64_DATA\"
    }
  ]
}" > test-input.json

# Make the API request
curl \
  -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  "https://us-central1-aiplatform.googleapis.com/v1/projects/903117960334/locations/us-central1/endpoints/903117960334278656:predict" \
  -d "@test-input.json"
