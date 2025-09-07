#!/bin/bash

# Secret Detection Script
# This script checks for hardcoded secrets before commits

echo "🔍 Checking for hardcoded secrets..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Files to check
FILES_TO_CHECK=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts|tsx|jsx|sh|json|env|yml|yaml)$')

if [ -z "$FILES_TO_CHECK" ]; then
  echo -e "${GREEN}✓ No files to check${NC}"
  exit 0
fi

# Patterns to detect (add more as needed)
PATTERNS=(
  # Specific known secrets - using partial match to avoid self-detection
  # Check for the actual secret pattern but split to avoid matching self
  "e4ccfe7f807b6616b393ad0008a4a93a" # First part of known secret
  "cf22f8b3da1aa4bc7a842d77f5f2cb66"  # Second part of known secret
  
  # Generic patterns for API keys and secrets
  # Exclude common placeholders like 'your-secret-here'
  "(?i)(api[_\-\s]?key|apikey)[\s]*[:=][\s]*['\"](?!your[_\-])[a-zA-Z0-9\-_]{20,}['\"]"
  "(?i)(secret|password|token)[\s]*[:=][\s]*['\"](?!your[_\-])[^'\"]{16,}['\"]"
  "(?i)bearer[\s]+[a-zA-Z0-9\-_\.]{20,}"
  
  # AWS patterns
  "AKIA[0-9A-Z]{16}"
  "(?i)aws[_\-\s]?secret[_\-\s]?access[_\-\s]?key"
  
  # Other service patterns
  "sk_live_[a-zA-Z0-9]{24,}"  # Stripe
  "rk_live_[a-zA-Z0-9]{24,}"  # Stripe
)

FOUND_SECRETS=0

for FILE in $FILES_TO_CHECK; do
  # Skip .env.example, documentation, and the checker script itself
  if [[ "$FILE" == *.env.example ]] || [[ "$FILE" == *documentation/* ]] || [[ "$FILE" == *docs/* ]] || [[ "$FILE" == "scripts/check-secrets.sh" ]]; then
    continue
  fi
  
  for PATTERN in "${PATTERNS[@]}"; do
    if grep -qE "$PATTERN" "$FILE" 2>/dev/null; then
      echo -e "${RED}⚠️  Potential secret found in: $FILE${NC}"
      grep -nE "$PATTERN" "$FILE" | head -3
      FOUND_SECRETS=1
    fi
  done
done

if [ $FOUND_SECRETS -eq 1 ]; then
  echo ""
  echo -e "${RED}❌ Secrets detected! Please remove them before committing.${NC}"
  echo -e "${YELLOW}Tips:${NC}"
  echo "  • Use environment variables for secrets"
  echo "  • Add secrets to .env.local (never commit this file)"
  echo "  • Use process.env.YOUR_SECRET in code"
  echo "  • For examples, use placeholder values like 'your-secret-here'"
  exit 1
else
  echo -e "${GREEN}✓ No secrets detected${NC}"
  exit 0
fi