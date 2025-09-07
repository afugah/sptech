#!/bin/bash

# Storyblok Webhook Testing Script
# Usage: ./scripts/test-storyblok-webhook.sh [environment]
# Example: ./scripts/test-storyblok-webhook.sh local
#          ./scripts/test-storyblok-webhook.sh production

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENV=${1:-local}
# Get webhook secret from environment variable - NEVER hardcode secrets!
WEBHOOK_SECRET=${STORYBLOK_WEBHOOK_SECRET:-""}

if [ -z "$WEBHOOK_SECRET" ]; then
  echo -e "${RED}Error: STORYBLOK_WEBHOOK_SECRET environment variable is not set.${NC}"
  echo "Please set it in your .env.local file or export it:"
  echo "  export STORYBLOK_WEBHOOK_SECRET='your-secret-here'"
  exit 1
fi

# Set the webhook URL based on environment
if [ "$ENV" = "local" ]; then
    WEBHOOK_URL="https://localhost:3100/api/storyblok-webhook"
    echo -e "${YELLOW}Testing local webhook at: $WEBHOOK_URL${NC}"
elif [ "$ENV" = "production" ]; then
    WEBHOOK_URL="${NEXT_PUBLIC_BASE_URL}/api/storyblok-webhook"
    echo -e "${YELLOW}Testing production webhook at: $WEBHOOK_URL${NC}"
else
    echo -e "${RED}Unknown environment: $ENV${NC}"
    echo "Usage: $0 [local|production]"
    exit 1
fi

echo -e "\n${GREEN}=== Testing Storyblok Webhook ===${NC}"
echo "Environment: $ENV"
echo "Secret: ${WEBHOOK_SECRET:0:10}..."

# Test 1: Home page publish (new format with i18n)
echo -e "\n${YELLOW}Test 1: Publishing home page (new i18n format)${NC}"
PAYLOAD='{"action":"published","story_id":123456,"full_slug":"home","full_slug__i18n__sv":"home","full_slug__i18n__en":"home","full_slug__i18n__fi":"koti","full_slug__i18n__no":"hjem","space_id":789}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha1 -hmac "$WEBHOOK_SECRET" | cut -d' ' -f2)

RESPONSE=$(curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "webhook-signature: $SIGNATURE" \
  -d "$PAYLOAD" \
  --insecure \
  -w "\nHTTP_STATUS_CODE: %{http_code}" \
  -s)

# Extract status code
STATUS_CODE=$(echo "$RESPONSE" | grep "HTTP_STATUS_CODE:" | sed 's/.*HTTP_STATUS_CODE: //')
# Extract JSON response (everything before the status code)
JSON_RESPONSE=$(echo "$RESPONSE" | sed '/HTTP_STATUS_CODE:/d')

# Display results
echo "HTTP Status: $STATUS_CODE"
if [ ! -z "$JSON_RESPONSE" ]; then
  echo "$JSON_RESPONSE" | jq '.' 2>/dev/null || echo "$JSON_RESPONSE"
fi

# Test 2: Regular page publish (old format)
echo -e "\n${YELLOW}Test 2: Publishing regular page (old format)${NC}"
PAYLOAD='{"action":"published","story_id":234567,"slug":"about-us","space_id":789}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha1 -hmac "$WEBHOOK_SECRET" | cut -d' ' -f2)

RESPONSE=$(curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "webhook-signature: $SIGNATURE" \
  -d "$PAYLOAD" \
  --insecure \
  -w "\nHTTP_STATUS_CODE: %{http_code}" \
  -s)

# Extract status code
STATUS_CODE=$(echo "$RESPONSE" | grep "HTTP_STATUS_CODE:" | sed 's/.*HTTP_STATUS_CODE: //')
# Extract JSON response (everything before the status code)
JSON_RESPONSE=$(echo "$RESPONSE" | sed '/HTTP_STATUS_CODE:/d')

# Display results
echo "HTTP Status: $STATUS_CODE"
if [ ! -z "$JSON_RESPONSE" ]; then
  echo "$JSON_RESPONSE" | jq '.' 2>/dev/null || echo "$JSON_RESPONSE"
fi

