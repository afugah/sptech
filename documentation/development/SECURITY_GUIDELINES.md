# Security & Code Quality Guidelines

## 🔒 Golden Rules

1. **NEVER hardcode secrets in code files**
2. **NEVER commit .env.local or any file with real credentials**
3. **ALWAYS use environment variables for sensitive data**
4. **ALWAYS use placeholder values in examples and documentation**
5. **ALWAYS run `yarn lint` before committing code**
6. **ALWAYS fix all ESLint errors and warnings before committing**

## ✅ Automated Protection

This project has multiple layers of protection against committing bad code:

### 1. Pre-Commit Hook
- **Location**: `.husky/pre-commit`
- **Functions**: 
  - Runs ESLint to check for code quality issues
  - Scans staged files for hardcoded secrets
- **Actions**: 
  - Blocks commit if lint errors or warnings are found
  - Blocks commit if secrets are detected

### 2. Secret Detection Script
- **Location**: `scripts/check-secrets.sh`
- **Usage**: Run manually with `./scripts/check-secrets.sh`
- **Detects**: 
  - Hardcoded API keys
  - Passwords and tokens
  - Webhook secrets
  - AWS credentials
  - Service-specific patterns (Stripe, etc.)

### 3. Gitleaks Configuration
- **Location**: `.gitleaks.toml`
- **Usage**: Can be integrated with CI/CD
- **Purpose**: Advanced secret scanning with custom rules

## 🚨 What Gets Blocked

The security checks will prevent commits containing:

- Literal secret values (e.g., `"e4ccfe7f807b6616b393ad0008a4a93acf22f8b3da1aa4bc7a842d77f5f2cb66"`)
- API key patterns (e.g., `api_key: "sk_live_..."]`)
- Password assignments (e.g., `password = "actualPassword123"`)
- Bearer tokens
- AWS access keys
- Any pattern matching common secret formats

## ✅ Correct Usage Examples

### ❌ WRONG - Hardcoded Secret
```javascript
// NEVER DO THIS
const WEBHOOK_SECRET = "e4ccfe7f807b6616b393ad0008a4a93acf22f8b3da1aa4bc7a842d77f5f2cb66";
```

### ✅ CORRECT - Environment Variable
```javascript
// ALWAYS DO THIS
const WEBHOOK_SECRET = process.env.STORYBLOK_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  throw new Error('STORYBLOK_WEBHOOK_SECRET environment variable is required');
}
```

### ❌ WRONG - Secret in Test File
```bash
# NEVER DO THIS
WEBHOOK_SECRET="e4ccfe7f807b6616b393ad0008a4a93acf22f8b3da1aa4bc7a842d77f5f2cb66"
```

### ✅ CORRECT - Environment Variable in Test
```bash
# ALWAYS DO THIS
WEBHOOK_SECRET=${STORYBLOK_WEBHOOK_SECRET:-""}

if [ -z "$WEBHOOK_SECRET" ]; then
  echo "Error: STORYBLOK_WEBHOOK_SECRET environment variable is not set."
  exit 1
fi
```

## 📝 For Examples and Documentation

When writing examples or documentation:

### Use Placeholders
```env
# .env.example
STORYBLOK_WEBHOOK_SECRET=your-secret-here
API_KEY=XXXXXXX
```

### Use Clear Instructions
```markdown
1. Generate a secure secret:
   \`\`\`bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   \`\`\`

2. Add to your .env.local:
   \`\`\`
   WEBHOOK_SECRET=<your-generated-secret>
   \`\`\`
```

## 🛠️ Manual Checks Before Committing

Always run these commands before committing:

### 1. Check for Lint Errors
```bash
yarn lint
```

If there are errors, fix them or run:
```bash
yarn lint:fix
```

### 2. Check for Secrets
```bash
./scripts/check-secrets.sh
```

### 3. One Command to Check Everything
The pre-commit hook will automatically run both checks, but you can test manually:
```bash
yarn lint && ./scripts/check-secrets.sh
```

## 🚀 CI/CD Integration

For production deployments:

1. **Use Secret Management Services**
   - Vercel Environment Variables
   - GitHub Secrets
   - AWS Secrets Manager
   - HashiCorp Vault

2. **Never Log Secrets**
   ```javascript
   // WRONG
   console.log('Webhook secret:', webhookSecret);
   
   // CORRECT
   console.log('Webhook secret configured:', !!webhookSecret);
   ```

3. **Rotate Secrets Regularly**
   - Set up a rotation schedule
   - Update in all environments
   - Document rotation process

## 🔍 If You Accidentally Commit a Secret

1. **Immediately rotate the secret** - Generate a new one
2. **Remove from Git history**:
   ```bash
   # Use git filter-branch or BFG Repo-Cleaner
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/file" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push** (coordinate with team)
4. **Update all environments** with new secret
5. **Audit for any unauthorized access**

## 📋 Checklist for New Secrets

When adding a new secret to the project:

- [ ] Add to `.env.example` with placeholder value
- [ ] Document in README or setup guide
- [ ] Add pattern to `scripts/check-secrets.sh` if needed
- [ ] Update `.gitleaks.toml` with custom rule if needed
- [ ] Test that pre-commit hook catches it
- [ ] Add to deployment documentation
- [ ] Ensure it's in production secret manager

## 🤝 Team Responsibilities

- **Developers**: Never hardcode secrets, always use env variables
- **Code Reviewers**: Check for hardcoded secrets in PRs
- **DevOps**: Manage production secrets securely
- **Team Leads**: Ensure security training and awareness

## 📚 Additional Resources

- [OWASP Secret Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12 Factor App - Config](https://12factor.net/config)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)