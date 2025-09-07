#!/bin/bash

# Simple Storyblok Webhook Test
# This script tests the webhook endpoint with a simple payload

echo "Simple Storyblok Webhook Test"
echo "=============================="
echo ""

# Configuration
WEBHOOK_URL="https://localhost:3100/api/storyblok-webhook"
# Get webhook secret from environment variable
WEBHOOK_SECRET=${STORYBLOK_WEBHOOK_SECRET:-""}

if [ -z "$WEBHOOK_SECRET" ]; then
  echo "Error: STORYBLOK_WEBHOOK_SECRET environment variable is not set."
  echo "Please set it in your .env.local file or export it:"
  echo "  export STORYBLOK_WEBHOOK_SECRET='your-secret-here'"
  exit 1
fi

# Simple test payload
PAYLOAD='{"action":"published","story_id":123,"slug":"test-page","space_id":789}'

# Generate signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha1 -hmac "$WEBHOOK_SECRET" | cut -d' ' -f2)

echo "URL: $WEBHOOK_URL"
echo "Payload: $PAYLOAD"
echo "Signature: ${SIGNATURE:0:20}..."
echo ""
echo "Sending webhook request..."
echo ""

# Send request
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "webhook-signature: $SIGNATURE" \
  -d "$PAYLOAD" \
  --insecure \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "Test complete!"