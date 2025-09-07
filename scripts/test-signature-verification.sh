#!/bin/bash

# Test Storyblok Webhook Signature Verification
# This script tests that invalid signatures are properly rejected

echo "Testing Webhook Signature Verification"
echo "======================================="
echo ""

# Configuration
WEBHOOK_URL="https://localhost:3100/api/storyblok-webhook"
# Get webhook secret from environment variable - NEVER hardcode secrets!
WEBHOOK_SECRET=${STORYBLOK_WEBHOOK_SECRET:-""}

if [ -z "$WEBHOOK_SECRET" ]; then
  echo "Error: STORYBLOK_WEBHOOK_SECRET environment variable is not set."
  echo "Please set it in your .env.local file or export it:"
  echo "  export STORYBLOK_WEBHOOK_SECRET='your-secret-here'"
  exit 1
fi

# Test payload
PAYLOAD='{"action":"published","story_id":999,"slug":"security-test","space_id":789}'

echo "Test 1: Valid Signature (should succeed)"
echo "-----------------------------------------"
# Generate valid signature
VALID_SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha1 -hmac "$WEBHOOK_SECRET" | cut -d' ' -f2)
echo "Signature: ${VALID_SIGNATURE:0:20}..."

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "webhook-signature: $VALID_SIGNATURE" \
  -d "$PAYLOAD" \
  --insecure \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "Test 2: Invalid Signature (should fail with 401)"
echo "-------------------------------------------------"
INVALID_SIGNATURE="invalid-signature-12345678901234567890"
echo "Signature: ${INVALID_SIGNATURE:0:20}..."

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "webhook-signature: $INVALID_SIGNATURE" \
  -d "$PAYLOAD" \
  --insecure \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "Test 3: Missing Signature (should fail with 401)"
echo "-------------------------------------------------"
echo "Signature: (none)"

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  --insecure \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "======================================="
echo "Note: If all tests return success (200), check that"
echo "STORYBLOK_SKIP_SIGNATURE_VERIFICATION is not set to true"
echo "in production environments!"