# Test 3: Config change (should invalidate entire site)
echo -e "\n${YELLOW}Test 3: Publishing config (should invalidate all cache)${NC}"
PAYLOAD='{"action":"published","story_id":345678,"full_slug":"config","space_id":789}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha1 -hmac "$WEBHOOK_SECRET" | cut -d' ' -f2)

RESPONSE=$(curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "webhook-signature: $SIGNATURE" \
  -d "$PAYLOAD" \
  --insecure \
  -w "\nHTTP_STATUS_CODE: %{http_code}" \
  -s)

# Extract status code
STATUS_CODE=$(echo "$RESPONSE" | grep "HTTP_STATUS_CODE:" | sed 's/.*HTTP_STATUS_CODE: //')
# Extract JSON response (everything before the status code)
JSON_RESPONSE=$(echo "$RESPONSE" | sed '/HTTP_STATUS_CODE:/d')

# Display results
echo "HTTP Status: $STATUS_CODE"
if [ ! -z "$JSON_RESPONSE" ]; then
  echo "$JSON_RESPONSE" | jq '.' 2>/dev/null || echo "$JSON_RESPONSE"
fi

# Test 4: Content page with i18n slugs
echo -e "\n${YELLOW}Test 4: Publishing content page with i18n slugs${NC}"
PAYLOAD='{"action":"published","story_id":456789,"full_slug":"content/size-guide/rings","full_slug__i18n__sv":"content/storleksguide/ringar","full_slug__i18n__en":"content/size-guide/rings","full_slug__i18n__fi":"content/kokotaulukko/sormukset","space_id":789}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha1 -hmac "$WEBHOOK_SECRET" | cut -d' ' -f2)

RESPONSE=$(curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "webhook-signature: $SIGNATURE" \
  -d "$PAYLOAD" \
  --insecure \
  -w "\nHTTP_STATUS_CODE: %{http_code}" \
  -s)

# Extract status code
STATUS_CODE=$(echo "$RESPONSE" | grep "HTTP_STATUS_CODE:" | sed 's/.*HTTP_STATUS_CODE: //')
# Extract JSON response (everything before the status code)
JSON_RESPONSE=$(echo "$RESPONSE" | sed '/HTTP_STATUS_CODE:/d')

# Display results
echo "HTTP Status: $STATUS_CODE"
if [ ! -z "$JSON_RESPONSE" ]; then
  echo "$JSON_RESPONSE" | jq '.' 2>/dev/null || echo "$JSON_RESPONSE"
fi

# Test 5: Invalid signature (should return 401)
echo -e "\n${YELLOW}Test 5: Invalid signature (should fail with 401)${NC}"
PAYLOAD='{"action":"published","story_id":567890,"slug":"test-invalid","space_id":789}'
INVALID_SIGNATURE="invalid-signature-12345"

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "webhook-signature: $INVALID_SIGNATURE" \
  -d "$PAYLOAD" \
  --insecure \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

# Test 6: Unpublish action
echo -e "\n${YELLOW}Test 6: Unpublishing a page${NC}"
PAYLOAD='{"action":"unpublished","story_id":678901,"full_slug":"products/ring-123","full_slug__i18n__sv":"produkter/ring-123","full_slug__i18n__en":"products/ring-123","space_id":789}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha1 -hmac "$WEBHOOK_SECRET" | cut -d' ' -f2)

RESPONSE=$(curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "webhook-signature: $SIGNATURE" \
  -d "$PAYLOAD" \
  --insecure \
  -w "\nHTTP_STATUS_CODE: %{http_code}" \
  -s)

# Extract status code
STATUS_CODE=$(echo "$RESPONSE" | grep "HTTP_STATUS_CODE:" | sed 's/.*HTTP_STATUS_CODE: //')
# Extract JSON response (everything before the status code)
JSON_RESPONSE=$(echo "$RESPONSE" | sed '/HTTP_STATUS_CODE:/d')

# Display results
echo "HTTP Status: $STATUS_CODE"
if [ ! -z "$JSON_RESPONSE" ]; then
  echo "$JSON_RESPONSE" | jq '.' 2>/dev/null || echo "$JSON_RESPONSE"
fi

echo -e "\n${GREEN}=== Testing Complete ===${NC}"